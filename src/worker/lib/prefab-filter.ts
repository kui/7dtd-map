import type {
  BlockPrefabCounts,
  Direction,
  GameCoords,
  HighlightedBlock,
  HighlightedPrefab,
  Prefab,
  PrefabDifficulties,
  PrefabMeshSizes,
} from "../../types/7dtdmap.ts";
import type { NumberRange } from "../../types/utils.ts";
import { throttledInvoker } from "../../lib/throttled-invoker.ts";
import { LabelHolder, Language } from "../../lib/labels.ts";
import { CacheHolder } from "../../lib/cache-holder.ts";
import * as events from "../../lib/events.ts";
import { escapeHtml } from "../../lib/utils.ts";

export interface EventMessage {
  prefabs: HighlightedPrefab[];
  status: string;
}

export class PrefabFilter {
  #labelHolder: LabelHolder;
  #blockPrefabCountsHolder: CacheHolder<BlockPrefabCounts>;
  #meshSizesHolder: CacheHolder<PrefabMeshSizes>;
  #difficultiesHolder: CacheHolder<PrefabDifficulties>;

  #preFiltereds: Prefab[] = [];
  #filtered: HighlightedPrefab[] = [];
  #status = "";
  #listeners = new events.ListenerManager<EventMessage>();
  #preExcluds: RegExp[] = [];
  #prefabFilterInvalid = false;
  #blockFilterInvalid = false;

  all: Prefab[] = [];
  markCoords: GameCoords | null = null;
  difficulty: NumberRange = { start: 0, end: 5 };
  prefabFilterRegexp = "";
  blockFilterRegexp = "";
  minMatchedBlockCount = 0;

