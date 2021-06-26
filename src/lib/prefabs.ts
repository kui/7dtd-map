import lazy from "./lazy-invoker";

declare interface PrefabFilter {
  name: string;
  func: (prefabs: Prefabs, pattern: RegExp) => HighlightedPrefab[];
  pattern: RegExp;
}

export declare interface PrefabUpdate {
  status: string;
  prefabs: HighlightedPrefab[];
}

declare interface PrefabHighlightedBlocks {
  [prefabName: string]: HighlightedBlock[];
}

export default class Prefabs {
  all: Prefab[];
  blockLabels: BlockLabels;
  blockPrefabIndex: BlockPrefabIndex;
  filter: PrefabFilter | null;
  filtered: HighlightedPrefab[];
  lazyUpdater: () => void;
  markCoords: Coords | null;
  prevFiltered: HighlightedPrefab[];
  prevMarkCoords: Coords | null;
  status: string;
  updateListeners: ((u: PrefabUpdate) => void)[];

  constructor() {
    this.all = [];
    this.filtered = [];
    this.prevFiltered = [];
    this.filter = null;
    this.prefabsFilterString = "";
    this.blocksFilterString = "";
    this.markCoords = null;
    this.prevMarkCoords = null;
    this.blockPrefabIndex = {};
    this.blockLabels = {};
    this.updateListeners = [];
    this.status = "";
    this.lazyUpdater = lazy(async () => this.updateImmediately());
  }
  update(): void {
    this.lazyUpdater();
  }
  updateImmediately(): void {
    applyFilter(this);
    updateDist(this);
    sort(this);
    const updateData: PrefabUpdate = { status: this.status, prefabs: [] };
    if (this.prevFiltered !== this.filtered || this.prevMarkCoords !== this.markCoords) {
      updateData.prefabs = this.filtered;
      this.prevFiltered = this.filtered;
      this.prevMarkCoords = this.markCoords;
    }
    this.updateListeners.forEach((f) => f(updateData));
  }
  set prefabsFilterString(filter: string) {
    const s = filter.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = {
        name: "prefab name",
        func: filterByPrefabs,
        pattern: new RegExp(s, "i"),
      };
    }
  }
  set blocksFilterString(filter: string) {
    const s = filter.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = {
        name: "block name",
        func: filterByBlocks,
        pattern: new RegExp(s, "i"),
      };
    }
  }
  addUpdateListener(func: (update: PrefabUpdate) => void): void {
    this.updateListeners.push(func);
  }
}
function applyFilter(prefabs: Prefabs) {
  if (prefabs.filter) {
    prefabs.filtered = prefabs.filter.func(prefabs, prefabs.filter.pattern);
  } else {
    if (prefabs.all.length === 0) {
      prefabs.status = "No prefabs";
    } else {
      prefabs.status = "All prefabs";
    }
    prefabs.filtered = prefabs.all;
  }
}
function updateDist(map: Prefabs) {
  if (map.markCoords) {
    map.filtered.forEach((p) => (p.dist = calcDist(p, map.markCoords as Coords)));
  } else {
    map.filtered.forEach((p) => (p.dist = null));
  }
}
function sort(prefabs: Prefabs) {
  if (prefabs.markCoords) {
    prefabs.filtered.sort(distSorter);
  } else {
    prefabs.filtered.sort(nameSorter);
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
  return 0;
}
function filterByPrefabs(prefabs: Prefabs, pattern: RegExp) {
  const results = prefabs.all.flatMap((prefab) => {
    const m = matchAndHighlight(prefab.name, pattern);
    if (m) {
      // Clone and add a new field;
      return { ...prefab, highlightedName: m };
    }
    return [];
  });
  prefabs.status = `${results.length} matched prefabs`;
  return results;
}
function filterByBlocks(prefabs: Prefabs, pattern: RegExp) {
  const { all: allPrefabs, blockPrefabIndex, blockLabels } = prefabs;
  const matchedBlocks = matchBlocks(pattern, blockPrefabIndex, blockLabels);
  if (matchedBlocks.length === 0) {
    prefabs.status = "No matched blocks";
    return [];
  }
  const matchedPrefabBlocks = matchPrefabTypes(matchedBlocks);
  if (Object.keys(matchedPrefabBlocks).length === 0) {
    prefabs.status = `No prefabs, ${matchedBlocks.length} matched blocks`;
    return [];
  }
  const results = allPrefabs.flatMap((prefab: Prefab) => {
    const blocks = matchedPrefabBlocks[prefab.name];
    if (!blocks) {
      return [];
    }
    // Clone and add a new field;
    return { ...prefab, matchedBlocks: blocks };
  });
  prefabs.status = `${results.length} prefabs, ${matchedBlocks.length} matched blocks`;
  return results;
}

function matchPrefabTypes(matchedBlocks: HighlightedBlock[]): PrefabHighlightedBlocks {
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

function matchBlocks(pattern: RegExp, blockPrefabIndex: BlockPrefabIndex, blockLabels: BlockLabels) {
  return (Object.entries(blockPrefabIndex) as [string, { name: string; count: number }[]][]).reduce<HighlightedBlock[]>(
    (arr, [blockName, prefabs]) => {
      const highlightedName = matchAndHighlight(blockName, pattern);
      const blockLabel = blockLabels[blockName];
      const highlightedLabel = blockLabel && matchAndHighlight(blockLabel, pattern);
      if (highlightedName || highlightedLabel) {
        return arr.concat({
          name: blockName,
          highlightedName: highlightedName || blockName,
          highlightedLabel: highlightedLabel || blockLabel,
          prefabs,
        });
      }
      return arr;
    },
    []
  );
}
function calcDist(targetCoords: Coords, baseCoords: Coords) {
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
