import * as copyButton from "./lib/ui/copy-button.ts";
import * as presetButton from "./lib/ui/preset-button.ts";
import * as dialogButtons from "./lib/ui/dialog-buttons.ts";
import * as syncOutput from "./lib/ui/sync-output.ts";
import * as rememberValue from "./lib/ui/remember-value.ts";
import * as minMaxInputs from "./lib/ui/min-max-inputs.ts";
import { LabelHandler } from "./lib/label-handler.ts";
import { component, downloadCanvasPng, fetchJson, humanreadableDistance, printError } from "./lib/utils.ts";

import { DialogHandler } from "./index/dialog-handler.ts";
import { DtmHandler } from "./index/dtm-handler.ts";
import { PrefabsHandler } from "./index/prefabs-handler.ts";
import { DelayedRenderer } from "./lib/delayed-renderer.ts";
import { CursorCoodsHandler } from "./index/cursor-coods-handler.ts";
import { MarkerHandler } from "./index/marker-handler.ts";
import { FileHandler, ImageProcessorWorker } from "./index/file-handler.ts";
import { MapCanvasHandler } from "./index/map-canvas-handler.ts";
import { DndHandler } from "./index/dnd-handler.ts";
import { TerrainViewer } from "./index/terrain-viewer.ts";
import { BundledMapHandler } from "./index/bundled-map-hander.ts";
import { MapInfoHandler } from "./index/map-info-handler.ts";

import "./lib/map-storage.ts";
import { PrefabInspectorHandler } from "./index/prefab-inspector-handler.ts";

function main() {
  presetButton.init();
  copyButton.init();
  syncOutput.init();
  dialogButtons.init();
  rememberValue.init();
  minMaxInputs.init();

  component("download").addEventListener("click", () => {
    const mapName = component("map_name", HTMLInputElement).value || "7dtd-map";
    downloadCanvasPng(`${mapName}.png`, component("map", HTMLCanvasElement));
  });

  updateMapRightMargin();
  globalThis.addEventListener("resize", updateMapRightMargin);

  const dialogHandler = new DialogHandler({
    dialog: component("dialog", HTMLDialogElement),
    processingFiles: component("processing-files", HTMLUListElement),
  });
  const dndHandler = new DndHandler(
    { dragovered: document.body },
    dialogHandler,
  );
  const bundledMapHandler = new BundledMapHandler({
    select: component("bundled_map_select", HTMLSelectElement),
  });
  const fileHandler = new FileHandler(
    {
      files: component("files", HTMLInputElement),
      clearMap: component("clear_map", HTMLButtonElement),
      mapName: component("map_name", HTMLInputElement),
    },
    dialogHandler,
    () => new Worker("worker/file-processor.js") as ImageProcessorWorker,
    dndHandler,
    bundledMapHandler,
  );
  const labelHandler = new LabelHandler(
    { language: component("label_lang", HTMLSelectElement) },
    "labels",
    navigator.languages,
  );
  const dtmHandler = new DtmHandler(
    () => new Worker("worker/dtm.js"),
    fileHandler,
  );
  const markerHandler = new MarkerHandler(
    {
      canvas: component("map", HTMLCanvasElement),
      output: component("mark_coods", HTMLElement),
      resetMarker: component("reset_mark", HTMLButtonElement),
    },
    dtmHandler,
  );
  const prefabsHandler = new PrefabsHandler(
    {
      status: component("prefabs_num", HTMLElement),
      minTier: component("min_tier", HTMLInputElement),
      maxTier: component("max_tier", HTMLInputElement),
      prefabFilter: component("prefab_filter", HTMLInputElement),
      blockFilter: component("block_filter", HTMLInputElement),
      preExcludes: Array.from(
        component("prefab-pre-filters").querySelectorAll(
          "input[type=checkbox]",
        ),
      ),
    },
    new Worker("worker/prefabs-filter.js"),
    markerHandler,
    labelHandler,
    fileHandler,
    () => fetchJson("prefab-difficulties.json"),
  );
  new MapInfoHandler(
    {
      mapInfoShow: component("map-info-show", HTMLButtonElement),
      mapInfoDialog: component("map-info-dialog", HTMLDialogElement),
      mapInfoTable: component("map-info-table", HTMLTableElement),
    },
    fileHandler,
  );
  new MapCanvasHandler(
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
    prefabsHandler,
    markerHandler,
    fileHandler,
  );
  new TerrainViewer(
    {
      output: component("terrain_viewer", HTMLCanvasElement),
      texture: component("map", HTMLCanvasElement),
      show: component("terrain_viewer_show", HTMLButtonElement),
      close: component("terrain_viewer_close", HTMLButtonElement),
      hud: component("terrarian_viewer_hud"),
    },
    dtmHandler,
  );
  const prefabListRenderer = new DelayedRenderer<HighlightedPrefab>(
    component("controller", HTMLElement),
    component("prefabs_list", HTMLElement),
    (p) => prefabLi(p),
  );
  prefabsHandler.addListener(({ update: { prefabs } }) => {
    prefabListRenderer.iterator = prefabs;
  });
  new CursorCoodsHandler(
    {
      canvas: component("map", HTMLCanvasElement),
      output: component("cursor_coods", HTMLElement),
    },
    dtmHandler,
  );
  new PrefabInspectorHandler(
    {
      dialog: component("prefab-inspector-dialog", HTMLDialogElement),
      show: component("prefab-inspector-show", HTMLButtonElement),
      count: component("prefab-inspector-count"),
      detailCounts: {
        0: {
          inMap: component("prefab-inspector-tier-0-inmap-count"),
          defined: component("prefab-inspector-tier-0-defined-count"),
        },
        1: {
          inMap: component("prefab-inspector-tier-1-inmap-count"),
          defined: component("prefab-inspector-tier-1-defined-count"),
        },
        2: {
          inMap: component("prefab-inspector-tier-2-inmap-count"),
          defined: component("prefab-inspector-tier-2-defined-count"),
        },
        3: {
          inMap: component("prefab-inspector-tier-3-inmap-count"),
          defined: component("prefab-inspector-tier-3-defined-count"),
        },
        4: {
          inMap: component("prefab-inspector-tier-4-inmap-count"),
          defined: component("prefab-inspector-tier-4-defined-count"),
        },
        5: {
          inMap: component("prefab-inspector-tier-5-inmap-count"),
          defined: component("prefab-inspector-tier-5-defined-count"),
        },
        total: {
          inMap: component("prefab-inspector-total-inmap-count"),
          defined: component("prefab-inspector-total-defined-count"),
        },
      },
      missings: component("prefab-inspector-missings", HTMLOListElement),
    },
    labelHandler,
    () => fetchJson("prefab-difficulties.json"),
    () => fetchJson("prefabs/index.json"),
  );

  //

  fileHandler.initialize().catch(printError);
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    `<button data-input-for="prefab_filter" data-input-text="${prefab.name}" title="Filter with this prefab name">▲</button>`,
    ...(prefab.distance ? [`${humanreadableDistance(prefab.distance)},`] : []),
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

function updateMapRightMargin() {
  const margin = component("controller").clientWidth + 48;
  component("map", HTMLCanvasElement).style.marginRight = `${margin.toString()}px`;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
