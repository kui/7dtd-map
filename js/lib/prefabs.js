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
    this.filtered = this.all.filter(p => hasBlockString(p.name, filter));
    this.sort();
  }

  async setFile(file) {
    this.all = await loadPrefabs(this.window, file);
    if (this.blocksFilterString.length > 0) {
      this.setBlocksFilterString(this.blocksFilterString);
    } else {
      this.setPrefabsFilterString(this.prefabsFilterString);
    }
  }

  sort() {
    this.filtered.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
  }
}

function hasBlockString(prefabName, blockString) {
  const blocks = prefabBlockIndex[prefabName];
  if (!blocks) {
    return false;
  }
  return blocks.some(b => b.includes(blockString));
}

async function loadPrefabs(window, file) {
  if (!file) return [];
  const xml = await loadAsText(window, file);
  if (!xml) return [];
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
