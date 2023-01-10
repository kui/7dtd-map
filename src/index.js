"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPrefabLi = void 0;
const bitmap_loader_1 = require("./lib/bitmap-loader");
const copyButton = __importStar(require("./lib/copy-button"));
const presetButton = __importStar(require("./lib/preset-button"));
const map_selector_1 = require("./index/map-selector");
const map_storage_1 = require("./lib/map-storage");
const utils_1 = require("./lib/utils");
const generation_info_handler_1 = require("./index/generation-info-handler");
const dtm_handler_1 = require("./index/dtm-handler");
const prefabs_handler_1 = require("./index/prefabs-handler");
const delayed_renderer_1 = require("./lib/delayed-renderer");
const cursor_coods_handler_1 = require("./index/cursor-coods-handler");
const marker_handler_1 = require("./index/marker-handler");
const file_handler_1 = require("./index/file-handler");
const map_canvas_handler_1 = require("./index/map-canvas-handler");
const dnd_handler_1 = require("./index/dnd-handler");
const sample_world_loader_1 = require("./index/sample-world-loader");
const loading_handler_1 = require("./index/loading-handler");
const terrain_viewer_1 = require("./index/terrain-viewer");
const ui_handler_1 = require("./index/ui-handler");
const syncOutput = __importStar(require("./lib/sync-output"));
function main() {
  presetButton.init();
  copyButton.init();
  syncOutput.init();
  // UI Initialization
  (0, ui_handler_1.UIHandler)();
  const loadingHandler = new loading_handler_1.LoadingHandler({
    indicator: (0, utils_1.component)("loading_indicator"),
    disablings: {
      files: (0, utils_1.component)("files", HTMLInputElement),
      select: (0, utils_1.component)("map_list", HTMLSelectElement),
      create: (0, utils_1.component)("create_map", HTMLButtonElement),
      delete: (0, utils_1.component)("delete_map", HTMLButtonElement),
      mapName: (0, utils_1.component)("map_name", HTMLInputElement),
    },
  });
  const mapStorage = new map_storage_1.MapStorage();
  new map_selector_1.MapSelector(
    {
      select: (0, utils_1.component)("map_list", HTMLSelectElement),
      create: (0, utils_1.component)("create_map", HTMLButtonElement),
      delete: (0, utils_1.component)("delete_map", HTMLButtonElement),
      mapName: (0, utils_1.component)("map_name", HTMLInputElement),
    },
    mapStorage
  );
  const mapCanvasHandler = new map_canvas_handler_1.MapCanvasHandler(
    {
      canvas: (0, utils_1.component)("map", HTMLCanvasElement),
      biomesAlpha: (0, utils_1.component)("biomes_alpha", HTMLInputElement),
      splat3Alpha: (0, utils_1.component)("splat3_alpha", HTMLInputElement),
      splat4Alpha: (0, utils_1.component)("splat4_alpha", HTMLInputElement),
      radAlpha: (0, utils_1.component)("rad_alpha", HTMLInputElement),
      signSize: (0, utils_1.component)("sign_size", HTMLInputElement),
      signAlpha: (0, utils_1.component)("sign_alpha", HTMLInputElement),
      brightness: (0, utils_1.component)("brightness", HTMLInputElement),
      scale: (0, utils_1.component)("scale", HTMLInputElement),
    },
    new Worker("worker/map-renderer.js"),
    mapStorage,
    loadingHandler
  );
  const generationInfoHandler = new generation_info_handler_1.GenerationInfoHandler(
    {
      mapName: (0, utils_1.component)("map_name", HTMLInputElement),
      output: (0, utils_1.component)("generation_info_output", HTMLTextAreaElement),
    },
    mapStorage
  );
  const terrainViewer = new terrain_viewer_1.TerrainViewer({
    output: (0, utils_1.component)("terrain_viewer", HTMLCanvasElement),
    texture: (0, utils_1.component)("map", HTMLCanvasElement),
    show: (0, utils_1.component)("terrain_viewer_show", HTMLButtonElement),
    close: (0, utils_1.component)("terrain_viewer_close", HTMLButtonElement),
    hud: (0, utils_1.component)("terrarian_viewer_hud"),
  });
  mapCanvasHandler.addMapSizeListener((size) => {
    terrainViewer.markCanvasUpdate();
    if (terrainViewer.mapSize?.width === size.width && terrainViewer.mapSize.height === size.height) {
      return;
    }
    terrainViewer.mapSize = size;
    terrainViewer.updateElevations();
  });
  const dtmHandler = new dtm_handler_1.DtmHandler(mapStorage, () => new Worker("worker/pngjs.js"));
  dtmHandler.addListener((dtm) => {
    if (terrainViewer.dtm === dtm) return;
    terrainViewer.dtm = dtm;
    terrainViewer.updateElevations();
  });
  const prefabsHandler = new prefabs_handler_1.PrefabsHandler(
    {
      status: (0, utils_1.component)("prefabs_num", HTMLElement),
      prefabFilter: (0, utils_1.component)("prefabs_filter", HTMLInputElement),
      blockFilter: (0, utils_1.component)("blocks_filter", HTMLInputElement),
    },
    new Worker("worker/prefabs-filter.js"),
    mapStorage
  );
  const prefabListRenderer = new delayed_renderer_1.DelayedRenderer(
    (0, utils_1.component)("controller", HTMLElement),
    (0, utils_1.component)("prefabs_list", HTMLElement),
    (p) => prefabLi(p)
  );
  prefabsHandler.listeners.push(async (prefabs) => {
    mapCanvasHandler.update({ prefabs });
    // terrainViewer.updatePOIText(prefabs);
    prefabListRenderer.iterator = prefabs;
  });
  const cursorCoodsHandler = new cursor_coods_handler_1.CursorCoodsHandler(
    {
      canvas: (0, utils_1.component)("map", HTMLCanvasElement),
      xOutput: (0, utils_1.component)("e-w", HTMLElement),
      zOutput: (0, utils_1.component)("n-s", HTMLElement),
      yOutput: (0, utils_1.component)("elev", HTMLElement),
    },
    (coords, size) => dtmHandler.dtm?.getElevation(coords, size) ?? null
  );
  mapCanvasHandler.addMapSizeListener((size) => (cursorCoodsHandler.mapSize = size));
  const markerHandler = new marker_handler_1.MarkerHandler(
    {
      canvas: (0, utils_1.component)("map", HTMLCanvasElement),
      xOutput: (0, utils_1.component)("mark-x", HTMLElement),
      zOutput: (0, utils_1.component)("mark-z", HTMLElement),
      yOutput: (0, utils_1.component)("mark-y", HTMLElement),
      resetMarker: (0, utils_1.component)("reset_mark", HTMLButtonElement),
    },
    (coords, size) => dtmHandler.dtm?.getElevation(coords, size) ?? null
  );
  mapCanvasHandler.addMapSizeListener((size) => (markerHandler.mapSize = size));
  markerHandler.listeners.push(async (coords) => {
    prefabsHandler.marker = coords;
    mapCanvasHandler.update({ markerCoords: coords });
  });
  const imageLoader = new bitmap_loader_1.ImageBitmapLoader(() => new Worker("worker/pngjs.js"));
  const fileHandler = new file_handler_1.FileHandler({ input: (0, utils_1.component)("files", HTMLInputElement) }, loadingHandler);
  fileHandler.addListeners([
    ["biomes.png", async (file) => mapCanvasHandler.update({ biomesImg: await createImageBitmap(file) })],
    [/splat3(_processed)?\.png/, async (file) => mapCanvasHandler.update({ splat3Img: await imageLoader.loadSplat3(file) })],
    ["splat4_processed.png", async (file) => mapCanvasHandler.update({ splat4Img: await imageLoader.loadSplat4(file) })],
    ["radiation.png", async (file) => mapCanvasHandler.update({ radImg: await imageLoader.loadRad(file) })],
    ["prefabs.xml", async (file) => await prefabsHandler.handle(file)],
    [/dtm\.(raw|png)/, async (file) => await dtmHandler.handle(file)],
    ["GenerationInfo.txt", async (file) => await generationInfoHandler.handle(file)],
  ]);
  const dndHandler = new dnd_handler_1.DndHandler(document);
  dndHandler.addDropFilesListener((files) => fileHandler.pushFiles(files));
  const sampleWorldLoader = new sample_world_loader_1.SampleWorldLoader();
  sampleWorldLoader.addListenr((f) => fileHandler.pushFiles([f]));
  (0, utils_1.component)("download").addEventListener("click", () => {
    const mapName = (0, utils_1.component)("map_name", HTMLInputElement).value ?? "7dtd-map";
    (0, utils_1.downloadCanvasPng)(`${mapName}.png`, (0, utils_1.component)("map", HTMLCanvasElement));
  });
}
function prefabLi(prefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    `<button data-input-for="prefabs_filter" data-input-text="${prefab.name}" title="Filter with this prefab name" class="poi-filter-btn">▲</button>`,
    `<a href="prefabs/${prefab.name}.html" target="_blank">${prefab.highlightedName || prefab.name}</a>`,
    prefab.dist ? `<p class="poi-distance">Distance: ${(0, utils_1.humanreadableDistance)(prefab.dist)}</p>` : "",
    `<div class="coord-holder">(<p class="e-w">${prefab.x}</p>, <p class="n-s">${prefab.z}</p>)</div>`,
  ].join(" ");
  if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
    const blocksUl = document.createElement("ul");
    blocksUl.classList.add("highlighted-block-info-ul");
    prefab.matchedBlocks.forEach((block) => {
      const blockLi = document.createElement("li");
      blockLi.innerHTML = [
        `<button data-input-for="blocks_filter" data-input-text="${block.name}" title="Filter with this block name" class="small-filter-btn">▲</button>`,
        `<small>${block.count}x ${block.highlightedLabel}<small>`,
        `${block.highlightedName}`,
      ].join(" ");
      blocksUl.appendChild(blockLi);
    });
    li.appendChild(blocksUl);
  }
  return li;
}
function clearPrefabLi() {
  const prefabsList = document.getElementById("prefabs_list");
  while (prefabsList?.firstChild) {
    prefabsList?.removeChild(prefabsList?.firstChild);
  }
}
exports.clearPrefabLi = clearPrefabLi;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
//# sourceMappingURL=index.js.map
