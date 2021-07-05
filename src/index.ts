import { loadSplatBitmapByFile, loadRadBitmapByFile } from "./lib/bitmap-loader";
import * as copyButton from "./lib/copy-button";
import * as presetButton from "./lib/preset-button";
import { MapSelector } from "./index/map-selector";
import { MapStorage } from "./lib/map-storage";
import { component, downloadCanvasPng, humanreadableDistance } from "./lib/utils";
import { GenerationInfoHandler } from "./index/generation-info-handler";
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

function main() {
  // init

  presetButton.init();
  copyButton.init();

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
    mapStorage
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
    new Worker("map-renderer.js"),
    mapStorage,
    loadingHandler
  );

  const generationInfoHandler = new GenerationInfoHandler(
    {
      mapName: component("map_name", HTMLInputElement),
      output: component("generation_info_output", HTMLTextAreaElement),
    },
    mapStorage
  );

  const dtmHandler = new DtmHandler(mapStorage);

  const prefabsHandler = new PrefabsHandler(
    {
      status: component("prefabs_num", HTMLElement),
      prefabFilter: component("prefabs_filter", HTMLInputElement),
      blockFilter: component("blocks_filter", HTMLInputElement),
    },
    new Worker("prefabs-filter.js"),
    mapStorage
  );
  prefabsHandler.listeners.push(async (prefabs) => {
    mapCanvasHandler.update({ prefabs });
  });

  const prefabListRenderer = new DelayedRenderer<HighlightedPrefab>(
    component("controller", HTMLElement),
    component("prefabs_list", HTMLElement),
    (p) => prefabLi(p)
  );
  prefabsHandler.listeners.push(async (prefabs) => {
    prefabListRenderer.iterator = prefabs;
  });

  const cursorCoodsHandler = new CursorCoodsHandler(
    {
      canvas: component("map", HTMLCanvasElement),
      output: component("cursor_coods", HTMLElement),
    },
    (coords, width) => dtmHandler.dtm?.getElevation(coords.x, coords.z, width) ?? null
  );
  mapCanvasHandler.addMapSizeListener((size) => (cursorCoodsHandler.mapSize = size));

  const markerHandler = new MarkerHandler(
    {
      canvas: component("map", HTMLCanvasElement),
      output: component("mark_coods", HTMLElement),
      resetMarker: component("reset_mark", HTMLButtonElement),
    },
    (coords, width) => dtmHandler.dtm?.getElevation(coords.x, coords.z, width) ?? null
  );
  mapCanvasHandler.addMapSizeListener((size) => (markerHandler.mapSize = size));
  markerHandler.listeners.push(async (coords) => {
    prefabsHandler.marker = coords;
    mapCanvasHandler.update({ markerCoords: coords });
  });

  const fileHandler = new FileHandler({ input: component("files", HTMLInputElement) }, loadingHandler);
  fileHandler.addListeners([
    ["biomes.png", async (file) => mapCanvasHandler.update({ biomesImg: await createImageBitmap(file) })],
    [/splat3(_processed)?\.png/, async (file) => mapCanvasHandler.update({ splat3Img: await loadSplatBitmapByFile(file) })],
    ["splat4_processed.png", async (file) => mapCanvasHandler.update({ splat4Img: await loadSplatBitmapByFile(file) })],
    ["radiation.png", async (file) => mapCanvasHandler.update({ radImg: await loadRadBitmapByFile(file) })],
    ["prefabs.xml", async (file) => await prefabsHandler.handle(file)],
    [/dtm\.(raw|png)/, async (file) => await dtmHandler.handle(file)],
    ["GenerationInfo.txt", async (file) => await generationInfoHandler.handle(file)],
  ]);

  const dndHandler = new DndHandler(document);
  dndHandler.addDropFilesListener((files) => fileHandler.pushFiles(files));

  const sampleWorldLoader = new SampleWorldLoader();
  sampleWorldLoader.addListenr((f) => fileHandler.pushFiles([f]));

  component("download").addEventListener("click", () => {
    const mapName = component("map_name", HTMLInputElement).value ?? "7dtd-map";
    downloadCanvasPng(`${mapName}.png`, component("map", HTMLCanvasElement));
  });
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    `<button data-input-for="prefabs_filter" data-input-text="${prefab.name}" title="Filter with this prefab name">▲</button>`,
    prefab.dist ? `${humanreadableDistance(prefab.dist)},` : "",
    `<a href="prefabs/${prefab.name}.html" target="_blank">${prefab.highlightedName || prefab.name}</a>`,
    `(${prefab.x}, ${prefab.z})`,
  ].join(" ");
  if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
    const blocksUl = document.createElement("ul");
    prefab.matchedBlocks.forEach((block) => {
      const blockLi = document.createElement("li");
      blockLi.innerHTML = [
        `<button data-input-for="blocks_filter" data-input-text="${block.name}" title="Filter with this block name">▲</button>`,
        `${block.count}x`,
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
