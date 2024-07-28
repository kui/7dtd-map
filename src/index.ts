import { ImageBitmapLoader } from "./lib/bitmap-loader";
import * as copyButton from "./lib/copy-button";
import * as presetButton from "./lib/preset-button";
import * as dialogButtons from "./lib/dialog-buttons";
// import { MapSelector } from "./index/map-selector";
// import { MapStorage } from "./lib/map-storage";
import { component, downloadCanvasPng, fetchJson, humanreadableDistance, printError, basename } from "./lib/utils";
import { DtmHandler } from "./index/dtm-handler";
import { PrefabsHandler } from "./index/prefabs-handler";
import { DelayedRenderer } from "./lib/delayed-renderer";
import { CursorCoodsHandler } from "./index/cursor-coods-handler";
import { MarkerHandler } from "./index/marker-handler";
import { FileHandler } from "./index/file-handler";
import { MapCanvasHandler } from "./index/map-canvas-handler";
import { DndHandler } from "./index/dnd-handler";
import { LoadingHandler } from "./index/loading-handler";
import { TerrainViewer } from "./index/terrain-viewer";
import * as syncOutput from "./lib/sync-output";
import { LabelHandler } from "./lib/label-handler";
import type * as mapRenderer from "./worker/map-renderer";

function main() {
  ////////////////////////////////////////////////////////////////////
  // Setup view components with simple logic
  ////////////////////////////////////////////////////////////////////

  presetButton.init();
  copyButton.init();
  syncOutput.init();
  dialogButtons.init();
  initSaveDialog();
  initLoadDialog();

  component("download").addEventListener("click", () => {
    const mapName = component("map_name", HTMLInputElement).value || "7dtd-map";
    downloadCanvasPng(`${mapName}.png`, component("map", HTMLCanvasElement));
  });

  updateMapRightMargin();
  window.addEventListener("resize", updateMapRightMargin);

  renderBundledWorldList().catch(printError);

  const loadMapName = component("load_map_name", HTMLSelectElement);
  loadMapName.addEventListener("change", () => {
    if (loadMapName.value === "") return;
    const dialog = loadMapName.closest("dialog");
    if (!(dialog instanceof HTMLDialogElement)) throw Error(`Unexpected state`);
    dialog.close(loadMapName.value);
  });

  const loadingHandler = new LoadingHandler({
    indicator: component("loading_indicator"),
    disableTargets() {
      return [
        component("files", HTMLInputElement),
        component("show_save_prompt", HTMLButtonElement),
        component("show_load_prompt", HTMLButtonElement),
        component("map_name", HTMLInputElement),
        component("terrain_viewer_show", HTMLButtonElement),
        ...document.querySelectorAll<HTMLButtonElement>("button[data-world-dir]"),
      ];
    },
  });

  ////////////////////////////////////////////////////
  // Setup view components for map rendering
  ////////////////////////////////////////////////////

  const mapCanvasHandler = new MapCanvasHandler(
    {
      canvas: component("map", HTMLCanvasElement),
      biomesAlpha: component("biomes_alpha", HTMLInputElement),
      splat3Alpha: component("splat3_alpha", HTMLInputElement),
      splat4Alpha: component("splat4_alpha", HTMLInputElement),
      radAlpha: component("rad_alpha", HTMLInputElement),
      signSize: component("sign_size", HTMLInputElement),
      signAlpha: component("sign_alpha", HTMLInputElement),
      brightness: component("brightness", HTMLInputElement),
      scale: component("scale", HTMLInputElement),
    },
    new Worker("worker/map-renderer.js"),
  );

  const terrainViewer = new TerrainViewer({
    output: component("terrain_viewer", HTMLCanvasElement),
    texture: component("map", HTMLCanvasElement),
    show: component("terrain_viewer_show", HTMLButtonElement),
    close: component("terrain_viewer_close", HTMLButtonElement),
    hud: component("terrarian_viewer_hud"),
  });

  mapCanvasHandler.addMapSizeListener((size) => {
    if (terrainViewer.mapSize?.width === size.width && terrainViewer.mapSize.height === size.height) {
      return;
    }
    terrainViewer.mapSize = size;
  });

  const dtmHandler = new DtmHandler(() => new Worker("worker/pngjs.js"));
  dtmHandler.addListener((dtm) => {
    if (terrainViewer.dtm === dtm) return;
    terrainViewer.dtm = dtm;
  });

  const prefabsHandler = new PrefabsHandler(
    {
      status: component("prefabs_num", HTMLElement),
      minTier: component("min_tier", HTMLInputElement),
      maxTier: component("max_tier", HTMLInputElement),
      prefabFilter: component("prefab_filter", HTMLInputElement),
      blockFilter: component("block_filter", HTMLInputElement),
    },
    new Worker("worker/prefabs-filter.js"),
    fetchJson("prefab-difficulties.json"),
  );
  prefabsHandler.listeners.push((prefabs) => {
    mapCanvasHandler.update({ prefabs });
  });

  const prefabListRenderer = new DelayedRenderer<HighlightedPrefab>(
    component("controller", HTMLElement),
    component("prefabs_list", HTMLElement),
    (p) => prefabLi(p),
  );
  prefabsHandler.listeners.push((prefabs) => {
    prefabListRenderer.iterator = prefabs;
  });

  const cursorCoodsHandler = new CursorCoodsHandler(
    {
      canvas: component("map", HTMLCanvasElement),
      output: component("cursor_coods", HTMLElement),
    },
    (coords, size) => dtmHandler.dtm?.getElevation(coords, size) ?? null,
  );
  mapCanvasHandler.addMapSizeListener((size) => (cursorCoodsHandler.mapSize = size));

  const markerHandler = new MarkerHandler(
    {
      canvas: component("map", HTMLCanvasElement),
      output: component("mark_coods", HTMLElement),
      resetMarker: component("reset_mark", HTMLButtonElement),
    },
    (coords, size) => dtmHandler.dtm?.getElevation(coords, size) ?? null,
  );
  mapCanvasHandler.addMapSizeListener((size) => (markerHandler.mapSize = size));
  markerHandler.listeners.push((coords) => {
    prefabsHandler.marker = coords;
    mapCanvasHandler.update({ markerCoords: coords });
  });

  const labelHandler = new LabelHandler({ language: component("label_lang", HTMLSelectElement) }, navigator.languages);
  labelHandler.addListener((lang) => {
    prefabsHandler.language = lang;
  });

  const imageLoader = new ImageBitmapLoader(() => new Worker("worker/pngjs.js"));
  const fileHandler = new FileHandler({ input: component("files", HTMLInputElement) }, loadingHandler);
  fileHandler.addListeners([
    [
      "biomes.png",
      async (file) => {
        let biomesImg: mapRenderer.InMessage["biomesImg"];
        if (file == null) {
          biomesImg = null;
        } else {
          biomesImg = await loadImage(file);
        }
        mapCanvasHandler.update({ biomesImg });
      },
    ],
    [
      /splat3(_processed)?\.png/,
      async (file, preprocessed) => {
        let splat3Img: mapRenderer.InMessage["splat3Img"];
        if (file == null) {
          splat3Img = null;
        } else if (preprocessed) {
          splat3Img = await loadImage(file);
        } else {
          splat3Img = await imageLoader.loadSplat3(file);
        }
        mapCanvasHandler.update({ splat3Img });
      },
    ],
    [
      /splat4(_processed)?\.png/,
      async (file, preprocessed) => {
        let splat4Img: mapRenderer.InMessage["splat4Img"];
        if (file == null) {
          splat4Img = null;
        } else if (preprocessed) {
          splat4Img = await loadImage(file);
        } else {
          splat4Img = await imageLoader.loadSplat4(file);
        }
        mapCanvasHandler.update({ splat4Img });
      },
    ],
    [
      "radiation.png",
      async (file, preprocessed) => {
        let radImg: mapRenderer.InMessage["radImg"];
        if (file == null) {
          radImg = null;
        } else if (preprocessed) {
          radImg = await loadImage(file);
        } else {
          radImg = await imageLoader.loadRad(file);
        }
        mapCanvasHandler.update({ radImg });
      },
    ],
    [
      "prefabs.xml",
      async (file) => {
        await prefabsHandler.handle(file);
      },
    ],
    [
      /dtm\.(raw|png)/,
      async (file) => {
        await dtmHandler.handle(file);
      },
    ],
  ]);

  ////////////////////////////////////////////////////
  // Setup components that put files or urls
  ////////////////////////////////////////////////////

  const dndHandler = new DndHandler(document);
  dndHandler.addDropFilesListener((files) => {
    fileHandler.pushFiles(files);
  });

  component("clear_map").addEventListener("click", () => {
    fileHandler.clear();
  });

  window.addEventListener("click", ({ target }) => {
    if (!(target instanceof HTMLElement)) return;
    const dir = target.dataset["worldDir"];
    if (dir === undefined) return;
    const worldName = basename(dir);
    const mapName = component("map_name", HTMLInputElement)
    mapName.value = worldName;
    mapName.dispatchEvent(new Event("input"));
    fileHandler.pushUrls(
      ["biomes.png", "splat3_processed.png", "splat4_processed.png", "radiation.png", "prefabs.xml", "dtm.png"].map((n) => `${dir}/${n}`),
      // Bundled world files are preprocessed. See tools/copy_worlds.bash
      true,
    );
  });
}

