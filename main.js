/* eslint-env browser */
function main() {
  const showBiomesInput = document.getElementById('show_biomes');
  const biomesInput = document.getElementById('biomes');
  const showSplat3Input = document.getElementById('show_splat3');
  const splat3Input = document.getElementById('splat3');
  const showPrefabsInput = document.getElementById('show_prefabs');
  const prefabsInput = document.getElementById('prefabs');
  const scaleInput = document.getElementById('scale');
  const scaleDisplaySpan = document.getElementById('scale_display');
  const signSizeInput = document.getElementById('sign_size');
  const signSizeDisplaySpan = document.getElementById('sign_size_display');
  const prefabsFilterInput = document.getElementById('prefabs_filter');
  const prefabsNumSpan = document.getElementById('prefabs_num');
  const prefabList = document.getElementById('prefabs_list');
  const mapCanvas = document.getElementById('map');

  let mapWidth = 0;
  let mapHeight = 0;
  let biomeImg;
  let splat3Img;
  let allPrefabs = [];
  let prefabs = [];

  // //////////////////////////////////////////////////////////////////////
  // update
  // //////////////////////////////////////////////////////////////////////
  update();
  function update() {
    const scale = scaleInput.value;
    scaleDisplaySpan.textContent = scale;
    signSizeDisplaySpan.textContent = signSizeInput.value;

    mapWidth = Math.max(
      biomeImg ? biomeImg.width : 0,
      splat3Img ? splat3Img.width : 0,
    );
    mapHeight = Math.max(
      biomeImg ? biomeImg.height : 0,
      splat3Img ? splat3Img.height : 0,
    );
    mapCanvas.width = mapWidth * scale;
    mapCanvas.height = mapHeight * scale;

    updatePrafabList();

    const context = mapCanvas.getContext('2d');
    context.scale(scale, scale);
    if (biomeImg && showBiomesInput.checked) {
      context.drawImage(biomeImg, 0, 0);
    }
    if (splat3Img && showSplat3Input.checked) {
      context.drawImage(splat3Img, 0, 0);
    }
    if (showPrefabsInput.checked) {
      drawPrefabs(context);
    }
    console.log('update');
  }

  function drawPrefabs(ctx) {
    const signSize = signSizeInput.value;
    ctx.font = `bold ${signSize}px sans-serif`;
    ctx.lineWidth = 7;
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
      ctx.shadowBlur = 0;
      ctx.strokeText('✗', x, y);
      ctx.shadowBlur = 20;
      ctx.fillText('✗', x, y);
      // console.log('Prot %o: %f, %f', prefab, x, y);
    });
  }

  function updatePrafabList() {
    if (prefabsFilterInput.value.trim().length === 0) {
      prefabsNumSpan.textContent = 'All prefabs';
    } else {
      prefabsNumSpan.textContent = `Hit ${prefabs.length} prefabs`;
    }
    const ul = document.createElement('ul');
    prefabs.forEach((prefab) => {
      const li = document.createElement('li');
      li.textContent = prefab.name;
      li.title = `position: ${prefab.x}, ${prefab.y}`;
      ul.appendChild(li);
    });
    prefabList.replaceChild(ul, prefabList.firstChild);
  }

  // //////////////////////////////////////////////////////////////////////
  // load and update firing
  // //////////////////////////////////////////////////////////////////////
  biomesInput.addEventListener('input', async () => {
    console.log('Load biome');
    biomeImg = await loadAsImage(biomesInput);
    update();
  });
  splat3Input.addEventListener('input', async () => {
    console.log('Load splat3');
    splat3Img = await loadAsImage(splat3Input);
    update();
  });
  prefabsInput.addEventListener('input', async () => {
    console.log('Load prefabs');
    await loadPrefabs();
    filterPrefabs();
    update();
  });
  prefabsFilterInput.addEventListener('input', () => {
    console.log('Update prefab list');
    filterPrefabs();
    update();
  });
  scaleInput.addEventListener('input', update);
  [showBiomesInput, showSplat3Input, showPrefabsInput, signSizeInput,
  ].forEach((e) => {
    e.addEventListener('input', update);
  });

  async function loadAsImage(input) {
    if (input.files.length === 0) {
      console.log('No file');
      return null;
    }
    const dataURL = await loadAsDataURL(input);
    return loadDataURL(dataURL);
  }

  async function loadAsDataURL(input) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(input.files[0]);
    });
  }

  async function loadDataURL(dataURL) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', reject);
      image.src = dataURL;
    });
  }

  async function loadPrefabs() {
    if (prefabsInput.files.length === 0) {
      console.log('No file');
      allPrefabs = [];
      return;
    }
    const xml = await loadAsText(prefabsInput);
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

  async function loadAsText(input) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsText(input.files[0]);
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
