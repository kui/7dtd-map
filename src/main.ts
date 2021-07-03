import { loadBitmapByUrl, loadSplatBitmapByFile, loadSplatBitmapByUrl, loadRadBitmapByFile, loadRadBitmapByUrl } from "./lib/bitmap-loader";
import { loadPrefabsXmlByFile, loadPrefabsXmlByUrl } from "./lib/prefabs-xml-loader";
import { MapRendererInMessage, MapRendererOutMessage } from "./map-renderer";
import { PrefabUpdate } from "./lib/prefabs";
import * as copyButton from "./lib/copy-button";
import { PrefabsFilterInMessage } from "./prefabs-filter";
import { MapSelector } from "./lib/map-selector";
import { MapStorage } from "./lib/map-storage";
import { component, humanreadableDistance } from "./lib/utils";
import { GenerationInfoHandler } from "./lib/generation-info-handler";
import { DtmHandler } from "./lib/dtm-handler";

declare class MapRendererWorker extends Worker {
  postMessage(message: MapRendererInMessage, transfer: Transferable[]): void;
  postMessage(message: MapRendererInMessage, options?: PostMessageOptions): void;
}

declare class PrefabsFilterWorker extends Worker {
  postMessage(message: PrefabsFilterInMessage): void;
}

function main() {
  const mapNameInput = document.getElementById("map_name") as HTMLInputElement;
  const generationInfoInput = document.getElementById("generation_info") as HTMLInputElement;
  const loadingIndicatorP = document.getElementById("loading_indicator") as HTMLParagraphElement;
  const controllerDiv = document.getElementById("controller") as HTMLDivElement;
  const cursorCoodsSpan = document.getElementById("cursor_coods") as HTMLSpanElement;
  const markCoodsSpan = document.getElementById("mark_coods") as HTMLSpanElement;
  const downloadButton = document.getElementById("download") as HTMLButtonElement;
  const resetMarkButton = document.getElementById("reset_mark") as HTMLButtonElement;
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
  const prefabsFilterInput = document.getElementById("prefabs_filter") as HTMLInputElement;
  const blocksFilterInput = document.getElementById("blocks_filter") as HTMLInputElement;
  const prefabsResultSpan = document.getElementById("prefabs_num") as HTMLSpanElement;
  const prefabListDiv = document.getElementById("prefabs_list") as HTMLDivElement;
  const mapCanvas = document.getElementById("map") as HTMLCanvasElement;
  const sampleLoadButton = document.getElementById("sample_load") as HTMLButtonElement;

  const mapRendererWorker = new Worker("map-renderer.js") as MapRendererWorker;
  const prefabsFilterWorker = new Worker("prefabs-filter.js") as PrefabsFilterWorker;

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
  (async () => {
    const res = await fetch("block-prefab-index.json");
    prefabsFilterWorker.postMessage({ blockPrefabIndex: await res.json() });
  })();
  (async () => {
    const res = await fetch("block-labels.json");
    prefabsFilterWorker.postMessage({ blockLabels: await res.json() });
  })();

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
    const prefabs = await loadPrefabsXmlByFile(file);
    loadingFiles.delete("prefabs.xml");
    prefabsFilterWorker.postMessage({ all: prefabs });
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
  ["input", "focus"].forEach((eventName) => {
    prefabsFilterInput.addEventListener(eventName, async () => {
      prefabsFilterWorker.postMessage({
        prefabsFilterString: prefabsFilterInput.value,
      });
    });
    blocksFilterInput.addEventListener(eventName, async () => {
      prefabsFilterWorker.postMessage({
        blocksFilterString: blocksFilterInput.value,
      });
    });
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

  // trigger by prefabs update
  prefabsFilterWorker.addEventListener("message", (event) => {
    if (event.data.prefabs) {
      mapRendererWorker.postMessage({ prefabs: event.data.prefabs });
    }
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
        const prefabs = await loadPrefabsXmlByFile(file);
        prefabsFilterWorker.postMessage({ all: prefabs });
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

  // flag mark
  mapCanvas.addEventListener("click", async (event) => {
    // in-game coords (center offset)
    const markCoords = {
      x: Math.round((event.offsetX * mapSizes.width) / mapCanvas.width - mapSizes.width / 2),
      z: -Math.round((event.offsetY * mapSizes.height) / mapCanvas.height - mapSizes.height / 2),
    };
    prefabsFilterWorker.postMessage({ markCoords });
    mapRendererWorker.postMessage({ markCoords });
  });
  resetMarkButton.addEventListener("click", async () => {
    prefabsFilterWorker.postMessage({ markCoords: null });
    mapRendererWorker.postMessage({ markCoords: null });
  });

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
          const all = await loadPrefabsXmlByUrl("sample_world/prefabs.xml");
          loadingFiles.delete("prefab.xml");
          prefabsFilterWorker.postMessage({ all });
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
  // prefab list updates
  // -------------------------------------------------
  let prefabListUl: HTMLUListElement;
  let restPrefabs: HighlightedPrefab[];
  const renderedPrefabsNum = 10;
  prefabsFilterWorker.addEventListener("message", async (event: { data: PrefabUpdate }) => {
    const { prefabs, status } = event.data;
    prefabsResultSpan.innerHTML = status;
    if (!prefabs) {
      return;
    }
    prefabListUl = document.createElement("ul");
    restPrefabs = prefabs;
    if (prefabListDiv.firstChild) {
      prefabListDiv.replaceChild(prefabListUl, prefabListDiv.firstChild);
    } else {
      prefabListDiv.appendChild(prefabListUl);
    }

    controllerDiv.addEventListener("scroll", showAllPrefabs, { once: true });
    await showHeadOfPrefabList();
  });
  async function showHeadOfPrefabList() {
    while (restPrefabs.length !== 0) {
      const scrollBottom = controllerDiv.offsetHeight + controllerDiv.scrollTop;
      if (scrollBottom + 100 < controllerDiv.scrollHeight) {
        return;
      }
      renderTailPrefabs();
      await waitAnimationFrame();
    }
  }
  // Note: showAllPrefabs loop could run in duplicate,
  // if new result come when showAllPrefabs are running
  // We can avoid it by some status check in the `while` loop condition.
  // But it will make the implementation too complex while it is not significant one.
  // So we don't take care it.
  async function showAllPrefabs() {
    while (restPrefabs.length !== 0) {
      renderTailPrefabs();
      await waitAnimationFrame();
    }
  }
  async function waitAnimationFrame() {
    return new Promise((r) => requestAnimationFrame(r));
  }
  function renderTailPrefabs() {
    const liCount = prefabListUl.getElementsByTagName("li");
    if (liCount.length >= 20000) {
      restPrefabs = [];
      prefabListUl.appendChild(warnLi("<strong>Abort: too many matching results</strong>"));
      return;
    }
    const head = restPrefabs.slice(0, renderedPrefabsNum);
    const tail = restPrefabs.slice(renderedPrefabsNum);
    const df = document.createDocumentFragment();
    head.forEach((p) => df.appendChild(prefabLi(p)));
    prefabListUl.appendChild(df);
    restPrefabs = tail;
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
  function warnLi(message: string) {
    const li = document.createElement("li");
    li.innerHTML = message;
    return li;
  }

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
    if (!inputContent) return;

    const target = document.getElementById(button.dataset.inputFor);
    if (!target || !(target instanceof HTMLInputElement)) return;
    target.value = inputContent;

    target.dispatchEvent(new Event("input"));
  });

  // Scroll with the mark at the center of the screen
  let markEvent: MouseEvent | null = null;
  let prevCanvasSize = { width: 0, height: 0 };
  mapCanvas.addEventListener("click", (e) => {
    markEvent = e;
  });
  resetMarkButton.addEventListener("click", () => {
    markEvent = null;
  });
  new MutationObserver((mutationsList) => {
    const widthMutation = mutationsList.find((m) => m.attributeName === "width");
    if (!widthMutation) return;
    const heightMutation = mutationsList.find((m) => m.attributeName === "height");
    if (!heightMutation) return;
    const newCanvasSize = {
      width: mapCanvas.width,
      height: mapCanvas.height,
    };
    if (!markEvent) {
      prevCanvasSize = newCanvasSize;
      return;
    }
    const markPosition = {
      offsetX: (markEvent.offsetX * newCanvasSize.width) / prevCanvasSize.width,
      offsetY: (markEvent.offsetY * newCanvasSize.height) / prevCanvasSize.height,
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
      width: controllerDiv.offsetLeft,
      height: window.innerHeight,
    };
    const scrollArg = {
      left: absMarkPosition.left - frameSize.width / 2,
      top: absMarkPosition.top - frameSize.height / 2,
    };
    window.scrollTo(scrollArg);
    prevCanvasSize = newCanvasSize;
  }).observe(mapCanvas, { attributes: true });

  // cursor/mark position
  let mapSizes = { width: 0, height: 0 };
  mapRendererWorker.addEventListener("message", (e: { data: MapRendererOutMessage }) => {
    if (e.data.mapSizes) {
      mapSizes = e.data.mapSizes;
    }
  });
  mapCanvas.addEventListener(
    "mousemove",
    (event) => {
      cursorCoodsSpan.textContent = formatCoords(event);
    },
    { passive: true }
  );
  mapCanvas.addEventListener("mouseout", () => {
    cursorCoodsSpan.textContent = formatCoords();
  });
  mapCanvas.addEventListener("click", async (event) => {
    markCoodsSpan.textContent = formatCoords(event);
  });
  resetMarkButton.addEventListener("click", async () => {
    markCoodsSpan.textContent = formatCoords();
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
    prefabsFilterInput.addEventListener(eventName, () => {
      document.body.classList.remove("disable-prefabs-filter");
      document.body.classList.add("disable-blocks-filter");
    });
    blocksFilterInput.addEventListener(eventName, () => {
      document.body.classList.remove("disable-blocks-filter");
      document.body.classList.add("disable-prefabs-filter");
    });
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

  function formatCoords({ offsetX, offsetY }: { offsetX?: number; offsetY?: number } = {}) {
    if (!offsetX || !offsetY) {
      return "E/W: -, N/S: -, Elev: -";
    }

    // relative coords on the canvas with left-top offset and these ranges should be [0, 1)
    const rx = offsetX / mapCanvas.width;
    const rz = offsetY / mapCanvas.height;
    if (rx < 0 || rx >= 1 || rz < 0 || rz >= 1) {
      return "E/W: -, N/S: -, Elev: -";
    }

    // coords with left-top offset
    const ox = rx * mapSizes.width;
    const oz = rz * mapSizes.height;

    // in-game coords (center offset)
    const x = Math.round(ox - mapSizes.width / 2);
    const z = Math.round(mapSizes.height / 2 - oz);

    if (dtmHandler.dtm) {
      const e = dtmHandler.dtm.getElevation(Math.round(ox), Math.round(oz), mapSizes.width);
      return `E/W: ${x}, N/S: ${z}, Elev: ${e}`;
    }
    return `E/W: ${x}, N/S: ${z}, Elev: -`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