function initSaveDialog() {
  const mapName = component("map_name", HTMLInputElement);
  const saveMapName = component("save_map_name", HTMLInputElement);
  const saveMap = component("save_map", HTMLButtonElement);
  const saveDialog = component("save_prompt", HTMLDialogElement);

  // Bind map name
  mapName.addEventListener("input", () => {
    saveMapName.value = mapName.value;
    saveMap.value = mapName.value;
  });
  saveMapName.addEventListener("input", () => {
    mapName.value = saveMapName.value;
    saveMap.value = saveMapName.value;
  });

  saveDialog.addEventListener("close", () => {
    console.debug("Save dialog closed", saveDialog.returnValue);
  });
}

function initLoadDialog() {
  const loadMapName = component("load_map_name", HTMLSelectElement);
  const loadDialog = component("load_prompt", HTMLDialogElement);
  loadMapName.addEventListener("change", () => {
    loadDialog.close(loadMapName.value);
  });
  loadDialog.addEventListener("close", () => {
    loadMapName.value = "";
    console.debug("Load dialog closed", loadDialog.returnValue);
  });
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    `<button data-input-for="prefab_filter" data-input-text="${prefab.name}" title="Filter with this prefab name">▲</button>`,
    ...(prefab.dist ? [`${humanreadableDistance(prefab.dist)},`] : []),
    ...(prefab.difficulty
      ? [
          `<span title="Difficulty Tier ${prefab.difficulty.toString()}" class="prefab_difficulty_${prefab.difficulty.toString()}">`,
          `  💀${prefab.difficulty.toString()}`,
          `</span>`,
        ]
      : []),
    `<a href="prefabs/${prefab.name}.html" target="_blank">`,
    prefab.highlightedLabel ?? "-",
    "/",
    `<small>${prefab.highlightedName ?? prefab.name}</small>`,
    "</a>",
    `(${prefab.x.toString()}, ${prefab.z.toString()})`,
  ].join(" ");
  if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
    const blocksUl = document.createElement("ul");
    prefab.matchedBlocks.forEach((block) => {
      if (block.count === undefined) return;
      const blockLi = document.createElement("li");
      blockLi.innerHTML = [
        `<button data-input-for="block_filter" data-input-text="${block.name}" title="Filter with this block name">▲</button>`,
        `${block.count.toString()}x`,
        block.highlightedLabel,
        `<small>${block.highlightedName}</small>`,
      ].join(" ");
      blocksUl.appendChild(blockLi);
    });
    li.appendChild(blocksUl);
  }
  return li;
}

async function renderBundledWorldList() {
  const container = component("world_list");
  const worldNames = await fetchJson<string[]>("worlds/index.json");
  for (const name of worldNames) {
    const button = document.createElement("button");
    button.textContent = name;
    button.title = `Load ${name}`;
    button.dataset["worldDir"] = `worlds/${name}`;
    const li = document.createElement("li");
    container.appendChild(li).appendChild(button);
  }
}

function updateMapRightMargin() {
  const margin = component("controller").clientWidth + 48;
  component("map", HTMLCanvasElement).style.marginRight = `${margin.toString()}px`;
}

async function loadImage(file: File) {
  if (file.type === "image/png") {
    return new Blob([file], { type: "image/png" }) as PngBlob;
  }
  return createImageBitmap(file);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
