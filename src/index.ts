import { ImageBitmapLoader } from "./lib/bitmap-loader";
import * as copyButton from "./lib/copy-button";
import * as presetButton from "./lib/preset-button";
import { MapSelector } from "./index/map-selector";
import { MapStorage } from "./lib/map-storage";
import { component, downloadCanvasPng, fetchJson, humanreadableDistance, printError } from "./lib/utils";
import { DtmHandler } from "./index/dtm-handler";
import { PrefabsHandler } from "./index/prefabs-handler";
import { DelayedRenderer } from "./lib/delayed-renderer";
import { CursorCoodsHandler } from "./index/cursor-coods-handler";
import { MarkerHandler } from "./index/marker-handler";
import { FileHandler } from "./index/file-handler";
import { MapCanvasHandler } from "./index/map-canvas-handler";
import { DndHandler } from "./index/dnd-handler";
import { SampleWorldLoader } from "./index/sample-world-loader";
import { LoadingHandler } from "./index/loading-handler";
import { TerrainViewer } from "./index/terrain-viewer";
import * as syncOutput from "./lib/sync-output";
import { LabelHandler } from "./lib/label-handler";

function main() {
  presetButton.init();
  copyButton.init();
  syncOutput.init();

  const loadingHandler = new LoadingHandler({
    indicator: component("loading_indicator"),
    disablings: {
      files: component("files", HTMLInputElement),
      select: component("map_list", HTMLSelectElement),
      create: component("create_map", HTMLButtonElement),
      delete: component("delete_map", HTMLButtonElement),
      mapName: component("map_name", HTMLInputElement),
    },
  });

  const mapStorage = new MapStorage();
  new MapSelector(
    {
      select: component("map_list", HTMLSelectElement),
      create: component("create_map", HTMLButtonElement),
      delete: component("delete_map", HTMLButtonElement),
      mapName: component("map_name", HTMLInputElement),
    },
    mapStorage,
  );

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
    mapStorage,
    loadingHandler,
  );

  const terrainViewer = new TerrainViewer({
    output: component("terrain_viewer", HTMLCanvasElement),
    texture: component("map", HTMLCanvasElement),
    show: component("terrain_viewer_show", HTMLButtonElement),
    close: component("terrain_viewer_close", HTMLButtonElement),
    hud: component("terrarian_viewer_hud"),
  });

  mapCanvasHandler.addMapSizeListener((size) => {
    terrainViewer.markCanvasUpdate();
    if (terrainViewer.mapSize?.width === size.width && terrainViewer.mapSize.height === size.height) {
      return;
    }
    terrainViewer.mapSize = size;
    terrainViewer.updateElevations().catch(printError);
  });

  const dtmHandler = new DtmHandler(mapStorage, () => new Worker("worker/pngjs.js"));
  dtmHandler.addListener((dtm) => {
    if (terrainViewer.dtm === dtm) return;
    terrainViewer.dtm = dtm;
    terrainViewer.updateElevations().catch(printError);
  });

  const prefabsHandler = new PrefabsHandler(
    {
      status: component("prefabs_num", HTMLElement),
      prefabFilter: component("prefabs_filter", HTMLInputElement),
      blockFilter: component("blocks_filter", HTMLInputElement),
    },
    new Worker("worker/prefabs-filter.js"),
    mapStorage,
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
    ["biomes.png", async (file) => mapCanvasHandler.updateAsync({ biomesImg: await createImageBitmap(file) })],
    [/splat3(_processed)?\.png/, async (file) => mapCanvasHandler.updateAsync({ splat3Img: await imageLoader.loadSplat3(file) })],
    ["splat4_processed.png", async (file) => mapCanvasHandler.updateAsync({ splat4Img: await imageLoader.loadSplat4(file) })],
    ["radiation.png", async (file) => mapCanvasHandler.updateAsync({ radImg: await imageLoader.loadRad(file) })],
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

  const dndHandler = new DndHandler(document);
  dndHandler.addDropFilesListener((files) => {
    fileHandler.pushFiles(files);
  });

  const sampleWorldLoader = new SampleWorldLoader();
  sampleWorldLoader.addListenr((f) => {
    fileHandler.pushFiles([f]);
  });

  component("download").addEventListener("click", () => {
    const mapName = component("map_name", HTMLInputElement).value || "7dtd-map";
    downloadCanvasPng(`${mapName}.png`, component("map", HTMLCanvasElement));
  });
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    `<button data-input-for="prefabs_filter" data-input-text="${prefab.name}" title="Filter with this prefab name">▲</button>`,
    ...(prefab.dist ? [`${humanreadableDistance(prefab.dist)},`] : []),
    ...(prefab.difficulty
      ? [
          `<span title="Difficulty Tier ${prefab.difficulty.toString()}" class="prefab_difficulty_${prefab.difficulty.toString()}">`,
          `  <span class="prefab_difficulty_icon">💀</span>${prefab.difficulty.toString()}`,
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
        `<button data-input-for="blocks_filter" data-input-text="${block.name}" title="Filter with this block name">▲</button>`,
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
