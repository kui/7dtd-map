import memoize from 'lodash/memoize';
import prefabBlock from './prefab-block-index';
import blockLabels from './block-labels';

const prefabBlockIndex = prefabBlock.reduce((o, p) => Object.assign(o, { [p.name]: p.blocks }), {});

export default class Prefabs {
  constructor(window, resultSpan, listDiv) {
    this.window = window;
    this.all = [];
    this.filtered = [];
    this.prefabsFilterString = '';
    this.blocksFilterString = '';
    this.resultSpan = resultSpan;
    this.listDiv = listDiv;
    this.markCoords = null;
  }

  update() {
    updateDist(this);
    this.sort();

    if (this.all.length === 0) {
      this.resultSpan.textContent = 'No prefabs';
    } else if (this.filtered.length === this.all.length) {
      this.resultSpan.textContent = 'All prefabs';
    } else {
      this.resultSpan.textContent = `Hit ${this.filtered.length} prefabs`;
    }
    const ul = this.window.document.createElement('ul');
    this.filtered.forEach((prefab) => {
      const li = this.window.document.createElement('li');
      const name = `<a href="prefabs/${prefab.name}.html" target="_blank">${prefab.highlightedName || prefab.name}</a>`;
      if (prefab.dist) {
        li.innerHTML = `${formatDist(prefab.dist)}, ${name} (${prefab.x}, ${prefab.y})`;
      } else {
        li.innerHTML = `${name} (${prefab.x}, ${prefab.y})`;
      }
      if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
        const blocksUl = this.window.document.createElement('ul');
        prefab.matchedBlocks.forEach((b) => {
          const blockLi = this.window.document.createElement('li');
          blockLi.innerHTML = b;
          blocksUl.appendChild(blockLi);
        });
        li.appendChild(blocksUl);
      }
      ul.appendChild(li);
    });
    this.listDiv.replaceChild(ul, this.listDiv.firstChild);
  }

  setPrefabsFilterString(filterString) {
    this.prefabsFilterString = filterString.trim();
    this.blocksFilterString = '';
    if (this.prefabsFilterString.length <= 1) {
      this.filtered = this.all;
    } else {
      const pattern = new RegExp(this.prefabsFilterString, 'i');
      this.filtered = this.all
        .reduce((arr, prefab) => {
          const result = matchAndHighlight(prefab.name, pattern);
          if (result) {
            return arr.concat(Object.assign({}, prefab, { highlightedName: result }));
          }
          return arr;
        }, []);
    }
  }

  setBlocksFilterString(filterString) {
    this.blocksFilterString = filterString.trim();
    this.prefabsFilterString = '';
    if (filterString.length <= 1) {
      this.filtered = this.all;
    } else {
      const matchBlocksWithCache = memoize(matchBlocks);
      this.filtered = this.all.reduce((matchedPrefabs, prefab) => {
        const matchedBlocks = matchBlocksWithCache(prefab.name, this);
        if (matchedBlocks.length === 0) {
          return matchedPrefabs;
        }
        return matchedPrefabs.concat(Object.assign({}, prefab, { matchedBlocks }));
      }, []);
    }
  }

  async setByFile(file) {
    this.all = await loadByFile(this.window, file);
    applyFilter(this);
  }

  async setByUrl(url) {
    this.all = await loadByUrl(this.window, url);
    applyFilter(this);
  }

  async setMarkCoords(coords) {
    this.markCoords = coords;
  }

  sort() {
    if (this.markCoords) {
      this.filtered.sort((a, b) => {
        if (a.dist > b.dist) return 1;
        if (a.dist < b.dist) return -1;
        return 0;
      });
    } else {
      this.filtered.sort((a, b) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
    }
  }
}

function matchBlocks(prefabName, prefabs) {
  const containedBlocks = prefabBlockIndex[prefabName];
  if (!containedBlocks || containedBlocks.length === 0) {
    console.log('Unknown prefab name: %s', prefabName);
    return [];
  }
  const pattern = new RegExp(prefabs.blocksFilterString, 'i');
  const matchedBlocks = containedBlocks
    .reduce((arr, block) => {
      const blockName = blockLabels[block] || block;
      const result = matchAndHighlight(blockName, pattern);
      if (result) {
        return arr.concat(result);
      }
      return arr;
    }, []);
  if (matchedBlocks.length === 0) {
    return [];
  }
  return matchedBlocks;
}

function updateDist(map) {
  if (map.markCoords) {
    map.filtered.forEach((p) => {
      const dist = calcDist(p, map.markCoords);
      Object.assign(p, { dist });
    });
  } else {
    map.filtered.forEach((p) => {
      Object.assign(p, { dist: null });
    });
  }
}

function formatDist(dist) {
  if (dist < 1000) {
    return `${dist}m`;
  }
  return `${(dist / 1000).toFixed(2)}km`;
}

function calcDist(targetCoords, baseCoords) {
  return Math.round(Math.sqrt(((targetCoords.x - baseCoords.x) ** 2)
                              + ((targetCoords.y - baseCoords.y) ** 2)));
}

function matchAndHighlight(str, regex) {
  let isMatched = false;
  const highlighted = str.replace(regex, (m) => {
    isMatched = true;
    return `<mark>${m}</mark>`;
  });
  return isMatched ? highlighted : null;
}

function applyFilter(prefabs) {
  if (prefabs.blocksFilterString.length > 0) {
    prefabs.setBlocksFilterString(prefabs.blocksFilterString);
  } else {
    prefabs.setPrefabsFilterString(prefabs.prefabsFilterString);
  }
}

async function loadByUrl(window, url) {
  if (!url) return [];
  const response = await window.fetch(url);
  const xml = await response.text();
  return parse(window, xml);
}

async function loadByFile(window, file) {
  if (!file) return [];
  const xml = await loadAsText(window, file);
  return parse(window, xml);
}

function parse(window, xml) {
  const dom = (new window.DOMParser()).parseFromString(xml, 'text/xml');
  return Array.from(dom.getElementsByTagName('decoration'))
    .map((e) => {
      const position = e.getAttribute('position').split(',');
      return {
        name: e.getAttribute('name'),
        x: parseInt(position[0], 10),
        y: parseInt(position[2], 10),
      };
    });
}

async function loadAsText(window, file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsText(file);
  });
}
