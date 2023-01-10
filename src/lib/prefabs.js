"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throttled_invoker_1 = require("./throttled-invoker");
class Prefabs {
  constructor() {
    this.all = [];
    this.blockLabels = {};
    this.blockPrefabIndex = {};
    this.filter = null;
    this.filtered = [];
    this.markCoords = null;
    this.status = "";
    this.throttledUpdater = (0, throttled_invoker_1.throttledInvoker)(async () => this.updateImmediately());
    this.updateListeners = [];
  }
  update() {
    this.throttledUpdater();
  }
  updateImmediately() {
    this.applyFilter();
    this.updateDist();
    this.sort();
    const update = { status: this.status, prefabs: this.filtered };
    this.updateListeners.forEach((f) => f(update));
  }
  set prefabsFilterString(filter) {
    const s = filter.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = new PrefabNameMatcher(new RegExp(s, "i"));
    }
  }
  set blocksFilterString(filter) {
    const s = filter.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = new BlockNameMatcher(new RegExp(s, "i"), this.blockPrefabIndex, this.blockLabels);
    }
  }
  addUpdateListener(func) {
    this.updateListeners.push(func);
  }
  applyFilter() {
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
  updateDist() {
    if (this.markCoords) {
      const { markCoords } = this;
      this.filtered.forEach((p) => (p.dist = calcDist(p, markCoords)));
    } else {
      this.filtered.forEach((p) => (p.dist = null));
    }
  }
  sort() {
    if (this.markCoords) {
      this.status = `${this.status}, order by distances from the flag`;
      this.filtered.sort(distSorter);
    } else {
      this.filtered.sort(nameSorter);
    }
  }
}
exports.default = Prefabs;
function nameSorter(a, b) {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
}
function distSorter(a, b) {
  if (!a.dist || !b.dist) return nameSorter(a, b);
  if (a.dist > b.dist) return 1;
  if (a.dist < b.dist) return -1;
  return nameSorter(a, b);
}
function calcDist(targetCoords, baseCoords) {
  return Math.round(Math.sqrt((targetCoords.x - baseCoords.x) ** 2 + (targetCoords.z - baseCoords.z) ** 2));
}
function matchAndHighlight(str, regex) {
  let isMatched = false;
  const highlighted = str.replace(regex, (m) => {
    isMatched = m.length > 0;
    return `<mark>${m}</mark>`;
  });
  return isMatched ? highlighted : null;
}
class PrefabNameMatcher {
  constructor(regexp) {
    this.regexp = regexp;
  }
  match(prefabs) {
    const results = prefabs.flatMap((prefab) => {
      const m = matchAndHighlight(prefab.name, this.regexp);
      if (m) {
        // Clone and add a new field;
        return { ...prefab, highlightedName: m };
      }
      return [];
    });
    return {
      status: `${results.length} matched prefabs`,
      matched: results,
    };
  }
}
class BlockNameMatcher {
  constructor(regexp, blockPrefabIndex, blockLabels) {
    this.regexp = regexp;
    this.blockPrefabIndex = blockPrefabIndex;
    this.blockLabels = blockLabels;
  }
  match(prefabs) {
    const matchedBlocks = this.matchBlocks();
    if (matchedBlocks.length === 0) {
      return { status: "No matched blocks", matched: [] };
    }
    const matchedPrefabBlocks = this.matchPrefabTypes(matchedBlocks);
    if (Object.keys(matchedPrefabBlocks).length === 0) {
      return { status: `No prefabs, ${matchedBlocks.length} matched blocks`, matched: [] };
    }
    const results = prefabs.flatMap((prefab) => {
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
  matchBlocks() {
    return Object.entries(this.blockPrefabIndex).reduce((arr, [blockName, prefabs]) => {
      const highlightedName = matchAndHighlight(blockName, this.regexp);
      const blockLabel = this.blockLabels[blockName];
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
  matchPrefabTypes(matchedBlocks) {
    return matchedBlocks.reduce((idx, block) => {
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
//# sourceMappingURL=prefabs.js.map
