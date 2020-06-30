import flatMap from 'lodash/flatMap';
import lazy from './lazy-invoker';

export default class Prefabs {
  constructor(window) {
    this.window = window;
    this.all = [];
    this.filtered = [];
    this.prevFiltered = [];
    this.filter = null;
    this.prefabsFilterString = '';
    this.blocksFilterString = '';
    this.markCoords = null;
    this.blockPrefabIndex = {};
    this.blockLabels = {};
    this.updateListeners = [];
    this.status = '';
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
    if (this.prevFiltered !== this.filtered
       || this.prevMarkCoords !== this.markCoords) {
      updateData.prefabs = this.filtered;
      this.prevFiltered = this.filtered;
      this.prevMarkCoords = this.markCoords;
    }
    this.updateListeners.forEach((f) => f(updateData));
  }

  set prefabsFilterString(filterString) {
    const s = filterString.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = {
        name: 'prefab name',
        func: filterByPrefabs,
        pattern: new RegExp(s, 'i'),
      };
    }
  }

  set blocksFilterString(filterString) {
    const s = filterString.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = {
        name: 'block name',
        func: filterByBlocks,
        pattern: new RegExp(s, 'i'),
      };
    }
  }

  addUpdateListener(func) {
    this.updateListeners.push(func);
  }
}

function applyFilter(prefabs) {
  if (prefabs.filter) {
    prefabs.filtered = prefabs.filter.func(prefabs, prefabs.filter.pattern);
  } else {
    if (prefabs.all.length === 0) {
      prefabs.status = 'No prefabs';
    } else {
      prefabs.status = 'All prefabs';
    }
    prefabs.filtered = prefabs.all;
  }
}

function updateDist(map) {
  if (map.markCoords) {
    map.filtered.forEach((p) => {
      const dist = calcDist(p, map.markCoords);
      p.dist = dist;
    });
  } else {
    map.filtered.forEach((p) => {
      p.dist = null;
    });
  }
}

function sort(prefabs) {
  if (prefabs.markCoords) {
    prefabs.filtered.sort((a, b) => {
      if (a.dist > b.dist) return 1;
      if (a.dist < b.dist) return -1;
      return 0;
    });
  } else {
    prefabs.filtered.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
  }
}

function filterByPrefabs(prefabs, pattern) {
  const results = flatMap(prefabs.all, (prefab) => {
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

function filterByBlocks(prefabs, pattern) {
  const { all: allPrefabs, blockPrefabIndex, blockLabels } = prefabs;
  const matchedBlocks = matchBlocks(pattern, blockPrefabIndex, blockLabels);
  if (matchedBlocks.length === 0) {
    prefabs.status = 'No matched blocks';
    return [];
  }

  const matchedPrefabBlocks = matchPrefabTypes(matchedBlocks);
  if (Object.keys(matchedPrefabBlocks).length === 0) {
    prefabs.status = `No prefabs, ${matchedBlocks.length} matched blocks`;
    return [];
  }

  const results = flatMap(allPrefabs, (prefab) => {
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
function matchPrefabTypes(matchedBlocks) {
  return matchedBlocks.reduce((idx, block) => {
    const { name, highlightedName, highlightedLabel } = block;
    block.prefabs.forEach((p) => {
      const b = {
        name, highlightedName, highlightedLabel, count: p.count,
      };
      idx[p.name] = (idx[p.name] || []).concat(b);
    });
    return idx;
  }, {});
}

function matchBlocks(pattern, blockPrefabIndex, blockLabels) {
  return Object
    .entries(blockPrefabIndex)
    .reduce((arr, [blockName, prefabs]) => {
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
    }, []);
}

function calcDist(targetCoords, baseCoords) {
  return Math.round(Math.sqrt(((targetCoords.x - baseCoords.x) ** 2)
                              + ((targetCoords.y - baseCoords.z) ** 2)));
}

function matchAndHighlight(str, regex) {
  let isMatched = false;
  const highlighted = str.replace(regex, (m) => {
    isMatched = m.length > 0;
    return `<mark>${m}</mark>`;
  });
  return isMatched ? highlighted : null;
}
