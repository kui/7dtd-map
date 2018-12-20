/* eslint-env browser */

import { loadBitmapByFile, loadBitmapByUrl } from './lib/bitmap-loader';
import { loadPrefabsXmlByFile, loadPrefabsXmlByUrl } from './lib/prefabs-xml-loader';

function main() {
  const controllerFieldset = document.getElementById('controller');
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
  const prefabsFilterWorker = new Worker('prefabs-filter.js');

  // init
  const rendererCanvas = mapCanvas.transferControlToOffscreen();
  mapRendererWorker.postMessage({
    canvas: rendererCanvas,
    showBiomes: showBiomesInput.checked,
    showSplat3: showSplat3Input.checked,
    showRad: showRadInput.checked,
    showPrefabs: showPrefabsInput.checked,
    signSize: signSizeInput.value,
    brightness: `${brightnessInput.value}%`,
    scale: scaleInput.value,
  }, [rendererCanvas]);

  (async () => {
    const m = await import(/* webpackChunkName: "block-prefab-index" */ './lib/block-prefab-index');
    prefabsFilterWorker.postMessage({ blockPrefabIndex: m.default });
  })();
  (async () => {
    const m = await import(/* webpackChunkName: "block-labels" */ './lib/block-labels');
    prefabsFilterWorker.postMessage({ blockLabels: m.default });
  })();

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
    const prefabs = await loadPrefabsXmlByFile(window, prefabsInput.files[0]);
    prefabsFilterWorker.postMessage({ all: prefabs });
  });
  ['input', 'focus'].forEach((eventName) => {
    prefabsFilterInput.addEventListener(eventName, async () => {
      console.log('Update prefab list');
      prefabsFilterWorker.postMessage({ prefabsFilterString: prefabsFilterInput.value });
    });
    blocksFilterInput.addEventListener(eventName, async () => {
      console.log('Update prefab list');
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
      const [biomesImg, splat3Img, radImg] = await Promise.all([
        loadBitmapByUrl(window, 'sample_world/biomes.png'),
        loadBitmapByUrl(window, 'sample_world/splat3.png'),
        loadRadBitmapByUrl(window, 'sample_world/radiation.png'),
      ]);
      mapRendererWorker.postMessage(
        { biomesImg, splat3Img, radImg },
        [biomesImg, splat3Img, radImg],
      );
    })();
    (async () => {
      const all = await loadPrefabsXmlByUrl(window, 'sample_world/prefabs.xml');
      prefabsFilterWorker.postMessage({ all });
    })();
  });

  // -------------------------------------------------
  // prefab list updates
  // -------------------------------------------------
  let prefabListUl;
  let restPrefabs;
  const renderedPrefabsNum = 10;
  prefabsFilterWorker.addEventListener('message', (event) => {
    console.log(event.data);
    const { prefabs, status } = event.data;
    prefabsResultSpan.innerHTML = status;

    if (!prefabs) {
      return;
    }

    prefabListUl = document.createElement('ul');
    restPrefabs = prefabs;
    prefabListDiv.replaceChild(prefabListUl, prefabListDiv.firstChild);
    requestAnimationFrame(renderTailPrefabs);
  });

  controllerFieldset.addEventListener('scroll', () => {
    renderTailPrefabs();
  }, { passive: true });

  function renderTailPrefabs() {
    if (restPrefabs.length === 0) {
      return;
    }

    const scrollBottom = controllerFieldset.offsetHeight + controllerFieldset.scrollTop;
    if (scrollBottom + 100 < controllerFieldset.scrollHeight) {
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

    requestAnimationFrame(renderTailPrefabs);
  }

  function prefabLi(prefab) {
    const li = document.createElement('li');
    li.innerHTML = `
      ${prefab.dist ? `${formatDist(prefab.dist)}, ` : ''}
      <a href="prefabs/${prefab.name}.html" target="_blank">
        ${prefab.highlightedName || prefab.name}
      </a>
      (${prefab.x}, ${prefab.y})
    `;
    if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
      const blocksUl = document.createElement('ul');
      prefab.matchedBlocks.forEach((block) => {
        const blockLi = document.createElement('li');
        blockLi.innerHTML = `${block.count}x ${block.highlightedLabel} <small>${block.highlightedName}</small>`;
        blocksUl.appendChild(blockLi);
      });
      li.appendChild(blocksUl);
    }
    return li;
  }

  // -------------------------------------------------
  // other model updates
  // -------------------------------------------------

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
      const prefabs = await loadPrefabsXmlByFile(window, file);
      prefabsFilterWorker.postMessage({ all: prefabs });
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
    return createImageBitmap(canvas);
  }

  function convertCursorPositionToMapCoords({ offsetX, offsetY }) {
    return {
      x: -Math.round((0.5 - offsetX / mapCanvas.width) * mapSizes.width),
      y: Math.round((0.5 - offsetY / mapCanvas.height) * mapSizes.height),
    };
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
