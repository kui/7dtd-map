import { loadBitmapByUrl, loadSplatBitmapByFile, loadSplatBitmapByUrl, loadRadBitmapByFile, loadRadBitmapByUrl } from "./lib/bitmap-loader";
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

declare class MapRendererWorker extends Worker {
  postMessage(message: MapRendererInMessage, transfer: Transferable[]): void;
  postMessage(message: MapRendererInMessage, options?: PostMessageOptions): void;
}

function main() {
  const mapNameInput = document.getElementById("map_name") as HTMLInputElement;
  const generationInfoInput = document.getElementById("generation_info") as HTMLInputElement;
  const loadingIndicatorP = document.getElementById("loading_indicator") as HTMLParagraphElement;
  const controllerDiv = document.getElementById("controller") as HTMLDivElement;
  const downloadButton = document.getElementById("download") as HTMLButtonElement;
  const showBiomesInput = document.getElementById("show_biomes") as HTMLInputElement;
  const biomesInput = document.getElementById("biomes") as HTMLInputElement;
  const showSplat3Input = document.getElementById("show_splat3") as HTMLInputElement;
  const splat3Input = document.getElementById("splat3") as HTMLInputElement;
  const showSplat4Input = document.getElementById("show_splat4") as HTMLInputElement;
  const splat4Input = document.getElementById("splat4") as HTMLInputElement;
  const showRadInput = document.getElementById("show_radiation") as HTMLInputElement;
  const radInput = document.getElementById("radiation") as HTMLInputElement;
  const showPrefabsInput = document.getElementById("show_prefabs") as HTMLInputElement;
  const prefabsInput = document.getElementById("prefabs") as HTMLInputElement;
  const dtmInput = document.getElementById("dtm") as HTMLInputElement;
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
  const mapSelector = new MapSelector(mapStorage);
  mapSelector.init({
    select: component("map_list", HTMLSelectElement),
    create: component("create_map", HTMLButtonElement),
    delete: component("delete_map", HTMLButtonElement),
    mapName: component("map_name", HTMLInputElement),
  });

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

  // -------------------------------------------------
  // map update events
  // -------------------------------------------------
  const loadingFiles = new Set();

  // inputs
  biomesInput.addEventListener("input", async () => {
    console.log("Load biome");
    const file = biomesInput.files?.[0];
    if (!file) return;
    loadingFiles.add("biomes.png");
    const biomesImg: ImageBitmap = await createImageBitmap(file);
    loadingFiles.delete("biomes.png");
    if (!biomesImg) return;
    mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
  });
  splat3Input.addEventListener("input", async () => {
    const file = splat3Input.files?.[0];
    if (!file) return;
    console.log("Load splat3");
    loadingFiles.add(file.name);
    const splat3Img = await loadSplatBitmapByFile(file);
    loadingFiles.delete(file.name);
    if (!splat3Img) return;
    mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
  });
  splat4Input.addEventListener("input", async () => {
    const file = splat4Input.files?.[0];
    if (!file) return;
    console.log("Load splat4");
    loadingFiles.add("splat4_processed.png");
    const splat4Img = await loadSplatBitmapByFile(file);
    loadingFiles.delete("splat4_processed.png");
    if (!splat4Img) return;
    mapRendererWorker.postMessage({ splat4Img }, [splat4Img]);
  });
  radInput.addEventListener("input", async () => {
    const file = radInput.files?.[0];
    if (!file) return;
    console.log("Load radiation");
    loadingFiles.add("radiation.png");
    const radImg = await loadRadBitmapByFile(file);
    loadingFiles.delete("radiation.png");
    if (!radImg) return;
    mapRendererWorker.postMessage({ radImg }, [radImg]);
  });
  prefabsInput.addEventListener("input", async () => {
    const file = prefabsInput.files?.[0];
    if (!file) return;
    console.log("Load prefabs");
    loadingFiles.add("prefabs.xml");
    prefabsHandler.handle(file);
    loadingFiles.delete("prefabs.xml");
  });
  dtmInput.addEventListener("input", async () => {
    const file = dtmInput.files?.[0];
    if (!file) return;
    loadingFiles.add("dtm.raw");
    dtmHandler.handle(file);
    loadingFiles.delete("dtm.raw");
  });
  generationInfoInput.addEventListener("input", async () => {
    const file = generationInfoInput.files?.[0];
    if (!file) return;
    loadingFiles.add("GenerationInfo.txt");
    await generationInfoHandler.handle(file);
    loadingFiles.delete("GenerationInfo.txt");
  });

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
    let files = Array.from(event.dataTransfer.files);
    const hasSplat3ProcessedPng = files.some((f) => f.name === "splat3_processed.png");
    if (hasSplat3ProcessedPng) {
      console.log("Ignore `splat3.png` because `splat3_processed.png` was given. `splat3.png` is a subset data of `splat3_processed.png`.");
      files = files.filter((f) => f.name !== "splat3.png");
    }
    await Promise.all(files.map((f) => handleDroppedFiles(f)));
  });

  async function handleDroppedFiles(file: File) {
    loadingFiles.add(file.name);
    try {
      console.time(file.name);
      if (file.name === "biomes.png") {
        const biomesImg = await createImageBitmap(file);
        mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
        biomesInput.value = "";
      } else if (file.name === "splat3.png" || file.name === "splat3_processed.png") {
        const splat3Img = await loadSplatBitmapByFile(file);
        mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
        splat3Input.value = "";
      } else if (file.name === "splat4_processed.png") {
        const splat4Img = await loadSplatBitmapByFile(file);
        mapRendererWorker.postMessage({ splat4Img }, [splat4Img]);
        splat4Input.value = "";
      } else if (file.name === "radiation.png") {
        const radImg = await loadRadBitmapByFile(file);
        mapRendererWorker.postMessage({ radImg }, [radImg]);
        radInput.value = "";
      } else if (file.name === "prefabs.xml") {
        prefabsHandler.handle(file);
        prefabsInput.value = "";
      } else if (file.name === "dtm.raw") {
        dtmHandler.handle(file);
        dtmInput.value = "";
      } else if (file.name === "GenerationInfo.txt") {
        await generationInfoHandler.handle(file);
        generationInfoInput.value = "";
      } else {
        console.warn("Unknown file: %s, %s", file.name, file.type);
      }
      console.timeEnd(file.name);
    } catch (e) {
      console.error(e);
      loadingFiles.delete(file.name);
      loadingFiles.add(`LoadError(${file.name})`);
    }
    loadingFiles.delete(file.name);
  }

  // sample load
  sampleLoadButton.addEventListener("click", async () => {
    sampleLoadButton.disabled = true;
    await Promise.all(
      [
        async () => {
          loadingFiles.add("biomes.png");
          mapRendererWorker.postMessage({
            biomesImg: await loadBitmapByUrl("sample_world/biomes.png"),
          });
          loadingFiles.delete("biomes.png");
        },
        async () => {
          loadingFiles.add("splat3_processed.png");
          mapRendererWorker.postMessage({
            splat3Img: await loadSplatBitmapByUrl("sample_world/splat3_processed.png"),
          });
          loadingFiles.delete("splat3_processed.png");
        },
        async () => {
          loadingFiles.add("splat4_processed.png");
          mapRendererWorker.postMessage({
            splat4Img: await loadSplatBitmapByUrl("sample_world/splat4_processed.png"),
          });
          loadingFiles.delete("splat4_processed.png");
        },
        async () => {
          loadingFiles.add("radiation.png");
          mapRendererWorker.postMessage({
            radImg: await loadRadBitmapByUrl("sample_world/radiation.png"),
          });
          loadingFiles.delete("radiation.png");
        },
        async () => {
          loadingFiles.add("prefab.xml");
          prefabsHandler.handle(await fetch("sample_world/prefabs.xml"));
          loadingFiles.delete("prefab.xml");
        },
        async () => {
          loadingFiles.add("dtm.raw");
          dtmHandler.handle("sample_world/dtm.png");
          loadingFiles.delete("dtm.raw");
        },
        async () => {
          loadingFiles.add("GenerationInfo.txt");
          await generationInfoHandler.handle(await fetch("sample_world/GenerationInfo.txt"));
          loadingFiles.delete("GenerationInfo.txt");
        },
      ].map((p) => p())
    );
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

  // filter input appearance
  ["input", "focus"].forEach((eventName) => {
    mapNameInput.addEventListener(eventName, () => {
      generationInfoInput.value = "";
    });
  });

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

  // -------------------------------------------------
  // helper methods
  // -------------------------------------------------
  function updateLoadingIndicator() {
    if (loadingFiles.size === 0) {
      loadingIndicatorP.textContent = "-";
    } else {
      loadingIndicatorP.textContent = `Loading: ${Array.from(loadingFiles).join(", ")}`;
    }
    requestAnimationFrame(updateLoadingIndicator);
  }
  updateLoadingIndicator();
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
