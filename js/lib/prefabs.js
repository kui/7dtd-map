import prefabBlock from './prefab-block-index';

const prefabBlockIndex = prefabBlock.reduce((o, p) => {
  const blocks = p.blocks.map(b => b.toLowerCase());
  return Object.assign(o, { [p.name]: blocks });
}, {});

export default class Prefabs {
  constructor(window, resultSpan, listDiv) {
    this.window = window;
    this.all = [];
    this.filtered = [];
    this.prefabsFilterString = '';
    this.blocksFilterString = '';
    this.resultSpan = resultSpan;
    this.listDiv = listDiv;
  }

  update() {
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
      li.textContent = `${prefab.name} (${prefab.x}, ${prefab.y})`;
      if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
        const blocksUl = this.window.document.createElement('ul');
        prefab.matchedBlocks.forEach((b) => {
          const blockLi = this.window.document.createElement('li');
          blockLi.textContent = b;
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
    const filter = this.prefabsFilterString.toLowerCase();
    this.filtered = this.all.filter(p => p.name.toLowerCase().includes(filter));
    this.sort();
  }

  setBlocksFilterString(filterString) {
    this.blocksFilterString = filterString.trim();
    this.prefabsFilterString = '';
    const filter = this.blocksFilterString.toLowerCase();
    if (filterString.length <= 1) {
      this.filtered = this.all;
    } else {
      this.filtered = this.all.filter((p) => {
        const allBlocks = prefabBlockIndex[p.name];
        if (!allBlocks) {
          return false;
        }
        const matchedBlocks = allBlocks.filter(b => b.includes(filter));
        if (matchedBlocks.length === 0) {
          return false;
        }
        Object.assign(p, { matchedBlocks });
        return true;
      });
    }
    this.sort();
  }

  async setByFile(file) {
    this.all = await loadByFile(this.window, file);
    applyFilter(this);
  }

  async setByUrl(url) {
    this.all = await loadByUrl(this.window, url);
    applyFilter(this);
  }

  sort() {
    this.filtered.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
  }
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
