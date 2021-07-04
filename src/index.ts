import { loadSplatBitmapByFile, loadRadBitmapByFile } from "./lib/bitmap-loader";
import { MapRendererInMessage, MapRendererOutMessage } from "./map-renderer";
import * as copyButton from "./lib/copy-button";
import { MapSelector } from "./index/map-selector";
import { MapStorage } from "./lib/map-storage";
import { component, humanreadableDistance } from "./lib/utils";
import { GenerationInfoHandler } from "./index/generation-info-handler";
import { DtmHandler } from "./index/dtm-handler";
import { PrefabsHandler } from "./index/prefabs-handler";
import { DelayedRenderer } from "./lib/delayed-renderer";
import { CursorCoodsHandler } from "./index/cursor-coods-handler";
import { MarkerHandler } from "./index/marker-handler";
import { FileHandler } from "./index/file-handler";

declare class MapRendererWorker extends Worker {
  postMessage(message: MapRendererInMessage, transfer: Transferable[]): void;
  postMessage(message: MapRendererInMessage, options?: PostMessageOptions): void;
}

function main() {
  const mapNameInput = document.getElementById("map_name") as HTMLInputElement;
  const controllerDiv = document.getElementById("controller") as HTMLDivElement;
  const downloadButton = document.getElementById("download") as HTMLButtonElement;
  const showBiomesInput = document.getElementById("show_biomes") as HTMLInputElement;
  const showSplat3Input = document.getElementById("show_splat3") as HTMLInputElement;
  const showSplat4Input = document.getElementById("show_splat4") as HTMLInputElement;
  const showRadInput = document.getElementById("show_radiation") as HTMLInputElement;
  const showPrefabsInput = document.getElementById("show_prefabs") as HTMLInputElement;
  const scaleInput = document.getElementById("scale") as HTMLInputElement;
  const signSizeInput = document.getElementById("sign_size") as HTMLInputElement;
  const brightnessInput = document.getElementById("brightness") as HTMLInputElement;
  const mapCanvas = document.getElementById("map") as HTMLCanvasElement;
  const sampleLoadButton = document.getElementById("sample_load") as HTMLButtonElement;

  const mapRendererWorker = new Worker("map-renderer.js") as MapRendererWorker;

  // init
  const rendererCanvas = mapCanvas.transferControlToOffscreen();
  mapRendererWorker.postMessage(
    {
      canvas: rendererCanvas,
      showBiomes: showBiomesInput.checked,
      showSplat3: showSplat3Input.checked,
      showSplat4: showSplat4Input.checked,
      showRad: showRadInput.checked,
      showPrefabs: showPrefabsInput.checked,
      signSize: parseInt(signSizeInput.value),
      brightness: `${brightnessInput.value}%`,
      scale: parseFloat(scaleInput.value),
    },
    [rendererCanvas]
  );

  copyButton.init();

  const mapStorage = new MapStorage();
  const mapSelector = new MapSelector(
    {
      select: component("map_list", HTMLSelectElement),
      create: component("create_map", HTMLButtonElement),
      delete: component("delete_map", HTMLButtonElement),
      mapName: component("map_name", HTMLInputElement),
    },
    mapStorage
  );

  const generationInfoHandler = new GenerationInfoHandler(mapStorage, {
    mapName: component("map_name", HTMLInputElement),
    output: component("generation_info_output", HTMLTextAreaElement),
  });

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
    mapRendererWorker.postMessage({ prefabs });
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
  mapRendererWorker.addEventListener("message", (event: MessageEvent<MapRendererOutMessage>) => {
    cursorCoodsHandler.mapSize = event.data.mapSizes;
  });

  const markerHandler = new MarkerHandler(
    {
      canvas: component("map", HTMLCanvasElement),
      output: component("mark_coods", HTMLElement),
      resetMarker: component("reset_mark", HTMLButtonElement),
    },
    (coords, width) => dtmHandler.dtm?.getElevation(coords.x, coords.z, width) ?? null
  );
  mapRendererWorker.addEventListener("message", (event: MessageEvent<MapRendererOutMessage>) => {
    markerHandler.mapSize = event.data.mapSizes;
  });
  markerHandler.listeners.push(async (coords) => {
    prefabsHandler.marker = coords;
    mapRendererWorker.postMessage({ markerCoords: coords });
  });

  const fileHandler = new FileHandler({
    input: component("files", HTMLInputElement),
    indicator: component("loading_indicator", HTMLElement),
  });
  fileHandler.addListeners([
    [
      "biomes.png",
      async (file) => {
        const biomesImg = await createImageBitmap(file);
        mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
      },
    ],
    [
      /splat3(_processed)?\.png/,
      async (file) => {
        const splat3Img = await loadSplatBitmapByFile(file);
        mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
      },
    ],
    [
      "splat4.png",
      async (file) => {
        const splat4Img = await loadSplatBitmapByFile(file);
        mapRendererWorker.postMessage({ splat4Img }, [splat4Img]);
      },
    ],
    [
      "radiation.png",
      async (file) => {
        const radImg = await loadRadBitmapByFile(file);
        mapRendererWorker.postMessage({ radImg }, [radImg]);
      },
    ],
    ["prefabs.xml", async (file) => prefabsHandler.handle(file)],
    [/dtm\.(raw|png)/, async (file) => await dtmHandler.handle(file)],
    ["GenerationInfo.txt", async (file) => generationInfoHandler.handle(file)],
  ]);

  //

  const restInputs = [
    showBiomesInput,
    showSplat3Input,
    showSplat4Input,
    showRadInput,
    showPrefabsInput,
    signSizeInput,
    brightnessInput,
    scaleInput,
  ];
  restInputs.forEach((e) => {
    e.addEventListener("input", () => {
      mapRendererWorker.postMessage({
        showBiomes: showBiomesInput.checked,
        showSplat3: showSplat3Input.checked,
        showSplat4: showSplat4Input.checked,
        showRad: showRadInput.checked,
        showPrefabs: showPrefabsInput.checked,
        signSize: parseInt(signSizeInput.value),
        brightness: `${brightnessInput.value}%`,
        scale: parseFloat(scaleInput.value),
      });
    });
  });

  // drag and drop
  document.addEventListener("drop", async (event) => {
    if (!event.dataTransfer?.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    fileHandler.pushFiles(Array.from(event.dataTransfer.files));
  });

  // sample load
  const sampleWorldDir = "sample_world";
  const filenames = [
    "biomes.png",
    "splat3_processed.png",
    "splat4_processed.png",
    "radiation.png",
    "prefabs.xml",
    "dtm.png",
    "GenerationInfo.txt",
  ];
  sampleLoadButton.addEventListener("click", async () => {
    sampleLoadButton.disabled = true;
    const files = await Promise.all(filenames.map((name) => fetchAsFile(`${sampleWorldDir}/${name}`)));
    fileHandler.pushFiles(files);
    sampleLoadButton.disabled = false;
  });

  // -------------------------------------------------
  // other model updates
  // -------------------------------------------------

  // preset input button
  controllerDiv.addEventListener("click", (event) => {
    const button = event.target;
    if (!button || !(button instanceof HTMLElement)) return;
    if (button.dataset.inputFor == null) {
      return;
    }

    const inputContent = button.dataset.inputText ?? button.textContent;
    if (inputContent === null) return;

    const target = document.getElementById(button.dataset.inputFor);
    if (!target || !(target instanceof HTMLInputElement)) return;
    target.value = inputContent;

    target.focus();
  });

  // download
  downloadButton.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = mapCanvas.toDataURL("image/png");
    a.download = mapNameInput.value ? `${mapNameInput.value}.png` : "7DtD-renderer.png";
    a.click();
  });

  // -------------------------------------------------
  // style handlers
  // -------------------------------------------------

  // drag and drop
  document.addEventListener("dragenter", (event) => {
    if (!event.dataTransfer?.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    document.body.classList.add("dragovered");
  });
  document.addEventListener("dragover", (event) => {
    if (!event.dataTransfer?.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    document.body.classList.add("dragovered");
  });
  document.addEventListener("dragleave", (event) => {
    // "dragleave" events raise even if the cursor moved on child nodes.
    // To avoid this case, we should check cursor positions.
    // Those are zero if the cursor moved out from the browser window.
    if (event.clientX !== 0 || event.clientY !== 0) {
      return;
    }
    event.preventDefault();
    document.body.classList.remove("dragovered");
  });
  document.addEventListener("drop", async (event) => {
    if (!event.dataTransfer?.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    document.body.classList.remove("dragovered");
  });
}

async function fetchAsFile(uri: string): Promise<File> {
  console.time(`fetchAsFile: ${uri}`);
  const res = await fetch(uri);
  const blob = await res.blob();
  const file = new File([blob], basename(uri), { type: blob.type });
  console.timeEnd(`fetchAsFile: ${uri}`);
  return file;
}

function basename(path: string) {
  return path.substring(path.lastIndexOf("/") + 1);
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    `<button data-input-for="prefabs_filter" data-input-text="${prefab.name}" title="Filter with this prefab name">▲</button>`,
    `${prefab.dist ? `${humanreadableDistance(prefab.dist)},` : ""}`,
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
