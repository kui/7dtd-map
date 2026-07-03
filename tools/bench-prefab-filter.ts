// Phase-level CPU benchmark of the block-name matching pipeline in
// src/worker/lib/prefab-filter.ts (#matchByBlockName equivalent), run directly
// under Deno so no browser / dev server is needed.
import {
  matchAndHighlight,
  MATCHED_BLOCKS_LIMIT,
} from "../src/worker/lib/prefab-filter.ts";

const PUBLIC = new URL("../public/", import.meta.url);

type Counts = { [prefab: string]: { [block: string]: number } };
type Inverted = { [block: string]: { [prefab: string]: number } };

async function readJson(relative: string): Promise<unknown> {
  const url = new URL(relative, PUBLIC);
  let text: string;
  try {
    text = await Deno.readTextFile(url);
  } catch (e) {
    throw new Error(`Cannot read ${url.pathname}: ${String(e)}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON in ${url.pathname}: ${String(e)}`);
  }
}

function assertCounts(value: unknown, source: string): Counts {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${source}: expected an object of prefab block counts`);
  }
  for (const [prefab, blocks] of Object.entries(value)) {
    if (typeof blocks !== "object" || blocks === null) {
      throw new Error(`${source}: prefab "${prefab}" is not a block-count map`);
    }
    for (const [block, count] of Object.entries(blocks)) {
      if (typeof count !== "number") {
        throw new Error(
          `${source}: count for ${prefab}/${block} is not a number`,
        );
      }
    }
  }
  return value as Counts;
}

function labelMap(value: unknown, source: string): Map<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${source}: expected a label object`);
  }
  return new Map(Object.entries(value as Record<string, string>));
}

const counts = assertCounts(
  await readJson("prefab-block-counts.json"),
  "prefab-block-counts.json",
);
const blockLabels = labelMap(
  await readJson("labels/english/blocks.json"),
  "labels/english/blocks.json",
);
const shapeLabels = labelMap(
  await readJson("labels/english/shapes.json"),
  "labels/english/shapes.json",
);

const inverted: Inverted = {};
for (const [prefabName, blockCounts] of Object.entries(counts)) {
  for (const [blockName, count] of Object.entries(blockCounts)) {
    (inverted[blockName] ??= {})[prefabName] = count;
  }
}
const invertedEntries = Object.entries(inverted);
const allPrefabNames = Object.keys(counts);
console.log(
  `prefabs=${allPrefabNames.length} distinctBlocks=${invertedEntries.length}`,
);

interface HB {
  name: string;
  highlightedName: string;
  highlightedLabel: string;
  count: number;
}

function matchedBlockSorter(a: HB, b: HB) {
  return b.count - a.count || a.name.localeCompare(b.name);
}

function runOnce(pattern: RegExp) {
  const t = {
    mah: 0,
    scan: 0,
    join: 0,
    sort: 0,
    cloneAll: 0,
    cloneFirstChunk: 0,
    cloneCapped: 0,
  };
  let mahCalls = 0;
  const mah = (s: string, re: RegExp) => {
    const t0 = performance.now();
    const r = matchAndHighlight(s, re);
    t.mah += performance.now() - t0;
    mahCalls++;
    return r;
  };

  let t0 = performance.now();
  const matched: { [prefab: string]: HB[] } = {};
  for (const [blockName, prefabs] of invertedEntries) {
    const highlightedName = mah(blockName, pattern);
    const label = blockLabels.get(blockName) ?? shapeLabels.get(blockName) ??
      "-";
    const highlightedLabel = label && mah(label, pattern);
    if (highlightedName === null && highlightedLabel === null) continue;
    for (const [prefabName, count] of Object.entries(prefabs)) {
      (matched[prefabName] ??= []).push({
        name: blockName,
        highlightedName: highlightedName ?? blockName,
        highlightedLabel: highlightedLabel ?? label,
        count,
      });
    }
  }
  t.scan = performance.now() - t0;

  t0 = performance.now();
  const result = allPrefabNames.flatMap((name) => {
    const matchedBlocks = matched[name];
    if (!matchedBlocks) return [];
    const matchedBlockCount = matchedBlocks.reduce(
      (acc, b) => acc + (b.count ?? 0),
      0,
    );
    return { name, x: 0, z: 0, matchedBlocks, matchedBlockCount };
  });
  t.join = performance.now() - t0;

  t0 = performance.now();
  result.sort((a, b) =>
    b.matchedBlockCount - a.matchedBlockCount ||
    a.name.localeCompare(b.name)
  );
  t.sort = performance.now() - t0;

  // structuredClone approximates the postMessage serialize cost.
  t0 = performance.now();
  structuredClone(result);
  t.cloneAll = performance.now() - t0;
  t0 = performance.now();
  structuredClone(result.slice(0, 50));
  t.cloneFirstChunk = performance.now() - t0;
  const capped = result.slice(0, 50).map((p) => ({
    ...p,
    matchedBlocks: p.matchedBlocks.toSorted(matchedBlockSorter).slice(
      0,
      MATCHED_BLOCKS_LIMIT,
    ),
  }));
  t0 = performance.now();
  structuredClone(capped);
  t.cloneCapped = performance.now() - t0;

  const totalBlocks = result.reduce((a, p) => a + p.matchedBlocks.length, 0);
  return { t, mahCalls, matchedPrefabs: result.length, totalBlocks };
}

const ITER = 5;
console.log(
  "filter  prefabs  blocks   scan(mah)      join  sort  cloneAll clone50 capped50",
);
for (const f of ["s", "st", "stu", "stum", "stump"]) {
  const pattern = new RegExp(f, "i");
  let best: ReturnType<typeof runOnce> | null = null;
  for (let i = 0; i < ITER; i++) {
    const r = runOnce(pattern);
    if (!best || r.t.scan + r.t.join < best.t.scan + best.t.join) best = r;
  }
  const b = best;
  if (!b) throw new Error("benchmark produced no samples");
  const ms = (v: number) => v.toFixed(0).padStart(5);
  console.log(
    `${f.padEnd(7)}${String(b.matchedPrefabs).padStart(7)}${
      String(b.totalBlocks).padStart(9)
    }  ${ms(b.t.scan)}(${ms(b.t.mah)})  ${ms(b.t.join)} ${ms(b.t.sort)}  ${
      ms(b.t.cloneAll)
    }   ${ms(b.t.cloneFirstChunk)}  ${ms(b.t.cloneCapped)}`,
  );
}
