/* eslint-env browser */
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

  let mapWidth = 0;
  let mapHeight = 0;
  let biomesImg;
  let splat3Img;
  let radImg;
  let allPrefabs = [];
  let prefabs = [];

  // //////////////////////////////////////////////////////////////////////
  // update
  // //////////////////////////////////////////////////////////////////////
  update();
  function update() {
    const scale = scaleInput.value;

    mapWidth = Math.max(
      biomesImg ? biomesImg.width : 0,
      splat3Img ? splat3Img.width : 0,
    );
    mapHeight = Math.max(
      biomesImg ? biomesImg.height : 0,
      splat3Img ? splat3Img.height : 0,
    );
    mapCanvas.width = mapWidth * scale;
    mapCanvas.height = mapHeight * scale;

    updatePrafabList();

    const context = mapCanvas.getContext('2d');
    context.scale(scale, scale);
    context.filter = `brightness(${brightnessInput.value}%)`;
    if (biomesImg && showBiomesInput.checked) {
      context.drawImage(biomesImg, 0, 0, mapWidth, mapHeight);
    }
    if (splat3Img && showSplat3Input.checked) {
      context.drawImage(splat3Img, 0, 0, mapWidth, mapHeight);
    }
    if (radImg && showRadInput.checked) {
      context.filter = 'url(#rad_filter)';
      context.imageSmoothingEnabled = false;
      context.drawImage(radImg, 0, 0, mapWidth, mapHeight);
      context.imageSmoothingEnabled = true;
    }
    context.filter = 'none';
    if (showPrefabsInput.checked) {
      drawPrefabs(context);
    }
    console.log('update');
  }

  function drawPrefabs(ctx) {
    const signSize = signSizeInput.value;
    ctx.font = `bold ${signSize}px sans-serif`;
    ctx.lineWidth = Math.round(signSize * 0.08);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'black';

    const offsetX = mapWidth / 2;
    const offsetY = mapHeight / 2;
    prefabs.forEach((prefab) => {
      const x = offsetX + prefab.x;
      // prefab vertical positions are inverted for canvas coodinates
      const y = offsetY - prefab.y;
      ctx.shadowBlur = 20;
      ctx.strokeText('✗', x, y);
      ctx.shadowBlur = 0;
      ctx.fillText('✗', x, y);
      // console.log('Prot %o: %f, %f', prefab, x, y);
    });
  }

  function updatePrafabList() {
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

  // //////////////////////////////////////////////////////////////////////
  // load and update firing
  // //////////////////////////////////////////////////////////////////////
  downloadButton.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = mapCanvas.toDataURL('image/png');
    const filterSuffix = prefabsFilterInput.value ? `-${prefabsFilterInput.value}` : '';
    a.download = `7DtD-renderer${filterSuffix}.png`;
    a.click();
  });
  biomesInput.addEventListener('input', async () => {
    console.log('Load biome');
    const newImage = await loadImageFromInput(biomesInput);
    if (newImage) biomesImg = newImage;
    update();
  });
  splat3Input.addEventListener('input', async () => {
    console.log('Load splat3');
    const newImage = await loadImageFromInput(splat3Input);
    if (newImage) splat3Img = newImage;
    update();
  });
  radInput.addEventListener('input', async () => {
    console.log('Load radiation');
    const newImage = await loadImageFromInput(radInput);
    if (newImage) radImg = newImage;
    update();
  });
  prefabsInput.addEventListener('input', async () => {
    console.log('Load prefabs');
    await loadPrefabsFromInput();
    filterPrefabs();
    update();
  });
  prefabsFilterInput.addEventListener('input', () => {
    console.log('Update prefab list');
    filterPrefabs();
    update();
  });
  [showBiomesInput, showSplat3Input, showRadInput,
    showPrefabsInput, signSizeInput, brightnessInput].forEach((e) => {
    e.addEventListener('input', update);
  });
  // "scale" input event occur frequently because scale range step are small.
  // So change event fires "update" to avoid stuttering.
  scaleInput.addEventListener('change', update);

  // drag and drop
  let isOverNow = false;
  document.body.addEventListener('dragenter', () => {
    isOverNow = true;
  });
  document.body.addEventListener('dragover', (event) => {
    event.preventDefault();
    /* eslint no-param-reassign: off */
    event.dataTransfer.dropEffect = 'copy';
    isOverNow = false;
    document.body.classList.add('dragovered');
  });
  document.body.addEventListener('dragleave', () => {
    if (isOverNow) {
      isOverNow = false;
    } else {
      document.body.classList.remove('dragovered');
    }
  });
  document.body.addEventListener('drop', async (event) => {
    event.preventDefault();
    document.body.classList.remove('dragovered');
    await Promise.all(Array.from(event.dataTransfer.files).map(handleDroppedFiles));
    update();
  });

  // range value display
  Array.from(document.querySelectorAll('[data-source-input')).forEach((display) => {
    const sourceInput = document.querySelector(`#${display.dataset.sourceInput}`);
    display.textContent = sourceInput.value;
    sourceInput.addEventListener('input', () => { display.textContent = sourceInput.value; });
  });

  // cursor position
  mapCanvas.addEventListener('mousemove', (event) => {
    coodWESpan.textContent = -Math.round((0.5 - event.offsetX / mapCanvas.width) * mapWidth);
    coodNSSpan.textContent = Math.round((0.5 - event.offsetY / mapCanvas.height) * mapHeight);
  });
  mapCanvas.addEventListener('mouseout', () => {
    coodWESpan.textContent = '-';
    coodNSSpan.textContent = '-';
  });

  // presets
  Array.from(prefabsFilterPresetsDiv.getElementsByTagName('button')).forEach((button) => {
    button.addEventListener('click', () => {
      prefabsFilterInput.value = button.dataset.filter || button.textContent;
      filterPrefabs();
      update();
    });
  });

  async function handleDroppedFiles(file) {
    if (file.name === 'biomes.png') {
      console.log('Load biome');
      if (file.type !== 'image/png') {
        console.warn('Unexpected biomes.png file type: %s', file.type);
      }
      biomesImg = await loadImage(file);
      biomesInput.value = '';
    } else if (file.name === 'splat3.png') {
      console.log('Load splat3');
      if (file.type !== 'image/png') {
        console.warn('Unexpected splat3.png file type: %s', file.type);
      }
      splat3Img = await loadImage(file);
      splat3Input.value = '';
    } else if (file.name === 'radiation.png') {
      console.log('Load radiation');
      if (file.type !== 'image/png') {
        console.warn('Unexpected splat3.png file type: %s', file.type);
      }
      radImg = await loadImage(file);
      radInput.value = '';
    } else if (file.name === 'prefabs.xml') {
      console.log('Update prefab list');
      if (file.type !== 'text/xml') {
        console.warn('Unexpected prefabs.xml file type: %s', file.type);
      }
      await loadPrefabs(file);
      filterPrefabs();
      splat3Input.value = '';
    } else {
      console.warn('Unknown file: %s, %s', file.name, file.type);
    }
  }

  async function loadImageFromInput(input) {
    if (input.files.length === 0) {
      console.log('No file');
      return null;
    }
    return loadImage(input.files[0]);
  }

  async function loadImage(file) {
    const dataURL = await loadAsDataURL(file);
    return loadImageByDataURL(dataURL);
  }

  async function loadAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  async function loadImageByDataURL(dataURL) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', reject);
      image.src = dataURL;
    });
  }

  async function loadPrefabsFromInput() {
    if (prefabsInput.files.length === 0) {
      console.log('No file');
      allPrefabs = [];
      return;
    }
    await loadPrefabs(prefabsInput.files[0]);
  }

  async function loadPrefabs(file) {
    const xml = await loadAsText(file);
    if (!xml) return;
    const dom = (new DOMParser()).parseFromString(xml, 'text/xml');
    allPrefabs = Array.from(dom.getElementsByTagName('decoration'))
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
    if (!filterString) {
      prefabs = allPrefabs;
    } else {
      prefabs = allPrefabs.filter(p => p.name.includes(filterString));
    }

    prefabs.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
    return prefabs;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