  constructor(
    labelsBaseUrl: string,
    navigatorLanguages: readonly string[],
    fetchPrefabBlockCounts: () => Promise<BlockPrefabCounts>,
    fetchPrefabMeshSizes: () => Promise<PrefabMeshSizes>,
    fetchPrefabDifficulties: () => Promise<PrefabDifficulties>,
  ) {
    const noop = () => {};
    this.#labelHolder = new LabelHolder(labelsBaseUrl, navigatorLanguages);
    this.#blockPrefabCountsHolder = new CacheHolder(
      fetchPrefabBlockCounts,
      noop,
    );
    this.#meshSizesHolder = new CacheHolder(fetchPrefabMeshSizes, noop);
    this.#difficultiesHolder = new CacheHolder(fetchPrefabDifficulties, noop);
  }

  set language(lang: Language) {
    this.#labelHolder.language = lang;
  }

  set preExcludes(patterns: string[]) {
    this.#preExcluds = patterns.flatMap((f) => {
      const re = tryCompileRegex(f, "");
      if (re === null) {
        console.warn(`Invalid preExcludes pattern, skipping: ${f}`);
        return [];
      }
      return re;
    });
  }

  update = throttledInvoker(() => this.updateImmediately());
  async updateImmediately(): Promise<void> {
    await this.#applyFilter();
    this.#updateStatus();
    await this.#updateDistance();
    this.#sort();
    await this.#listeners.dispatch({
      status: this.#status,
      prefabs: this.#filtered,
    });
  }

  #updateStatus() {
    if (this.#prefabFilterInvalid && this.#blockFilterInvalid) {
      this.#status = "Invalid prefab name and block name patterns";
      return;
    }
    if (this.#prefabFilterInvalid) {
      this.#status = "Invalid prefab name pattern";
      return;
    }
    if (this.#blockFilterInvalid) {
      this.#status = "Invalid block name pattern";
      return;
    }
    if (
      this.prefabFilterRegexp.length === 0 &&
      this.blockFilterRegexp.length === 0 &&
      this.difficulty.start === 0 &&
      this.difficulty.end === 5
    ) {
      this.#status = `All ${this.#preFiltereds.length.toString()} prefabs`;
    } else if (this.#filtered.length === 0) {
      this.#status = "No prefabs matched";
    } else {
      this.#status = `${this.#filtered.length.toString()} prefabs matched`;
    }
    if (this.blockFilterRegexp.length > 0 && this.minMatchedBlockCount > 0) {
      this.#status +=
        `, at least ${this.minMatchedBlockCount.toString()} blocks`;
    }
  }

  addListener(fn: (m: EventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }

  async #applyFilter() {
    this.#prefabFilterInvalid = false;
    this.#blockFilterInvalid = false;
    const difficulties = await this.#difficultiesHolder.get();
    this.#preFiltereds = this.#preMatch(this.all);
    let result = this.#matchByDifficulty(this.#preFiltereds, difficulties);
    result = await this.#matchByPrefabName(result, difficulties);
    result = await this.#matchByBlockName(result);
    if (this.#prefabFilterInvalid || this.#blockFilterInvalid) {
      this.#filtered = [];
      return;
    }
    this.#filtered = result;
  }

  #preMatch(prefabs: Prefab[]) {
    return prefabs.filter((p) => {
      for (const filter of this.#preExcluds) {
        if (filter.test(p.name)) return false;
      }
      return true;
    });
  }

  #matchByDifficulty(
    prefabs: Prefab[],
    difficulties: PrefabDifficulties,
  ): Prefab[] {
    return prefabs.filter((p) => {
      const d = difficulties[p.name] ?? 0;
      return d >= this.difficulty.start && d <= this.difficulty.end;
    });
  }

  async #matchByPrefabName(
    prefabs: Prefab[],
    difficulties: PrefabDifficulties,
  ): Promise<HighlightedPrefab[]> {
    const labels = await this.#labelHolder.get("prefabs");
    const pattern = this.prefabFilterRegexp.length === 0
      ? new RegExp("", "i")
      : tryCompileRegex(this.prefabFilterRegexp, "i");
    if (pattern === null) {
      console.warn(
        `Invalid prefab name pattern: ${this.prefabFilterRegexp}`,
      );
      this.#prefabFilterInvalid = true;
      return [];
    }
    return prefabs.flatMap<HighlightedPrefab>((prefab) => {
      const label = labels.get(prefab.name);
      const difficulty = difficulties[prefab.name] ?? 0;
      if (this.prefabFilterRegexp.length === 0) {
        return {
          ...prefab,
          difficulty,
          highlightedName: prefab.name,
          highlightedLabel: label ?? "-",
        };
      }

      const highlightedName = matchAndHighlight(prefab.name, pattern);
      const highlightedLabel = (label && matchAndHighlight(label, pattern)) ??
        null;
      if (highlightedName !== null || highlightedLabel !== null) {
        return {
          ...prefab,
          difficulty,
          highlightedName: highlightedName ?? prefab.name,
          highlightedLabel: highlightedLabel ?? label ?? "-",
        };
      }

      return [];
    });
  }

  async #matchByBlockName(prefabs: Prefab[]): Promise<HighlightedPrefab[]> {
    if (this.blockFilterRegexp.length === 0) {
      return prefabs;
    }
    const pattern = tryCompileRegex(this.blockFilterRegexp, "i");
    if (pattern === null) {
      console.warn(`Invalid block name pattern: ${this.blockFilterRegexp}`);
      this.#blockFilterInvalid = true;
      return [];
    }
    const matchedPrefabNames = await this.#matchPrefabTypesByBlockName(
      prefabs,
      pattern,
    );
    return prefabs.flatMap((prefab) => {
      const matchedBlocks = matchedPrefabNames[prefab.name];
      if (!matchedBlocks) return [];
      const matchedBlockCount = matchedBlocks.reduce(
        (acc, b) => acc + (b.count ?? 0),
        0,
      );
      if (matchedBlockCount < this.minMatchedBlockCount) return [];
      return { ...prefab, matchedBlocks, matchedBlockCount };
    });
  }

  async #matchPrefabTypesByBlockName(prefabs: Prefab[], pattern: RegExp) {
    const blockLabels = await this.#labelHolder.get("blocks");
    const shapeLabels = await this.#labelHolder.get("shapes");
    const prefabNames = new Set(prefabs.map((p) => p.name));
    const matchedPrefabNames: { [prefabName: string]: HighlightedBlock[] } = {};
    for (
      const [blockName, prefabs] of Object.entries(
        await this.#blockPrefabCountsHolder.get(),
      )
    ) {
      const highlightedName = matchAndHighlight(blockName, pattern);
      const label = blockLabels.get(blockName) ?? shapeLabels.get(blockName) ??
        "-";
      const highlightedLabel = label && matchAndHighlight(label, pattern);
      if (highlightedName === null && highlightedLabel === null) continue;
      for (const [prefabName, count] of Object.entries(prefabs)) {
        if (!prefabNames.has(prefabName)) continue;
        matchedPrefabNames[prefabName] = (matchedPrefabNames[prefabName] ?? [])
          .concat({
            name: blockName,
            highlightedName: highlightedName ?? blockName,
            highlightedLabel: highlightedLabel ?? label,
            count,
          });
      }
    }
    return matchedPrefabNames;
  }

  async #updateDistance() {
    if (this.markCoords) {
      const { markCoords } = this;
      const meshSizes = await this.#meshSizesHolder.get();
      this.#filtered.forEach((p) => {
        // decoration.position is the SW corner of the rotated AABB, so add the
        // rotation-aware half-extents to compare against the flag from the
        // prefab's centre instead of its corner.
        const c = prefabCenter(p, meshSizes);
        p.distance = [
          computeDirection(c, markCoords),
          computeDistance(c, markCoords),
        ];
      });
    } else {
      this.#filtered.forEach((p) => (p.distance = null));
    }
  }

  #sort() {
    if (this.#prefabFilterInvalid || this.#blockFilterInvalid) {
      return;
    }
    if (this.all.length === 0) {
      this.#status = "No prefabs loaded";
    } else if (this.#filtered.length === 0) {
      this.#status += ". Please relax the filter conditions";
    } else if (this.markCoords) {
      this.#status += ", order by distances from the flag";
      this.#filtered.sort(distSorter);
    } else if (this.blockFilterRegexp.length > 0) {
      this.#status += ", order by counts of matched blocks";
      this.#filtered.sort(blockCountSorter);
    } else {
      this.#filtered.sort(nameSorter);
    }
  }
}

