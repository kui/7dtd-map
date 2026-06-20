// deno-lint-ignore-file no-non-null-assertion
import type {
  BlockPrefabCounts,
  HighlightedPrefab,
  Prefab,
} from "../types/7dtdmap.ts";
import { PrefabFilter } from "../worker/lib/prefab-filter.ts";
import { expect } from "@std/expect";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";

// LabelHolder.fetchJson hits globalThis.fetch with URLs like
// `${baseUrl}/${language}/{prefabs|blocks|shapes}.json`. We stub it so
// PrefabFilter can run end-to-end without touching the network.
function stubFetch(map: Record<string, unknown>) {
  return stub(
    globalThis,
    "fetch",
    ((input: string | URL | Request): Promise<Response> => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;
      const key = Object.keys(map).find((k) => url.endsWith(k));
      if (!key) {
        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }
      return Promise.resolve(
        new Response(JSON.stringify(map[key]), {
          headers: { "content-type": "application/json" },
        }),
      );
    }) as typeof fetch,
  );
}

function build(
  blockCounts: BlockPrefabCounts = {},
): PrefabFilter {
  return new PrefabFilter(
    "/labels",
    ["en"],
    () => Promise.resolve(blockCounts),
  );
}

type Update = { prefabs: HighlightedPrefab[]; status: string };

const fetchStubs: { restore: () => void }[] = [];

describe("PrefabFilter", () => {
  beforeEach(() => {
    fetchStubs.push(
      stubFetch({
        "english/prefabs.json": { house_01: "House", trader_01: "Trader" },
        "english/blocks.json": { stone: "Stone", wood: "Wood" },
        "english/shapes.json": {},
      }),
    );
  });
  afterEach(() => {
    while (fetchStubs.length) fetchStubs.pop()?.restore();
  });

  const prefabs: Prefab[] = [
    { name: "aaa_test_01", x: 0, z: 0, difficulty: 0 },
    { name: "house_01", x: 100, z: 0, difficulty: 1 },
    { name: "trader_01", x: 0, z: 200, difficulty: 3 },
    { name: "skyscraper_01", x: 500, z: 500, difficulty: 5 },
  ];

  function capture(f: PrefabFilter): { current: Update | null } {
    const slot: { current: Update | null } = { current: null };
    f.addListener((m) => {
      slot.current = m.update;
    });
    return slot;
  }

  it("excludes prefabs that match preExcludes patterns", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = ["^aaa_"];
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.prefabs.map((p) => p.name)).not.toContain(
      "aaa_test_01",
    );
    expect(slot.current!.prefabs.length).toBe(3);
  });

  it("filters by difficulty range", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.difficulty = { start: 2, end: 4 };
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.prefabs.map((p) => p.name)).toEqual(["trader_01"]);
  });

  it("computes distance when markCoords is set", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.markCoords = { type: "game", x: 0, z: 0 };
    const slot = capture(f);
    await f.updateImmediately();
    const first = slot.current!.prefabs[0];
    expect(first.name).toBe("aaa_test_01");
    expect(
      slot.current!.prefabs.every((p) =>
        p.distance !== null && p.distance !== undefined
      ),
    ).toBe(true);
  });

  it("status reports 'All N prefabs' when filters are inactive", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.status).toBe(
      `All ${prefabs.length.toString()} prefabs`,
    );
  });

  it("reports invalid prefab name pattern without throwing", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.prefabFilterRegexp = "(unbalanced";
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.status).toBe("Invalid prefab name pattern");
    expect(slot.current!.prefabs).toEqual([]);
  });

  it("reports invalid block name pattern without throwing", async () => {
    const f = build({ stone: { house_01: 5 } });
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "[unbalanced";
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.status).toBe("Invalid block name pattern");
    expect(slot.current!.prefabs).toEqual([]);
  });

  it("reports both invalid patterns together", async () => {
    const f = build({ stone: { house_01: 5 } });
    f.all = prefabs;
    f.preExcludes = [];
    f.prefabFilterRegexp = "(unbalanced";
    f.blockFilterRegexp = "[unbalanced";
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.status).toBe(
      "Invalid prefab name and block name patterns",
    );
    expect(slot.current!.prefabs).toEqual([]);
  });

  it("recovers when invalid prefab pattern is corrected", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.prefabFilterRegexp = "(unbalanced";
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.status).toBe("Invalid prefab name pattern");

    f.prefabFilterRegexp = "house";
    await f.updateImmediately();
    expect(slot.current!.prefabs.map((p) => p.name)).toContain("house_01");
    expect(slot.current!.status).not.toContain("Invalid");
  });

  it("skips invalid preExcludes patterns without throwing", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = ["(unbalanced", "^aaa_"];
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.prefabs.map((p) => p.name)).not.toContain(
      "aaa_test_01",
    );
  });

  it("re-runs filter when language changes", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.prefabFilterRegexp = "house";
    const slot = capture(f);
    await f.updateImmediately();
    expect(slot.current!.prefabs.map((p) => p.name)).toContain("house_01");

    // Replace stub to also serve japanese labels.
    while (fetchStubs.length) fetchStubs.pop()?.restore();
    fetchStubs.push(
      stubFetch({
        "japanese/prefabs.json": { house_01: "家", trader_01: "商人" },
        "japanese/blocks.json": {},
        "japanese/shapes.json": {},
        "english/prefabs.json": { house_01: "House", trader_01: "Trader" },
        "english/blocks.json": {},
        "english/shapes.json": {},
      }),
    );
    f.language = "japanese";
    await f.updateImmediately();
    expect(slot.current!.prefabs.map((p) => p.name)).toContain("house_01");
  });
});
