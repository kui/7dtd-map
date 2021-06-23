import {
  loadBitmapByFile,
  loadBitmapByUrl,
  loadSplatBitmapByFile,
  loadSplatBitmapByUrl,
  loadRadBitmapByFile,
  loadRadBitmapByUrl,
} from "./lib/bitmap-loader";
import {
  loadPrefabsXmlByFile,
  loadPrefabsXmlByUrl,
} from "./lib/prefabs-xml-loader";
import { loadDtmRawByFile, loadDtmRawGzByUrl, Dtm } from "./lib/dtm-loader";
function main() {
  const loadingIndicatorP = document.getElementById("loading_indicator");
  const controllerDiv = document.getElementById("controller");
  const cursorCoodsSpan = document.getElementById("cursor_coods");
  const markCoodsSpan = document.getElementById("mark_coods");
  const downloadButton = document.getElementById("download");
  const resetMarkButton = document.getElementById("reset_mark");
  const showBiomesInput = document.getElementById("show_biomes");
  const biomesInput = document.getElementById("biomes");
  const showSplat3Input = document.getElementById("show_splat3");
  const splat3Input = document.getElementById("splat3");
  const showSplat4Input = document.getElementById("show_splat4");
  const splat4Input = document.getElementById("splat4");
  const showRadInput = document.getElementById("show_radiation");
  const radInput = document.getElementById("radiation");
  const showPrefabsInput = document.getElementById("show_prefabs");
  const prefabsInput = document.getElementById("prefabs");
  const dtmInput = document.getElementById("dtm");
  const scaleInput = document.getElementById("scale");
  const signSizeInput = document.getElementById("sign_size");
  const brightnessInput = document.getElementById("brightness");
  const prefabsFilterInput = document.getElementById("prefabs_filter");
  const blocksFilterInput = document.getElementById("blocks_filter");
  const prefabsResultSpan = document.getElementById("prefabs_num");
  const prefabListDiv = document.getElementById("prefabs_list");
  const mapCanvas = document.getElementById("map");
  const sampleLoadButton = document.getElementById("sample_load");
  const mapRendererWorker = new Worker("map-renderer.js");
  const prefabsFilterWorker = new Worker("prefabs-filter.js");
  // init
  const rendererCanvas = (mapCanvas as any).transferControlToOffscreen();
  mapRendererWorker.postMessage(
    {
      canvas: rendererCanvas,
      showBiomes: (showBiomesInput as any).checked,
      showSplat3: (showSplat3Input as any).checked,
      showSplat4: (showSplat4Input as any).checked,
      showRad: (showRadInput as any).checked,
      showPrefabs: (showPrefabsInput as any).checked,
      signSize: (signSizeInput as any).value,
      brightness: `${(brightnessInput as any).value}%`,
      scale: (scaleInput as any).value,
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
  // -------------------------------------------------
  // map update events
  // -------------------------------------------------
  const loadingFiles = new Set();
  let dtm: any = null;
  // inputs
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  biomesInput.addEventListener("input", async () => {
    console.log("Load biome");
    loadingFiles.add("biomes.png");
    const biomesImg = await loadBitmapByFile(
      window,
      (biomesInput as any).files[0]
    );
    loadingFiles.delete("biomes.png");
    if (!biomesImg) return;
    mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  splat3Input.addEventListener("input", async () => {
    const file = (splat3Input as any).files[0];
    console.log("Load splat3");
    loadingFiles.add(file.name);
    const splat3Img = await loadSplatBitmapByFile(window, file);
    loadingFiles.delete(file.name);
    if (!splat3Img) return;
    mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  splat4Input.addEventListener("input", async () => {
    console.log("Load splat4");
    loadingFiles.add("splat4_processed.png");
    const splat4Img = await loadSplatBitmapByFile(
      window,
      (splat4Input as any).files[0]
    );
    loadingFiles.delete("splat4_processed.png");
    if (!splat4Img) return;
    mapRendererWorker.postMessage({ splat4Img }, [splat4Img]);
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  radInput.addEventListener("input", async () => {
    console.log("Load radiation");
    loadingFiles.add("radiation.png");
    const radImg = await loadRadBitmapByFile(
      window,
      (radInput as any).files[0]
    );
    loadingFiles.delete("radiation.png");
    if (!radImg) return;
    mapRendererWorker.postMessage({ radImg }, [radImg]);
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  prefabsInput.addEventListener("input", async () => {
    console.log("Load prefabs");
    loadingFiles.add("prefabs.xml");
    const prefabs = await loadPrefabsXmlByFile(
      window,
      (prefabsInput as any).files[0]
    );
    loadingFiles.delete("prefabs.xml");
    prefabsFilterWorker.postMessage({ all: prefabs });
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  dtmInput.addEventListener("input", async () => {
    loadingFiles.add("dtm.xml");
    handleDtmRaw(await loadDtmRawByFile(window, (dtmInput as any).files[0]));
    loadingFiles.delete("dtm.xml");
  });
  ["input", "focus"].forEach((eventName) => {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    prefabsFilterInput.addEventListener(eventName, async () => {
      prefabsFilterWorker.postMessage({
        prefabsFilterString: (prefabsFilterInput as any).value,
      });
    });
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    blocksFilterInput.addEventListener(eventName, async () => {
      prefabsFilterWorker.postMessage({
        blocksFilterString: (blocksFilterInput as any).value,
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
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    e.addEventListener("input", () => {
      mapRendererWorker.postMessage({
        showBiomes: (showBiomesInput as any).checked,
        showSplat3: (showSplat3Input as any).checked,
        showSplat4: (showSplat4Input as any).checked,
        showRad: (showRadInput as any).checked,
        showPrefabs: (showPrefabsInput as any).checked,
        signSize: (signSizeInput as any).value,
        brightness: `${(brightnessInput as any).value}%`,
        scale: (scaleInput as any).value,
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
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    let files = Array.from(event.dataTransfer.files);
    const hasSplat3ProcessedPng = files.some(
      (f) => f.name === "splat3_processed.png"
    );
    if (hasSplat3ProcessedPng) {
      console.log(
        'Ignore "splat3.png" because "splat3_processed.png" was given.' +
          " Because `splat3.png` is a subset data of `splat3_processed.png`."
      );
    }
    files = files.filter(
      (f) => !hasSplat3ProcessedPng || f.name !== "splat3.png"
    );
    await sequential(files.map((f) => () => handleDroppedFiles(f)));
  });
  async function sequential(promiseGenerators: any) {
    await promiseGenerators.reduce(
      (prevPromise: any, generator: any) => prevPromise.then(() => generator()),
      Promise.resolve()
    );
  }
  async function handleDroppedFiles(file: any) {
    loadingFiles.add(file.name);
    try {
      console.time(file.name);
      if (file.name === "biomes.png") {
        const biomesImg = await loadBitmapByFile(window, file);
        mapRendererWorker.postMessage({ biomesImg }, [biomesImg]);
        (biomesInput as any).value = "";
      } else if (
        file.name === "splat3.png" ||
        file.name === "splat3_processed.png"
      ) {
        const splat3Img = await loadSplatBitmapByFile(window, file);
        mapRendererWorker.postMessage({ splat3Img }, [splat3Img]);
        (splat3Input as any).value = "";
      } else if (file.name === "splat4_processed.png") {
        const splat4Img = await loadSplatBitmapByFile(window, file);
        mapRendererWorker.postMessage({ splat4Img }, [splat4Img]);
        (splat4Input as any).value = "";
      } else if (file.name === "radiation.png") {
        const radImg = await loadRadBitmapByFile(window, file);
        mapRendererWorker.postMessage({ radImg }, [radImg]);
        (radInput as any).value = "";
      } else if (file.name === "prefabs.xml") {
        const prefabs = await loadPrefabsXmlByFile(window, file);
        prefabsFilterWorker.postMessage({ all: prefabs });
        (prefabsInput as any).value = "";
      } else if (file.name === "dtm.raw") {
        handleDtmRaw(await loadDtmRawByFile(window, file));
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
  function handleDtmRaw(dtmRaw: any) {
    if (!dtmRaw) {
      dtm = null;
      return;
    }
    dtm = new Dtm(dtmRaw, mapSizes.width);
    // const copiedDtmRaw = dtmRaw.slice(0);
    // mapRendererWorker.postMessage({ dtm: copiedDtmRaw }, [copiedDtmRaw]);
  }
  // flag mark
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  mapCanvas.addEventListener("click", async (event) => {
    // in-game coords (center offset)
    const markCoords = {
      x: Math.round(
        (event.offsetX * mapSizes.width) / (mapCanvas as any).width -
          mapSizes.width / 2
      ),
      z: -Math.round(
        (event.offsetY * mapSizes.height) / (mapCanvas as any).height -
          mapSizes.height / 2
      ),
    };
    prefabsFilterWorker.postMessage({ markCoords });
    mapRendererWorker.postMessage({ markCoords });
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  resetMarkButton.addEventListener("click", async () => {
    prefabsFilterWorker.postMessage({ markCoords: null });
    mapRendererWorker.postMessage({ markCoords: null });
  });
  // sample load
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  sampleLoadButton.addEventListener("click", async () => {
    (sampleLoadButton as any).disabled = true;
    await sequential([
      async () => {
        loadingFiles.add("biomes.png");
        mapRendererWorker.postMessage({
          biomesImg: await loadBitmapByUrl(window, "sample_world/biomes.png"),
        });
        loadingFiles.delete("biomes.png");
      },
      async () => {
        loadingFiles.add("splat3_processed.png");
        mapRendererWorker.postMessage({
          splat3Img: await loadSplatBitmapByUrl(
            window,
            "sample_world/splat3_processed.png"
          ),
        });
        loadingFiles.delete("splat3_processed.png");
      },
      async () => {
        loadingFiles.add("splat4_processed.png");
        mapRendererWorker.postMessage({
          splat4Img: await loadSplatBitmapByUrl(
            window,
            "sample_world/splat4_processed.png"
          ),
        });
        loadingFiles.delete("splat4_processed.png");
      },
      async () => {
        loadingFiles.add("radiation.png");
        mapRendererWorker.postMessage({
          radImg: await loadRadBitmapByUrl(
            window,
            "sample_world/radiation.png"
          ),
        });
        loadingFiles.delete("radiation.png");
      },
      async () => {
        loadingFiles.add("prefab.xml");
        const all = await loadPrefabsXmlByUrl(
          window,
          "sample_world/prefabs.xml"
        );
        loadingFiles.delete("prefab.xml");
        prefabsFilterWorker.postMessage({ all });
      },
      async () => {
        loadingFiles.add("dtm.raw");
        handleDtmRaw(
          await loadDtmRawGzByUrl(window, "sample_world/dtm.raw.gz")
        );
        loadingFiles.delete("dtm.raw");
      },
    ]);
    (sampleLoadButton as any).disabled = false;
  });
  // -------------------------------------------------
  // prefab list updates
  // -------------------------------------------------
  let prefabListUl: any;
  let restPrefabs: any;
  let isShowedAllPrefabs = true;
  const renderedPrefabsNum = 10;
  prefabsFilterWorker.addEventListener("message", async (event) => {
    const { prefabs, status } = event.data;
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    prefabsResultSpan.innerHTML = status;
    if (!prefabs) {
      return;
    }
    prefabListUl = document.createElement("ul");
    restPrefabs = prefabs;
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    prefabListDiv.replaceChild(prefabListUl, prefabListDiv.firstChild);
    // Show a part of result until the scroll bar are shown
    await showHeadOfPrefabList();
    // Shows all results, once scrolled.
    if (isShowedAllPrefabs) {
      isShowedAllPrefabs = false;
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      controllerDiv.addEventListener(
        "scroll",
        () => {
          isShowedAllPrefabs = true;
          showAllPrefabs();
        },
        { once: true }
      );
    }
  });
  async function showHeadOfPrefabList() {
    while (restPrefabs.length !== 0) {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      const scrollBottom = controllerDiv.offsetHeight + controllerDiv.scrollTop;
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
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
      prefabListUl.appendChild(
        warnLi("<strong>Abort: too many matching results</strong>")
      );
      return;
    }
    const [head, tail] = [
      restPrefabs.slice(0, renderedPrefabsNum),
      restPrefabs.slice(renderedPrefabsNum),
    ];
    const df = document.createDocumentFragment();
    head.forEach((p: any) => df.appendChild(prefabLi(p)));
    prefabListUl.appendChild(df);
    restPrefabs = tail;
  }
  function prefabLi(prefab: any) {
    const li = document.createElement("li");
    li.innerHTML = [
      `<button data-input-for="prefabs_filter" data-input-text="${prefab.name}" title="Filter with this prefab name">▲</button>`,
      `${prefab.dist ? `${formatDist(prefab.dist)},` : ""}`,
      `<a href="prefabs/${prefab.name}.html" target="_blank">${
        prefab.highlightedName || prefab.name
      }</a>`,
      `(${prefab.x}, ${prefab.y})`,
    ].join(" ");
    if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
      const blocksUl = document.createElement("ul");
      prefab.matchedBlocks.forEach((block: any) => {
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
  function warnLi(message: any) {
    const li = document.createElement("li");
    li.innerHTML = message;
    return li;
  }
  // -------------------------------------------------
  // other model updates
  // -------------------------------------------------
  // preset input button
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  controllerDiv.addEventListener("click", (event) => {
    const button = event.srcElement;
    if ((button as any).dataset.inputFor == null) {
      return;
    }
    const target = document.getElementById((button as any).dataset.inputFor);
    if (!target) {
      return;
    }
    if ((button as any).dataset.inputText == null) {
      (target as any).value = (button as any).textContent;
    } else {
      (target as any).value = (button as any).dataset.inputText;
    }
    target.dispatchEvent(new Event("input"));
  });
  // Scroll with the mark at the center of the screen
  let markPosition: any = null;
  let prevCanvasSize = { width: 0, height: 0 };
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  mapCanvas.addEventListener("click", (e) => {
    markPosition = e;
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  resetMarkButton.addEventListener("click", () => {
    markPosition = null;
  });
  new MutationObserver((mutationsList) => {
    const widthMutation = mutationsList.find(
      (m) => m.attributeName === "width"
    );
    if (!widthMutation) return;
    const heightMutation = mutationsList.find(
      (m) => m.attributeName === "height"
    );
    if (!heightMutation) return;
    const newCanvasSize = {
      width: (mapCanvas as any).width,
      height: (mapCanvas as any).height,
    };
    if (!markPosition) {
      prevCanvasSize = newCanvasSize;
      return;
    }
    markPosition = {
      offsetX:
        (markPosition.offsetX * newCanvasSize.width) / prevCanvasSize.width,
      offsetY:
        (markPosition.offsetY * newCanvasSize.height) / prevCanvasSize.height,
    };
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
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
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      width: controllerDiv.offsetLeft,
      height: window.innerHeight,
    };
    const scrollArg = {
      left: absMarkPosition.left - frameSize.width / 2,
      top: absMarkPosition.top - frameSize.height / 2,
    };
    window.scrollTo(scrollArg);
    prevCanvasSize = newCanvasSize;
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'HTMLElement | null' is not assig... Remove this comment to see the full error message
  }).observe(mapCanvas, { attributes: true });
  // range value display
  Array.from(document.querySelectorAll("[data-source-input")).forEach(
    (display) => {
      const sourceInput = document.querySelector(
        `#${(display as any).dataset.sourceInput}`
      );
      display.textContent = (sourceInput as any).value;
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      sourceInput.addEventListener("input", () => {
        display.textContent = (sourceInput as any).value;
      });
    }
  );
  // cursor/mark position
  let mapSizes = { width: 0, height: 0 };
  mapRendererWorker.addEventListener("message", (event) => {
    if (event.data.mapSizes) {
      ({ mapSizes } = event.data);
    }
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  mapCanvas.addEventListener(
    "mousemove",
    (event) => {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      cursorCoodsSpan.textContent = formatCoords(event);
    },
    { passive: true }
  );
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  mapCanvas.addEventListener("mouseout", () => {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    cursorCoodsSpan.textContent = formatCoords();
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  mapCanvas.addEventListener("click", async (event) => {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    markCoodsSpan.textContent = formatCoords(event);
  });
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  resetMarkButton.addEventListener("click", async () => {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    markCoodsSpan.textContent = formatCoords();
  });
  // download
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  downloadButton.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = (mapCanvas as any).toDataURL("image/png");
    a.download = "7DtD-renderer.png";
    a.click();
  });
  // -------------------------------------------------
  // style handlers
  // -------------------------------------------------
  // filter input appearance
  ["input", "focus"].forEach((eventName) => {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    prefabsFilterInput.addEventListener(eventName, () => {
      document.body.classList.remove("disable-prefabs-filter");
      document.body.classList.add("disable-blocks-filter");
    });
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    blocksFilterInput.addEventListener(eventName, () => {
      document.body.classList.remove("disable-blocks-filter");
      document.body.classList.add("disable-prefabs-filter");
    });
  });
  // drag and drop
  document.addEventListener("dragenter", (event) => {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    document.body.classList.add("dragovered");
  });
  document.addEventListener("dragover", (event) => {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    event.dataTransfer.dropEffect = "copy";
    document.body.classList.add("dragovered");
  });
  document.addEventListener("dragleave", (event) => {
    // "dragleave" events raise even if the cursor moved on child nodes.
    // To avoid this case, we should confirm cursor positions.
    // Those are zero if the cursor moved out from the browser window.
    if (event.clientX !== 0 || event.clientY !== 0) {
      return;
    }
    event.preventDefault();
    document.body.classList.remove("dragovered");
  });
  document.addEventListener("drop", async (event) => {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (!event.dataTransfer.types.includes("Files")) {
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
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      loadingIndicatorP.textContent = "-";
    } else {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      loadingIndicatorP.textContent = `Loading: ${Array.from(loadingFiles).join(
        ", "
      )}`;
    }
    requestAnimationFrame(updateLoadingIndicator);
  }
  updateLoadingIndicator();
  function formatCoords({ offsetX, offsetY }: any = {}) {
    if (!offsetX || !offsetY) {
      return "E/W: -, N/S: -, Elev: -";
    }
    // relative coords on the canvas with left-top offset and these ranges should be [0, 1)
    const rx = offsetX / (mapCanvas as any).width;
    const rz = offsetY / (mapCanvas as any).height;
    if (rx < 0 || rx >= 1 || rz < 0 || rz >= 1) {
      return "E/W: -, N/S: -, Elev: -";
    }
    // coords with left-top offset
    const ox = rx * mapSizes.width;
    const oz = rz * mapSizes.height;
    // in-game coords (center offset)
    const x = Math.round(ox - mapSizes.width / 2);
    const z = Math.round(mapSizes.height / 2 - oz);
    if (dtm) {
      dtm.width = mapSizes.width;
      const e = dtm.getElevation(Math.round(ox), Math.round(oz));
      return `E/W: ${x}, N/S: ${z}, Elev: ${e}`;
    }
    return `E/W: ${x}, N/S: ${z}, Elev: -`;
  }
  function formatDist(dist: any) {
    if (dist < 1000) {
      return `${dist}m`;
    }
    return `${(dist / 1000).toFixed(2)}km`;
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
