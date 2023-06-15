import { throttledInvoker } from "./throttled-invoker";

export interface PrefabUpdate {
  status: string;
  prefabs: HighlightedPrefab[];
}

interface PrefabHighlightedBlocks {
  [prefabName: string]: HighlightedBlock[];
}

export default class Prefabs {
  all: Prefab[] = [];
  prefabLabels: Labels = {};
  blockLabels: Labels = {};
  blockPrefabIndex: BlockPrefabIndex = {};
  filter: PrefabMatcher | null = null;
  filtered: HighlightedPrefab[] = [];
  markCoords: GameCoords | null = null;
  status = "";

  private throttledUpdater = throttledInvoker(async () => this.updateImmediately());
  private updateListeners: ((u: PrefabUpdate) => void)[] = [];

  update(): void {
    this.throttledUpdater();
  }
  updateImmediately(): void {
    this.applyFilter();
    this.updateDist();
    this.sort();
    const update: PrefabUpdate = { status: this.status, prefabs: this.filtered };
    this.updateListeners.forEach((f) => f(update));
  }
  set prefabsFilterString(filter: string) {
    const s = filter.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = new PrefabNameMatcher(new RegExp(s, "i"), this.prefabLabels);
    }
  }
  set blocksFilterString(filter: string) {
    const s = filter.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = new BlockNameMatcher(new RegExp(s, "i"), this.blockPrefabIndex, this.blockLabels);
    }
  }
  addUpdateListener(func: (update: PrefabUpdate) => void): void {
    this.updateListeners.push(func);
  }

  private applyFilter() {
    this.initPrefabLabels();

    if (this.filter) {
      const result = this.filter.match(this.all);
      this.status = result.status;
      this.filtered = result.matched;
    } else if (this.all.length === 0) {
      this.status = "No prefabs";
      this.filtered = [];
    } else {
      this.status = "All prefabs";
      this.filtered = this.all;
    }
  }

  private initPrefabLabels() {
    if (this.all.length === 0) return;
    if ("label" in this.all[0]) return;
    if (Object.keys(this.prefabLabels).length === 0) return;
    for (const prefab of this.all) {
      prefab.label = this.prefabLabels[prefab.name];
    }
  }

  private updateDist() {
    if (this.markCoords) {
      const { markCoords } = this;
      this.filtered.forEach((p) => (p.dist = calcDist(p, markCoords)));
    } else {
      this.filtered.forEach((p) => (p.dist = null));
    }
  }
  private sort() {
    if (this.markCoords) {
      this.status = `${this.status}, order by distances from the flag`;
      this.filtered.sort(distSorter);
    } else {
      this.filtered.sort(nameSorter);
    }
  }
}

function nameSorter(a: { name: string }, b: { name: string }) {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
}

function distSorter(a: HighlightedPrefab, b: HighlightedPrefab) {
  if (!a.dist || !b.dist) return nameSorter(a, b);
  if (a.dist > b.dist) return 1;
  if (a.dist < b.dist) return -1;
  return nameSorter(a, b);
}

function calcDist(targetCoords: GameCoords, baseCoords: GameCoords) {
  return Math.round(Math.sqrt((targetCoords.x - baseCoords.x) ** 2 + (targetCoords.z - baseCoords.z) ** 2));
}

function matchAndHighlight(str: string, regex: RegExp) {
  let isMatched = false;
  const highlighted = str.replace(regex, (m) => {
    isMatched = m.length > 0;
    return `<mark>${m}</mark>`;
  });
  return isMatched ? highlighted : null;
}

interface PrefabMatcher {
  match(prefabs: Prefab[]): PrefabMatcherResult;
}
interface PrefabMatcherResult {
  status: string;
  matched: HighlightedPrefab[];
}

class PrefabNameMatcher implements PrefabMatcher {
  regexp: RegExp;
  labels: Labels;

  constructor(regexp: RegExp, labels: Labels) {
    this.regexp = regexp;
    this.labels = labels;
  }

  match(prefabs: Prefab[]) {
    const results = prefabs.flatMap<HighlightedPrefab>((prefab) => {
      const highlightedName = matchAndHighlight(prefab.name, this.regexp);
      const highlightedLabel = prefab.label && matchAndHighlight(prefab.label, this.regexp);
      if (highlightedName || highlightedLabel) {
        return {
          ...prefab,
          highlightedName: highlightedName || prefab.name,
          highlightedLabel: highlightedLabel || prefab.label,
        };
      }
      return [];
    });
    return {
      status: `${results.length} matched prefabs`,
      matched: results,
    };
  }
}

class BlockNameMatcher implements PrefabMatcher {
  regexp: RegExp;
  blockPrefabIndex: BlockPrefabIndex;
  labels: Labels;

  constructor(regexp: RegExp, blockPrefabIndex: BlockPrefabIndex, labels: Labels) {
    this.regexp = regexp;
    this.blockPrefabIndex = blockPrefabIndex;
    this.labels = labels;
  }

  match(prefabs: Prefab[]) {
    const matchedBlocks = this.matchBlocks();
    if (matchedBlocks.length === 0) {
      return { status: "No matched blocks", matched: [] };
    }

    const matchedPrefabBlocks = this.matchPrefabTypes(matchedBlocks);
    if (Object.keys(matchedPrefabBlocks).length === 0) {
      return { status: `No prefabs, ${matchedBlocks.length} matched blocks`, matched: [] };
    }

    const results = prefabs.flatMap((prefab: Prefab) => {
      const blocks = matchedPrefabBlocks[prefab.name];
      if (!blocks) {
        return [];
      }
      // Clone and add a new field;
      return { ...prefab, matchedBlocks: blocks };
    });
    return {
      status: `${results.length} prefabs, ${matchedBlocks.length} matched blocks`,
      matched: results,
    };
  }

  private matchBlocks() {
    return Object.entries(this.blockPrefabIndex).reduce<HighlightedBlock[]>((arr, [blockName, prefabs]) => {
      const highlightedName = matchAndHighlight(blockName, this.regexp);
      const blockLabel = this.labels[blockName];
      const highlightedLabel = blockLabel && matchAndHighlight(blockLabel, this.regexp);
      if (highlightedName || highlightedLabel) {
        return arr.concat({
          name: blockName,
          highlightedName: highlightedName || blockName,
          highlightedLabel: highlightedLabel || blockLabel,
          prefabs,
        });
      }
      return arr;
    }, []);
  }

  private matchPrefabTypes(matchedBlocks: HighlightedBlock[]): PrefabHighlightedBlocks {
    return matchedBlocks.reduce<PrefabHighlightedBlocks>((idx, block) => {
      const { name, highlightedName, highlightedLabel } = block;
      block.prefabs?.forEach((p) => {
        const b = {
          name,
          highlightedName,
          highlightedLabel,
          count: p.count,
        };
        idx[p.name] = (idx[p.name] || []).concat(b);
      });
      return idx;
    }, {});
  }
}
