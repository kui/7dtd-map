import flatMap from 'lodash/flatMap';

export default class Prefabs {
  constructor(window) {
    this.window = window;
    this.all = [];
    this.filtered = [];
    this.filter = null;
    this.prefabsFilterString = '';
    this.blocksFilterString = '';
    this.markCoords = null;
    this.blockPrefabIndex = {};
    this.blockLabels = {};
    this.updateListeners = [];
  }

  update() {
    applyFilter(this);
    updateDist(this);
    sort(this);
    this.updateListeners.forEach(f => f());
  }

  set prefabsFilterString(filterString) {
    const s = filterString.trim();
    if (s.length === 0) {
      this.filter = null;
    } else {
      this.filter = {
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
  return flatMap(prefabs.all, (prefab) => {
    const result = matchAndHighlight(prefab.name, pattern);
    if (result) {
      // Clone and add a new field;
      return Object.assign({}, prefab, { highlightedName: result });
    }
    return [];
  });
}

function filterByBlocks(prefabs, pattern) {
  const { all: allPrefabs, blockPrefabIndex, blockLabels } = prefabs;
  const matchedBlocks = matchBlocks(pattern, blockPrefabIndex, blockLabels);
  console.log('%d matched blocks: %o', matchedBlocks.length, matchedBlocks);
  if (Object.keys(blockPrefabIndex).length === matchBlocks.length) {
    console.warn('Abort block filter: all blocks are matched: filter=%s', pattern);
    return allPrefabs;
  }
  if (matchedBlocks.length === 0) {
    return [];
  }

  const matchedPrefabBlocks = matchPrefabTypes(matchedBlocks);
  if (Object.keys(matchedPrefabBlocks).length === 0) {
    return [];
  }

  return flatMap(allPrefabs, (prefab) => {
    const blocks = matchedPrefabBlocks[prefab.name];
    if (!blocks) {
      return [];
    }
    // Clone and add a new field;
    return Object.assign({}, prefab, { matchedBlocks: blocks });
  });
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
                              + ((targetCoords.y - baseCoords.y) ** 2)));
}

function matchAndHighlight(str, regex) {
  let isMatched = false;
  const highlighted = str.replace(regex, (m) => {
    isMatched = m.length > 0;
    return `<mark>${m}</mark>`;
  });
  return isMatched ? highlighted : null;
}