function nameSorter(
  a: { name: string; difficulty?: number },
  b: { name: string; difficulty?: number },
) {
  const aDifficulty = a.difficulty ?? 0;
  const bDifficulty = b.difficulty ?? 0;
  if (aDifficulty === bDifficulty) return a.name.localeCompare(b.name);
  return bDifficulty - aDifficulty;
}

function blockCountSorter(a: HighlightedPrefab, b: HighlightedPrefab) {
  const aCount = a.matchedBlockCount ?? 0;
  const bCount = b.matchedBlockCount ?? 0;
  if (aCount === bCount) return nameSorter(a, b);
  return bCount - aCount;
}

function distSorter(a: HighlightedPrefab, b: HighlightedPrefab) {
  if (!a.distance || !b.distance || a.distance[1] === b.distance[1]) {
    return nameSorter(a, b);
  }
  return a.distance[1] - b.distance[1];
}

function prefabCenter(p: Prefab, meshSizes: PrefabMeshSizes): GameCoords {
  const size = meshSizes[p.name];
  if (!size) return { type: "game", x: p.x, z: p.z };
  const odd = ((p.rotation ?? 0) & 1) === 1;
  const halfW = (odd ? size[1] : size[0]) / 2;
  const halfD = (odd ? size[0] : size[1]) / 2;
  return { type: "game", x: p.x + halfW, z: p.z + halfD };
}

function computeDistance(targetCoords: GameCoords, baseCoords: GameCoords) {
  return Math.round(
    Math.sqrt(
      (targetCoords.x - baseCoords.x) ** 2 +
        (targetCoords.z - baseCoords.z) ** 2,
    ),
  );
}

function computeDirection(
  targetCoords: GameCoords,
  baseCoords: GameCoords,
): Direction | null {
  const dx = targetCoords.x - baseCoords.x;
  const dz = targetCoords.z - baseCoords.z;
  if (dx === 0 && dz === 0) return null;
  const angle = (Math.atan2(dz, dx) * 180) / Math.PI;
  if (angle < -157.5 || angle >= 157.5) return "W";
  if (angle < -112.5) return "SW";
  if (angle < -67.5) return "S";
  if (angle < -22.5) return "SE";
  if (angle < 22.5) return "E";
  if (angle < 67.5) return "NE";
  if (angle < 112.5) return "N";
  return "NW";
}

// Returns null instead of throwing when `source` is not a valid RegExp pattern,
// so partial / mid-typed user input does not break the worker pipeline.
function tryCompileRegex(source: string, flags: string): RegExp | null {
  try {
    return new RegExp(source, flags);
  } catch (_e) {
    return null;
  }
}

// Escapes non-matching segments and wraps matches in <mark>, so the resulting
// string is safe to assign to innerHTML even when `str` came from user XML.
// Exported for testing.
export function matchAndHighlight(str: string, regex: RegExp) {
  let isMatched = false;
  let lastIndex = 0;
  let out = "";
  // Use matchAll so we can interleave escaped non-matches with wrapped matches
  // regardless of whether the regex has the global flag set by the caller.
  const source = regex.global
    ? regex
    : new RegExp(regex.source, regex.flags + "g");
  for (const match of str.matchAll(source)) {
    const m = match[0];
    if (m.length === 0) continue;
    isMatched = true;
    const start = match.index;
    out += escapeHtml(str.slice(lastIndex, start));
    out += `<mark>${escapeHtml(m)}</mark>`;
    lastIndex = start + m.length;
  }
  if (!isMatched) return null;
  out += escapeHtml(str.slice(lastIndex));
  return out;
}
