/* eslint-env browser */

import Map from './lib/map';

function main() {
  const coodWESpan = document.getElementById('cood_we');
  const coodNSSpan = document.getElementById('cood_ns');
  const downloadButton = document.getElementById('download');
  const showBiomesInput = document.getElementById('show_biomes');
  const biomesInput = document.getElementById('biomes');
  const showSplat3Input = document.getElementById('show_splat3');
  const splat3Input = document.getElementById('splat3');
  const showRadInput = document.getElementById('show_radiation');
  const radInput = document.getElementById('radiation');
  const showPrefabsInput = document.getElementById('show_prefabs');
  const prefabsInput = document.getElementById('prefabs');
  const scaleInput = document.getElementById('scale');
  const signSizeInput = document.getElementById('sign_size');
  const brightnessInput = document.getElementById('brightness');
  const prefabsFilterInput = document.getElementById('prefabs_filter');
  const prefabsFilterPresetsDiv = document.getElementById('prefabs_filter_presets');
  const prefabsNumSpan = document.getElementById('prefabs_num');
  const prefabList = document.getElementById('prefabs_list');
  const mapCanvas = document.getElementById('map');

  const map = new Map(window, mapCanvas);

  let allPrefabs = [];
  let prefabs = [];

  // //////////////////////////////////////////////////////////////////////
  // update
  // //////////////////////////////////////////////////////////////////////
  function updatePrefabList() {
    if (allPrefabs.length === 0) {
      prefabsNumSpan.textContent = 'No prefabs';
    } else if (prefabsFilterInput.value.trim().length === 0) {
      prefabsNumSpan.textContent = 'All prefabs';
    } else {
      prefabsNumSpan.textContent = `Hit ${prefabs.length} prefabs`;
    }
    const ul = document.createElement('ul');
    prefabs.forEach((prefab) => {
      const li = document.createElement('li');
      li.textContent = `${prefab.name} (${prefab.x}, ${prefab.y})`;
      ul.appendChild(li);
    });
    prefabList.replaceChild(ul, prefabList.firstChild);
  }

  // ///////////////////////////////////////////////////////////////
  // Fire some events -> Update models -> render models
  // ///////////////////////////////////////////////////////////////
  biomesInput.addEventListener('input', async () => {
    console.log('Load biome');
    // update models
    map.setBiomes(biomesInput.files[0]);
    // render models
    map.update();
  });
  splat3Input.addEventListener('input', async () => {
    console.log('Load splat3');
    // update models
    map.setSplat3(splat3Input.files[0]);
    // render models
    map.update();
  });
  radInput.addEventListener('input', async () => {
    console.log('Load radiation');
    // update models
    map.setRad(radInput.files[0]);
    // render models
    map.update();
  });
  prefabsInput.addEventListener('input', async () => {
    console.log('Load prefabs');
    // update models
    allPrefabs = await loadPrefabsFromInput();
    prefabs = filterPrefabs();
    map.prefabs = prefabs;
    // render models
    map.update();
    updatePrefabList();
  });
  prefabsFilterInput.addEventListener('input', () => {
    console.log('Update prefab list');
    // update models
    prefabs = filterPrefabs();
    map.prefabs = prefabs;
    // render models
    map.update();
    updatePrefabList();
  });

  map.showSplat3 = showSplat3Input.checked;
  map.showRad = showRadInput.checked;
  map.showPrefabs = showPrefabsInput.checked;
  map.signSize = signSizeInput.value;
  map.brightness = `${brightnessInput.value}%`;
  map.scale = scaleInput.value;
  [showBiomesInput, showSplat3Input, showRadInput, showPrefabsInput,
    signSizeInput, brightnessInput, scaleInput].forEach((e) => {
    e.addEventListener('input', () => {
      map.showBiomes = showBiomesInput.checked;
      map.showSplat3 = showSplat3Input.checked;
      map.showRad = showRadInput.checked;
      map.showPrefabs = showPrefabsInput.checked;
      map.signSize = signSizeInput.value;
      map.brightness = `${brightnessInput.value}%`;
      map.scale = scaleInput.value;
      map.update();
    });
  });

  // drag and drop
  document.addEventListener('dragenter', (event) => {
    if (!event.dataTransfer.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    document.body.classList.add('dragovered');
  });
  document.addEventListener('dragover', (event) => {
    if (!event.dataTransfer.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    /* eslint no-param-reassign: off */
    event.dataTransfer.dropEffect = 'copy';
    document.body.classList.add('dragovered');
  });
  document.addEventListener('dragleave', (event) => {
    // "dragleave" events raise even if the cursor moved on child nodes.
    // To avoid this case, we should confirm cursor positions.
    // Those are zero if the cursor moved out from the browser window.
    if (event.clientX !== 0 || event.clientY !== 0) {
      return;
    }
    event.preventDefault();
    document.body.classList.remove('dragovered');
  });
  document.addEventListener('drop', async (event) => {
    if (!event.dataTransfer.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    document.body.classList.remove('dragovered');
    // update models
    await Promise.all(Array.from(event.dataTransfer.files).map(handleDroppedFiles));
    // render models
    map.update();
    updatePrefabList();
  });

  // presets
  Array.from(prefabsFilterPresetsDiv.getElementsByTagName('button')).forEach((button) => {
    button.addEventListener('click', () => {
      prefabsFilterInput.value = button.dataset.filter || button.textContent;
      // update models
      prefabs = filterPrefabs();
      map.prefabs = prefabs;
      // render models
      map.update();
      updatePrefabList();
    });
  });

  // range value display
  Array.from(document.querySelectorAll('[data-source-input')).forEach((display) => {
    const sourceInput = document.querySelector(`#${display.dataset.sourceInput}`);
    display.textContent = sourceInput.value;
    sourceInput.addEventListener('input', () => { display.textContent = sourceInput.value; });
  });

  // cursor position
  mapCanvas.addEventListener('mousemove', (event) => {
    coodWESpan.textContent = -Math.round((0.5 - event.offsetX / mapCanvas.width) * map.width);
    coodNSSpan.textContent = Math.round((0.5 - event.offsetY / mapCanvas.height) * map.height);
  });
  mapCanvas.addEventListener('mouseout', () => {
    coodWESpan.textContent = '-';
    coodNSSpan.textContent = '-';
  });

  // download
  downloadButton.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = mapCanvas.toDataURL('image/png');
    const filterSuffix = prefabsFilterInput.value ? `-${prefabsFilterInput.value}` : '';
    a.download = `7DtD-renderer${filterSuffix}.png`;
    a.click();
  });

  async function handleDroppedFiles(file) {
    if (file.name === 'biomes.png') {
      console.log('Load biome');
      if (file.type !== 'image/png') {
        console.warn('Unexpected biomes.png file type: %s', file.type);
      }
      await map.setBiomes(file);
      biomesInput.value = '';
    } else if (file.name === 'splat3.png') {
      console.log('Load splat3');
      if (file.type !== 'image/png') {
        console.warn('Unexpected splat3.png file type: %s', file.type);
      }
      await map.setSplat3(file);
      splat3Input.value = '';
    } else if (file.name === 'radiation.png') {
      console.log('Load radiation');
      if (file.type !== 'image/png') {
        console.warn('Unexpected splat3.png file type: %s', file.type);
      }
      await map.setRad(file);
      radInput.value = '';
    } else if (file.name === 'prefabs.xml') {
      console.log('Update prefab list');
      if (file.type !== 'text/xml') {
        console.warn('Unexpected prefabs.xml file type: %s', file.type);
      }
      allPrefabs = await loadPrefabs(file);
      prefabs = filterPrefabs();
      map.prefabs = prefabs;
      prefabsInput.value = '';
    } else {
      console.warn('Unknown file: %s, %s', file.name, file.type);
    }
  }

  async function loadPrefabsFromInput() {
    if (prefabsInput.files.length === 0) {
      console.log('No file');
      return [];
    }
    return loadPrefabs(prefabsInput.files[0]);
  }

  async function loadPrefabs(file) {
    const xml = await loadAsText(file);
    if (!xml) return [];
    const dom = (new DOMParser()).parseFromString(xml, 'text/xml');
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

  async function loadAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsText(file);
    });
  }

  function filterPrefabs() {
    const filterString = prefabsFilterInput.value.trim();
    let newPrefabs;
    if (!filterString) {
      newPrefabs = allPrefabs;
    } else {
      newPrefabs = allPrefabs.filter(p => p.name.includes(filterString));
    }

    newPrefabs.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
    return newPrefabs;
  }

  // init
  map.update();
  updatePrefabList();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
