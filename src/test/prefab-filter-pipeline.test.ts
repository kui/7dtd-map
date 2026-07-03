import type {
  BlockPrefabCounts,
  HighlightedPrefab,
  Prefab,
  PrefabAddedVersions,
  PrefabDifficulties,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";
import {
  CHUNK_SIZE,
  MATCHED_BLOCKS_LIMIT,
  PrefabFilter,
} from "../worker/lib/prefab-filter.ts";
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
  meshSizes: PrefabMeshSizes = {},
  difficulties: PrefabDifficulties = {},
  addedVersions: PrefabAddedVersions = { unrelated_prefab: "0.0" },
): PrefabFilter {
  return new PrefabFilter(
    "/labels",
    ["en"],
    () => Promise.resolve(blockCounts),
    () => Promise.resolve(meshSizes),
    () => Promise.resolve(difficulties),
    () => Promise.resolve(addedVersions),
  );
}

interface Captured {
  prefabs: HighlightedPrefab[];
  status: string;
  total: number;
}

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
    { name: "aaa_test_01", x: 0, z: 0 },
    { name: "house_01", x: 100, z: 0 },
    { name: "trader_01", x: 0, z: 200 },
    { name: "skyscraper_01", x: 500, z: 500 },
  ];
  const difficulties: PrefabDifficulties = {
    "aaa_test_01": 0,
    "house_01": 1,
    "trader_01": 3,
    "skyscraper_01": 5,
  };

  function capture(f: PrefabFilter): Captured {
    const slot: Captured = { prefabs: [], status: "", total: 0 };
    f.addListener((m) => {
      if (m.type === "header") {
        slot.status = m.status;
        slot.total = m.total;
        slot.prefabs = [];
      } else {
        slot.prefabs.push(...m.prefabs);
      }
    });
    return slot;
  }

  // Chunks stream in on detached macrotasks after the header resolves
  // updateImmediately, so wait until the whole run has been received.
  async function settle(f: PrefabFilter, slot: Captured): Promise<void> {
    await f.updateImmediately();
    while (slot.prefabs.length < slot.total) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  it("excludes prefabs that match preExcludes patterns", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = ["^aaa_"];
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.prefabs.map((p) => p.name)).not.toContain(
      "aaa_test_01",
    );
    expect(slot.prefabs.length).toBe(3);
  });

  it("filters by difficulty range", async () => {
    const f = build({}, {}, difficulties);
    f.all = prefabs;
    f.preExcludes = [];
    f.difficulty = { start: 2, end: 4 };
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.prefabs.map((p) => p.name)).toEqual(["trader_01"]);
  });

  it("computes distance when markCoords is set", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.markCoords = { type: "game", x: 0, z: 0 };
    const slot = capture(f);
    await settle(f, slot);
    const first = slot.prefabs[0];
    expect(first.name).toBe("aaa_test_01");
    expect(
      slot.prefabs.every((p) =>
        p.distance !== null && p.distance !== undefined
      ),
    ).toBe(true);
  });

  it("status reports 'All N prefabs' when filters are inactive", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.status).toBe(
      `All ${prefabs.length.toString()} prefabs`,
    );
  });

  it("filters to prefabs added in the latest version when onlyNew is set", async () => {
    const f = build({}, {}, {}, { house_01: "2.0", trader_01: "1.0" });
    f.all = prefabs;
    f.preExcludes = [];
    f.onlyNew = true;
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.prefabs.map((p) => p.name)).toEqual(["house_01"]);
  });

  it("status does not report 'All N prefabs' when onlyNew is set", async () => {
    const f = build({}, {}, {}, { house_01: "2.0", trader_01: "1.0" });
    f.all = prefabs;
    f.preExcludes = [];
    f.onlyNew = true;
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.status).toBe("1 prefabs matched");
  });

  it("reports invalid prefab name pattern without throwing", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.prefabFilterRegexp = "(unbalanced";
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.status).toBe("Invalid prefab name pattern");
    expect(slot.prefabs).toEqual([]);
  });

  it("reports invalid block name pattern without throwing", async () => {
    const f = build({ stone: { house_01: 5 } });
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "[unbalanced";
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.status).toBe("Invalid block name pattern");
    expect(slot.prefabs).toEqual([]);
  });

  it("reports both invalid patterns together", async () => {
    const f = build({ stone: { house_01: 5 } });
    f.all = prefabs;
    f.preExcludes = [];
    f.prefabFilterRegexp = "(unbalanced";
    f.blockFilterRegexp = "[unbalanced";
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.status).toBe(
      "Invalid prefab name and block name patterns",
    );
    expect(slot.prefabs).toEqual([]);
  });

  it("recovers when invalid prefab pattern is corrected", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.prefabFilterRegexp = "(unbalanced";
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.status).toBe("Invalid prefab name pattern");

    f.prefabFilterRegexp = "house";
    await settle(f, slot);
    expect(slot.prefabs.map((p) => p.name)).toContain("house_01");
    expect(slot.status).not.toContain("Invalid");
  });

  it("skips invalid preExcludes patterns without throwing", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = ["(unbalanced", "^aaa_"];
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.prefabs.map((p) => p.name)).not.toContain(
      "aaa_test_01",
    );
  });

  it("re-runs filter when language changes", async () => {
    const f = build();
    f.all = prefabs;
    f.preExcludes = [];
    f.prefabFilterRegexp = "house";
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.prefabs.map((p) => p.name)).toContain("house_01");

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
    await settle(f, slot);
    expect(slot.prefabs.map((p) => p.name)).toContain("house_01");
  });

  it("filters by block name", async () => {
    const f = build({ stone: { house_01: 5 }, wood: { trader_01: 3 } });
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "stone";
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.prefabs.map((p) => p.name)).toEqual(["house_01"]);
    expect(slot.prefabs[0].matchedBlockCount).toBe(5);
  });

  it("filters out prefabs below minMatchedBlockCount", async () => {
    const f = build({
      crate: { house_01: 5, trader_01: 3 },
      barrel: { house_01: 2, skyscraper_01: 10 },
    });
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "crate|barrel";
    f.minMatchedBlockCount = 6;
    const slot = capture(f);
    await settle(f, slot);
    const names = slot.prefabs.map((p) => p.name);
    expect(names).toContain("house_01"); // 5 + 2 = 7
    expect(names).toContain("skyscraper_01"); // 10
    expect(names).not.toContain("trader_01"); // 3 < 6
  });

  it("status includes minMatchedBlockCount when active", async () => {
    const f = build({ stone: { house_01: 5 } });
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "stone";
    f.minMatchedBlockCount = 2;
    const slot = capture(f);
    await settle(f, slot);
    expect(slot.status).toContain("at least 2 blocks");
  });

  it("allows all matched prefabs when minMatchedBlockCount is 0", async () => {
    const f = build({ stone: { house_01: 5, trader_01: 1 } });
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "stone";
    f.minMatchedBlockCount = 0;
    const slot = capture(f);
    await settle(f, slot);
    const names = slot.prefabs.map((p) => p.name);
    expect(names).toContain("house_01");
    expect(names).toContain("trader_01");
  });

  it("treats negative minMatchedBlockCount as 0", async () => {
    const f = build({ stone: { house_01: 5, trader_01: 1 } });
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "stone";
    f.minMatchedBlockCount = -1;
    const slot = capture(f);
    await settle(f, slot);
    const names = slot.prefabs.map((p) => p.name);
    expect(names).toContain("house_01");
    expect(names).toContain("trader_01");
  });

  it("caps matchedBlocks while keeping the true count and type total", async () => {
    const typeCount = MATCHED_BLOCKS_LIMIT + 5;
    const blockCounts: BlockPrefabCounts = {};
    for (let i = 0; i < typeCount; i++) {
      const name = `block_${i.toString().padStart(2, "0")}`;
      blockCounts[name] = { house_01: i + 1 };
    }
    const f = build(blockCounts);
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "block_";
    const slot = capture(f);
    await settle(f, slot);

    const house = slot.prefabs.find((p) => p.name === "house_01");
    expect(house).toBeDefined();
    const blocks = house?.matchedBlocks ?? [];
    expect(blocks.length).toBe(MATCHED_BLOCKS_LIMIT);
    expect(house?.matchedBlockTypeCount).toBe(typeCount);
    // matchedBlockCount sums every matched type, not just the transmitted ones.
    const fullSum = Array.from({ length: typeCount }, (_, i) => i + 1)
      .reduce((a, b) => a + b, 0);
    expect(house?.matchedBlockCount).toBe(fullSum);
    // Transmitted blocks are the highest counts, in descending order.
    const counts = blocks.map((b) => b.count ?? 0);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    expect(counts[0]).toBe(typeCount);
  });

  it("breaks matchedBlocks count ties by name ascending", async () => {
    const typeCount = MATCHED_BLOCKS_LIMIT + 5;
    const blockCounts: BlockPrefabCounts = {};
    for (let i = 0; i < typeCount; i++) {
      const name = `block_${i.toString().padStart(2, "0")}`;
      blockCounts[name] = { house_01: 7 };
    }
    const f = build(blockCounts);
    f.all = prefabs;
    f.preExcludes = [];
    f.blockFilterRegexp = "block_";
    const slot = capture(f);
    await settle(f, slot);

    const house = slot.prefabs.find((p) => p.name === "house_01");
    const names = (house?.matchedBlocks ?? []).map((b) => b.name);
    const expected = Array.from(
      { length: MATCHED_BLOCKS_LIMIT },
      (_, i) => `block_${i.toString().padStart(2, "0")}`,
    );
    expect(names).toEqual(expected);
  });

  it("stops streaming chunks when input changes mid-stream", async () => {
    // More than one chunk so there is a remainder to abort. No filters, so
    // every prefab matches and the result exceeds CHUNK_SIZE.
    const many: Prefab[] = Array.from({ length: CHUNK_SIZE * 3 }, (_, i) => ({
      name: `prefab_${i.toString().padStart(3, "0")}`,
      x: 0,
      z: 0,
    }));
    const f = build();
    f.all = many;
    f.preExcludes = [];
    const slot = capture(f);

    // The header plus the first chunk are delivered synchronously as the
    // stream is detached; the rest wait on macrotask yields.
    await f.updateImmediately();
    expect(slot.total).toBe(many.length);
    expect(slot.prefabs.length).toBe(CHUNK_SIZE);

    // Simulate a new keystroke arriving before the remaining chunks stream.
    f.bumpInputVersion();

    // Let the detached stream run its next iteration; it must abort at the
    // pre-post check instead of delivering the remaining chunks.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(slot.prefabs.length).toBe(CHUNK_SIZE);
  });
});
