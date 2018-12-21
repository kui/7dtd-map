/* eslint-env browser */

import { loadBitmapByFile, loadBitmapByUrl } from './lib/bitmap-loader';
import { loadPrefabsXmlByFile, loadPrefabsXmlByUrl } from './lib/prefabs-xml-loader';
//import { loadWaterInfoXmlByFile } from './lib/water-info-xml-loader';
import loadDtmRawByFile from './lib/dtm-loader';

function main() {
  const loadingIndicatorP = document.getElementById('loading_indicator');
  const controllerFieldset = document.getElementById('controller');
  const coodsSpan = document.getElementById('coods');
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
  const blocksFilterInput = document.getElementById('blocks_filter');
  const prefabsResultSpan = document.getElementById('prefabs_num');
  const prefabListDiv = document.getElementById('prefabs_list');
  const mapCanvas = document.getElementById('map');
  const sampleLoadButton = document.getElementById('sample_load');

  const waterMapCanvas = document.getElementById('water-map');

  const mapRendererWorker = new Worker('map-renderer.js');
  const prefabsFilterWorker = new Worker('prefabs-filter.js');

  // init
  const rendererCanvas = mapCanvas.transferControlToOffscreen();
  const waterRendererCanvas = waterMapCanvas.transferControlToOffscreen();
  mapRendererWorker.postMessage({
    canvas: rendererCanvas,
    showBiomes: showBiomesInput.checked,
    showSplat3: showSplat3Input.checked,
    showRad: showRadInput.checked,
    showPrefabs: showPrefabsInput.checked,
    signSize: signSizeInput.value,
    brightness: `${brightnessInput.value}%`,
    scale: scaleInput.value,
    waterCanvas: waterRendererCanvas,
  }, [rendererCanvas, waterRendererCanvas]);

  (async () => {
    const res = await fetch('block-prefab-index.json');
    prefabsFilterWorker.postMessage({ blockPrefabIndex: await res.json() });
  })();
  (async () => {
    const res = await fetch('block-labels.json');
    prefabsFilterWorker.postMessage({ blockLabels: await res.json() });
  })();

  // -------------------------------------------------
  // map update events
  // -------------------------------------------------

  const loadingFiles = new Set();
  let dtmRaw = null;

  // inputs
  biomesInput.addEventListener('input', async () => {
    console.log('Load biome');
    loadingFiles.add('biomes.png');
    const biomesImg = await loadBitmapByFile(window, biomesInput.files[0]);
    loadingFiles.delete('biomes.png');
    if (!biomesImg) return;
    mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
  });
  splat3Input.addEventListener('input', async () => {
    console.log('Load splat3');
    loadingFiles.add('splat3.png');
    const splat3Img = await loadBitmapByFile(window, splat3Input.files[0]);
    loadingFiles.delete('splat3.png');
    if (!splat3Img) return;
    mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
  });
  radInput.addEventListener('input', async () => {
    console.log('Load radiation');
    loadingFiles.add('radiation.png');
    const radImg = await loadRadBitmapByFile(window, radInput.files[0]);
    loadingFiles.delete('radiation.png');
    if (!radImg) return;
    mapRendererWorker.postMessage({ radImg }, [radImg]);
  });
  prefabsInput.addEventListener('input', async () => {
    console.log('Load prefabs');
    loadingFiles.add('prefabs.xml');
    const prefabs = await loadPrefabsXmlByFile(window, prefabsInput.files[0]);
    loadingFiles.delete('prefabs.xml');
    prefabsFilterWorker.postMessage({ all: prefabs });
  });
  ['input', 'focus'].forEach((eventName) => {
    prefabsFilterInput.addEventListener(eventName, async () => {
      prefabsFilterWorker.postMessage({ prefabsFilterString: prefabsFilterInput.value });
    });
    blocksFilterInput.addEventListener(eventName, async () => {
      prefabsFilterWorker.postMessage({ blocksFilterString: blocksFilterInput.value });
    });
  });
  const restInputs = [
    showBiomesInput, showSplat3Input, showRadInput, showPrefabsInput,
    signSizeInput, brightnessInput, scaleInput,
  ];
  restInputs.forEach((e) => {
    e.addEventListener('input', () => {
      mapRendererWorker.postMessage({
        showBiomes: showBiomesInput.checked,
        showSplat3: showSplat3Input.checked,
        showRad: showRadInput.checked,
        showPrefabs: showPrefabsInput.checked,
        signSize: signSizeInput.value,
        brightness: `${brightnessInput.value}%`,
        scale: scaleInput.value,
      });
    });
  });

  // trigger by prefabs update
  prefabsFilterWorker.addEventListener('message', (event) => {
    if (event.data.prefabs) {
      mapRendererWorker.postMessage({ prefabs: event.data.prefabs });
    }
  });

  // drag and drop
  document.addEventListener('drop', async (event) => {
    if (!event.dataTransfer.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    await Promise.all(Array.from(event.dataTransfer.files).map(handleDroppedFiles));
  });

  async function handleDroppedFiles(file) {
    loadingFiles.add(file.name);
    if (file.name === 'biomes.png') {
      const biomesImg = await loadBitmapByFile(window, file);
      mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
      biomesInput.value = '';
    } else if (file.name === 'splat3.png') {
      const splat3Img = await loadBitmapByFile(window, file);
      mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
      splat3Input.value = '';
    } else if (file.name === 'radiation.png') {
      const radImg = await loadRadBitmapByFile(window, file);
      mapRendererWorker.postMessage({ radImg }, [radImg]);
      radInput.value = '';
    } else if (file.name === 'prefabs.xml') {
      const prefabs = await loadPrefabsXmlByFile(window, file);
      prefabsFilterWorker.postMessage({ all: prefabs });
      prefabsInput.value = '';
    } else if (file.name === 'dtm.raw') {
      dtmRaw = await loadDtmRawByFile(window, file);
    // mapRendererWorker.postMessage({ dtm: dtmRaw }, [dtmRaw]);
    // } else if (file.name === 'water_info.xml') {
    //   const waterInfo = await loadWaterInfoXmlByFile(window, file);
    //   mapRendererWorker.postMessage({ waterInfo });
    } else {
      console.warn('Unknown file: %s, %s', file.name, file.type);
    }
    loadingFiles.delete(file.name);
  }

  // flag mark
  mapCanvas.addEventListener('click', async (event) => {
    const markCoords = convertCursorPositionToMapCoords(event);
    prefabsFilterWorker.postMessage({ markCoords });
    mapRendererWorker.postMessage({ markCoords });
  });
  resetFlagButton.addEventListener('click', async () => {
    prefabsFilterWorker.postMessage({ markCoords: null });
    mapRendererWorker.postMessage({ markCoords: null });
  });

  // sample load
  sampleLoadButton.addEventListener('click', () => {
    (async () => {
      loadingFiles.add('biomes.png');
      mapRendererWorker.postMessage({
        biomesImg: await loadBitmapByUrl(window, 'sample_world/biomes.png'),
      });
      loadingFiles.delete('biomes.png');
    })();
    (async () => {
      loadingFiles.add('splat3.png');
      loadingFiles.add('radiation.png');
      const [splat3Img, radImg] = await Promise.all([
        loadBitmapByUrl(window, 'sample_world/splat3.png'),
        loadRadBitmapByUrl(window, 'sample_world/radiation.png'),
      ]);
      mapRendererWorker.postMessage({ splat3Img, radImg }, [splat3Img, radImg]);
      loadingFiles.delete('splat3.png');
      loadingFiles.delete('radiation.png');
    })();
    (async () => {
      loadingFiles.add('prefab.xml');
      const all = await loadPrefabsXmlByUrl(window, 'sample_world/prefabs.xml');
      loadingFiles.delete('prefab.xml');
      prefabsFilterWorker.postMessage({ all });
    })();
  });

  // -------------------------------------------------
  // prefab list updates
  // -------------------------------------------------
  let prefabListUl;
  let restPrefabs;
  let isShowedAllPrefabs = true;
  const renderedPrefabsNum = 10;
  prefabsFilterWorker.addEventListener('message', async (event) => {
    const { prefabs, status } = event.data;
    prefabsResultSpan.innerHTML = status;

    if (!prefabs) {
      return;
    }

    prefabListUl = document.createElement('ul');
    restPrefabs = prefabs;
    prefabListDiv.replaceChild(prefabListUl, prefabListDiv.firstChild);

    // Show a part of result until the scroll bar are shown
    await showHeadOfPrefabList();

    // Shows all results, once scrolled.
    if (isShowedAllPrefabs) {
      isShowedAllPrefabs = false;
      controllerFieldset.addEventListener('scroll', () => {
        isShowedAllPrefabs = true;
        showAllPrefabs();
      }, { once: true });
    }
  });

  async function showHeadOfPrefabList() {
    while (restPrefabs.length !== 0) {
      const scrollBottom = controllerFieldset.offsetHeight + controllerFieldset.scrollTop;
      if (scrollBottom + 100 < controllerFieldset.scrollHeight) {
        return;
      }

      renderTailPrefabs();
      // eslint-disable-next-line no-await-in-loop
      await waitAnimationFrame();
    }
  }

  // Note: showAllPrefabs loop could run in duplicate,
  // if new result come when showAllPrefabs are running
  // We can avoid it by some status check in the `while` loop condition.
  // But it will make the implementation too complex while it is not significant one.
  // So we don't take care it.
  async function showAllPrefabs() {
    while (restPrefabs.length !== 0) {
      renderTailPrefabs();
      // eslint-disable-next-line no-await-in-loop
      await waitAnimationFrame();
    }
  }

  async function waitAnimationFrame() {
    return new Promise(r => requestAnimationFrame(r));
  }

  function renderTailPrefabs() {
    const liCount = prefabListUl.getElementsByTagName('li');
    if (liCount.length >= 20000) {
      restPrefabs = [];
      prefabListUl.appendChild(warnLi('<strong>Abort: too many matching results</strong>'));
      return;
    }

    const [head, tail] = [
      restPrefabs.slice(0, renderedPrefabsNum),
      restPrefabs.slice(renderedPrefabsNum),
    ];

    const df = document.createDocumentFragment();
    head.forEach(p => df.appendChild(prefabLi(p)));
    prefabListUl.appendChild(df);

    restPrefabs = tail;
  }

  function prefabLi(prefab) {
    const li = document.createElement('li');
    li.innerHTML = [
      `<button data-input-for="prefabs_filter" data-input-text="${prefab.name}" title="Filter with this prefab name">▲</button>`,
      `${prefab.dist ? `${formatDist(prefab.dist)},` : ''}`,
      `<a href="prefabs/${prefab.name}.html" target="_blank">${prefab.highlightedName || prefab.name}</a>`,
      `(${prefab.x}, ${prefab.y})`,
    ].join(' ');
    if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
      const blocksUl = document.createElement('ul');
      prefab.matchedBlocks.forEach((block) => {
        const blockLi = document.createElement('li');
        blockLi.innerHTML = [
          `<button data-input-for="blocks_filter" data-input-text="${block.name}" title="Filter with this block name">▲</button>`,
          `${block.count}x`,
          block.highlightedLabel,
          `<small>${block.highlightedName}</small>`,
        ].join(' ');
        blocksUl.appendChild(blockLi);
      });
      li.appendChild(blocksUl);
    }
    return li;
  }

  function warnLi(message) {
    const li = document.createElement('li');
    li.innerHTML = message;
    return li;
  }

  // -------------------------------------------------
  // other model updates
  // -------------------------------------------------

  // auto input button
  controllerFieldset.addEventListener('click', (event) => {
    const button = event.srcElement;
    if (button.dataset.inputFor == null) {
      return;
    }

    const target = document.getElementById(button.dataset.inputFor);
    if (!target) {
      return;
    }

    if (button.dataset.inputText == null) {
      target.value = button.textContent;
    } else {
      target.value = button.dataset.inputText;
    }
    target.dispatchEvent(new Event('input'));
  });

  // Scroll with the mark at the center of the screen
  let markPosition = null;
  let prevCanvasSize = { width: 0, height: 0 };
  mapCanvas.addEventListener('click', (e) => { markPosition = e; });
  resetFlagButton.addEventListener('click', () => { markPosition = null; });
  (new MutationObserver((mutationsList) => {
    const widthMutation = mutationsList.find(m => m.attributeName === 'width');
    if (!widthMutation) return;
    const heightMutation = mutationsList.find(m => m.attributeName === 'height');
    if (!heightMutation) return;
    const newCanvasSize = { width: mapCanvas.width, height: mapCanvas.height };

    if (!markPosition) {
      prevCanvasSize = newCanvasSize;
      return;
    }

    markPosition = {
      offsetX: markPosition.offsetX * newCanvasSize.width / prevCanvasSize.width,
      offsetY: markPosition.offsetY * newCanvasSize.height / prevCanvasSize.height,
    };

    const canvasRect = mapCanvas.getBoundingClientRect();
    const rootRect = document.documentElement.getBoundingClientRect();

    const absCanvasPosition = {
      left: canvasRect.left - rootRect.left,
      top: canvasRect.top - rootRect.top,
    };

    const absMarkPosition = {
      left: markPosition.offsetX + absCanvasPosition.left,
      top: markPosition.offsetY + absCanvasPosition.top,
    };

    // frameSize is based by map display area.
    // So, the width is not innerWidth.
    const frameSize = {
      width: controllerFieldset.offsetLeft,
      height: window.innerHeight,
    };

    const scrollArg = {
      left: absMarkPosition.left - frameSize.width / 2,
      top: absMarkPosition.top - frameSize.height / 2,
    };
    window.scrollTo(scrollArg);

    prevCanvasSize = newCanvasSize;
  })).observe(mapCanvas, { attributes: true });

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
    const { x, z } = convertCursorPositionToMapCoords(event);
    if (dtmRaw) {
      const e = getElevation(x, z);
      coodsSpan.textContent = `E/W: ${x}, N/S: ${z}, Elev: ${e}`;
    } else {
      coodsSpan.textContent = `E/W: ${x}, N/S: ${z}`;
    }
  });
  mapCanvas.addEventListener('mouseout', () => {
    coodsSpan.textContent = 'E/W: -, N/S: -';
  });

  // download
  downloadButton.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = mapCanvas.toDataURL('image/png');
    a.download = '7DtD-renderer.png';
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

  function updateLoadingIndicator() {
    if (loadingFiles.size === 0) {
      loadingIndicatorP.textContent = '-';
    } else {
      loadingIndicatorP.textContent = `Loading: ${Array.from(loadingFiles).join(', ')}`;
    }
    requestAnimationFrame(updateLoadingIndicator);
  }
  updateLoadingIndicator();

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
    return createImageBitmap(canvas);
  }

  function convertCursorPositionToMapCoords({ offsetX, offsetY }) {
    return {
      x: -Math.round((0.5 - offsetX / mapCanvas.width) * mapSizes.width),
      z: Math.round((0.5 - offsetY / mapCanvas.height) * mapSizes.height),
    };
  }

  function getElevation(x, z) {
    const nx = x + mapSizes.width / 2;
    const nz = -1 * z + mapSizes.height / 2;
    const i = nx + mapSizes.width * nz;
    console.log({ nx, nz, i });
    // eslint-disable-next-line no-bitwise
    return Buffer.from(dtmRaw).readInt16LE(i) & 0b11111111;
  }

  function formatDist(dist) {
    if (dist < 1000) {
      return `${dist}m`;
    }
    return `${(dist / 1000).toFixed(2)}km`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
