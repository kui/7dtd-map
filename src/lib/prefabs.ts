import lazy from "./lazy-invoker";
export default class Prefabs {
  all: any;
  blockLabels: any;
  blockPrefabIndex: any;
  filter: any;
  filtered: any;
  lazyUpdater: any;
  markCoords: any;
  prevFiltered: any;
  prevMarkCoords: any;
  status: any;
  updateListeners: any;
  window: any;
  constructor(window: any) {
    this.window = window;
    this.all = [];
    this.filtered = [];
    this.prevFiltered = [];
    this.filter = null;
    this.prefabsFilterString = "";
    this.blocksFilterString = "";
    this.markCoords = null;
    this.blockPrefabIndex = {};
    this.blockLabels = {};
    this.updateListeners = [];
    this.status = "";
    this.lazyUpdater = lazy(window, async () => this.updateImmediately());
  }
  update() {
    this.lazyUpdater();
  }
  updateImmediately() {
    applyFilter(this);
    updateDist(this);
    sort(this);
    const updateData = { status: this.status };
    if (
      this.prevFiltered !== this.filtered ||
      this.prevMarkCoords !== this.markCoords
    ) {
      (updateData as any).prefabs = this.filtered;
      this.prevFiltered = this.filtered;
      this.prevMarkCoords = this.markCoords;
    }
    this.updateListeners.forEach((f: any) => f(updateData));
  }
  set prefabsFilterString(filterString: any) {
    const s = filterString.trim();
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
  set blocksFilterString(filterString: any) {
    const s = filterString.trim();
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
  addUpdateListener(func: any) {
    this.updateListeners.push(func);
  }
}
function applyFilter(prefabs: any) {
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
function updateDist(map: any) {
  if (map.markCoords) {
    map.filtered.forEach((p: any) => {
      const dist = calcDist(p, map.markCoords);
      p.dist = dist;
    });
  } else {
    map.filtered.forEach((p: any) => {
      p.dist = null;
    });
  }
}
function sort(prefabs: any) {
  if (prefabs.markCoords) {
    prefabs.filtered.sort((a: any, b: any) => {
      if (a.dist > b.dist) return 1;
      if (a.dist < b.dist) return -1;
      return 0;
    });
  } else {
    prefabs.filtered.sort((a: any, b: any) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
  }
}
function filterByPrefabs(prefabs: any, pattern: any) {
  const results = prefabs.all.flatMap((prefab: any) => {
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
function filterByBlocks(prefabs: any, pattern: any) {
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
  const results = allPrefabs.flatMap((prefab: any) => {
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
/**
  this returned value is a index that indicates what blocks are containded by the prefab.

  retrund value format:
  {
    <prefab name 1>: [
      {
        name: <block name 1>,
        count: 10,
        highlightedName: ...,
        highlightedLabel: ...
      },
      { name: <block name 2>, ... },
      { name: <block name 3>, ... },
      ...
    ],
    <prefab name 2>: [<blocks>...],
    <prefab name 3>: [<blocks>...],
    ...
  }
*/
function matchPrefabTypes(matchedBlocks: any) {
  return matchedBlocks.reduce((idx: any, block: any) => {
    const { name, highlightedName, highlightedLabel } = block;
    block.prefabs.forEach((p: any) => {
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
function matchBlocks(pattern: any, blockPrefabIndex: any, blockLabels: any) {
  return Object.entries(blockPrefabIndex).reduce(
    (arr, [blockName, prefabs]) => {
      const highlightedName = matchAndHighlight(blockName, pattern);
      const blockLabel = blockLabels[blockName];
      const highlightedLabel =
        blockLabel && matchAndHighlight(blockLabel, pattern);
      if (highlightedName || highlightedLabel) {
        return arr.concat({
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
function calcDist(targetCoords: any, baseCoords: any) {
  return Math.round(
    Math.sqrt(
      (targetCoords.x - baseCoords.x) ** 2 +
        (targetCoords.y - baseCoords.z) ** 2
    )
  );
}
function matchAndHighlight(str: any, regex: any) {
  let isMatched = false;
  const highlighted = str.replace(regex, (m: any) => {
    isMatched = m.length > 0;
    return `<mark>${m}</mark>`;
  });
  return isMatched ? highlighted : null;
}
