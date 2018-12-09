/* eslint-env browser */

import { loadBitmapByFile, loadBitmapByUrl } from './lib/bitmap-loader';
import Prefabs from './lib/prefabs';

function main() {
  const coodWESpan = document.getElementById('cood_we');
  const coodNSSpan = document.getElementById('cood_ns');
  const downloadButton = document.getElementById('download');
  const resetFlagButton = document.getElementById('reset_flag');
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
  const blocksFilterInput = document.getElementById('blocks_filter');
  const blocksFilterPresetsDiv = document.getElementById('blocks_filter_presets');
  const prefabsResultSpan = document.getElementById('prefabs_num');
  const prefabListDiv = document.getElementById('prefabs_list');
  const mapCanvas = document.getElementById('map');
  const sampleLoadButton = document.getElementById('sample_load');

  const mapRendererWorker = new Worker('map-renderer.js');
  const prefabs = new Prefabs(window, prefabsResultSpan, prefabListDiv);

  // init
  const rendererCanvas = mapCanvas.transferControlToOffscreen();
  mapRendererWorker.postMessage({
    canvas: rendererCanvas,
    showSplat3: showSplat3Input.checked,
    showRad: showRadInput.checked,
    showPrefabs: showPrefabsInput.checked,
    signSize: signSizeInput.value,
    brightness: `${brightnessInput.value}%`,
    scale: scaleInput.value,
  }, [rendererCanvas]);

  // -------------------------------------------------
  // map update events
  // -------------------------------------------------

  // inputs
  biomesInput.addEventListener('input', async () => {
    console.log('Load biome');
    const biomesImg = await loadBitmapByFile(window, biomesInput.files[0]);
    if (!biomesImg) return;
    mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
  });
  splat3Input.addEventListener('input', async () => {
    console.log('Load splat3');
    const splat3Img = await loadBitmapByFile(window, splat3Input.files[0]);
    if (!splat3Img) return;
    mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
  });
  radInput.addEventListener('input', async () => {
    console.log('Load radiation');
    const radImg = await loadRadBitmapByFile(window, radInput.files[0]);
    if (!radImg) return;
    mapRendererWorker.postMessage({ radImg }, [radImg]);
  });
  prefabsInput.addEventListener('input', async () => {
    console.log('Load prefabs');
    await prefabs.setByFile(prefabsInput.files[0]);
    mapRendererWorker.postMessage({ prefabs: prefabs.filtered });
    prefabs.update();
  });
  ['input', 'focus'].forEach((eventName) => {
    prefabsFilterInput.addEventListener(eventName, () => {
      console.log('Update prefab list');
      prefabs.setPrefabsFilterString(prefabsFilterInput.value);
      mapRendererWorker.postMessage({ prefabs: prefabs.filtered });
      prefabs.update();
    });
    blocksFilterInput.addEventListener(eventName, () => {
      console.log('Update prefab list');
      prefabs.setBlocksFilterString(blocksFilterInput.value);
      mapRendererWorker.postMessage({ prefabs: prefabs.filtered });
      prefabs.update();
    });
  });
  [showBiomesInput, showSplat3Input, showRadInput, showPrefabsInput,
    signSizeInput, brightnessInput, scaleInput].forEach((e) => {
    e.addEventListener('input', () => {
      mapRendererWorker.postMessage({
        showSplat3: showSplat3Input.checked,
        showRad: showRadInput.checked,
        showPrefabs: showPrefabsInput.checked,
        signSize: signSizeInput.value,
        brightness: `${brightnessInput.value}%`,
        scale: scaleInput.value,
      });
    });
  });

  // drag and drop
  document.addEventListener('drop', async (event) => {
    if (!event.dataTransfer.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    await Promise.all(Array.from(event.dataTransfer.files).map(handleDroppedFiles));
    prefabs.update();
  });

  // prefab presets
  Array.from(prefabsFilterPresetsDiv.getElementsByTagName('button')).forEach((button) => {
    button.addEventListener('click', () => {
      prefabsFilterInput.value = button.dataset.filter || button.textContent;
      prefabsFilterInput.dispatchEvent(new Event('input'));
    });
  });
  // block presets
  Array.from(blocksFilterPresetsDiv.getElementsByTagName('button')).forEach((button) => {
    button.addEventListener('click', () => {
      blocksFilterInput.value = button.dataset.filter || button.textContent;
      blocksFilterInput.dispatchEvent(new Event('input'));
    });
  });

  // flag mark
  mapCanvas.addEventListener('click', async (event) => {
    const markCoords = convertCursorPositionToMapCoords(event);
    mapRendererWorker.postMessage({ markCoords });
    prefabs.setMarkCoords(markCoords);
    prefabs.update();
  });
  resetFlagButton.addEventListener('click', async () => {
    mapRendererWorker.postMessage({ markCoords: null });
    prefabs.setMarkCoords(null);
    prefabs.update();
  });

  // sample load
  sampleLoadButton.addEventListener('click', () => {
    Promise.all([
      loadBitmapByUrl(window, 'sample_world/biomes.png'),
      loadBitmapByUrl(window, 'sample_world/splat3.png'),
      loadRadBitmapByUrl(window, 'sample_world/radiation.png'),
    ]).then(([biomesImg, splat3Img, radImg]) => {
      mapRendererWorker.postMessage(
        { biomesImg, splat3Img, radImg },
        [biomesImg, splat3Img, radImg],
      );
    });
    prefabs
      .setByUrl('sample_world/prefabs.xml')
      .then(() => {
        mapRendererWorker.postMessage({ prefabs: prefabs.filtered });
        prefabs.update();
      });
  });

  // -------------------------------------------------
  // other model updates
  // -------------------------------------------------

  // range value display
  Array.from(document.querySelectorAll('[data-source-input')).forEach((display) => {
    const sourceInput = document.querySelector(`#${display.dataset.sourceInput}`);
    display.textContent = sourceInput.value;
    sourceInput.addEventListener('input', () => { display.textContent = sourceInput.value; });
  });

  // cursor position
  let mapSizes = { width: 0, height: 0 };
  mapRendererWorker.addEventListener('message', (event) => {
    if (event.data.mapSizes) {
      ({ mapSizes } = event.data);
    }
  });
  mapCanvas.addEventListener('mousemove', (event) => {
    const { x, y } = convertCursorPositionToMapCoords(event);
    coodWESpan.textContent = x;
    coodNSSpan.textContent = y;
  });
  mapCanvas.addEventListener('mouseout', () => {
    coodWESpan.textContent = '-';
    coodNSSpan.textContent = '-';
  });

  // download
  downloadButton.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = mapCanvas.toDataURL('image/png');
    let filterString;
    if (prefabs.prefabsFilterString.length !== 0) {
      filterString = prefabs.prefabsFilterString;
    } else if (prefabs.blocksFilterString.length !== 0) {
      filterString = prefabs.blocksFilterString;
    }
    const filterSuffix = filterString ? `-${filterString}` : '';
    a.download = `7DtD-renderer${filterSuffix}.png`;
    a.click();
  });

  // -------------------------------------------------
  // style handlers
  // -------------------------------------------------

  // filter input appearance
  ['input', 'focus'].forEach((eventName) => {
    prefabsFilterInput.addEventListener(eventName, () => {
      document.body.classList.remove('disable-prefabs-filter');
      document.body.classList.add('disable-blocks-filter');
    });
    blocksFilterInput.addEventListener(eventName, () => {
      document.body.classList.remove('disable-blocks-filter');
      document.body.classList.add('disable-prefabs-filter');
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
  });

  // -------------------------------------------------
  // helper methods
  // -------------------------------------------------

  async function handleDroppedFiles(file) {
    if (file.name === 'biomes.png') {
      console.log('Load biome');
      const biomesImg = await loadBitmapByFile(window, file);
      mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
      biomesInput.value = '';
    } else if (file.name === 'splat3.png') {
      console.log('Load splat3');
      const splat3Img = await loadBitmapByFile(window, file);
      mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
      splat3Input.value = '';
    } else if (file.name === 'radiation.png') {
      console.log('Load radiation');
      const radImg = await loadRadBitmapByFile(window, file);
      mapRendererWorker.postMessage({ radImg }, [radImg]);
      radInput.value = '';
    } else if (file.name === 'prefabs.xml') {
      console.log('Update prefab list');
      await prefabs.setByFile(file);
      mapRendererWorker.postMessage({ prefabs: prefabs.filtered });
      prefabsInput.value = '';
    } else {
      console.warn('Unknown file: %s, %s', file.name, file.type);
    }
  }

  async function loadRadBitmapByFile(window, file) {
    const orig = await loadBitmapByFile(window, file);
    return filterRad(window, orig);
  }

  async function loadRadBitmapByUrl(window, url) {
    const orig = await loadBitmapByUrl(window, url);
    return filterRad(window, orig);
  }

  async function filterRad(window, orig) {
    // We cannot use OffscreenCanvas with url() filter.
    // So, instead of it, un-rendering canvas element is used.
    const canvas = window.document.createElement('canvas');
    canvas.width = orig.width;
    canvas.height = orig.height;
    const context = canvas.getContext('2d');
    context.filter = 'url("#rad_filter")';
    context.drawImage(orig, 0, 0);
    return window.createImageBitmap(canvas);
  }

  function convertCursorPositionToMapCoords({ offsetX, offsetY }) {
    return {
      x: -Math.round((0.5 - offsetX / mapCanvas.width) * mapSizes.width),
      y: Math.round((0.5 - offsetY / mapCanvas.height) * mapSizes.height),
    };
  }

  // init
  prefabs.update();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
