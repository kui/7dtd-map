"use strict";
(() => {
  // src/lib/ui/copy-button.ts
  function init() {
    for (let button of Array.from(document.querySelectorAll("[data-copy-for]"))) {
      if (!(button instanceof HTMLButtonElement)) continue;
      let targetId = button.dataset.copyFor;
      if (!targetId) continue;
      let target = document.getElementById(targetId);
      target && (button.addEventListener("click", () => {
        copy(target, button);
      }), button.addEventListener("mouseover", () => {
        selectNode(target);
      }), button.addEventListener(
        "mousemove",
        () => {
          selectNode(target);
        },
        { passive: !0 }
      ), button.addEventListener("mouseout", () => {
        clearSelection();
      }));
    }
  }
  var DEFAULT_SUCCESS_MESSAGE = "Copied!", DEFAULT_FAILURE_MESSAGE = "\u26A0Failure";
  function copy(target, button) {
    selectNode(target);
    let commandResult = document.execCommand("copy");
    commandResult ? (console.log("Copy Success", target), button.dataset.message = button.dataset.successMessage ?? DEFAULT_SUCCESS_MESSAGE) : (console.log("Copy Failure", target), button.dataset.message = button.dataset.failureMessage ?? DEFAULT_FAILURE_MESSAGE), console.log(commandResult);
  }
  function selectNode(target) {
    let selection = getSelection();
    selection?.removeAllRanges();
    let range = document.createRange();
    range.selectNodeContents(target), selection?.addRange(range);
  }
  function clearSelection() {
    getSelection()?.removeAllRanges();
  }

  // src/lib/utils.ts
  function requireNonnull(t, errorMessage = () => `Unexpected state: ${String(t)}`) {
    if (t == null) throw Error(errorMessage());
    return t;
  }
  function requireType(o, t, errorMessage = () => `Unexpected type: expected as ${String(t)}, but actual type ${String(o)}`) {
    if (o instanceof t) return o;
    throw Error(errorMessage());
  }
  function component(id, t) {
    let i = requireNonnull(id, () => "Unexpected argument: id is null"), e = requireNonnull(document.getElementById(i), () => `Element not found: #${i}`);
    return t ? requireType(e, t) : e;
  }
  function humanreadableDistance(d) {
    return d < 1e3 ? `${d.toString()}m` : `${(d / 1e3).toFixed(2)}km`;
  }
  function waitAnimationFrame() {
    return new Promise((r) => requestAnimationFrame(r));
  }
  async function formatCoords(map, canvas, elevation, event) {
    if (!event || !map) return "E/W: -, N/S: -, Elev: -";
    let gameCoords2 = canvasEventToGameCoords(event, map, canvas);
    if (gameCoords2 === null) return "E/W: -, N/S: -, Elev: -";
    let y = await elevation(gameCoords2) ?? "-";
    return `E/W: ${gameCoords2.x.toString()}, N/S: ${gameCoords2.z.toString()}, Elev: ${y.toString()}`;
  }
  function downloadCanvasPng(fileName, canvas) {
    let a = document.createElement("a");
    a.download = fileName, a.href = canvas.toDataURL("image/png"), a.click();
  }
  async function sleep(msec) {
    return new Promise((r) => setTimeout(r, msec));
  }
  function gameMapSize(s) {
    return { type: "game", ...s };
  }
  function gameCoords(c) {
    return { type: "game", ...c };
  }
  function canvasEventToGameCoords(event, mapSize, canvasSize) {
    let gx = event.offsetX * mapSize.width / canvasSize.width, gz = event.offsetY * mapSize.height / canvasSize.height;
    if (gx < 0 || gx >= mapSize.width || gz < 0 || gz >= mapSize.height)
      return null;
    let x = gx - Math.floor(mapSize.width / 2), z = Math.floor(mapSize.height / 2) - gz;
    return gameCoords({ x: Math.round(x), z: Math.round(z) });
  }
  function threePlaneSize(width, height) {
    return { type: "threePlane", width, height };
  }
  function printError(e) {
    console.error(e);
  }
  async function fetchJson(url) {
    let r = await fetch(url);
    if (!r.ok) throw Error(`Failed to fetch ${url}: ${r.statusText}`);
    return await r.json();
  }
  function basename(path) {
    return path.substring(path.lastIndexOf("/") + 1);
  }

  // src/lib/ui/preset-button.ts
  function init2() {
    document.body.addEventListener("click", ({ target }) => {
      if (target instanceof HTMLButtonElement && target.dataset.inputFor != null) {
        let input = component(target.dataset.inputFor, HTMLInputElement);
        input.value = requireNonnull(target.dataset.inputText ?? target.textContent), input.dispatchEvent(new Event("input", { bubbles: !0 }));
      }
    });
  }

  // src/lib/ui/dialog-buttons.ts
  function init3() {
    for (let button of document.querySelectorAll("button[data-show-dialog-for]"))
      button.addEventListener("click", () => {
        let dialogId = button.dataset.showDialogFor;
        if (!dialogId) return;
        let dialog = document.getElementById(dialogId);
        if (!dialog) throw Error(`Dialog not found: ${dialogId}`);
        if (!(dialog instanceof HTMLDialogElement)) throw Error(`Unexpected element: ${dialogId}`);
        dialog.showModal();
      });
    for (let button of document.querySelectorAll("button[data-close-dialog-for]"))
      button.addEventListener("click", () => {
        let dialogId = button.dataset.closeDialogFor;
        if (dialogId == null) return;
        let dialog = dialogId === "" ? button.closest("dialog") : document.getElementById(dialogId);
        if (!dialog) throw Error(`Dialog not found: ${dialogId}`);
        if (!(dialog instanceof HTMLDialogElement)) throw Error(`Unexpected element: ${dialogId}`);
        dialog.close("");
      });
  }

  // src/lib/ui/sync-output.ts
  function init4() {
    for (let eventName of ["input", "change"])
      window.addEventListener(eventName, ({ target }) => {
        if (!(target instanceof HTMLInputElement) || !(target instanceof HTMLTextAreaElement || !(target instanceof HTMLSelectElement)))
          return;
        let outputElements = document.querySelectorAll(`output[data-sync-for="${target.id}"]`);
        for (let output of outputElements)
          output.value = target.value;
      });
    for (let output of document.querySelectorAll("output[data-sync-for]")) {
      let input = component(output.dataset.syncFor, HTMLInputElement);
      output.value = input.value;
    }
  }

  // src/lib/ui/remember-value.ts
  function init5() {
    for (let eventName of ["input", "change"])
      window.addEventListener(eventName, ({ target }) => {
        if (!(target instanceof HTMLInputElement) || !(target instanceof HTMLTextAreaElement || !(target instanceof HTMLSelectElement)))
          return;
        let key = target.dataset.remember;
        key && localStorage.setItem(key, target.value);
      });
    for (let input of document.querySelectorAll("input[data-remember]")) {
      let key = input.dataset.remember;
      if (key === void 0) continue;
      let value = localStorage.getItem(key);
      value !== null && (input.value = value);
    }
  }

  // src/lib/ui/min-max-inputs.ts
  function init6() {
    for (let eventName of ["input", "change"])
      window.addEventListener(eventName, ({ target }) => {
        target instanceof HTMLInputElement && updateMinMax(target);
      });
    for (let input of [
      ...document.querySelectorAll("input[data-max]"),
      ...document.querySelectorAll("input[data-min]")
    ])
      updateMinMax(input);
  }
  function updateMinMax(target) {
    target.dataset.min && updateMaxValues(target, target.dataset.min), target.dataset.max && updateMinValues(target, target.dataset.max);
  }
  function updateMaxValues(target, minMaxId) {
    let maxInputs = document.querySelectorAll(`input[data-max="${minMaxId}"]`);
    for (let maxInput of maxInputs)
      if (maxInput.valueAsNumber < target.valueAsNumber) {
        let oldValue = maxInput.value;
        maxInput.value = target.value, oldValue !== maxInput.value && dispatchInputEvent(maxInput);
      }
  }
  function updateMinValues(target, minMaxId) {
    let minInputs = document.querySelectorAll(`input[data-min="${minMaxId}"]`);
    for (let minInput of minInputs)
      if (minInput.valueAsNumber > target.valueAsNumber) {
        let oldValue = minInput.value;
        minInput.value = target.value, oldValue !== minInput.value && dispatchInputEvent(minInput);
      }
  }
  function dispatchInputEvent(input) {
    for (let eventName of ["input", "change"]) input.dispatchEvent(new Event(eventName, { bubbles: !0 }));
  }

  // src/lib/labels.ts
  var LANGUAGES = [
    "english",
    "german",
    "spanish",
    "french",
    "italian",
    "japanese",
    "koreana",
    "polish",
    "brazilian",
    "russian",
    "turkish",
    "schinese",
    "tchinese"
  ], LANGUAGE_TAGS = {
    en: "english",
    de: "german",
    es: "spanish",
    fr: "french",
    it: "italian",
    ja: "japanese",
    ko: "koreana",
    pl: "polish",
    pt: "brazilian",
    ru: "russian",
    tr: "turkish",
    "zh-CN": "schinese",
    "zh-TW": "tchinese"
  }, FILE_BASE_NAMES = ["blocks", "prefabs", "shapes"], LabelHolder = class _LabelHolder {
    static DEFAULT_LANGUAGE = "english";
    #baseUrl;
    #language;
    #fallbacks;
    #labels;
    constructor(baseUrl, navigatorLanguages) {
      this.#baseUrl = baseUrl, this.#language = resolveLanguage(navigatorLanguages), this.#fallbacks = new Map(FILE_BASE_NAMES.map((n) => [n, this.#fetchLabelMap(_LabelHolder.DEFAULT_LANGUAGE, n)])), this.#labels = this.#buildAllLabels();
    }
    get(fileId) {
      let labels = this.#labels.get(fileId);
      if (!labels) throw new Error(`No labels for ${this.#language}/${fileId}`);
      return labels;
    }
    set language(lang) {
      lang !== this.#language && (console.log("LabelHolder set language: %s -> %s", this.#language, lang), this.#language = lang, this.#labels = this.#buildAllLabels());
    }
    #buildAllLabels() {
      return new Map(FILE_BASE_NAMES.map((n) => [n, this.#buildLabels(n)]));
    }
    async #buildLabels(fileBaseName) {
      let fallback = this.#fallbacks.get(fileBaseName);
      if (!fallback) throw new Error(`No fallback for ${this.#language}/${fileBaseName}`);
      return new Labels(await this.#fetchLabelMap(this.#language, fileBaseName), await fallback);
    }
    async #fetchLabelMap(language, fileId) {
      return new Map(Object.entries(await fetchJson(`${this.#baseUrl}/${language}/${fileId}.json`)));
    }
  }, Labels = class {
    #labels;
    #fallback;
    constructor(labels, defaultLabels) {
      this.#labels = labels, this.#fallback = defaultLabels;
    }
    get(key) {
      return this.#labels.get(key) ?? this.#fallback.get(key);
    }
  };
  function resolveLanguage(languages) {
    for (let clientTag of languages)
      for (let [tag, lang] of Object.entries(LANGUAGE_TAGS))
        if (clientTag.startsWith(tag)) return lang;
    return LabelHolder.DEFAULT_LANGUAGE;
  }

  // src/lib/label-handler.ts
  var LabelHandler = class {
    doms;
    listener = [];
    constructor(doms, navigatorLanguages) {
      this.doms = doms, this.buildSelectOptions(navigatorLanguages), this.doms.language.addEventListener("change", () => {
        this.listener.forEach((fn) => {
          fn(this.doms.language.value)?.catch(printError);
        });
      });
    }
    buildSelectOptions(navigatorLanguages) {
      let existingLangs = new Set(Array.from(this.doms.language.options).map((o) => o.value));
      for (let lang of LANGUAGES) {
        if (existingLangs.has(lang))
          continue;
        let option = document.createElement("option");
        option.textContent = lang, this.doms.language.appendChild(option);
      }
      let browserLang = resolveLanguage(navigatorLanguages);
      this.doms.language.value !== browserLang && (this.doms.language.value = resolveLanguage(navigatorLanguages), requestAnimationFrame(() => this.doms.language.dispatchEvent(new Event("change"))));
    }
    addListener(fn) {
      this.listener.push(fn);
    }
  };

  // src/index/dialog-handler.ts
  var STATUS = ["dragover", "processing", "error"], DialogHandler = class {
    #doms;
    #radioList;
    constructor(doms) {
      this.#doms = doms, this.#radioList = requireType(
        requireNonnull(doms.dialog.querySelector("form")?.elements.namedItem("active-section"), () => "Unexpected dialog content"),
        RadioNodeList
      );
    }
    open() {
      this.#doms.dialog.showModal();
    }
    close() {
      this.#doms.dialog.close();
    }
    createProgression(taskNames) {
      this.#doms.processingFiles.innerHTML = "";
      let indicator = new FileProgressionIndicator(taskNames);
      return this.#doms.processingFiles.append(...indicator.liList), indicator;
    }
    get state() {
      if (STATUS.includes(this.#radioList.value))
        return this.#radioList.value;
      throw Error(`Unexpected state: ${this.#radioList.value}`);
    }
    set state(state) {
      this.#radioList.value = state;
    }
    get isOpen() {
      return this.#doms.dialog.open;
    }
  }, TERMINATED_STATES = ["completed", "skipped"], FileProgressionIndicator = class {
    #liList = [];
    constructor(taskNames) {
      this.#liList = taskNames.map((taskName) => {
        let li = document.createElement("li");
        return li.textContent = taskName, li.classList.add("processing"), li;
      });
    }
    setState(taskName, state) {
      let li = this.#liList.find((li2) => li2.textContent === taskName);
      li && (li.classList.replace("processing", state), console.log(state, taskName)), this.isAllCompleted && console.log("All completed");
    }
    get isAllCompleted() {
      return this.#liList.every((li) => TERMINATED_STATES.find((state) => li.classList.contains(state)));
    }
    get liList() {
      return this.#liList;
    }
  };

  // src/lib/cache-holder.ts
  var NO_VALUE = Symbol("NO_VALUE"), CacheHolder = class {
    #fetcher;
    #deconstructor;
    #age;
    #value = NO_VALUE;
    #fetchPromise = null;
    #expirationTimeout = null;
    #lastInvalidation = Date.now();
    constructor(fetcher, deconstructor, age = 1e4) {
      this.#fetcher = fetcher, this.#deconstructor = deconstructor, this.#age = age;
    }
    /**
     * Get the value from the cache.
     *
     * If the value is not in the cache, it is fetched and stored.
     */
    async get() {
      try {
        return this.#value === NO_VALUE ? await this.#fetch() : this.#value;
      } finally {
        this.#resetTimer();
      }
    }
    async #fetch() {
      if (this.#fetchPromise) return this.#fetchPromise;
      this.#fetchPromise = this.#fetchUntilNoInvalidation();
      try {
        this.#value = await this.#fetchPromise;
      } finally {
        this.#fetchPromise = null;
      }
      return this.#value;
    }
    async #fetchUntilNoInvalidation() {
      let now, value;
      do
        now = Date.now(), value = await this.#fetcher();
      while (now < this.#lastInvalidation);
      return value;
    }
    /**
     * Invalidate the cache.
     */
    invalidate() {
      this.#value !== NO_VALUE && (this.#deconstructor(this.#value), this.#value = NO_VALUE), this.#expirationTimeout && clearTimeout(this.#expirationTimeout), this.#expirationTimeout = null, this.#lastInvalidation = Date.now();
    }
    #resetTimer() {
      this.#expirationTimeout && clearTimeout(this.#expirationTimeout), this.#expirationTimeout = setTimeout(() => {
        this.invalidate();
      }, this.#age);
    }
  };

  // src/lib/storage.ts
  var WORKSPACE_DIR = "workspace";
  async function workspaceDir() {
    let root = await navigator.storage.getDirectory();
    return new MapDir(await root.getDirectoryHandle(WORKSPACE_DIR, { create: !0 }));
  }
  var MapDir = class {
    #dir;
    constructor(dir) {
      this.#dir = dir;
    }
    get name() {
      return this.#dir.name;
    }
    async put(name, data) {
      console.debug("put", name);
      let writable = await (await this.#dir.getFileHandle(name, { create: !0 })).createWritable();
      data instanceof ArrayBuffer || data instanceof Blob ? await writable.write(data) : await data.pipeTo(writable), await writable.close();
    }
    async createWritable(name) {
      return await (await this.#dir.getFileHandle(name, { create: !0 })).createWritable();
    }
    async get(name) {
      console.debug("get", name);
      try {
        return await (await this.#dir.getFileHandle(name)).getFile();
      } catch (e) {
        if (e instanceof DOMException && e.name === "NotFoundError")
          return null;
        throw e;
      }
    }
    async size(name) {
      return (await (await this.#dir.getFileHandle(name)).getFile()).size;
    }
    async remove(name) {
      await this.#dir.removeEntry(name);
    }
  };

  // src/index/dtm-handler.ts
  var DtmHandler = class {
    #dtmRaw;
    #mapSize = new CacheHolder(
      () => getHightMapSize(),
      () => {
      }
    );
    constructor(workerFactory, fileHandler) {
      this.#dtmRaw = new CacheHolder(
        async () => {
          let worker = workerFactory();
          return new Promise((resolve) => {
            worker.addEventListener("message", ({ data }) => {
              worker.terminate(), resolve(data);
            });
          });
        },
        () => {
        }
      ), fileHandler.addListener((fileNames) => {
        fileNames.includes("dtm_block.raw.gz") && this.#dtmRaw.invalidate(), fileNames.includes("map_info.xml") && this.#mapSize.invalidate();
      });
    }
    async size() {
      return this.#mapSize.get();
    }
    async getElevation(coords) {
      let size = await this.#mapSize.get();
      return size ? new Dtm(await this.#dtmRaw.get(), size).getElevation(coords) : null;
    }
    async writeZ(geo) {
      let size = await this.#mapSize.get();
      size && new Dtm(await this.#dtmRaw.get(), size).writeZ(geo);
    }
  }, Dtm = class {
    #data;
    #mapSize;
    constructor(dtmBlockRaw, mapSize) {
      this.#data = dtmBlockRaw, this.#mapSize = mapSize;
    }
    get size() {
      return this.#mapSize;
    }
    getElevation(coords) {
      if (!this.#data) return null;
      let { width, height } = this.#mapSize;
      if (this.#data.byteLength % width !== 0 || this.#data.byteLength / width !== height)
        return console.warn(
          "Game map size does not match with DTM byte array length:",
          "mapSize=",
          this.#mapSize,
          "data.byteLength=",
          this.#data.byteLength
        ), null;
      let x = Math.floor(width / 2) + coords.x, z = Math.floor(height / 2) + coords.z;
      return this.#data[x + z * width] ?? null;
    }
    writeZ(geo) {
      if (!this.#data) return;
      let pos = requireNonnull(geo.attributes.position, () => "No position attribute");
      if (pos.itemSize !== 3) throw Error("Unexpected item size of position attribute");
      let scaleFactor = (this.#mapSize.width - 1) / geo.parameters.width;
      for (let i = 0; i < pos.count; i++) {
        let dataX = Math.round((pos.getX(i) + geo.parameters.width / 2) * scaleFactor), dataZ = Math.round((pos.getY(i) + geo.parameters.height / 2) * scaleFactor), elev = this.#data[dataX + dataZ * this.#mapSize.width] / scaleFactor;
        pos.setZ(i, elev);
      }
    }
  };
  async function getHightMapSize() {
    let file = await (await workspaceDir()).get("map_info.xml");
    if (!file) return null;
    let size = new DOMParser().parseFromString(await file.text(), "application/xml").querySelector("property[name=HeightMapSize]")?.getAttribute("value");
    if (!size)
      return console.warn("HeightMapSize not found in map_info.xml"), null;
    let [width, height] = size.split(",").map((s) => parseInt(s));
    return !width || isNaN(width) || !height || isNaN(height) ? (console.warn("Invalid HeightMapSize: size=", size, "width=", width, "height=", height), null) : gameMapSize({ width, height });
  }

  // src/index/prefabs-handler.ts
  var PrefabsHandler = class {
    #listeners = [];
    #tierRange;
    constructor(doms, worker, markerHandler, labelHandler, fileHandler, fetchDifficulties) {
      this.#tierRange = { start: doms.minTier.valueAsNumber, end: doms.maxTier.valueAsNumber }, worker.addEventListener("message", (event) => {
        let { prefabs, status } = event.data;
        doms.status.textContent = status, Promise.allSettled(this.#listeners.map((fn) => fn(prefabs))).catch(printError);
      }), doms.minTier.addEventListener("input", () => {
        let newMinTier = doms.minTier.valueAsNumber;
        newMinTier !== this.#tierRange.start && (this.#tierRange.start = newMinTier, worker.postMessage({ difficulty: this.#tierRange }));
      }), doms.maxTier.addEventListener("input", () => {
        let newMaxTier = doms.maxTier.valueAsNumber;
        newMaxTier !== this.#tierRange.end && (this.#tierRange.end = newMaxTier, worker.postMessage({ difficulty: this.#tierRange }));
      }), doms.prefabFilter.addEventListener("input", () => {
        worker.postMessage({ prefabFilterRegexp: doms.prefabFilter.value });
      }), doms.blockFilter.addEventListener("input", () => {
        worker.postMessage({ blockFilterRegexp: doms.blockFilter.value });
      }), markerHandler.addListener((markCoords) => {
        worker.postMessage({ markCoords });
      }), labelHandler.addListener((language) => {
        worker.postMessage({ language });
      }), fileHandler.addListener(async (fileNames) => {
        fileNames.includes("prefabs.xml") && worker.postMessage({ all: await loadPrefabsXml(fetchDifficulties()) });
      });
    }
    addListener(fn) {
      this.#listeners.push(fn);
    }
  };
  async function loadPrefabsXml(difficulties) {
    let prefabsXml = await (await workspaceDir()).get("prefabs.xml");
    return prefabsXml ? parseXml(...await Promise.all([prefabsXml.text(), difficulties])) : [];
  }
  function parseXml(xml, difficulties) {
    let dom = new DOMParser().parseFromString(xml, "text/xml");
    return Array.from(dom.getElementsByTagName("decoration")).flatMap((e) => {
      let position = e.getAttribute("position")?.split(",");
      if (!position || position.length !== 3) return [];
      let [x, , z] = position;
      if (!x || !z) return [];
      let name = e.getAttribute("name");
      return name ? {
        name,
        x: parseInt(x),
        z: parseInt(z),
        difficulty: difficulties[name] ?? 0
      } : [];
    });
  }

  // src/lib/delayed-renderer.ts
  var DelayedRenderer = class {
    _iterator = [][Symbol.iterator]();
    appendee;
    scrollableWrapper;
    itemRenderer;
    scrollCallback = () => {
      this.renderAll().catch(printError);
    };
    constructor(scrollableWrapper, appendee, itemRenderer) {
      if (!scrollableWrapper.contains(appendee)) throw Error("Wrapper element should contain appendee element");
      appendee.innerHTML = "", this.appendee = appendee, this.scrollableWrapper = scrollableWrapper, this.itemRenderer = itemRenderer;
    }
    set iterator(iteratorOrIterable) {
      "next" in iteratorOrIterable ? this._iterator = chunkIterator(iteratorOrIterable) : this._iterator = chunkIterator(iteratorOrIterable[Symbol.iterator]()), this.appendee.innerHTML = "", this.scrollableWrapper.removeEventListener("scroll", this.scrollCallback), requestAnimationFrame(() => {
        this.scrollableWrapper.removeEventListener("scroll", this.scrollCallback), this.scrollableWrapper.addEventListener("scroll", this.scrollCallback, { once: !0 }), renderUntil(this, () => isFill(this.scrollableWrapper)).catch(printError);
      });
    }
    async renderAll() {
      await renderUntil(this, () => !1);
    }
  };
  async function renderUntil(self2, stopPredicate) {
    do {
      let result = self2._iterator.next();
      if (isReturn(result)) break;
      let df = new DocumentFragment();
      result.value.forEach((i) => df.appendChild(self2.itemRenderer(i))), self2.appendee.appendChild(df), await waitAnimationFrame();
    } while (!stopPredicate());
  }
  function isFill(wrapper) {
    return wrapper.clientHeight + 100 < wrapper.scrollHeight;
  }
  function chunkIterator(origin, chunkSize = 10) {
    let returnResult = null, chunkIter = {
      next(...args) {
        if (returnResult) return returnResult;
        let chunk = Array(chunkSize);
        for (let i = 0; i < chunkSize; i++) {
          let result = origin.next(...args);
          isReturn(result) ? returnResult = result : chunk[i] = result.value;
        }
        return {
          done: !1,
          value: chunk
        };
      }
    };
    return "throw" in origin && (chunkIter.throw = (e) => {
      let r = origin.throw(e);
      return isReturn(r) ? r : { done: r.done ?? !1, value: [r.value] };
    }), "return" in origin && (chunkIter.return = (treturn) => {
      let r = origin.return(treturn);
      return isReturn(r) ? r : { done: r.done ?? !1, value: [r.value] };
    }), chunkIter;
  }
  function isReturn(r) {
    return !!r.done;
  }

  // src/lib/throttled-invoker.ts
  function throttledInvoker(asyncFunc, intervalMs = 100) {
    let workerPromises = [], lastInvokationAt = 0;
    return () => {
      switch (workerPromises.length) {
        case 0: {
          let p = (async () => {
            let now = Date.now();
            now < lastInvokationAt + intervalMs && await sleep(lastInvokationAt + intervalMs - now), lastInvokationAt = Date.now();
            try {
              await asyncFunc();
            } finally {
              workerPromises.shift();
            }
          })();
          return workerPromises.push(p), p;
        }
        case 1: {
          let prev = workerPromises[0], p = (async () => {
            await prev, await sleep(intervalMs), lastInvokationAt = Date.now();
            try {
              await asyncFunc();
            } finally {
              workerPromises.shift();
            }
          })();
          return workerPromises.push(p), p;
        }
        case 2:
          return workerPromises[1];
        default:
          throw Error(`Unexpected state: promiceses=${workerPromises.length.toString()}`);
      }
    };
  }

  // src/index/cursor-coods-handler.ts
  var CursorCoodsHandler = class {
    #doms;
    #dtmHandler;
    #lastEvent = null;
    constructor(doms, dtmHandler) {
      this.#doms = doms, this.#dtmHandler = dtmHandler, doms.canvas.addEventListener(
        "mousemove",
        (e) => {
          this.#lastEvent = e, this.#update().catch(printError);
        },
        { passive: !0 }
      ), doms.canvas.addEventListener("mouseout", () => {
        this.#lastEvent = null, this.#update().catch(printError);
      });
    }
    #update = throttledInvoker(() => this.#updateImediately().catch(printError), 100);
    async #updateImediately() {
      this.#doms.output.textContent = await formatCoords(
        await this.#dtmHandler.size(),
        this.#doms.canvas,
        (c) => this.#dtmHandler.getElevation(c),
        this.#lastEvent
      );
    }
  };

  // src/index/marker-handler.ts
  var MarkerHandler = class {
    #doms;
    #dtmHandler;
    #listeners = [];
    constructor(doms, dtmHandler) {
      this.#doms = doms, this.#dtmHandler = dtmHandler, doms.canvas.addEventListener("click", (e) => {
        this.#update(e).catch(printError);
      }), doms.resetMarker.addEventListener("click", () => {
        this.#update(null).catch(printError);
      });
    }
    async #update(event) {
      let size = await this.#dtmHandler.size();
      this.#doms.output.textContent = await formatCoords(size, this.#doms.canvas, (c) => this.#dtmHandler.getElevation(c), event);
      let coords = event && size ? canvasEventToGameCoords(event, size, this.#doms.canvas) : null;
      await Promise.allSettled(this.#listeners.map((fn) => fn(coords))).catch(printError);
    }
    addListener(fn) {
      this.#listeners.push(fn);
    }
  };

  // lib/map-files.ts
  var PNG;
  var FILE_PROCESS_RULES = {
    "map_info.xml": {
      name: "map_info.xml",
      process: copy2
    },
    "biomes.png": {
      name: "biomes.png",
      process: repackPng
    },
    "splat3.png": {
      name: "splat3.png",
      process: processSplat3Png
    },
    "splat3_processed.png": {
      name: "splat3.png",
      process: processSplat3Png
    },
    "splat4.png": {
      name: "splat4.png",
      process: processSplat4Png
    },
    "splat4_processed.png": {
      name: "splat4.png",
      process: processSplat4Png
    },
    "radiation.png": {
      name: "radiation.png",
      process: processRadiationPng
    },
    "prefabs.xml": {
      name: "prefabs.xml",
      process: copy2
    },
    "dtm.raw": {
      name: "dtm_block.raw.gz",
      process: (i, o) => i.pipeThrough(new DtmRawTransformer()).pipeTo(o)
    }
  }, MAP_FILE_NAME_MAP = Object.fromEntries(Object.entries(FILE_PROCESS_RULES).map(([k, v]) => [k, v.name]));
  var WORLD_FILE_NAMES = new Set(Object.keys(FILE_PROCESS_RULES));
  var MAP_FILE_NAMES = new Set(Object.values(FILE_PROCESS_RULES).map((v) => v.name));
  function isMapFileName(name) {
    return MAP_FILE_NAMES.has(name);
  }
  var PREFER_WORLD_FILE_NAMES = {
    "splat3.png": "splat3_processed.png",
    "splat4.png": "splat4_processed.png"
  };
  function hasPreferWorldFileNameIn(name, files) {
    return name in PREFER_WORLD_FILE_NAMES && files.includes(PREFER_WORLD_FILE_NAMES[name]);
  }
  function getPreferWorldFileName(name) {
    return PREFER_WORLD_FILE_NAMES[name];
  }
  function copy2(i, o) {
    return i.pipeTo(o);
  }
  function repackPng(i, o) {
    return i.pipeThrough(new RepackPngTransformer()).pipeTo(o);
  }
  function processSplat3Png(i, o) {
    return i.pipeThrough(new Splat3PngTransformer()).pipeTo(o);
  }
  function processSplat4Png(i, o) {
    return i.pipeThrough(new Splat4PngTransformer()).pipeTo(o);
  }
  function processRadiationPng(i, o) {
    return i.pipeThrough(new RadiationPngTransformer()).pipeTo(o);
  }
  var DEFAULT_TRASNFORM_STRATEGY = { highWaterMark: 1024 * 1024 }, DEFAULT_TRASNFORM_STRATEGIES = [DEFAULT_TRASNFORM_STRATEGY, DEFAULT_TRASNFORM_STRATEGY], ComposingTransformer = class {
    readable;
    writable;
    constructor(transformStreams) {
      let { readable, writable } = new TransformStream({}, ...DEFAULT_TRASNFORM_STRATEGIES);
      this.readable = transformStreams.reduce((r, t) => r.pipeThrough(t), readable), this.writable = writable;
    }
  }, OddByteTransformer = class extends TransformStream {
    constructor() {
      let nextOffset = 1;
      super(
        {
          transform(chunk, controller) {
            let buffer = new Uint8Array(
              chunk.length % 2 === 0 ? chunk.length / 2 : nextOffset === 1 ? (chunk.length - 1) / 2 : (chunk.length + 1) / 2
            ), i = nextOffset;
            for (; i < chunk.length; i += 2)
              buffer[(i - nextOffset) / 2] = chunk[i];
            nextOffset = i - chunk.length, controller.enqueue(buffer);
          }
        },
        ...DEFAULT_TRASNFORM_STRATEGIES
      );
    }
  }, DtmRawTransformer = class extends ComposingTransformer {
    constructor() {
      super([new OddByteTransformer(), new CompressionStream("gzip")]);
    }
  }, DtmBlockRawDecompressor = class extends DecompressionStream {
    constructor() {
      super("gzip");
    }
  }, PngEditingTransfomer = class extends TransformStream {
    constructor(copyAndEdit) {
      let png = new PNG({ deflateLevel: 9, deflateStrategy: 0 }), { promise: flushPromise, resolve, reject } = Promise.withResolvers();
      super(
        {
          start(controller) {
            png.on("parsed", () => {
              packPng(png, copyAndEdit, controller).then(resolve).catch((e) => {
                reject(e);
              });
            });
          },
          transform(chunk) {
            png.write(chunk);
          },
          flush() {
            return flushPromise;
          }
        },
        ...DEFAULT_TRASNFORM_STRATEGIES
      );
    }
  };
  async function packPng(png, copyAndEdit, controller) {
    if (globalThis.OffscreenCanvas) {
      let canvas = new OffscreenCanvas(png.width, png.height), ctx = canvas.getContext("2d"), imageData = ctx.createImageData(png.width, png.height);
      copyAndEdit(png.data, imageData.data), ctx.putImageData(imageData, 0, 0);
      let blob = await canvas.convertToBlob({ type: "image/png" });
      for await (let chunk of blob.stream()) controller.enqueue(chunk);
    } else
      return copyAndEdit(png.data, png.data), new Promise((resolve, reject) => {
        png.pack().on("data", (chunk) => {
          controller.enqueue(chunk);
        }).on("error", reject).on("end", resolve);
      });
  }
  var Splat3PngTransformer = class extends PngEditingTransfomer {
    constructor() {
      super((src, dst) => {
        for (let i = 0; i < dst.length; i += 4)
          src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0 ? (dst[i] = 0, dst[i + 1] = 0, dst[i + 2] = 0, dst[i + 3] = 0) : (dst[i] = src[i], dst[i + 1] = src[i + 1], dst[i + 2] = src[i + 2], dst[i + 3] = 255);
      });
    }
  }, Splat4PngTransformer = class extends PngEditingTransfomer {
    constructor() {
      super((src, dst) => {
        for (let i = 0; i < src.length; i += 4)
          src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0 ? (dst[i] = 0, dst[i + 1] = 0, dst[i + 2] = 0, dst[i + 3] = 0) : src[i + 1] === 255 || src[i + 2] === 29 ? (dst[i] = src[i], dst[i + 1] = src[i + 2], dst[i + 2] = 255, dst[i + 3] = 255) : (dst[i] = src[i], dst[i + 1] = src[i + 1], dst[i + 2] = src[i + 2], dst[i + 3] = 255);
      });
    }
  }, RadiationPngTransformer = class extends PngEditingTransfomer {
    constructor() {
      super((src, dst) => {
        for (let i = 0; i < src.length; i += 4)
          src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0 ? (dst[i] = 0, dst[i + 1] = 0, dst[i + 2] = 0, dst[i + 3] = 0) : (dst[i] = src[i], dst[i + 1] = src[i + 1], dst[i + 2] = src[i + 2], dst[i + 3] = 255);
      });
    }
  }, RepackPngTransformer = class extends PngEditingTransfomer {
    constructor() {
      super((src, dst) => {
        for (let i = 0; i < src.length; i++)
          dst[i] = src[i];
      });
    }
  };

  // src/index/file-handler.ts
  var PROCESS_REQUIRED_NAMES = [
    "biomes.png",
    "splat3.png",
    "splat3_processed.png",
    "splat4.png",
    "splat4_processed.png",
    "radiation.png",
    "dtm.raw"
  ], FileHandler = class {
    #doms;
    #listeners = [];
    #dialogHandler;
    #processorFactory;
    #workspace = workspaceDir();
    #depletedFileHandler = new DepletedFileHandler();
    constructor(doms, dialogHandler, processorFactory, dndHandler, bundledMapHandler) {
      this.#doms = doms, this.#dialogHandler = dialogHandler, this.#processorFactory = processorFactory, doms.files.addEventListener("change", () => {
        doms.files.files && this.#pushFiles(Array.from(doms.files.files)).catch(printError);
      }), doms.clearMap.addEventListener("click", () => {
        this.#setMapName(""), this.#clear().catch(printError);
      }), dndHandler.addListener(({ files }) => this.#pushEntries(files)), bundledMapHandler.addListener(async ({ mapName, mapDir }) => {
        this.#setMapName(mapName), await this.#pushUrls(
          Array.from(MAP_FILE_NAMES).map((name) => `${mapDir}/${name}`),
          // Bundled world files are preprocessed. See tools/copy-map-files.ts
          !0
        );
      });
    }
    async initialize() {
      await this.#invokeListeners(Array.from(MAP_FILE_NAMES));
    }
    addListener(listener) {
      this.#listeners.push(listener);
    }
    async #pushFiles(files) {
      await this.#process(
        files.flatMap((file) => {
          let name = file.name;
          return isStateRequiredMapFile(name) ? { name, blob: file, alreadyProcessed: !1 } : isNeverProcessRequiredMapFile(name) ? { name, blob: file } : isAlwaysProcessRequiredFile(name) ? { name, blob: file } : (console.warn("Ignore file: name=", name), []);
        })
      );
    }
    async #pushEntries(entries) {
      let [entry] = entries;
      if (!entry) return;
      if (entries.length === 1 && isDirectory(entry)) {
        this.#setMapName(entry.name);
        let files2 = await Promise.all((await listEntries(entry)).flatMap((e) => isFile(e) ? [toFile(e)] : []));
        await this.#pushFiles(files2);
        return;
      }
      let files = await Promise.all(entries.flatMap((e) => isFile(e) ? [toFile(e)] : []));
      await this.#pushFiles(files);
    }
    async #pushUrls(urls, alreadyProcessed = !1) {
      await this.#process(
        urls.flatMap((url) => {
          let name = basename(url);
          if (isStateRequiredMapFile(name))
            return { name, url, alreadyProcessed };
          if (isNeverProcessRequiredMapFile(name))
            return { name, url };
          if (isAlwaysProcessRequiredFile(name)) {
            if (alreadyProcessed) throw new Error(`This file must be processed in advance: ${name}`);
            return { name, url };
          } else
            return console.log("Ignore file: name=", name, "alreadyProcessed=", alreadyProcessed), [];
        })
      );
    }
    async #clear() {
      await this.#process(Array.from(MAP_FILE_NAMES).map((name) => ({ name, remove: !0 })));
    }
    async #process(resourceList) {
      if (this.#dialogHandler.state === "processing")
        throw new Error("Already processing");
      this.#dialogHandler.state = "processing";
      let progression = this.#dialogHandler.createProgression(resourceList.map(({ name }) => name));
      this.#dialogHandler.open();
      let workspace = await this.#workspace, resourceNames = resourceList.map(({ name }) => name), processedNames = [];
      for (let resource of resourceList) {
        if (hasPreferWorldFileNameIn(resource.name, resourceNames)) {
          console.log("Skip ", resource.name, " because ", getPreferWorldFileName(resource.name), " is already in the list"), progression.setState(resource.name, "skipped");
          continue;
        }
        if (this.#depletedFileHandler.isSupport(resource.name) && this.#depletedFileHandler.handle(resource.name, "remove" in resource, "alreadyProcessed" in resource && resource.alreadyProcessed), "remove" in resource)
          console.log("Remove", resource.name), processedNames.push(resource.name), await workspace.remove(resource.name);
        else if (isNeverProcessRequiredResource(resource) || isStateRequiredResource(resource) && resource.alreadyProcessed)
          if (console.log("Copy", resource.name), processedNames.push(resource.name), "blob" in resource)
            await workspace.put(resource.name, resource.blob);
          else {
            let response = await fetch(resource.url);
            if (!response.ok) throw new Error(`Failed to fetch ${resource.url}: ${response.statusText}`);
            await workspace.put(resource.name, await response.blob());
          }
        else if (isAlwaysProcessRequiredResource(resource) || isStateRequiredResource(resource) && !resource.alreadyProcessed) {
          console.log("Process", resource.name), console.time(`Process ${resource.name}`);
          let result = await this.#processInWorker(resource);
          console.timeEnd(`Process ${resource.name}`), console.log("Processed", result.name, "size=", result.size), processedNames.push(result.name);
        } else
          throw new Error(`Unexpected resource: ${resource.name}`);
        progression.setState(resource.name, "completed");
      }
      processedNames.length > 0 && await this.#invokeListeners(processedNames), this.#dialogHandler.close();
    }
    async #processInWorker(message) {
      let worker = this.#processorFactory();
      return new Promise((resolve, reject) => {
        worker.onmessage = ({ data }) => {
          worker.terminate(), "error" in data ? reject(new Error(data.error)) : resolve(data);
        }, worker.postMessage(message);
      });
    }
    async #invokeListeners(updatedFileNames) {
      await Promise.allSettled(this.#listeners.map((fn) => fn(updatedFileNames)));
    }
    #setMapName(name) {
      this.#doms.mapName.value = name, this.#doms.mapName.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
  };
  function isProcessRequired(name) {
    return PROCESS_REQUIRED_NAMES.includes(name);
  }
  function isStateRequiredMapFile(name) {
    return isMapFileName(name) && isProcessRequired(name);
  }
  function isNeverProcessRequiredMapFile(name) {
    return isMapFileName(name) && !isProcessRequired(name);
  }
  function isAlwaysProcessRequiredFile(name) {
    return !isMapFileName(name) && isProcessRequired(name);
  }
  function isStateRequiredResource(resource) {
    return isStateRequiredMapFile(resource.name);
  }
  function isNeverProcessRequiredResource(resource) {
    return isNeverProcessRequiredMapFile(resource.name);
  }
  function isAlwaysProcessRequiredResource(resource) {
    return isAlwaysProcessRequiredFile(resource.name);
  }
  function isFile(entry) {
    return entry.isFile;
  }
  function isDirectory(entry) {
    return entry.isDirectory;
  }
  function toFile(entry) {
    return new Promise((resolve, reject) => {
      entry.file(resolve, reject);
    });
  }
  function listEntries(entry) {
    return new Promise((resolve, reject) => {
      entry.createReader().readEntries(resolve, reject);
    });
  }
  var DepletedFileHandler = class {
    constructor() {
      localStorage.getItem("useSplat3Png") && document.body.classList.add("use-splat3-png"), localStorage.getItem("useSplat4Png") && document.body.classList.add("use-splat4-png");
    }
    isSupport(worldFileName) {
      return Object.entries(PREFER_WORLD_FILE_NAMES).some((e) => e.includes(worldFileName));
    }
    handle(deplateOrPreferedFileName, removing, alreadyProcessed) {
      switch (deplateOrPreferedFileName) {
        case "splat3.png":
          this.useSplat3Png = !removing && !alreadyProcessed;
          break;
        case "splat3_processed.png":
          this.useSplat3Png = !1;
          break;
        case "splat4.png":
          this.useSplat4Png = !removing && !alreadyProcessed;
          break;
        case "splat4_processed.png":
          this.useSplat4Png = !1;
          break;
      }
    }
    set useSplat3Png(value) {
      value ? (localStorage.setItem("useSplat3Png", "t"), document.body.classList.add("use-splat3-png")) : (localStorage.removeItem("useSplat3Png"), document.body.classList.remove("use-splat3-png"));
    }
    set useSplat4Png(value) {
      value ? (localStorage.setItem("useSplat4Png", "t"), document.body.classList.add("use-splat4-png")) : (localStorage.removeItem("useSplat4Png"), document.body.classList.remove("use-splat4-png"));
    }
  };

  // src/index/map-canvas-handler.ts
  var DEPENDENT_FILES = ["biomes.png", "splat3.png", "splat4.png", "radiation.png"], MapCanvasHandler = class {
    #updateListeners = [];
    constructor(doms, worker, prefabsHandler, markerHandler, fileHandler) {
      let canvas = doms.canvas.transferControlToOffscreen();
      worker.postMessage(
        {
          canvas,
          biomesAlpha: doms.biomesAlpha.valueAsNumber,
          splat3Alpha: doms.splat3Alpha.valueAsNumber,
          splat4Alpha: doms.splat4Alpha.valueAsNumber,
          radAlpha: doms.radAlpha.valueAsNumber,
          brightness: `${doms.brightness.valueAsNumber.toString()}%`,
          signSize: doms.signSize.valueAsNumber,
          signAlpha: doms.signAlpha.valueAsNumber,
          scale: doms.scale.valueAsNumber
        },
        [canvas]
      ), worker.addEventListener("message", (e) => {
        let { mapSize } = e.data;
        Promise.allSettled(this.#updateListeners.map((fn) => fn(mapSize))).catch(printError);
      }), doms.biomesAlpha.addEventListener("input", () => {
        worker.postMessage({ biomesAlpha: doms.biomesAlpha.valueAsNumber });
      }), doms.splat3Alpha.addEventListener("input", () => {
        worker.postMessage({ splat3Alpha: doms.splat3Alpha.valueAsNumber });
      }), doms.splat4Alpha.addEventListener("input", () => {
        worker.postMessage({ splat4Alpha: doms.splat4Alpha.valueAsNumber });
      }), doms.radAlpha.addEventListener("input", () => {
        worker.postMessage({ radAlpha: doms.radAlpha.valueAsNumber });
      }), doms.signSize.addEventListener("input", () => {
        worker.postMessage({ signSize: doms.signSize.valueAsNumber });
      }), doms.signAlpha.addEventListener("input", () => {
        worker.postMessage({ signAlpha: doms.signAlpha.valueAsNumber });
      }), doms.brightness.addEventListener("input", () => {
        worker.postMessage({ brightness: `${doms.brightness.valueAsNumber.toString()}%` });
      }), doms.scale.addEventListener("input", () => {
        worker.postMessage({ scale: doms.scale.valueAsNumber });
      }), prefabsHandler.addListener((prefabs) => {
        worker.postMessage({ prefabs });
      }), markerHandler.addListener((markerCoords) => {
        worker.postMessage({ markerCoords });
      }), fileHandler.addListener((fileNames) => {
        let invalidate = [];
        for (let n of fileNames)
          DEPENDENT_FILES.includes(n) && invalidate.push(n);
        worker.postMessage({ invalidate });
      });
    }
    addUpdateListener(ln) {
      this.#updateListeners.push(ln);
    }
  };

  // src/lib/events.ts
  var Generator = class {
    #listeners = [];
    addListener(listener) {
      this.#listeners.push(listener);
    }
    removeListener(listener) {
      let index = this.#listeners.indexOf(listener);
      index >= 0 && this.#listeners.splice(index, 1);
    }
    async emit(m) {
      await Promise.allSettled(this.#listeners.map((fn) => fn(m)));
    }
    emitNoAwait(m) {
      this.emit(m).catch(printError);
    }
  };

  // src/index/dnd-handler.ts
  var DndHandler = class extends Generator {
    constructor(dom, dialogHandler) {
      super(), dom.dragovered.addEventListener("dragenter", (event) => {
        event.preventDefault(), dialogHandler.state = "dragover", dialogHandler.open();
      }), dom.dragovered.addEventListener("dragover", (event) => {
        event.preventDefault(), event.dataTransfer && (event.dataTransfer.dropEffect = "copy");
      }), document.body.addEventListener("dragleave", (event) => {
        dom.dragovered === event.target || !(event.clientX === 0 && event.clientY === 0) || (event.preventDefault(), dialogHandler.close());
      }), dom.dragovered.addEventListener("drop", (event) => {
        event.preventDefault(), event.dataTransfer?.types.includes("Files") && this.emitNoAwait({
          type: "drop",
          files: Array.from(event.dataTransfer.items).flatMap((item) => item.webkitGetAsEntry() ?? [])
        });
      });
    }
  };

  // node_modules/three/build/three.module.js
  var REVISION = "167";
  var CullFaceNone = 0, CullFaceBack = 1, CullFaceFront = 2;
  var PCFShadowMap = 1, PCFSoftShadowMap = 2, VSMShadowMap = 3, FrontSide = 0, BackSide = 1, DoubleSide = 2, NoBlending = 0, NormalBlending = 1, AdditiveBlending = 2, SubtractiveBlending = 3, MultiplyBlending = 4, CustomBlending = 5, AddEquation = 100, SubtractEquation = 101, ReverseSubtractEquation = 102, MinEquation = 103, MaxEquation = 104, ZeroFactor = 200, OneFactor = 201, SrcColorFactor = 202, OneMinusSrcColorFactor = 203, SrcAlphaFactor = 204, OneMinusSrcAlphaFactor = 205, DstAlphaFactor = 206, OneMinusDstAlphaFactor = 207, DstColorFactor = 208, OneMinusDstColorFactor = 209, SrcAlphaSaturateFactor = 210, ConstantColorFactor = 211, OneMinusConstantColorFactor = 212, ConstantAlphaFactor = 213, OneMinusConstantAlphaFactor = 214, NeverDepth = 0, AlwaysDepth = 1, LessDepth = 2, LessEqualDepth = 3, EqualDepth = 4, GreaterEqualDepth = 5, GreaterDepth = 6, NotEqualDepth = 7, MultiplyOperation = 0, MixOperation = 1, AddOperation = 2, NoToneMapping = 0, LinearToneMapping = 1, ReinhardToneMapping = 2, CineonToneMapping = 3, ACESFilmicToneMapping = 4, CustomToneMapping = 5, AgXToneMapping = 6, NeutralToneMapping = 7;
  var UVMapping = 300, CubeReflectionMapping = 301, CubeRefractionMapping = 302, EquirectangularReflectionMapping = 303, EquirectangularRefractionMapping = 304, CubeUVReflectionMapping = 306, RepeatWrapping = 1e3, ClampToEdgeWrapping = 1001, MirroredRepeatWrapping = 1002, NearestFilter = 1003, NearestMipmapNearestFilter = 1004;
  var NearestMipmapLinearFilter = 1005;
  var LinearFilter = 1006, LinearMipmapNearestFilter = 1007;
  var LinearMipmapLinearFilter = 1008;
  var UnsignedByteType = 1009, ByteType = 1010, ShortType = 1011, UnsignedShortType = 1012, IntType = 1013, UnsignedIntType = 1014, FloatType = 1015, HalfFloatType = 1016, UnsignedShort4444Type = 1017, UnsignedShort5551Type = 1018, UnsignedInt248Type = 1020, UnsignedInt5999Type = 35902, AlphaFormat = 1021, RGBFormat = 1022, RGBAFormat = 1023, LuminanceFormat = 1024, LuminanceAlphaFormat = 1025, DepthFormat = 1026, DepthStencilFormat = 1027, RedFormat = 1028, RedIntegerFormat = 1029, RGFormat = 1030, RGIntegerFormat = 1031;
  var RGBAIntegerFormat = 1033, RGB_S3TC_DXT1_Format = 33776, RGBA_S3TC_DXT1_Format = 33777, RGBA_S3TC_DXT3_Format = 33778, RGBA_S3TC_DXT5_Format = 33779, RGB_PVRTC_4BPPV1_Format = 35840, RGB_PVRTC_2BPPV1_Format = 35841, RGBA_PVRTC_4BPPV1_Format = 35842, RGBA_PVRTC_2BPPV1_Format = 35843, RGB_ETC1_Format = 36196, RGB_ETC2_Format = 37492, RGBA_ETC2_EAC_Format = 37496, RGBA_ASTC_4x4_Format = 37808, RGBA_ASTC_5x4_Format = 37809, RGBA_ASTC_5x5_Format = 37810, RGBA_ASTC_6x5_Format = 37811, RGBA_ASTC_6x6_Format = 37812, RGBA_ASTC_8x5_Format = 37813, RGBA_ASTC_8x6_Format = 37814, RGBA_ASTC_8x8_Format = 37815, RGBA_ASTC_10x5_Format = 37816, RGBA_ASTC_10x6_Format = 37817, RGBA_ASTC_10x8_Format = 37818, RGBA_ASTC_10x10_Format = 37819, RGBA_ASTC_12x10_Format = 37820, RGBA_ASTC_12x12_Format = 37821, RGBA_BPTC_Format = 36492, RGB_BPTC_SIGNED_Format = 36494, RGB_BPTC_UNSIGNED_Format = 36495, RED_RGTC1_Format = 36283, SIGNED_RED_RGTC1_Format = 36284, RED_GREEN_RGTC2_Format = 36285, SIGNED_RED_GREEN_RGTC2_Format = 36286;
  var InterpolateDiscrete = 2300, InterpolateLinear = 2301, InterpolateSmooth = 2302, ZeroCurvatureEnding = 2400, ZeroSlopeEnding = 2401, WrapAroundEnding = 2402;
  var BasicDepthPacking = 3200, RGBADepthPacking = 3201;
  var TangentSpaceNormalMap = 0, ObjectSpaceNormalMap = 1, NoColorSpace = "", SRGBColorSpace = "srgb", LinearSRGBColorSpace = "srgb-linear", DisplayP3ColorSpace = "display-p3", LinearDisplayP3ColorSpace = "display-p3-linear", LinearTransfer = "linear", SRGBTransfer = "srgb", Rec709Primaries = "rec709", P3Primaries = "p3";
  var KeepStencilOp = 7680;
  var AlwaysStencilFunc = 519, NeverCompare = 512, LessCompare = 513, EqualCompare = 514, LessEqualCompare = 515, GreaterCompare = 516, NotEqualCompare = 517, GreaterEqualCompare = 518, AlwaysCompare = 519, StaticDrawUsage = 35044;
  var GLSL3 = "300 es", WebGLCoordinateSystem = 2e3, WebGPUCoordinateSystem = 2001, EventDispatcher = class {
    addEventListener(type, listener) {
      this._listeners === void 0 && (this._listeners = {});
      let listeners = this._listeners;
      listeners[type] === void 0 && (listeners[type] = []), listeners[type].indexOf(listener) === -1 && listeners[type].push(listener);
    }
    hasEventListener(type, listener) {
      if (this._listeners === void 0) return !1;
      let listeners = this._listeners;
      return listeners[type] !== void 0 && listeners[type].indexOf(listener) !== -1;
    }
    removeEventListener(type, listener) {
      if (this._listeners === void 0) return;
      let listenerArray = this._listeners[type];
      if (listenerArray !== void 0) {
        let index = listenerArray.indexOf(listener);
        index !== -1 && listenerArray.splice(index, 1);
      }
    }
    dispatchEvent(event) {
      if (this._listeners === void 0) return;
      let listenerArray = this._listeners[event.type];
      if (listenerArray !== void 0) {
        event.target = this;
        let array = listenerArray.slice(0);
        for (let i = 0, l = array.length; i < l; i++)
          array[i].call(this, event);
        event.target = null;
      }
    }
  }, _lut = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
  var DEG2RAD = Math.PI / 180, RAD2DEG = 180 / Math.PI;
  function generateUUID() {
    let d0 = Math.random() * 4294967295 | 0, d1 = Math.random() * 4294967295 | 0, d2 = Math.random() * 4294967295 | 0, d3 = Math.random() * 4294967295 | 0;
    return (_lut[d0 & 255] + _lut[d0 >> 8 & 255] + _lut[d0 >> 16 & 255] + _lut[d0 >> 24 & 255] + "-" + _lut[d1 & 255] + _lut[d1 >> 8 & 255] + "-" + _lut[d1 >> 16 & 15 | 64] + _lut[d1 >> 24 & 255] + "-" + _lut[d2 & 63 | 128] + _lut[d2 >> 8 & 255] + "-" + _lut[d2 >> 16 & 255] + _lut[d2 >> 24 & 255] + _lut[d3 & 255] + _lut[d3 >> 8 & 255] + _lut[d3 >> 16 & 255] + _lut[d3 >> 24 & 255]).toLowerCase();
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function euclideanModulo(n, m) {
    return (n % m + m) % m;
  }
  function lerp(x, y, t) {
    return (1 - t) * x + t * y;
  }
  function denormalize(value, array) {
    switch (array.constructor) {
      case Float32Array:
        return value;
      case Uint32Array:
        return value / 4294967295;
      case Uint16Array:
        return value / 65535;
      case Uint8Array:
        return value / 255;
      case Int32Array:
        return Math.max(value / 2147483647, -1);
      case Int16Array:
        return Math.max(value / 32767, -1);
      case Int8Array:
        return Math.max(value / 127, -1);
      default:
        throw new Error("Invalid component type.");
    }
  }
  function normalize(value, array) {
    switch (array.constructor) {
      case Float32Array:
        return value;
      case Uint32Array:
        return Math.round(value * 4294967295);
      case Uint16Array:
        return Math.round(value * 65535);
      case Uint8Array:
        return Math.round(value * 255);
      case Int32Array:
        return Math.round(value * 2147483647);
      case Int16Array:
        return Math.round(value * 32767);
      case Int8Array:
        return Math.round(value * 127);
      default:
        throw new Error("Invalid component type.");
    }
  }
  var Vector2 = class _Vector2 {
    constructor(x = 0, y = 0) {
      _Vector2.prototype.isVector2 = !0, this.x = x, this.y = y;
    }
    get width() {
      return this.x;
    }
    set width(value) {
      this.x = value;
    }
    get height() {
      return this.y;
    }
    set height(value) {
      this.y = value;
    }
    set(x, y) {
      return this.x = x, this.y = y, this;
    }
    setScalar(scalar) {
      return this.x = scalar, this.y = scalar, this;
    }
    setX(x) {
      return this.x = x, this;
    }
    setY(y) {
      return this.y = y, this;
    }
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y);
    }
    copy(v) {
      return this.x = v.x, this.y = v.y, this;
    }
    add(v) {
      return this.x += v.x, this.y += v.y, this;
    }
    addScalar(s) {
      return this.x += s, this.y += s, this;
    }
    addVectors(a, b) {
      return this.x = a.x + b.x, this.y = a.y + b.y, this;
    }
    addScaledVector(v, s) {
      return this.x += v.x * s, this.y += v.y * s, this;
    }
    sub(v) {
      return this.x -= v.x, this.y -= v.y, this;
    }
    subScalar(s) {
      return this.x -= s, this.y -= s, this;
    }
    subVectors(a, b) {
      return this.x = a.x - b.x, this.y = a.y - b.y, this;
    }
    multiply(v) {
      return this.x *= v.x, this.y *= v.y, this;
    }
    multiplyScalar(scalar) {
      return this.x *= scalar, this.y *= scalar, this;
    }
    divide(v) {
      return this.x /= v.x, this.y /= v.y, this;
    }
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    applyMatrix3(m) {
      let x = this.x, y = this.y, e = m.elements;
      return this.x = e[0] * x + e[3] * y + e[6], this.y = e[1] * x + e[4] * y + e[7], this;
    }
    min(v) {
      return this.x = Math.min(this.x, v.x), this.y = Math.min(this.y, v.y), this;
    }
    max(v) {
      return this.x = Math.max(this.x, v.x), this.y = Math.max(this.y, v.y), this;
    }
    clamp(min, max) {
      return this.x = Math.max(min.x, Math.min(max.x, this.x)), this.y = Math.max(min.y, Math.min(max.y, this.y)), this;
    }
    clampScalar(minVal, maxVal) {
      return this.x = Math.max(minVal, Math.min(maxVal, this.x)), this.y = Math.max(minVal, Math.min(maxVal, this.y)), this;
    }
    clampLength(min, max) {
      let length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
    }
    roundToZero() {
      return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this;
    }
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }
    cross(v) {
      return this.x * v.y - this.y * v.x;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    angle() {
      return Math.atan2(-this.y, -this.x) + Math.PI;
    }
    angleTo(v) {
      let denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
      if (denominator === 0) return Math.PI / 2;
      let theta = this.dot(v) / denominator;
      return Math.acos(clamp(theta, -1, 1));
    }
    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }
    distanceToSquared(v) {
      let dx = this.x - v.x, dy = this.y - v.y;
      return dx * dx + dy * dy;
    }
    manhattanDistanceTo(v) {
      return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
    }
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    lerp(v, alpha) {
      return this.x += (v.x - this.x) * alpha, this.y += (v.y - this.y) * alpha, this;
    }
    lerpVectors(v1, v2, alpha) {
      return this.x = v1.x + (v2.x - v1.x) * alpha, this.y = v1.y + (v2.y - v1.y) * alpha, this;
    }
    equals(v) {
      return v.x === this.x && v.y === this.y;
    }
    fromArray(array, offset = 0) {
      return this.x = array[offset], this.y = array[offset + 1], this;
    }
    toArray(array = [], offset = 0) {
      return array[offset] = this.x, array[offset + 1] = this.y, array;
    }
    fromBufferAttribute(attribute, index) {
      return this.x = attribute.getX(index), this.y = attribute.getY(index), this;
    }
    rotateAround(center, angle) {
      let c = Math.cos(angle), s = Math.sin(angle), x = this.x - center.x, y = this.y - center.y;
      return this.x = x * c - y * s + center.x, this.y = x * s + y * c + center.y, this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y;
    }
  }, Matrix3 = class _Matrix3 {
    constructor(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
      _Matrix3.prototype.isMatrix3 = !0, this.elements = [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ], n11 !== void 0 && this.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
    }
    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
      let te = this.elements;
      return te[0] = n11, te[1] = n21, te[2] = n31, te[3] = n12, te[4] = n22, te[5] = n32, te[6] = n13, te[7] = n23, te[8] = n33, this;
    }
    identity() {
      return this.set(
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ), this;
    }
    copy(m) {
      let te = this.elements, me = m.elements;
      return te[0] = me[0], te[1] = me[1], te[2] = me[2], te[3] = me[3], te[4] = me[4], te[5] = me[5], te[6] = me[6], te[7] = me[7], te[8] = me[8], this;
    }
    extractBasis(xAxis, yAxis, zAxis) {
      return xAxis.setFromMatrix3Column(this, 0), yAxis.setFromMatrix3Column(this, 1), zAxis.setFromMatrix3Column(this, 2), this;
    }
    setFromMatrix4(m) {
      let me = m.elements;
      return this.set(
        me[0],
        me[4],
        me[8],
        me[1],
        me[5],
        me[9],
        me[2],
        me[6],
        me[10]
      ), this;
    }
    multiply(m) {
      return this.multiplyMatrices(this, m);
    }
    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }
    multiplyMatrices(a, b) {
      let ae = a.elements, be = b.elements, te = this.elements, a11 = ae[0], a12 = ae[3], a13 = ae[6], a21 = ae[1], a22 = ae[4], a23 = ae[7], a31 = ae[2], a32 = ae[5], a33 = ae[8], b11 = be[0], b12 = be[3], b13 = be[6], b21 = be[1], b22 = be[4], b23 = be[7], b31 = be[2], b32 = be[5], b33 = be[8];
      return te[0] = a11 * b11 + a12 * b21 + a13 * b31, te[3] = a11 * b12 + a12 * b22 + a13 * b32, te[6] = a11 * b13 + a12 * b23 + a13 * b33, te[1] = a21 * b11 + a22 * b21 + a23 * b31, te[4] = a21 * b12 + a22 * b22 + a23 * b32, te[7] = a21 * b13 + a22 * b23 + a23 * b33, te[2] = a31 * b11 + a32 * b21 + a33 * b31, te[5] = a31 * b12 + a32 * b22 + a33 * b32, te[8] = a31 * b13 + a32 * b23 + a33 * b33, this;
    }
    multiplyScalar(s) {
      let te = this.elements;
      return te[0] *= s, te[3] *= s, te[6] *= s, te[1] *= s, te[4] *= s, te[7] *= s, te[2] *= s, te[5] *= s, te[8] *= s, this;
    }
    determinant() {
      let te = this.elements, a = te[0], b = te[1], c = te[2], d = te[3], e = te[4], f = te[5], g = te[6], h = te[7], i = te[8];
      return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
    }
    invert() {
      let te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n12 = te[3], n22 = te[4], n32 = te[5], n13 = te[6], n23 = te[7], n33 = te[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
      if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      let detInv = 1 / det;
      return te[0] = t11 * detInv, te[1] = (n31 * n23 - n33 * n21) * detInv, te[2] = (n32 * n21 - n31 * n22) * detInv, te[3] = t12 * detInv, te[4] = (n33 * n11 - n31 * n13) * detInv, te[5] = (n31 * n12 - n32 * n11) * detInv, te[6] = t13 * detInv, te[7] = (n21 * n13 - n23 * n11) * detInv, te[8] = (n22 * n11 - n21 * n12) * detInv, this;
    }
    transpose() {
      let tmp, m = this.elements;
      return tmp = m[1], m[1] = m[3], m[3] = tmp, tmp = m[2], m[2] = m[6], m[6] = tmp, tmp = m[5], m[5] = m[7], m[7] = tmp, this;
    }
    getNormalMatrix(matrix4) {
      return this.setFromMatrix4(matrix4).invert().transpose();
    }
    transposeIntoArray(r) {
      let m = this.elements;
      return r[0] = m[0], r[1] = m[3], r[2] = m[6], r[3] = m[1], r[4] = m[4], r[5] = m[7], r[6] = m[2], r[7] = m[5], r[8] = m[8], this;
    }
    setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
      let c = Math.cos(rotation), s = Math.sin(rotation);
      return this.set(
        sx * c,
        sx * s,
        -sx * (c * cx + s * cy) + cx + tx,
        -sy * s,
        sy * c,
        -sy * (-s * cx + c * cy) + cy + ty,
        0,
        0,
        1
      ), this;
    }
    //
    scale(sx, sy) {
      return this.premultiply(_m3.makeScale(sx, sy)), this;
    }
    rotate(theta) {
      return this.premultiply(_m3.makeRotation(-theta)), this;
    }
    translate(tx, ty) {
      return this.premultiply(_m3.makeTranslation(tx, ty)), this;
    }
    // for 2D Transforms
    makeTranslation(x, y) {
      return x.isVector2 ? this.set(
        1,
        0,
        x.x,
        0,
        1,
        x.y,
        0,
        0,
        1
      ) : this.set(
        1,
        0,
        x,
        0,
        1,
        y,
        0,
        0,
        1
      ), this;
    }
    makeRotation(theta) {
      let c = Math.cos(theta), s = Math.sin(theta);
      return this.set(
        c,
        -s,
        0,
        s,
        c,
        0,
        0,
        0,
        1
      ), this;
    }
    makeScale(x, y) {
      return this.set(
        x,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        1
      ), this;
    }
    //
    equals(matrix) {
      let te = this.elements, me = matrix.elements;
      for (let i = 0; i < 9; i++)
        if (te[i] !== me[i]) return !1;
      return !0;
    }
    fromArray(array, offset = 0) {
      for (let i = 0; i < 9; i++)
        this.elements[i] = array[i + offset];
      return this;
    }
    toArray(array = [], offset = 0) {
      let te = this.elements;
      return array[offset] = te[0], array[offset + 1] = te[1], array[offset + 2] = te[2], array[offset + 3] = te[3], array[offset + 4] = te[4], array[offset + 5] = te[5], array[offset + 6] = te[6], array[offset + 7] = te[7], array[offset + 8] = te[8], array;
    }
    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  }, _m3 = /* @__PURE__ */ new Matrix3();
  function arrayNeedsUint32(array) {
    for (let i = array.length - 1; i >= 0; --i)
      if (array[i] >= 65535) return !0;
    return !1;
  }
  function createElementNS(name) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", name);
  }
  function createCanvasElement() {
    let canvas = createElementNS("canvas");
    return canvas.style.display = "block", canvas;
  }
  var _cache = {};
  function warnOnce(message) {
    message in _cache || (_cache[message] = !0, console.warn(message));
  }
  function probeAsync(gl, sync, interval) {
    return new Promise(function(resolve, reject) {
      function probe() {
        switch (gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0)) {
          case gl.WAIT_FAILED:
            reject();
            break;
          case gl.TIMEOUT_EXPIRED:
            setTimeout(probe, interval);
            break;
          default:
            resolve();
        }
      }
      setTimeout(probe, interval);
    });
  }
  var LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = /* @__PURE__ */ new Matrix3().set(
    0.8224621,
    0.177538,
    0,
    0.0331941,
    0.9668058,
    0,
    0.0170827,
    0.0723974,
    0.9105199
  ), LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = /* @__PURE__ */ new Matrix3().set(
    1.2249401,
    -0.2249404,
    0,
    -0.0420569,
    1.0420571,
    0,
    -0.0196376,
    -0.0786361,
    1.0982735
  ), COLOR_SPACES = {
    [LinearSRGBColorSpace]: {
      transfer: LinearTransfer,
      primaries: Rec709Primaries,
      luminanceCoefficients: [0.2126, 0.7152, 0.0722],
      toReference: (color) => color,
      fromReference: (color) => color
    },
    [SRGBColorSpace]: {
      transfer: SRGBTransfer,
      primaries: Rec709Primaries,
      luminanceCoefficients: [0.2126, 0.7152, 0.0722],
      toReference: (color) => color.convertSRGBToLinear(),
      fromReference: (color) => color.convertLinearToSRGB()
    },
    [LinearDisplayP3ColorSpace]: {
      transfer: LinearTransfer,
      primaries: P3Primaries,
      luminanceCoefficients: [0.2289, 0.6917, 0.0793],
      toReference: (color) => color.applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB),
      fromReference: (color) => color.applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3)
    },
    [DisplayP3ColorSpace]: {
      transfer: SRGBTransfer,
      primaries: P3Primaries,
      luminanceCoefficients: [0.2289, 0.6917, 0.0793],
      toReference: (color) => color.convertSRGBToLinear().applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB),
      fromReference: (color) => color.applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3).convertLinearToSRGB()
    }
  }, SUPPORTED_WORKING_COLOR_SPACES = /* @__PURE__ */ new Set([LinearSRGBColorSpace, LinearDisplayP3ColorSpace]), ColorManagement = {
    enabled: !0,
    _workingColorSpace: LinearSRGBColorSpace,
    get workingColorSpace() {
      return this._workingColorSpace;
    },
    set workingColorSpace(colorSpace) {
      if (!SUPPORTED_WORKING_COLOR_SPACES.has(colorSpace))
        throw new Error(`Unsupported working color space, "${colorSpace}".`);
      this._workingColorSpace = colorSpace;
    },
    convert: function(color, sourceColorSpace, targetColorSpace) {
      if (this.enabled === !1 || sourceColorSpace === targetColorSpace || !sourceColorSpace || !targetColorSpace)
        return color;
      let sourceToReference = COLOR_SPACES[sourceColorSpace].toReference, targetFromReference = COLOR_SPACES[targetColorSpace].fromReference;
      return targetFromReference(sourceToReference(color));
    },
    fromWorkingColorSpace: function(color, targetColorSpace) {
      return this.convert(color, this._workingColorSpace, targetColorSpace);
    },
    toWorkingColorSpace: function(color, sourceColorSpace) {
      return this.convert(color, sourceColorSpace, this._workingColorSpace);
    },
    getPrimaries: function(colorSpace) {
      return COLOR_SPACES[colorSpace].primaries;
    },
    getTransfer: function(colorSpace) {
      return colorSpace === NoColorSpace ? LinearTransfer : COLOR_SPACES[colorSpace].transfer;
    },
    getLuminanceCoefficients: function(target, colorSpace = this._workingColorSpace) {
      return target.fromArray(COLOR_SPACES[colorSpace].luminanceCoefficients);
    }
  };
  function SRGBToLinear(c) {
    return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
  }
  function LinearToSRGB(c) {
    return c < 31308e-7 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
  }
  var _canvas, ImageUtils = class {
    static getDataURL(image) {
      if (/^data:/i.test(image.src) || typeof HTMLCanvasElement > "u")
        return image.src;
      let canvas;
      if (image instanceof HTMLCanvasElement)
        canvas = image;
      else {
        _canvas === void 0 && (_canvas = createElementNS("canvas")), _canvas.width = image.width, _canvas.height = image.height;
        let context = _canvas.getContext("2d");
        image instanceof ImageData ? context.putImageData(image, 0, 0) : context.drawImage(image, 0, 0, image.width, image.height), canvas = _canvas;
      }
      return canvas.width > 2048 || canvas.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", image), canvas.toDataURL("image/jpeg", 0.6)) : canvas.toDataURL("image/png");
    }
    static sRGBToLinear(image) {
      if (typeof HTMLImageElement < "u" && image instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && image instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && image instanceof ImageBitmap) {
        let canvas = createElementNS("canvas");
        canvas.width = image.width, canvas.height = image.height;
        let context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);
        let imageData = context.getImageData(0, 0, image.width, image.height), data = imageData.data;
        for (let i = 0; i < data.length; i++)
          data[i] = SRGBToLinear(data[i] / 255) * 255;
        return context.putImageData(imageData, 0, 0), canvas;
      } else if (image.data) {
        let data = image.data.slice(0);
        for (let i = 0; i < data.length; i++)
          data instanceof Uint8Array || data instanceof Uint8ClampedArray ? data[i] = Math.floor(SRGBToLinear(data[i] / 255) * 255) : data[i] = SRGBToLinear(data[i]);
        return {
          data,
          width: image.width,
          height: image.height
        };
      } else
        return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), image;
    }
  }, _sourceId = 0, Source = class {
    constructor(data = null) {
      this.isSource = !0, Object.defineProperty(this, "id", { value: _sourceId++ }), this.uuid = generateUUID(), this.data = data, this.dataReady = !0, this.version = 0;
    }
    set needsUpdate(value) {
      value === !0 && this.version++;
    }
    toJSON(meta) {
      let isRootObject = meta === void 0 || typeof meta == "string";
      if (!isRootObject && meta.images[this.uuid] !== void 0)
        return meta.images[this.uuid];
      let output = {
        uuid: this.uuid,
        url: ""
      }, data = this.data;
      if (data !== null) {
        let url;
        if (Array.isArray(data)) {
          url = [];
          for (let i = 0, l = data.length; i < l; i++)
            data[i].isDataTexture ? url.push(serializeImage(data[i].image)) : url.push(serializeImage(data[i]));
        } else
          url = serializeImage(data);
        output.url = url;
      }
      return isRootObject || (meta.images[this.uuid] = output), output;
    }
  };
  function serializeImage(image) {
    return typeof HTMLImageElement < "u" && image instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && image instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && image instanceof ImageBitmap ? ImageUtils.getDataURL(image) : image.data ? {
      data: Array.from(image.data),
      width: image.width,
      height: image.height,
      type: image.data.constructor.name
    } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
  }
  var _textureId = 0, Texture = class _Texture extends EventDispatcher {
    constructor(image = _Texture.DEFAULT_IMAGE, mapping = _Texture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = _Texture.DEFAULT_ANISOTROPY, colorSpace = NoColorSpace) {
      super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: _textureId++ }), this.uuid = generateUUID(), this.name = "", this.source = new Source(image), this.mipmaps = [], this.mapping = mapping, this.channel = 0, this.wrapS = wrapS, this.wrapT = wrapT, this.magFilter = magFilter, this.minFilter = minFilter, this.anisotropy = anisotropy, this.format = format, this.internalFormat = null, this.type = type, this.offset = new Vector2(0, 0), this.repeat = new Vector2(1, 1), this.center = new Vector2(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Matrix3(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = colorSpace, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
    }
    get image() {
      return this.source.data;
    }
    set image(value = null) {
      this.source.data = value;
    }
    updateMatrix() {
      this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(source) {
      return this.name = source.name, this.source = source.source, this.mipmaps = source.mipmaps.slice(0), this.mapping = source.mapping, this.channel = source.channel, this.wrapS = source.wrapS, this.wrapT = source.wrapT, this.magFilter = source.magFilter, this.minFilter = source.minFilter, this.anisotropy = source.anisotropy, this.format = source.format, this.internalFormat = source.internalFormat, this.type = source.type, this.offset.copy(source.offset), this.repeat.copy(source.repeat), this.center.copy(source.center), this.rotation = source.rotation, this.matrixAutoUpdate = source.matrixAutoUpdate, this.matrix.copy(source.matrix), this.generateMipmaps = source.generateMipmaps, this.premultiplyAlpha = source.premultiplyAlpha, this.flipY = source.flipY, this.unpackAlignment = source.unpackAlignment, this.colorSpace = source.colorSpace, this.userData = JSON.parse(JSON.stringify(source.userData)), this.needsUpdate = !0, this;
    }
    toJSON(meta) {
      let isRootObject = meta === void 0 || typeof meta == "string";
      if (!isRootObject && meta.textures[this.uuid] !== void 0)
        return meta.textures[this.uuid];
      let output = {
        metadata: {
          version: 4.6,
          type: "Texture",
          generator: "Texture.toJSON"
        },
        uuid: this.uuid,
        name: this.name,
        image: this.source.toJSON(meta).uuid,
        mapping: this.mapping,
        channel: this.channel,
        repeat: [this.repeat.x, this.repeat.y],
        offset: [this.offset.x, this.offset.y],
        center: [this.center.x, this.center.y],
        rotation: this.rotation,
        wrap: [this.wrapS, this.wrapT],
        format: this.format,
        internalFormat: this.internalFormat,
        type: this.type,
        colorSpace: this.colorSpace,
        minFilter: this.minFilter,
        magFilter: this.magFilter,
        anisotropy: this.anisotropy,
        flipY: this.flipY,
        generateMipmaps: this.generateMipmaps,
        premultiplyAlpha: this.premultiplyAlpha,
        unpackAlignment: this.unpackAlignment
      };
      return Object.keys(this.userData).length > 0 && (output.userData = this.userData), isRootObject || (meta.textures[this.uuid] = output), output;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    transformUv(uv) {
      if (this.mapping !== UVMapping) return uv;
      if (uv.applyMatrix3(this.matrix), uv.x < 0 || uv.x > 1)
        switch (this.wrapS) {
          case RepeatWrapping:
            uv.x = uv.x - Math.floor(uv.x);
            break;
          case ClampToEdgeWrapping:
            uv.x = uv.x < 0 ? 0 : 1;
            break;
          case MirroredRepeatWrapping:
            Math.abs(Math.floor(uv.x) % 2) === 1 ? uv.x = Math.ceil(uv.x) - uv.x : uv.x = uv.x - Math.floor(uv.x);
            break;
        }
      if (uv.y < 0 || uv.y > 1)
        switch (this.wrapT) {
          case RepeatWrapping:
            uv.y = uv.y - Math.floor(uv.y);
            break;
          case ClampToEdgeWrapping:
            uv.y = uv.y < 0 ? 0 : 1;
            break;
          case MirroredRepeatWrapping:
            Math.abs(Math.floor(uv.y) % 2) === 1 ? uv.y = Math.ceil(uv.y) - uv.y : uv.y = uv.y - Math.floor(uv.y);
            break;
        }
      return this.flipY && (uv.y = 1 - uv.y), uv;
    }
    set needsUpdate(value) {
      value === !0 && (this.version++, this.source.needsUpdate = !0);
    }
    set needsPMREMUpdate(value) {
      value === !0 && this.pmremVersion++;
    }
  };
  Texture.DEFAULT_IMAGE = null;
  Texture.DEFAULT_MAPPING = UVMapping;
  Texture.DEFAULT_ANISOTROPY = 1;
  var Vector4 = class _Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      _Vector4.prototype.isVector4 = !0, this.x = x, this.y = y, this.z = z, this.w = w;
    }
    get width() {
      return this.z;
    }
    set width(value) {
      this.z = value;
    }
    get height() {
      return this.w;
    }
    set height(value) {
      this.w = value;
    }
    set(x, y, z, w) {
      return this.x = x, this.y = y, this.z = z, this.w = w, this;
    }
    setScalar(scalar) {
      return this.x = scalar, this.y = scalar, this.z = scalar, this.w = scalar, this;
    }
    setX(x) {
      return this.x = x, this;
    }
    setY(y) {
      return this.y = y, this;
    }
    setZ(z) {
      return this.z = z, this;
    }
    setW(w) {
      return this.w = w, this;
    }
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        case 3:
          this.w = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }
    copy(v) {
      return this.x = v.x, this.y = v.y, this.z = v.z, this.w = v.w !== void 0 ? v.w : 1, this;
    }
    add(v) {
      return this.x += v.x, this.y += v.y, this.z += v.z, this.w += v.w, this;
    }
    addScalar(s) {
      return this.x += s, this.y += s, this.z += s, this.w += s, this;
    }
    addVectors(a, b) {
      return this.x = a.x + b.x, this.y = a.y + b.y, this.z = a.z + b.z, this.w = a.w + b.w, this;
    }
    addScaledVector(v, s) {
      return this.x += v.x * s, this.y += v.y * s, this.z += v.z * s, this.w += v.w * s, this;
    }
    sub(v) {
      return this.x -= v.x, this.y -= v.y, this.z -= v.z, this.w -= v.w, this;
    }
    subScalar(s) {
      return this.x -= s, this.y -= s, this.z -= s, this.w -= s, this;
    }
    subVectors(a, b) {
      return this.x = a.x - b.x, this.y = a.y - b.y, this.z = a.z - b.z, this.w = a.w - b.w, this;
    }
    multiply(v) {
      return this.x *= v.x, this.y *= v.y, this.z *= v.z, this.w *= v.w, this;
    }
    multiplyScalar(scalar) {
      return this.x *= scalar, this.y *= scalar, this.z *= scalar, this.w *= scalar, this;
    }
    applyMatrix4(m) {
      let x = this.x, y = this.y, z = this.z, w = this.w, e = m.elements;
      return this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w, this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w, this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w, this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w, this;
    }
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    setAxisAngleFromQuaternion(q) {
      this.w = 2 * Math.acos(q.w);
      let s = Math.sqrt(1 - q.w * q.w);
      return s < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = q.x / s, this.y = q.y / s, this.z = q.z / s), this;
    }
    setAxisAngleFromRotationMatrix(m) {
      let angle, x, y, z, te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10];
      if (Math.abs(m12 - m21) < 0.01 && Math.abs(m13 - m31) < 0.01 && Math.abs(m23 - m32) < 0.01) {
        if (Math.abs(m12 + m21) < 0.1 && Math.abs(m13 + m31) < 0.1 && Math.abs(m23 + m32) < 0.1 && Math.abs(m11 + m22 + m33 - 3) < 0.1)
          return this.set(1, 0, 0, 0), this;
        angle = Math.PI;
        let xx = (m11 + 1) / 2, yy = (m22 + 1) / 2, zz = (m33 + 1) / 2, xy = (m12 + m21) / 4, xz = (m13 + m31) / 4, yz = (m23 + m32) / 4;
        return xx > yy && xx > zz ? xx < 0.01 ? (x = 0, y = 0.707106781, z = 0.707106781) : (x = Math.sqrt(xx), y = xy / x, z = xz / x) : yy > zz ? yy < 0.01 ? (x = 0.707106781, y = 0, z = 0.707106781) : (y = Math.sqrt(yy), x = xy / y, z = yz / y) : zz < 0.01 ? (x = 0.707106781, y = 0.707106781, z = 0) : (z = Math.sqrt(zz), x = xz / z, y = yz / z), this.set(x, y, z, angle), this;
      }
      let s = Math.sqrt((m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) + (m21 - m12) * (m21 - m12));
      return Math.abs(s) < 1e-3 && (s = 1), this.x = (m32 - m23) / s, this.y = (m13 - m31) / s, this.z = (m21 - m12) / s, this.w = Math.acos((m11 + m22 + m33 - 1) / 2), this;
    }
    setFromMatrixPosition(m) {
      let e = m.elements;
      return this.x = e[12], this.y = e[13], this.z = e[14], this.w = e[15], this;
    }
    min(v) {
      return this.x = Math.min(this.x, v.x), this.y = Math.min(this.y, v.y), this.z = Math.min(this.z, v.z), this.w = Math.min(this.w, v.w), this;
    }
    max(v) {
      return this.x = Math.max(this.x, v.x), this.y = Math.max(this.y, v.y), this.z = Math.max(this.z, v.z), this.w = Math.max(this.w, v.w), this;
    }
    clamp(min, max) {
      return this.x = Math.max(min.x, Math.min(max.x, this.x)), this.y = Math.max(min.y, Math.min(max.y, this.y)), this.z = Math.max(min.z, Math.min(max.z, this.z)), this.w = Math.max(min.w, Math.min(max.w, this.w)), this;
    }
    clampScalar(minVal, maxVal) {
      return this.x = Math.max(minVal, Math.min(maxVal, this.x)), this.y = Math.max(minVal, Math.min(maxVal, this.y)), this.z = Math.max(minVal, Math.min(maxVal, this.z)), this.w = Math.max(minVal, Math.min(maxVal, this.w)), this;
    }
    clampLength(min, max) {
      let length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
    }
    roundToZero() {
      return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
    }
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    lerp(v, alpha) {
      return this.x += (v.x - this.x) * alpha, this.y += (v.y - this.y) * alpha, this.z += (v.z - this.z) * alpha, this.w += (v.w - this.w) * alpha, this;
    }
    lerpVectors(v1, v2, alpha) {
      return this.x = v1.x + (v2.x - v1.x) * alpha, this.y = v1.y + (v2.y - v1.y) * alpha, this.z = v1.z + (v2.z - v1.z) * alpha, this.w = v1.w + (v2.w - v1.w) * alpha, this;
    }
    equals(v) {
      return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
    }
    fromArray(array, offset = 0) {
      return this.x = array[offset], this.y = array[offset + 1], this.z = array[offset + 2], this.w = array[offset + 3], this;
    }
    toArray(array = [], offset = 0) {
      return array[offset] = this.x, array[offset + 1] = this.y, array[offset + 2] = this.z, array[offset + 3] = this.w, array;
    }
    fromBufferAttribute(attribute, index) {
      return this.x = attribute.getX(index), this.y = attribute.getY(index), this.z = attribute.getZ(index), this.w = attribute.getW(index), this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z, yield this.w;
    }
  }, RenderTarget = class extends EventDispatcher {
    constructor(width = 1, height = 1, options = {}) {
      super(), this.isRenderTarget = !0, this.width = width, this.height = height, this.depth = 1, this.scissor = new Vector4(0, 0, width, height), this.scissorTest = !1, this.viewport = new Vector4(0, 0, width, height);
      let image = { width, height, depth: 1 };
      options = Object.assign({
        generateMipmaps: !1,
        internalFormat: null,
        minFilter: LinearFilter,
        depthBuffer: !0,
        stencilBuffer: !1,
        resolveDepthBuffer: !0,
        resolveStencilBuffer: !0,
        depthTexture: null,
        samples: 0,
        count: 1
      }, options);
      let texture = new Texture(image, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.colorSpace);
      texture.flipY = !1, texture.generateMipmaps = options.generateMipmaps, texture.internalFormat = options.internalFormat, this.textures = [];
      let count = options.count;
      for (let i = 0; i < count; i++)
        this.textures[i] = texture.clone(), this.textures[i].isRenderTargetTexture = !0;
      this.depthBuffer = options.depthBuffer, this.stencilBuffer = options.stencilBuffer, this.resolveDepthBuffer = options.resolveDepthBuffer, this.resolveStencilBuffer = options.resolveStencilBuffer, this.depthTexture = options.depthTexture, this.samples = options.samples;
    }
    get texture() {
      return this.textures[0];
    }
    set texture(value) {
      this.textures[0] = value;
    }
    setSize(width, height, depth = 1) {
      if (this.width !== width || this.height !== height || this.depth !== depth) {
        this.width = width, this.height = height, this.depth = depth;
        for (let i = 0, il = this.textures.length; i < il; i++)
          this.textures[i].image.width = width, this.textures[i].image.height = height, this.textures[i].image.depth = depth;
        this.dispose();
      }
      this.viewport.set(0, 0, width, height), this.scissor.set(0, 0, width, height);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(source) {
      this.width = source.width, this.height = source.height, this.depth = source.depth, this.scissor.copy(source.scissor), this.scissorTest = source.scissorTest, this.viewport.copy(source.viewport), this.textures.length = 0;
      for (let i = 0, il = source.textures.length; i < il; i++)
        this.textures[i] = source.textures[i].clone(), this.textures[i].isRenderTargetTexture = !0;
      let image = Object.assign({}, source.texture.image);
      return this.texture.source = new Source(image), this.depthBuffer = source.depthBuffer, this.stencilBuffer = source.stencilBuffer, this.resolveDepthBuffer = source.resolveDepthBuffer, this.resolveStencilBuffer = source.resolveStencilBuffer, source.depthTexture !== null && (this.depthTexture = source.depthTexture.clone()), this.samples = source.samples, this;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }, WebGLRenderTarget = class extends RenderTarget {
    constructor(width = 1, height = 1, options = {}) {
      super(width, height, options), this.isWebGLRenderTarget = !0;
    }
  }, DataArrayTexture = class extends Texture {
    constructor(data = null, width = 1, height = 1, depth = 1) {
      super(null), this.isDataArrayTexture = !0, this.image = { data, width, height, depth }, this.magFilter = NearestFilter, this.minFilter = NearestFilter, this.wrapR = ClampToEdgeWrapping, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
    }
    addLayerUpdate(layerIndex) {
      this.layerUpdates.add(layerIndex);
    }
    clearLayerUpdates() {
      this.layerUpdates.clear();
    }
  };
  var Data3DTexture = class extends Texture {
    constructor(data = null, width = 1, height = 1, depth = 1) {
      super(null), this.isData3DTexture = !0, this.image = { data, width, height, depth }, this.magFilter = NearestFilter, this.minFilter = NearestFilter, this.wrapR = ClampToEdgeWrapping, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
    }
  };
  var Quaternion = class {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.isQuaternion = !0, this._x = x, this._y = y, this._z = z, this._w = w;
    }
    static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
      let x0 = src0[srcOffset0 + 0], y0 = src0[srcOffset0 + 1], z0 = src0[srcOffset0 + 2], w0 = src0[srcOffset0 + 3], x1 = src1[srcOffset1 + 0], y1 = src1[srcOffset1 + 1], z1 = src1[srcOffset1 + 2], w1 = src1[srcOffset1 + 3];
      if (t === 0) {
        dst[dstOffset + 0] = x0, dst[dstOffset + 1] = y0, dst[dstOffset + 2] = z0, dst[dstOffset + 3] = w0;
        return;
      }
      if (t === 1) {
        dst[dstOffset + 0] = x1, dst[dstOffset + 1] = y1, dst[dstOffset + 2] = z1, dst[dstOffset + 3] = w1;
        return;
      }
      if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
        let s = 1 - t, cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1, dir = cos >= 0 ? 1 : -1, sqrSin = 1 - cos * cos;
        if (sqrSin > Number.EPSILON) {
          let sin = Math.sqrt(sqrSin), len = Math.atan2(sin, cos * dir);
          s = Math.sin(s * len) / sin, t = Math.sin(t * len) / sin;
        }
        let tDir = t * dir;
        if (x0 = x0 * s + x1 * tDir, y0 = y0 * s + y1 * tDir, z0 = z0 * s + z1 * tDir, w0 = w0 * s + w1 * tDir, s === 1 - t) {
          let f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
          x0 *= f, y0 *= f, z0 *= f, w0 *= f;
        }
      }
      dst[dstOffset] = x0, dst[dstOffset + 1] = y0, dst[dstOffset + 2] = z0, dst[dstOffset + 3] = w0;
    }
    static multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
      let x0 = src0[srcOffset0], y0 = src0[srcOffset0 + 1], z0 = src0[srcOffset0 + 2], w0 = src0[srcOffset0 + 3], x1 = src1[srcOffset1], y1 = src1[srcOffset1 + 1], z1 = src1[srcOffset1 + 2], w1 = src1[srcOffset1 + 3];
      return dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1, dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1, dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1, dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1, dst;
    }
    get x() {
      return this._x;
    }
    set x(value) {
      this._x = value, this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(value) {
      this._y = value, this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(value) {
      this._z = value, this._onChangeCallback();
    }
    get w() {
      return this._w;
    }
    set w(value) {
      this._w = value, this._onChangeCallback();
    }
    set(x, y, z, w) {
      return this._x = x, this._y = y, this._z = z, this._w = w, this._onChangeCallback(), this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }
    copy(quaternion) {
      return this._x = quaternion.x, this._y = quaternion.y, this._z = quaternion.z, this._w = quaternion.w, this._onChangeCallback(), this;
    }
    setFromEuler(euler, update = !0) {
      let x = euler._x, y = euler._y, z = euler._z, order = euler._order, cos = Math.cos, sin = Math.sin, c1 = cos(x / 2), c2 = cos(y / 2), c3 = cos(z / 2), s1 = sin(x / 2), s2 = sin(y / 2), s3 = sin(z / 2);
      switch (order) {
        case "XYZ":
          this._x = s1 * c2 * c3 + c1 * s2 * s3, this._y = c1 * s2 * c3 - s1 * c2 * s3, this._z = c1 * c2 * s3 + s1 * s2 * c3, this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "YXZ":
          this._x = s1 * c2 * c3 + c1 * s2 * s3, this._y = c1 * s2 * c3 - s1 * c2 * s3, this._z = c1 * c2 * s3 - s1 * s2 * c3, this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "ZXY":
          this._x = s1 * c2 * c3 - c1 * s2 * s3, this._y = c1 * s2 * c3 + s1 * c2 * s3, this._z = c1 * c2 * s3 + s1 * s2 * c3, this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "ZYX":
          this._x = s1 * c2 * c3 - c1 * s2 * s3, this._y = c1 * s2 * c3 + s1 * c2 * s3, this._z = c1 * c2 * s3 - s1 * s2 * c3, this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "YZX":
          this._x = s1 * c2 * c3 + c1 * s2 * s3, this._y = c1 * s2 * c3 + s1 * c2 * s3, this._z = c1 * c2 * s3 - s1 * s2 * c3, this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "XZY":
          this._x = s1 * c2 * c3 - c1 * s2 * s3, this._y = c1 * s2 * c3 - s1 * c2 * s3, this._z = c1 * c2 * s3 + s1 * s2 * c3, this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        default:
          console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + order);
      }
      return update === !0 && this._onChangeCallback(), this;
    }
    setFromAxisAngle(axis, angle) {
      let halfAngle = angle / 2, s = Math.sin(halfAngle);
      return this._x = axis.x * s, this._y = axis.y * s, this._z = axis.z * s, this._w = Math.cos(halfAngle), this._onChangeCallback(), this;
    }
    setFromRotationMatrix(m) {
      let te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], trace = m11 + m22 + m33;
      if (trace > 0) {
        let s = 0.5 / Math.sqrt(trace + 1);
        this._w = 0.25 / s, this._x = (m32 - m23) * s, this._y = (m13 - m31) * s, this._z = (m21 - m12) * s;
      } else if (m11 > m22 && m11 > m33) {
        let s = 2 * Math.sqrt(1 + m11 - m22 - m33);
        this._w = (m32 - m23) / s, this._x = 0.25 * s, this._y = (m12 + m21) / s, this._z = (m13 + m31) / s;
      } else if (m22 > m33) {
        let s = 2 * Math.sqrt(1 + m22 - m11 - m33);
        this._w = (m13 - m31) / s, this._x = (m12 + m21) / s, this._y = 0.25 * s, this._z = (m23 + m32) / s;
      } else {
        let s = 2 * Math.sqrt(1 + m33 - m11 - m22);
        this._w = (m21 - m12) / s, this._x = (m13 + m31) / s, this._y = (m23 + m32) / s, this._z = 0.25 * s;
      }
      return this._onChangeCallback(), this;
    }
    setFromUnitVectors(vFrom, vTo) {
      let r = vFrom.dot(vTo) + 1;
      return r < Number.EPSILON ? (r = 0, Math.abs(vFrom.x) > Math.abs(vFrom.z) ? (this._x = -vFrom.y, this._y = vFrom.x, this._z = 0, this._w = r) : (this._x = 0, this._y = -vFrom.z, this._z = vFrom.y, this._w = r)) : (this._x = vFrom.y * vTo.z - vFrom.z * vTo.y, this._y = vFrom.z * vTo.x - vFrom.x * vTo.z, this._z = vFrom.x * vTo.y - vFrom.y * vTo.x, this._w = r), this.normalize();
    }
    angleTo(q) {
      return 2 * Math.acos(Math.abs(clamp(this.dot(q), -1, 1)));
    }
    rotateTowards(q, step) {
      let angle = this.angleTo(q);
      if (angle === 0) return this;
      let t = Math.min(1, step / angle);
      return this.slerp(q, t), this;
    }
    identity() {
      return this.set(0, 0, 0, 1);
    }
    invert() {
      return this.conjugate();
    }
    conjugate() {
      return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
    }
    dot(v) {
      return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
    }
    lengthSq() {
      return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }
    length() {
      return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    }
    normalize() {
      let l = this.length();
      return l === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (l = 1 / l, this._x = this._x * l, this._y = this._y * l, this._z = this._z * l, this._w = this._w * l), this._onChangeCallback(), this;
    }
    multiply(q) {
      return this.multiplyQuaternions(this, q);
    }
    premultiply(q) {
      return this.multiplyQuaternions(q, this);
    }
    multiplyQuaternions(a, b) {
      let qax = a._x, qay = a._y, qaz = a._z, qaw = a._w, qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
      return this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby, this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz, this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx, this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz, this._onChangeCallback(), this;
    }
    slerp(qb, t) {
      if (t === 0) return this;
      if (t === 1) return this.copy(qb);
      let x = this._x, y = this._y, z = this._z, w = this._w, cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
      if (cosHalfTheta < 0 ? (this._w = -qb._w, this._x = -qb._x, this._y = -qb._y, this._z = -qb._z, cosHalfTheta = -cosHalfTheta) : this.copy(qb), cosHalfTheta >= 1)
        return this._w = w, this._x = x, this._y = y, this._z = z, this;
      let sqrSinHalfTheta = 1 - cosHalfTheta * cosHalfTheta;
      if (sqrSinHalfTheta <= Number.EPSILON) {
        let s = 1 - t;
        return this._w = s * w + t * this._w, this._x = s * x + t * this._x, this._y = s * y + t * this._y, this._z = s * z + t * this._z, this.normalize(), this;
      }
      let sinHalfTheta = Math.sqrt(sqrSinHalfTheta), halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta), ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
      return this._w = w * ratioA + this._w * ratioB, this._x = x * ratioA + this._x * ratioB, this._y = y * ratioA + this._y * ratioB, this._z = z * ratioA + this._z * ratioB, this._onChangeCallback(), this;
    }
    slerpQuaternions(qa, qb, t) {
      return this.copy(qa).slerp(qb, t);
    }
    random() {
      let theta1 = 2 * Math.PI * Math.random(), theta2 = 2 * Math.PI * Math.random(), x0 = Math.random(), r1 = Math.sqrt(1 - x0), r2 = Math.sqrt(x0);
      return this.set(
        r1 * Math.sin(theta1),
        r1 * Math.cos(theta1),
        r2 * Math.sin(theta2),
        r2 * Math.cos(theta2)
      );
    }
    equals(quaternion) {
      return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
    }
    fromArray(array, offset = 0) {
      return this._x = array[offset], this._y = array[offset + 1], this._z = array[offset + 2], this._w = array[offset + 3], this._onChangeCallback(), this;
    }
    toArray(array = [], offset = 0) {
      return array[offset] = this._x, array[offset + 1] = this._y, array[offset + 2] = this._z, array[offset + 3] = this._w, array;
    }
    fromBufferAttribute(attribute, index) {
      return this._x = attribute.getX(index), this._y = attribute.getY(index), this._z = attribute.getZ(index), this._w = attribute.getW(index), this._onChangeCallback(), this;
    }
    toJSON() {
      return this.toArray();
    }
    _onChange(callback) {
      return this._onChangeCallback = callback, this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x, yield this._y, yield this._z, yield this._w;
    }
  }, Vector3 = class _Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      _Vector3.prototype.isVector3 = !0, this.x = x, this.y = y, this.z = z;
    }
    set(x, y, z) {
      return z === void 0 && (z = this.z), this.x = x, this.y = y, this.z = z, this;
    }
    setScalar(scalar) {
      return this.x = scalar, this.y = scalar, this.z = scalar, this;
    }
    setX(x) {
      return this.x = x, this;
    }
    setY(y) {
      return this.y = y, this;
    }
    setZ(z) {
      return this.z = z, this;
    }
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }
    copy(v) {
      return this.x = v.x, this.y = v.y, this.z = v.z, this;
    }
    add(v) {
      return this.x += v.x, this.y += v.y, this.z += v.z, this;
    }
    addScalar(s) {
      return this.x += s, this.y += s, this.z += s, this;
    }
    addVectors(a, b) {
      return this.x = a.x + b.x, this.y = a.y + b.y, this.z = a.z + b.z, this;
    }
    addScaledVector(v, s) {
      return this.x += v.x * s, this.y += v.y * s, this.z += v.z * s, this;
    }
    sub(v) {
      return this.x -= v.x, this.y -= v.y, this.z -= v.z, this;
    }
    subScalar(s) {
      return this.x -= s, this.y -= s, this.z -= s, this;
    }
    subVectors(a, b) {
      return this.x = a.x - b.x, this.y = a.y - b.y, this.z = a.z - b.z, this;
    }
    multiply(v) {
      return this.x *= v.x, this.y *= v.y, this.z *= v.z, this;
    }
    multiplyScalar(scalar) {
      return this.x *= scalar, this.y *= scalar, this.z *= scalar, this;
    }
    multiplyVectors(a, b) {
      return this.x = a.x * b.x, this.y = a.y * b.y, this.z = a.z * b.z, this;
    }
    applyEuler(euler) {
      return this.applyQuaternion(_quaternion$4.setFromEuler(euler));
    }
    applyAxisAngle(axis, angle) {
      return this.applyQuaternion(_quaternion$4.setFromAxisAngle(axis, angle));
    }
    applyMatrix3(m) {
      let x = this.x, y = this.y, z = this.z, e = m.elements;
      return this.x = e[0] * x + e[3] * y + e[6] * z, this.y = e[1] * x + e[4] * y + e[7] * z, this.z = e[2] * x + e[5] * y + e[8] * z, this;
    }
    applyNormalMatrix(m) {
      return this.applyMatrix3(m).normalize();
    }
    applyMatrix4(m) {
      let x = this.x, y = this.y, z = this.z, e = m.elements, w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      return this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w, this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w, this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w, this;
    }
    applyQuaternion(q) {
      let vx = this.x, vy = this.y, vz = this.z, qx = q.x, qy = q.y, qz = q.z, qw = q.w, tx = 2 * (qy * vz - qz * vy), ty = 2 * (qz * vx - qx * vz), tz = 2 * (qx * vy - qy * vx);
      return this.x = vx + qw * tx + qy * tz - qz * ty, this.y = vy + qw * ty + qz * tx - qx * tz, this.z = vz + qw * tz + qx * ty - qy * tx, this;
    }
    project(camera) {
      return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
    }
    unproject(camera) {
      return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
    }
    transformDirection(m) {
      let x = this.x, y = this.y, z = this.z, e = m.elements;
      return this.x = e[0] * x + e[4] * y + e[8] * z, this.y = e[1] * x + e[5] * y + e[9] * z, this.z = e[2] * x + e[6] * y + e[10] * z, this.normalize();
    }
    divide(v) {
      return this.x /= v.x, this.y /= v.y, this.z /= v.z, this;
    }
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    min(v) {
      return this.x = Math.min(this.x, v.x), this.y = Math.min(this.y, v.y), this.z = Math.min(this.z, v.z), this;
    }
    max(v) {
      return this.x = Math.max(this.x, v.x), this.y = Math.max(this.y, v.y), this.z = Math.max(this.z, v.z), this;
    }
    clamp(min, max) {
      return this.x = Math.max(min.x, Math.min(max.x, this.x)), this.y = Math.max(min.y, Math.min(max.y, this.y)), this.z = Math.max(min.z, Math.min(max.z, this.z)), this;
    }
    clampScalar(minVal, maxVal) {
      return this.x = Math.max(minVal, Math.min(maxVal, this.x)), this.y = Math.max(minVal, Math.min(maxVal, this.y)), this.z = Math.max(minVal, Math.min(maxVal, this.z)), this;
    }
    clampLength(min, max) {
      let length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
    }
    roundToZero() {
      return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
    }
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    // TODO lengthSquared?
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    lerp(v, alpha) {
      return this.x += (v.x - this.x) * alpha, this.y += (v.y - this.y) * alpha, this.z += (v.z - this.z) * alpha, this;
    }
    lerpVectors(v1, v2, alpha) {
      return this.x = v1.x + (v2.x - v1.x) * alpha, this.y = v1.y + (v2.y - v1.y) * alpha, this.z = v1.z + (v2.z - v1.z) * alpha, this;
    }
    cross(v) {
      return this.crossVectors(this, v);
    }
    crossVectors(a, b) {
      let ax = a.x, ay = a.y, az = a.z, bx = b.x, by = b.y, bz = b.z;
      return this.x = ay * bz - az * by, this.y = az * bx - ax * bz, this.z = ax * by - ay * bx, this;
    }
    projectOnVector(v) {
      let denominator = v.lengthSq();
      if (denominator === 0) return this.set(0, 0, 0);
      let scalar = v.dot(this) / denominator;
      return this.copy(v).multiplyScalar(scalar);
    }
    projectOnPlane(planeNormal) {
      return _vector$c.copy(this).projectOnVector(planeNormal), this.sub(_vector$c);
    }
    reflect(normal) {
      return this.sub(_vector$c.copy(normal).multiplyScalar(2 * this.dot(normal)));
    }
    angleTo(v) {
      let denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
      if (denominator === 0) return Math.PI / 2;
      let theta = this.dot(v) / denominator;
      return Math.acos(clamp(theta, -1, 1));
    }
    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }
    distanceToSquared(v) {
      let dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
      return dx * dx + dy * dy + dz * dz;
    }
    manhattanDistanceTo(v) {
      return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }
    setFromSpherical(s) {
      return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
    }
    setFromSphericalCoords(radius, phi, theta) {
      let sinPhiRadius = Math.sin(phi) * radius;
      return this.x = sinPhiRadius * Math.sin(theta), this.y = Math.cos(phi) * radius, this.z = sinPhiRadius * Math.cos(theta), this;
    }
    setFromCylindrical(c) {
      return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
    }
    setFromCylindricalCoords(radius, theta, y) {
      return this.x = radius * Math.sin(theta), this.y = y, this.z = radius * Math.cos(theta), this;
    }
    setFromMatrixPosition(m) {
      let e = m.elements;
      return this.x = e[12], this.y = e[13], this.z = e[14], this;
    }
    setFromMatrixScale(m) {
      let sx = this.setFromMatrixColumn(m, 0).length(), sy = this.setFromMatrixColumn(m, 1).length(), sz = this.setFromMatrixColumn(m, 2).length();
      return this.x = sx, this.y = sy, this.z = sz, this;
    }
    setFromMatrixColumn(m, index) {
      return this.fromArray(m.elements, index * 4);
    }
    setFromMatrix3Column(m, index) {
      return this.fromArray(m.elements, index * 3);
    }
    setFromEuler(e) {
      return this.x = e._x, this.y = e._y, this.z = e._z, this;
    }
    setFromColor(c) {
      return this.x = c.r, this.y = c.g, this.z = c.b, this;
    }
    equals(v) {
      return v.x === this.x && v.y === this.y && v.z === this.z;
    }
    fromArray(array, offset = 0) {
      return this.x = array[offset], this.y = array[offset + 1], this.z = array[offset + 2], this;
    }
    toArray(array = [], offset = 0) {
      return array[offset] = this.x, array[offset + 1] = this.y, array[offset + 2] = this.z, array;
    }
    fromBufferAttribute(attribute, index) {
      return this.x = attribute.getX(index), this.y = attribute.getY(index), this.z = attribute.getZ(index), this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
    }
    randomDirection() {
      let theta = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, c = Math.sqrt(1 - u * u);
      return this.x = c * Math.cos(theta), this.y = u, this.z = c * Math.sin(theta), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z;
    }
  }, _vector$c = /* @__PURE__ */ new Vector3(), _quaternion$4 = /* @__PURE__ */ new Quaternion(), Box3 = class {
    constructor(min = new Vector3(1 / 0, 1 / 0, 1 / 0), max = new Vector3(-1 / 0, -1 / 0, -1 / 0)) {
      this.isBox3 = !0, this.min = min, this.max = max;
    }
    set(min, max) {
      return this.min.copy(min), this.max.copy(max), this;
    }
    setFromArray(array) {
      this.makeEmpty();
      for (let i = 0, il = array.length; i < il; i += 3)
        this.expandByPoint(_vector$b.fromArray(array, i));
      return this;
    }
    setFromBufferAttribute(attribute) {
      this.makeEmpty();
      for (let i = 0, il = attribute.count; i < il; i++)
        this.expandByPoint(_vector$b.fromBufferAttribute(attribute, i));
      return this;
    }
    setFromPoints(points) {
      this.makeEmpty();
      for (let i = 0, il = points.length; i < il; i++)
        this.expandByPoint(points[i]);
      return this;
    }
    setFromCenterAndSize(center, size) {
      let halfSize = _vector$b.copy(size).multiplyScalar(0.5);
      return this.min.copy(center).sub(halfSize), this.max.copy(center).add(halfSize), this;
    }
    setFromObject(object, precise = !1) {
      return this.makeEmpty(), this.expandByObject(object, precise);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(box) {
      return this.min.copy(box.min), this.max.copy(box.max), this;
    }
    makeEmpty() {
      return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
    }
    isEmpty() {
      return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    }
    getCenter(target) {
      return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    getSize(target) {
      return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
    }
    expandByPoint(point) {
      return this.min.min(point), this.max.max(point), this;
    }
    expandByVector(vector) {
      return this.min.sub(vector), this.max.add(vector), this;
    }
    expandByScalar(scalar) {
      return this.min.addScalar(-scalar), this.max.addScalar(scalar), this;
    }
    expandByObject(object, precise = !1) {
      object.updateWorldMatrix(!1, !1);
      let geometry = object.geometry;
      if (geometry !== void 0) {
        let positionAttribute = geometry.getAttribute("position");
        if (precise === !0 && positionAttribute !== void 0 && object.isInstancedMesh !== !0)
          for (let i = 0, l = positionAttribute.count; i < l; i++)
            object.isMesh === !0 ? object.getVertexPosition(i, _vector$b) : _vector$b.fromBufferAttribute(positionAttribute, i), _vector$b.applyMatrix4(object.matrixWorld), this.expandByPoint(_vector$b);
        else
          object.boundingBox !== void 0 ? (object.boundingBox === null && object.computeBoundingBox(), _box$4.copy(object.boundingBox)) : (geometry.boundingBox === null && geometry.computeBoundingBox(), _box$4.copy(geometry.boundingBox)), _box$4.applyMatrix4(object.matrixWorld), this.union(_box$4);
      }
      let children = object.children;
      for (let i = 0, l = children.length; i < l; i++)
        this.expandByObject(children[i], precise);
      return this;
    }
    containsPoint(point) {
      return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y && point.z >= this.min.z && point.z <= this.max.z;
    }
    containsBox(box) {
      return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y && this.min.z <= box.min.z && box.max.z <= this.max.z;
    }
    getParameter(point, target) {
      return target.set(
        (point.x - this.min.x) / (this.max.x - this.min.x),
        (point.y - this.min.y) / (this.max.y - this.min.y),
        (point.z - this.min.z) / (this.max.z - this.min.z)
      );
    }
    intersectsBox(box) {
      return box.max.x >= this.min.x && box.min.x <= this.max.x && box.max.y >= this.min.y && box.min.y <= this.max.y && box.max.z >= this.min.z && box.min.z <= this.max.z;
    }
    intersectsSphere(sphere) {
      return this.clampPoint(sphere.center, _vector$b), _vector$b.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
    }
    intersectsPlane(plane) {
      let min, max;
      return plane.normal.x > 0 ? (min = plane.normal.x * this.min.x, max = plane.normal.x * this.max.x) : (min = plane.normal.x * this.max.x, max = plane.normal.x * this.min.x), plane.normal.y > 0 ? (min += plane.normal.y * this.min.y, max += plane.normal.y * this.max.y) : (min += plane.normal.y * this.max.y, max += plane.normal.y * this.min.y), plane.normal.z > 0 ? (min += plane.normal.z * this.min.z, max += plane.normal.z * this.max.z) : (min += plane.normal.z * this.max.z, max += plane.normal.z * this.min.z), min <= -plane.constant && max >= -plane.constant;
    }
    intersectsTriangle(triangle) {
      if (this.isEmpty())
        return !1;
      this.getCenter(_center), _extents.subVectors(this.max, _center), _v0$3.subVectors(triangle.a, _center), _v1$7.subVectors(triangle.b, _center), _v2$4.subVectors(triangle.c, _center), _f0.subVectors(_v1$7, _v0$3), _f1.subVectors(_v2$4, _v1$7), _f2.subVectors(_v0$3, _v2$4);
      let axes = [
        0,
        -_f0.z,
        _f0.y,
        0,
        -_f1.z,
        _f1.y,
        0,
        -_f2.z,
        _f2.y,
        _f0.z,
        0,
        -_f0.x,
        _f1.z,
        0,
        -_f1.x,
        _f2.z,
        0,
        -_f2.x,
        -_f0.y,
        _f0.x,
        0,
        -_f1.y,
        _f1.x,
        0,
        -_f2.y,
        _f2.x,
        0
      ];
      return !satForAxes(axes, _v0$3, _v1$7, _v2$4, _extents) || (axes = [1, 0, 0, 0, 1, 0, 0, 0, 1], !satForAxes(axes, _v0$3, _v1$7, _v2$4, _extents)) ? !1 : (_triangleNormal.crossVectors(_f0, _f1), axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z], satForAxes(axes, _v0$3, _v1$7, _v2$4, _extents));
    }
    clampPoint(point, target) {
      return target.copy(point).clamp(this.min, this.max);
    }
    distanceToPoint(point) {
      return this.clampPoint(point, _vector$b).distanceTo(point);
    }
    getBoundingSphere(target) {
      return this.isEmpty() ? target.makeEmpty() : (this.getCenter(target.center), target.radius = this.getSize(_vector$b).length() * 0.5), target;
    }
    intersect(box) {
      return this.min.max(box.min), this.max.min(box.max), this.isEmpty() && this.makeEmpty(), this;
    }
    union(box) {
      return this.min.min(box.min), this.max.max(box.max), this;
    }
    applyMatrix4(matrix) {
      return this.isEmpty() ? this : (_points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix), _points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix), _points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix), _points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix), _points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix), _points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix), _points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix), _points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix), this.setFromPoints(_points), this);
    }
    translate(offset) {
      return this.min.add(offset), this.max.add(offset), this;
    }
    equals(box) {
      return box.min.equals(this.min) && box.max.equals(this.max);
    }
  }, _points = [
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3()
  ], _vector$b = /* @__PURE__ */ new Vector3(), _box$4 = /* @__PURE__ */ new Box3(), _v0$3 = /* @__PURE__ */ new Vector3(), _v1$7 = /* @__PURE__ */ new Vector3(), _v2$4 = /* @__PURE__ */ new Vector3(), _f0 = /* @__PURE__ */ new Vector3(), _f1 = /* @__PURE__ */ new Vector3(), _f2 = /* @__PURE__ */ new Vector3(), _center = /* @__PURE__ */ new Vector3(), _extents = /* @__PURE__ */ new Vector3(), _triangleNormal = /* @__PURE__ */ new Vector3(), _testAxis = /* @__PURE__ */ new Vector3();
  function satForAxes(axes, v0, v1, v2, extents) {
    for (let i = 0, j = axes.length - 3; i <= j; i += 3) {
      _testAxis.fromArray(axes, i);
      let r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z), p0 = v0.dot(_testAxis), p1 = v1.dot(_testAxis), p2 = v2.dot(_testAxis);
      if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r)
        return !1;
    }
    return !0;
  }
  var _box$3 = /* @__PURE__ */ new Box3(), _v1$6 = /* @__PURE__ */ new Vector3(), _v2$3 = /* @__PURE__ */ new Vector3(), Sphere = class {
    constructor(center = new Vector3(), radius = -1) {
      this.isSphere = !0, this.center = center, this.radius = radius;
    }
    set(center, radius) {
      return this.center.copy(center), this.radius = radius, this;
    }
    setFromPoints(points, optionalCenter) {
      let center = this.center;
      optionalCenter !== void 0 ? center.copy(optionalCenter) : _box$3.setFromPoints(points).getCenter(center);
      let maxRadiusSq = 0;
      for (let i = 0, il = points.length; i < il; i++)
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
      return this.radius = Math.sqrt(maxRadiusSq), this;
    }
    copy(sphere) {
      return this.center.copy(sphere.center), this.radius = sphere.radius, this;
    }
    isEmpty() {
      return this.radius < 0;
    }
    makeEmpty() {
      return this.center.set(0, 0, 0), this.radius = -1, this;
    }
    containsPoint(point) {
      return point.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    distanceToPoint(point) {
      return point.distanceTo(this.center) - this.radius;
    }
    intersectsSphere(sphere) {
      let radiusSum = this.radius + sphere.radius;
      return sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
    }
    intersectsBox(box) {
      return box.intersectsSphere(this);
    }
    intersectsPlane(plane) {
      return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
    }
    clampPoint(point, target) {
      let deltaLengthSq = this.center.distanceToSquared(point);
      return target.copy(point), deltaLengthSq > this.radius * this.radius && (target.sub(this.center).normalize(), target.multiplyScalar(this.radius).add(this.center)), target;
    }
    getBoundingBox(target) {
      return this.isEmpty() ? (target.makeEmpty(), target) : (target.set(this.center, this.center), target.expandByScalar(this.radius), target);
    }
    applyMatrix4(matrix) {
      return this.center.applyMatrix4(matrix), this.radius = this.radius * matrix.getMaxScaleOnAxis(), this;
    }
    translate(offset) {
      return this.center.add(offset), this;
    }
    expandByPoint(point) {
      if (this.isEmpty())
        return this.center.copy(point), this.radius = 0, this;
      _v1$6.subVectors(point, this.center);
      let lengthSq = _v1$6.lengthSq();
      if (lengthSq > this.radius * this.radius) {
        let length = Math.sqrt(lengthSq), delta = (length - this.radius) * 0.5;
        this.center.addScaledVector(_v1$6, delta / length), this.radius += delta;
      }
      return this;
    }
    union(sphere) {
      return sphere.isEmpty() ? this : this.isEmpty() ? (this.copy(sphere), this) : (this.center.equals(sphere.center) === !0 ? this.radius = Math.max(this.radius, sphere.radius) : (_v2$3.subVectors(sphere.center, this.center).setLength(sphere.radius), this.expandByPoint(_v1$6.copy(sphere.center).add(_v2$3)), this.expandByPoint(_v1$6.copy(sphere.center).sub(_v2$3))), this);
    }
    equals(sphere) {
      return sphere.center.equals(this.center) && sphere.radius === this.radius;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }, _vector$a = /* @__PURE__ */ new Vector3(), _segCenter = /* @__PURE__ */ new Vector3(), _segDir = /* @__PURE__ */ new Vector3(), _diff = /* @__PURE__ */ new Vector3(), _edge1 = /* @__PURE__ */ new Vector3(), _edge2 = /* @__PURE__ */ new Vector3(), _normal$1 = /* @__PURE__ */ new Vector3(), Ray = class {
    constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1)) {
      this.origin = origin, this.direction = direction;
    }
    set(origin, direction) {
      return this.origin.copy(origin), this.direction.copy(direction), this;
    }
    copy(ray) {
      return this.origin.copy(ray.origin), this.direction.copy(ray.direction), this;
    }
    at(t, target) {
      return target.copy(this.origin).addScaledVector(this.direction, t);
    }
    lookAt(v) {
      return this.direction.copy(v).sub(this.origin).normalize(), this;
    }
    recast(t) {
      return this.origin.copy(this.at(t, _vector$a)), this;
    }
    closestPointToPoint(point, target) {
      target.subVectors(point, this.origin);
      let directionDistance = target.dot(this.direction);
      return directionDistance < 0 ? target.copy(this.origin) : target.copy(this.origin).addScaledVector(this.direction, directionDistance);
    }
    distanceToPoint(point) {
      return Math.sqrt(this.distanceSqToPoint(point));
    }
    distanceSqToPoint(point) {
      let directionDistance = _vector$a.subVectors(point, this.origin).dot(this.direction);
      return directionDistance < 0 ? this.origin.distanceToSquared(point) : (_vector$a.copy(this.origin).addScaledVector(this.direction, directionDistance), _vector$a.distanceToSquared(point));
    }
    distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
      _segCenter.copy(v0).add(v1).multiplyScalar(0.5), _segDir.copy(v1).sub(v0).normalize(), _diff.copy(this.origin).sub(_segCenter);
      let segExtent = v0.distanceTo(v1) * 0.5, a01 = -this.direction.dot(_segDir), b0 = _diff.dot(this.direction), b1 = -_diff.dot(_segDir), c = _diff.lengthSq(), det = Math.abs(1 - a01 * a01), s0, s1, sqrDist, extDet;
      if (det > 0)
        if (s0 = a01 * b1 - b0, s1 = a01 * b0 - b1, extDet = segExtent * det, s0 >= 0)
          if (s1 >= -extDet)
            if (s1 <= extDet) {
              let invDet = 1 / det;
              s0 *= invDet, s1 *= invDet, sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
            } else
              s1 = segExtent, s0 = Math.max(0, -(a01 * s1 + b0)), sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          else
            s1 = -segExtent, s0 = Math.max(0, -(a01 * s1 + b0)), sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
        else
          s1 <= -extDet ? (s0 = Math.max(0, -(-a01 * segExtent + b0)), s1 = s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent), sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c) : s1 <= extDet ? (s0 = 0, s1 = Math.min(Math.max(-segExtent, -b1), segExtent), sqrDist = s1 * (s1 + 2 * b1) + c) : (s0 = Math.max(0, -(a01 * segExtent + b0)), s1 = s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent), sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c);
      else
        s1 = a01 > 0 ? -segExtent : segExtent, s0 = Math.max(0, -(a01 * s1 + b0)), sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      return optionalPointOnRay && optionalPointOnRay.copy(this.origin).addScaledVector(this.direction, s0), optionalPointOnSegment && optionalPointOnSegment.copy(_segCenter).addScaledVector(_segDir, s1), sqrDist;
    }
    intersectSphere(sphere, target) {
      _vector$a.subVectors(sphere.center, this.origin);
      let tca = _vector$a.dot(this.direction), d2 = _vector$a.dot(_vector$a) - tca * tca, radius2 = sphere.radius * sphere.radius;
      if (d2 > radius2) return null;
      let thc = Math.sqrt(radius2 - d2), t0 = tca - thc, t1 = tca + thc;
      return t1 < 0 ? null : t0 < 0 ? this.at(t1, target) : this.at(t0, target);
    }
    intersectsSphere(sphere) {
      return this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius;
    }
    distanceToPlane(plane) {
      let denominator = plane.normal.dot(this.direction);
      if (denominator === 0)
        return plane.distanceToPoint(this.origin) === 0 ? 0 : null;
      let t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;
      return t >= 0 ? t : null;
    }
    intersectPlane(plane, target) {
      let t = this.distanceToPlane(plane);
      return t === null ? null : this.at(t, target);
    }
    intersectsPlane(plane) {
      let distToPoint = plane.distanceToPoint(this.origin);
      return distToPoint === 0 || plane.normal.dot(this.direction) * distToPoint < 0;
    }
    intersectBox(box, target) {
      let tmin, tmax, tymin, tymax, tzmin, tzmax, invdirx = 1 / this.direction.x, invdiry = 1 / this.direction.y, invdirz = 1 / this.direction.z, origin = this.origin;
      return invdirx >= 0 ? (tmin = (box.min.x - origin.x) * invdirx, tmax = (box.max.x - origin.x) * invdirx) : (tmin = (box.max.x - origin.x) * invdirx, tmax = (box.min.x - origin.x) * invdirx), invdiry >= 0 ? (tymin = (box.min.y - origin.y) * invdiry, tymax = (box.max.y - origin.y) * invdiry) : (tymin = (box.max.y - origin.y) * invdiry, tymax = (box.min.y - origin.y) * invdiry), tmin > tymax || tymin > tmax || ((tymin > tmin || isNaN(tmin)) && (tmin = tymin), (tymax < tmax || isNaN(tmax)) && (tmax = tymax), invdirz >= 0 ? (tzmin = (box.min.z - origin.z) * invdirz, tzmax = (box.max.z - origin.z) * invdirz) : (tzmin = (box.max.z - origin.z) * invdirz, tzmax = (box.min.z - origin.z) * invdirz), tmin > tzmax || tzmin > tmax) || ((tzmin > tmin || tmin !== tmin) && (tmin = tzmin), (tzmax < tmax || tmax !== tmax) && (tmax = tzmax), tmax < 0) ? null : this.at(tmin >= 0 ? tmin : tmax, target);
    }
    intersectsBox(box) {
      return this.intersectBox(box, _vector$a) !== null;
    }
    intersectTriangle(a, b, c, backfaceCulling, target) {
      _edge1.subVectors(b, a), _edge2.subVectors(c, a), _normal$1.crossVectors(_edge1, _edge2);
      let DdN = this.direction.dot(_normal$1), sign;
      if (DdN > 0) {
        if (backfaceCulling) return null;
        sign = 1;
      } else if (DdN < 0)
        sign = -1, DdN = -DdN;
      else
        return null;
      _diff.subVectors(this.origin, a);
      let DdQxE2 = sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2));
      if (DdQxE2 < 0)
        return null;
      let DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff));
      if (DdE1xQ < 0 || DdQxE2 + DdE1xQ > DdN)
        return null;
      let QdN = -sign * _diff.dot(_normal$1);
      return QdN < 0 ? null : this.at(QdN / DdN, target);
    }
    applyMatrix4(matrix4) {
      return this.origin.applyMatrix4(matrix4), this.direction.transformDirection(matrix4), this;
    }
    equals(ray) {
      return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }, Matrix4 = class _Matrix4 {
    constructor(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      _Matrix4.prototype.isMatrix4 = !0, this.elements = [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ], n11 !== void 0 && this.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
    }
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      let te = this.elements;
      return te[0] = n11, te[4] = n12, te[8] = n13, te[12] = n14, te[1] = n21, te[5] = n22, te[9] = n23, te[13] = n24, te[2] = n31, te[6] = n32, te[10] = n33, te[14] = n34, te[3] = n41, te[7] = n42, te[11] = n43, te[15] = n44, this;
    }
    identity() {
      return this.set(
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    clone() {
      return new _Matrix4().fromArray(this.elements);
    }
    copy(m) {
      let te = this.elements, me = m.elements;
      return te[0] = me[0], te[1] = me[1], te[2] = me[2], te[3] = me[3], te[4] = me[4], te[5] = me[5], te[6] = me[6], te[7] = me[7], te[8] = me[8], te[9] = me[9], te[10] = me[10], te[11] = me[11], te[12] = me[12], te[13] = me[13], te[14] = me[14], te[15] = me[15], this;
    }
    copyPosition(m) {
      let te = this.elements, me = m.elements;
      return te[12] = me[12], te[13] = me[13], te[14] = me[14], this;
    }
    setFromMatrix3(m) {
      let me = m.elements;
      return this.set(
        me[0],
        me[3],
        me[6],
        0,
        me[1],
        me[4],
        me[7],
        0,
        me[2],
        me[5],
        me[8],
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    extractBasis(xAxis, yAxis, zAxis) {
      return xAxis.setFromMatrixColumn(this, 0), yAxis.setFromMatrixColumn(this, 1), zAxis.setFromMatrixColumn(this, 2), this;
    }
    makeBasis(xAxis, yAxis, zAxis) {
      return this.set(
        xAxis.x,
        yAxis.x,
        zAxis.x,
        0,
        xAxis.y,
        yAxis.y,
        zAxis.y,
        0,
        xAxis.z,
        yAxis.z,
        zAxis.z,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    extractRotation(m) {
      let te = this.elements, me = m.elements, scaleX = 1 / _v1$5.setFromMatrixColumn(m, 0).length(), scaleY = 1 / _v1$5.setFromMatrixColumn(m, 1).length(), scaleZ = 1 / _v1$5.setFromMatrixColumn(m, 2).length();
      return te[0] = me[0] * scaleX, te[1] = me[1] * scaleX, te[2] = me[2] * scaleX, te[3] = 0, te[4] = me[4] * scaleY, te[5] = me[5] * scaleY, te[6] = me[6] * scaleY, te[7] = 0, te[8] = me[8] * scaleZ, te[9] = me[9] * scaleZ, te[10] = me[10] * scaleZ, te[11] = 0, te[12] = 0, te[13] = 0, te[14] = 0, te[15] = 1, this;
    }
    makeRotationFromEuler(euler) {
      let te = this.elements, x = euler.x, y = euler.y, z = euler.z, a = Math.cos(x), b = Math.sin(x), c = Math.cos(y), d = Math.sin(y), e = Math.cos(z), f = Math.sin(z);
      if (euler.order === "XYZ") {
        let ae = a * e, af = a * f, be = b * e, bf = b * f;
        te[0] = c * e, te[4] = -c * f, te[8] = d, te[1] = af + be * d, te[5] = ae - bf * d, te[9] = -b * c, te[2] = bf - ae * d, te[6] = be + af * d, te[10] = a * c;
      } else if (euler.order === "YXZ") {
        let ce = c * e, cf = c * f, de = d * e, df = d * f;
        te[0] = ce + df * b, te[4] = de * b - cf, te[8] = a * d, te[1] = a * f, te[5] = a * e, te[9] = -b, te[2] = cf * b - de, te[6] = df + ce * b, te[10] = a * c;
      } else if (euler.order === "ZXY") {
        let ce = c * e, cf = c * f, de = d * e, df = d * f;
        te[0] = ce - df * b, te[4] = -a * f, te[8] = de + cf * b, te[1] = cf + de * b, te[5] = a * e, te[9] = df - ce * b, te[2] = -a * d, te[6] = b, te[10] = a * c;
      } else if (euler.order === "ZYX") {
        let ae = a * e, af = a * f, be = b * e, bf = b * f;
        te[0] = c * e, te[4] = be * d - af, te[8] = ae * d + bf, te[1] = c * f, te[5] = bf * d + ae, te[9] = af * d - be, te[2] = -d, te[6] = b * c, te[10] = a * c;
      } else if (euler.order === "YZX") {
        let ac = a * c, ad = a * d, bc = b * c, bd = b * d;
        te[0] = c * e, te[4] = bd - ac * f, te[8] = bc * f + ad, te[1] = f, te[5] = a * e, te[9] = -b * e, te[2] = -d * e, te[6] = ad * f + bc, te[10] = ac - bd * f;
      } else if (euler.order === "XZY") {
        let ac = a * c, ad = a * d, bc = b * c, bd = b * d;
        te[0] = c * e, te[4] = -f, te[8] = d * e, te[1] = ac * f + bd, te[5] = a * e, te[9] = ad * f - bc, te[2] = bc * f - ad, te[6] = b * e, te[10] = bd * f + ac;
      }
      return te[3] = 0, te[7] = 0, te[11] = 0, te[12] = 0, te[13] = 0, te[14] = 0, te[15] = 1, this;
    }
    makeRotationFromQuaternion(q) {
      return this.compose(_zero, q, _one);
    }
    lookAt(eye, target, up) {
      let te = this.elements;
      return _z.subVectors(eye, target), _z.lengthSq() === 0 && (_z.z = 1), _z.normalize(), _x.crossVectors(up, _z), _x.lengthSq() === 0 && (Math.abs(up.z) === 1 ? _z.x += 1e-4 : _z.z += 1e-4, _z.normalize(), _x.crossVectors(up, _z)), _x.normalize(), _y.crossVectors(_z, _x), te[0] = _x.x, te[4] = _y.x, te[8] = _z.x, te[1] = _x.y, te[5] = _y.y, te[9] = _z.y, te[2] = _x.z, te[6] = _y.z, te[10] = _z.z, this;
    }
    multiply(m) {
      return this.multiplyMatrices(this, m);
    }
    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }
    multiplyMatrices(a, b) {
      let ae = a.elements, be = b.elements, te = this.elements, a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12], a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13], a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14], a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15], b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12], b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13], b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14], b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
      return te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41, te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42, te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43, te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44, te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41, te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42, te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43, te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44, te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41, te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42, te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43, te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44, te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41, te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42, te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43, te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44, this;
    }
    multiplyScalar(s) {
      let te = this.elements;
      return te[0] *= s, te[4] *= s, te[8] *= s, te[12] *= s, te[1] *= s, te[5] *= s, te[9] *= s, te[13] *= s, te[2] *= s, te[6] *= s, te[10] *= s, te[14] *= s, te[3] *= s, te[7] *= s, te[11] *= s, te[15] *= s, this;
    }
    determinant() {
      let te = this.elements, n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12], n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13], n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14], n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
      return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
    }
    transpose() {
      let te = this.elements, tmp;
      return tmp = te[1], te[1] = te[4], te[4] = tmp, tmp = te[2], te[2] = te[8], te[8] = tmp, tmp = te[6], te[6] = te[9], te[9] = tmp, tmp = te[3], te[3] = te[12], te[12] = tmp, tmp = te[7], te[7] = te[13], te[13] = tmp, tmp = te[11], te[11] = te[14], te[14] = tmp, this;
    }
    setPosition(x, y, z) {
      let te = this.elements;
      return x.isVector3 ? (te[12] = x.x, te[13] = x.y, te[14] = x.z) : (te[12] = x, te[13] = y, te[14] = z), this;
    }
    invert() {
      let te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3], n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7], n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11], n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34, det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
      if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      let detInv = 1 / det;
      return te[0] = t11 * detInv, te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv, te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv, te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv, te[4] = t12 * detInv, te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv, te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv, te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv, te[8] = t13 * detInv, te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv, te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv, te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv, te[12] = t14 * detInv, te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv, te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv, te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv, this;
    }
    scale(v) {
      let te = this.elements, x = v.x, y = v.y, z = v.z;
      return te[0] *= x, te[4] *= y, te[8] *= z, te[1] *= x, te[5] *= y, te[9] *= z, te[2] *= x, te[6] *= y, te[10] *= z, te[3] *= x, te[7] *= y, te[11] *= z, this;
    }
    getMaxScaleOnAxis() {
      let te = this.elements, scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2], scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6], scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
      return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
    }
    makeTranslation(x, y, z) {
      return x.isVector3 ? this.set(
        1,
        0,
        0,
        x.x,
        0,
        1,
        0,
        x.y,
        0,
        0,
        1,
        x.z,
        0,
        0,
        0,
        1
      ) : this.set(
        1,
        0,
        0,
        x,
        0,
        1,
        0,
        y,
        0,
        0,
        1,
        z,
        0,
        0,
        0,
        1
      ), this;
    }
    makeRotationX(theta) {
      let c = Math.cos(theta), s = Math.sin(theta);
      return this.set(
        1,
        0,
        0,
        0,
        0,
        c,
        -s,
        0,
        0,
        s,
        c,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeRotationY(theta) {
      let c = Math.cos(theta), s = Math.sin(theta);
      return this.set(
        c,
        0,
        s,
        0,
        0,
        1,
        0,
        0,
        -s,
        0,
        c,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeRotationZ(theta) {
      let c = Math.cos(theta), s = Math.sin(theta);
      return this.set(
        c,
        -s,
        0,
        0,
        s,
        c,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeRotationAxis(axis, angle) {
      let c = Math.cos(angle), s = Math.sin(angle), t = 1 - c, x = axis.x, y = axis.y, z = axis.z, tx = t * x, ty = t * y;
      return this.set(
        tx * x + c,
        tx * y - s * z,
        tx * z + s * y,
        0,
        tx * y + s * z,
        ty * y + c,
        ty * z - s * x,
        0,
        tx * z - s * y,
        ty * z + s * x,
        t * z * z + c,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeScale(x, y, z) {
      return this.set(
        x,
        0,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        0,
        z,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeShear(xy, xz, yx, yz, zx, zy) {
      return this.set(
        1,
        yx,
        zx,
        0,
        xy,
        1,
        zy,
        0,
        xz,
        yz,
        1,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    compose(position, quaternion, scale) {
      let te = this.elements, x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w, x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2, sx = scale.x, sy = scale.y, sz = scale.z;
      return te[0] = (1 - (yy + zz)) * sx, te[1] = (xy + wz) * sx, te[2] = (xz - wy) * sx, te[3] = 0, te[4] = (xy - wz) * sy, te[5] = (1 - (xx + zz)) * sy, te[6] = (yz + wx) * sy, te[7] = 0, te[8] = (xz + wy) * sz, te[9] = (yz - wx) * sz, te[10] = (1 - (xx + yy)) * sz, te[11] = 0, te[12] = position.x, te[13] = position.y, te[14] = position.z, te[15] = 1, this;
    }
    decompose(position, quaternion, scale) {
      let te = this.elements, sx = _v1$5.set(te[0], te[1], te[2]).length(), sy = _v1$5.set(te[4], te[5], te[6]).length(), sz = _v1$5.set(te[8], te[9], te[10]).length();
      this.determinant() < 0 && (sx = -sx), position.x = te[12], position.y = te[13], position.z = te[14], _m1$4.copy(this);
      let invSX = 1 / sx, invSY = 1 / sy, invSZ = 1 / sz;
      return _m1$4.elements[0] *= invSX, _m1$4.elements[1] *= invSX, _m1$4.elements[2] *= invSX, _m1$4.elements[4] *= invSY, _m1$4.elements[5] *= invSY, _m1$4.elements[6] *= invSY, _m1$4.elements[8] *= invSZ, _m1$4.elements[9] *= invSZ, _m1$4.elements[10] *= invSZ, quaternion.setFromRotationMatrix(_m1$4), scale.x = sx, scale.y = sy, scale.z = sz, this;
    }
    makePerspective(left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem) {
      let te = this.elements, x = 2 * near / (right - left), y = 2 * near / (top - bottom), a = (right + left) / (right - left), b = (top + bottom) / (top - bottom), c, d;
      if (coordinateSystem === WebGLCoordinateSystem)
        c = -(far + near) / (far - near), d = -2 * far * near / (far - near);
      else if (coordinateSystem === WebGPUCoordinateSystem)
        c = -far / (far - near), d = -far * near / (far - near);
      else
        throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + coordinateSystem);
      return te[0] = x, te[4] = 0, te[8] = a, te[12] = 0, te[1] = 0, te[5] = y, te[9] = b, te[13] = 0, te[2] = 0, te[6] = 0, te[10] = c, te[14] = d, te[3] = 0, te[7] = 0, te[11] = -1, te[15] = 0, this;
    }
    makeOrthographic(left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem) {
      let te = this.elements, w = 1 / (right - left), h = 1 / (top - bottom), p = 1 / (far - near), x = (right + left) * w, y = (top + bottom) * h, z, zInv;
      if (coordinateSystem === WebGLCoordinateSystem)
        z = (far + near) * p, zInv = -2 * p;
      else if (coordinateSystem === WebGPUCoordinateSystem)
        z = near * p, zInv = -1 * p;
      else
        throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + coordinateSystem);
      return te[0] = 2 * w, te[4] = 0, te[8] = 0, te[12] = -x, te[1] = 0, te[5] = 2 * h, te[9] = 0, te[13] = -y, te[2] = 0, te[6] = 0, te[10] = zInv, te[14] = -z, te[3] = 0, te[7] = 0, te[11] = 0, te[15] = 1, this;
    }
    equals(matrix) {
      let te = this.elements, me = matrix.elements;
      for (let i = 0; i < 16; i++)
        if (te[i] !== me[i]) return !1;
      return !0;
    }
    fromArray(array, offset = 0) {
      for (let i = 0; i < 16; i++)
        this.elements[i] = array[i + offset];
      return this;
    }
    toArray(array = [], offset = 0) {
      let te = this.elements;
      return array[offset] = te[0], array[offset + 1] = te[1], array[offset + 2] = te[2], array[offset + 3] = te[3], array[offset + 4] = te[4], array[offset + 5] = te[5], array[offset + 6] = te[6], array[offset + 7] = te[7], array[offset + 8] = te[8], array[offset + 9] = te[9], array[offset + 10] = te[10], array[offset + 11] = te[11], array[offset + 12] = te[12], array[offset + 13] = te[13], array[offset + 14] = te[14], array[offset + 15] = te[15], array;
    }
  }, _v1$5 = /* @__PURE__ */ new Vector3(), _m1$4 = /* @__PURE__ */ new Matrix4(), _zero = /* @__PURE__ */ new Vector3(0, 0, 0), _one = /* @__PURE__ */ new Vector3(1, 1, 1), _x = /* @__PURE__ */ new Vector3(), _y = /* @__PURE__ */ new Vector3(), _z = /* @__PURE__ */ new Vector3(), _matrix$2 = /* @__PURE__ */ new Matrix4(), _quaternion$3 = /* @__PURE__ */ new Quaternion(), Euler = class _Euler {
    constructor(x = 0, y = 0, z = 0, order = _Euler.DEFAULT_ORDER) {
      this.isEuler = !0, this._x = x, this._y = y, this._z = z, this._order = order;
    }
    get x() {
      return this._x;
    }
    set x(value) {
      this._x = value, this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(value) {
      this._y = value, this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(value) {
      this._z = value, this._onChangeCallback();
    }
    get order() {
      return this._order;
    }
    set order(value) {
      this._order = value, this._onChangeCallback();
    }
    set(x, y, z, order = this._order) {
      return this._x = x, this._y = y, this._z = z, this._order = order, this._onChangeCallback(), this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }
    copy(euler) {
      return this._x = euler._x, this._y = euler._y, this._z = euler._z, this._order = euler._order, this._onChangeCallback(), this;
    }
    setFromRotationMatrix(m, order = this._order, update = !0) {
      let te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10];
      switch (order) {
        case "XYZ":
          this._y = Math.asin(clamp(m13, -1, 1)), Math.abs(m13) < 0.9999999 ? (this._x = Math.atan2(-m23, m33), this._z = Math.atan2(-m12, m11)) : (this._x = Math.atan2(m32, m22), this._z = 0);
          break;
        case "YXZ":
          this._x = Math.asin(-clamp(m23, -1, 1)), Math.abs(m23) < 0.9999999 ? (this._y = Math.atan2(m13, m33), this._z = Math.atan2(m21, m22)) : (this._y = Math.atan2(-m31, m11), this._z = 0);
          break;
        case "ZXY":
          this._x = Math.asin(clamp(m32, -1, 1)), Math.abs(m32) < 0.9999999 ? (this._y = Math.atan2(-m31, m33), this._z = Math.atan2(-m12, m22)) : (this._y = 0, this._z = Math.atan2(m21, m11));
          break;
        case "ZYX":
          this._y = Math.asin(-clamp(m31, -1, 1)), Math.abs(m31) < 0.9999999 ? (this._x = Math.atan2(m32, m33), this._z = Math.atan2(m21, m11)) : (this._x = 0, this._z = Math.atan2(-m12, m22));
          break;
        case "YZX":
          this._z = Math.asin(clamp(m21, -1, 1)), Math.abs(m21) < 0.9999999 ? (this._x = Math.atan2(-m23, m22), this._y = Math.atan2(-m31, m11)) : (this._x = 0, this._y = Math.atan2(m13, m33));
          break;
        case "XZY":
          this._z = Math.asin(-clamp(m12, -1, 1)), Math.abs(m12) < 0.9999999 ? (this._x = Math.atan2(m32, m22), this._y = Math.atan2(m13, m11)) : (this._x = Math.atan2(-m23, m33), this._y = 0);
          break;
        default:
          console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + order);
      }
      return this._order = order, update === !0 && this._onChangeCallback(), this;
    }
    setFromQuaternion(q, order, update) {
      return _matrix$2.makeRotationFromQuaternion(q), this.setFromRotationMatrix(_matrix$2, order, update);
    }
    setFromVector3(v, order = this._order) {
      return this.set(v.x, v.y, v.z, order);
    }
    reorder(newOrder) {
      return _quaternion$3.setFromEuler(this), this.setFromQuaternion(_quaternion$3, newOrder);
    }
    equals(euler) {
      return euler._x === this._x && euler._y === this._y && euler._z === this._z && euler._order === this._order;
    }
    fromArray(array) {
      return this._x = array[0], this._y = array[1], this._z = array[2], array[3] !== void 0 && (this._order = array[3]), this._onChangeCallback(), this;
    }
    toArray(array = [], offset = 0) {
      return array[offset] = this._x, array[offset + 1] = this._y, array[offset + 2] = this._z, array[offset + 3] = this._order, array;
    }
    _onChange(callback) {
      return this._onChangeCallback = callback, this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x, yield this._y, yield this._z, yield this._order;
    }
  };
  Euler.DEFAULT_ORDER = "XYZ";
  var Layers = class {
    constructor() {
      this.mask = 1;
    }
    set(channel) {
      this.mask = (1 << channel | 0) >>> 0;
    }
    enable(channel) {
      this.mask |= 1 << channel | 0;
    }
    enableAll() {
      this.mask = -1;
    }
    toggle(channel) {
      this.mask ^= 1 << channel | 0;
    }
    disable(channel) {
      this.mask &= ~(1 << channel | 0);
    }
    disableAll() {
      this.mask = 0;
    }
    test(layers) {
      return (this.mask & layers.mask) !== 0;
    }
    isEnabled(channel) {
      return (this.mask & (1 << channel | 0)) !== 0;
    }
  }, _object3DId = 0, _v1$4 = /* @__PURE__ */ new Vector3(), _q1 = /* @__PURE__ */ new Quaternion(), _m1$3 = /* @__PURE__ */ new Matrix4(), _target = /* @__PURE__ */ new Vector3(), _position$3 = /* @__PURE__ */ new Vector3(), _scale$2 = /* @__PURE__ */ new Vector3(), _quaternion$2 = /* @__PURE__ */ new Quaternion(), _xAxis = /* @__PURE__ */ new Vector3(1, 0, 0), _yAxis = /* @__PURE__ */ new Vector3(0, 1, 0), _zAxis = /* @__PURE__ */ new Vector3(0, 0, 1), _addedEvent = { type: "added" }, _removedEvent = { type: "removed" }, _childaddedEvent = { type: "childadded", child: null }, _childremovedEvent = { type: "childremoved", child: null }, Object3D = class _Object3D extends EventDispatcher {
    constructor() {
      super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: _object3DId++ }), this.uuid = generateUUID(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = _Object3D.DEFAULT_UP.clone();
      let position = new Vector3(), rotation = new Euler(), quaternion = new Quaternion(), scale = new Vector3(1, 1, 1);
      function onRotationChange() {
        quaternion.setFromEuler(rotation, !1);
      }
      function onQuaternionChange() {
        rotation.setFromQuaternion(quaternion, void 0, !1);
      }
      rotation._onChange(onRotationChange), quaternion._onChange(onQuaternionChange), Object.defineProperties(this, {
        position: {
          configurable: !0,
          enumerable: !0,
          value: position
        },
        rotation: {
          configurable: !0,
          enumerable: !0,
          value: rotation
        },
        quaternion: {
          configurable: !0,
          enumerable: !0,
          value: quaternion
        },
        scale: {
          configurable: !0,
          enumerable: !0,
          value: scale
        },
        modelViewMatrix: {
          value: new Matrix4()
        },
        normalMatrix: {
          value: new Matrix3()
        }
      }), this.matrix = new Matrix4(), this.matrixWorld = new Matrix4(), this.matrixAutoUpdate = _Object3D.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = _Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Layers(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
    }
    onBeforeShadow() {
    }
    onAfterShadow() {
    }
    onBeforeRender() {
    }
    onAfterRender() {
    }
    applyMatrix4(matrix) {
      this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(matrix), this.matrix.decompose(this.position, this.quaternion, this.scale);
    }
    applyQuaternion(q) {
      return this.quaternion.premultiply(q), this;
    }
    setRotationFromAxisAngle(axis, angle) {
      this.quaternion.setFromAxisAngle(axis, angle);
    }
    setRotationFromEuler(euler) {
      this.quaternion.setFromEuler(euler, !0);
    }
    setRotationFromMatrix(m) {
      this.quaternion.setFromRotationMatrix(m);
    }
    setRotationFromQuaternion(q) {
      this.quaternion.copy(q);
    }
    rotateOnAxis(axis, angle) {
      return _q1.setFromAxisAngle(axis, angle), this.quaternion.multiply(_q1), this;
    }
    rotateOnWorldAxis(axis, angle) {
      return _q1.setFromAxisAngle(axis, angle), this.quaternion.premultiply(_q1), this;
    }
    rotateX(angle) {
      return this.rotateOnAxis(_xAxis, angle);
    }
    rotateY(angle) {
      return this.rotateOnAxis(_yAxis, angle);
    }
    rotateZ(angle) {
      return this.rotateOnAxis(_zAxis, angle);
    }
    translateOnAxis(axis, distance) {
      return _v1$4.copy(axis).applyQuaternion(this.quaternion), this.position.add(_v1$4.multiplyScalar(distance)), this;
    }
    translateX(distance) {
      return this.translateOnAxis(_xAxis, distance);
    }
    translateY(distance) {
      return this.translateOnAxis(_yAxis, distance);
    }
    translateZ(distance) {
      return this.translateOnAxis(_zAxis, distance);
    }
    localToWorld(vector) {
      return this.updateWorldMatrix(!0, !1), vector.applyMatrix4(this.matrixWorld);
    }
    worldToLocal(vector) {
      return this.updateWorldMatrix(!0, !1), vector.applyMatrix4(_m1$3.copy(this.matrixWorld).invert());
    }
    lookAt(x, y, z) {
      x.isVector3 ? _target.copy(x) : _target.set(x, y, z);
      let parent = this.parent;
      this.updateWorldMatrix(!0, !1), _position$3.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? _m1$3.lookAt(_position$3, _target, this.up) : _m1$3.lookAt(_target, _position$3, this.up), this.quaternion.setFromRotationMatrix(_m1$3), parent && (_m1$3.extractRotation(parent.matrixWorld), _q1.setFromRotationMatrix(_m1$3), this.quaternion.premultiply(_q1.invert()));
    }
    add(object) {
      if (arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++)
          this.add(arguments[i]);
        return this;
      }
      return object === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", object), this) : (object && object.isObject3D ? (object.removeFromParent(), object.parent = this, this.children.push(object), object.dispatchEvent(_addedEvent), _childaddedEvent.child = object, this.dispatchEvent(_childaddedEvent), _childaddedEvent.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", object), this);
    }
    remove(object) {
      if (arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++)
          this.remove(arguments[i]);
        return this;
      }
      let index = this.children.indexOf(object);
      return index !== -1 && (object.parent = null, this.children.splice(index, 1), object.dispatchEvent(_removedEvent), _childremovedEvent.child = object, this.dispatchEvent(_childremovedEvent), _childremovedEvent.child = null), this;
    }
    removeFromParent() {
      let parent = this.parent;
      return parent !== null && parent.remove(this), this;
    }
    clear() {
      return this.remove(...this.children);
    }
    attach(object) {
      return this.updateWorldMatrix(!0, !1), _m1$3.copy(this.matrixWorld).invert(), object.parent !== null && (object.parent.updateWorldMatrix(!0, !1), _m1$3.multiply(object.parent.matrixWorld)), object.applyMatrix4(_m1$3), object.removeFromParent(), object.parent = this, this.children.push(object), object.updateWorldMatrix(!1, !0), object.dispatchEvent(_addedEvent), _childaddedEvent.child = object, this.dispatchEvent(_childaddedEvent), _childaddedEvent.child = null, this;
    }
    getObjectById(id) {
      return this.getObjectByProperty("id", id);
    }
    getObjectByName(name) {
      return this.getObjectByProperty("name", name);
    }
    getObjectByProperty(name, value) {
      if (this[name] === value) return this;
      for (let i = 0, l = this.children.length; i < l; i++) {
        let object = this.children[i].getObjectByProperty(name, value);
        if (object !== void 0)
          return object;
      }
    }
    getObjectsByProperty(name, value, result = []) {
      this[name] === value && result.push(this);
      let children = this.children;
      for (let i = 0, l = children.length; i < l; i++)
        children[i].getObjectsByProperty(name, value, result);
      return result;
    }
    getWorldPosition(target) {
      return this.updateWorldMatrix(!0, !1), target.setFromMatrixPosition(this.matrixWorld);
    }
    getWorldQuaternion(target) {
      return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(_position$3, target, _scale$2), target;
    }
    getWorldScale(target) {
      return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(_position$3, _quaternion$2, target), target;
    }
    getWorldDirection(target) {
      this.updateWorldMatrix(!0, !1);
      let e = this.matrixWorld.elements;
      return target.set(e[8], e[9], e[10]).normalize();
    }
    raycast() {
    }
    traverse(callback) {
      callback(this);
      let children = this.children;
      for (let i = 0, l = children.length; i < l; i++)
        children[i].traverse(callback);
    }
    traverseVisible(callback) {
      if (this.visible === !1) return;
      callback(this);
      let children = this.children;
      for (let i = 0, l = children.length; i < l; i++)
        children[i].traverseVisible(callback);
    }
    traverseAncestors(callback) {
      let parent = this.parent;
      parent !== null && (callback(parent), parent.traverseAncestors(callback));
    }
    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
    }
    updateMatrixWorld(force) {
      this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || force) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, force = !0);
      let children = this.children;
      for (let i = 0, l = children.length; i < l; i++)
        children[i].updateMatrixWorld(force);
    }
    updateWorldMatrix(updateParents, updateChildren) {
      let parent = this.parent;
      if (updateParents === !0 && parent !== null && parent.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), updateChildren === !0) {
        let children = this.children;
        for (let i = 0, l = children.length; i < l; i++)
          children[i].updateWorldMatrix(!1, !0);
      }
    }
    toJSON(meta) {
      let isRootObject = meta === void 0 || typeof meta == "string", output = {};
      isRootObject && (meta = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {}
      }, output.metadata = {
        version: 4.6,
        type: "Object",
        generator: "Object3D.toJSON"
      });
      let object = {};
      object.uuid = this.uuid, object.type = this.type, this.name !== "" && (object.name = this.name), this.castShadow === !0 && (object.castShadow = !0), this.receiveShadow === !0 && (object.receiveShadow = !0), this.visible === !1 && (object.visible = !1), this.frustumCulled === !1 && (object.frustumCulled = !1), this.renderOrder !== 0 && (object.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (object.userData = this.userData), object.layers = this.layers.mask, object.matrix = this.matrix.toArray(), object.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (object.matrixAutoUpdate = !1), this.isInstancedMesh && (object.type = "InstancedMesh", object.count = this.count, object.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (object.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (object.type = "BatchedMesh", object.perObjectFrustumCulled = this.perObjectFrustumCulled, object.sortObjects = this.sortObjects, object.drawRanges = this._drawRanges, object.reservedRanges = this._reservedRanges, object.visibility = this._visibility, object.active = this._active, object.bounds = this._bounds.map((bound) => ({
        boxInitialized: bound.boxInitialized,
        boxMin: bound.box.min.toArray(),
        boxMax: bound.box.max.toArray(),
        sphereInitialized: bound.sphereInitialized,
        sphereRadius: bound.sphere.radius,
        sphereCenter: bound.sphere.center.toArray()
      })), object.maxInstanceCount = this._maxInstanceCount, object.maxVertexCount = this._maxVertexCount, object.maxIndexCount = this._maxIndexCount, object.geometryInitialized = this._geometryInitialized, object.geometryCount = this._geometryCount, object.matricesTexture = this._matricesTexture.toJSON(meta), this._colorsTexture !== null && (object.colorsTexture = this._colorsTexture.toJSON(meta)), this.boundingSphere !== null && (object.boundingSphere = {
        center: object.boundingSphere.center.toArray(),
        radius: object.boundingSphere.radius
      }), this.boundingBox !== null && (object.boundingBox = {
        min: object.boundingBox.min.toArray(),
        max: object.boundingBox.max.toArray()
      }));
      function serialize(library, element) {
        return library[element.uuid] === void 0 && (library[element.uuid] = element.toJSON(meta)), element.uuid;
      }
      if (this.isScene)
        this.background && (this.background.isColor ? object.background = this.background.toJSON() : this.background.isTexture && (object.background = this.background.toJSON(meta).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (object.environment = this.environment.toJSON(meta).uuid);
      else if (this.isMesh || this.isLine || this.isPoints) {
        object.geometry = serialize(meta.geometries, this.geometry);
        let parameters = this.geometry.parameters;
        if (parameters !== void 0 && parameters.shapes !== void 0) {
          let shapes = parameters.shapes;
          if (Array.isArray(shapes))
            for (let i = 0, l = shapes.length; i < l; i++) {
              let shape = shapes[i];
              serialize(meta.shapes, shape);
            }
          else
            serialize(meta.shapes, shapes);
        }
      }
      if (this.isSkinnedMesh && (object.bindMode = this.bindMode, object.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (serialize(meta.skeletons, this.skeleton), object.skeleton = this.skeleton.uuid)), this.material !== void 0)
        if (Array.isArray(this.material)) {
          let uuids = [];
          for (let i = 0, l = this.material.length; i < l; i++)
            uuids.push(serialize(meta.materials, this.material[i]));
          object.material = uuids;
        } else
          object.material = serialize(meta.materials, this.material);
      if (this.children.length > 0) {
        object.children = [];
        for (let i = 0; i < this.children.length; i++)
          object.children.push(this.children[i].toJSON(meta).object);
      }
      if (this.animations.length > 0) {
        object.animations = [];
        for (let i = 0; i < this.animations.length; i++) {
          let animation = this.animations[i];
          object.animations.push(serialize(meta.animations, animation));
        }
      }
      if (isRootObject) {
        let geometries = extractFromCache(meta.geometries), materials = extractFromCache(meta.materials), textures = extractFromCache(meta.textures), images = extractFromCache(meta.images), shapes = extractFromCache(meta.shapes), skeletons = extractFromCache(meta.skeletons), animations = extractFromCache(meta.animations), nodes = extractFromCache(meta.nodes);
        geometries.length > 0 && (output.geometries = geometries), materials.length > 0 && (output.materials = materials), textures.length > 0 && (output.textures = textures), images.length > 0 && (output.images = images), shapes.length > 0 && (output.shapes = shapes), skeletons.length > 0 && (output.skeletons = skeletons), animations.length > 0 && (output.animations = animations), nodes.length > 0 && (output.nodes = nodes);
      }
      return output.object = object, output;
      function extractFromCache(cache) {
        let values = [];
        for (let key in cache) {
          let data = cache[key];
          delete data.metadata, values.push(data);
        }
        return values;
      }
    }
    clone(recursive) {
      return new this.constructor().copy(this, recursive);
    }
    copy(source, recursive = !0) {
      if (this.name = source.name, this.up.copy(source.up), this.position.copy(source.position), this.rotation.order = source.rotation.order, this.quaternion.copy(source.quaternion), this.scale.copy(source.scale), this.matrix.copy(source.matrix), this.matrixWorld.copy(source.matrixWorld), this.matrixAutoUpdate = source.matrixAutoUpdate, this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate, this.layers.mask = source.layers.mask, this.visible = source.visible, this.castShadow = source.castShadow, this.receiveShadow = source.receiveShadow, this.frustumCulled = source.frustumCulled, this.renderOrder = source.renderOrder, this.animations = source.animations.slice(), this.userData = JSON.parse(JSON.stringify(source.userData)), recursive === !0)
        for (let i = 0; i < source.children.length; i++) {
          let child = source.children[i];
          this.add(child.clone());
        }
      return this;
    }
  };
  Object3D.DEFAULT_UP = /* @__PURE__ */ new Vector3(0, 1, 0);
  Object3D.DEFAULT_MATRIX_AUTO_UPDATE = !0;
  Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
  var _v0$2 = /* @__PURE__ */ new Vector3(), _v1$3 = /* @__PURE__ */ new Vector3(), _v2$2 = /* @__PURE__ */ new Vector3(), _v3$2 = /* @__PURE__ */ new Vector3(), _vab = /* @__PURE__ */ new Vector3(), _vac = /* @__PURE__ */ new Vector3(), _vbc = /* @__PURE__ */ new Vector3(), _vap = /* @__PURE__ */ new Vector3(), _vbp = /* @__PURE__ */ new Vector3(), _vcp = /* @__PURE__ */ new Vector3(), Triangle = class _Triangle {
    constructor(a = new Vector3(), b = new Vector3(), c = new Vector3()) {
      this.a = a, this.b = b, this.c = c;
    }
    static getNormal(a, b, c, target) {
      target.subVectors(c, b), _v0$2.subVectors(a, b), target.cross(_v0$2);
      let targetLengthSq = target.lengthSq();
      return targetLengthSq > 0 ? target.multiplyScalar(1 / Math.sqrt(targetLengthSq)) : target.set(0, 0, 0);
    }
    // static/instance method to calculate barycentric coordinates
    // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
    static getBarycoord(point, a, b, c, target) {
      _v0$2.subVectors(c, a), _v1$3.subVectors(b, a), _v2$2.subVectors(point, a);
      let dot00 = _v0$2.dot(_v0$2), dot01 = _v0$2.dot(_v1$3), dot02 = _v0$2.dot(_v2$2), dot11 = _v1$3.dot(_v1$3), dot12 = _v1$3.dot(_v2$2), denom = dot00 * dot11 - dot01 * dot01;
      if (denom === 0)
        return target.set(0, 0, 0), null;
      let invDenom = 1 / denom, u = (dot11 * dot02 - dot01 * dot12) * invDenom, v = (dot00 * dot12 - dot01 * dot02) * invDenom;
      return target.set(1 - u - v, v, u);
    }
    static containsPoint(point, a, b, c) {
      return this.getBarycoord(point, a, b, c, _v3$2) === null ? !1 : _v3$2.x >= 0 && _v3$2.y >= 0 && _v3$2.x + _v3$2.y <= 1;
    }
    static getInterpolation(point, p1, p2, p3, v1, v2, v3, target) {
      return this.getBarycoord(point, p1, p2, p3, _v3$2) === null ? (target.x = 0, target.y = 0, "z" in target && (target.z = 0), "w" in target && (target.w = 0), null) : (target.setScalar(0), target.addScaledVector(v1, _v3$2.x), target.addScaledVector(v2, _v3$2.y), target.addScaledVector(v3, _v3$2.z), target);
    }
    static isFrontFacing(a, b, c, direction) {
      return _v0$2.subVectors(c, b), _v1$3.subVectors(a, b), _v0$2.cross(_v1$3).dot(direction) < 0;
    }
    set(a, b, c) {
      return this.a.copy(a), this.b.copy(b), this.c.copy(c), this;
    }
    setFromPointsAndIndices(points, i0, i1, i2) {
      return this.a.copy(points[i0]), this.b.copy(points[i1]), this.c.copy(points[i2]), this;
    }
    setFromAttributeAndIndices(attribute, i0, i1, i2) {
      return this.a.fromBufferAttribute(attribute, i0), this.b.fromBufferAttribute(attribute, i1), this.c.fromBufferAttribute(attribute, i2), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(triangle) {
      return this.a.copy(triangle.a), this.b.copy(triangle.b), this.c.copy(triangle.c), this;
    }
    getArea() {
      return _v0$2.subVectors(this.c, this.b), _v1$3.subVectors(this.a, this.b), _v0$2.cross(_v1$3).length() * 0.5;
    }
    getMidpoint(target) {
      return target.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    }
    getNormal(target) {
      return _Triangle.getNormal(this.a, this.b, this.c, target);
    }
    getPlane(target) {
      return target.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(point, target) {
      return _Triangle.getBarycoord(point, this.a, this.b, this.c, target);
    }
    getInterpolation(point, v1, v2, v3, target) {
      return _Triangle.getInterpolation(point, this.a, this.b, this.c, v1, v2, v3, target);
    }
    containsPoint(point) {
      return _Triangle.containsPoint(point, this.a, this.b, this.c);
    }
    isFrontFacing(direction) {
      return _Triangle.isFrontFacing(this.a, this.b, this.c, direction);
    }
    intersectsBox(box) {
      return box.intersectsTriangle(this);
    }
    closestPointToPoint(p, target) {
      let a = this.a, b = this.b, c = this.c, v, w;
      _vab.subVectors(b, a), _vac.subVectors(c, a), _vap.subVectors(p, a);
      let d1 = _vab.dot(_vap), d2 = _vac.dot(_vap);
      if (d1 <= 0 && d2 <= 0)
        return target.copy(a);
      _vbp.subVectors(p, b);
      let d3 = _vab.dot(_vbp), d4 = _vac.dot(_vbp);
      if (d3 >= 0 && d4 <= d3)
        return target.copy(b);
      let vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0)
        return v = d1 / (d1 - d3), target.copy(a).addScaledVector(_vab, v);
      _vcp.subVectors(p, c);
      let d5 = _vab.dot(_vcp), d6 = _vac.dot(_vcp);
      if (d6 >= 0 && d5 <= d6)
        return target.copy(c);
      let vb = d5 * d2 - d1 * d6;
      if (vb <= 0 && d2 >= 0 && d6 <= 0)
        return w = d2 / (d2 - d6), target.copy(a).addScaledVector(_vac, w);
      let va = d3 * d6 - d5 * d4;
      if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0)
        return _vbc.subVectors(c, b), w = (d4 - d3) / (d4 - d3 + (d5 - d6)), target.copy(b).addScaledVector(_vbc, w);
      let denom = 1 / (va + vb + vc);
      return v = vb * denom, w = vc * denom, target.copy(a).addScaledVector(_vab, v).addScaledVector(_vac, w);
    }
    equals(triangle) {
      return triangle.a.equals(this.a) && triangle.b.equals(this.b) && triangle.c.equals(this.c);
    }
  }, _colorKeywords = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  }, _hslA = { h: 0, s: 0, l: 0 }, _hslB = { h: 0, s: 0, l: 0 };
  function hue2rgb(p, q, t) {
    return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * 6 * (2 / 3 - t) : p;
  }
  var Color = class {
    constructor(r, g, b) {
      return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(r, g, b);
    }
    set(r, g, b) {
      if (g === void 0 && b === void 0) {
        let value = r;
        value && value.isColor ? this.copy(value) : typeof value == "number" ? this.setHex(value) : typeof value == "string" && this.setStyle(value);
      } else
        this.setRGB(r, g, b);
      return this;
    }
    setScalar(scalar) {
      return this.r = scalar, this.g = scalar, this.b = scalar, this;
    }
    setHex(hex, colorSpace = SRGBColorSpace) {
      return hex = Math.floor(hex), this.r = (hex >> 16 & 255) / 255, this.g = (hex >> 8 & 255) / 255, this.b = (hex & 255) / 255, ColorManagement.toWorkingColorSpace(this, colorSpace), this;
    }
    setRGB(r, g, b, colorSpace = ColorManagement.workingColorSpace) {
      return this.r = r, this.g = g, this.b = b, ColorManagement.toWorkingColorSpace(this, colorSpace), this;
    }
    setHSL(h, s, l, colorSpace = ColorManagement.workingColorSpace) {
      if (h = euclideanModulo(h, 1), s = clamp(s, 0, 1), l = clamp(l, 0, 1), s === 0)
        this.r = this.g = this.b = l;
      else {
        let p = l <= 0.5 ? l * (1 + s) : l + s - l * s, q = 2 * l - p;
        this.r = hue2rgb(q, p, h + 1 / 3), this.g = hue2rgb(q, p, h), this.b = hue2rgb(q, p, h - 1 / 3);
      }
      return ColorManagement.toWorkingColorSpace(this, colorSpace), this;
    }
    setStyle(style, colorSpace = SRGBColorSpace) {
      function handleAlpha(string) {
        string !== void 0 && parseFloat(string) < 1 && console.warn("THREE.Color: Alpha component of " + style + " will be ignored.");
      }
      let m;
      if (m = /^(\w+)\(([^\)]*)\)/.exec(style)) {
        let color, name = m[1], components = m[2];
        switch (name) {
          case "rgb":
          case "rgba":
            if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components))
              return handleAlpha(color[4]), this.setRGB(
                Math.min(255, parseInt(color[1], 10)) / 255,
                Math.min(255, parseInt(color[2], 10)) / 255,
                Math.min(255, parseInt(color[3], 10)) / 255,
                colorSpace
              );
            if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components))
              return handleAlpha(color[4]), this.setRGB(
                Math.min(100, parseInt(color[1], 10)) / 100,
                Math.min(100, parseInt(color[2], 10)) / 100,
                Math.min(100, parseInt(color[3], 10)) / 100,
                colorSpace
              );
            break;
          case "hsl":
          case "hsla":
            if (color = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components))
              return handleAlpha(color[4]), this.setHSL(
                parseFloat(color[1]) / 360,
                parseFloat(color[2]) / 100,
                parseFloat(color[3]) / 100,
                colorSpace
              );
            break;
          default:
            console.warn("THREE.Color: Unknown color model " + style);
        }
      } else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {
        let hex = m[1], size = hex.length;
        if (size === 3)
          return this.setRGB(
            parseInt(hex.charAt(0), 16) / 15,
            parseInt(hex.charAt(1), 16) / 15,
            parseInt(hex.charAt(2), 16) / 15,
            colorSpace
          );
        if (size === 6)
          return this.setHex(parseInt(hex, 16), colorSpace);
        console.warn("THREE.Color: Invalid hex color " + style);
      } else if (style && style.length > 0)
        return this.setColorName(style, colorSpace);
      return this;
    }
    setColorName(style, colorSpace = SRGBColorSpace) {
      let hex = _colorKeywords[style.toLowerCase()];
      return hex !== void 0 ? this.setHex(hex, colorSpace) : console.warn("THREE.Color: Unknown color " + style), this;
    }
    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }
    copy(color) {
      return this.r = color.r, this.g = color.g, this.b = color.b, this;
    }
    copySRGBToLinear(color) {
      return this.r = SRGBToLinear(color.r), this.g = SRGBToLinear(color.g), this.b = SRGBToLinear(color.b), this;
    }
    copyLinearToSRGB(color) {
      return this.r = LinearToSRGB(color.r), this.g = LinearToSRGB(color.g), this.b = LinearToSRGB(color.b), this;
    }
    convertSRGBToLinear() {
      return this.copySRGBToLinear(this), this;
    }
    convertLinearToSRGB() {
      return this.copyLinearToSRGB(this), this;
    }
    getHex(colorSpace = SRGBColorSpace) {
      return ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace), Math.round(clamp(_color.r * 255, 0, 255)) * 65536 + Math.round(clamp(_color.g * 255, 0, 255)) * 256 + Math.round(clamp(_color.b * 255, 0, 255));
    }
    getHexString(colorSpace = SRGBColorSpace) {
      return ("000000" + this.getHex(colorSpace).toString(16)).slice(-6);
    }
    getHSL(target, colorSpace = ColorManagement.workingColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);
      let r = _color.r, g = _color.g, b = _color.b, max = Math.max(r, g, b), min = Math.min(r, g, b), hue, saturation, lightness = (min + max) / 2;
      if (min === max)
        hue = 0, saturation = 0;
      else {
        let delta = max - min;
        switch (saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min), max) {
          case r:
            hue = (g - b) / delta + (g < b ? 6 : 0);
            break;
          case g:
            hue = (b - r) / delta + 2;
            break;
          case b:
            hue = (r - g) / delta + 4;
            break;
        }
        hue /= 6;
      }
      return target.h = hue, target.s = saturation, target.l = lightness, target;
    }
    getRGB(target, colorSpace = ColorManagement.workingColorSpace) {
      return ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace), target.r = _color.r, target.g = _color.g, target.b = _color.b, target;
    }
    getStyle(colorSpace = SRGBColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);
      let r = _color.r, g = _color.g, b = _color.b;
      return colorSpace !== SRGBColorSpace ? `color(${colorSpace} ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)})` : `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
    }
    offsetHSL(h, s, l) {
      return this.getHSL(_hslA), this.setHSL(_hslA.h + h, _hslA.s + s, _hslA.l + l);
    }
    add(color) {
      return this.r += color.r, this.g += color.g, this.b += color.b, this;
    }
    addColors(color1, color2) {
      return this.r = color1.r + color2.r, this.g = color1.g + color2.g, this.b = color1.b + color2.b, this;
    }
    addScalar(s) {
      return this.r += s, this.g += s, this.b += s, this;
    }
    sub(color) {
      return this.r = Math.max(0, this.r - color.r), this.g = Math.max(0, this.g - color.g), this.b = Math.max(0, this.b - color.b), this;
    }
    multiply(color) {
      return this.r *= color.r, this.g *= color.g, this.b *= color.b, this;
    }
    multiplyScalar(s) {
      return this.r *= s, this.g *= s, this.b *= s, this;
    }
    lerp(color, alpha) {
      return this.r += (color.r - this.r) * alpha, this.g += (color.g - this.g) * alpha, this.b += (color.b - this.b) * alpha, this;
    }
    lerpColors(color1, color2, alpha) {
      return this.r = color1.r + (color2.r - color1.r) * alpha, this.g = color1.g + (color2.g - color1.g) * alpha, this.b = color1.b + (color2.b - color1.b) * alpha, this;
    }
    lerpHSL(color, alpha) {
      this.getHSL(_hslA), color.getHSL(_hslB);
      let h = lerp(_hslA.h, _hslB.h, alpha), s = lerp(_hslA.s, _hslB.s, alpha), l = lerp(_hslA.l, _hslB.l, alpha);
      return this.setHSL(h, s, l), this;
    }
    setFromVector3(v) {
      return this.r = v.x, this.g = v.y, this.b = v.z, this;
    }
    applyMatrix3(m) {
      let r = this.r, g = this.g, b = this.b, e = m.elements;
      return this.r = e[0] * r + e[3] * g + e[6] * b, this.g = e[1] * r + e[4] * g + e[7] * b, this.b = e[2] * r + e[5] * g + e[8] * b, this;
    }
    equals(c) {
      return c.r === this.r && c.g === this.g && c.b === this.b;
    }
    fromArray(array, offset = 0) {
      return this.r = array[offset], this.g = array[offset + 1], this.b = array[offset + 2], this;
    }
    toArray(array = [], offset = 0) {
      return array[offset] = this.r, array[offset + 1] = this.g, array[offset + 2] = this.b, array;
    }
    fromBufferAttribute(attribute, index) {
      return this.r = attribute.getX(index), this.g = attribute.getY(index), this.b = attribute.getZ(index), this;
    }
    toJSON() {
      return this.getHex();
    }
    *[Symbol.iterator]() {
      yield this.r, yield this.g, yield this.b;
    }
  }, _color = /* @__PURE__ */ new Color();
  Color.NAMES = _colorKeywords;
  var _materialId = 0, Material = class extends EventDispatcher {
    constructor() {
      super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: _materialId++ }), this.uuid = generateUUID(), this.name = "", this.type = "Material", this.blending = NormalBlending, this.side = FrontSide, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = SrcAlphaFactor, this.blendDst = OneMinusSrcAlphaFactor, this.blendEquation = AddEquation, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Color(0, 0, 0), this.blendAlpha = 0, this.depthFunc = LessEqualDepth, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = AlwaysStencilFunc, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = KeepStencilOp, this.stencilZFail = KeepStencilOp, this.stencilZPass = KeepStencilOp, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
    }
    get alphaTest() {
      return this._alphaTest;
    }
    set alphaTest(value) {
      this._alphaTest > 0 != value > 0 && this.version++, this._alphaTest = value;
    }
    onBeforeCompile() {
    }
    customProgramCacheKey() {
      return this.onBeforeCompile.toString();
    }
    setValues(values) {
      if (values !== void 0)
        for (let key in values) {
          let newValue = values[key];
          if (newValue === void 0) {
            console.warn(`THREE.Material: parameter '${key}' has value of undefined.`);
            continue;
          }
          let currentValue = this[key];
          if (currentValue === void 0) {
            console.warn(`THREE.Material: '${key}' is not a property of THREE.${this.type}.`);
            continue;
          }
          currentValue && currentValue.isColor ? currentValue.set(newValue) : currentValue && currentValue.isVector3 && newValue && newValue.isVector3 ? currentValue.copy(newValue) : this[key] = newValue;
        }
    }
    toJSON(meta) {
      let isRootObject = meta === void 0 || typeof meta == "string";
      isRootObject && (meta = {
        textures: {},
        images: {}
      });
      let data = {
        metadata: {
          version: 4.6,
          type: "Material",
          generator: "Material.toJSON"
        }
      };
      data.uuid = this.uuid, data.type = this.type, this.name !== "" && (data.name = this.name), this.color && this.color.isColor && (data.color = this.color.getHex()), this.roughness !== void 0 && (data.roughness = this.roughness), this.metalness !== void 0 && (data.metalness = this.metalness), this.sheen !== void 0 && (data.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (data.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (data.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (data.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (data.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (data.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (data.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (data.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (data.shininess = this.shininess), this.clearcoat !== void 0 && (data.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (data.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (data.clearcoatMap = this.clearcoatMap.toJSON(meta).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (data.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(meta).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (data.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(meta).uuid, data.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (data.dispersion = this.dispersion), this.iridescence !== void 0 && (data.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (data.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (data.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (data.iridescenceMap = this.iridescenceMap.toJSON(meta).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (data.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(meta).uuid), this.anisotropy !== void 0 && (data.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (data.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (data.anisotropyMap = this.anisotropyMap.toJSON(meta).uuid), this.map && this.map.isTexture && (data.map = this.map.toJSON(meta).uuid), this.matcap && this.matcap.isTexture && (data.matcap = this.matcap.toJSON(meta).uuid), this.alphaMap && this.alphaMap.isTexture && (data.alphaMap = this.alphaMap.toJSON(meta).uuid), this.lightMap && this.lightMap.isTexture && (data.lightMap = this.lightMap.toJSON(meta).uuid, data.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (data.aoMap = this.aoMap.toJSON(meta).uuid, data.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (data.bumpMap = this.bumpMap.toJSON(meta).uuid, data.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (data.normalMap = this.normalMap.toJSON(meta).uuid, data.normalMapType = this.normalMapType, data.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (data.displacementMap = this.displacementMap.toJSON(meta).uuid, data.displacementScale = this.displacementScale, data.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (data.roughnessMap = this.roughnessMap.toJSON(meta).uuid), this.metalnessMap && this.metalnessMap.isTexture && (data.metalnessMap = this.metalnessMap.toJSON(meta).uuid), this.emissiveMap && this.emissiveMap.isTexture && (data.emissiveMap = this.emissiveMap.toJSON(meta).uuid), this.specularMap && this.specularMap.isTexture && (data.specularMap = this.specularMap.toJSON(meta).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (data.specularIntensityMap = this.specularIntensityMap.toJSON(meta).uuid), this.specularColorMap && this.specularColorMap.isTexture && (data.specularColorMap = this.specularColorMap.toJSON(meta).uuid), this.envMap && this.envMap.isTexture && (data.envMap = this.envMap.toJSON(meta).uuid, this.combine !== void 0 && (data.combine = this.combine)), this.envMapRotation !== void 0 && (data.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (data.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (data.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (data.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (data.gradientMap = this.gradientMap.toJSON(meta).uuid), this.transmission !== void 0 && (data.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (data.transmissionMap = this.transmissionMap.toJSON(meta).uuid), this.thickness !== void 0 && (data.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (data.thicknessMap = this.thicknessMap.toJSON(meta).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (data.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (data.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (data.size = this.size), this.shadowSide !== null && (data.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (data.sizeAttenuation = this.sizeAttenuation), this.blending !== NormalBlending && (data.blending = this.blending), this.side !== FrontSide && (data.side = this.side), this.vertexColors === !0 && (data.vertexColors = !0), this.opacity < 1 && (data.opacity = this.opacity), this.transparent === !0 && (data.transparent = !0), this.blendSrc !== SrcAlphaFactor && (data.blendSrc = this.blendSrc), this.blendDst !== OneMinusSrcAlphaFactor && (data.blendDst = this.blendDst), this.blendEquation !== AddEquation && (data.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (data.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (data.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (data.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (data.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (data.blendAlpha = this.blendAlpha), this.depthFunc !== LessEqualDepth && (data.depthFunc = this.depthFunc), this.depthTest === !1 && (data.depthTest = this.depthTest), this.depthWrite === !1 && (data.depthWrite = this.depthWrite), this.colorWrite === !1 && (data.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (data.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== AlwaysStencilFunc && (data.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (data.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (data.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== KeepStencilOp && (data.stencilFail = this.stencilFail), this.stencilZFail !== KeepStencilOp && (data.stencilZFail = this.stencilZFail), this.stencilZPass !== KeepStencilOp && (data.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (data.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (data.rotation = this.rotation), this.polygonOffset === !0 && (data.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (data.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (data.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (data.linewidth = this.linewidth), this.dashSize !== void 0 && (data.dashSize = this.dashSize), this.gapSize !== void 0 && (data.gapSize = this.gapSize), this.scale !== void 0 && (data.scale = this.scale), this.dithering === !0 && (data.dithering = !0), this.alphaTest > 0 && (data.alphaTest = this.alphaTest), this.alphaHash === !0 && (data.alphaHash = !0), this.alphaToCoverage === !0 && (data.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (data.premultipliedAlpha = !0), this.forceSinglePass === !0 && (data.forceSinglePass = !0), this.wireframe === !0 && (data.wireframe = !0), this.wireframeLinewidth > 1 && (data.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (data.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (data.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (data.flatShading = !0), this.visible === !1 && (data.visible = !1), this.toneMapped === !1 && (data.toneMapped = !1), this.fog === !1 && (data.fog = !1), Object.keys(this.userData).length > 0 && (data.userData = this.userData);
      function extractFromCache(cache) {
        let values = [];
        for (let key in cache) {
          let data2 = cache[key];
          delete data2.metadata, values.push(data2);
        }
        return values;
      }
      if (isRootObject) {
        let textures = extractFromCache(meta.textures), images = extractFromCache(meta.images);
        textures.length > 0 && (data.textures = textures), images.length > 0 && (data.images = images);
      }
      return data;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(source) {
      this.name = source.name, this.blending = source.blending, this.side = source.side, this.vertexColors = source.vertexColors, this.opacity = source.opacity, this.transparent = source.transparent, this.blendSrc = source.blendSrc, this.blendDst = source.blendDst, this.blendEquation = source.blendEquation, this.blendSrcAlpha = source.blendSrcAlpha, this.blendDstAlpha = source.blendDstAlpha, this.blendEquationAlpha = source.blendEquationAlpha, this.blendColor.copy(source.blendColor), this.blendAlpha = source.blendAlpha, this.depthFunc = source.depthFunc, this.depthTest = source.depthTest, this.depthWrite = source.depthWrite, this.stencilWriteMask = source.stencilWriteMask, this.stencilFunc = source.stencilFunc, this.stencilRef = source.stencilRef, this.stencilFuncMask = source.stencilFuncMask, this.stencilFail = source.stencilFail, this.stencilZFail = source.stencilZFail, this.stencilZPass = source.stencilZPass, this.stencilWrite = source.stencilWrite;
      let srcPlanes = source.clippingPlanes, dstPlanes = null;
      if (srcPlanes !== null) {
        let n = srcPlanes.length;
        dstPlanes = new Array(n);
        for (let i = 0; i !== n; ++i)
          dstPlanes[i] = srcPlanes[i].clone();
      }
      return this.clippingPlanes = dstPlanes, this.clipIntersection = source.clipIntersection, this.clipShadows = source.clipShadows, this.shadowSide = source.shadowSide, this.colorWrite = source.colorWrite, this.precision = source.precision, this.polygonOffset = source.polygonOffset, this.polygonOffsetFactor = source.polygonOffsetFactor, this.polygonOffsetUnits = source.polygonOffsetUnits, this.dithering = source.dithering, this.alphaTest = source.alphaTest, this.alphaHash = source.alphaHash, this.alphaToCoverage = source.alphaToCoverage, this.premultipliedAlpha = source.premultipliedAlpha, this.forceSinglePass = source.forceSinglePass, this.visible = source.visible, this.toneMapped = source.toneMapped, this.userData = JSON.parse(JSON.stringify(source.userData)), this;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    set needsUpdate(value) {
      value === !0 && this.version++;
    }
    onBuild() {
      console.warn("Material: onBuild() has been removed.");
    }
    onBeforeRender() {
      console.warn("Material: onBeforeRender() has been removed.");
    }
  }, MeshBasicMaterial = class extends Material {
    constructor(parameters) {
      super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Color(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Euler(), this.combine = MultiplyOperation, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(parameters);
    }
    copy(source) {
      return super.copy(source), this.color.copy(source.color), this.map = source.map, this.lightMap = source.lightMap, this.lightMapIntensity = source.lightMapIntensity, this.aoMap = source.aoMap, this.aoMapIntensity = source.aoMapIntensity, this.specularMap = source.specularMap, this.alphaMap = source.alphaMap, this.envMap = source.envMap, this.envMapRotation.copy(source.envMapRotation), this.combine = source.combine, this.reflectivity = source.reflectivity, this.refractionRatio = source.refractionRatio, this.wireframe = source.wireframe, this.wireframeLinewidth = source.wireframeLinewidth, this.wireframeLinecap = source.wireframeLinecap, this.wireframeLinejoin = source.wireframeLinejoin, this.fog = source.fog, this;
    }
  };
  var _vector$9 = /* @__PURE__ */ new Vector3(), _vector2$1 = /* @__PURE__ */ new Vector2(), BufferAttribute = class {
    constructor(array, itemSize, normalized = !1) {
      if (Array.isArray(array))
        throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
      this.isBufferAttribute = !0, this.name = "", this.array = array, this.itemSize = itemSize, this.count = array !== void 0 ? array.length / itemSize : 0, this.normalized = normalized, this.usage = StaticDrawUsage, this._updateRange = { offset: 0, count: -1 }, this.updateRanges = [], this.gpuType = FloatType, this.version = 0;
    }
    onUploadCallback() {
    }
    set needsUpdate(value) {
      value === !0 && this.version++;
    }
    get updateRange() {
      return warnOnce("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."), this._updateRange;
    }
    setUsage(value) {
      return this.usage = value, this;
    }
    addUpdateRange(start, count) {
      this.updateRanges.push({ start, count });
    }
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    copy(source) {
      return this.name = source.name, this.array = new source.array.constructor(source.array), this.itemSize = source.itemSize, this.count = source.count, this.normalized = source.normalized, this.usage = source.usage, this.gpuType = source.gpuType, this;
    }
    copyAt(index1, attribute, index2) {
      index1 *= this.itemSize, index2 *= attribute.itemSize;
      for (let i = 0, l = this.itemSize; i < l; i++)
        this.array[index1 + i] = attribute.array[index2 + i];
      return this;
    }
    copyArray(array) {
      return this.array.set(array), this;
    }
    applyMatrix3(m) {
      if (this.itemSize === 2)
        for (let i = 0, l = this.count; i < l; i++)
          _vector2$1.fromBufferAttribute(this, i), _vector2$1.applyMatrix3(m), this.setXY(i, _vector2$1.x, _vector2$1.y);
      else if (this.itemSize === 3)
        for (let i = 0, l = this.count; i < l; i++)
          _vector$9.fromBufferAttribute(this, i), _vector$9.applyMatrix3(m), this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      return this;
    }
    applyMatrix4(m) {
      for (let i = 0, l = this.count; i < l; i++)
        _vector$9.fromBufferAttribute(this, i), _vector$9.applyMatrix4(m), this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      return this;
    }
    applyNormalMatrix(m) {
      for (let i = 0, l = this.count; i < l; i++)
        _vector$9.fromBufferAttribute(this, i), _vector$9.applyNormalMatrix(m), this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      return this;
    }
    transformDirection(m) {
      for (let i = 0, l = this.count; i < l; i++)
        _vector$9.fromBufferAttribute(this, i), _vector$9.transformDirection(m), this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      return this;
    }
    set(value, offset = 0) {
      return this.array.set(value, offset), this;
    }
    getComponent(index, component2) {
      let value = this.array[index * this.itemSize + component2];
      return this.normalized && (value = denormalize(value, this.array)), value;
    }
    setComponent(index, component2, value) {
      return this.normalized && (value = normalize(value, this.array)), this.array[index * this.itemSize + component2] = value, this;
    }
    getX(index) {
      let x = this.array[index * this.itemSize];
      return this.normalized && (x = denormalize(x, this.array)), x;
    }
    setX(index, x) {
      return this.normalized && (x = normalize(x, this.array)), this.array[index * this.itemSize] = x, this;
    }
    getY(index) {
      let y = this.array[index * this.itemSize + 1];
      return this.normalized && (y = denormalize(y, this.array)), y;
    }
    setY(index, y) {
      return this.normalized && (y = normalize(y, this.array)), this.array[index * this.itemSize + 1] = y, this;
    }
    getZ(index) {
      let z = this.array[index * this.itemSize + 2];
      return this.normalized && (z = denormalize(z, this.array)), z;
    }
    setZ(index, z) {
      return this.normalized && (z = normalize(z, this.array)), this.array[index * this.itemSize + 2] = z, this;
    }
    getW(index) {
      let w = this.array[index * this.itemSize + 3];
      return this.normalized && (w = denormalize(w, this.array)), w;
    }
    setW(index, w) {
      return this.normalized && (w = normalize(w, this.array)), this.array[index * this.itemSize + 3] = w, this;
    }
    setXY(index, x, y) {
      return index *= this.itemSize, this.normalized && (x = normalize(x, this.array), y = normalize(y, this.array)), this.array[index + 0] = x, this.array[index + 1] = y, this;
    }
    setXYZ(index, x, y, z) {
      return index *= this.itemSize, this.normalized && (x = normalize(x, this.array), y = normalize(y, this.array), z = normalize(z, this.array)), this.array[index + 0] = x, this.array[index + 1] = y, this.array[index + 2] = z, this;
    }
    setXYZW(index, x, y, z, w) {
      return index *= this.itemSize, this.normalized && (x = normalize(x, this.array), y = normalize(y, this.array), z = normalize(z, this.array), w = normalize(w, this.array)), this.array[index + 0] = x, this.array[index + 1] = y, this.array[index + 2] = z, this.array[index + 3] = w, this;
    }
    onUpload(callback) {
      return this.onUploadCallback = callback, this;
    }
    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }
    toJSON() {
      let data = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized
      };
      return this.name !== "" && (data.name = this.name), this.usage !== StaticDrawUsage && (data.usage = this.usage), data;
    }
  };
  var Uint16BufferAttribute = class extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Uint16Array(array), itemSize, normalized);
    }
  };
  var Uint32BufferAttribute = class extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Uint32Array(array), itemSize, normalized);
    }
  };
  var Float32BufferAttribute = class extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Float32Array(array), itemSize, normalized);
    }
  }, _id$2 = 0, _m1$2 = /* @__PURE__ */ new Matrix4(), _obj = /* @__PURE__ */ new Object3D(), _offset = /* @__PURE__ */ new Vector3(), _box$2 = /* @__PURE__ */ new Box3(), _boxMorphTargets = /* @__PURE__ */ new Box3(), _vector$8 = /* @__PURE__ */ new Vector3(), BufferGeometry = class _BufferGeometry extends EventDispatcher {
    constructor() {
      super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: _id$2++ }), this.uuid = generateUUID(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
    }
    getIndex() {
      return this.index;
    }
    setIndex(index) {
      return Array.isArray(index) ? this.index = new (arrayNeedsUint32(index) ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1) : this.index = index, this;
    }
    getAttribute(name) {
      return this.attributes[name];
    }
    setAttribute(name, attribute) {
      return this.attributes[name] = attribute, this;
    }
    deleteAttribute(name) {
      return delete this.attributes[name], this;
    }
    hasAttribute(name) {
      return this.attributes[name] !== void 0;
    }
    addGroup(start, count, materialIndex = 0) {
      this.groups.push({
        start,
        count,
        materialIndex
      });
    }
    clearGroups() {
      this.groups = [];
    }
    setDrawRange(start, count) {
      this.drawRange.start = start, this.drawRange.count = count;
    }
    applyMatrix4(matrix) {
      let position = this.attributes.position;
      position !== void 0 && (position.applyMatrix4(matrix), position.needsUpdate = !0);
      let normal = this.attributes.normal;
      if (normal !== void 0) {
        let normalMatrix = new Matrix3().getNormalMatrix(matrix);
        normal.applyNormalMatrix(normalMatrix), normal.needsUpdate = !0;
      }
      let tangent = this.attributes.tangent;
      return tangent !== void 0 && (tangent.transformDirection(matrix), tangent.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
    }
    applyQuaternion(q) {
      return _m1$2.makeRotationFromQuaternion(q), this.applyMatrix4(_m1$2), this;
    }
    rotateX(angle) {
      return _m1$2.makeRotationX(angle), this.applyMatrix4(_m1$2), this;
    }
    rotateY(angle) {
      return _m1$2.makeRotationY(angle), this.applyMatrix4(_m1$2), this;
    }
    rotateZ(angle) {
      return _m1$2.makeRotationZ(angle), this.applyMatrix4(_m1$2), this;
    }
    translate(x, y, z) {
      return _m1$2.makeTranslation(x, y, z), this.applyMatrix4(_m1$2), this;
    }
    scale(x, y, z) {
      return _m1$2.makeScale(x, y, z), this.applyMatrix4(_m1$2), this;
    }
    lookAt(vector) {
      return _obj.lookAt(vector), _obj.updateMatrix(), this.applyMatrix4(_obj.matrix), this;
    }
    center() {
      return this.computeBoundingBox(), this.boundingBox.getCenter(_offset).negate(), this.translate(_offset.x, _offset.y, _offset.z), this;
    }
    setFromPoints(points) {
      let position = [];
      for (let i = 0, l = points.length; i < l; i++) {
        let point = points[i];
        position.push(point.x, point.y, point.z || 0);
      }
      return this.setAttribute("position", new Float32BufferAttribute(position, 3)), this;
    }
    computeBoundingBox() {
      this.boundingBox === null && (this.boundingBox = new Box3());
      let position = this.attributes.position, morphAttributesPosition = this.morphAttributes.position;
      if (position && position.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
          new Vector3(-1 / 0, -1 / 0, -1 / 0),
          new Vector3(1 / 0, 1 / 0, 1 / 0)
        );
        return;
      }
      if (position !== void 0) {
        if (this.boundingBox.setFromBufferAttribute(position), morphAttributesPosition)
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            let morphAttribute = morphAttributesPosition[i];
            _box$2.setFromBufferAttribute(morphAttribute), this.morphTargetsRelative ? (_vector$8.addVectors(this.boundingBox.min, _box$2.min), this.boundingBox.expandByPoint(_vector$8), _vector$8.addVectors(this.boundingBox.max, _box$2.max), this.boundingBox.expandByPoint(_vector$8)) : (this.boundingBox.expandByPoint(_box$2.min), this.boundingBox.expandByPoint(_box$2.max));
          }
      } else
        this.boundingBox.makeEmpty();
      (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
    }
    computeBoundingSphere() {
      this.boundingSphere === null && (this.boundingSphere = new Sphere());
      let position = this.attributes.position, morphAttributesPosition = this.morphAttributes.position;
      if (position && position.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new Vector3(), 1 / 0);
        return;
      }
      if (position) {
        let center = this.boundingSphere.center;
        if (_box$2.setFromBufferAttribute(position), morphAttributesPosition)
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            let morphAttribute = morphAttributesPosition[i];
            _boxMorphTargets.setFromBufferAttribute(morphAttribute), this.morphTargetsRelative ? (_vector$8.addVectors(_box$2.min, _boxMorphTargets.min), _box$2.expandByPoint(_vector$8), _vector$8.addVectors(_box$2.max, _boxMorphTargets.max), _box$2.expandByPoint(_vector$8)) : (_box$2.expandByPoint(_boxMorphTargets.min), _box$2.expandByPoint(_boxMorphTargets.max));
          }
        _box$2.getCenter(center);
        let maxRadiusSq = 0;
        for (let i = 0, il = position.count; i < il; i++)
          _vector$8.fromBufferAttribute(position, i), maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$8));
        if (morphAttributesPosition)
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            let morphAttribute = morphAttributesPosition[i], morphTargetsRelative = this.morphTargetsRelative;
            for (let j = 0, jl = morphAttribute.count; j < jl; j++)
              _vector$8.fromBufferAttribute(morphAttribute, j), morphTargetsRelative && (_offset.fromBufferAttribute(position, j), _vector$8.add(_offset)), maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$8));
          }
        this.boundingSphere.radius = Math.sqrt(maxRadiusSq), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
      }
    }
    computeTangents() {
      let index = this.index, attributes = this.attributes;
      if (index === null || attributes.position === void 0 || attributes.normal === void 0 || attributes.uv === void 0) {
        console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
        return;
      }
      let positionAttribute = attributes.position, normalAttribute = attributes.normal, uvAttribute = attributes.uv;
      this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new BufferAttribute(new Float32Array(4 * positionAttribute.count), 4));
      let tangentAttribute = this.getAttribute("tangent"), tan1 = [], tan2 = [];
      for (let i = 0; i < positionAttribute.count; i++)
        tan1[i] = new Vector3(), tan2[i] = new Vector3();
      let vA = new Vector3(), vB = new Vector3(), vC = new Vector3(), uvA = new Vector2(), uvB = new Vector2(), uvC = new Vector2(), sdir = new Vector3(), tdir = new Vector3();
      function handleTriangle(a, b, c) {
        vA.fromBufferAttribute(positionAttribute, a), vB.fromBufferAttribute(positionAttribute, b), vC.fromBufferAttribute(positionAttribute, c), uvA.fromBufferAttribute(uvAttribute, a), uvB.fromBufferAttribute(uvAttribute, b), uvC.fromBufferAttribute(uvAttribute, c), vB.sub(vA), vC.sub(vA), uvB.sub(uvA), uvC.sub(uvA);
        let r = 1 / (uvB.x * uvC.y - uvC.x * uvB.y);
        isFinite(r) && (sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, -uvB.y).multiplyScalar(r), tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, -uvC.x).multiplyScalar(r), tan1[a].add(sdir), tan1[b].add(sdir), tan1[c].add(sdir), tan2[a].add(tdir), tan2[b].add(tdir), tan2[c].add(tdir));
      }
      let groups = this.groups;
      groups.length === 0 && (groups = [{
        start: 0,
        count: index.count
      }]);
      for (let i = 0, il = groups.length; i < il; ++i) {
        let group = groups[i], start = group.start, count = group.count;
        for (let j = start, jl = start + count; j < jl; j += 3)
          handleTriangle(
            index.getX(j + 0),
            index.getX(j + 1),
            index.getX(j + 2)
          );
      }
      let tmp = new Vector3(), tmp2 = new Vector3(), n = new Vector3(), n2 = new Vector3();
      function handleVertex(v) {
        n.fromBufferAttribute(normalAttribute, v), n2.copy(n);
        let t = tan1[v];
        tmp.copy(t), tmp.sub(n.multiplyScalar(n.dot(t))).normalize(), tmp2.crossVectors(n2, t);
        let w = tmp2.dot(tan2[v]) < 0 ? -1 : 1;
        tangentAttribute.setXYZW(v, tmp.x, tmp.y, tmp.z, w);
      }
      for (let i = 0, il = groups.length; i < il; ++i) {
        let group = groups[i], start = group.start, count = group.count;
        for (let j = start, jl = start + count; j < jl; j += 3)
          handleVertex(index.getX(j + 0)), handleVertex(index.getX(j + 1)), handleVertex(index.getX(j + 2));
      }
    }
    computeVertexNormals() {
      let index = this.index, positionAttribute = this.getAttribute("position");
      if (positionAttribute !== void 0) {
        let normalAttribute = this.getAttribute("normal");
        if (normalAttribute === void 0)
          normalAttribute = new BufferAttribute(new Float32Array(positionAttribute.count * 3), 3), this.setAttribute("normal", normalAttribute);
        else
          for (let i = 0, il = normalAttribute.count; i < il; i++)
            normalAttribute.setXYZ(i, 0, 0, 0);
        let pA = new Vector3(), pB = new Vector3(), pC = new Vector3(), nA = new Vector3(), nB = new Vector3(), nC = new Vector3(), cb = new Vector3(), ab = new Vector3();
        if (index)
          for (let i = 0, il = index.count; i < il; i += 3) {
            let vA = index.getX(i + 0), vB = index.getX(i + 1), vC = index.getX(i + 2);
            pA.fromBufferAttribute(positionAttribute, vA), pB.fromBufferAttribute(positionAttribute, vB), pC.fromBufferAttribute(positionAttribute, vC), cb.subVectors(pC, pB), ab.subVectors(pA, pB), cb.cross(ab), nA.fromBufferAttribute(normalAttribute, vA), nB.fromBufferAttribute(normalAttribute, vB), nC.fromBufferAttribute(normalAttribute, vC), nA.add(cb), nB.add(cb), nC.add(cb), normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z), normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z), normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);
          }
        else
          for (let i = 0, il = positionAttribute.count; i < il; i += 3)
            pA.fromBufferAttribute(positionAttribute, i + 0), pB.fromBufferAttribute(positionAttribute, i + 1), pC.fromBufferAttribute(positionAttribute, i + 2), cb.subVectors(pC, pB), ab.subVectors(pA, pB), cb.cross(ab), normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z), normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z), normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);
        this.normalizeNormals(), normalAttribute.needsUpdate = !0;
      }
    }
    normalizeNormals() {
      let normals = this.attributes.normal;
      for (let i = 0, il = normals.count; i < il; i++)
        _vector$8.fromBufferAttribute(normals, i), _vector$8.normalize(), normals.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
    }
    toNonIndexed() {
      function convertBufferAttribute(attribute, indices2) {
        let array = attribute.array, itemSize = attribute.itemSize, normalized = attribute.normalized, array2 = new array.constructor(indices2.length * itemSize), index = 0, index2 = 0;
        for (let i = 0, l = indices2.length; i < l; i++) {
          attribute.isInterleavedBufferAttribute ? index = indices2[i] * attribute.data.stride + attribute.offset : index = indices2[i] * itemSize;
          for (let j = 0; j < itemSize; j++)
            array2[index2++] = array[index++];
        }
        return new BufferAttribute(array2, itemSize, normalized);
      }
      if (this.index === null)
        return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
      let geometry2 = new _BufferGeometry(), indices = this.index.array, attributes = this.attributes;
      for (let name in attributes) {
        let attribute = attributes[name], newAttribute = convertBufferAttribute(attribute, indices);
        geometry2.setAttribute(name, newAttribute);
      }
      let morphAttributes = this.morphAttributes;
      for (let name in morphAttributes) {
        let morphArray = [], morphAttribute = morphAttributes[name];
        for (let i = 0, il = morphAttribute.length; i < il; i++) {
          let attribute = morphAttribute[i], newAttribute = convertBufferAttribute(attribute, indices);
          morphArray.push(newAttribute);
        }
        geometry2.morphAttributes[name] = morphArray;
      }
      geometry2.morphTargetsRelative = this.morphTargetsRelative;
      let groups = this.groups;
      for (let i = 0, l = groups.length; i < l; i++) {
        let group = groups[i];
        geometry2.addGroup(group.start, group.count, group.materialIndex);
      }
      return geometry2;
    }
    toJSON() {
      let data = {
        metadata: {
          version: 4.6,
          type: "BufferGeometry",
          generator: "BufferGeometry.toJSON"
        }
      };
      if (data.uuid = this.uuid, data.type = this.type, this.name !== "" && (data.name = this.name), Object.keys(this.userData).length > 0 && (data.userData = this.userData), this.parameters !== void 0) {
        let parameters = this.parameters;
        for (let key in parameters)
          parameters[key] !== void 0 && (data[key] = parameters[key]);
        return data;
      }
      data.data = { attributes: {} };
      let index = this.index;
      index !== null && (data.data.index = {
        type: index.array.constructor.name,
        array: Array.prototype.slice.call(index.array)
      });
      let attributes = this.attributes;
      for (let key in attributes) {
        let attribute = attributes[key];
        data.data.attributes[key] = attribute.toJSON(data.data);
      }
      let morphAttributes = {}, hasMorphAttributes = !1;
      for (let key in this.morphAttributes) {
        let attributeArray = this.morphAttributes[key], array = [];
        for (let i = 0, il = attributeArray.length; i < il; i++) {
          let attribute = attributeArray[i];
          array.push(attribute.toJSON(data.data));
        }
        array.length > 0 && (morphAttributes[key] = array, hasMorphAttributes = !0);
      }
      hasMorphAttributes && (data.data.morphAttributes = morphAttributes, data.data.morphTargetsRelative = this.morphTargetsRelative);
      let groups = this.groups;
      groups.length > 0 && (data.data.groups = JSON.parse(JSON.stringify(groups)));
      let boundingSphere = this.boundingSphere;
      return boundingSphere !== null && (data.data.boundingSphere = {
        center: boundingSphere.center.toArray(),
        radius: boundingSphere.radius
      }), data;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(source) {
      this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
      let data = {};
      this.name = source.name;
      let index = source.index;
      index !== null && this.setIndex(index.clone(data));
      let attributes = source.attributes;
      for (let name in attributes) {
        let attribute = attributes[name];
        this.setAttribute(name, attribute.clone(data));
      }
      let morphAttributes = source.morphAttributes;
      for (let name in morphAttributes) {
        let array = [], morphAttribute = morphAttributes[name];
        for (let i = 0, l = morphAttribute.length; i < l; i++)
          array.push(morphAttribute[i].clone(data));
        this.morphAttributes[name] = array;
      }
      this.morphTargetsRelative = source.morphTargetsRelative;
      let groups = source.groups;
      for (let i = 0, l = groups.length; i < l; i++) {
        let group = groups[i];
        this.addGroup(group.start, group.count, group.materialIndex);
      }
      let boundingBox = source.boundingBox;
      boundingBox !== null && (this.boundingBox = boundingBox.clone());
      let boundingSphere = source.boundingSphere;
      return boundingSphere !== null && (this.boundingSphere = boundingSphere.clone()), this.drawRange.start = source.drawRange.start, this.drawRange.count = source.drawRange.count, this.userData = source.userData, this;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }, _inverseMatrix$3 = /* @__PURE__ */ new Matrix4(), _ray$3 = /* @__PURE__ */ new Ray(), _sphere$6 = /* @__PURE__ */ new Sphere(), _sphereHitAt = /* @__PURE__ */ new Vector3(), _vA$1 = /* @__PURE__ */ new Vector3(), _vB$1 = /* @__PURE__ */ new Vector3(), _vC$1 = /* @__PURE__ */ new Vector3(), _tempA = /* @__PURE__ */ new Vector3(), _morphA = /* @__PURE__ */ new Vector3(), _uvA$1 = /* @__PURE__ */ new Vector2(), _uvB$1 = /* @__PURE__ */ new Vector2(), _uvC$1 = /* @__PURE__ */ new Vector2(), _normalA = /* @__PURE__ */ new Vector3(), _normalB = /* @__PURE__ */ new Vector3(), _normalC = /* @__PURE__ */ new Vector3(), _intersectionPoint = /* @__PURE__ */ new Vector3(), _intersectionPointWorld = /* @__PURE__ */ new Vector3(), Mesh = class extends Object3D {
    constructor(geometry = new BufferGeometry(), material = new MeshBasicMaterial()) {
      super(), this.isMesh = !0, this.type = "Mesh", this.geometry = geometry, this.material = material, this.updateMorphTargets();
    }
    copy(source, recursive) {
      return super.copy(source, recursive), source.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = source.morphTargetInfluences.slice()), source.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, source.morphTargetDictionary)), this.material = Array.isArray(source.material) ? source.material.slice() : source.material, this.geometry = source.geometry, this;
    }
    updateMorphTargets() {
      let morphAttributes = this.geometry.morphAttributes, keys = Object.keys(morphAttributes);
      if (keys.length > 0) {
        let morphAttribute = morphAttributes[keys[0]];
        if (morphAttribute !== void 0) {
          this.morphTargetInfluences = [], this.morphTargetDictionary = {};
          for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
            let name = morphAttribute[m].name || String(m);
            this.morphTargetInfluences.push(0), this.morphTargetDictionary[name] = m;
          }
        }
      }
    }
    getVertexPosition(index, target) {
      let geometry = this.geometry, position = geometry.attributes.position, morphPosition = geometry.morphAttributes.position, morphTargetsRelative = geometry.morphTargetsRelative;
      target.fromBufferAttribute(position, index);
      let morphInfluences = this.morphTargetInfluences;
      if (morphPosition && morphInfluences) {
        _morphA.set(0, 0, 0);
        for (let i = 0, il = morphPosition.length; i < il; i++) {
          let influence = morphInfluences[i], morphAttribute = morphPosition[i];
          influence !== 0 && (_tempA.fromBufferAttribute(morphAttribute, index), morphTargetsRelative ? _morphA.addScaledVector(_tempA, influence) : _morphA.addScaledVector(_tempA.sub(target), influence));
        }
        target.add(_morphA);
      }
      return target;
    }
    raycast(raycaster, intersects) {
      let geometry = this.geometry, material = this.material, matrixWorld = this.matrixWorld;
      material !== void 0 && (geometry.boundingSphere === null && geometry.computeBoundingSphere(), _sphere$6.copy(geometry.boundingSphere), _sphere$6.applyMatrix4(matrixWorld), _ray$3.copy(raycaster.ray).recast(raycaster.near), !(_sphere$6.containsPoint(_ray$3.origin) === !1 && (_ray$3.intersectSphere(_sphere$6, _sphereHitAt) === null || _ray$3.origin.distanceToSquared(_sphereHitAt) > (raycaster.far - raycaster.near) ** 2)) && (_inverseMatrix$3.copy(matrixWorld).invert(), _ray$3.copy(raycaster.ray).applyMatrix4(_inverseMatrix$3), !(geometry.boundingBox !== null && _ray$3.intersectsBox(geometry.boundingBox) === !1) && this._computeIntersections(raycaster, intersects, _ray$3)));
    }
    _computeIntersections(raycaster, intersects, rayLocalSpace) {
      let intersection, geometry = this.geometry, material = this.material, index = geometry.index, position = geometry.attributes.position, uv = geometry.attributes.uv, uv1 = geometry.attributes.uv1, normal = geometry.attributes.normal, groups = geometry.groups, drawRange = geometry.drawRange;
      if (index !== null)
        if (Array.isArray(material))
          for (let i = 0, il = groups.length; i < il; i++) {
            let group = groups[i], groupMaterial = material[group.materialIndex], start = Math.max(group.start, drawRange.start), end = Math.min(index.count, Math.min(group.start + group.count, drawRange.start + drawRange.count));
            for (let j = start, jl = end; j < jl; j += 3) {
              let a = index.getX(j), b = index.getX(j + 1), c = index.getX(j + 2);
              intersection = checkGeometryIntersection(this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c), intersection && (intersection.faceIndex = Math.floor(j / 3), intersection.face.materialIndex = group.materialIndex, intersects.push(intersection));
            }
          }
        else {
          let start = Math.max(0, drawRange.start), end = Math.min(index.count, drawRange.start + drawRange.count);
          for (let i = start, il = end; i < il; i += 3) {
            let a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
            intersection = checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c), intersection && (intersection.faceIndex = Math.floor(i / 3), intersects.push(intersection));
          }
        }
      else if (position !== void 0)
        if (Array.isArray(material))
          for (let i = 0, il = groups.length; i < il; i++) {
            let group = groups[i], groupMaterial = material[group.materialIndex], start = Math.max(group.start, drawRange.start), end = Math.min(position.count, Math.min(group.start + group.count, drawRange.start + drawRange.count));
            for (let j = start, jl = end; j < jl; j += 3) {
              let a = j, b = j + 1, c = j + 2;
              intersection = checkGeometryIntersection(this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c), intersection && (intersection.faceIndex = Math.floor(j / 3), intersection.face.materialIndex = group.materialIndex, intersects.push(intersection));
            }
          }
        else {
          let start = Math.max(0, drawRange.start), end = Math.min(position.count, drawRange.start + drawRange.count);
          for (let i = start, il = end; i < il; i += 3) {
            let a = i, b = i + 1, c = i + 2;
            intersection = checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c), intersection && (intersection.faceIndex = Math.floor(i / 3), intersects.push(intersection));
          }
        }
    }
  };
  function checkIntersection$1(object, material, raycaster, ray, pA, pB, pC, point) {
    let intersect;
    if (material.side === BackSide ? intersect = ray.intersectTriangle(pC, pB, pA, !0, point) : intersect = ray.intersectTriangle(pA, pB, pC, material.side === FrontSide, point), intersect === null) return null;
    _intersectionPointWorld.copy(point), _intersectionPointWorld.applyMatrix4(object.matrixWorld);
    let distance = raycaster.ray.origin.distanceTo(_intersectionPointWorld);
    return distance < raycaster.near || distance > raycaster.far ? null : {
      distance,
      point: _intersectionPointWorld.clone(),
      object
    };
  }
  function checkGeometryIntersection(object, material, raycaster, ray, uv, uv1, normal, a, b, c) {
    object.getVertexPosition(a, _vA$1), object.getVertexPosition(b, _vB$1), object.getVertexPosition(c, _vC$1);
    let intersection = checkIntersection$1(object, material, raycaster, ray, _vA$1, _vB$1, _vC$1, _intersectionPoint);
    if (intersection) {
      uv && (_uvA$1.fromBufferAttribute(uv, a), _uvB$1.fromBufferAttribute(uv, b), _uvC$1.fromBufferAttribute(uv, c), intersection.uv = Triangle.getInterpolation(_intersectionPoint, _vA$1, _vB$1, _vC$1, _uvA$1, _uvB$1, _uvC$1, new Vector2())), uv1 && (_uvA$1.fromBufferAttribute(uv1, a), _uvB$1.fromBufferAttribute(uv1, b), _uvC$1.fromBufferAttribute(uv1, c), intersection.uv1 = Triangle.getInterpolation(_intersectionPoint, _vA$1, _vB$1, _vC$1, _uvA$1, _uvB$1, _uvC$1, new Vector2())), normal && (_normalA.fromBufferAttribute(normal, a), _normalB.fromBufferAttribute(normal, b), _normalC.fromBufferAttribute(normal, c), intersection.normal = Triangle.getInterpolation(_intersectionPoint, _vA$1, _vB$1, _vC$1, _normalA, _normalB, _normalC, new Vector3()), intersection.normal.dot(ray.direction) > 0 && intersection.normal.multiplyScalar(-1));
      let face = {
        a,
        b,
        c,
        normal: new Vector3(),
        materialIndex: 0
      };
      Triangle.getNormal(_vA$1, _vB$1, _vC$1, face.normal), intersection.face = face;
    }
    return intersection;
  }
  var BoxGeometry = class _BoxGeometry extends BufferGeometry {
    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
      super(), this.type = "BoxGeometry", this.parameters = {
        width,
        height,
        depth,
        widthSegments,
        heightSegments,
        depthSegments
      };
      let scope = this;
      widthSegments = Math.floor(widthSegments), heightSegments = Math.floor(heightSegments), depthSegments = Math.floor(depthSegments);
      let indices = [], vertices = [], normals = [], uvs = [], numberOfVertices = 0, groupStart = 0;
      buildPlane("z", "y", "x", -1, -1, depth, height, width, depthSegments, heightSegments, 0), buildPlane("z", "y", "x", 1, -1, depth, height, -width, depthSegments, heightSegments, 1), buildPlane("x", "z", "y", 1, 1, width, depth, height, widthSegments, depthSegments, 2), buildPlane("x", "z", "y", 1, -1, width, depth, -height, widthSegments, depthSegments, 3), buildPlane("x", "y", "z", 1, -1, width, height, depth, widthSegments, heightSegments, 4), buildPlane("x", "y", "z", -1, -1, width, height, -depth, widthSegments, heightSegments, 5), this.setIndex(indices), this.setAttribute("position", new Float32BufferAttribute(vertices, 3)), this.setAttribute("normal", new Float32BufferAttribute(normals, 3)), this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
      function buildPlane(u, v, w, udir, vdir, width2, height2, depth2, gridX, gridY, materialIndex) {
        let segmentWidth = width2 / gridX, segmentHeight = height2 / gridY, widthHalf = width2 / 2, heightHalf = height2 / 2, depthHalf = depth2 / 2, gridX1 = gridX + 1, gridY1 = gridY + 1, vertexCounter = 0, groupCount = 0, vector = new Vector3();
        for (let iy = 0; iy < gridY1; iy++) {
          let y = iy * segmentHeight - heightHalf;
          for (let ix = 0; ix < gridX1; ix++) {
            let x = ix * segmentWidth - widthHalf;
            vector[u] = x * udir, vector[v] = y * vdir, vector[w] = depthHalf, vertices.push(vector.x, vector.y, vector.z), vector[u] = 0, vector[v] = 0, vector[w] = depth2 > 0 ? 1 : -1, normals.push(vector.x, vector.y, vector.z), uvs.push(ix / gridX), uvs.push(1 - iy / gridY), vertexCounter += 1;
          }
        }
        for (let iy = 0; iy < gridY; iy++)
          for (let ix = 0; ix < gridX; ix++) {
            let a = numberOfVertices + ix + gridX1 * iy, b = numberOfVertices + ix + gridX1 * (iy + 1), c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1), d = numberOfVertices + (ix + 1) + gridX1 * iy;
            indices.push(a, b, d), indices.push(b, c, d), groupCount += 6;
          }
        scope.addGroup(groupStart, groupCount, materialIndex), groupStart += groupCount, numberOfVertices += vertexCounter;
      }
    }
    copy(source) {
      return super.copy(source), this.parameters = Object.assign({}, source.parameters), this;
    }
    static fromJSON(data) {
      return new _BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
    }
  };
  function cloneUniforms(src) {
    let dst = {};
    for (let u in src) {
      dst[u] = {};
      for (let p in src[u]) {
        let property = src[u][p];
        property && (property.isColor || property.isMatrix3 || property.isMatrix4 || property.isVector2 || property.isVector3 || property.isVector4 || property.isTexture || property.isQuaternion) ? property.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), dst[u][p] = null) : dst[u][p] = property.clone() : Array.isArray(property) ? dst[u][p] = property.slice() : dst[u][p] = property;
      }
    }
    return dst;
  }
  function mergeUniforms(uniforms) {
    let merged = {};
    for (let u = 0; u < uniforms.length; u++) {
      let tmp = cloneUniforms(uniforms[u]);
      for (let p in tmp)
        merged[p] = tmp[p];
    }
    return merged;
  }
  function cloneUniformsGroups(src) {
    let dst = [];
    for (let u = 0; u < src.length; u++)
      dst.push(src[u].clone());
    return dst;
  }
  function getUnlitUniformColorSpace(renderer) {
    let currentRenderTarget = renderer.getRenderTarget();
    return currentRenderTarget === null ? renderer.outputColorSpace : currentRenderTarget.isXRRenderTarget === !0 ? currentRenderTarget.texture.colorSpace : ColorManagement.workingColorSpace;
  }
  var UniformsUtils = { clone: cloneUniforms, merge: mergeUniforms }, default_vertex = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, default_fragment = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`, ShaderMaterial = class extends Material {
    constructor(parameters) {
      super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = default_vertex, this.fragmentShader = default_fragment, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
        clipCullDistance: !1,
        // set to use vertex shader clipping
        multiDraw: !1
        // set to use vertex shader multi_draw / enable gl_DrawID
      }, this.defaultAttributeValues = {
        color: [1, 1, 1],
        uv: [0, 0],
        uv1: [0, 0]
      }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, parameters !== void 0 && this.setValues(parameters);
    }
    copy(source) {
      return super.copy(source), this.fragmentShader = source.fragmentShader, this.vertexShader = source.vertexShader, this.uniforms = cloneUniforms(source.uniforms), this.uniformsGroups = cloneUniformsGroups(source.uniformsGroups), this.defines = Object.assign({}, source.defines), this.wireframe = source.wireframe, this.wireframeLinewidth = source.wireframeLinewidth, this.fog = source.fog, this.lights = source.lights, this.clipping = source.clipping, this.extensions = Object.assign({}, source.extensions), this.glslVersion = source.glslVersion, this;
    }
    toJSON(meta) {
      let data = super.toJSON(meta);
      data.glslVersion = this.glslVersion, data.uniforms = {};
      for (let name in this.uniforms) {
        let value = this.uniforms[name].value;
        value && value.isTexture ? data.uniforms[name] = {
          type: "t",
          value: value.toJSON(meta).uuid
        } : value && value.isColor ? data.uniforms[name] = {
          type: "c",
          value: value.getHex()
        } : value && value.isVector2 ? data.uniforms[name] = {
          type: "v2",
          value: value.toArray()
        } : value && value.isVector3 ? data.uniforms[name] = {
          type: "v3",
          value: value.toArray()
        } : value && value.isVector4 ? data.uniforms[name] = {
          type: "v4",
          value: value.toArray()
        } : value && value.isMatrix3 ? data.uniforms[name] = {
          type: "m3",
          value: value.toArray()
        } : value && value.isMatrix4 ? data.uniforms[name] = {
          type: "m4",
          value: value.toArray()
        } : data.uniforms[name] = {
          value
        };
      }
      Object.keys(this.defines).length > 0 && (data.defines = this.defines), data.vertexShader = this.vertexShader, data.fragmentShader = this.fragmentShader, data.lights = this.lights, data.clipping = this.clipping;
      let extensions = {};
      for (let key in this.extensions)
        this.extensions[key] === !0 && (extensions[key] = !0);
      return Object.keys(extensions).length > 0 && (data.extensions = extensions), data;
    }
  }, Camera = class extends Object3D {
    constructor() {
      super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Matrix4(), this.projectionMatrix = new Matrix4(), this.projectionMatrixInverse = new Matrix4(), this.coordinateSystem = WebGLCoordinateSystem;
    }
    copy(source, recursive) {
      return super.copy(source, recursive), this.matrixWorldInverse.copy(source.matrixWorldInverse), this.projectionMatrix.copy(source.projectionMatrix), this.projectionMatrixInverse.copy(source.projectionMatrixInverse), this.coordinateSystem = source.coordinateSystem, this;
    }
    getWorldDirection(target) {
      return super.getWorldDirection(target).negate();
    }
    updateMatrixWorld(force) {
      super.updateMatrixWorld(force), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    updateWorldMatrix(updateParents, updateChildren) {
      super.updateWorldMatrix(updateParents, updateChildren), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }, _v3$1 = /* @__PURE__ */ new Vector3(), _minTarget = /* @__PURE__ */ new Vector2(), _maxTarget = /* @__PURE__ */ new Vector2(), PerspectiveCamera = class extends Camera {
    constructor(fov2 = 50, aspect2 = 1, near = 0.1, far = 2e3) {
      super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = fov2, this.zoom = 1, this.near = near, this.far = far, this.focus = 10, this.aspect = aspect2, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
    }
    copy(source, recursive) {
      return super.copy(source, recursive), this.fov = source.fov, this.zoom = source.zoom, this.near = source.near, this.far = source.far, this.focus = source.focus, this.aspect = source.aspect, this.view = source.view === null ? null : Object.assign({}, source.view), this.filmGauge = source.filmGauge, this.filmOffset = source.filmOffset, this;
    }
    /**
     * Sets the FOV by focal length in respect to the current .filmGauge.
     *
     * The default film gauge is 35, so that the focal length can be specified for
     * a 35mm (full frame) camera.
     *
     * Values for focal length and film gauge must have the same unit.
     */
    setFocalLength(focalLength) {
      let vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;
      this.fov = RAD2DEG * 2 * Math.atan(vExtentSlope), this.updateProjectionMatrix();
    }
    /**
     * Calculates the focal length from the current .fov and .filmGauge.
     */
    getFocalLength() {
      let vExtentSlope = Math.tan(DEG2RAD * 0.5 * this.fov);
      return 0.5 * this.getFilmHeight() / vExtentSlope;
    }
    getEffectiveFOV() {
      return RAD2DEG * 2 * Math.atan(
        Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom
      );
    }
    getFilmWidth() {
      return this.filmGauge * Math.min(this.aspect, 1);
    }
    getFilmHeight() {
      return this.filmGauge / Math.max(this.aspect, 1);
    }
    /**
     * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
     * Sets minTarget and maxTarget to the coordinates of the lower-left and upper-right corners of the view rectangle.
     */
    getViewBounds(distance, minTarget, maxTarget) {
      _v3$1.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), minTarget.set(_v3$1.x, _v3$1.y).multiplyScalar(-distance / _v3$1.z), _v3$1.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), maxTarget.set(_v3$1.x, _v3$1.y).multiplyScalar(-distance / _v3$1.z);
    }
    /**
     * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
     * Copies the result into the target Vector2, where x is width and y is height.
     */
    getViewSize(distance, target) {
      return this.getViewBounds(distance, _minTarget, _maxTarget), target.subVectors(_maxTarget, _minTarget);
    }
    /**
     * Sets an offset in a larger frustum. This is useful for multi-window or
     * multi-monitor/multi-machine setups.
     *
     * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
     * the monitors are in grid like this
     *
     *   +---+---+---+
     *   | A | B | C |
     *   +---+---+---+
     *   | D | E | F |
     *   +---+---+---+
     *
     * then for each monitor you would call it like this
     *
     *   const w = 1920;
     *   const h = 1080;
     *   const fullWidth = w * 3;
     *   const fullHeight = h * 2;
     *
     *   --A--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
     *   --B--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
     *   --C--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
     *   --D--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
     *   --E--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
     *   --F--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
     *
     *   Note there is no reason monitors have to be the same size or in a grid.
     */
    setViewOffset(fullWidth, fullHeight, x, y, width, height) {
      this.aspect = fullWidth / fullHeight, this.view === null && (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      }), this.view.enabled = !0, this.view.fullWidth = fullWidth, this.view.fullHeight = fullHeight, this.view.offsetX = x, this.view.offsetY = y, this.view.width = width, this.view.height = height, this.updateProjectionMatrix();
    }
    clearViewOffset() {
      this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      let near = this.near, top = near * Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom, height = 2 * top, width = this.aspect * height, left = -0.5 * width, view = this.view;
      if (this.view !== null && this.view.enabled) {
        let fullWidth = view.fullWidth, fullHeight = view.fullHeight;
        left += view.offsetX * width / fullWidth, top -= view.offsetY * height / fullHeight, width *= view.width / fullWidth, height *= view.height / fullHeight;
      }
      let skew = this.filmOffset;
      skew !== 0 && (left += near * skew / this.getFilmWidth()), this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(meta) {
      let data = super.toJSON(meta);
      return data.object.fov = this.fov, data.object.zoom = this.zoom, data.object.near = this.near, data.object.far = this.far, data.object.focus = this.focus, data.object.aspect = this.aspect, this.view !== null && (data.object.view = Object.assign({}, this.view)), data.object.filmGauge = this.filmGauge, data.object.filmOffset = this.filmOffset, data;
    }
  }, fov = -90, aspect = 1, CubeCamera = class extends Object3D {
    constructor(near, far, renderTarget) {
      super(), this.type = "CubeCamera", this.renderTarget = renderTarget, this.coordinateSystem = null, this.activeMipmapLevel = 0;
      let cameraPX = new PerspectiveCamera(fov, aspect, near, far);
      cameraPX.layers = this.layers, this.add(cameraPX);
      let cameraNX = new PerspectiveCamera(fov, aspect, near, far);
      cameraNX.layers = this.layers, this.add(cameraNX);
      let cameraPY = new PerspectiveCamera(fov, aspect, near, far);
      cameraPY.layers = this.layers, this.add(cameraPY);
      let cameraNY = new PerspectiveCamera(fov, aspect, near, far);
      cameraNY.layers = this.layers, this.add(cameraNY);
      let cameraPZ = new PerspectiveCamera(fov, aspect, near, far);
      cameraPZ.layers = this.layers, this.add(cameraPZ);
      let cameraNZ = new PerspectiveCamera(fov, aspect, near, far);
      cameraNZ.layers = this.layers, this.add(cameraNZ);
    }
    updateCoordinateSystem() {
      let coordinateSystem = this.coordinateSystem, cameras = this.children.concat(), [cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ] = cameras;
      for (let camera of cameras) this.remove(camera);
      if (coordinateSystem === WebGLCoordinateSystem)
        cameraPX.up.set(0, 1, 0), cameraPX.lookAt(1, 0, 0), cameraNX.up.set(0, 1, 0), cameraNX.lookAt(-1, 0, 0), cameraPY.up.set(0, 0, -1), cameraPY.lookAt(0, 1, 0), cameraNY.up.set(0, 0, 1), cameraNY.lookAt(0, -1, 0), cameraPZ.up.set(0, 1, 0), cameraPZ.lookAt(0, 0, 1), cameraNZ.up.set(0, 1, 0), cameraNZ.lookAt(0, 0, -1);
      else if (coordinateSystem === WebGPUCoordinateSystem)
        cameraPX.up.set(0, -1, 0), cameraPX.lookAt(-1, 0, 0), cameraNX.up.set(0, -1, 0), cameraNX.lookAt(1, 0, 0), cameraPY.up.set(0, 0, 1), cameraPY.lookAt(0, 1, 0), cameraNY.up.set(0, 0, -1), cameraNY.lookAt(0, -1, 0), cameraPZ.up.set(0, -1, 0), cameraPZ.lookAt(0, 0, 1), cameraNZ.up.set(0, -1, 0), cameraNZ.lookAt(0, 0, -1);
      else
        throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + coordinateSystem);
      for (let camera of cameras)
        this.add(camera), camera.updateMatrixWorld();
    }
    update(renderer, scene) {
      this.parent === null && this.updateMatrixWorld();
      let { renderTarget, activeMipmapLevel } = this;
      this.coordinateSystem !== renderer.coordinateSystem && (this.coordinateSystem = renderer.coordinateSystem, this.updateCoordinateSystem());
      let [cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ] = this.children, currentRenderTarget = renderer.getRenderTarget(), currentActiveCubeFace = renderer.getActiveCubeFace(), currentActiveMipmapLevel = renderer.getActiveMipmapLevel(), currentXrEnabled = renderer.xr.enabled;
      renderer.xr.enabled = !1;
      let generateMipmaps = renderTarget.texture.generateMipmaps;
      renderTarget.texture.generateMipmaps = !1, renderer.setRenderTarget(renderTarget, 0, activeMipmapLevel), renderer.render(scene, cameraPX), renderer.setRenderTarget(renderTarget, 1, activeMipmapLevel), renderer.render(scene, cameraNX), renderer.setRenderTarget(renderTarget, 2, activeMipmapLevel), renderer.render(scene, cameraPY), renderer.setRenderTarget(renderTarget, 3, activeMipmapLevel), renderer.render(scene, cameraNY), renderer.setRenderTarget(renderTarget, 4, activeMipmapLevel), renderer.render(scene, cameraPZ), renderTarget.texture.generateMipmaps = generateMipmaps, renderer.setRenderTarget(renderTarget, 5, activeMipmapLevel), renderer.render(scene, cameraNZ), renderer.setRenderTarget(currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel), renderer.xr.enabled = currentXrEnabled, renderTarget.texture.needsPMREMUpdate = !0;
    }
  }, CubeTexture = class extends Texture {
    constructor(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace) {
      images = images !== void 0 ? images : [], mapping = mapping !== void 0 ? mapping : CubeReflectionMapping, super(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace), this.isCubeTexture = !0, this.flipY = !1;
    }
    get images() {
      return this.image;
    }
    set images(value) {
      this.image = value;
    }
  }, WebGLCubeRenderTarget = class extends WebGLRenderTarget {
    constructor(size = 1, options = {}) {
      super(size, size, options), this.isWebGLCubeRenderTarget = !0;
      let image = { width: size, height: size, depth: 1 }, images = [image, image, image, image, image, image];
      this.texture = new CubeTexture(images, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = options.generateMipmaps !== void 0 ? options.generateMipmaps : !1, this.texture.minFilter = options.minFilter !== void 0 ? options.minFilter : LinearFilter;
    }
    fromEquirectangularTexture(renderer, texture) {
      this.texture.type = texture.type, this.texture.colorSpace = texture.colorSpace, this.texture.generateMipmaps = texture.generateMipmaps, this.texture.minFilter = texture.minFilter, this.texture.magFilter = texture.magFilter;
      let shader = {
        uniforms: {
          tEquirect: { value: null }
        },
        vertexShader: (
          /* glsl */
          `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`
        ),
        fragmentShader: (
          /* glsl */
          `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
        )
      }, geometry = new BoxGeometry(5, 5, 5), material = new ShaderMaterial({
        name: "CubemapFromEquirect",
        uniforms: cloneUniforms(shader.uniforms),
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        side: BackSide,
        blending: NoBlending
      });
      material.uniforms.tEquirect.value = texture;
      let mesh = new Mesh(geometry, material), currentMinFilter = texture.minFilter;
      return texture.minFilter === LinearMipmapLinearFilter && (texture.minFilter = LinearFilter), new CubeCamera(1, 10, this).update(renderer, mesh), texture.minFilter = currentMinFilter, mesh.geometry.dispose(), mesh.material.dispose(), this;
    }
    clear(renderer, color, depth, stencil) {
      let currentRenderTarget = renderer.getRenderTarget();
      for (let i = 0; i < 6; i++)
        renderer.setRenderTarget(this, i), renderer.clear(color, depth, stencil);
      renderer.setRenderTarget(currentRenderTarget);
    }
  }, _vector1 = /* @__PURE__ */ new Vector3(), _vector2 = /* @__PURE__ */ new Vector3(), _normalMatrix = /* @__PURE__ */ new Matrix3(), Plane = class {
    constructor(normal = new Vector3(1, 0, 0), constant = 0) {
      this.isPlane = !0, this.normal = normal, this.constant = constant;
    }
    set(normal, constant) {
      return this.normal.copy(normal), this.constant = constant, this;
    }
    setComponents(x, y, z, w) {
      return this.normal.set(x, y, z), this.constant = w, this;
    }
    setFromNormalAndCoplanarPoint(normal, point) {
      return this.normal.copy(normal), this.constant = -point.dot(this.normal), this;
    }
    setFromCoplanarPoints(a, b, c) {
      let normal = _vector1.subVectors(c, b).cross(_vector2.subVectors(a, b)).normalize();
      return this.setFromNormalAndCoplanarPoint(normal, a), this;
    }
    copy(plane) {
      return this.normal.copy(plane.normal), this.constant = plane.constant, this;
    }
    normalize() {
      let inverseNormalLength = 1 / this.normal.length();
      return this.normal.multiplyScalar(inverseNormalLength), this.constant *= inverseNormalLength, this;
    }
    negate() {
      return this.constant *= -1, this.normal.negate(), this;
    }
    distanceToPoint(point) {
      return this.normal.dot(point) + this.constant;
    }
    distanceToSphere(sphere) {
      return this.distanceToPoint(sphere.center) - sphere.radius;
    }
    projectPoint(point, target) {
      return target.copy(point).addScaledVector(this.normal, -this.distanceToPoint(point));
    }
    intersectLine(line, target) {
      let direction = line.delta(_vector1), denominator = this.normal.dot(direction);
      if (denominator === 0)
        return this.distanceToPoint(line.start) === 0 ? target.copy(line.start) : null;
      let t = -(line.start.dot(this.normal) + this.constant) / denominator;
      return t < 0 || t > 1 ? null : target.copy(line.start).addScaledVector(direction, t);
    }
    intersectsLine(line) {
      let startSign = this.distanceToPoint(line.start), endSign = this.distanceToPoint(line.end);
      return startSign < 0 && endSign > 0 || endSign < 0 && startSign > 0;
    }
    intersectsBox(box) {
      return box.intersectsPlane(this);
    }
    intersectsSphere(sphere) {
      return sphere.intersectsPlane(this);
    }
    coplanarPoint(target) {
      return target.copy(this.normal).multiplyScalar(-this.constant);
    }
    applyMatrix4(matrix, optionalNormalMatrix) {
      let normalMatrix = optionalNormalMatrix || _normalMatrix.getNormalMatrix(matrix), referencePoint = this.coplanarPoint(_vector1).applyMatrix4(matrix), normal = this.normal.applyMatrix3(normalMatrix).normalize();
      return this.constant = -referencePoint.dot(normal), this;
    }
    translate(offset) {
      return this.constant -= offset.dot(this.normal), this;
    }
    equals(plane) {
      return plane.normal.equals(this.normal) && plane.constant === this.constant;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }, _sphere$5 = /* @__PURE__ */ new Sphere(), _vector$7 = /* @__PURE__ */ new Vector3(), Frustum = class {
    constructor(p0 = new Plane(), p1 = new Plane(), p2 = new Plane(), p3 = new Plane(), p4 = new Plane(), p5 = new Plane()) {
      this.planes = [p0, p1, p2, p3, p4, p5];
    }
    set(p0, p1, p2, p3, p4, p5) {
      let planes = this.planes;
      return planes[0].copy(p0), planes[1].copy(p1), planes[2].copy(p2), planes[3].copy(p3), planes[4].copy(p4), planes[5].copy(p5), this;
    }
    copy(frustum) {
      let planes = this.planes;
      for (let i = 0; i < 6; i++)
        planes[i].copy(frustum.planes[i]);
      return this;
    }
    setFromProjectionMatrix(m, coordinateSystem = WebGLCoordinateSystem) {
      let planes = this.planes, me = m.elements, me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3], me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7], me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11], me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];
      if (planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize(), planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize(), planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize(), planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize(), planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize(), coordinateSystem === WebGLCoordinateSystem)
        planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
      else if (coordinateSystem === WebGPUCoordinateSystem)
        planes[5].setComponents(me2, me6, me10, me14).normalize();
      else
        throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + coordinateSystem);
      return this;
    }
    intersectsObject(object) {
      if (object.boundingSphere !== void 0)
        object.boundingSphere === null && object.computeBoundingSphere(), _sphere$5.copy(object.boundingSphere).applyMatrix4(object.matrixWorld);
      else {
        let geometry = object.geometry;
        geometry.boundingSphere === null && geometry.computeBoundingSphere(), _sphere$5.copy(geometry.boundingSphere).applyMatrix4(object.matrixWorld);
      }
      return this.intersectsSphere(_sphere$5);
    }
    intersectsSprite(sprite) {
      return _sphere$5.center.set(0, 0, 0), _sphere$5.radius = 0.7071067811865476, _sphere$5.applyMatrix4(sprite.matrixWorld), this.intersectsSphere(_sphere$5);
    }
    intersectsSphere(sphere) {
      let planes = this.planes, center = sphere.center, negRadius = -sphere.radius;
      for (let i = 0; i < 6; i++)
        if (planes[i].distanceToPoint(center) < negRadius)
          return !1;
      return !0;
    }
    intersectsBox(box) {
      let planes = this.planes;
      for (let i = 0; i < 6; i++) {
        let plane = planes[i];
        if (_vector$7.x = plane.normal.x > 0 ? box.max.x : box.min.x, _vector$7.y = plane.normal.y > 0 ? box.max.y : box.min.y, _vector$7.z = plane.normal.z > 0 ? box.max.z : box.min.z, plane.distanceToPoint(_vector$7) < 0)
          return !1;
      }
      return !0;
    }
    containsPoint(point) {
      let planes = this.planes;
      for (let i = 0; i < 6; i++)
        if (planes[i].distanceToPoint(point) < 0)
          return !1;
      return !0;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  };
  function WebGLAnimation() {
    let context = null, isAnimating = !1, animationLoop = null, requestId = null;
    function onAnimationFrame(time, frame) {
      animationLoop(time, frame), requestId = context.requestAnimationFrame(onAnimationFrame);
    }
    return {
      start: function() {
        isAnimating !== !0 && animationLoop !== null && (requestId = context.requestAnimationFrame(onAnimationFrame), isAnimating = !0);
      },
      stop: function() {
        context.cancelAnimationFrame(requestId), isAnimating = !1;
      },
      setAnimationLoop: function(callback) {
        animationLoop = callback;
      },
      setContext: function(value) {
        context = value;
      }
    };
  }
  function WebGLAttributes(gl) {
    let buffers = /* @__PURE__ */ new WeakMap();
    function createBuffer(attribute, bufferType) {
      let array = attribute.array, usage = attribute.usage, size = array.byteLength, buffer = gl.createBuffer();
      gl.bindBuffer(bufferType, buffer), gl.bufferData(bufferType, array, usage), attribute.onUploadCallback();
      let type;
      if (array instanceof Float32Array)
        type = gl.FLOAT;
      else if (array instanceof Uint16Array)
        attribute.isFloat16BufferAttribute ? type = gl.HALF_FLOAT : type = gl.UNSIGNED_SHORT;
      else if (array instanceof Int16Array)
        type = gl.SHORT;
      else if (array instanceof Uint32Array)
        type = gl.UNSIGNED_INT;
      else if (array instanceof Int32Array)
        type = gl.INT;
      else if (array instanceof Int8Array)
        type = gl.BYTE;
      else if (array instanceof Uint8Array)
        type = gl.UNSIGNED_BYTE;
      else if (array instanceof Uint8ClampedArray)
        type = gl.UNSIGNED_BYTE;
      else
        throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + array);
      return {
        buffer,
        type,
        bytesPerElement: array.BYTES_PER_ELEMENT,
        version: attribute.version,
        size
      };
    }
    function updateBuffer(buffer, attribute, bufferType) {
      let array = attribute.array, updateRange = attribute._updateRange, updateRanges = attribute.updateRanges;
      if (gl.bindBuffer(bufferType, buffer), updateRange.count === -1 && updateRanges.length === 0 && gl.bufferSubData(bufferType, 0, array), updateRanges.length !== 0) {
        for (let i = 0, l = updateRanges.length; i < l; i++) {
          let range = updateRanges[i];
          gl.bufferSubData(
            bufferType,
            range.start * array.BYTES_PER_ELEMENT,
            array,
            range.start,
            range.count
          );
        }
        attribute.clearUpdateRanges();
      }
      updateRange.count !== -1 && (gl.bufferSubData(
        bufferType,
        updateRange.offset * array.BYTES_PER_ELEMENT,
        array,
        updateRange.offset,
        updateRange.count
      ), updateRange.count = -1), attribute.onUploadCallback();
    }
    function get(attribute) {
      return attribute.isInterleavedBufferAttribute && (attribute = attribute.data), buffers.get(attribute);
    }
    function remove(attribute) {
      attribute.isInterleavedBufferAttribute && (attribute = attribute.data);
      let data = buffers.get(attribute);
      data && (gl.deleteBuffer(data.buffer), buffers.delete(attribute));
    }
    function update(attribute, bufferType) {
      if (attribute.isInterleavedBufferAttribute && (attribute = attribute.data), attribute.isGLBufferAttribute) {
        let cached = buffers.get(attribute);
        (!cached || cached.version < attribute.version) && buffers.set(attribute, {
          buffer: attribute.buffer,
          type: attribute.type,
          bytesPerElement: attribute.elementSize,
          version: attribute.version
        });
        return;
      }
      let data = buffers.get(attribute);
      if (data === void 0)
        buffers.set(attribute, createBuffer(attribute, bufferType));
      else if (data.version < attribute.version) {
        if (data.size !== attribute.array.byteLength)
          throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
        updateBuffer(data.buffer, attribute, bufferType), data.version = attribute.version;
      }
    }
    return {
      get,
      remove,
      update
    };
  }
  var PlaneGeometry = class _PlaneGeometry extends BufferGeometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
      super(), this.type = "PlaneGeometry", this.parameters = {
        width,
        height,
        widthSegments,
        heightSegments
      };
      let width_half = width / 2, height_half = height / 2, gridX = Math.floor(widthSegments), gridY = Math.floor(heightSegments), gridX1 = gridX + 1, gridY1 = gridY + 1, segment_width = width / gridX, segment_height = height / gridY, indices = [], vertices = [], normals = [], uvs = [];
      for (let iy = 0; iy < gridY1; iy++) {
        let y = iy * segment_height - height_half;
        for (let ix = 0; ix < gridX1; ix++) {
          let x = ix * segment_width - width_half;
          vertices.push(x, -y, 0), normals.push(0, 0, 1), uvs.push(ix / gridX), uvs.push(1 - iy / gridY);
        }
      }
      for (let iy = 0; iy < gridY; iy++)
        for (let ix = 0; ix < gridX; ix++) {
          let a = ix + gridX1 * iy, b = ix + gridX1 * (iy + 1), c = ix + 1 + gridX1 * (iy + 1), d = ix + 1 + gridX1 * iy;
          indices.push(a, b, d), indices.push(b, c, d);
        }
      this.setIndex(indices), this.setAttribute("position", new Float32BufferAttribute(vertices, 3)), this.setAttribute("normal", new Float32BufferAttribute(normals, 3)), this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    }
    copy(source) {
      return super.copy(source), this.parameters = Object.assign({}, source.parameters), this;
    }
    static fromJSON(data) {
      return new _PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments);
    }
  }, alphahash_fragment = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, alphahash_pars_fragment = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`, alphamap_fragment = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, alphamap_pars_fragment = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, alphatest_fragment = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, alphatest_pars_fragment = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, aomap_fragment = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`, aomap_pars_fragment = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, batching_pars_vertex = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`, batching_vertex = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, begin_vertex = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, beginnormal_vertex = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, bsdfs = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`, iridescence_fragment = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`, bumpmap_pars_fragment = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`, clipping_planes_fragment = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`, clipping_planes_pars_fragment = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, clipping_planes_pars_vertex = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, clipping_planes_vertex = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, color_fragment = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, color_pars_fragment = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, color_pars_vertex = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, color_vertex = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`, common = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`, cube_uv_reflection_fragment = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`, defaultnormal_vertex = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`, displacementmap_pars_vertex = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, displacementmap_vertex = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, emissivemap_fragment = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, emissivemap_pars_fragment = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, colorspace_fragment = "gl_FragColor = linearToOutputTexel( gl_FragColor );", colorspace_pars_fragment = `
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, envmap_fragment = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`, envmap_common_pars_fragment = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, envmap_pars_fragment = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`, envmap_pars_vertex = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, envmap_vertex = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`, fog_vertex = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, fog_pars_vertex = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, fog_fragment = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, fog_pars_fragment = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, gradientmap_pars_fragment = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`, lightmap_pars_fragment = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, lights_lambert_fragment = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, lights_lambert_pars_fragment = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, lights_pars_begin = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`, envmap_physical_pars_fragment = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`, lights_toon_fragment = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, lights_toon_pars_fragment = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, lights_phong_fragment = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, lights_phong_pars_fragment = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, lights_physical_fragment = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`, lights_physical_pars_fragment = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`, lights_fragment_begin = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`, lights_fragment_maps = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`, lights_fragment_end = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, logdepthbuf_fragment = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, logdepthbuf_pars_fragment = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, logdepthbuf_pars_vertex = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, logdepthbuf_vertex = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, map_fragment = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, map_pars_fragment = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, map_particle_fragment = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`, map_particle_pars_fragment = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, metalnessmap_fragment = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, metalnessmap_pars_fragment = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, morphinstance_vertex = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, morphcolor_vertex = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, morphnormal_vertex = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, morphtarget_pars_vertex = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`, morphtarget_vertex = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, normal_fragment_begin = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`, normal_fragment_maps = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`, normal_pars_fragment = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, normal_pars_vertex = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, normal_vertex = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, normalmap_pars_fragment = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`, clearcoat_normal_fragment_begin = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, clearcoat_normal_fragment_maps = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, clearcoat_pars_fragment = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, iridescence_pars_fragment = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, opaque_fragment = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, packing = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`, premultiplied_alpha_fragment = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, project_vertex = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, dithering_fragment = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, dithering_pars_fragment = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, roughnessmap_fragment = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, roughnessmap_pars_fragment = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, shadowmap_pars_fragment = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`, shadowmap_pars_vertex = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`, shadowmap_vertex = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`, shadowmask_pars_fragment = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`, skinbase_vertex = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, skinning_pars_vertex = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`, skinning_vertex = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, skinnormal_vertex = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`, specularmap_fragment = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, specularmap_pars_fragment = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, tonemapping_fragment = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, tonemapping_pars_fragment = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`, transmission_fragment = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`, transmission_pars_fragment = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`, uv_pars_fragment = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, uv_pars_vertex = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, uv_vertex = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`, worldpos_vertex = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`, vertex$h = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, fragment$h = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, vertex$g = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, fragment$g = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, vertex$f = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, fragment$f = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, vertex$e = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`, fragment$e = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`, vertex$d = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`, fragment$d = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`, vertex$c = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, fragment$c = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, vertex$b = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, fragment$b = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, vertex$a = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`, fragment$a = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, vertex$9 = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, fragment$9 = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, vertex$8 = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`, fragment$8 = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, vertex$7 = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`, fragment$7 = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`, vertex$6 = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, fragment$6 = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, vertex$5 = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`, fragment$5 = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, vertex$4 = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, fragment$4 = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, vertex$3 = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`, fragment$3 = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, vertex$2 = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, fragment$2 = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, vertex$1 = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, fragment$1 = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, ShaderChunk = {
    alphahash_fragment,
    alphahash_pars_fragment,
    alphamap_fragment,
    alphamap_pars_fragment,
    alphatest_fragment,
    alphatest_pars_fragment,
    aomap_fragment,
    aomap_pars_fragment,
    batching_pars_vertex,
    batching_vertex,
    begin_vertex,
    beginnormal_vertex,
    bsdfs,
    iridescence_fragment,
    bumpmap_pars_fragment,
    clipping_planes_fragment,
    clipping_planes_pars_fragment,
    clipping_planes_pars_vertex,
    clipping_planes_vertex,
    color_fragment,
    color_pars_fragment,
    color_pars_vertex,
    color_vertex,
    common,
    cube_uv_reflection_fragment,
    defaultnormal_vertex,
    displacementmap_pars_vertex,
    displacementmap_vertex,
    emissivemap_fragment,
    emissivemap_pars_fragment,
    colorspace_fragment,
    colorspace_pars_fragment,
    envmap_fragment,
    envmap_common_pars_fragment,
    envmap_pars_fragment,
    envmap_pars_vertex,
    envmap_physical_pars_fragment,
    envmap_vertex,
    fog_vertex,
    fog_pars_vertex,
    fog_fragment,
    fog_pars_fragment,
    gradientmap_pars_fragment,
    lightmap_pars_fragment,
    lights_lambert_fragment,
    lights_lambert_pars_fragment,
    lights_pars_begin,
    lights_toon_fragment,
    lights_toon_pars_fragment,
    lights_phong_fragment,
    lights_phong_pars_fragment,
    lights_physical_fragment,
    lights_physical_pars_fragment,
    lights_fragment_begin,
    lights_fragment_maps,
    lights_fragment_end,
    logdepthbuf_fragment,
    logdepthbuf_pars_fragment,
    logdepthbuf_pars_vertex,
    logdepthbuf_vertex,
    map_fragment,
    map_pars_fragment,
    map_particle_fragment,
    map_particle_pars_fragment,
    metalnessmap_fragment,
    metalnessmap_pars_fragment,
    morphinstance_vertex,
    morphcolor_vertex,
    morphnormal_vertex,
    morphtarget_pars_vertex,
    morphtarget_vertex,
    normal_fragment_begin,
    normal_fragment_maps,
    normal_pars_fragment,
    normal_pars_vertex,
    normal_vertex,
    normalmap_pars_fragment,
    clearcoat_normal_fragment_begin,
    clearcoat_normal_fragment_maps,
    clearcoat_pars_fragment,
    iridescence_pars_fragment,
    opaque_fragment,
    packing,
    premultiplied_alpha_fragment,
    project_vertex,
    dithering_fragment,
    dithering_pars_fragment,
    roughnessmap_fragment,
    roughnessmap_pars_fragment,
    shadowmap_pars_fragment,
    shadowmap_pars_vertex,
    shadowmap_vertex,
    shadowmask_pars_fragment,
    skinbase_vertex,
    skinning_pars_vertex,
    skinning_vertex,
    skinnormal_vertex,
    specularmap_fragment,
    specularmap_pars_fragment,
    tonemapping_fragment,
    tonemapping_pars_fragment,
    transmission_fragment,
    transmission_pars_fragment,
    uv_pars_fragment,
    uv_pars_vertex,
    uv_vertex,
    worldpos_vertex,
    background_vert: vertex$h,
    background_frag: fragment$h,
    backgroundCube_vert: vertex$g,
    backgroundCube_frag: fragment$g,
    cube_vert: vertex$f,
    cube_frag: fragment$f,
    depth_vert: vertex$e,
    depth_frag: fragment$e,
    distanceRGBA_vert: vertex$d,
    distanceRGBA_frag: fragment$d,
    equirect_vert: vertex$c,
    equirect_frag: fragment$c,
    linedashed_vert: vertex$b,
    linedashed_frag: fragment$b,
    meshbasic_vert: vertex$a,
    meshbasic_frag: fragment$a,
    meshlambert_vert: vertex$9,
    meshlambert_frag: fragment$9,
    meshmatcap_vert: vertex$8,
    meshmatcap_frag: fragment$8,
    meshnormal_vert: vertex$7,
    meshnormal_frag: fragment$7,
    meshphong_vert: vertex$6,
    meshphong_frag: fragment$6,
    meshphysical_vert: vertex$5,
    meshphysical_frag: fragment$5,
    meshtoon_vert: vertex$4,
    meshtoon_frag: fragment$4,
    points_vert: vertex$3,
    points_frag: fragment$3,
    shadow_vert: vertex$2,
    shadow_frag: fragment$2,
    sprite_vert: vertex$1,
    sprite_frag: fragment$1
  }, UniformsLib = {
    common: {
      diffuse: { value: /* @__PURE__ */ new Color(16777215) },
      opacity: { value: 1 },
      map: { value: null },
      mapTransform: { value: /* @__PURE__ */ new Matrix3() },
      alphaMap: { value: null },
      alphaMapTransform: { value: /* @__PURE__ */ new Matrix3() },
      alphaTest: { value: 0 }
    },
    specularmap: {
      specularMap: { value: null },
      specularMapTransform: { value: /* @__PURE__ */ new Matrix3() }
    },
    envmap: {
      envMap: { value: null },
      envMapRotation: { value: /* @__PURE__ */ new Matrix3() },
      flipEnvMap: { value: -1 },
      reflectivity: { value: 1 },
      // basic, lambert, phong
      ior: { value: 1.5 },
      // physical
      refractionRatio: { value: 0.98 }
      // basic, lambert, phong
    },
    aomap: {
      aoMap: { value: null },
      aoMapIntensity: { value: 1 },
      aoMapTransform: { value: /* @__PURE__ */ new Matrix3() }
    },
    lightmap: {
      lightMap: { value: null },
      lightMapIntensity: { value: 1 },
      lightMapTransform: { value: /* @__PURE__ */ new Matrix3() }
    },
    bumpmap: {
      bumpMap: { value: null },
      bumpMapTransform: { value: /* @__PURE__ */ new Matrix3() },
      bumpScale: { value: 1 }
    },
    normalmap: {
      normalMap: { value: null },
      normalMapTransform: { value: /* @__PURE__ */ new Matrix3() },
      normalScale: { value: /* @__PURE__ */ new Vector2(1, 1) }
    },
    displacementmap: {
      displacementMap: { value: null },
      displacementMapTransform: { value: /* @__PURE__ */ new Matrix3() },
      displacementScale: { value: 1 },
      displacementBias: { value: 0 }
    },
    emissivemap: {
      emissiveMap: { value: null },
      emissiveMapTransform: { value: /* @__PURE__ */ new Matrix3() }
    },
    metalnessmap: {
      metalnessMap: { value: null },
      metalnessMapTransform: { value: /* @__PURE__ */ new Matrix3() }
    },
    roughnessmap: {
      roughnessMap: { value: null },
      roughnessMapTransform: { value: /* @__PURE__ */ new Matrix3() }
    },
    gradientmap: {
      gradientMap: { value: null }
    },
    fog: {
      fogDensity: { value: 25e-5 },
      fogNear: { value: 1 },
      fogFar: { value: 2e3 },
      fogColor: { value: /* @__PURE__ */ new Color(16777215) }
    },
    lights: {
      ambientLightColor: { value: [] },
      lightProbe: { value: [] },
      directionalLights: { value: [], properties: {
        direction: {},
        color: {}
      } },
      directionalLightShadows: { value: [], properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {}
      } },
      directionalShadowMap: { value: [] },
      directionalShadowMatrix: { value: [] },
      spotLights: { value: [], properties: {
        color: {},
        position: {},
        direction: {},
        distance: {},
        coneCos: {},
        penumbraCos: {},
        decay: {}
      } },
      spotLightShadows: { value: [], properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {}
      } },
      spotLightMap: { value: [] },
      spotShadowMap: { value: [] },
      spotLightMatrix: { value: [] },
      pointLights: { value: [], properties: {
        color: {},
        position: {},
        decay: {},
        distance: {}
      } },
      pointLightShadows: { value: [], properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {},
        shadowCameraNear: {},
        shadowCameraFar: {}
      } },
      pointShadowMap: { value: [] },
      pointShadowMatrix: { value: [] },
      hemisphereLights: { value: [], properties: {
        direction: {},
        skyColor: {},
        groundColor: {}
      } },
      // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
      rectAreaLights: { value: [], properties: {
        color: {},
        position: {},
        width: {},
        height: {}
      } },
      ltc_1: { value: null },
      ltc_2: { value: null }
    },
    points: {
      diffuse: { value: /* @__PURE__ */ new Color(16777215) },
      opacity: { value: 1 },
      size: { value: 1 },
      scale: { value: 1 },
      map: { value: null },
      alphaMap: { value: null },
      alphaMapTransform: { value: /* @__PURE__ */ new Matrix3() },
      alphaTest: { value: 0 },
      uvTransform: { value: /* @__PURE__ */ new Matrix3() }
    },
    sprite: {
      diffuse: { value: /* @__PURE__ */ new Color(16777215) },
      opacity: { value: 1 },
      center: { value: /* @__PURE__ */ new Vector2(0.5, 0.5) },
      rotation: { value: 0 },
      map: { value: null },
      mapTransform: { value: /* @__PURE__ */ new Matrix3() },
      alphaMap: { value: null },
      alphaMapTransform: { value: /* @__PURE__ */ new Matrix3() },
      alphaTest: { value: 0 }
    }
  }, ShaderLib = {
    basic: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.specularmap,
        UniformsLib.envmap,
        UniformsLib.aomap,
        UniformsLib.lightmap,
        UniformsLib.fog
      ]),
      vertexShader: ShaderChunk.meshbasic_vert,
      fragmentShader: ShaderChunk.meshbasic_frag
    },
    lambert: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.specularmap,
        UniformsLib.envmap,
        UniformsLib.aomap,
        UniformsLib.lightmap,
        UniformsLib.emissivemap,
        UniformsLib.bumpmap,
        UniformsLib.normalmap,
        UniformsLib.displacementmap,
        UniformsLib.fog,
        UniformsLib.lights,
        {
          emissive: { value: /* @__PURE__ */ new Color(0) }
        }
      ]),
      vertexShader: ShaderChunk.meshlambert_vert,
      fragmentShader: ShaderChunk.meshlambert_frag
    },
    phong: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.specularmap,
        UniformsLib.envmap,
        UniformsLib.aomap,
        UniformsLib.lightmap,
        UniformsLib.emissivemap,
        UniformsLib.bumpmap,
        UniformsLib.normalmap,
        UniformsLib.displacementmap,
        UniformsLib.fog,
        UniformsLib.lights,
        {
          emissive: { value: /* @__PURE__ */ new Color(0) },
          specular: { value: /* @__PURE__ */ new Color(1118481) },
          shininess: { value: 30 }
        }
      ]),
      vertexShader: ShaderChunk.meshphong_vert,
      fragmentShader: ShaderChunk.meshphong_frag
    },
    standard: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.envmap,
        UniformsLib.aomap,
        UniformsLib.lightmap,
        UniformsLib.emissivemap,
        UniformsLib.bumpmap,
        UniformsLib.normalmap,
        UniformsLib.displacementmap,
        UniformsLib.roughnessmap,
        UniformsLib.metalnessmap,
        UniformsLib.fog,
        UniformsLib.lights,
        {
          emissive: { value: /* @__PURE__ */ new Color(0) },
          roughness: { value: 1 },
          metalness: { value: 0 },
          envMapIntensity: { value: 1 }
        }
      ]),
      vertexShader: ShaderChunk.meshphysical_vert,
      fragmentShader: ShaderChunk.meshphysical_frag
    },
    toon: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.aomap,
        UniformsLib.lightmap,
        UniformsLib.emissivemap,
        UniformsLib.bumpmap,
        UniformsLib.normalmap,
        UniformsLib.displacementmap,
        UniformsLib.gradientmap,
        UniformsLib.fog,
        UniformsLib.lights,
        {
          emissive: { value: /* @__PURE__ */ new Color(0) }
        }
      ]),
      vertexShader: ShaderChunk.meshtoon_vert,
      fragmentShader: ShaderChunk.meshtoon_frag
    },
    matcap: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.bumpmap,
        UniformsLib.normalmap,
        UniformsLib.displacementmap,
        UniformsLib.fog,
        {
          matcap: { value: null }
        }
      ]),
      vertexShader: ShaderChunk.meshmatcap_vert,
      fragmentShader: ShaderChunk.meshmatcap_frag
    },
    points: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.points,
        UniformsLib.fog
      ]),
      vertexShader: ShaderChunk.points_vert,
      fragmentShader: ShaderChunk.points_frag
    },
    dashed: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.fog,
        {
          scale: { value: 1 },
          dashSize: { value: 1 },
          totalSize: { value: 2 }
        }
      ]),
      vertexShader: ShaderChunk.linedashed_vert,
      fragmentShader: ShaderChunk.linedashed_frag
    },
    depth: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.displacementmap
      ]),
      vertexShader: ShaderChunk.depth_vert,
      fragmentShader: ShaderChunk.depth_frag
    },
    normal: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.bumpmap,
        UniformsLib.normalmap,
        UniformsLib.displacementmap,
        {
          opacity: { value: 1 }
        }
      ]),
      vertexShader: ShaderChunk.meshnormal_vert,
      fragmentShader: ShaderChunk.meshnormal_frag
    },
    sprite: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.sprite,
        UniformsLib.fog
      ]),
      vertexShader: ShaderChunk.sprite_vert,
      fragmentShader: ShaderChunk.sprite_frag
    },
    background: {
      uniforms: {
        uvTransform: { value: /* @__PURE__ */ new Matrix3() },
        t2D: { value: null },
        backgroundIntensity: { value: 1 }
      },
      vertexShader: ShaderChunk.background_vert,
      fragmentShader: ShaderChunk.background_frag
    },
    backgroundCube: {
      uniforms: {
        envMap: { value: null },
        flipEnvMap: { value: -1 },
        backgroundBlurriness: { value: 0 },
        backgroundIntensity: { value: 1 },
        backgroundRotation: { value: /* @__PURE__ */ new Matrix3() }
      },
      vertexShader: ShaderChunk.backgroundCube_vert,
      fragmentShader: ShaderChunk.backgroundCube_frag
    },
    cube: {
      uniforms: {
        tCube: { value: null },
        tFlip: { value: -1 },
        opacity: { value: 1 }
      },
      vertexShader: ShaderChunk.cube_vert,
      fragmentShader: ShaderChunk.cube_frag
    },
    equirect: {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: ShaderChunk.equirect_vert,
      fragmentShader: ShaderChunk.equirect_frag
    },
    distanceRGBA: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.common,
        UniformsLib.displacementmap,
        {
          referencePosition: { value: /* @__PURE__ */ new Vector3() },
          nearDistance: { value: 1 },
          farDistance: { value: 1e3 }
        }
      ]),
      vertexShader: ShaderChunk.distanceRGBA_vert,
      fragmentShader: ShaderChunk.distanceRGBA_frag
    },
    shadow: {
      uniforms: /* @__PURE__ */ mergeUniforms([
        UniformsLib.lights,
        UniformsLib.fog,
        {
          color: { value: /* @__PURE__ */ new Color(0) },
          opacity: { value: 1 }
        }
      ]),
      vertexShader: ShaderChunk.shadow_vert,
      fragmentShader: ShaderChunk.shadow_frag
    }
  };
  ShaderLib.physical = {
    uniforms: /* @__PURE__ */ mergeUniforms([
      ShaderLib.standard.uniforms,
      {
        clearcoat: { value: 0 },
        clearcoatMap: { value: null },
        clearcoatMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        clearcoatNormalMap: { value: null },
        clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        clearcoatNormalScale: { value: /* @__PURE__ */ new Vector2(1, 1) },
        clearcoatRoughness: { value: 0 },
        clearcoatRoughnessMap: { value: null },
        clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        dispersion: { value: 0 },
        iridescence: { value: 0 },
        iridescenceMap: { value: null },
        iridescenceMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        iridescenceIOR: { value: 1.3 },
        iridescenceThicknessMinimum: { value: 100 },
        iridescenceThicknessMaximum: { value: 400 },
        iridescenceThicknessMap: { value: null },
        iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        sheen: { value: 0 },
        sheenColor: { value: /* @__PURE__ */ new Color(0) },
        sheenColorMap: { value: null },
        sheenColorMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        sheenRoughness: { value: 1 },
        sheenRoughnessMap: { value: null },
        sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        transmission: { value: 0 },
        transmissionMap: { value: null },
        transmissionMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        transmissionSamplerSize: { value: /* @__PURE__ */ new Vector2() },
        transmissionSamplerMap: { value: null },
        thickness: { value: 0 },
        thicknessMap: { value: null },
        thicknessMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        attenuationDistance: { value: 0 },
        attenuationColor: { value: /* @__PURE__ */ new Color(0) },
        specularColor: { value: /* @__PURE__ */ new Color(1, 1, 1) },
        specularColorMap: { value: null },
        specularColorMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        specularIntensity: { value: 1 },
        specularIntensityMap: { value: null },
        specularIntensityMapTransform: { value: /* @__PURE__ */ new Matrix3() },
        anisotropyVector: { value: /* @__PURE__ */ new Vector2() },
        anisotropyMap: { value: null },
        anisotropyMapTransform: { value: /* @__PURE__ */ new Matrix3() }
      }
    ]),
    vertexShader: ShaderChunk.meshphysical_vert,
    fragmentShader: ShaderChunk.meshphysical_frag
  };
  var _rgb = { r: 0, b: 0, g: 0 }, _e1$1 = /* @__PURE__ */ new Euler(), _m1$1 = /* @__PURE__ */ new Matrix4();
  function WebGLBackground(renderer, cubemaps, cubeuvmaps, state, objects, alpha, premultipliedAlpha) {
    let clearColor = new Color(0), clearAlpha = alpha === !0 ? 0 : 1, planeMesh, boxMesh, currentBackground = null, currentBackgroundVersion = 0, currentTonemapping = null;
    function getBackground(scene) {
      let background = scene.isScene === !0 ? scene.background : null;
      return background && background.isTexture && (background = (scene.backgroundBlurriness > 0 ? cubeuvmaps : cubemaps).get(background)), background;
    }
    function render(scene) {
      let forceClear = !1, background = getBackground(scene);
      background === null ? setClear(clearColor, clearAlpha) : background && background.isColor && (setClear(background, 1), forceClear = !0);
      let environmentBlendMode = renderer.xr.getEnvironmentBlendMode();
      environmentBlendMode === "additive" ? state.buffers.color.setClear(0, 0, 0, 1, premultipliedAlpha) : environmentBlendMode === "alpha-blend" && state.buffers.color.setClear(0, 0, 0, 0, premultipliedAlpha), (renderer.autoClear || forceClear) && (state.buffers.depth.setTest(!0), state.buffers.depth.setMask(!0), state.buffers.color.setMask(!0), renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil));
    }
    function addToRenderList(renderList, scene) {
      let background = getBackground(scene);
      background && (background.isCubeTexture || background.mapping === CubeUVReflectionMapping) ? (boxMesh === void 0 && (boxMesh = new Mesh(
        new BoxGeometry(1, 1, 1),
        new ShaderMaterial({
          name: "BackgroundCubeMaterial",
          uniforms: cloneUniforms(ShaderLib.backgroundCube.uniforms),
          vertexShader: ShaderLib.backgroundCube.vertexShader,
          fragmentShader: ShaderLib.backgroundCube.fragmentShader,
          side: BackSide,
          depthTest: !1,
          depthWrite: !1,
          fog: !1
        })
      ), boxMesh.geometry.deleteAttribute("normal"), boxMesh.geometry.deleteAttribute("uv"), boxMesh.onBeforeRender = function(renderer2, scene2, camera) {
        this.matrixWorld.copyPosition(camera.matrixWorld);
      }, Object.defineProperty(boxMesh.material, "envMap", {
        get: function() {
          return this.uniforms.envMap.value;
        }
      }), objects.update(boxMesh)), _e1$1.copy(scene.backgroundRotation), _e1$1.x *= -1, _e1$1.y *= -1, _e1$1.z *= -1, background.isCubeTexture && background.isRenderTargetTexture === !1 && (_e1$1.y *= -1, _e1$1.z *= -1), boxMesh.material.uniforms.envMap.value = background, boxMesh.material.uniforms.flipEnvMap.value = background.isCubeTexture && background.isRenderTargetTexture === !1 ? -1 : 1, boxMesh.material.uniforms.backgroundBlurriness.value = scene.backgroundBlurriness, boxMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity, boxMesh.material.uniforms.backgroundRotation.value.setFromMatrix4(_m1$1.makeRotationFromEuler(_e1$1)), boxMesh.material.toneMapped = ColorManagement.getTransfer(background.colorSpace) !== SRGBTransfer, (currentBackground !== background || currentBackgroundVersion !== background.version || currentTonemapping !== renderer.toneMapping) && (boxMesh.material.needsUpdate = !0, currentBackground = background, currentBackgroundVersion = background.version, currentTonemapping = renderer.toneMapping), boxMesh.layers.enableAll(), renderList.unshift(boxMesh, boxMesh.geometry, boxMesh.material, 0, 0, null)) : background && background.isTexture && (planeMesh === void 0 && (planeMesh = new Mesh(
        new PlaneGeometry(2, 2),
        new ShaderMaterial({
          name: "BackgroundMaterial",
          uniforms: cloneUniforms(ShaderLib.background.uniforms),
          vertexShader: ShaderLib.background.vertexShader,
          fragmentShader: ShaderLib.background.fragmentShader,
          side: FrontSide,
          depthTest: !1,
          depthWrite: !1,
          fog: !1
        })
      ), planeMesh.geometry.deleteAttribute("normal"), Object.defineProperty(planeMesh.material, "map", {
        get: function() {
          return this.uniforms.t2D.value;
        }
      }), objects.update(planeMesh)), planeMesh.material.uniforms.t2D.value = background, planeMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity, planeMesh.material.toneMapped = ColorManagement.getTransfer(background.colorSpace) !== SRGBTransfer, background.matrixAutoUpdate === !0 && background.updateMatrix(), planeMesh.material.uniforms.uvTransform.value.copy(background.matrix), (currentBackground !== background || currentBackgroundVersion !== background.version || currentTonemapping !== renderer.toneMapping) && (planeMesh.material.needsUpdate = !0, currentBackground = background, currentBackgroundVersion = background.version, currentTonemapping = renderer.toneMapping), planeMesh.layers.enableAll(), renderList.unshift(planeMesh, planeMesh.geometry, planeMesh.material, 0, 0, null));
    }
    function setClear(color, alpha2) {
      color.getRGB(_rgb, getUnlitUniformColorSpace(renderer)), state.buffers.color.setClear(_rgb.r, _rgb.g, _rgb.b, alpha2, premultipliedAlpha);
    }
    return {
      getClearColor: function() {
        return clearColor;
      },
      setClearColor: function(color, alpha2 = 1) {
        clearColor.set(color), clearAlpha = alpha2, setClear(clearColor, clearAlpha);
      },
      getClearAlpha: function() {
        return clearAlpha;
      },
      setClearAlpha: function(alpha2) {
        clearAlpha = alpha2, setClear(clearColor, clearAlpha);
      },
      render,
      addToRenderList
    };
  }
  function WebGLBindingStates(gl, attributes) {
    let maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS), bindingStates = {}, defaultState = createBindingState(null), currentState = defaultState, forceUpdate = !1;
    function setup(object, material, program, geometry, index) {
      let updateBuffers = !1, state = getBindingState(geometry, program, material);
      currentState !== state && (currentState = state, bindVertexArrayObject(currentState.object)), updateBuffers = needsUpdate(object, geometry, program, index), updateBuffers && saveCache(object, geometry, program, index), index !== null && attributes.update(index, gl.ELEMENT_ARRAY_BUFFER), (updateBuffers || forceUpdate) && (forceUpdate = !1, setupVertexAttributes(object, material, program, geometry), index !== null && gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.get(index).buffer));
    }
    function createVertexArrayObject() {
      return gl.createVertexArray();
    }
    function bindVertexArrayObject(vao) {
      return gl.bindVertexArray(vao);
    }
    function deleteVertexArrayObject(vao) {
      return gl.deleteVertexArray(vao);
    }
    function getBindingState(geometry, program, material) {
      let wireframe = material.wireframe === !0, programMap = bindingStates[geometry.id];
      programMap === void 0 && (programMap = {}, bindingStates[geometry.id] = programMap);
      let stateMap = programMap[program.id];
      stateMap === void 0 && (stateMap = {}, programMap[program.id] = stateMap);
      let state = stateMap[wireframe];
      return state === void 0 && (state = createBindingState(createVertexArrayObject()), stateMap[wireframe] = state), state;
    }
    function createBindingState(vao) {
      let newAttributes = [], enabledAttributes = [], attributeDivisors = [];
      for (let i = 0; i < maxVertexAttributes; i++)
        newAttributes[i] = 0, enabledAttributes[i] = 0, attributeDivisors[i] = 0;
      return {
        // for backward compatibility on non-VAO support browser
        geometry: null,
        program: null,
        wireframe: !1,
        newAttributes,
        enabledAttributes,
        attributeDivisors,
        object: vao,
        attributes: {},
        index: null
      };
    }
    function needsUpdate(object, geometry, program, index) {
      let cachedAttributes = currentState.attributes, geometryAttributes = geometry.attributes, attributesNum = 0, programAttributes = program.getAttributes();
      for (let name in programAttributes)
        if (programAttributes[name].location >= 0) {
          let cachedAttribute = cachedAttributes[name], geometryAttribute = geometryAttributes[name];
          if (geometryAttribute === void 0 && (name === "instanceMatrix" && object.instanceMatrix && (geometryAttribute = object.instanceMatrix), name === "instanceColor" && object.instanceColor && (geometryAttribute = object.instanceColor)), cachedAttribute === void 0 || cachedAttribute.attribute !== geometryAttribute || geometryAttribute && cachedAttribute.data !== geometryAttribute.data) return !0;
          attributesNum++;
        }
      return currentState.attributesNum !== attributesNum || currentState.index !== index;
    }
    function saveCache(object, geometry, program, index) {
      let cache = {}, attributes2 = geometry.attributes, attributesNum = 0, programAttributes = program.getAttributes();
      for (let name in programAttributes)
        if (programAttributes[name].location >= 0) {
          let attribute = attributes2[name];
          attribute === void 0 && (name === "instanceMatrix" && object.instanceMatrix && (attribute = object.instanceMatrix), name === "instanceColor" && object.instanceColor && (attribute = object.instanceColor));
          let data = {};
          data.attribute = attribute, attribute && attribute.data && (data.data = attribute.data), cache[name] = data, attributesNum++;
        }
      currentState.attributes = cache, currentState.attributesNum = attributesNum, currentState.index = index;
    }
    function initAttributes() {
      let newAttributes = currentState.newAttributes;
      for (let i = 0, il = newAttributes.length; i < il; i++)
        newAttributes[i] = 0;
    }
    function enableAttribute(attribute) {
      enableAttributeAndDivisor(attribute, 0);
    }
    function enableAttributeAndDivisor(attribute, meshPerAttribute) {
      let newAttributes = currentState.newAttributes, enabledAttributes = currentState.enabledAttributes, attributeDivisors = currentState.attributeDivisors;
      newAttributes[attribute] = 1, enabledAttributes[attribute] === 0 && (gl.enableVertexAttribArray(attribute), enabledAttributes[attribute] = 1), attributeDivisors[attribute] !== meshPerAttribute && (gl.vertexAttribDivisor(attribute, meshPerAttribute), attributeDivisors[attribute] = meshPerAttribute);
    }
    function disableUnusedAttributes() {
      let newAttributes = currentState.newAttributes, enabledAttributes = currentState.enabledAttributes;
      for (let i = 0, il = enabledAttributes.length; i < il; i++)
        enabledAttributes[i] !== newAttributes[i] && (gl.disableVertexAttribArray(i), enabledAttributes[i] = 0);
    }
    function vertexAttribPointer(index, size, type, normalized, stride, offset, integer) {
      integer === !0 ? gl.vertexAttribIPointer(index, size, type, stride, offset) : gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    }
    function setupVertexAttributes(object, material, program, geometry) {
      initAttributes();
      let geometryAttributes = geometry.attributes, programAttributes = program.getAttributes(), materialDefaultAttributeValues = material.defaultAttributeValues;
      for (let name in programAttributes) {
        let programAttribute = programAttributes[name];
        if (programAttribute.location >= 0) {
          let geometryAttribute = geometryAttributes[name];
          if (geometryAttribute === void 0 && (name === "instanceMatrix" && object.instanceMatrix && (geometryAttribute = object.instanceMatrix), name === "instanceColor" && object.instanceColor && (geometryAttribute = object.instanceColor)), geometryAttribute !== void 0) {
            let normalized = geometryAttribute.normalized, size = geometryAttribute.itemSize, attribute = attributes.get(geometryAttribute);
            if (attribute === void 0) continue;
            let buffer = attribute.buffer, type = attribute.type, bytesPerElement = attribute.bytesPerElement, integer = type === gl.INT || type === gl.UNSIGNED_INT || geometryAttribute.gpuType === IntType;
            if (geometryAttribute.isInterleavedBufferAttribute) {
              let data = geometryAttribute.data, stride = data.stride, offset = geometryAttribute.offset;
              if (data.isInstancedInterleavedBuffer) {
                for (let i = 0; i < programAttribute.locationSize; i++)
                  enableAttributeAndDivisor(programAttribute.location + i, data.meshPerAttribute);
                object.isInstancedMesh !== !0 && geometry._maxInstanceCount === void 0 && (geometry._maxInstanceCount = data.meshPerAttribute * data.count);
              } else
                for (let i = 0; i < programAttribute.locationSize; i++)
                  enableAttribute(programAttribute.location + i);
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              for (let i = 0; i < programAttribute.locationSize; i++)
                vertexAttribPointer(
                  programAttribute.location + i,
                  size / programAttribute.locationSize,
                  type,
                  normalized,
                  stride * bytesPerElement,
                  (offset + size / programAttribute.locationSize * i) * bytesPerElement,
                  integer
                );
            } else {
              if (geometryAttribute.isInstancedBufferAttribute) {
                for (let i = 0; i < programAttribute.locationSize; i++)
                  enableAttributeAndDivisor(programAttribute.location + i, geometryAttribute.meshPerAttribute);
                object.isInstancedMesh !== !0 && geometry._maxInstanceCount === void 0 && (geometry._maxInstanceCount = geometryAttribute.meshPerAttribute * geometryAttribute.count);
              } else
                for (let i = 0; i < programAttribute.locationSize; i++)
                  enableAttribute(programAttribute.location + i);
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              for (let i = 0; i < programAttribute.locationSize; i++)
                vertexAttribPointer(
                  programAttribute.location + i,
                  size / programAttribute.locationSize,
                  type,
                  normalized,
                  size * bytesPerElement,
                  size / programAttribute.locationSize * i * bytesPerElement,
                  integer
                );
            }
          } else if (materialDefaultAttributeValues !== void 0) {
            let value = materialDefaultAttributeValues[name];
            if (value !== void 0)
              switch (value.length) {
                case 2:
                  gl.vertexAttrib2fv(programAttribute.location, value);
                  break;
                case 3:
                  gl.vertexAttrib3fv(programAttribute.location, value);
                  break;
                case 4:
                  gl.vertexAttrib4fv(programAttribute.location, value);
                  break;
                default:
                  gl.vertexAttrib1fv(programAttribute.location, value);
              }
          }
        }
      }
      disableUnusedAttributes();
    }
    function dispose() {
      reset();
      for (let geometryId in bindingStates) {
        let programMap = bindingStates[geometryId];
        for (let programId in programMap) {
          let stateMap = programMap[programId];
          for (let wireframe in stateMap)
            deleteVertexArrayObject(stateMap[wireframe].object), delete stateMap[wireframe];
          delete programMap[programId];
        }
        delete bindingStates[geometryId];
      }
    }
    function releaseStatesOfGeometry(geometry) {
      if (bindingStates[geometry.id] === void 0) return;
      let programMap = bindingStates[geometry.id];
      for (let programId in programMap) {
        let stateMap = programMap[programId];
        for (let wireframe in stateMap)
          deleteVertexArrayObject(stateMap[wireframe].object), delete stateMap[wireframe];
        delete programMap[programId];
      }
      delete bindingStates[geometry.id];
    }
    function releaseStatesOfProgram(program) {
      for (let geometryId in bindingStates) {
        let programMap = bindingStates[geometryId];
        if (programMap[program.id] === void 0) continue;
        let stateMap = programMap[program.id];
        for (let wireframe in stateMap)
          deleteVertexArrayObject(stateMap[wireframe].object), delete stateMap[wireframe];
        delete programMap[program.id];
      }
    }
    function reset() {
      resetDefaultState(), forceUpdate = !0, currentState !== defaultState && (currentState = defaultState, bindVertexArrayObject(currentState.object));
    }
    function resetDefaultState() {
      defaultState.geometry = null, defaultState.program = null, defaultState.wireframe = !1;
    }
    return {
      setup,
      reset,
      resetDefaultState,
      dispose,
      releaseStatesOfGeometry,
      releaseStatesOfProgram,
      initAttributes,
      enableAttribute,
      disableUnusedAttributes
    };
  }
  function WebGLBufferRenderer(gl, extensions, info) {
    let mode;
    function setMode(value) {
      mode = value;
    }
    function render(start, count) {
      gl.drawArrays(mode, start, count), info.update(count, mode, 1);
    }
    function renderInstances(start, count, primcount) {
      primcount !== 0 && (gl.drawArraysInstanced(mode, start, count, primcount), info.update(count, mode, primcount));
    }
    function renderMultiDraw(starts, counts, drawCount) {
      if (drawCount === 0) return;
      extensions.get("WEBGL_multi_draw").multiDrawArraysWEBGL(mode, starts, 0, counts, 0, drawCount);
      let elementCount = 0;
      for (let i = 0; i < drawCount; i++)
        elementCount += counts[i];
      info.update(elementCount, mode, 1);
    }
    function renderMultiDrawInstances(starts, counts, drawCount, primcount) {
      if (drawCount === 0) return;
      let extension = extensions.get("WEBGL_multi_draw");
      if (extension === null)
        for (let i = 0; i < starts.length; i++)
          renderInstances(starts[i], counts[i], primcount[i]);
      else {
        extension.multiDrawArraysInstancedWEBGL(mode, starts, 0, counts, 0, primcount, 0, drawCount);
        let elementCount = 0;
        for (let i = 0; i < drawCount; i++)
          elementCount += counts[i];
        for (let i = 0; i < primcount.length; i++)
          info.update(elementCount, mode, primcount[i]);
      }
    }
    this.setMode = setMode, this.render = render, this.renderInstances = renderInstances, this.renderMultiDraw = renderMultiDraw, this.renderMultiDrawInstances = renderMultiDrawInstances;
  }
  function WebGLCapabilities(gl, extensions, parameters, utils) {
    let maxAnisotropy;
    function getMaxAnisotropy() {
      if (maxAnisotropy !== void 0) return maxAnisotropy;
      if (extensions.has("EXT_texture_filter_anisotropic") === !0) {
        let extension = extensions.get("EXT_texture_filter_anisotropic");
        maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      } else
        maxAnisotropy = 0;
      return maxAnisotropy;
    }
    function textureFormatReadable(textureFormat) {
      return !(textureFormat !== RGBAFormat && utils.convert(textureFormat) !== gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT));
    }
    function textureTypeReadable(textureType) {
      let halfFloatSupportedByExt = textureType === HalfFloatType && (extensions.has("EXT_color_buffer_half_float") || extensions.has("EXT_color_buffer_float"));
      return !(textureType !== UnsignedByteType && utils.convert(textureType) !== gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
      textureType !== FloatType && !halfFloatSupportedByExt);
    }
    function getMaxPrecision(precision2) {
      if (precision2 === "highp") {
        if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0)
          return "highp";
        precision2 = "mediump";
      }
      return precision2 === "mediump" && gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
    }
    let precision = parameters.precision !== void 0 ? parameters.precision : "highp", maxPrecision = getMaxPrecision(precision);
    maxPrecision !== precision && (console.warn("THREE.WebGLRenderer:", precision, "not supported, using", maxPrecision, "instead."), precision = maxPrecision);
    let logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === !0, maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS), maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE), maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE), maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS), maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS), maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS), maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS), vertexTextures = maxVertexTextures > 0, maxSamples = gl.getParameter(gl.MAX_SAMPLES);
    return {
      isWebGL2: !0,
      // keeping this for backwards compatibility
      getMaxAnisotropy,
      getMaxPrecision,
      textureFormatReadable,
      textureTypeReadable,
      precision,
      logarithmicDepthBuffer,
      maxTextures,
      maxVertexTextures,
      maxTextureSize,
      maxCubemapSize,
      maxAttributes,
      maxVertexUniforms,
      maxVaryings,
      maxFragmentUniforms,
      vertexTextures,
      maxSamples
    };
  }
  function WebGLClipping(properties) {
    let scope = this, globalState = null, numGlobalPlanes = 0, localClippingEnabled = !1, renderingShadows = !1, plane = new Plane(), viewNormalMatrix = new Matrix3(), uniform = { value: null, needsUpdate: !1 };
    this.uniform = uniform, this.numPlanes = 0, this.numIntersection = 0, this.init = function(planes, enableLocalClipping) {
      let enabled = planes.length !== 0 || enableLocalClipping || // enable state of previous frame - the clipping code has to
      // run another frame in order to reset the state:
      numGlobalPlanes !== 0 || localClippingEnabled;
      return localClippingEnabled = enableLocalClipping, numGlobalPlanes = planes.length, enabled;
    }, this.beginShadows = function() {
      renderingShadows = !0, projectPlanes(null);
    }, this.endShadows = function() {
      renderingShadows = !1;
    }, this.setGlobalState = function(planes, camera) {
      globalState = projectPlanes(planes, camera, 0);
    }, this.setState = function(material, camera, useCache) {
      let planes = material.clippingPlanes, clipIntersection = material.clipIntersection, clipShadows = material.clipShadows, materialProperties = properties.get(material);
      if (!localClippingEnabled || planes === null || planes.length === 0 || renderingShadows && !clipShadows)
        renderingShadows ? projectPlanes(null) : resetGlobalState();
      else {
        let nGlobal = renderingShadows ? 0 : numGlobalPlanes, lGlobal = nGlobal * 4, dstArray = materialProperties.clippingState || null;
        uniform.value = dstArray, dstArray = projectPlanes(planes, camera, lGlobal, useCache);
        for (let i = 0; i !== lGlobal; ++i)
          dstArray[i] = globalState[i];
        materialProperties.clippingState = dstArray, this.numIntersection = clipIntersection ? this.numPlanes : 0, this.numPlanes += nGlobal;
      }
    };
    function resetGlobalState() {
      uniform.value !== globalState && (uniform.value = globalState, uniform.needsUpdate = numGlobalPlanes > 0), scope.numPlanes = numGlobalPlanes, scope.numIntersection = 0;
    }
    function projectPlanes(planes, camera, dstOffset, skipTransform) {
      let nPlanes = planes !== null ? planes.length : 0, dstArray = null;
      if (nPlanes !== 0) {
        if (dstArray = uniform.value, skipTransform !== !0 || dstArray === null) {
          let flatSize = dstOffset + nPlanes * 4, viewMatrix = camera.matrixWorldInverse;
          viewNormalMatrix.getNormalMatrix(viewMatrix), (dstArray === null || dstArray.length < flatSize) && (dstArray = new Float32Array(flatSize));
          for (let i = 0, i4 = dstOffset; i !== nPlanes; ++i, i4 += 4)
            plane.copy(planes[i]).applyMatrix4(viewMatrix, viewNormalMatrix), plane.normal.toArray(dstArray, i4), dstArray[i4 + 3] = plane.constant;
        }
        uniform.value = dstArray, uniform.needsUpdate = !0;
      }
      return scope.numPlanes = nPlanes, scope.numIntersection = 0, dstArray;
    }
  }
  function WebGLCubeMaps(renderer) {
    let cubemaps = /* @__PURE__ */ new WeakMap();
    function mapTextureMapping(texture, mapping) {
      return mapping === EquirectangularReflectionMapping ? texture.mapping = CubeReflectionMapping : mapping === EquirectangularRefractionMapping && (texture.mapping = CubeRefractionMapping), texture;
    }
    function get(texture) {
      if (texture && texture.isTexture) {
        let mapping = texture.mapping;
        if (mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping)
          if (cubemaps.has(texture)) {
            let cubemap = cubemaps.get(texture).texture;
            return mapTextureMapping(cubemap, texture.mapping);
          } else {
            let image = texture.image;
            if (image && image.height > 0) {
              let renderTarget = new WebGLCubeRenderTarget(image.height);
              return renderTarget.fromEquirectangularTexture(renderer, texture), cubemaps.set(texture, renderTarget), texture.addEventListener("dispose", onTextureDispose), mapTextureMapping(renderTarget.texture, texture.mapping);
            } else
              return null;
          }
      }
      return texture;
    }
    function onTextureDispose(event) {
      let texture = event.target;
      texture.removeEventListener("dispose", onTextureDispose);
      let cubemap = cubemaps.get(texture);
      cubemap !== void 0 && (cubemaps.delete(texture), cubemap.dispose());
    }
    function dispose() {
      cubemaps = /* @__PURE__ */ new WeakMap();
    }
    return {
      get,
      dispose
    };
  }
  var OrthographicCamera = class extends Camera {
    constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 2e3) {
      super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = left, this.right = right, this.top = top, this.bottom = bottom, this.near = near, this.far = far, this.updateProjectionMatrix();
    }
    copy(source, recursive) {
      return super.copy(source, recursive), this.left = source.left, this.right = source.right, this.top = source.top, this.bottom = source.bottom, this.near = source.near, this.far = source.far, this.zoom = source.zoom, this.view = source.view === null ? null : Object.assign({}, source.view), this;
    }
    setViewOffset(fullWidth, fullHeight, x, y, width, height) {
      this.view === null && (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      }), this.view.enabled = !0, this.view.fullWidth = fullWidth, this.view.fullHeight = fullHeight, this.view.offsetX = x, this.view.offsetY = y, this.view.width = width, this.view.height = height, this.updateProjectionMatrix();
    }
    clearViewOffset() {
      this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      let dx = (this.right - this.left) / (2 * this.zoom), dy = (this.top - this.bottom) / (2 * this.zoom), cx = (this.right + this.left) / 2, cy = (this.top + this.bottom) / 2, left = cx - dx, right = cx + dx, top = cy + dy, bottom = cy - dy;
      if (this.view !== null && this.view.enabled) {
        let scaleW = (this.right - this.left) / this.view.fullWidth / this.zoom, scaleH = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
        left += scaleW * this.view.offsetX, right = left + scaleW * this.view.width, top -= scaleH * this.view.offsetY, bottom = top - scaleH * this.view.height;
      }
      this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(meta) {
      let data = super.toJSON(meta);
      return data.object.zoom = this.zoom, data.object.left = this.left, data.object.right = this.right, data.object.top = this.top, data.object.bottom = this.bottom, data.object.near = this.near, data.object.far = this.far, this.view !== null && (data.object.view = Object.assign({}, this.view)), data;
    }
  }, LOD_MIN = 4, EXTRA_LOD_SIGMA = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], MAX_SAMPLES = 20, _flatCamera = /* @__PURE__ */ new OrthographicCamera(), _clearColor = /* @__PURE__ */ new Color(), _oldTarget = null, _oldActiveCubeFace = 0, _oldActiveMipmapLevel = 0, _oldXrEnabled = !1, PHI = (1 + Math.sqrt(5)) / 2, INV_PHI = 1 / PHI, _axisDirections = [
    /* @__PURE__ */ new Vector3(-PHI, INV_PHI, 0),
    /* @__PURE__ */ new Vector3(PHI, INV_PHI, 0),
    /* @__PURE__ */ new Vector3(-INV_PHI, 0, PHI),
    /* @__PURE__ */ new Vector3(INV_PHI, 0, PHI),
    /* @__PURE__ */ new Vector3(0, PHI, -INV_PHI),
    /* @__PURE__ */ new Vector3(0, PHI, INV_PHI),
    /* @__PURE__ */ new Vector3(-1, 1, -1),
    /* @__PURE__ */ new Vector3(1, 1, -1),
    /* @__PURE__ */ new Vector3(-1, 1, 1),
    /* @__PURE__ */ new Vector3(1, 1, 1)
  ], PMREMGenerator = class {
    constructor(renderer) {
      this._renderer = renderer, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
    }
    /**
     * Generates a PMREM from a supplied Scene, which can be faster than using an
     * image if networking bandwidth is low. Optional sigma specifies a blur radius
     * in radians to be applied to the scene before PMREM generation. Optional near
     * and far planes ensure the scene is rendered in its entirety (the cubeCamera
     * is placed at the origin).
     */
    fromScene(scene, sigma = 0, near = 0.1, far = 100) {
      _oldTarget = this._renderer.getRenderTarget(), _oldActiveCubeFace = this._renderer.getActiveCubeFace(), _oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel(), _oldXrEnabled = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
      let cubeUVRenderTarget = this._allocateTargets();
      return cubeUVRenderTarget.depthBuffer = !0, this._sceneToCubeUV(scene, near, far, cubeUVRenderTarget), sigma > 0 && this._blur(cubeUVRenderTarget, 0, 0, sigma), this._applyPMREM(cubeUVRenderTarget), this._cleanup(cubeUVRenderTarget), cubeUVRenderTarget;
    }
    /**
     * Generates a PMREM from an equirectangular texture, which can be either LDR
     * or HDR. The ideal input image size is 1k (1024 x 512),
     * as this matches best with the 256 x 256 cubemap output.
     * The smallest supported equirectangular image size is 64 x 32.
     */
    fromEquirectangular(equirectangular, renderTarget = null) {
      return this._fromTexture(equirectangular, renderTarget);
    }
    /**
     * Generates a PMREM from an cubemap texture, which can be either LDR
     * or HDR. The ideal input cube size is 256 x 256,
     * as this matches best with the 256 x 256 cubemap output.
     * The smallest supported cube size is 16 x 16.
     */
    fromCubemap(cubemap, renderTarget = null) {
      return this._fromTexture(cubemap, renderTarget);
    }
    /**
     * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
     * your texture's network fetch for increased concurrency.
     */
    compileCubemapShader() {
      this._cubemapMaterial === null && (this._cubemapMaterial = _getCubemapMaterial(), this._compileMaterial(this._cubemapMaterial));
    }
    /**
     * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
     * your texture's network fetch for increased concurrency.
     */
    compileEquirectangularShader() {
      this._equirectMaterial === null && (this._equirectMaterial = _getEquirectMaterial(), this._compileMaterial(this._equirectMaterial));
    }
    /**
     * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
     * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
     * one of them will cause any others to also become unusable.
     */
    dispose() {
      this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
    }
    // private interface
    _setSize(cubeSize) {
      this._lodMax = Math.floor(Math.log2(cubeSize)), this._cubeSize = Math.pow(2, this._lodMax);
    }
    _dispose() {
      this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
      for (let i = 0; i < this._lodPlanes.length; i++)
        this._lodPlanes[i].dispose();
    }
    _cleanup(outputTarget) {
      this._renderer.setRenderTarget(_oldTarget, _oldActiveCubeFace, _oldActiveMipmapLevel), this._renderer.xr.enabled = _oldXrEnabled, outputTarget.scissorTest = !1, _setViewport(outputTarget, 0, 0, outputTarget.width, outputTarget.height);
    }
    _fromTexture(texture, renderTarget) {
      texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping ? this._setSize(texture.image.length === 0 ? 16 : texture.image[0].width || texture.image[0].image.width) : this._setSize(texture.image.width / 4), _oldTarget = this._renderer.getRenderTarget(), _oldActiveCubeFace = this._renderer.getActiveCubeFace(), _oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel(), _oldXrEnabled = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
      let cubeUVRenderTarget = renderTarget || this._allocateTargets();
      return this._textureToCubeUV(texture, cubeUVRenderTarget), this._applyPMREM(cubeUVRenderTarget), this._cleanup(cubeUVRenderTarget), cubeUVRenderTarget;
    }
    _allocateTargets() {
      let width = 3 * Math.max(this._cubeSize, 112), height = 4 * this._cubeSize, params = {
        magFilter: LinearFilter,
        minFilter: LinearFilter,
        generateMipmaps: !1,
        type: HalfFloatType,
        format: RGBAFormat,
        colorSpace: LinearSRGBColorSpace,
        depthBuffer: !1
      }, cubeUVRenderTarget = _createRenderTarget(width, height, params);
      if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== width || this._pingPongRenderTarget.height !== height) {
        this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = _createRenderTarget(width, height, params);
        let { _lodMax } = this;
        ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = _createPlanes(_lodMax)), this._blurMaterial = _getBlurShader(_lodMax, width, height);
      }
      return cubeUVRenderTarget;
    }
    _compileMaterial(material) {
      let tmpMesh = new Mesh(this._lodPlanes[0], material);
      this._renderer.compile(tmpMesh, _flatCamera);
    }
    _sceneToCubeUV(scene, near, far, cubeUVRenderTarget) {
      let cubeCamera = new PerspectiveCamera(90, 1, near, far), upSign = [1, -1, 1, 1, 1, 1], forwardSign = [1, 1, 1, -1, -1, -1], renderer = this._renderer, originalAutoClear = renderer.autoClear, toneMapping = renderer.toneMapping;
      renderer.getClearColor(_clearColor), renderer.toneMapping = NoToneMapping, renderer.autoClear = !1;
      let backgroundMaterial = new MeshBasicMaterial({
        name: "PMREM.Background",
        side: BackSide,
        depthWrite: !1,
        depthTest: !1
      }), backgroundBox = new Mesh(new BoxGeometry(), backgroundMaterial), useSolidColor = !1, background = scene.background;
      background ? background.isColor && (backgroundMaterial.color.copy(background), scene.background = null, useSolidColor = !0) : (backgroundMaterial.color.copy(_clearColor), useSolidColor = !0);
      for (let i = 0; i < 6; i++) {
        let col = i % 3;
        col === 0 ? (cubeCamera.up.set(0, upSign[i], 0), cubeCamera.lookAt(forwardSign[i], 0, 0)) : col === 1 ? (cubeCamera.up.set(0, 0, upSign[i]), cubeCamera.lookAt(0, forwardSign[i], 0)) : (cubeCamera.up.set(0, upSign[i], 0), cubeCamera.lookAt(0, 0, forwardSign[i]));
        let size = this._cubeSize;
        _setViewport(cubeUVRenderTarget, col * size, i > 2 ? size : 0, size, size), renderer.setRenderTarget(cubeUVRenderTarget), useSolidColor && renderer.render(backgroundBox, cubeCamera), renderer.render(scene, cubeCamera);
      }
      backgroundBox.geometry.dispose(), backgroundBox.material.dispose(), renderer.toneMapping = toneMapping, renderer.autoClear = originalAutoClear, scene.background = background;
    }
    _textureToCubeUV(texture, cubeUVRenderTarget) {
      let renderer = this._renderer, isCubeTexture = texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping;
      isCubeTexture ? (this._cubemapMaterial === null && (this._cubemapMaterial = _getCubemapMaterial()), this._cubemapMaterial.uniforms.flipEnvMap.value = texture.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = _getEquirectMaterial());
      let material = isCubeTexture ? this._cubemapMaterial : this._equirectMaterial, mesh = new Mesh(this._lodPlanes[0], material), uniforms = material.uniforms;
      uniforms.envMap.value = texture;
      let size = this._cubeSize;
      _setViewport(cubeUVRenderTarget, 0, 0, 3 * size, 2 * size), renderer.setRenderTarget(cubeUVRenderTarget), renderer.render(mesh, _flatCamera);
    }
    _applyPMREM(cubeUVRenderTarget) {
      let renderer = this._renderer, autoClear = renderer.autoClear;
      renderer.autoClear = !1;
      let n = this._lodPlanes.length;
      for (let i = 1; i < n; i++) {
        let sigma = Math.sqrt(this._sigmas[i] * this._sigmas[i] - this._sigmas[i - 1] * this._sigmas[i - 1]), poleAxis = _axisDirections[(n - i - 1) % _axisDirections.length];
        this._blur(cubeUVRenderTarget, i - 1, i, sigma, poleAxis);
      }
      renderer.autoClear = autoClear;
    }
    /**
     * This is a two-pass Gaussian blur for a cubemap. Normally this is done
     * vertically and horizontally, but this breaks down on a cube. Here we apply
     * the blur latitudinally (around the poles), and then longitudinally (towards
     * the poles) to approximate the orthogonally-separable blur. It is least
     * accurate at the poles, but still does a decent job.
     */
    _blur(cubeUVRenderTarget, lodIn, lodOut, sigma, poleAxis) {
      let pingPongRenderTarget = this._pingPongRenderTarget;
      this._halfBlur(
        cubeUVRenderTarget,
        pingPongRenderTarget,
        lodIn,
        lodOut,
        sigma,
        "latitudinal",
        poleAxis
      ), this._halfBlur(
        pingPongRenderTarget,
        cubeUVRenderTarget,
        lodOut,
        lodOut,
        sigma,
        "longitudinal",
        poleAxis
      );
    }
    _halfBlur(targetIn, targetOut, lodIn, lodOut, sigmaRadians, direction, poleAxis) {
      let renderer = this._renderer, blurMaterial = this._blurMaterial;
      direction !== "latitudinal" && direction !== "longitudinal" && console.error(
        "blur direction must be either latitudinal or longitudinal!"
      );
      let STANDARD_DEVIATIONS = 3, blurMesh = new Mesh(this._lodPlanes[lodOut], blurMaterial), blurUniforms = blurMaterial.uniforms, pixels = this._sizeLods[lodIn] - 1, radiansPerPixel = isFinite(sigmaRadians) ? Math.PI / (2 * pixels) : 2 * Math.PI / (2 * MAX_SAMPLES - 1), sigmaPixels = sigmaRadians / radiansPerPixel, samples = isFinite(sigmaRadians) ? 1 + Math.floor(STANDARD_DEVIATIONS * sigmaPixels) : MAX_SAMPLES;
      samples > MAX_SAMPLES && console.warn(`sigmaRadians, ${sigmaRadians}, is too large and will clip, as it requested ${samples} samples when the maximum is set to ${MAX_SAMPLES}`);
      let weights = [], sum = 0;
      for (let i = 0; i < MAX_SAMPLES; ++i) {
        let x2 = i / sigmaPixels, weight = Math.exp(-x2 * x2 / 2);
        weights.push(weight), i === 0 ? sum += weight : i < samples && (sum += 2 * weight);
      }
      for (let i = 0; i < weights.length; i++)
        weights[i] = weights[i] / sum;
      blurUniforms.envMap.value = targetIn.texture, blurUniforms.samples.value = samples, blurUniforms.weights.value = weights, blurUniforms.latitudinal.value = direction === "latitudinal", poleAxis && (blurUniforms.poleAxis.value = poleAxis);
      let { _lodMax } = this;
      blurUniforms.dTheta.value = radiansPerPixel, blurUniforms.mipInt.value = _lodMax - lodIn;
      let outputSize = this._sizeLods[lodOut], x = 3 * outputSize * (lodOut > _lodMax - LOD_MIN ? lodOut - _lodMax + LOD_MIN : 0), y = 4 * (this._cubeSize - outputSize);
      _setViewport(targetOut, x, y, 3 * outputSize, 2 * outputSize), renderer.setRenderTarget(targetOut), renderer.render(blurMesh, _flatCamera);
    }
  };
  function _createPlanes(lodMax) {
    let lodPlanes = [], sizeLods = [], sigmas = [], lod = lodMax, totalLods = lodMax - LOD_MIN + 1 + EXTRA_LOD_SIGMA.length;
    for (let i = 0; i < totalLods; i++) {
      let sizeLod = Math.pow(2, lod);
      sizeLods.push(sizeLod);
      let sigma = 1 / sizeLod;
      i > lodMax - LOD_MIN ? sigma = EXTRA_LOD_SIGMA[i - lodMax + LOD_MIN - 1] : i === 0 && (sigma = 0), sigmas.push(sigma);
      let texelSize = 1 / (sizeLod - 2), min = -texelSize, max = 1 + texelSize, uv1 = [min, min, max, min, max, max, min, min, max, max, min, max], cubeFaces = 6, vertices = 6, positionSize = 3, uvSize = 2, faceIndexSize = 1, position = new Float32Array(positionSize * vertices * cubeFaces), uv = new Float32Array(uvSize * vertices * cubeFaces), faceIndex = new Float32Array(faceIndexSize * vertices * cubeFaces);
      for (let face = 0; face < cubeFaces; face++) {
        let x = face % 3 * 2 / 3 - 1, y = face > 2 ? 0 : -1, coordinates = [
          x,
          y,
          0,
          x + 2 / 3,
          y,
          0,
          x + 2 / 3,
          y + 1,
          0,
          x,
          y,
          0,
          x + 2 / 3,
          y + 1,
          0,
          x,
          y + 1,
          0
        ];
        position.set(coordinates, positionSize * vertices * face), uv.set(uv1, uvSize * vertices * face);
        let fill = [face, face, face, face, face, face];
        faceIndex.set(fill, faceIndexSize * vertices * face);
      }
      let planes = new BufferGeometry();
      planes.setAttribute("position", new BufferAttribute(position, positionSize)), planes.setAttribute("uv", new BufferAttribute(uv, uvSize)), planes.setAttribute("faceIndex", new BufferAttribute(faceIndex, faceIndexSize)), lodPlanes.push(planes), lod > LOD_MIN && lod--;
    }
    return { lodPlanes, sizeLods, sigmas };
  }
  function _createRenderTarget(width, height, params) {
    let cubeUVRenderTarget = new WebGLRenderTarget(width, height, params);
    return cubeUVRenderTarget.texture.mapping = CubeUVReflectionMapping, cubeUVRenderTarget.texture.name = "PMREM.cubeUv", cubeUVRenderTarget.scissorTest = !0, cubeUVRenderTarget;
  }
  function _setViewport(target, x, y, width, height) {
    target.viewport.set(x, y, width, height), target.scissor.set(x, y, width, height);
  }
  function _getBlurShader(lodMax, width, height) {
    let weights = new Float32Array(MAX_SAMPLES), poleAxis = new Vector3(0, 1, 0);
    return new ShaderMaterial({
      name: "SphericalGaussianBlur",
      defines: {
        n: MAX_SAMPLES,
        CUBEUV_TEXEL_WIDTH: 1 / width,
        CUBEUV_TEXEL_HEIGHT: 1 / height,
        CUBEUV_MAX_MIP: `${lodMax}.0`
      },
      uniforms: {
        envMap: { value: null },
        samples: { value: 1 },
        weights: { value: weights },
        latitudinal: { value: !1 },
        dTheta: { value: 0 },
        mipInt: { value: 0 },
        poleAxis: { value: poleAxis }
      },
      vertexShader: _getCommonVertexShader(),
      fragmentShader: (
        /* glsl */
        `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`
      ),
      blending: NoBlending,
      depthTest: !1,
      depthWrite: !1
    });
  }
  function _getEquirectMaterial() {
    return new ShaderMaterial({
      name: "EquirectangularToCubeUV",
      uniforms: {
        envMap: { value: null }
      },
      vertexShader: _getCommonVertexShader(),
      fragmentShader: (
        /* glsl */
        `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`
      ),
      blending: NoBlending,
      depthTest: !1,
      depthWrite: !1
    });
  }
  function _getCubemapMaterial() {
    return new ShaderMaterial({
      name: "CubemapToCubeUV",
      uniforms: {
        envMap: { value: null },
        flipEnvMap: { value: -1 }
      },
      vertexShader: _getCommonVertexShader(),
      fragmentShader: (
        /* glsl */
        `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`
      ),
      blending: NoBlending,
      depthTest: !1,
      depthWrite: !1
    });
  }
  function _getCommonVertexShader() {
    return (
      /* glsl */
      `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
    );
  }
  function WebGLCubeUVMaps(renderer) {
    let cubeUVmaps = /* @__PURE__ */ new WeakMap(), pmremGenerator = null;
    function get(texture) {
      if (texture && texture.isTexture) {
        let mapping = texture.mapping, isEquirectMap = mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping, isCubeMap = mapping === CubeReflectionMapping || mapping === CubeRefractionMapping;
        if (isEquirectMap || isCubeMap) {
          let renderTarget = cubeUVmaps.get(texture), currentPMREMVersion = renderTarget !== void 0 ? renderTarget.texture.pmremVersion : 0;
          if (texture.isRenderTargetTexture && texture.pmremVersion !== currentPMREMVersion)
            return pmremGenerator === null && (pmremGenerator = new PMREMGenerator(renderer)), renderTarget = isEquirectMap ? pmremGenerator.fromEquirectangular(texture, renderTarget) : pmremGenerator.fromCubemap(texture, renderTarget), renderTarget.texture.pmremVersion = texture.pmremVersion, cubeUVmaps.set(texture, renderTarget), renderTarget.texture;
          if (renderTarget !== void 0)
            return renderTarget.texture;
          {
            let image = texture.image;
            return isEquirectMap && image && image.height > 0 || isCubeMap && image && isCubeTextureComplete(image) ? (pmremGenerator === null && (pmremGenerator = new PMREMGenerator(renderer)), renderTarget = isEquirectMap ? pmremGenerator.fromEquirectangular(texture) : pmremGenerator.fromCubemap(texture), renderTarget.texture.pmremVersion = texture.pmremVersion, cubeUVmaps.set(texture, renderTarget), texture.addEventListener("dispose", onTextureDispose), renderTarget.texture) : null;
          }
        }
      }
      return texture;
    }
    function isCubeTextureComplete(image) {
      let count = 0, length = 6;
      for (let i = 0; i < length; i++)
        image[i] !== void 0 && count++;
      return count === length;
    }
    function onTextureDispose(event) {
      let texture = event.target;
      texture.removeEventListener("dispose", onTextureDispose);
      let cubemapUV = cubeUVmaps.get(texture);
      cubemapUV !== void 0 && (cubeUVmaps.delete(texture), cubemapUV.dispose());
    }
    function dispose() {
      cubeUVmaps = /* @__PURE__ */ new WeakMap(), pmremGenerator !== null && (pmremGenerator.dispose(), pmremGenerator = null);
    }
    return {
      get,
      dispose
    };
  }
  function WebGLExtensions(gl) {
    let extensions = {};
    function getExtension(name) {
      if (extensions[name] !== void 0)
        return extensions[name];
      let extension;
      switch (name) {
        case "WEBGL_depth_texture":
          extension = gl.getExtension("WEBGL_depth_texture") || gl.getExtension("MOZ_WEBGL_depth_texture") || gl.getExtension("WEBKIT_WEBGL_depth_texture");
          break;
        case "EXT_texture_filter_anisotropic":
          extension = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
          break;
        case "WEBGL_compressed_texture_s3tc":
          extension = gl.getExtension("WEBGL_compressed_texture_s3tc") || gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
          break;
        case "WEBGL_compressed_texture_pvrtc":
          extension = gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
          break;
        default:
          extension = gl.getExtension(name);
      }
      return extensions[name] = extension, extension;
    }
    return {
      has: function(name) {
        return getExtension(name) !== null;
      },
      init: function() {
        getExtension("EXT_color_buffer_float"), getExtension("WEBGL_clip_cull_distance"), getExtension("OES_texture_float_linear"), getExtension("EXT_color_buffer_half_float"), getExtension("WEBGL_multisampled_render_to_texture"), getExtension("WEBGL_render_shared_exponent");
      },
      get: function(name) {
        let extension = getExtension(name);
        return extension === null && warnOnce("THREE.WebGLRenderer: " + name + " extension not supported."), extension;
      }
    };
  }
  function WebGLGeometries(gl, attributes, info, bindingStates) {
    let geometries = {}, wireframeAttributes = /* @__PURE__ */ new WeakMap();
    function onGeometryDispose(event) {
      let geometry = event.target;
      geometry.index !== null && attributes.remove(geometry.index);
      for (let name in geometry.attributes)
        attributes.remove(geometry.attributes[name]);
      for (let name in geometry.morphAttributes) {
        let array = geometry.morphAttributes[name];
        for (let i = 0, l = array.length; i < l; i++)
          attributes.remove(array[i]);
      }
      geometry.removeEventListener("dispose", onGeometryDispose), delete geometries[geometry.id];
      let attribute = wireframeAttributes.get(geometry);
      attribute && (attributes.remove(attribute), wireframeAttributes.delete(geometry)), bindingStates.releaseStatesOfGeometry(geometry), geometry.isInstancedBufferGeometry === !0 && delete geometry._maxInstanceCount, info.memory.geometries--;
    }
    function get(object, geometry) {
      return geometries[geometry.id] === !0 || (geometry.addEventListener("dispose", onGeometryDispose), geometries[geometry.id] = !0, info.memory.geometries++), geometry;
    }
    function update(geometry) {
      let geometryAttributes = geometry.attributes;
      for (let name in geometryAttributes)
        attributes.update(geometryAttributes[name], gl.ARRAY_BUFFER);
      let morphAttributes = geometry.morphAttributes;
      for (let name in morphAttributes) {
        let array = morphAttributes[name];
        for (let i = 0, l = array.length; i < l; i++)
          attributes.update(array[i], gl.ARRAY_BUFFER);
      }
    }
    function updateWireframeAttribute(geometry) {
      let indices = [], geometryIndex = geometry.index, geometryPosition = geometry.attributes.position, version = 0;
      if (geometryIndex !== null) {
        let array = geometryIndex.array;
        version = geometryIndex.version;
        for (let i = 0, l = array.length; i < l; i += 3) {
          let a = array[i + 0], b = array[i + 1], c = array[i + 2];
          indices.push(a, b, b, c, c, a);
        }
      } else if (geometryPosition !== void 0) {
        let array = geometryPosition.array;
        version = geometryPosition.version;
        for (let i = 0, l = array.length / 3 - 1; i < l; i += 3) {
          let a = i + 0, b = i + 1, c = i + 2;
          indices.push(a, b, b, c, c, a);
        }
      } else
        return;
      let attribute = new (arrayNeedsUint32(indices) ? Uint32BufferAttribute : Uint16BufferAttribute)(indices, 1);
      attribute.version = version;
      let previousAttribute = wireframeAttributes.get(geometry);
      previousAttribute && attributes.remove(previousAttribute), wireframeAttributes.set(geometry, attribute);
    }
    function getWireframeAttribute(geometry) {
      let currentAttribute = wireframeAttributes.get(geometry);
      if (currentAttribute) {
        let geometryIndex = geometry.index;
        geometryIndex !== null && currentAttribute.version < geometryIndex.version && updateWireframeAttribute(geometry);
      } else
        updateWireframeAttribute(geometry);
      return wireframeAttributes.get(geometry);
    }
    return {
      get,
      update,
      getWireframeAttribute
    };
  }
  function WebGLIndexedBufferRenderer(gl, extensions, info) {
    let mode;
    function setMode(value) {
      mode = value;
    }
    let type, bytesPerElement;
    function setIndex(value) {
      type = value.type, bytesPerElement = value.bytesPerElement;
    }
    function render(start, count) {
      gl.drawElements(mode, count, type, start * bytesPerElement), info.update(count, mode, 1);
    }
    function renderInstances(start, count, primcount) {
      primcount !== 0 && (gl.drawElementsInstanced(mode, count, type, start * bytesPerElement, primcount), info.update(count, mode, primcount));
    }
    function renderMultiDraw(starts, counts, drawCount) {
      if (drawCount === 0) return;
      extensions.get("WEBGL_multi_draw").multiDrawElementsWEBGL(mode, counts, 0, type, starts, 0, drawCount);
      let elementCount = 0;
      for (let i = 0; i < drawCount; i++)
        elementCount += counts[i];
      info.update(elementCount, mode, 1);
    }
    function renderMultiDrawInstances(starts, counts, drawCount, primcount) {
      if (drawCount === 0) return;
      let extension = extensions.get("WEBGL_multi_draw");
      if (extension === null)
        for (let i = 0; i < starts.length; i++)
          renderInstances(starts[i] / bytesPerElement, counts[i], primcount[i]);
      else {
        extension.multiDrawElementsInstancedWEBGL(mode, counts, 0, type, starts, 0, primcount, 0, drawCount);
        let elementCount = 0;
        for (let i = 0; i < drawCount; i++)
          elementCount += counts[i];
        for (let i = 0; i < primcount.length; i++)
          info.update(elementCount, mode, primcount[i]);
      }
    }
    this.setMode = setMode, this.setIndex = setIndex, this.render = render, this.renderInstances = renderInstances, this.renderMultiDraw = renderMultiDraw, this.renderMultiDrawInstances = renderMultiDrawInstances;
  }
  function WebGLInfo(gl) {
    let memory = {
      geometries: 0,
      textures: 0
    }, render = {
      frame: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
    function update(count, mode, instanceCount) {
      switch (render.calls++, mode) {
        case gl.TRIANGLES:
          render.triangles += instanceCount * (count / 3);
          break;
        case gl.LINES:
          render.lines += instanceCount * (count / 2);
          break;
        case gl.LINE_STRIP:
          render.lines += instanceCount * (count - 1);
          break;
        case gl.LINE_LOOP:
          render.lines += instanceCount * count;
          break;
        case gl.POINTS:
          render.points += instanceCount * count;
          break;
        default:
          console.error("THREE.WebGLInfo: Unknown draw mode:", mode);
          break;
      }
    }
    function reset() {
      render.calls = 0, render.triangles = 0, render.points = 0, render.lines = 0;
    }
    return {
      memory,
      render,
      programs: null,
      autoReset: !0,
      reset,
      update
    };
  }
  function WebGLMorphtargets(gl, capabilities, textures) {
    let morphTextures = /* @__PURE__ */ new WeakMap(), morph = new Vector4();
    function update(object, geometry, program) {
      let objectInfluences = object.morphTargetInfluences, morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color, morphTargetsCount = morphAttribute !== void 0 ? morphAttribute.length : 0, entry = morphTextures.get(geometry);
      if (entry === void 0 || entry.count !== morphTargetsCount) {
        let disposeTexture = function() {
          texture.dispose(), morphTextures.delete(geometry), geometry.removeEventListener("dispose", disposeTexture);
        };
        entry !== void 0 && entry.texture.dispose();
        let hasMorphPosition = geometry.morphAttributes.position !== void 0, hasMorphNormals = geometry.morphAttributes.normal !== void 0, hasMorphColors = geometry.morphAttributes.color !== void 0, morphTargets = geometry.morphAttributes.position || [], morphNormals = geometry.morphAttributes.normal || [], morphColors = geometry.morphAttributes.color || [], vertexDataCount = 0;
        hasMorphPosition === !0 && (vertexDataCount = 1), hasMorphNormals === !0 && (vertexDataCount = 2), hasMorphColors === !0 && (vertexDataCount = 3);
        let width = geometry.attributes.position.count * vertexDataCount, height = 1;
        width > capabilities.maxTextureSize && (height = Math.ceil(width / capabilities.maxTextureSize), width = capabilities.maxTextureSize);
        let buffer = new Float32Array(width * height * 4 * morphTargetsCount), texture = new DataArrayTexture(buffer, width, height, morphTargetsCount);
        texture.type = FloatType, texture.needsUpdate = !0;
        let vertexDataStride = vertexDataCount * 4;
        for (let i = 0; i < morphTargetsCount; i++) {
          let morphTarget = morphTargets[i], morphNormal = morphNormals[i], morphColor = morphColors[i], offset = width * height * 4 * i;
          for (let j = 0; j < morphTarget.count; j++) {
            let stride = j * vertexDataStride;
            hasMorphPosition === !0 && (morph.fromBufferAttribute(morphTarget, j), buffer[offset + stride + 0] = morph.x, buffer[offset + stride + 1] = morph.y, buffer[offset + stride + 2] = morph.z, buffer[offset + stride + 3] = 0), hasMorphNormals === !0 && (morph.fromBufferAttribute(morphNormal, j), buffer[offset + stride + 4] = morph.x, buffer[offset + stride + 5] = morph.y, buffer[offset + stride + 6] = morph.z, buffer[offset + stride + 7] = 0), hasMorphColors === !0 && (morph.fromBufferAttribute(morphColor, j), buffer[offset + stride + 8] = morph.x, buffer[offset + stride + 9] = morph.y, buffer[offset + stride + 10] = morph.z, buffer[offset + stride + 11] = morphColor.itemSize === 4 ? morph.w : 1);
          }
        }
        entry = {
          count: morphTargetsCount,
          texture,
          size: new Vector2(width, height)
        }, morphTextures.set(geometry, entry), geometry.addEventListener("dispose", disposeTexture);
      }
      if (object.isInstancedMesh === !0 && object.morphTexture !== null)
        program.getUniforms().setValue(gl, "morphTexture", object.morphTexture, textures);
      else {
        let morphInfluencesSum = 0;
        for (let i = 0; i < objectInfluences.length; i++)
          morphInfluencesSum += objectInfluences[i];
        let morphBaseInfluence = geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;
        program.getUniforms().setValue(gl, "morphTargetBaseInfluence", morphBaseInfluence), program.getUniforms().setValue(gl, "morphTargetInfluences", objectInfluences);
      }
      program.getUniforms().setValue(gl, "morphTargetsTexture", entry.texture, textures), program.getUniforms().setValue(gl, "morphTargetsTextureSize", entry.size);
    }
    return {
      update
    };
  }
  function WebGLObjects(gl, geometries, attributes, info) {
    let updateMap = /* @__PURE__ */ new WeakMap();
    function update(object) {
      let frame = info.render.frame, geometry = object.geometry, buffergeometry = geometries.get(object, geometry);
      if (updateMap.get(buffergeometry) !== frame && (geometries.update(buffergeometry), updateMap.set(buffergeometry, frame)), object.isInstancedMesh && (object.hasEventListener("dispose", onInstancedMeshDispose) === !1 && object.addEventListener("dispose", onInstancedMeshDispose), updateMap.get(object) !== frame && (attributes.update(object.instanceMatrix, gl.ARRAY_BUFFER), object.instanceColor !== null && attributes.update(object.instanceColor, gl.ARRAY_BUFFER), updateMap.set(object, frame))), object.isSkinnedMesh) {
        let skeleton = object.skeleton;
        updateMap.get(skeleton) !== frame && (skeleton.update(), updateMap.set(skeleton, frame));
      }
      return buffergeometry;
    }
    function dispose() {
      updateMap = /* @__PURE__ */ new WeakMap();
    }
    function onInstancedMeshDispose(event) {
      let instancedMesh = event.target;
      instancedMesh.removeEventListener("dispose", onInstancedMeshDispose), attributes.remove(instancedMesh.instanceMatrix), instancedMesh.instanceColor !== null && attributes.remove(instancedMesh.instanceColor);
    }
    return {
      update,
      dispose
    };
  }
  var DepthTexture = class extends Texture {
    constructor(width, height, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, format = DepthFormat) {
      if (format !== DepthFormat && format !== DepthStencilFormat)
        throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
      type === void 0 && format === DepthFormat && (type = UnsignedIntType), type === void 0 && format === DepthStencilFormat && (type = UnsignedInt248Type), super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy), this.isDepthTexture = !0, this.image = { width, height }, this.magFilter = magFilter !== void 0 ? magFilter : NearestFilter, this.minFilter = minFilter !== void 0 ? minFilter : NearestFilter, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
    }
    copy(source) {
      return super.copy(source), this.compareFunction = source.compareFunction, this;
    }
    toJSON(meta) {
      let data = super.toJSON(meta);
      return this.compareFunction !== null && (data.compareFunction = this.compareFunction), data;
    }
  }, emptyTexture = /* @__PURE__ */ new Texture(), emptyShadowTexture = /* @__PURE__ */ new DepthTexture(1, 1), emptyArrayTexture = /* @__PURE__ */ new DataArrayTexture(), empty3dTexture = /* @__PURE__ */ new Data3DTexture(), emptyCubeTexture = /* @__PURE__ */ new CubeTexture(), arrayCacheF32 = [], arrayCacheI32 = [], mat4array = new Float32Array(16), mat3array = new Float32Array(9), mat2array = new Float32Array(4);
  function flatten(array, nBlocks, blockSize) {
    let firstElem = array[0];
    if (firstElem <= 0 || firstElem > 0) return array;
    let n = nBlocks * blockSize, r = arrayCacheF32[n];
    if (r === void 0 && (r = new Float32Array(n), arrayCacheF32[n] = r), nBlocks !== 0) {
      firstElem.toArray(r, 0);
      for (let i = 1, offset = 0; i !== nBlocks; ++i)
        offset += blockSize, array[i].toArray(r, offset);
    }
    return r;
  }
  function arraysEqual(a, b) {
    if (a.length !== b.length) return !1;
    for (let i = 0, l = a.length; i < l; i++)
      if (a[i] !== b[i]) return !1;
    return !0;
  }
  function copyArray(a, b) {
    for (let i = 0, l = b.length; i < l; i++)
      a[i] = b[i];
  }
  function allocTexUnits(textures, n) {
    let r = arrayCacheI32[n];
    r === void 0 && (r = new Int32Array(n), arrayCacheI32[n] = r);
    for (let i = 0; i !== n; ++i)
      r[i] = textures.allocateTextureUnit();
    return r;
  }
  function setValueV1f(gl, v) {
    let cache = this.cache;
    cache[0] !== v && (gl.uniform1f(this.addr, v), cache[0] = v);
  }
  function setValueV2f(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y) && (gl.uniform2f(this.addr, v.x, v.y), cache[0] = v.x, cache[1] = v.y);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform2fv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueV3f(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) && (gl.uniform3f(this.addr, v.x, v.y, v.z), cache[0] = v.x, cache[1] = v.y, cache[2] = v.z);
    else if (v.r !== void 0)
      (cache[0] !== v.r || cache[1] !== v.g || cache[2] !== v.b) && (gl.uniform3f(this.addr, v.r, v.g, v.b), cache[0] = v.r, cache[1] = v.g, cache[2] = v.b);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform3fv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueV4f(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z || cache[3] !== v.w) && (gl.uniform4f(this.addr, v.x, v.y, v.z, v.w), cache[0] = v.x, cache[1] = v.y, cache[2] = v.z, cache[3] = v.w);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform4fv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueM2(gl, v) {
    let cache = this.cache, elements = v.elements;
    if (elements === void 0) {
      if (arraysEqual(cache, v)) return;
      gl.uniformMatrix2fv(this.addr, !1, v), copyArray(cache, v);
    } else {
      if (arraysEqual(cache, elements)) return;
      mat2array.set(elements), gl.uniformMatrix2fv(this.addr, !1, mat2array), copyArray(cache, elements);
    }
  }
  function setValueM3(gl, v) {
    let cache = this.cache, elements = v.elements;
    if (elements === void 0) {
      if (arraysEqual(cache, v)) return;
      gl.uniformMatrix3fv(this.addr, !1, v), copyArray(cache, v);
    } else {
      if (arraysEqual(cache, elements)) return;
      mat3array.set(elements), gl.uniformMatrix3fv(this.addr, !1, mat3array), copyArray(cache, elements);
    }
  }
  function setValueM4(gl, v) {
    let cache = this.cache, elements = v.elements;
    if (elements === void 0) {
      if (arraysEqual(cache, v)) return;
      gl.uniformMatrix4fv(this.addr, !1, v), copyArray(cache, v);
    } else {
      if (arraysEqual(cache, elements)) return;
      mat4array.set(elements), gl.uniformMatrix4fv(this.addr, !1, mat4array), copyArray(cache, elements);
    }
  }
  function setValueV1i(gl, v) {
    let cache = this.cache;
    cache[0] !== v && (gl.uniform1i(this.addr, v), cache[0] = v);
  }
  function setValueV2i(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y) && (gl.uniform2i(this.addr, v.x, v.y), cache[0] = v.x, cache[1] = v.y);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform2iv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueV3i(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) && (gl.uniform3i(this.addr, v.x, v.y, v.z), cache[0] = v.x, cache[1] = v.y, cache[2] = v.z);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform3iv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueV4i(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z || cache[3] !== v.w) && (gl.uniform4i(this.addr, v.x, v.y, v.z, v.w), cache[0] = v.x, cache[1] = v.y, cache[2] = v.z, cache[3] = v.w);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform4iv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueV1ui(gl, v) {
    let cache = this.cache;
    cache[0] !== v && (gl.uniform1ui(this.addr, v), cache[0] = v);
  }
  function setValueV2ui(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y) && (gl.uniform2ui(this.addr, v.x, v.y), cache[0] = v.x, cache[1] = v.y);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform2uiv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueV3ui(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) && (gl.uniform3ui(this.addr, v.x, v.y, v.z), cache[0] = v.x, cache[1] = v.y, cache[2] = v.z);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform3uiv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueV4ui(gl, v) {
    let cache = this.cache;
    if (v.x !== void 0)
      (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z || cache[3] !== v.w) && (gl.uniform4ui(this.addr, v.x, v.y, v.z, v.w), cache[0] = v.x, cache[1] = v.y, cache[2] = v.z, cache[3] = v.w);
    else {
      if (arraysEqual(cache, v)) return;
      gl.uniform4uiv(this.addr, v), copyArray(cache, v);
    }
  }
  function setValueT1(gl, v, textures) {
    let cache = this.cache, unit = textures.allocateTextureUnit();
    cache[0] !== unit && (gl.uniform1i(this.addr, unit), cache[0] = unit);
    let emptyTexture2D;
    this.type === gl.SAMPLER_2D_SHADOW ? (emptyShadowTexture.compareFunction = LessEqualCompare, emptyTexture2D = emptyShadowTexture) : emptyTexture2D = emptyTexture, textures.setTexture2D(v || emptyTexture2D, unit);
  }
  function setValueT3D1(gl, v, textures) {
    let cache = this.cache, unit = textures.allocateTextureUnit();
    cache[0] !== unit && (gl.uniform1i(this.addr, unit), cache[0] = unit), textures.setTexture3D(v || empty3dTexture, unit);
  }
  function setValueT6(gl, v, textures) {
    let cache = this.cache, unit = textures.allocateTextureUnit();
    cache[0] !== unit && (gl.uniform1i(this.addr, unit), cache[0] = unit), textures.setTextureCube(v || emptyCubeTexture, unit);
  }
  function setValueT2DArray1(gl, v, textures) {
    let cache = this.cache, unit = textures.allocateTextureUnit();
    cache[0] !== unit && (gl.uniform1i(this.addr, unit), cache[0] = unit), textures.setTexture2DArray(v || emptyArrayTexture, unit);
  }
  function getSingularSetter(type) {
    switch (type) {
      case 5126:
        return setValueV1f;
      case 35664:
        return setValueV2f;
      case 35665:
        return setValueV3f;
      case 35666:
        return setValueV4f;
      case 35674:
        return setValueM2;
      case 35675:
        return setValueM3;
      case 35676:
        return setValueM4;
      case 5124:
      case 35670:
        return setValueV1i;
      case 35667:
      case 35671:
        return setValueV2i;
      case 35668:
      case 35672:
        return setValueV3i;
      case 35669:
      case 35673:
        return setValueV4i;
      case 5125:
        return setValueV1ui;
      case 36294:
        return setValueV2ui;
      case 36295:
        return setValueV3ui;
      case 36296:
        return setValueV4ui;
      case 35678:
      case 36198:
      case 36298:
      case 36306:
      case 35682:
        return setValueT1;
      case 35679:
      case 36299:
      case 36307:
        return setValueT3D1;
      case 35680:
      case 36300:
      case 36308:
      case 36293:
        return setValueT6;
      case 36289:
      case 36303:
      case 36311:
      case 36292:
        return setValueT2DArray1;
    }
  }
  function setValueV1fArray(gl, v) {
    gl.uniform1fv(this.addr, v);
  }
  function setValueV2fArray(gl, v) {
    let data = flatten(v, this.size, 2);
    gl.uniform2fv(this.addr, data);
  }
  function setValueV3fArray(gl, v) {
    let data = flatten(v, this.size, 3);
    gl.uniform3fv(this.addr, data);
  }
  function setValueV4fArray(gl, v) {
    let data = flatten(v, this.size, 4);
    gl.uniform4fv(this.addr, data);
  }
  function setValueM2Array(gl, v) {
    let data = flatten(v, this.size, 4);
    gl.uniformMatrix2fv(this.addr, !1, data);
  }
  function setValueM3Array(gl, v) {
    let data = flatten(v, this.size, 9);
    gl.uniformMatrix3fv(this.addr, !1, data);
  }
  function setValueM4Array(gl, v) {
    let data = flatten(v, this.size, 16);
    gl.uniformMatrix4fv(this.addr, !1, data);
  }
  function setValueV1iArray(gl, v) {
    gl.uniform1iv(this.addr, v);
  }
  function setValueV2iArray(gl, v) {
    gl.uniform2iv(this.addr, v);
  }
  function setValueV3iArray(gl, v) {
    gl.uniform3iv(this.addr, v);
  }
  function setValueV4iArray(gl, v) {
    gl.uniform4iv(this.addr, v);
  }
  function setValueV1uiArray(gl, v) {
    gl.uniform1uiv(this.addr, v);
  }
  function setValueV2uiArray(gl, v) {
    gl.uniform2uiv(this.addr, v);
  }
  function setValueV3uiArray(gl, v) {
    gl.uniform3uiv(this.addr, v);
  }
  function setValueV4uiArray(gl, v) {
    gl.uniform4uiv(this.addr, v);
  }
  function setValueT1Array(gl, v, textures) {
    let cache = this.cache, n = v.length, units = allocTexUnits(textures, n);
    arraysEqual(cache, units) || (gl.uniform1iv(this.addr, units), copyArray(cache, units));
    for (let i = 0; i !== n; ++i)
      textures.setTexture2D(v[i] || emptyTexture, units[i]);
  }
  function setValueT3DArray(gl, v, textures) {
    let cache = this.cache, n = v.length, units = allocTexUnits(textures, n);
    arraysEqual(cache, units) || (gl.uniform1iv(this.addr, units), copyArray(cache, units));
    for (let i = 0; i !== n; ++i)
      textures.setTexture3D(v[i] || empty3dTexture, units[i]);
  }
  function setValueT6Array(gl, v, textures) {
    let cache = this.cache, n = v.length, units = allocTexUnits(textures, n);
    arraysEqual(cache, units) || (gl.uniform1iv(this.addr, units), copyArray(cache, units));
    for (let i = 0; i !== n; ++i)
      textures.setTextureCube(v[i] || emptyCubeTexture, units[i]);
  }
  function setValueT2DArrayArray(gl, v, textures) {
    let cache = this.cache, n = v.length, units = allocTexUnits(textures, n);
    arraysEqual(cache, units) || (gl.uniform1iv(this.addr, units), copyArray(cache, units));
    for (let i = 0; i !== n; ++i)
      textures.setTexture2DArray(v[i] || emptyArrayTexture, units[i]);
  }
  function getPureArraySetter(type) {
    switch (type) {
      case 5126:
        return setValueV1fArray;
      case 35664:
        return setValueV2fArray;
      case 35665:
        return setValueV3fArray;
      case 35666:
        return setValueV4fArray;
      case 35674:
        return setValueM2Array;
      case 35675:
        return setValueM3Array;
      case 35676:
        return setValueM4Array;
      case 5124:
      case 35670:
        return setValueV1iArray;
      case 35667:
      case 35671:
        return setValueV2iArray;
      case 35668:
      case 35672:
        return setValueV3iArray;
      case 35669:
      case 35673:
        return setValueV4iArray;
      case 5125:
        return setValueV1uiArray;
      case 36294:
        return setValueV2uiArray;
      case 36295:
        return setValueV3uiArray;
      case 36296:
        return setValueV4uiArray;
      case 35678:
      case 36198:
      case 36298:
      case 36306:
      case 35682:
        return setValueT1Array;
      case 35679:
      case 36299:
      case 36307:
        return setValueT3DArray;
      case 35680:
      case 36300:
      case 36308:
      case 36293:
        return setValueT6Array;
      case 36289:
      case 36303:
      case 36311:
      case 36292:
        return setValueT2DArrayArray;
    }
  }
  var SingleUniform = class {
    constructor(id, activeInfo, addr) {
      this.id = id, this.addr = addr, this.cache = [], this.type = activeInfo.type, this.setValue = getSingularSetter(activeInfo.type);
    }
  }, PureArrayUniform = class {
    constructor(id, activeInfo, addr) {
      this.id = id, this.addr = addr, this.cache = [], this.type = activeInfo.type, this.size = activeInfo.size, this.setValue = getPureArraySetter(activeInfo.type);
    }
  }, StructuredUniform = class {
    constructor(id) {
      this.id = id, this.seq = [], this.map = {};
    }
    setValue(gl, value, textures) {
      let seq = this.seq;
      for (let i = 0, n = seq.length; i !== n; ++i) {
        let u = seq[i];
        u.setValue(gl, value[u.id], textures);
      }
    }
  }, RePathPart = /(\w+)(\])?(\[|\.)?/g;
  function addUniform(container, uniformObject) {
    container.seq.push(uniformObject), container.map[uniformObject.id] = uniformObject;
  }
  function parseUniform(activeInfo, addr, container) {
    let path = activeInfo.name, pathLength = path.length;
    for (RePathPart.lastIndex = 0; ; ) {
      let match = RePathPart.exec(path), matchEnd = RePathPart.lastIndex, id = match[1], idIsIndex = match[2] === "]", subscript = match[3];
      if (idIsIndex && (id = id | 0), subscript === void 0 || subscript === "[" && matchEnd + 2 === pathLength) {
        addUniform(container, subscript === void 0 ? new SingleUniform(id, activeInfo, addr) : new PureArrayUniform(id, activeInfo, addr));
        break;
      } else {
        let next = container.map[id];
        next === void 0 && (next = new StructuredUniform(id), addUniform(container, next)), container = next;
      }
    }
  }
  var WebGLUniforms = class {
    constructor(gl, program) {
      this.seq = [], this.map = {};
      let n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; ++i) {
        let info = gl.getActiveUniform(program, i), addr = gl.getUniformLocation(program, info.name);
        parseUniform(info, addr, this);
      }
    }
    setValue(gl, name, value, textures) {
      let u = this.map[name];
      u !== void 0 && u.setValue(gl, value, textures);
    }
    setOptional(gl, object, name) {
      let v = object[name];
      v !== void 0 && this.setValue(gl, name, v);
    }
    static upload(gl, seq, values, textures) {
      for (let i = 0, n = seq.length; i !== n; ++i) {
        let u = seq[i], v = values[u.id];
        v.needsUpdate !== !1 && u.setValue(gl, v.value, textures);
      }
    }
    static seqWithValue(seq, values) {
      let r = [];
      for (let i = 0, n = seq.length; i !== n; ++i) {
        let u = seq[i];
        u.id in values && r.push(u);
      }
      return r;
    }
  };
  function WebGLShader(gl, type, string) {
    let shader = gl.createShader(type);
    return gl.shaderSource(shader, string), gl.compileShader(shader), shader;
  }
  var COMPLETION_STATUS_KHR = 37297, programIdCount = 0;
  function handleSource(string, errorLine) {
    let lines = string.split(`
`), lines2 = [], from = Math.max(errorLine - 6, 0), to = Math.min(errorLine + 6, lines.length);
    for (let i = from; i < to; i++) {
      let line = i + 1;
      lines2.push(`${line === errorLine ? ">" : " "} ${line}: ${lines[i]}`);
    }
    return lines2.join(`
`);
  }
  function getEncodingComponents(colorSpace) {
    let workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace), encodingPrimaries = ColorManagement.getPrimaries(colorSpace), gamutMapping;
    switch (workingPrimaries === encodingPrimaries ? gamutMapping = "" : workingPrimaries === P3Primaries && encodingPrimaries === Rec709Primaries ? gamutMapping = "LinearDisplayP3ToLinearSRGB" : workingPrimaries === Rec709Primaries && encodingPrimaries === P3Primaries && (gamutMapping = "LinearSRGBToLinearDisplayP3"), colorSpace) {
      case LinearSRGBColorSpace:
      case LinearDisplayP3ColorSpace:
        return [gamutMapping, "LinearTransferOETF"];
      case SRGBColorSpace:
      case DisplayP3ColorSpace:
        return [gamutMapping, "sRGBTransferOETF"];
      default:
        return console.warn("THREE.WebGLProgram: Unsupported color space:", colorSpace), [gamutMapping, "LinearTransferOETF"];
    }
  }
  function getShaderErrors(gl, shader, type) {
    let status = gl.getShaderParameter(shader, gl.COMPILE_STATUS), errors = gl.getShaderInfoLog(shader).trim();
    if (status && errors === "") return "";
    let errorMatches = /ERROR: 0:(\d+)/.exec(errors);
    if (errorMatches) {
      let errorLine = parseInt(errorMatches[1]);
      return type.toUpperCase() + `

` + errors + `

` + handleSource(gl.getShaderSource(shader), errorLine);
    } else
      return errors;
  }
  function getTexelEncodingFunction(functionName, colorSpace) {
    let components = getEncodingComponents(colorSpace);
    return `vec4 ${functionName}( vec4 value ) { return ${components[0]}( ${components[1]}( value ) ); }`;
  }
  function getToneMappingFunction(functionName, toneMapping) {
    let toneMappingName;
    switch (toneMapping) {
      case LinearToneMapping:
        toneMappingName = "Linear";
        break;
      case ReinhardToneMapping:
        toneMappingName = "Reinhard";
        break;
      case CineonToneMapping:
        toneMappingName = "OptimizedCineon";
        break;
      case ACESFilmicToneMapping:
        toneMappingName = "ACESFilmic";
        break;
      case AgXToneMapping:
        toneMappingName = "AgX";
        break;
      case NeutralToneMapping:
        toneMappingName = "Neutral";
        break;
      case CustomToneMapping:
        toneMappingName = "Custom";
        break;
      default:
        console.warn("THREE.WebGLProgram: Unsupported toneMapping:", toneMapping), toneMappingName = "Linear";
    }
    return "vec3 " + functionName + "( vec3 color ) { return " + toneMappingName + "ToneMapping( color ); }";
  }
  var _v0$1 = /* @__PURE__ */ new Vector3();
  function getLuminanceFunction() {
    ColorManagement.getLuminanceCoefficients(_v0$1);
    let r = _v0$1.x.toFixed(4), g = _v0$1.y.toFixed(4), b = _v0$1.z.toFixed(4);
    return [
      "float luminance( const in vec3 rgb ) {",
      `	const vec3 weights = vec3( ${r}, ${g}, ${b} );`,
      "	return dot( weights, rgb );",
      "}"
    ].join(`
`);
  }
  function generateVertexExtensions(parameters) {
    return [
      parameters.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
      parameters.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
    ].filter(filterEmptyLine).join(`
`);
  }
  function generateDefines(defines) {
    let chunks = [];
    for (let name in defines) {
      let value = defines[name];
      value !== !1 && chunks.push("#define " + name + " " + value);
    }
    return chunks.join(`
`);
  }
  function fetchAttributeLocations(gl, program) {
    let attributes = {}, n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < n; i++) {
      let info = gl.getActiveAttrib(program, i), name = info.name, locationSize = 1;
      info.type === gl.FLOAT_MAT2 && (locationSize = 2), info.type === gl.FLOAT_MAT3 && (locationSize = 3), info.type === gl.FLOAT_MAT4 && (locationSize = 4), attributes[name] = {
        type: info.type,
        location: gl.getAttribLocation(program, name),
        locationSize
      };
    }
    return attributes;
  }
  function filterEmptyLine(string) {
    return string !== "";
  }
  function replaceLightNums(string, parameters) {
    let numSpotLightCoords = parameters.numSpotLightShadows + parameters.numSpotLightMaps - parameters.numSpotLightShadowsWithMaps;
    return string.replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights).replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, parameters.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, numSpotLightCoords).replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights).replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, parameters.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows);
  }
  function replaceClippingPlaneNums(string, parameters) {
    return string.replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, parameters.numClippingPlanes - parameters.numClipIntersection);
  }
  var includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
  function resolveIncludes(string) {
    return string.replace(includePattern, includeReplacer);
  }
  var shaderChunkMap = /* @__PURE__ */ new Map();
  function includeReplacer(match, include) {
    let string = ShaderChunk[include];
    if (string === void 0) {
      let newInclude = shaderChunkMap.get(include);
      if (newInclude !== void 0)
        string = ShaderChunk[newInclude], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', include, newInclude);
      else
        throw new Error("Can not resolve #include <" + include + ">");
    }
    return resolveIncludes(string);
  }
  var unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
  function unrollLoops(string) {
    return string.replace(unrollLoopPattern, loopReplacer);
  }
  function loopReplacer(match, start, end, snippet) {
    let string = "";
    for (let i = parseInt(start); i < parseInt(end); i++)
      string += snippet.replace(/\[\s*i\s*\]/g, "[ " + i + " ]").replace(/UNROLLED_LOOP_INDEX/g, i);
    return string;
  }
  function generatePrecision(parameters) {
    let precisionstring = `precision ${parameters.precision} float;
	precision ${parameters.precision} int;
	precision ${parameters.precision} sampler2D;
	precision ${parameters.precision} samplerCube;
	precision ${parameters.precision} sampler3D;
	precision ${parameters.precision} sampler2DArray;
	precision ${parameters.precision} sampler2DShadow;
	precision ${parameters.precision} samplerCubeShadow;
	precision ${parameters.precision} sampler2DArrayShadow;
	precision ${parameters.precision} isampler2D;
	precision ${parameters.precision} isampler3D;
	precision ${parameters.precision} isamplerCube;
	precision ${parameters.precision} isampler2DArray;
	precision ${parameters.precision} usampler2D;
	precision ${parameters.precision} usampler3D;
	precision ${parameters.precision} usamplerCube;
	precision ${parameters.precision} usampler2DArray;
	`;
    return parameters.precision === "highp" ? precisionstring += `
#define HIGH_PRECISION` : parameters.precision === "mediump" ? precisionstring += `
#define MEDIUM_PRECISION` : parameters.precision === "lowp" && (precisionstring += `
#define LOW_PRECISION`), precisionstring;
  }
  function generateShadowMapTypeDefine(parameters) {
    let shadowMapTypeDefine = "SHADOWMAP_TYPE_BASIC";
    return parameters.shadowMapType === PCFShadowMap ? shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF" : parameters.shadowMapType === PCFSoftShadowMap ? shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF_SOFT" : parameters.shadowMapType === VSMShadowMap && (shadowMapTypeDefine = "SHADOWMAP_TYPE_VSM"), shadowMapTypeDefine;
  }
  function generateEnvMapTypeDefine(parameters) {
    let envMapTypeDefine = "ENVMAP_TYPE_CUBE";
    if (parameters.envMap)
      switch (parameters.envMapMode) {
        case CubeReflectionMapping:
        case CubeRefractionMapping:
          envMapTypeDefine = "ENVMAP_TYPE_CUBE";
          break;
        case CubeUVReflectionMapping:
          envMapTypeDefine = "ENVMAP_TYPE_CUBE_UV";
          break;
      }
    return envMapTypeDefine;
  }
  function generateEnvMapModeDefine(parameters) {
    let envMapModeDefine = "ENVMAP_MODE_REFLECTION";
    if (parameters.envMap)
      switch (parameters.envMapMode) {
        case CubeRefractionMapping:
          envMapModeDefine = "ENVMAP_MODE_REFRACTION";
          break;
      }
    return envMapModeDefine;
  }
  function generateEnvMapBlendingDefine(parameters) {
    let envMapBlendingDefine = "ENVMAP_BLENDING_NONE";
    if (parameters.envMap)
      switch (parameters.combine) {
        case MultiplyOperation:
          envMapBlendingDefine = "ENVMAP_BLENDING_MULTIPLY";
          break;
        case MixOperation:
          envMapBlendingDefine = "ENVMAP_BLENDING_MIX";
          break;
        case AddOperation:
          envMapBlendingDefine = "ENVMAP_BLENDING_ADD";
          break;
      }
    return envMapBlendingDefine;
  }
  function generateCubeUVSize(parameters) {
    let imageHeight = parameters.envMapCubeUVHeight;
    if (imageHeight === null) return null;
    let maxMip = Math.log2(imageHeight) - 2, texelHeight = 1 / imageHeight;
    return { texelWidth: 1 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16)), texelHeight, maxMip };
  }
  function WebGLProgram(renderer, cacheKey, parameters, bindingStates) {
    let gl = renderer.getContext(), defines = parameters.defines, vertexShader = parameters.vertexShader, fragmentShader = parameters.fragmentShader, shadowMapTypeDefine = generateShadowMapTypeDefine(parameters), envMapTypeDefine = generateEnvMapTypeDefine(parameters), envMapModeDefine = generateEnvMapModeDefine(parameters), envMapBlendingDefine = generateEnvMapBlendingDefine(parameters), envMapCubeUVSize = generateCubeUVSize(parameters), customVertexExtensions = generateVertexExtensions(parameters), customDefines = generateDefines(defines), program = gl.createProgram(), prefixVertex, prefixFragment, versionString = parameters.glslVersion ? "#version " + parameters.glslVersion + `
` : "";
    parameters.isRawShaderMaterial ? (prefixVertex = [
      "#define SHADER_TYPE " + parameters.shaderType,
      "#define SHADER_NAME " + parameters.shaderName,
      customDefines
    ].filter(filterEmptyLine).join(`
`), prefixVertex.length > 0 && (prefixVertex += `
`), prefixFragment = [
      "#define SHADER_TYPE " + parameters.shaderType,
      "#define SHADER_NAME " + parameters.shaderName,
      customDefines
    ].filter(filterEmptyLine).join(`
`), prefixFragment.length > 0 && (prefixFragment += `
`)) : (prefixVertex = [
      generatePrecision(parameters),
      "#define SHADER_TYPE " + parameters.shaderType,
      "#define SHADER_NAME " + parameters.shaderName,
      customDefines,
      parameters.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
      parameters.batching ? "#define USE_BATCHING" : "",
      parameters.batchingColor ? "#define USE_BATCHING_COLOR" : "",
      parameters.instancing ? "#define USE_INSTANCING" : "",
      parameters.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
      parameters.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
      parameters.useFog && parameters.fog ? "#define USE_FOG" : "",
      parameters.useFog && parameters.fogExp2 ? "#define FOG_EXP2" : "",
      parameters.map ? "#define USE_MAP" : "",
      parameters.envMap ? "#define USE_ENVMAP" : "",
      parameters.envMap ? "#define " + envMapModeDefine : "",
      parameters.lightMap ? "#define USE_LIGHTMAP" : "",
      parameters.aoMap ? "#define USE_AOMAP" : "",
      parameters.bumpMap ? "#define USE_BUMPMAP" : "",
      parameters.normalMap ? "#define USE_NORMALMAP" : "",
      parameters.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
      parameters.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
      parameters.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
      parameters.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
      parameters.anisotropy ? "#define USE_ANISOTROPY" : "",
      parameters.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
      parameters.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
      parameters.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
      parameters.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
      parameters.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
      parameters.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
      parameters.specularMap ? "#define USE_SPECULARMAP" : "",
      parameters.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
      parameters.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
      parameters.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
      parameters.metalnessMap ? "#define USE_METALNESSMAP" : "",
      parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
      parameters.alphaHash ? "#define USE_ALPHAHASH" : "",
      parameters.transmission ? "#define USE_TRANSMISSION" : "",
      parameters.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
      parameters.thicknessMap ? "#define USE_THICKNESSMAP" : "",
      parameters.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
      parameters.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
      //
      parameters.mapUv ? "#define MAP_UV " + parameters.mapUv : "",
      parameters.alphaMapUv ? "#define ALPHAMAP_UV " + parameters.alphaMapUv : "",
      parameters.lightMapUv ? "#define LIGHTMAP_UV " + parameters.lightMapUv : "",
      parameters.aoMapUv ? "#define AOMAP_UV " + parameters.aoMapUv : "",
      parameters.emissiveMapUv ? "#define EMISSIVEMAP_UV " + parameters.emissiveMapUv : "",
      parameters.bumpMapUv ? "#define BUMPMAP_UV " + parameters.bumpMapUv : "",
      parameters.normalMapUv ? "#define NORMALMAP_UV " + parameters.normalMapUv : "",
      parameters.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + parameters.displacementMapUv : "",
      parameters.metalnessMapUv ? "#define METALNESSMAP_UV " + parameters.metalnessMapUv : "",
      parameters.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + parameters.roughnessMapUv : "",
      parameters.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + parameters.anisotropyMapUv : "",
      parameters.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + parameters.clearcoatMapUv : "",
      parameters.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + parameters.clearcoatNormalMapUv : "",
      parameters.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + parameters.clearcoatRoughnessMapUv : "",
      parameters.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + parameters.iridescenceMapUv : "",
      parameters.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + parameters.iridescenceThicknessMapUv : "",
      parameters.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + parameters.sheenColorMapUv : "",
      parameters.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + parameters.sheenRoughnessMapUv : "",
      parameters.specularMapUv ? "#define SPECULARMAP_UV " + parameters.specularMapUv : "",
      parameters.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + parameters.specularColorMapUv : "",
      parameters.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + parameters.specularIntensityMapUv : "",
      parameters.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + parameters.transmissionMapUv : "",
      parameters.thicknessMapUv ? "#define THICKNESSMAP_UV " + parameters.thicknessMapUv : "",
      //
      parameters.vertexTangents && parameters.flatShading === !1 ? "#define USE_TANGENT" : "",
      parameters.vertexColors ? "#define USE_COLOR" : "",
      parameters.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
      parameters.vertexUv1s ? "#define USE_UV1" : "",
      parameters.vertexUv2s ? "#define USE_UV2" : "",
      parameters.vertexUv3s ? "#define USE_UV3" : "",
      parameters.pointsUvs ? "#define USE_POINTS_UV" : "",
      parameters.flatShading ? "#define FLAT_SHADED" : "",
      parameters.skinning ? "#define USE_SKINNING" : "",
      parameters.morphTargets ? "#define USE_MORPHTARGETS" : "",
      parameters.morphNormals && parameters.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
      parameters.morphColors ? "#define USE_MORPHCOLORS" : "",
      parameters.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + parameters.morphTextureStride : "",
      parameters.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + parameters.morphTargetsCount : "",
      parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
      parameters.flipSided ? "#define FLIP_SIDED" : "",
      parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
      parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
      parameters.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
      parameters.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
      parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
      "uniform mat4 modelMatrix;",
      "uniform mat4 modelViewMatrix;",
      "uniform mat4 projectionMatrix;",
      "uniform mat4 viewMatrix;",
      "uniform mat3 normalMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      "#ifdef USE_INSTANCING",
      "	attribute mat4 instanceMatrix;",
      "#endif",
      "#ifdef USE_INSTANCING_COLOR",
      "	attribute vec3 instanceColor;",
      "#endif",
      "#ifdef USE_INSTANCING_MORPH",
      "	uniform sampler2D morphTexture;",
      "#endif",
      "attribute vec3 position;",
      "attribute vec3 normal;",
      "attribute vec2 uv;",
      "#ifdef USE_UV1",
      "	attribute vec2 uv1;",
      "#endif",
      "#ifdef USE_UV2",
      "	attribute vec2 uv2;",
      "#endif",
      "#ifdef USE_UV3",
      "	attribute vec2 uv3;",
      "#endif",
      "#ifdef USE_TANGENT",
      "	attribute vec4 tangent;",
      "#endif",
      "#if defined( USE_COLOR_ALPHA )",
      "	attribute vec4 color;",
      "#elif defined( USE_COLOR )",
      "	attribute vec3 color;",
      "#endif",
      "#ifdef USE_SKINNING",
      "	attribute vec4 skinIndex;",
      "	attribute vec4 skinWeight;",
      "#endif",
      `
`
    ].filter(filterEmptyLine).join(`
`), prefixFragment = [
      generatePrecision(parameters),
      "#define SHADER_TYPE " + parameters.shaderType,
      "#define SHADER_NAME " + parameters.shaderName,
      customDefines,
      parameters.useFog && parameters.fog ? "#define USE_FOG" : "",
      parameters.useFog && parameters.fogExp2 ? "#define FOG_EXP2" : "",
      parameters.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
      parameters.map ? "#define USE_MAP" : "",
      parameters.matcap ? "#define USE_MATCAP" : "",
      parameters.envMap ? "#define USE_ENVMAP" : "",
      parameters.envMap ? "#define " + envMapTypeDefine : "",
      parameters.envMap ? "#define " + envMapModeDefine : "",
      parameters.envMap ? "#define " + envMapBlendingDefine : "",
      envMapCubeUVSize ? "#define CUBEUV_TEXEL_WIDTH " + envMapCubeUVSize.texelWidth : "",
      envMapCubeUVSize ? "#define CUBEUV_TEXEL_HEIGHT " + envMapCubeUVSize.texelHeight : "",
      envMapCubeUVSize ? "#define CUBEUV_MAX_MIP " + envMapCubeUVSize.maxMip + ".0" : "",
      parameters.lightMap ? "#define USE_LIGHTMAP" : "",
      parameters.aoMap ? "#define USE_AOMAP" : "",
      parameters.bumpMap ? "#define USE_BUMPMAP" : "",
      parameters.normalMap ? "#define USE_NORMALMAP" : "",
      parameters.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
      parameters.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
      parameters.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
      parameters.anisotropy ? "#define USE_ANISOTROPY" : "",
      parameters.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
      parameters.clearcoat ? "#define USE_CLEARCOAT" : "",
      parameters.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
      parameters.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
      parameters.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
      parameters.dispersion ? "#define USE_DISPERSION" : "",
      parameters.iridescence ? "#define USE_IRIDESCENCE" : "",
      parameters.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
      parameters.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
      parameters.specularMap ? "#define USE_SPECULARMAP" : "",
      parameters.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
      parameters.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
      parameters.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
      parameters.metalnessMap ? "#define USE_METALNESSMAP" : "",
      parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
      parameters.alphaTest ? "#define USE_ALPHATEST" : "",
      parameters.alphaHash ? "#define USE_ALPHAHASH" : "",
      parameters.sheen ? "#define USE_SHEEN" : "",
      parameters.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
      parameters.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
      parameters.transmission ? "#define USE_TRANSMISSION" : "",
      parameters.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
      parameters.thicknessMap ? "#define USE_THICKNESSMAP" : "",
      parameters.vertexTangents && parameters.flatShading === !1 ? "#define USE_TANGENT" : "",
      parameters.vertexColors || parameters.instancingColor || parameters.batchingColor ? "#define USE_COLOR" : "",
      parameters.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
      parameters.vertexUv1s ? "#define USE_UV1" : "",
      parameters.vertexUv2s ? "#define USE_UV2" : "",
      parameters.vertexUv3s ? "#define USE_UV3" : "",
      parameters.pointsUvs ? "#define USE_POINTS_UV" : "",
      parameters.gradientMap ? "#define USE_GRADIENTMAP" : "",
      parameters.flatShading ? "#define FLAT_SHADED" : "",
      parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
      parameters.flipSided ? "#define FLIP_SIDED" : "",
      parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
      parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
      parameters.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
      parameters.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
      parameters.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
      parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
      "uniform mat4 viewMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      parameters.toneMapping !== NoToneMapping ? "#define TONE_MAPPING" : "",
      parameters.toneMapping !== NoToneMapping ? ShaderChunk.tonemapping_pars_fragment : "",
      // this code is required here because it is used by the toneMapping() function defined below
      parameters.toneMapping !== NoToneMapping ? getToneMappingFunction("toneMapping", parameters.toneMapping) : "",
      parameters.dithering ? "#define DITHERING" : "",
      parameters.opaque ? "#define OPAQUE" : "",
      ShaderChunk.colorspace_pars_fragment,
      // this code is required here because it is used by the various encoding/decoding function defined below
      getTexelEncodingFunction("linearToOutputTexel", parameters.outputColorSpace),
      getLuminanceFunction(),
      parameters.useDepthPacking ? "#define DEPTH_PACKING " + parameters.depthPacking : "",
      `
`
    ].filter(filterEmptyLine).join(`
`)), vertexShader = resolveIncludes(vertexShader), vertexShader = replaceLightNums(vertexShader, parameters), vertexShader = replaceClippingPlaneNums(vertexShader, parameters), fragmentShader = resolveIncludes(fragmentShader), fragmentShader = replaceLightNums(fragmentShader, parameters), fragmentShader = replaceClippingPlaneNums(fragmentShader, parameters), vertexShader = unrollLoops(vertexShader), fragmentShader = unrollLoops(fragmentShader), parameters.isRawShaderMaterial !== !0 && (versionString = `#version 300 es
`, prefixVertex = [
      customVertexExtensions,
      "#define attribute in",
      "#define varying out",
      "#define texture2D texture"
    ].join(`
`) + `
` + prefixVertex, prefixFragment = [
      "#define varying in",
      parameters.glslVersion === GLSL3 ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
      parameters.glslVersion === GLSL3 ? "" : "#define gl_FragColor pc_fragColor",
      "#define gl_FragDepthEXT gl_FragDepth",
      "#define texture2D texture",
      "#define textureCube texture",
      "#define texture2DProj textureProj",
      "#define texture2DLodEXT textureLod",
      "#define texture2DProjLodEXT textureProjLod",
      "#define textureCubeLodEXT textureLod",
      "#define texture2DGradEXT textureGrad",
      "#define texture2DProjGradEXT textureProjGrad",
      "#define textureCubeGradEXT textureGrad"
    ].join(`
`) + `
` + prefixFragment);
    let vertexGlsl = versionString + prefixVertex + vertexShader, fragmentGlsl = versionString + prefixFragment + fragmentShader, glVertexShader = WebGLShader(gl, gl.VERTEX_SHADER, vertexGlsl), glFragmentShader = WebGLShader(gl, gl.FRAGMENT_SHADER, fragmentGlsl);
    gl.attachShader(program, glVertexShader), gl.attachShader(program, glFragmentShader), parameters.index0AttributeName !== void 0 ? gl.bindAttribLocation(program, 0, parameters.index0AttributeName) : parameters.morphTargets === !0 && gl.bindAttribLocation(program, 0, "position"), gl.linkProgram(program);
    function onFirstUse(self2) {
      if (renderer.debug.checkShaderErrors) {
        let programLog = gl.getProgramInfoLog(program).trim(), vertexLog = gl.getShaderInfoLog(glVertexShader).trim(), fragmentLog = gl.getShaderInfoLog(glFragmentShader).trim(), runnable = !0, haveDiagnostics = !0;
        if (gl.getProgramParameter(program, gl.LINK_STATUS) === !1)
          if (runnable = !1, typeof renderer.debug.onShaderError == "function")
            renderer.debug.onShaderError(gl, program, glVertexShader, glFragmentShader);
          else {
            let vertexErrors = getShaderErrors(gl, glVertexShader, "vertex"), fragmentErrors = getShaderErrors(gl, glFragmentShader, "fragment");
            console.error(
              "THREE.WebGLProgram: Shader Error " + gl.getError() + " - VALIDATE_STATUS " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + `

Material Name: ` + self2.name + `
Material Type: ` + self2.type + `

Program Info Log: ` + programLog + `
` + vertexErrors + `
` + fragmentErrors
            );
          }
        else programLog !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", programLog) : (vertexLog === "" || fragmentLog === "") && (haveDiagnostics = !1);
        haveDiagnostics && (self2.diagnostics = {
          runnable,
          programLog,
          vertexShader: {
            log: vertexLog,
            prefix: prefixVertex
          },
          fragmentShader: {
            log: fragmentLog,
            prefix: prefixFragment
          }
        });
      }
      gl.deleteShader(glVertexShader), gl.deleteShader(glFragmentShader), cachedUniforms = new WebGLUniforms(gl, program), cachedAttributes = fetchAttributeLocations(gl, program);
    }
    let cachedUniforms;
    this.getUniforms = function() {
      return cachedUniforms === void 0 && onFirstUse(this), cachedUniforms;
    };
    let cachedAttributes;
    this.getAttributes = function() {
      return cachedAttributes === void 0 && onFirstUse(this), cachedAttributes;
    };
    let programReady = parameters.rendererExtensionParallelShaderCompile === !1;
    return this.isReady = function() {
      return programReady === !1 && (programReady = gl.getProgramParameter(program, COMPLETION_STATUS_KHR)), programReady;
    }, this.destroy = function() {
      bindingStates.releaseStatesOfProgram(this), gl.deleteProgram(program), this.program = void 0;
    }, this.type = parameters.shaderType, this.name = parameters.shaderName, this.id = programIdCount++, this.cacheKey = cacheKey, this.usedTimes = 1, this.program = program, this.vertexShader = glVertexShader, this.fragmentShader = glFragmentShader, this;
  }
  var _id$1 = 0, WebGLShaderCache = class {
    constructor() {
      this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
    }
    update(material) {
      let vertexShader = material.vertexShader, fragmentShader = material.fragmentShader, vertexShaderStage = this._getShaderStage(vertexShader), fragmentShaderStage = this._getShaderStage(fragmentShader), materialShaders = this._getShaderCacheForMaterial(material);
      return materialShaders.has(vertexShaderStage) === !1 && (materialShaders.add(vertexShaderStage), vertexShaderStage.usedTimes++), materialShaders.has(fragmentShaderStage) === !1 && (materialShaders.add(fragmentShaderStage), fragmentShaderStage.usedTimes++), this;
    }
    remove(material) {
      let materialShaders = this.materialCache.get(material);
      for (let shaderStage of materialShaders)
        shaderStage.usedTimes--, shaderStage.usedTimes === 0 && this.shaderCache.delete(shaderStage.code);
      return this.materialCache.delete(material), this;
    }
    getVertexShaderID(material) {
      return this._getShaderStage(material.vertexShader).id;
    }
    getFragmentShaderID(material) {
      return this._getShaderStage(material.fragmentShader).id;
    }
    dispose() {
      this.shaderCache.clear(), this.materialCache.clear();
    }
    _getShaderCacheForMaterial(material) {
      let cache = this.materialCache, set = cache.get(material);
      return set === void 0 && (set = /* @__PURE__ */ new Set(), cache.set(material, set)), set;
    }
    _getShaderStage(code) {
      let cache = this.shaderCache, stage = cache.get(code);
      return stage === void 0 && (stage = new WebGLShaderStage(code), cache.set(code, stage)), stage;
    }
  }, WebGLShaderStage = class {
    constructor(code) {
      this.id = _id$1++, this.code = code, this.usedTimes = 0;
    }
  };
  function WebGLPrograms(renderer, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping) {
    let _programLayers = new Layers(), _customShaders = new WebGLShaderCache(), _activeChannels = /* @__PURE__ */ new Set(), programs = [], logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer, SUPPORTS_VERTEX_TEXTURES = capabilities.vertexTextures, precision = capabilities.precision, shaderIDs = {
      MeshDepthMaterial: "depth",
      MeshDistanceMaterial: "distanceRGBA",
      MeshNormalMaterial: "normal",
      MeshBasicMaterial: "basic",
      MeshLambertMaterial: "lambert",
      MeshPhongMaterial: "phong",
      MeshToonMaterial: "toon",
      MeshStandardMaterial: "physical",
      MeshPhysicalMaterial: "physical",
      MeshMatcapMaterial: "matcap",
      LineBasicMaterial: "basic",
      LineDashedMaterial: "dashed",
      PointsMaterial: "points",
      ShadowMaterial: "shadow",
      SpriteMaterial: "sprite"
    };
    function getChannel(value) {
      return _activeChannels.add(value), value === 0 ? "uv" : `uv${value}`;
    }
    function getParameters(material, lights, shadows, scene, object) {
      let fog = scene.fog, geometry = object.geometry, environment = material.isMeshStandardMaterial ? scene.environment : null, envMap = (material.isMeshStandardMaterial ? cubeuvmaps : cubemaps).get(material.envMap || environment), envMapCubeUVHeight = envMap && envMap.mapping === CubeUVReflectionMapping ? envMap.image.height : null, shaderID = shaderIDs[material.type];
      material.precision !== null && (precision = capabilities.getMaxPrecision(material.precision), precision !== material.precision && console.warn("THREE.WebGLProgram.getParameters:", material.precision, "not supported, using", precision, "instead."));
      let morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color, morphTargetsCount = morphAttribute !== void 0 ? morphAttribute.length : 0, morphTextureStride = 0;
      geometry.morphAttributes.position !== void 0 && (morphTextureStride = 1), geometry.morphAttributes.normal !== void 0 && (morphTextureStride = 2), geometry.morphAttributes.color !== void 0 && (morphTextureStride = 3);
      let vertexShader, fragmentShader, customVertexShaderID, customFragmentShaderID;
      if (shaderID) {
        let shader = ShaderLib[shaderID];
        vertexShader = shader.vertexShader, fragmentShader = shader.fragmentShader;
      } else
        vertexShader = material.vertexShader, fragmentShader = material.fragmentShader, _customShaders.update(material), customVertexShaderID = _customShaders.getVertexShaderID(material), customFragmentShaderID = _customShaders.getFragmentShaderID(material);
      let currentRenderTarget = renderer.getRenderTarget(), IS_INSTANCEDMESH = object.isInstancedMesh === !0, IS_BATCHEDMESH = object.isBatchedMesh === !0, HAS_MAP = !!material.map, HAS_MATCAP = !!material.matcap, HAS_ENVMAP = !!envMap, HAS_AOMAP = !!material.aoMap, HAS_LIGHTMAP = !!material.lightMap, HAS_BUMPMAP = !!material.bumpMap, HAS_NORMALMAP = !!material.normalMap, HAS_DISPLACEMENTMAP = !!material.displacementMap, HAS_EMISSIVEMAP = !!material.emissiveMap, HAS_METALNESSMAP = !!material.metalnessMap, HAS_ROUGHNESSMAP = !!material.roughnessMap, HAS_ANISOTROPY = material.anisotropy > 0, HAS_CLEARCOAT = material.clearcoat > 0, HAS_DISPERSION = material.dispersion > 0, HAS_IRIDESCENCE = material.iridescence > 0, HAS_SHEEN = material.sheen > 0, HAS_TRANSMISSION = material.transmission > 0, HAS_ANISOTROPYMAP = HAS_ANISOTROPY && !!material.anisotropyMap, HAS_CLEARCOATMAP = HAS_CLEARCOAT && !!material.clearcoatMap, HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !!material.clearcoatNormalMap, HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !!material.clearcoatRoughnessMap, HAS_IRIDESCENCEMAP = HAS_IRIDESCENCE && !!material.iridescenceMap, HAS_IRIDESCENCE_THICKNESSMAP = HAS_IRIDESCENCE && !!material.iridescenceThicknessMap, HAS_SHEEN_COLORMAP = HAS_SHEEN && !!material.sheenColorMap, HAS_SHEEN_ROUGHNESSMAP = HAS_SHEEN && !!material.sheenRoughnessMap, HAS_SPECULARMAP = !!material.specularMap, HAS_SPECULAR_COLORMAP = !!material.specularColorMap, HAS_SPECULAR_INTENSITYMAP = !!material.specularIntensityMap, HAS_TRANSMISSIONMAP = HAS_TRANSMISSION && !!material.transmissionMap, HAS_THICKNESSMAP = HAS_TRANSMISSION && !!material.thicknessMap, HAS_GRADIENTMAP = !!material.gradientMap, HAS_ALPHAMAP = !!material.alphaMap, HAS_ALPHATEST = material.alphaTest > 0, HAS_ALPHAHASH = !!material.alphaHash, HAS_EXTENSIONS = !!material.extensions, toneMapping = NoToneMapping;
      material.toneMapped && (currentRenderTarget === null || currentRenderTarget.isXRRenderTarget === !0) && (toneMapping = renderer.toneMapping);
      let parameters = {
        shaderID,
        shaderType: material.type,
        shaderName: material.name,
        vertexShader,
        fragmentShader,
        defines: material.defines,
        customVertexShaderID,
        customFragmentShaderID,
        isRawShaderMaterial: material.isRawShaderMaterial === !0,
        glslVersion: material.glslVersion,
        precision,
        batching: IS_BATCHEDMESH,
        batchingColor: IS_BATCHEDMESH && object._colorsTexture !== null,
        instancing: IS_INSTANCEDMESH,
        instancingColor: IS_INSTANCEDMESH && object.instanceColor !== null,
        instancingMorph: IS_INSTANCEDMESH && object.morphTexture !== null,
        supportsVertexTextures: SUPPORTS_VERTEX_TEXTURES,
        outputColorSpace: currentRenderTarget === null ? renderer.outputColorSpace : currentRenderTarget.isXRRenderTarget === !0 ? currentRenderTarget.texture.colorSpace : LinearSRGBColorSpace,
        alphaToCoverage: !!material.alphaToCoverage,
        map: HAS_MAP,
        matcap: HAS_MATCAP,
        envMap: HAS_ENVMAP,
        envMapMode: HAS_ENVMAP && envMap.mapping,
        envMapCubeUVHeight,
        aoMap: HAS_AOMAP,
        lightMap: HAS_LIGHTMAP,
        bumpMap: HAS_BUMPMAP,
        normalMap: HAS_NORMALMAP,
        displacementMap: SUPPORTS_VERTEX_TEXTURES && HAS_DISPLACEMENTMAP,
        emissiveMap: HAS_EMISSIVEMAP,
        normalMapObjectSpace: HAS_NORMALMAP && material.normalMapType === ObjectSpaceNormalMap,
        normalMapTangentSpace: HAS_NORMALMAP && material.normalMapType === TangentSpaceNormalMap,
        metalnessMap: HAS_METALNESSMAP,
        roughnessMap: HAS_ROUGHNESSMAP,
        anisotropy: HAS_ANISOTROPY,
        anisotropyMap: HAS_ANISOTROPYMAP,
        clearcoat: HAS_CLEARCOAT,
        clearcoatMap: HAS_CLEARCOATMAP,
        clearcoatNormalMap: HAS_CLEARCOAT_NORMALMAP,
        clearcoatRoughnessMap: HAS_CLEARCOAT_ROUGHNESSMAP,
        dispersion: HAS_DISPERSION,
        iridescence: HAS_IRIDESCENCE,
        iridescenceMap: HAS_IRIDESCENCEMAP,
        iridescenceThicknessMap: HAS_IRIDESCENCE_THICKNESSMAP,
        sheen: HAS_SHEEN,
        sheenColorMap: HAS_SHEEN_COLORMAP,
        sheenRoughnessMap: HAS_SHEEN_ROUGHNESSMAP,
        specularMap: HAS_SPECULARMAP,
        specularColorMap: HAS_SPECULAR_COLORMAP,
        specularIntensityMap: HAS_SPECULAR_INTENSITYMAP,
        transmission: HAS_TRANSMISSION,
        transmissionMap: HAS_TRANSMISSIONMAP,
        thicknessMap: HAS_THICKNESSMAP,
        gradientMap: HAS_GRADIENTMAP,
        opaque: material.transparent === !1 && material.blending === NormalBlending && material.alphaToCoverage === !1,
        alphaMap: HAS_ALPHAMAP,
        alphaTest: HAS_ALPHATEST,
        alphaHash: HAS_ALPHAHASH,
        combine: material.combine,
        //
        mapUv: HAS_MAP && getChannel(material.map.channel),
        aoMapUv: HAS_AOMAP && getChannel(material.aoMap.channel),
        lightMapUv: HAS_LIGHTMAP && getChannel(material.lightMap.channel),
        bumpMapUv: HAS_BUMPMAP && getChannel(material.bumpMap.channel),
        normalMapUv: HAS_NORMALMAP && getChannel(material.normalMap.channel),
        displacementMapUv: HAS_DISPLACEMENTMAP && getChannel(material.displacementMap.channel),
        emissiveMapUv: HAS_EMISSIVEMAP && getChannel(material.emissiveMap.channel),
        metalnessMapUv: HAS_METALNESSMAP && getChannel(material.metalnessMap.channel),
        roughnessMapUv: HAS_ROUGHNESSMAP && getChannel(material.roughnessMap.channel),
        anisotropyMapUv: HAS_ANISOTROPYMAP && getChannel(material.anisotropyMap.channel),
        clearcoatMapUv: HAS_CLEARCOATMAP && getChannel(material.clearcoatMap.channel),
        clearcoatNormalMapUv: HAS_CLEARCOAT_NORMALMAP && getChannel(material.clearcoatNormalMap.channel),
        clearcoatRoughnessMapUv: HAS_CLEARCOAT_ROUGHNESSMAP && getChannel(material.clearcoatRoughnessMap.channel),
        iridescenceMapUv: HAS_IRIDESCENCEMAP && getChannel(material.iridescenceMap.channel),
        iridescenceThicknessMapUv: HAS_IRIDESCENCE_THICKNESSMAP && getChannel(material.iridescenceThicknessMap.channel),
        sheenColorMapUv: HAS_SHEEN_COLORMAP && getChannel(material.sheenColorMap.channel),
        sheenRoughnessMapUv: HAS_SHEEN_ROUGHNESSMAP && getChannel(material.sheenRoughnessMap.channel),
        specularMapUv: HAS_SPECULARMAP && getChannel(material.specularMap.channel),
        specularColorMapUv: HAS_SPECULAR_COLORMAP && getChannel(material.specularColorMap.channel),
        specularIntensityMapUv: HAS_SPECULAR_INTENSITYMAP && getChannel(material.specularIntensityMap.channel),
        transmissionMapUv: HAS_TRANSMISSIONMAP && getChannel(material.transmissionMap.channel),
        thicknessMapUv: HAS_THICKNESSMAP && getChannel(material.thicknessMap.channel),
        alphaMapUv: HAS_ALPHAMAP && getChannel(material.alphaMap.channel),
        //
        vertexTangents: !!geometry.attributes.tangent && (HAS_NORMALMAP || HAS_ANISOTROPY),
        vertexColors: material.vertexColors,
        vertexAlphas: material.vertexColors === !0 && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4,
        pointsUvs: object.isPoints === !0 && !!geometry.attributes.uv && (HAS_MAP || HAS_ALPHAMAP),
        fog: !!fog,
        useFog: material.fog === !0,
        fogExp2: !!fog && fog.isFogExp2,
        flatShading: material.flatShading === !0,
        sizeAttenuation: material.sizeAttenuation === !0,
        logarithmicDepthBuffer,
        skinning: object.isSkinnedMesh === !0,
        morphTargets: geometry.morphAttributes.position !== void 0,
        morphNormals: geometry.morphAttributes.normal !== void 0,
        morphColors: geometry.morphAttributes.color !== void 0,
        morphTargetsCount,
        morphTextureStride,
        numDirLights: lights.directional.length,
        numPointLights: lights.point.length,
        numSpotLights: lights.spot.length,
        numSpotLightMaps: lights.spotLightMap.length,
        numRectAreaLights: lights.rectArea.length,
        numHemiLights: lights.hemi.length,
        numDirLightShadows: lights.directionalShadowMap.length,
        numPointLightShadows: lights.pointShadowMap.length,
        numSpotLightShadows: lights.spotShadowMap.length,
        numSpotLightShadowsWithMaps: lights.numSpotLightShadowsWithMaps,
        numLightProbes: lights.numLightProbes,
        numClippingPlanes: clipping.numPlanes,
        numClipIntersection: clipping.numIntersection,
        dithering: material.dithering,
        shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
        shadowMapType: renderer.shadowMap.type,
        toneMapping,
        decodeVideoTexture: HAS_MAP && material.map.isVideoTexture === !0 && ColorManagement.getTransfer(material.map.colorSpace) === SRGBTransfer,
        premultipliedAlpha: material.premultipliedAlpha,
        doubleSided: material.side === DoubleSide,
        flipSided: material.side === BackSide,
        useDepthPacking: material.depthPacking >= 0,
        depthPacking: material.depthPacking || 0,
        index0AttributeName: material.index0AttributeName,
        extensionClipCullDistance: HAS_EXTENSIONS && material.extensions.clipCullDistance === !0 && extensions.has("WEBGL_clip_cull_distance"),
        extensionMultiDraw: (HAS_EXTENSIONS && material.extensions.multiDraw === !0 || IS_BATCHEDMESH) && extensions.has("WEBGL_multi_draw"),
        rendererExtensionParallelShaderCompile: extensions.has("KHR_parallel_shader_compile"),
        customProgramCacheKey: material.customProgramCacheKey()
      };
      return parameters.vertexUv1s = _activeChannels.has(1), parameters.vertexUv2s = _activeChannels.has(2), parameters.vertexUv3s = _activeChannels.has(3), _activeChannels.clear(), parameters;
    }
    function getProgramCacheKey(parameters) {
      let array = [];
      if (parameters.shaderID ? array.push(parameters.shaderID) : (array.push(parameters.customVertexShaderID), array.push(parameters.customFragmentShaderID)), parameters.defines !== void 0)
        for (let name in parameters.defines)
          array.push(name), array.push(parameters.defines[name]);
      return parameters.isRawShaderMaterial === !1 && (getProgramCacheKeyParameters(array, parameters), getProgramCacheKeyBooleans(array, parameters), array.push(renderer.outputColorSpace)), array.push(parameters.customProgramCacheKey), array.join();
    }
    function getProgramCacheKeyParameters(array, parameters) {
      array.push(parameters.precision), array.push(parameters.outputColorSpace), array.push(parameters.envMapMode), array.push(parameters.envMapCubeUVHeight), array.push(parameters.mapUv), array.push(parameters.alphaMapUv), array.push(parameters.lightMapUv), array.push(parameters.aoMapUv), array.push(parameters.bumpMapUv), array.push(parameters.normalMapUv), array.push(parameters.displacementMapUv), array.push(parameters.emissiveMapUv), array.push(parameters.metalnessMapUv), array.push(parameters.roughnessMapUv), array.push(parameters.anisotropyMapUv), array.push(parameters.clearcoatMapUv), array.push(parameters.clearcoatNormalMapUv), array.push(parameters.clearcoatRoughnessMapUv), array.push(parameters.iridescenceMapUv), array.push(parameters.iridescenceThicknessMapUv), array.push(parameters.sheenColorMapUv), array.push(parameters.sheenRoughnessMapUv), array.push(parameters.specularMapUv), array.push(parameters.specularColorMapUv), array.push(parameters.specularIntensityMapUv), array.push(parameters.transmissionMapUv), array.push(parameters.thicknessMapUv), array.push(parameters.combine), array.push(parameters.fogExp2), array.push(parameters.sizeAttenuation), array.push(parameters.morphTargetsCount), array.push(parameters.morphAttributeCount), array.push(parameters.numDirLights), array.push(parameters.numPointLights), array.push(parameters.numSpotLights), array.push(parameters.numSpotLightMaps), array.push(parameters.numHemiLights), array.push(parameters.numRectAreaLights), array.push(parameters.numDirLightShadows), array.push(parameters.numPointLightShadows), array.push(parameters.numSpotLightShadows), array.push(parameters.numSpotLightShadowsWithMaps), array.push(parameters.numLightProbes), array.push(parameters.shadowMapType), array.push(parameters.toneMapping), array.push(parameters.numClippingPlanes), array.push(parameters.numClipIntersection), array.push(parameters.depthPacking);
    }
    function getProgramCacheKeyBooleans(array, parameters) {
      _programLayers.disableAll(), parameters.supportsVertexTextures && _programLayers.enable(0), parameters.instancing && _programLayers.enable(1), parameters.instancingColor && _programLayers.enable(2), parameters.instancingMorph && _programLayers.enable(3), parameters.matcap && _programLayers.enable(4), parameters.envMap && _programLayers.enable(5), parameters.normalMapObjectSpace && _programLayers.enable(6), parameters.normalMapTangentSpace && _programLayers.enable(7), parameters.clearcoat && _programLayers.enable(8), parameters.iridescence && _programLayers.enable(9), parameters.alphaTest && _programLayers.enable(10), parameters.vertexColors && _programLayers.enable(11), parameters.vertexAlphas && _programLayers.enable(12), parameters.vertexUv1s && _programLayers.enable(13), parameters.vertexUv2s && _programLayers.enable(14), parameters.vertexUv3s && _programLayers.enable(15), parameters.vertexTangents && _programLayers.enable(16), parameters.anisotropy && _programLayers.enable(17), parameters.alphaHash && _programLayers.enable(18), parameters.batching && _programLayers.enable(19), parameters.dispersion && _programLayers.enable(20), parameters.batchingColor && _programLayers.enable(21), array.push(_programLayers.mask), _programLayers.disableAll(), parameters.fog && _programLayers.enable(0), parameters.useFog && _programLayers.enable(1), parameters.flatShading && _programLayers.enable(2), parameters.logarithmicDepthBuffer && _programLayers.enable(3), parameters.skinning && _programLayers.enable(4), parameters.morphTargets && _programLayers.enable(5), parameters.morphNormals && _programLayers.enable(6), parameters.morphColors && _programLayers.enable(7), parameters.premultipliedAlpha && _programLayers.enable(8), parameters.shadowMapEnabled && _programLayers.enable(9), parameters.doubleSided && _programLayers.enable(10), parameters.flipSided && _programLayers.enable(11), parameters.useDepthPacking && _programLayers.enable(12), parameters.dithering && _programLayers.enable(13), parameters.transmission && _programLayers.enable(14), parameters.sheen && _programLayers.enable(15), parameters.opaque && _programLayers.enable(16), parameters.pointsUvs && _programLayers.enable(17), parameters.decodeVideoTexture && _programLayers.enable(18), parameters.alphaToCoverage && _programLayers.enable(19), array.push(_programLayers.mask);
    }
    function getUniforms(material) {
      let shaderID = shaderIDs[material.type], uniforms;
      if (shaderID) {
        let shader = ShaderLib[shaderID];
        uniforms = UniformsUtils.clone(shader.uniforms);
      } else
        uniforms = material.uniforms;
      return uniforms;
    }
    function acquireProgram(parameters, cacheKey) {
      let program;
      for (let p = 0, pl = programs.length; p < pl; p++) {
        let preexistingProgram = programs[p];
        if (preexistingProgram.cacheKey === cacheKey) {
          program = preexistingProgram, ++program.usedTimes;
          break;
        }
      }
      return program === void 0 && (program = new WebGLProgram(renderer, cacheKey, parameters, bindingStates), programs.push(program)), program;
    }
    function releaseProgram(program) {
      if (--program.usedTimes === 0) {
        let i = programs.indexOf(program);
        programs[i] = programs[programs.length - 1], programs.pop(), program.destroy();
      }
    }
    function releaseShaderCache(material) {
      _customShaders.remove(material);
    }
    function dispose() {
      _customShaders.dispose();
    }
    return {
      getParameters,
      getProgramCacheKey,
      getUniforms,
      acquireProgram,
      releaseProgram,
      releaseShaderCache,
      // Exposed for resource monitoring & error feedback via renderer.info:
      programs,
      dispose
    };
  }
  function WebGLProperties() {
    let properties = /* @__PURE__ */ new WeakMap();
    function get(object) {
      let map = properties.get(object);
      return map === void 0 && (map = {}, properties.set(object, map)), map;
    }
    function remove(object) {
      properties.delete(object);
    }
    function update(object, key, value) {
      properties.get(object)[key] = value;
    }
    function dispose() {
      properties = /* @__PURE__ */ new WeakMap();
    }
    return {
      get,
      remove,
      update,
      dispose
    };
  }
  function painterSortStable(a, b) {
    return a.groupOrder !== b.groupOrder ? a.groupOrder - b.groupOrder : a.renderOrder !== b.renderOrder ? a.renderOrder - b.renderOrder : a.material.id !== b.material.id ? a.material.id - b.material.id : a.z !== b.z ? a.z - b.z : a.id - b.id;
  }
  function reversePainterSortStable(a, b) {
    return a.groupOrder !== b.groupOrder ? a.groupOrder - b.groupOrder : a.renderOrder !== b.renderOrder ? a.renderOrder - b.renderOrder : a.z !== b.z ? b.z - a.z : a.id - b.id;
  }
  function WebGLRenderList() {
    let renderItems = [], renderItemsIndex = 0, opaque = [], transmissive = [], transparent = [];
    function init7() {
      renderItemsIndex = 0, opaque.length = 0, transmissive.length = 0, transparent.length = 0;
    }
    function getNextRenderItem(object, geometry, material, groupOrder, z, group) {
      let renderItem = renderItems[renderItemsIndex];
      return renderItem === void 0 ? (renderItem = {
        id: object.id,
        object,
        geometry,
        material,
        groupOrder,
        renderOrder: object.renderOrder,
        z,
        group
      }, renderItems[renderItemsIndex] = renderItem) : (renderItem.id = object.id, renderItem.object = object, renderItem.geometry = geometry, renderItem.material = material, renderItem.groupOrder = groupOrder, renderItem.renderOrder = object.renderOrder, renderItem.z = z, renderItem.group = group), renderItemsIndex++, renderItem;
    }
    function push(object, geometry, material, groupOrder, z, group) {
      let renderItem = getNextRenderItem(object, geometry, material, groupOrder, z, group);
      material.transmission > 0 ? transmissive.push(renderItem) : material.transparent === !0 ? transparent.push(renderItem) : opaque.push(renderItem);
    }
    function unshift(object, geometry, material, groupOrder, z, group) {
      let renderItem = getNextRenderItem(object, geometry, material, groupOrder, z, group);
      material.transmission > 0 ? transmissive.unshift(renderItem) : material.transparent === !0 ? transparent.unshift(renderItem) : opaque.unshift(renderItem);
    }
    function sort(customOpaqueSort, customTransparentSort) {
      opaque.length > 1 && opaque.sort(customOpaqueSort || painterSortStable), transmissive.length > 1 && transmissive.sort(customTransparentSort || reversePainterSortStable), transparent.length > 1 && transparent.sort(customTransparentSort || reversePainterSortStable);
    }
    function finish() {
      for (let i = renderItemsIndex, il = renderItems.length; i < il; i++) {
        let renderItem = renderItems[i];
        if (renderItem.id === null) break;
        renderItem.id = null, renderItem.object = null, renderItem.geometry = null, renderItem.material = null, renderItem.group = null;
      }
    }
    return {
      opaque,
      transmissive,
      transparent,
      init: init7,
      push,
      unshift,
      finish,
      sort
    };
  }
  function WebGLRenderLists() {
    let lists = /* @__PURE__ */ new WeakMap();
    function get(scene, renderCallDepth) {
      let listArray = lists.get(scene), list;
      return listArray === void 0 ? (list = new WebGLRenderList(), lists.set(scene, [list])) : renderCallDepth >= listArray.length ? (list = new WebGLRenderList(), listArray.push(list)) : list = listArray[renderCallDepth], list;
    }
    function dispose() {
      lists = /* @__PURE__ */ new WeakMap();
    }
    return {
      get,
      dispose
    };
  }
  function UniformsCache() {
    let lights = {};
    return {
      get: function(light) {
        if (lights[light.id] !== void 0)
          return lights[light.id];
        let uniforms;
        switch (light.type) {
          case "DirectionalLight":
            uniforms = {
              direction: new Vector3(),
              color: new Color()
            };
            break;
          case "SpotLight":
            uniforms = {
              position: new Vector3(),
              direction: new Vector3(),
              color: new Color(),
              distance: 0,
              coneCos: 0,
              penumbraCos: 0,
              decay: 0
            };
            break;
          case "PointLight":
            uniforms = {
              position: new Vector3(),
              color: new Color(),
              distance: 0,
              decay: 0
            };
            break;
          case "HemisphereLight":
            uniforms = {
              direction: new Vector3(),
              skyColor: new Color(),
              groundColor: new Color()
            };
            break;
          case "RectAreaLight":
            uniforms = {
              color: new Color(),
              position: new Vector3(),
              halfWidth: new Vector3(),
              halfHeight: new Vector3()
            };
            break;
        }
        return lights[light.id] = uniforms, uniforms;
      }
    };
  }
  function ShadowUniformsCache() {
    let lights = {};
    return {
      get: function(light) {
        if (lights[light.id] !== void 0)
          return lights[light.id];
        let uniforms;
        switch (light.type) {
          case "DirectionalLight":
            uniforms = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new Vector2()
            };
            break;
          case "SpotLight":
            uniforms = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new Vector2()
            };
            break;
          case "PointLight":
            uniforms = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new Vector2(),
              shadowCameraNear: 1,
              shadowCameraFar: 1e3
            };
            break;
        }
        return lights[light.id] = uniforms, uniforms;
      }
    };
  }
  var nextVersion = 0;
  function shadowCastingAndTexturingLightsFirst(lightA, lightB) {
    return (lightB.castShadow ? 2 : 0) - (lightA.castShadow ? 2 : 0) + (lightB.map ? 1 : 0) - (lightA.map ? 1 : 0);
  }
  function WebGLLights(extensions) {
    let cache = new UniformsCache(), shadowCache = ShadowUniformsCache(), state = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1
      },
      ambient: [0, 0, 0],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0
    };
    for (let i = 0; i < 9; i++) state.probe.push(new Vector3());
    let vector3 = new Vector3(), matrix4 = new Matrix4(), matrix42 = new Matrix4();
    function setup(lights) {
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < 9; i++) state.probe[i].set(0, 0, 0);
      let directionalLength = 0, pointLength = 0, spotLength = 0, rectAreaLength = 0, hemiLength = 0, numDirectionalShadows = 0, numPointShadows = 0, numSpotShadows = 0, numSpotMaps = 0, numSpotShadowsWithMaps = 0, numLightProbes = 0;
      lights.sort(shadowCastingAndTexturingLightsFirst);
      for (let i = 0, l = lights.length; i < l; i++) {
        let light = lights[i], color = light.color, intensity = light.intensity, distance = light.distance, shadowMap = light.shadow && light.shadow.map ? light.shadow.map.texture : null;
        if (light.isAmbientLight)
          r += color.r * intensity, g += color.g * intensity, b += color.b * intensity;
        else if (light.isLightProbe) {
          for (let j = 0; j < 9; j++)
            state.probe[j].addScaledVector(light.sh.coefficients[j], intensity);
          numLightProbes++;
        } else if (light.isDirectionalLight) {
          let uniforms = cache.get(light);
          if (uniforms.color.copy(light.color).multiplyScalar(light.intensity), light.castShadow) {
            let shadow = light.shadow, shadowUniforms = shadowCache.get(light);
            shadowUniforms.shadowIntensity = shadow.intensity, shadowUniforms.shadowBias = shadow.bias, shadowUniforms.shadowNormalBias = shadow.normalBias, shadowUniforms.shadowRadius = shadow.radius, shadowUniforms.shadowMapSize = shadow.mapSize, state.directionalShadow[directionalLength] = shadowUniforms, state.directionalShadowMap[directionalLength] = shadowMap, state.directionalShadowMatrix[directionalLength] = light.shadow.matrix, numDirectionalShadows++;
          }
          state.directional[directionalLength] = uniforms, directionalLength++;
        } else if (light.isSpotLight) {
          let uniforms = cache.get(light);
          uniforms.position.setFromMatrixPosition(light.matrixWorld), uniforms.color.copy(color).multiplyScalar(intensity), uniforms.distance = distance, uniforms.coneCos = Math.cos(light.angle), uniforms.penumbraCos = Math.cos(light.angle * (1 - light.penumbra)), uniforms.decay = light.decay, state.spot[spotLength] = uniforms;
          let shadow = light.shadow;
          if (light.map && (state.spotLightMap[numSpotMaps] = light.map, numSpotMaps++, shadow.updateMatrices(light), light.castShadow && numSpotShadowsWithMaps++), state.spotLightMatrix[spotLength] = shadow.matrix, light.castShadow) {
            let shadowUniforms = shadowCache.get(light);
            shadowUniforms.shadowIntensity = shadow.intensity, shadowUniforms.shadowBias = shadow.bias, shadowUniforms.shadowNormalBias = shadow.normalBias, shadowUniforms.shadowRadius = shadow.radius, shadowUniforms.shadowMapSize = shadow.mapSize, state.spotShadow[spotLength] = shadowUniforms, state.spotShadowMap[spotLength] = shadowMap, numSpotShadows++;
          }
          spotLength++;
        } else if (light.isRectAreaLight) {
          let uniforms = cache.get(light);
          uniforms.color.copy(color).multiplyScalar(intensity), uniforms.halfWidth.set(light.width * 0.5, 0, 0), uniforms.halfHeight.set(0, light.height * 0.5, 0), state.rectArea[rectAreaLength] = uniforms, rectAreaLength++;
        } else if (light.isPointLight) {
          let uniforms = cache.get(light);
          if (uniforms.color.copy(light.color).multiplyScalar(light.intensity), uniforms.distance = light.distance, uniforms.decay = light.decay, light.castShadow) {
            let shadow = light.shadow, shadowUniforms = shadowCache.get(light);
            shadowUniforms.shadowIntensity = shadow.intensity, shadowUniforms.shadowBias = shadow.bias, shadowUniforms.shadowNormalBias = shadow.normalBias, shadowUniforms.shadowRadius = shadow.radius, shadowUniforms.shadowMapSize = shadow.mapSize, shadowUniforms.shadowCameraNear = shadow.camera.near, shadowUniforms.shadowCameraFar = shadow.camera.far, state.pointShadow[pointLength] = shadowUniforms, state.pointShadowMap[pointLength] = shadowMap, state.pointShadowMatrix[pointLength] = light.shadow.matrix, numPointShadows++;
          }
          state.point[pointLength] = uniforms, pointLength++;
        } else if (light.isHemisphereLight) {
          let uniforms = cache.get(light);
          uniforms.skyColor.copy(light.color).multiplyScalar(intensity), uniforms.groundColor.copy(light.groundColor).multiplyScalar(intensity), state.hemi[hemiLength] = uniforms, hemiLength++;
        }
      }
      rectAreaLength > 0 && (extensions.has("OES_texture_float_linear") === !0 ? (state.rectAreaLTC1 = UniformsLib.LTC_FLOAT_1, state.rectAreaLTC2 = UniformsLib.LTC_FLOAT_2) : (state.rectAreaLTC1 = UniformsLib.LTC_HALF_1, state.rectAreaLTC2 = UniformsLib.LTC_HALF_2)), state.ambient[0] = r, state.ambient[1] = g, state.ambient[2] = b;
      let hash = state.hash;
      (hash.directionalLength !== directionalLength || hash.pointLength !== pointLength || hash.spotLength !== spotLength || hash.rectAreaLength !== rectAreaLength || hash.hemiLength !== hemiLength || hash.numDirectionalShadows !== numDirectionalShadows || hash.numPointShadows !== numPointShadows || hash.numSpotShadows !== numSpotShadows || hash.numSpotMaps !== numSpotMaps || hash.numLightProbes !== numLightProbes) && (state.directional.length = directionalLength, state.spot.length = spotLength, state.rectArea.length = rectAreaLength, state.point.length = pointLength, state.hemi.length = hemiLength, state.directionalShadow.length = numDirectionalShadows, state.directionalShadowMap.length = numDirectionalShadows, state.pointShadow.length = numPointShadows, state.pointShadowMap.length = numPointShadows, state.spotShadow.length = numSpotShadows, state.spotShadowMap.length = numSpotShadows, state.directionalShadowMatrix.length = numDirectionalShadows, state.pointShadowMatrix.length = numPointShadows, state.spotLightMatrix.length = numSpotShadows + numSpotMaps - numSpotShadowsWithMaps, state.spotLightMap.length = numSpotMaps, state.numSpotLightShadowsWithMaps = numSpotShadowsWithMaps, state.numLightProbes = numLightProbes, hash.directionalLength = directionalLength, hash.pointLength = pointLength, hash.spotLength = spotLength, hash.rectAreaLength = rectAreaLength, hash.hemiLength = hemiLength, hash.numDirectionalShadows = numDirectionalShadows, hash.numPointShadows = numPointShadows, hash.numSpotShadows = numSpotShadows, hash.numSpotMaps = numSpotMaps, hash.numLightProbes = numLightProbes, state.version = nextVersion++);
    }
    function setupView(lights, camera) {
      let directionalLength = 0, pointLength = 0, spotLength = 0, rectAreaLength = 0, hemiLength = 0, viewMatrix = camera.matrixWorldInverse;
      for (let i = 0, l = lights.length; i < l; i++) {
        let light = lights[i];
        if (light.isDirectionalLight) {
          let uniforms = state.directional[directionalLength];
          uniforms.direction.setFromMatrixPosition(light.matrixWorld), vector3.setFromMatrixPosition(light.target.matrixWorld), uniforms.direction.sub(vector3), uniforms.direction.transformDirection(viewMatrix), directionalLength++;
        } else if (light.isSpotLight) {
          let uniforms = state.spot[spotLength];
          uniforms.position.setFromMatrixPosition(light.matrixWorld), uniforms.position.applyMatrix4(viewMatrix), uniforms.direction.setFromMatrixPosition(light.matrixWorld), vector3.setFromMatrixPosition(light.target.matrixWorld), uniforms.direction.sub(vector3), uniforms.direction.transformDirection(viewMatrix), spotLength++;
        } else if (light.isRectAreaLight) {
          let uniforms = state.rectArea[rectAreaLength];
          uniforms.position.setFromMatrixPosition(light.matrixWorld), uniforms.position.applyMatrix4(viewMatrix), matrix42.identity(), matrix4.copy(light.matrixWorld), matrix4.premultiply(viewMatrix), matrix42.extractRotation(matrix4), uniforms.halfWidth.set(light.width * 0.5, 0, 0), uniforms.halfHeight.set(0, light.height * 0.5, 0), uniforms.halfWidth.applyMatrix4(matrix42), uniforms.halfHeight.applyMatrix4(matrix42), rectAreaLength++;
        } else if (light.isPointLight) {
          let uniforms = state.point[pointLength];
          uniforms.position.setFromMatrixPosition(light.matrixWorld), uniforms.position.applyMatrix4(viewMatrix), pointLength++;
        } else if (light.isHemisphereLight) {
          let uniforms = state.hemi[hemiLength];
          uniforms.direction.setFromMatrixPosition(light.matrixWorld), uniforms.direction.transformDirection(viewMatrix), hemiLength++;
        }
      }
    }
    return {
      setup,
      setupView,
      state
    };
  }
  function WebGLRenderState(extensions) {
    let lights = new WebGLLights(extensions), lightsArray = [], shadowsArray = [];
    function init7(camera) {
      state.camera = camera, lightsArray.length = 0, shadowsArray.length = 0;
    }
    function pushLight(light) {
      lightsArray.push(light);
    }
    function pushShadow(shadowLight) {
      shadowsArray.push(shadowLight);
    }
    function setupLights() {
      lights.setup(lightsArray);
    }
    function setupLightsView(camera) {
      lights.setupView(lightsArray, camera);
    }
    let state = {
      lightsArray,
      shadowsArray,
      camera: null,
      lights,
      transmissionRenderTarget: {}
    };
    return {
      init: init7,
      state,
      setupLights,
      setupLightsView,
      pushLight,
      pushShadow
    };
  }
  function WebGLRenderStates(extensions) {
    let renderStates = /* @__PURE__ */ new WeakMap();
    function get(scene, renderCallDepth = 0) {
      let renderStateArray = renderStates.get(scene), renderState;
      return renderStateArray === void 0 ? (renderState = new WebGLRenderState(extensions), renderStates.set(scene, [renderState])) : renderCallDepth >= renderStateArray.length ? (renderState = new WebGLRenderState(extensions), renderStateArray.push(renderState)) : renderState = renderStateArray[renderCallDepth], renderState;
    }
    function dispose() {
      renderStates = /* @__PURE__ */ new WeakMap();
    }
    return {
      get,
      dispose
    };
  }
  var MeshDepthMaterial = class extends Material {
    constructor(parameters) {
      super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = BasicDepthPacking, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(parameters);
    }
    copy(source) {
      return super.copy(source), this.depthPacking = source.depthPacking, this.map = source.map, this.alphaMap = source.alphaMap, this.displacementMap = source.displacementMap, this.displacementScale = source.displacementScale, this.displacementBias = source.displacementBias, this.wireframe = source.wireframe, this.wireframeLinewidth = source.wireframeLinewidth, this;
    }
  }, MeshDistanceMaterial = class extends Material {
    constructor(parameters) {
      super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(parameters);
    }
    copy(source) {
      return super.copy(source), this.map = source.map, this.alphaMap = source.alphaMap, this.displacementMap = source.displacementMap, this.displacementScale = source.displacementScale, this.displacementBias = source.displacementBias, this;
    }
  }, vertex = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, fragment = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
  function WebGLShadowMap(renderer, objects, capabilities) {
    let _frustum = new Frustum(), _shadowMapSize = new Vector2(), _viewportSize = new Vector2(), _viewport = new Vector4(), _depthMaterial = new MeshDepthMaterial({ depthPacking: RGBADepthPacking }), _distanceMaterial = new MeshDistanceMaterial(), _materialCache = {}, _maxTextureSize = capabilities.maxTextureSize, shadowSide = { [FrontSide]: BackSide, [BackSide]: FrontSide, [DoubleSide]: DoubleSide }, shadowMaterialVertical = new ShaderMaterial({
      defines: {
        VSM_SAMPLES: 8
      },
      uniforms: {
        shadow_pass: { value: null },
        resolution: { value: new Vector2() },
        radius: { value: 4 }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    }), shadowMaterialHorizontal = shadowMaterialVertical.clone();
    shadowMaterialHorizontal.defines.HORIZONTAL_PASS = 1;
    let fullScreenTri = new BufferGeometry();
    fullScreenTri.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
        3
      )
    );
    let fullScreenMesh = new Mesh(fullScreenTri, shadowMaterialVertical), scope = this;
    this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = PCFShadowMap;
    let _previousType = this.type;
    this.render = function(lights, scene, camera) {
      if (scope.enabled === !1 || scope.autoUpdate === !1 && scope.needsUpdate === !1 || lights.length === 0) return;
      let currentRenderTarget = renderer.getRenderTarget(), activeCubeFace = renderer.getActiveCubeFace(), activeMipmapLevel = renderer.getActiveMipmapLevel(), _state = renderer.state;
      _state.setBlending(NoBlending), _state.buffers.color.setClear(1, 1, 1, 1), _state.buffers.depth.setTest(!0), _state.setScissorTest(!1);
      let toVSM = _previousType !== VSMShadowMap && this.type === VSMShadowMap, fromVSM = _previousType === VSMShadowMap && this.type !== VSMShadowMap;
      for (let i = 0, il = lights.length; i < il; i++) {
        let light = lights[i], shadow = light.shadow;
        if (shadow === void 0) {
          console.warn("THREE.WebGLShadowMap:", light, "has no shadow.");
          continue;
        }
        if (shadow.autoUpdate === !1 && shadow.needsUpdate === !1) continue;
        _shadowMapSize.copy(shadow.mapSize);
        let shadowFrameExtents = shadow.getFrameExtents();
        if (_shadowMapSize.multiply(shadowFrameExtents), _viewportSize.copy(shadow.mapSize), (_shadowMapSize.x > _maxTextureSize || _shadowMapSize.y > _maxTextureSize) && (_shadowMapSize.x > _maxTextureSize && (_viewportSize.x = Math.floor(_maxTextureSize / shadowFrameExtents.x), _shadowMapSize.x = _viewportSize.x * shadowFrameExtents.x, shadow.mapSize.x = _viewportSize.x), _shadowMapSize.y > _maxTextureSize && (_viewportSize.y = Math.floor(_maxTextureSize / shadowFrameExtents.y), _shadowMapSize.y = _viewportSize.y * shadowFrameExtents.y, shadow.mapSize.y = _viewportSize.y)), shadow.map === null || toVSM === !0 || fromVSM === !0) {
          let pars = this.type !== VSMShadowMap ? { minFilter: NearestFilter, magFilter: NearestFilter } : {};
          shadow.map !== null && shadow.map.dispose(), shadow.map = new WebGLRenderTarget(_shadowMapSize.x, _shadowMapSize.y, pars), shadow.map.texture.name = light.name + ".shadowMap", shadow.camera.updateProjectionMatrix();
        }
        renderer.setRenderTarget(shadow.map), renderer.clear();
        let viewportCount = shadow.getViewportCount();
        for (let vp = 0; vp < viewportCount; vp++) {
          let viewport = shadow.getViewport(vp);
          _viewport.set(
            _viewportSize.x * viewport.x,
            _viewportSize.y * viewport.y,
            _viewportSize.x * viewport.z,
            _viewportSize.y * viewport.w
          ), _state.viewport(_viewport), shadow.updateMatrices(light, vp), _frustum = shadow.getFrustum(), renderObject(scene, camera, shadow.camera, light, this.type);
        }
        shadow.isPointLightShadow !== !0 && this.type === VSMShadowMap && VSMPass(shadow, camera), shadow.needsUpdate = !1;
      }
      _previousType = this.type, scope.needsUpdate = !1, renderer.setRenderTarget(currentRenderTarget, activeCubeFace, activeMipmapLevel);
    };
    function VSMPass(shadow, camera) {
      let geometry = objects.update(fullScreenMesh);
      shadowMaterialVertical.defines.VSM_SAMPLES !== shadow.blurSamples && (shadowMaterialVertical.defines.VSM_SAMPLES = shadow.blurSamples, shadowMaterialHorizontal.defines.VSM_SAMPLES = shadow.blurSamples, shadowMaterialVertical.needsUpdate = !0, shadowMaterialHorizontal.needsUpdate = !0), shadow.mapPass === null && (shadow.mapPass = new WebGLRenderTarget(_shadowMapSize.x, _shadowMapSize.y)), shadowMaterialVertical.uniforms.shadow_pass.value = shadow.map.texture, shadowMaterialVertical.uniforms.resolution.value = shadow.mapSize, shadowMaterialVertical.uniforms.radius.value = shadow.radius, renderer.setRenderTarget(shadow.mapPass), renderer.clear(), renderer.renderBufferDirect(camera, null, geometry, shadowMaterialVertical, fullScreenMesh, null), shadowMaterialHorizontal.uniforms.shadow_pass.value = shadow.mapPass.texture, shadowMaterialHorizontal.uniforms.resolution.value = shadow.mapSize, shadowMaterialHorizontal.uniforms.radius.value = shadow.radius, renderer.setRenderTarget(shadow.map), renderer.clear(), renderer.renderBufferDirect(camera, null, geometry, shadowMaterialHorizontal, fullScreenMesh, null);
    }
    function getDepthMaterial(object, material, light, type) {
      let result = null, customMaterial = light.isPointLight === !0 ? object.customDistanceMaterial : object.customDepthMaterial;
      if (customMaterial !== void 0)
        result = customMaterial;
      else if (result = light.isPointLight === !0 ? _distanceMaterial : _depthMaterial, renderer.localClippingEnabled && material.clipShadows === !0 && Array.isArray(material.clippingPlanes) && material.clippingPlanes.length !== 0 || material.displacementMap && material.displacementScale !== 0 || material.alphaMap && material.alphaTest > 0 || material.map && material.alphaTest > 0) {
        let keyA = result.uuid, keyB = material.uuid, materialsForVariant = _materialCache[keyA];
        materialsForVariant === void 0 && (materialsForVariant = {}, _materialCache[keyA] = materialsForVariant);
        let cachedMaterial = materialsForVariant[keyB];
        cachedMaterial === void 0 && (cachedMaterial = result.clone(), materialsForVariant[keyB] = cachedMaterial, material.addEventListener("dispose", onMaterialDispose)), result = cachedMaterial;
      }
      if (result.visible = material.visible, result.wireframe = material.wireframe, type === VSMShadowMap ? result.side = material.shadowSide !== null ? material.shadowSide : material.side : result.side = material.shadowSide !== null ? material.shadowSide : shadowSide[material.side], result.alphaMap = material.alphaMap, result.alphaTest = material.alphaTest, result.map = material.map, result.clipShadows = material.clipShadows, result.clippingPlanes = material.clippingPlanes, result.clipIntersection = material.clipIntersection, result.displacementMap = material.displacementMap, result.displacementScale = material.displacementScale, result.displacementBias = material.displacementBias, result.wireframeLinewidth = material.wireframeLinewidth, result.linewidth = material.linewidth, light.isPointLight === !0 && result.isMeshDistanceMaterial === !0) {
        let materialProperties = renderer.properties.get(result);
        materialProperties.light = light;
      }
      return result;
    }
    function renderObject(object, camera, shadowCamera, light, type) {
      if (object.visible === !1) return;
      if (object.layers.test(camera.layers) && (object.isMesh || object.isLine || object.isPoints) && (object.castShadow || object.receiveShadow && type === VSMShadowMap) && (!object.frustumCulled || _frustum.intersectsObject(object))) {
        object.modelViewMatrix.multiplyMatrices(shadowCamera.matrixWorldInverse, object.matrixWorld);
        let geometry = objects.update(object), material = object.material;
        if (Array.isArray(material)) {
          let groups = geometry.groups;
          for (let k = 0, kl = groups.length; k < kl; k++) {
            let group = groups[k], groupMaterial = material[group.materialIndex];
            if (groupMaterial && groupMaterial.visible) {
              let depthMaterial = getDepthMaterial(object, groupMaterial, light, type);
              object.onBeforeShadow(renderer, object, camera, shadowCamera, geometry, depthMaterial, group), renderer.renderBufferDirect(shadowCamera, null, geometry, depthMaterial, object, group), object.onAfterShadow(renderer, object, camera, shadowCamera, geometry, depthMaterial, group);
            }
          }
        } else if (material.visible) {
          let depthMaterial = getDepthMaterial(object, material, light, type);
          object.onBeforeShadow(renderer, object, camera, shadowCamera, geometry, depthMaterial, null), renderer.renderBufferDirect(shadowCamera, null, geometry, depthMaterial, object, null), object.onAfterShadow(renderer, object, camera, shadowCamera, geometry, depthMaterial, null);
        }
      }
      let children = object.children;
      for (let i = 0, l = children.length; i < l; i++)
        renderObject(children[i], camera, shadowCamera, light, type);
    }
    function onMaterialDispose(event) {
      event.target.removeEventListener("dispose", onMaterialDispose);
      for (let id in _materialCache) {
        let cache = _materialCache[id], uuid = event.target.uuid;
        uuid in cache && (cache[uuid].dispose(), delete cache[uuid]);
      }
    }
  }
  function WebGLState(gl) {
    function ColorBuffer() {
      let locked = !1, color = new Vector4(), currentColorMask = null, currentColorClear = new Vector4(0, 0, 0, 0);
      return {
        setMask: function(colorMask) {
          currentColorMask !== colorMask && !locked && (gl.colorMask(colorMask, colorMask, colorMask, colorMask), currentColorMask = colorMask);
        },
        setLocked: function(lock) {
          locked = lock;
        },
        setClear: function(r, g, b, a, premultipliedAlpha) {
          premultipliedAlpha === !0 && (r *= a, g *= a, b *= a), color.set(r, g, b, a), currentColorClear.equals(color) === !1 && (gl.clearColor(r, g, b, a), currentColorClear.copy(color));
        },
        reset: function() {
          locked = !1, currentColorMask = null, currentColorClear.set(-1, 0, 0, 0);
        }
      };
    }
    function DepthBuffer() {
      let locked = !1, currentDepthMask = null, currentDepthFunc = null, currentDepthClear = null;
      return {
        setTest: function(depthTest) {
          depthTest ? enable(gl.DEPTH_TEST) : disable(gl.DEPTH_TEST);
        },
        setMask: function(depthMask) {
          currentDepthMask !== depthMask && !locked && (gl.depthMask(depthMask), currentDepthMask = depthMask);
        },
        setFunc: function(depthFunc) {
          if (currentDepthFunc !== depthFunc) {
            switch (depthFunc) {
              case NeverDepth:
                gl.depthFunc(gl.NEVER);
                break;
              case AlwaysDepth:
                gl.depthFunc(gl.ALWAYS);
                break;
              case LessDepth:
                gl.depthFunc(gl.LESS);
                break;
              case LessEqualDepth:
                gl.depthFunc(gl.LEQUAL);
                break;
              case EqualDepth:
                gl.depthFunc(gl.EQUAL);
                break;
              case GreaterEqualDepth:
                gl.depthFunc(gl.GEQUAL);
                break;
              case GreaterDepth:
                gl.depthFunc(gl.GREATER);
                break;
              case NotEqualDepth:
                gl.depthFunc(gl.NOTEQUAL);
                break;
              default:
                gl.depthFunc(gl.LEQUAL);
            }
            currentDepthFunc = depthFunc;
          }
        },
        setLocked: function(lock) {
          locked = lock;
        },
        setClear: function(depth) {
          currentDepthClear !== depth && (gl.clearDepth(depth), currentDepthClear = depth);
        },
        reset: function() {
          locked = !1, currentDepthMask = null, currentDepthFunc = null, currentDepthClear = null;
        }
      };
    }
    function StencilBuffer() {
      let locked = !1, currentStencilMask = null, currentStencilFunc = null, currentStencilRef = null, currentStencilFuncMask = null, currentStencilFail = null, currentStencilZFail = null, currentStencilZPass = null, currentStencilClear = null;
      return {
        setTest: function(stencilTest) {
          locked || (stencilTest ? enable(gl.STENCIL_TEST) : disable(gl.STENCIL_TEST));
        },
        setMask: function(stencilMask) {
          currentStencilMask !== stencilMask && !locked && (gl.stencilMask(stencilMask), currentStencilMask = stencilMask);
        },
        setFunc: function(stencilFunc, stencilRef, stencilMask) {
          (currentStencilFunc !== stencilFunc || currentStencilRef !== stencilRef || currentStencilFuncMask !== stencilMask) && (gl.stencilFunc(stencilFunc, stencilRef, stencilMask), currentStencilFunc = stencilFunc, currentStencilRef = stencilRef, currentStencilFuncMask = stencilMask);
        },
        setOp: function(stencilFail, stencilZFail, stencilZPass) {
          (currentStencilFail !== stencilFail || currentStencilZFail !== stencilZFail || currentStencilZPass !== stencilZPass) && (gl.stencilOp(stencilFail, stencilZFail, stencilZPass), currentStencilFail = stencilFail, currentStencilZFail = stencilZFail, currentStencilZPass = stencilZPass);
        },
        setLocked: function(lock) {
          locked = lock;
        },
        setClear: function(stencil) {
          currentStencilClear !== stencil && (gl.clearStencil(stencil), currentStencilClear = stencil);
        },
        reset: function() {
          locked = !1, currentStencilMask = null, currentStencilFunc = null, currentStencilRef = null, currentStencilFuncMask = null, currentStencilFail = null, currentStencilZFail = null, currentStencilZPass = null, currentStencilClear = null;
        }
      };
    }
    let colorBuffer = new ColorBuffer(), depthBuffer = new DepthBuffer(), stencilBuffer = new StencilBuffer(), uboBindings = /* @__PURE__ */ new WeakMap(), uboProgramMap = /* @__PURE__ */ new WeakMap(), enabledCapabilities = {}, currentBoundFramebuffers = {}, currentDrawbuffers = /* @__PURE__ */ new WeakMap(), defaultDrawbuffers = [], currentProgram = null, currentBlendingEnabled = !1, currentBlending = null, currentBlendEquation = null, currentBlendSrc = null, currentBlendDst = null, currentBlendEquationAlpha = null, currentBlendSrcAlpha = null, currentBlendDstAlpha = null, currentBlendColor = new Color(0, 0, 0), currentBlendAlpha = 0, currentPremultipledAlpha = !1, currentFlipSided = null, currentCullFace = null, currentLineWidth = null, currentPolygonOffsetFactor = null, currentPolygonOffsetUnits = null, maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS), lineWidthAvailable = !1, version = 0, glVersion = gl.getParameter(gl.VERSION);
    glVersion.indexOf("WebGL") !== -1 ? (version = parseFloat(/^WebGL (\d)/.exec(glVersion)[1]), lineWidthAvailable = version >= 1) : glVersion.indexOf("OpenGL ES") !== -1 && (version = parseFloat(/^OpenGL ES (\d)/.exec(glVersion)[1]), lineWidthAvailable = version >= 2);
    let currentTextureSlot = null, currentBoundTextures = {}, scissorParam = gl.getParameter(gl.SCISSOR_BOX), viewportParam = gl.getParameter(gl.VIEWPORT), currentScissor = new Vector4().fromArray(scissorParam), currentViewport = new Vector4().fromArray(viewportParam);
    function createTexture(type, target, count, dimensions) {
      let data = new Uint8Array(4), texture = gl.createTexture();
      gl.bindTexture(type, texture), gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.NEAREST), gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      for (let i = 0; i < count; i++)
        type === gl.TEXTURE_3D || type === gl.TEXTURE_2D_ARRAY ? gl.texImage3D(target, 0, gl.RGBA, 1, 1, dimensions, 0, gl.RGBA, gl.UNSIGNED_BYTE, data) : gl.texImage2D(target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      return texture;
    }
    let emptyTextures = {};
    emptyTextures[gl.TEXTURE_2D] = createTexture(gl.TEXTURE_2D, gl.TEXTURE_2D, 1), emptyTextures[gl.TEXTURE_CUBE_MAP] = createTexture(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6), emptyTextures[gl.TEXTURE_2D_ARRAY] = createTexture(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_2D_ARRAY, 1, 1), emptyTextures[gl.TEXTURE_3D] = createTexture(gl.TEXTURE_3D, gl.TEXTURE_3D, 1, 1), colorBuffer.setClear(0, 0, 0, 1), depthBuffer.setClear(1), stencilBuffer.setClear(0), enable(gl.DEPTH_TEST), depthBuffer.setFunc(LessEqualDepth), setFlipSided(!1), setCullFace(CullFaceBack), enable(gl.CULL_FACE), setBlending(NoBlending);
    function enable(id) {
      enabledCapabilities[id] !== !0 && (gl.enable(id), enabledCapabilities[id] = !0);
    }
    function disable(id) {
      enabledCapabilities[id] !== !1 && (gl.disable(id), enabledCapabilities[id] = !1);
    }
    function bindFramebuffer(target, framebuffer) {
      return currentBoundFramebuffers[target] !== framebuffer ? (gl.bindFramebuffer(target, framebuffer), currentBoundFramebuffers[target] = framebuffer, target === gl.DRAW_FRAMEBUFFER && (currentBoundFramebuffers[gl.FRAMEBUFFER] = framebuffer), target === gl.FRAMEBUFFER && (currentBoundFramebuffers[gl.DRAW_FRAMEBUFFER] = framebuffer), !0) : !1;
    }
    function drawBuffers(renderTarget, framebuffer) {
      let drawBuffers2 = defaultDrawbuffers, needsUpdate = !1;
      if (renderTarget) {
        drawBuffers2 = currentDrawbuffers.get(framebuffer), drawBuffers2 === void 0 && (drawBuffers2 = [], currentDrawbuffers.set(framebuffer, drawBuffers2));
        let textures = renderTarget.textures;
        if (drawBuffers2.length !== textures.length || drawBuffers2[0] !== gl.COLOR_ATTACHMENT0) {
          for (let i = 0, il = textures.length; i < il; i++)
            drawBuffers2[i] = gl.COLOR_ATTACHMENT0 + i;
          drawBuffers2.length = textures.length, needsUpdate = !0;
        }
      } else
        drawBuffers2[0] !== gl.BACK && (drawBuffers2[0] = gl.BACK, needsUpdate = !0);
      needsUpdate && gl.drawBuffers(drawBuffers2);
    }
    function useProgram(program) {
      return currentProgram !== program ? (gl.useProgram(program), currentProgram = program, !0) : !1;
    }
    let equationToGL = {
      [AddEquation]: gl.FUNC_ADD,
      [SubtractEquation]: gl.FUNC_SUBTRACT,
      [ReverseSubtractEquation]: gl.FUNC_REVERSE_SUBTRACT
    };
    equationToGL[MinEquation] = gl.MIN, equationToGL[MaxEquation] = gl.MAX;
    let factorToGL = {
      [ZeroFactor]: gl.ZERO,
      [OneFactor]: gl.ONE,
      [SrcColorFactor]: gl.SRC_COLOR,
      [SrcAlphaFactor]: gl.SRC_ALPHA,
      [SrcAlphaSaturateFactor]: gl.SRC_ALPHA_SATURATE,
      [DstColorFactor]: gl.DST_COLOR,
      [DstAlphaFactor]: gl.DST_ALPHA,
      [OneMinusSrcColorFactor]: gl.ONE_MINUS_SRC_COLOR,
      [OneMinusSrcAlphaFactor]: gl.ONE_MINUS_SRC_ALPHA,
      [OneMinusDstColorFactor]: gl.ONE_MINUS_DST_COLOR,
      [OneMinusDstAlphaFactor]: gl.ONE_MINUS_DST_ALPHA,
      [ConstantColorFactor]: gl.CONSTANT_COLOR,
      [OneMinusConstantColorFactor]: gl.ONE_MINUS_CONSTANT_COLOR,
      [ConstantAlphaFactor]: gl.CONSTANT_ALPHA,
      [OneMinusConstantAlphaFactor]: gl.ONE_MINUS_CONSTANT_ALPHA
    };
    function setBlending(blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, blendColor, blendAlpha, premultipliedAlpha) {
      if (blending === NoBlending) {
        currentBlendingEnabled === !0 && (disable(gl.BLEND), currentBlendingEnabled = !1);
        return;
      }
      if (currentBlendingEnabled === !1 && (enable(gl.BLEND), currentBlendingEnabled = !0), blending !== CustomBlending) {
        if (blending !== currentBlending || premultipliedAlpha !== currentPremultipledAlpha) {
          if ((currentBlendEquation !== AddEquation || currentBlendEquationAlpha !== AddEquation) && (gl.blendEquation(gl.FUNC_ADD), currentBlendEquation = AddEquation, currentBlendEquationAlpha = AddEquation), premultipliedAlpha)
            switch (blending) {
              case NormalBlending:
                gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                break;
              case AdditiveBlending:
                gl.blendFunc(gl.ONE, gl.ONE);
                break;
              case SubtractiveBlending:
                gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
                break;
              case MultiplyBlending:
                gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
                break;
              default:
                console.error("THREE.WebGLState: Invalid blending: ", blending);
                break;
            }
          else
            switch (blending) {
              case NormalBlending:
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                break;
              case AdditiveBlending:
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                break;
              case SubtractiveBlending:
                gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
                break;
              case MultiplyBlending:
                gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
                break;
              default:
                console.error("THREE.WebGLState: Invalid blending: ", blending);
                break;
            }
          currentBlendSrc = null, currentBlendDst = null, currentBlendSrcAlpha = null, currentBlendDstAlpha = null, currentBlendColor.set(0, 0, 0), currentBlendAlpha = 0, currentBlending = blending, currentPremultipledAlpha = premultipliedAlpha;
        }
        return;
      }
      blendEquationAlpha = blendEquationAlpha || blendEquation, blendSrcAlpha = blendSrcAlpha || blendSrc, blendDstAlpha = blendDstAlpha || blendDst, (blendEquation !== currentBlendEquation || blendEquationAlpha !== currentBlendEquationAlpha) && (gl.blendEquationSeparate(equationToGL[blendEquation], equationToGL[blendEquationAlpha]), currentBlendEquation = blendEquation, currentBlendEquationAlpha = blendEquationAlpha), (blendSrc !== currentBlendSrc || blendDst !== currentBlendDst || blendSrcAlpha !== currentBlendSrcAlpha || blendDstAlpha !== currentBlendDstAlpha) && (gl.blendFuncSeparate(factorToGL[blendSrc], factorToGL[blendDst], factorToGL[blendSrcAlpha], factorToGL[blendDstAlpha]), currentBlendSrc = blendSrc, currentBlendDst = blendDst, currentBlendSrcAlpha = blendSrcAlpha, currentBlendDstAlpha = blendDstAlpha), (blendColor.equals(currentBlendColor) === !1 || blendAlpha !== currentBlendAlpha) && (gl.blendColor(blendColor.r, blendColor.g, blendColor.b, blendAlpha), currentBlendColor.copy(blendColor), currentBlendAlpha = blendAlpha), currentBlending = blending, currentPremultipledAlpha = !1;
    }
    function setMaterial(material, frontFaceCW) {
      material.side === DoubleSide ? disable(gl.CULL_FACE) : enable(gl.CULL_FACE);
      let flipSided = material.side === BackSide;
      frontFaceCW && (flipSided = !flipSided), setFlipSided(flipSided), material.blending === NormalBlending && material.transparent === !1 ? setBlending(NoBlending) : setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.blendColor, material.blendAlpha, material.premultipliedAlpha), depthBuffer.setFunc(material.depthFunc), depthBuffer.setTest(material.depthTest), depthBuffer.setMask(material.depthWrite), colorBuffer.setMask(material.colorWrite);
      let stencilWrite = material.stencilWrite;
      stencilBuffer.setTest(stencilWrite), stencilWrite && (stencilBuffer.setMask(material.stencilWriteMask), stencilBuffer.setFunc(material.stencilFunc, material.stencilRef, material.stencilFuncMask), stencilBuffer.setOp(material.stencilFail, material.stencilZFail, material.stencilZPass)), setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits), material.alphaToCoverage === !0 ? enable(gl.SAMPLE_ALPHA_TO_COVERAGE) : disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    }
    function setFlipSided(flipSided) {
      currentFlipSided !== flipSided && (flipSided ? gl.frontFace(gl.CW) : gl.frontFace(gl.CCW), currentFlipSided = flipSided);
    }
    function setCullFace(cullFace) {
      cullFace !== CullFaceNone ? (enable(gl.CULL_FACE), cullFace !== currentCullFace && (cullFace === CullFaceBack ? gl.cullFace(gl.BACK) : cullFace === CullFaceFront ? gl.cullFace(gl.FRONT) : gl.cullFace(gl.FRONT_AND_BACK))) : disable(gl.CULL_FACE), currentCullFace = cullFace;
    }
    function setLineWidth(width) {
      width !== currentLineWidth && (lineWidthAvailable && gl.lineWidth(width), currentLineWidth = width);
    }
    function setPolygonOffset(polygonOffset, factor, units) {
      polygonOffset ? (enable(gl.POLYGON_OFFSET_FILL), (currentPolygonOffsetFactor !== factor || currentPolygonOffsetUnits !== units) && (gl.polygonOffset(factor, units), currentPolygonOffsetFactor = factor, currentPolygonOffsetUnits = units)) : disable(gl.POLYGON_OFFSET_FILL);
    }
    function setScissorTest(scissorTest) {
      scissorTest ? enable(gl.SCISSOR_TEST) : disable(gl.SCISSOR_TEST);
    }
    function activeTexture(webglSlot) {
      webglSlot === void 0 && (webglSlot = gl.TEXTURE0 + maxTextures - 1), currentTextureSlot !== webglSlot && (gl.activeTexture(webglSlot), currentTextureSlot = webglSlot);
    }
    function bindTexture(webglType, webglTexture, webglSlot) {
      webglSlot === void 0 && (currentTextureSlot === null ? webglSlot = gl.TEXTURE0 + maxTextures - 1 : webglSlot = currentTextureSlot);
      let boundTexture = currentBoundTextures[webglSlot];
      boundTexture === void 0 && (boundTexture = { type: void 0, texture: void 0 }, currentBoundTextures[webglSlot] = boundTexture), (boundTexture.type !== webglType || boundTexture.texture !== webglTexture) && (currentTextureSlot !== webglSlot && (gl.activeTexture(webglSlot), currentTextureSlot = webglSlot), gl.bindTexture(webglType, webglTexture || emptyTextures[webglType]), boundTexture.type = webglType, boundTexture.texture = webglTexture);
    }
    function unbindTexture() {
      let boundTexture = currentBoundTextures[currentTextureSlot];
      boundTexture !== void 0 && boundTexture.type !== void 0 && (gl.bindTexture(boundTexture.type, null), boundTexture.type = void 0, boundTexture.texture = void 0);
    }
    function compressedTexImage2D() {
      try {
        gl.compressedTexImage2D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function compressedTexImage3D() {
      try {
        gl.compressedTexImage3D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function texSubImage2D() {
      try {
        gl.texSubImage2D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function texSubImage3D() {
      try {
        gl.texSubImage3D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function compressedTexSubImage2D() {
      try {
        gl.compressedTexSubImage2D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function compressedTexSubImage3D() {
      try {
        gl.compressedTexSubImage3D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function texStorage2D() {
      try {
        gl.texStorage2D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function texStorage3D() {
      try {
        gl.texStorage3D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function texImage2D() {
      try {
        gl.texImage2D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function texImage3D() {
      try {
        gl.texImage3D.apply(gl, arguments);
      } catch (error) {
        console.error("THREE.WebGLState:", error);
      }
    }
    function scissor(scissor2) {
      currentScissor.equals(scissor2) === !1 && (gl.scissor(scissor2.x, scissor2.y, scissor2.z, scissor2.w), currentScissor.copy(scissor2));
    }
    function viewport(viewport2) {
      currentViewport.equals(viewport2) === !1 && (gl.viewport(viewport2.x, viewport2.y, viewport2.z, viewport2.w), currentViewport.copy(viewport2));
    }
    function updateUBOMapping(uniformsGroup, program) {
      let mapping = uboProgramMap.get(program);
      mapping === void 0 && (mapping = /* @__PURE__ */ new WeakMap(), uboProgramMap.set(program, mapping));
      let blockIndex = mapping.get(uniformsGroup);
      blockIndex === void 0 && (blockIndex = gl.getUniformBlockIndex(program, uniformsGroup.name), mapping.set(uniformsGroup, blockIndex));
    }
    function uniformBlockBinding(uniformsGroup, program) {
      let blockIndex = uboProgramMap.get(program).get(uniformsGroup);
      uboBindings.get(program) !== blockIndex && (gl.uniformBlockBinding(program, blockIndex, uniformsGroup.__bindingPointIndex), uboBindings.set(program, blockIndex));
    }
    function reset() {
      gl.disable(gl.BLEND), gl.disable(gl.CULL_FACE), gl.disable(gl.DEPTH_TEST), gl.disable(gl.POLYGON_OFFSET_FILL), gl.disable(gl.SCISSOR_TEST), gl.disable(gl.STENCIL_TEST), gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE), gl.blendEquation(gl.FUNC_ADD), gl.blendFunc(gl.ONE, gl.ZERO), gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO), gl.blendColor(0, 0, 0, 0), gl.colorMask(!0, !0, !0, !0), gl.clearColor(0, 0, 0, 0), gl.depthMask(!0), gl.depthFunc(gl.LESS), gl.clearDepth(1), gl.stencilMask(4294967295), gl.stencilFunc(gl.ALWAYS, 0, 4294967295), gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP), gl.clearStencil(0), gl.cullFace(gl.BACK), gl.frontFace(gl.CCW), gl.polygonOffset(0, 0), gl.activeTexture(gl.TEXTURE0), gl.bindFramebuffer(gl.FRAMEBUFFER, null), gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null), gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null), gl.useProgram(null), gl.lineWidth(1), gl.scissor(0, 0, gl.canvas.width, gl.canvas.height), gl.viewport(0, 0, gl.canvas.width, gl.canvas.height), enabledCapabilities = {}, currentTextureSlot = null, currentBoundTextures = {}, currentBoundFramebuffers = {}, currentDrawbuffers = /* @__PURE__ */ new WeakMap(), defaultDrawbuffers = [], currentProgram = null, currentBlendingEnabled = !1, currentBlending = null, currentBlendEquation = null, currentBlendSrc = null, currentBlendDst = null, currentBlendEquationAlpha = null, currentBlendSrcAlpha = null, currentBlendDstAlpha = null, currentBlendColor = new Color(0, 0, 0), currentBlendAlpha = 0, currentPremultipledAlpha = !1, currentFlipSided = null, currentCullFace = null, currentLineWidth = null, currentPolygonOffsetFactor = null, currentPolygonOffsetUnits = null, currentScissor.set(0, 0, gl.canvas.width, gl.canvas.height), currentViewport.set(0, 0, gl.canvas.width, gl.canvas.height), colorBuffer.reset(), depthBuffer.reset(), stencilBuffer.reset();
    }
    return {
      buffers: {
        color: colorBuffer,
        depth: depthBuffer,
        stencil: stencilBuffer
      },
      enable,
      disable,
      bindFramebuffer,
      drawBuffers,
      useProgram,
      setBlending,
      setMaterial,
      setFlipSided,
      setCullFace,
      setLineWidth,
      setPolygonOffset,
      setScissorTest,
      activeTexture,
      bindTexture,
      unbindTexture,
      compressedTexImage2D,
      compressedTexImage3D,
      texImage2D,
      texImage3D,
      updateUBOMapping,
      uniformBlockBinding,
      texStorage2D,
      texStorage3D,
      texSubImage2D,
      texSubImage3D,
      compressedTexSubImage2D,
      compressedTexSubImage3D,
      scissor,
      viewport,
      reset
    };
  }
  function getByteLength(width, height, format, type) {
    let typeByteLength = getTextureTypeByteLength(type);
    switch (format) {
      case AlphaFormat:
        return width * height;
      case LuminanceFormat:
        return width * height;
      case LuminanceAlphaFormat:
        return width * height * 2;
      case RedFormat:
        return width * height / typeByteLength.components * typeByteLength.byteLength;
      case RedIntegerFormat:
        return width * height / typeByteLength.components * typeByteLength.byteLength;
      case RGFormat:
        return width * height * 2 / typeByteLength.components * typeByteLength.byteLength;
      case RGIntegerFormat:
        return width * height * 2 / typeByteLength.components * typeByteLength.byteLength;
      case RGBFormat:
        return width * height * 3 / typeByteLength.components * typeByteLength.byteLength;
      case RGBAFormat:
        return width * height * 4 / typeByteLength.components * typeByteLength.byteLength;
      case RGBAIntegerFormat:
        return width * height * 4 / typeByteLength.components * typeByteLength.byteLength;
      case RGB_S3TC_DXT1_Format:
      case RGBA_S3TC_DXT1_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
      case RGBA_S3TC_DXT3_Format:
      case RGBA_S3TC_DXT5_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
      case RGB_PVRTC_2BPPV1_Format:
      case RGBA_PVRTC_2BPPV1_Format:
        return Math.max(width, 16) * Math.max(height, 8) / 4;
      case RGB_PVRTC_4BPPV1_Format:
      case RGBA_PVRTC_4BPPV1_Format:
        return Math.max(width, 8) * Math.max(height, 8) / 2;
      case RGB_ETC1_Format:
      case RGB_ETC2_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
      case RGBA_ETC2_EAC_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
      case RGBA_ASTC_4x4_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
      case RGBA_ASTC_5x4_Format:
        return Math.floor((width + 4) / 5) * Math.floor((height + 3) / 4) * 16;
      case RGBA_ASTC_5x5_Format:
        return Math.floor((width + 4) / 5) * Math.floor((height + 4) / 5) * 16;
      case RGBA_ASTC_6x5_Format:
        return Math.floor((width + 5) / 6) * Math.floor((height + 4) / 5) * 16;
      case RGBA_ASTC_6x6_Format:
        return Math.floor((width + 5) / 6) * Math.floor((height + 5) / 6) * 16;
      case RGBA_ASTC_8x5_Format:
        return Math.floor((width + 7) / 8) * Math.floor((height + 4) / 5) * 16;
      case RGBA_ASTC_8x6_Format:
        return Math.floor((width + 7) / 8) * Math.floor((height + 5) / 6) * 16;
      case RGBA_ASTC_8x8_Format:
        return Math.floor((width + 7) / 8) * Math.floor((height + 7) / 8) * 16;
      case RGBA_ASTC_10x5_Format:
        return Math.floor((width + 9) / 10) * Math.floor((height + 4) / 5) * 16;
      case RGBA_ASTC_10x6_Format:
        return Math.floor((width + 9) / 10) * Math.floor((height + 5) / 6) * 16;
      case RGBA_ASTC_10x8_Format:
        return Math.floor((width + 9) / 10) * Math.floor((height + 7) / 8) * 16;
      case RGBA_ASTC_10x10_Format:
        return Math.floor((width + 9) / 10) * Math.floor((height + 9) / 10) * 16;
      case RGBA_ASTC_12x10_Format:
        return Math.floor((width + 11) / 12) * Math.floor((height + 9) / 10) * 16;
      case RGBA_ASTC_12x12_Format:
        return Math.floor((width + 11) / 12) * Math.floor((height + 11) / 12) * 16;
      case RGBA_BPTC_Format:
      case RGB_BPTC_SIGNED_Format:
      case RGB_BPTC_UNSIGNED_Format:
        return Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
      case RED_RGTC1_Format:
      case SIGNED_RED_RGTC1_Format:
        return Math.ceil(width / 4) * Math.ceil(height / 4) * 8;
      case RED_GREEN_RGTC2_Format:
      case SIGNED_RED_GREEN_RGTC2_Format:
        return Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
    }
    throw new Error(
      `Unable to determine texture byte length for ${format} format.`
    );
  }
  function getTextureTypeByteLength(type) {
    switch (type) {
      case UnsignedByteType:
      case ByteType:
        return { byteLength: 1, components: 1 };
      case UnsignedShortType:
      case ShortType:
      case HalfFloatType:
        return { byteLength: 2, components: 1 };
      case UnsignedShort4444Type:
      case UnsignedShort5551Type:
        return { byteLength: 2, components: 4 };
      case UnsignedIntType:
      case IntType:
      case FloatType:
        return { byteLength: 4, components: 1 };
      case UnsignedInt5999Type:
        return { byteLength: 4, components: 3 };
    }
    throw new Error(`Unknown texture type ${type}.`);
  }
  function WebGLTextures(_gl, extensions, state, properties, capabilities, utils, info) {
    let multisampledRTTExt = extensions.has("WEBGL_multisampled_render_to_texture") ? extensions.get("WEBGL_multisampled_render_to_texture") : null, supportsInvalidateFramebuffer = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), _imageDimensions = new Vector2(), _videoTextures = /* @__PURE__ */ new WeakMap(), _canvas2, _sources = /* @__PURE__ */ new WeakMap(), useOffscreenCanvas = !1;
    try {
      useOffscreenCanvas = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
    } catch {
    }
    function createCanvas(width, height) {
      return useOffscreenCanvas ? (
        // eslint-disable-next-line compat/compat
        new OffscreenCanvas(width, height)
      ) : createElementNS("canvas");
    }
    function resizeImage(image, needsNewCanvas, maxSize) {
      let scale = 1, dimensions = getDimensions(image);
      if ((dimensions.width > maxSize || dimensions.height > maxSize) && (scale = maxSize / Math.max(dimensions.width, dimensions.height)), scale < 1)
        if (typeof HTMLImageElement < "u" && image instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && image instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && image instanceof ImageBitmap || typeof VideoFrame < "u" && image instanceof VideoFrame) {
          let width = Math.floor(scale * dimensions.width), height = Math.floor(scale * dimensions.height);
          _canvas2 === void 0 && (_canvas2 = createCanvas(width, height));
          let canvas = needsNewCanvas ? createCanvas(width, height) : _canvas2;
          return canvas.width = width, canvas.height = height, canvas.getContext("2d").drawImage(image, 0, 0, width, height), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + dimensions.width + "x" + dimensions.height + ") to (" + width + "x" + height + ")."), canvas;
        } else
          return "data" in image && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + dimensions.width + "x" + dimensions.height + ")."), image;
      return image;
    }
    function textureNeedsGenerateMipmaps(texture) {
      return texture.generateMipmaps && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;
    }
    function generateMipmap(target) {
      _gl.generateMipmap(target);
    }
    function getInternalFormat(internalFormatName, glFormat, glType, colorSpace, forceLinearTransfer = !1) {
      if (internalFormatName !== null) {
        if (_gl[internalFormatName] !== void 0) return _gl[internalFormatName];
        console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + internalFormatName + "'");
      }
      let internalFormat = glFormat;
      if (glFormat === _gl.RED && (glType === _gl.FLOAT && (internalFormat = _gl.R32F), glType === _gl.HALF_FLOAT && (internalFormat = _gl.R16F), glType === _gl.UNSIGNED_BYTE && (internalFormat = _gl.R8)), glFormat === _gl.RED_INTEGER && (glType === _gl.UNSIGNED_BYTE && (internalFormat = _gl.R8UI), glType === _gl.UNSIGNED_SHORT && (internalFormat = _gl.R16UI), glType === _gl.UNSIGNED_INT && (internalFormat = _gl.R32UI), glType === _gl.BYTE && (internalFormat = _gl.R8I), glType === _gl.SHORT && (internalFormat = _gl.R16I), glType === _gl.INT && (internalFormat = _gl.R32I)), glFormat === _gl.RG && (glType === _gl.FLOAT && (internalFormat = _gl.RG32F), glType === _gl.HALF_FLOAT && (internalFormat = _gl.RG16F), glType === _gl.UNSIGNED_BYTE && (internalFormat = _gl.RG8)), glFormat === _gl.RG_INTEGER && (glType === _gl.UNSIGNED_BYTE && (internalFormat = _gl.RG8UI), glType === _gl.UNSIGNED_SHORT && (internalFormat = _gl.RG16UI), glType === _gl.UNSIGNED_INT && (internalFormat = _gl.RG32UI), glType === _gl.BYTE && (internalFormat = _gl.RG8I), glType === _gl.SHORT && (internalFormat = _gl.RG16I), glType === _gl.INT && (internalFormat = _gl.RG32I)), glFormat === _gl.RGB && glType === _gl.UNSIGNED_INT_5_9_9_9_REV && (internalFormat = _gl.RGB9_E5), glFormat === _gl.RGBA) {
        let transfer = forceLinearTransfer ? LinearTransfer : ColorManagement.getTransfer(colorSpace);
        glType === _gl.FLOAT && (internalFormat = _gl.RGBA32F), glType === _gl.HALF_FLOAT && (internalFormat = _gl.RGBA16F), glType === _gl.UNSIGNED_BYTE && (internalFormat = transfer === SRGBTransfer ? _gl.SRGB8_ALPHA8 : _gl.RGBA8), glType === _gl.UNSIGNED_SHORT_4_4_4_4 && (internalFormat = _gl.RGBA4), glType === _gl.UNSIGNED_SHORT_5_5_5_1 && (internalFormat = _gl.RGB5_A1);
      }
      return (internalFormat === _gl.R16F || internalFormat === _gl.R32F || internalFormat === _gl.RG16F || internalFormat === _gl.RG32F || internalFormat === _gl.RGBA16F || internalFormat === _gl.RGBA32F) && extensions.get("EXT_color_buffer_float"), internalFormat;
    }
    function getInternalDepthFormat(useStencil, depthType) {
      let glInternalFormat;
      return useStencil ? depthType === null || depthType === UnsignedIntType || depthType === UnsignedInt248Type ? glInternalFormat = _gl.DEPTH24_STENCIL8 : depthType === FloatType ? glInternalFormat = _gl.DEPTH32F_STENCIL8 : depthType === UnsignedShortType && (glInternalFormat = _gl.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : depthType === null || depthType === UnsignedIntType || depthType === UnsignedInt248Type ? glInternalFormat = _gl.DEPTH_COMPONENT24 : depthType === FloatType ? glInternalFormat = _gl.DEPTH_COMPONENT32F : depthType === UnsignedShortType && (glInternalFormat = _gl.DEPTH_COMPONENT16), glInternalFormat;
    }
    function getMipLevels(texture, image) {
      return textureNeedsGenerateMipmaps(texture) === !0 || texture.isFramebufferTexture && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter ? Math.log2(Math.max(image.width, image.height)) + 1 : texture.mipmaps !== void 0 && texture.mipmaps.length > 0 ? texture.mipmaps.length : texture.isCompressedTexture && Array.isArray(texture.image) ? image.mipmaps.length : 1;
    }
    function onTextureDispose(event) {
      let texture = event.target;
      texture.removeEventListener("dispose", onTextureDispose), deallocateTexture(texture), texture.isVideoTexture && _videoTextures.delete(texture);
    }
    function onRenderTargetDispose(event) {
      let renderTarget = event.target;
      renderTarget.removeEventListener("dispose", onRenderTargetDispose), deallocateRenderTarget(renderTarget);
    }
    function deallocateTexture(texture) {
      let textureProperties = properties.get(texture);
      if (textureProperties.__webglInit === void 0) return;
      let source = texture.source, webglTextures = _sources.get(source);
      if (webglTextures) {
        let webglTexture = webglTextures[textureProperties.__cacheKey];
        webglTexture.usedTimes--, webglTexture.usedTimes === 0 && deleteTexture(texture), Object.keys(webglTextures).length === 0 && _sources.delete(source);
      }
      properties.remove(texture);
    }
    function deleteTexture(texture) {
      let textureProperties = properties.get(texture);
      _gl.deleteTexture(textureProperties.__webglTexture);
      let source = texture.source, webglTextures = _sources.get(source);
      delete webglTextures[textureProperties.__cacheKey], info.memory.textures--;
    }
    function deallocateRenderTarget(renderTarget) {
      let renderTargetProperties = properties.get(renderTarget);
      if (renderTarget.depthTexture && renderTarget.depthTexture.dispose(), renderTarget.isWebGLCubeRenderTarget)
        for (let i = 0; i < 6; i++) {
          if (Array.isArray(renderTargetProperties.__webglFramebuffer[i]))
            for (let level = 0; level < renderTargetProperties.__webglFramebuffer[i].length; level++) _gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i][level]);
          else
            _gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i]);
          renderTargetProperties.__webglDepthbuffer && _gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer[i]);
        }
      else {
        if (Array.isArray(renderTargetProperties.__webglFramebuffer))
          for (let level = 0; level < renderTargetProperties.__webglFramebuffer.length; level++) _gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[level]);
        else
          _gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
        if (renderTargetProperties.__webglDepthbuffer && _gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer), renderTargetProperties.__webglMultisampledFramebuffer && _gl.deleteFramebuffer(renderTargetProperties.__webglMultisampledFramebuffer), renderTargetProperties.__webglColorRenderbuffer)
          for (let i = 0; i < renderTargetProperties.__webglColorRenderbuffer.length; i++)
            renderTargetProperties.__webglColorRenderbuffer[i] && _gl.deleteRenderbuffer(renderTargetProperties.__webglColorRenderbuffer[i]);
        renderTargetProperties.__webglDepthRenderbuffer && _gl.deleteRenderbuffer(renderTargetProperties.__webglDepthRenderbuffer);
      }
      let textures = renderTarget.textures;
      for (let i = 0, il = textures.length; i < il; i++) {
        let attachmentProperties = properties.get(textures[i]);
        attachmentProperties.__webglTexture && (_gl.deleteTexture(attachmentProperties.__webglTexture), info.memory.textures--), properties.remove(textures[i]);
      }
      properties.remove(renderTarget);
    }
    let textureUnits = 0;
    function resetTextureUnits() {
      textureUnits = 0;
    }
    function allocateTextureUnit() {
      let textureUnit = textureUnits;
      return textureUnit >= capabilities.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + textureUnit + " texture units while this GPU supports only " + capabilities.maxTextures), textureUnits += 1, textureUnit;
    }
    function getTextureCacheKey(texture) {
      let array = [];
      return array.push(texture.wrapS), array.push(texture.wrapT), array.push(texture.wrapR || 0), array.push(texture.magFilter), array.push(texture.minFilter), array.push(texture.anisotropy), array.push(texture.internalFormat), array.push(texture.format), array.push(texture.type), array.push(texture.generateMipmaps), array.push(texture.premultiplyAlpha), array.push(texture.flipY), array.push(texture.unpackAlignment), array.push(texture.colorSpace), array.join();
    }
    function setTexture2D(texture, slot) {
      let textureProperties = properties.get(texture);
      if (texture.isVideoTexture && updateVideoTexture(texture), texture.isRenderTargetTexture === !1 && texture.version > 0 && textureProperties.__version !== texture.version) {
        let image = texture.image;
        if (image === null)
          console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
        else if (image.complete === !1)
          console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
        else {
          uploadTexture(textureProperties, texture, slot);
          return;
        }
      }
      state.bindTexture(_gl.TEXTURE_2D, textureProperties.__webglTexture, _gl.TEXTURE0 + slot);
    }
    function setTexture2DArray(texture, slot) {
      let textureProperties = properties.get(texture);
      if (texture.version > 0 && textureProperties.__version !== texture.version) {
        uploadTexture(textureProperties, texture, slot);
        return;
      }
      state.bindTexture(_gl.TEXTURE_2D_ARRAY, textureProperties.__webglTexture, _gl.TEXTURE0 + slot);
    }
    function setTexture3D(texture, slot) {
      let textureProperties = properties.get(texture);
      if (texture.version > 0 && textureProperties.__version !== texture.version) {
        uploadTexture(textureProperties, texture, slot);
        return;
      }
      state.bindTexture(_gl.TEXTURE_3D, textureProperties.__webglTexture, _gl.TEXTURE0 + slot);
    }
    function setTextureCube(texture, slot) {
      let textureProperties = properties.get(texture);
      if (texture.version > 0 && textureProperties.__version !== texture.version) {
        uploadCubeTexture(textureProperties, texture, slot);
        return;
      }
      state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture, _gl.TEXTURE0 + slot);
    }
    let wrappingToGL = {
      [RepeatWrapping]: _gl.REPEAT,
      [ClampToEdgeWrapping]: _gl.CLAMP_TO_EDGE,
      [MirroredRepeatWrapping]: _gl.MIRRORED_REPEAT
    }, filterToGL = {
      [NearestFilter]: _gl.NEAREST,
      [NearestMipmapNearestFilter]: _gl.NEAREST_MIPMAP_NEAREST,
      [NearestMipmapLinearFilter]: _gl.NEAREST_MIPMAP_LINEAR,
      [LinearFilter]: _gl.LINEAR,
      [LinearMipmapNearestFilter]: _gl.LINEAR_MIPMAP_NEAREST,
      [LinearMipmapLinearFilter]: _gl.LINEAR_MIPMAP_LINEAR
    }, compareToGL = {
      [NeverCompare]: _gl.NEVER,
      [AlwaysCompare]: _gl.ALWAYS,
      [LessCompare]: _gl.LESS,
      [LessEqualCompare]: _gl.LEQUAL,
      [EqualCompare]: _gl.EQUAL,
      [GreaterEqualCompare]: _gl.GEQUAL,
      [GreaterCompare]: _gl.GREATER,
      [NotEqualCompare]: _gl.NOTEQUAL
    };
    function setTextureParameters(textureType, texture) {
      if (texture.type === FloatType && extensions.has("OES_texture_float_linear") === !1 && (texture.magFilter === LinearFilter || texture.magFilter === LinearMipmapNearestFilter || texture.magFilter === NearestMipmapLinearFilter || texture.magFilter === LinearMipmapLinearFilter || texture.minFilter === LinearFilter || texture.minFilter === LinearMipmapNearestFilter || texture.minFilter === NearestMipmapLinearFilter || texture.minFilter === LinearMipmapLinearFilter) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_S, wrappingToGL[texture.wrapS]), _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_T, wrappingToGL[texture.wrapT]), (textureType === _gl.TEXTURE_3D || textureType === _gl.TEXTURE_2D_ARRAY) && _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_R, wrappingToGL[texture.wrapR]), _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, filterToGL[texture.magFilter]), _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, filterToGL[texture.minFilter]), texture.compareFunction && (_gl.texParameteri(textureType, _gl.TEXTURE_COMPARE_MODE, _gl.COMPARE_REF_TO_TEXTURE), _gl.texParameteri(textureType, _gl.TEXTURE_COMPARE_FUNC, compareToGL[texture.compareFunction])), extensions.has("EXT_texture_filter_anisotropic") === !0) {
        if (texture.magFilter === NearestFilter || texture.minFilter !== NearestMipmapLinearFilter && texture.minFilter !== LinearMipmapLinearFilter || texture.type === FloatType && extensions.has("OES_texture_float_linear") === !1) return;
        if (texture.anisotropy > 1 || properties.get(texture).__currentAnisotropy) {
          let extension = extensions.get("EXT_texture_filter_anisotropic");
          _gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, capabilities.getMaxAnisotropy())), properties.get(texture).__currentAnisotropy = texture.anisotropy;
        }
      }
    }
    function initTexture(textureProperties, texture) {
      let forceUpload = !1;
      textureProperties.__webglInit === void 0 && (textureProperties.__webglInit = !0, texture.addEventListener("dispose", onTextureDispose));
      let source = texture.source, webglTextures = _sources.get(source);
      webglTextures === void 0 && (webglTextures = {}, _sources.set(source, webglTextures));
      let textureCacheKey = getTextureCacheKey(texture);
      if (textureCacheKey !== textureProperties.__cacheKey) {
        webglTextures[textureCacheKey] === void 0 && (webglTextures[textureCacheKey] = {
          texture: _gl.createTexture(),
          usedTimes: 0
        }, info.memory.textures++, forceUpload = !0), webglTextures[textureCacheKey].usedTimes++;
        let webglTexture = webglTextures[textureProperties.__cacheKey];
        webglTexture !== void 0 && (webglTextures[textureProperties.__cacheKey].usedTimes--, webglTexture.usedTimes === 0 && deleteTexture(texture)), textureProperties.__cacheKey = textureCacheKey, textureProperties.__webglTexture = webglTextures[textureCacheKey].texture;
      }
      return forceUpload;
    }
    function uploadTexture(textureProperties, texture, slot) {
      let textureType = _gl.TEXTURE_2D;
      (texture.isDataArrayTexture || texture.isCompressedArrayTexture) && (textureType = _gl.TEXTURE_2D_ARRAY), texture.isData3DTexture && (textureType = _gl.TEXTURE_3D);
      let forceUpload = initTexture(textureProperties, texture), source = texture.source;
      state.bindTexture(textureType, textureProperties.__webglTexture, _gl.TEXTURE0 + slot);
      let sourceProperties = properties.get(source);
      if (source.version !== sourceProperties.__version || forceUpload === !0) {
        state.activeTexture(_gl.TEXTURE0 + slot);
        let workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace), texturePrimaries = texture.colorSpace === NoColorSpace ? null : ColorManagement.getPrimaries(texture.colorSpace), unpackConversion = texture.colorSpace === NoColorSpace || workingPrimaries === texturePrimaries ? _gl.NONE : _gl.BROWSER_DEFAULT_WEBGL;
        _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, texture.flipY), _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha), _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, texture.unpackAlignment), _gl.pixelStorei(_gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, unpackConversion);
        let image = resizeImage(texture.image, !1, capabilities.maxTextureSize);
        image = verifyColorSpace(texture, image);
        let glFormat = utils.convert(texture.format, texture.colorSpace), glType = utils.convert(texture.type), glInternalFormat = getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace, texture.isVideoTexture);
        setTextureParameters(textureType, texture);
        let mipmap, mipmaps = texture.mipmaps, useTexStorage = texture.isVideoTexture !== !0, allocateMemory = sourceProperties.__version === void 0 || forceUpload === !0, dataReady = source.dataReady, levels = getMipLevels(texture, image);
        if (texture.isDepthTexture)
          glInternalFormat = getInternalDepthFormat(texture.format === DepthStencilFormat, texture.type), allocateMemory && (useTexStorage ? state.texStorage2D(_gl.TEXTURE_2D, 1, glInternalFormat, image.width, image.height) : state.texImage2D(_gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, 0, glFormat, glType, null));
        else if (texture.isDataTexture)
          if (mipmaps.length > 0) {
            useTexStorage && allocateMemory && state.texStorage2D(_gl.TEXTURE_2D, levels, glInternalFormat, mipmaps[0].width, mipmaps[0].height);
            for (let i = 0, il = mipmaps.length; i < il; i++)
              mipmap = mipmaps[i], useTexStorage ? dataReady && state.texSubImage2D(_gl.TEXTURE_2D, i, 0, 0, mipmap.width, mipmap.height, glFormat, glType, mipmap.data) : state.texImage2D(_gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
            texture.generateMipmaps = !1;
          } else
            useTexStorage ? (allocateMemory && state.texStorage2D(_gl.TEXTURE_2D, levels, glInternalFormat, image.width, image.height), dataReady && state.texSubImage2D(_gl.TEXTURE_2D, 0, 0, 0, image.width, image.height, glFormat, glType, image.data)) : state.texImage2D(_gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, 0, glFormat, glType, image.data);
        else if (texture.isCompressedTexture)
          if (texture.isCompressedArrayTexture) {
            useTexStorage && allocateMemory && state.texStorage3D(_gl.TEXTURE_2D_ARRAY, levels, glInternalFormat, mipmaps[0].width, mipmaps[0].height, image.depth);
            for (let i = 0, il = mipmaps.length; i < il; i++)
              if (mipmap = mipmaps[i], texture.format !== RGBAFormat)
                if (glFormat !== null)
                  if (useTexStorage) {
                    if (dataReady)
                      if (texture.layerUpdates.size > 0) {
                        let layerByteLength = getByteLength(mipmap.width, mipmap.height, texture.format, texture.type);
                        for (let layerIndex of texture.layerUpdates) {
                          let layerData = mipmap.data.subarray(
                            layerIndex * layerByteLength / mipmap.data.BYTES_PER_ELEMENT,
                            (layerIndex + 1) * layerByteLength / mipmap.data.BYTES_PER_ELEMENT
                          );
                          state.compressedTexSubImage3D(_gl.TEXTURE_2D_ARRAY, i, 0, 0, layerIndex, mipmap.width, mipmap.height, 1, glFormat, layerData, 0, 0);
                        }
                        texture.clearLayerUpdates();
                      } else
                        state.compressedTexSubImage3D(_gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, mipmap.data, 0, 0);
                  } else
                    state.compressedTexImage3D(_gl.TEXTURE_2D_ARRAY, i, glInternalFormat, mipmap.width, mipmap.height, image.depth, 0, mipmap.data, 0, 0);
                else
                  console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
              else
                useTexStorage ? dataReady && state.texSubImage3D(_gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, glType, mipmap.data) : state.texImage3D(_gl.TEXTURE_2D_ARRAY, i, glInternalFormat, mipmap.width, mipmap.height, image.depth, 0, glFormat, glType, mipmap.data);
          } else {
            useTexStorage && allocateMemory && state.texStorage2D(_gl.TEXTURE_2D, levels, glInternalFormat, mipmaps[0].width, mipmaps[0].height);
            for (let i = 0, il = mipmaps.length; i < il; i++)
              mipmap = mipmaps[i], texture.format !== RGBAFormat ? glFormat !== null ? useTexStorage ? dataReady && state.compressedTexSubImage2D(_gl.TEXTURE_2D, i, 0, 0, mipmap.width, mipmap.height, glFormat, mipmap.data) : state.compressedTexImage2D(_gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : useTexStorage ? dataReady && state.texSubImage2D(_gl.TEXTURE_2D, i, 0, 0, mipmap.width, mipmap.height, glFormat, glType, mipmap.data) : state.texImage2D(_gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
          }
        else if (texture.isDataArrayTexture)
          if (useTexStorage) {
            if (allocateMemory && state.texStorage3D(_gl.TEXTURE_2D_ARRAY, levels, glInternalFormat, image.width, image.height, image.depth), dataReady)
              if (texture.layerUpdates.size > 0) {
                let layerByteLength = getByteLength(image.width, image.height, texture.format, texture.type);
                for (let layerIndex of texture.layerUpdates) {
                  let layerData = image.data.subarray(
                    layerIndex * layerByteLength / image.data.BYTES_PER_ELEMENT,
                    (layerIndex + 1) * layerByteLength / image.data.BYTES_PER_ELEMENT
                  );
                  state.texSubImage3D(_gl.TEXTURE_2D_ARRAY, 0, 0, 0, layerIndex, image.width, image.height, 1, glFormat, glType, layerData);
                }
                texture.clearLayerUpdates();
              } else
                state.texSubImage3D(_gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data);
          } else
            state.texImage3D(_gl.TEXTURE_2D_ARRAY, 0, glInternalFormat, image.width, image.height, image.depth, 0, glFormat, glType, image.data);
        else if (texture.isData3DTexture)
          useTexStorage ? (allocateMemory && state.texStorage3D(_gl.TEXTURE_3D, levels, glInternalFormat, image.width, image.height, image.depth), dataReady && state.texSubImage3D(_gl.TEXTURE_3D, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data)) : state.texImage3D(_gl.TEXTURE_3D, 0, glInternalFormat, image.width, image.height, image.depth, 0, glFormat, glType, image.data);
        else if (texture.isFramebufferTexture) {
          if (allocateMemory)
            if (useTexStorage)
              state.texStorage2D(_gl.TEXTURE_2D, levels, glInternalFormat, image.width, image.height);
            else {
              let width = image.width, height = image.height;
              for (let i = 0; i < levels; i++)
                state.texImage2D(_gl.TEXTURE_2D, i, glInternalFormat, width, height, 0, glFormat, glType, null), width >>= 1, height >>= 1;
            }
        } else if (mipmaps.length > 0) {
          if (useTexStorage && allocateMemory) {
            let dimensions = getDimensions(mipmaps[0]);
            state.texStorage2D(_gl.TEXTURE_2D, levels, glInternalFormat, dimensions.width, dimensions.height);
          }
          for (let i = 0, il = mipmaps.length; i < il; i++)
            mipmap = mipmaps[i], useTexStorage ? dataReady && state.texSubImage2D(_gl.TEXTURE_2D, i, 0, 0, glFormat, glType, mipmap) : state.texImage2D(_gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, mipmap);
          texture.generateMipmaps = !1;
        } else if (useTexStorage) {
          if (allocateMemory) {
            let dimensions = getDimensions(image);
            state.texStorage2D(_gl.TEXTURE_2D, levels, glInternalFormat, dimensions.width, dimensions.height);
          }
          dataReady && state.texSubImage2D(_gl.TEXTURE_2D, 0, 0, 0, glFormat, glType, image);
        } else
          state.texImage2D(_gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image);
        textureNeedsGenerateMipmaps(texture) && generateMipmap(textureType), sourceProperties.__version = source.version, texture.onUpdate && texture.onUpdate(texture);
      }
      textureProperties.__version = texture.version;
    }
    function uploadCubeTexture(textureProperties, texture, slot) {
      if (texture.image.length !== 6) return;
      let forceUpload = initTexture(textureProperties, texture), source = texture.source;
      state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture, _gl.TEXTURE0 + slot);
      let sourceProperties = properties.get(source);
      if (source.version !== sourceProperties.__version || forceUpload === !0) {
        state.activeTexture(_gl.TEXTURE0 + slot);
        let workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace), texturePrimaries = texture.colorSpace === NoColorSpace ? null : ColorManagement.getPrimaries(texture.colorSpace), unpackConversion = texture.colorSpace === NoColorSpace || workingPrimaries === texturePrimaries ? _gl.NONE : _gl.BROWSER_DEFAULT_WEBGL;
        _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, texture.flipY), _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha), _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, texture.unpackAlignment), _gl.pixelStorei(_gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, unpackConversion);
        let isCompressed = texture.isCompressedTexture || texture.image[0].isCompressedTexture, isDataTexture = texture.image[0] && texture.image[0].isDataTexture, cubeImage = [];
        for (let i = 0; i < 6; i++)
          !isCompressed && !isDataTexture ? cubeImage[i] = resizeImage(texture.image[i], !0, capabilities.maxCubemapSize) : cubeImage[i] = isDataTexture ? texture.image[i].image : texture.image[i], cubeImage[i] = verifyColorSpace(texture, cubeImage[i]);
        let image = cubeImage[0], glFormat = utils.convert(texture.format, texture.colorSpace), glType = utils.convert(texture.type), glInternalFormat = getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace), useTexStorage = texture.isVideoTexture !== !0, allocateMemory = sourceProperties.__version === void 0 || forceUpload === !0, dataReady = source.dataReady, levels = getMipLevels(texture, image);
        setTextureParameters(_gl.TEXTURE_CUBE_MAP, texture);
        let mipmaps;
        if (isCompressed) {
          useTexStorage && allocateMemory && state.texStorage2D(_gl.TEXTURE_CUBE_MAP, levels, glInternalFormat, image.width, image.height);
          for (let i = 0; i < 6; i++) {
            mipmaps = cubeImage[i].mipmaps;
            for (let j = 0; j < mipmaps.length; j++) {
              let mipmap = mipmaps[j];
              texture.format !== RGBAFormat ? glFormat !== null ? useTexStorage ? dataReady && state.compressedTexSubImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, 0, 0, mipmap.width, mipmap.height, glFormat, mipmap.data) : state.compressedTexImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : useTexStorage ? dataReady && state.texSubImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, 0, 0, mipmap.width, mipmap.height, glFormat, glType, mipmap.data) : state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
            }
          }
        } else {
          if (mipmaps = texture.mipmaps, useTexStorage && allocateMemory) {
            mipmaps.length > 0 && levels++;
            let dimensions = getDimensions(cubeImage[0]);
            state.texStorage2D(_gl.TEXTURE_CUBE_MAP, levels, glInternalFormat, dimensions.width, dimensions.height);
          }
          for (let i = 0; i < 6; i++)
            if (isDataTexture) {
              useTexStorage ? dataReady && state.texSubImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, cubeImage[i].width, cubeImage[i].height, glFormat, glType, cubeImage[i].data) : state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, cubeImage[i].width, cubeImage[i].height, 0, glFormat, glType, cubeImage[i].data);
              for (let j = 0; j < mipmaps.length; j++) {
                let mipmapImage = mipmaps[j].image[i].image;
                useTexStorage ? dataReady && state.texSubImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, 0, 0, mipmapImage.width, mipmapImage.height, glFormat, glType, mipmapImage.data) : state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, glInternalFormat, mipmapImage.width, mipmapImage.height, 0, glFormat, glType, mipmapImage.data);
              }
            } else {
              useTexStorage ? dataReady && state.texSubImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, glFormat, glType, cubeImage[i]) : state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, glFormat, glType, cubeImage[i]);
              for (let j = 0; j < mipmaps.length; j++) {
                let mipmap = mipmaps[j];
                useTexStorage ? dataReady && state.texSubImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, 0, 0, glFormat, glType, mipmap.image[i]) : state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, glInternalFormat, glFormat, glType, mipmap.image[i]);
              }
            }
        }
        textureNeedsGenerateMipmaps(texture) && generateMipmap(_gl.TEXTURE_CUBE_MAP), sourceProperties.__version = source.version, texture.onUpdate && texture.onUpdate(texture);
      }
      textureProperties.__version = texture.version;
    }
    function setupFrameBufferTexture(framebuffer, renderTarget, texture, attachment, textureTarget, level) {
      let glFormat = utils.convert(texture.format, texture.colorSpace), glType = utils.convert(texture.type), glInternalFormat = getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace);
      if (!properties.get(renderTarget).__hasExternalTextures) {
        let width = Math.max(1, renderTarget.width >> level), height = Math.max(1, renderTarget.height >> level);
        textureTarget === _gl.TEXTURE_3D || textureTarget === _gl.TEXTURE_2D_ARRAY ? state.texImage3D(textureTarget, level, glInternalFormat, width, height, renderTarget.depth, 0, glFormat, glType, null) : state.texImage2D(textureTarget, level, glInternalFormat, width, height, 0, glFormat, glType, null);
      }
      state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer), useMultisampledRTT(renderTarget) ? multisampledRTTExt.framebufferTexture2DMultisampleEXT(_gl.FRAMEBUFFER, attachment, textureTarget, properties.get(texture).__webglTexture, 0, getRenderTargetSamples(renderTarget)) : (textureTarget === _gl.TEXTURE_2D || textureTarget >= _gl.TEXTURE_CUBE_MAP_POSITIVE_X && textureTarget <= _gl.TEXTURE_CUBE_MAP_NEGATIVE_Z) && _gl.framebufferTexture2D(_gl.FRAMEBUFFER, attachment, textureTarget, properties.get(texture).__webglTexture, level), state.bindFramebuffer(_gl.FRAMEBUFFER, null);
    }
    function setupRenderBufferStorage(renderbuffer, renderTarget, isMultisample) {
      if (_gl.bindRenderbuffer(_gl.RENDERBUFFER, renderbuffer), renderTarget.depthBuffer) {
        let depthTexture = renderTarget.depthTexture, depthType = depthTexture && depthTexture.isDepthTexture ? depthTexture.type : null, glInternalFormat = getInternalDepthFormat(renderTarget.stencilBuffer, depthType), glAttachmentType = renderTarget.stencilBuffer ? _gl.DEPTH_STENCIL_ATTACHMENT : _gl.DEPTH_ATTACHMENT, samples = getRenderTargetSamples(renderTarget);
        useMultisampledRTT(renderTarget) ? multisampledRTTExt.renderbufferStorageMultisampleEXT(_gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height) : isMultisample ? _gl.renderbufferStorageMultisample(_gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height) : _gl.renderbufferStorage(_gl.RENDERBUFFER, glInternalFormat, renderTarget.width, renderTarget.height), _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, glAttachmentType, _gl.RENDERBUFFER, renderbuffer);
      } else {
        let textures = renderTarget.textures;
        for (let i = 0; i < textures.length; i++) {
          let texture = textures[i], glFormat = utils.convert(texture.format, texture.colorSpace), glType = utils.convert(texture.type), glInternalFormat = getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace), samples = getRenderTargetSamples(renderTarget);
          isMultisample && useMultisampledRTT(renderTarget) === !1 ? _gl.renderbufferStorageMultisample(_gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height) : useMultisampledRTT(renderTarget) ? multisampledRTTExt.renderbufferStorageMultisampleEXT(_gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height) : _gl.renderbufferStorage(_gl.RENDERBUFFER, glInternalFormat, renderTarget.width, renderTarget.height);
        }
      }
      _gl.bindRenderbuffer(_gl.RENDERBUFFER, null);
    }
    function setupDepthTexture(framebuffer, renderTarget) {
      if (renderTarget && renderTarget.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
      if (state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer), !(renderTarget.depthTexture && renderTarget.depthTexture.isDepthTexture))
        throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
      (!properties.get(renderTarget.depthTexture).__webglTexture || renderTarget.depthTexture.image.width !== renderTarget.width || renderTarget.depthTexture.image.height !== renderTarget.height) && (renderTarget.depthTexture.image.width = renderTarget.width, renderTarget.depthTexture.image.height = renderTarget.height, renderTarget.depthTexture.needsUpdate = !0), setTexture2D(renderTarget.depthTexture, 0);
      let webglDepthTexture = properties.get(renderTarget.depthTexture).__webglTexture, samples = getRenderTargetSamples(renderTarget);
      if (renderTarget.depthTexture.format === DepthFormat)
        useMultisampledRTT(renderTarget) ? multisampledRTTExt.framebufferTexture2DMultisampleEXT(_gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.TEXTURE_2D, webglDepthTexture, 0, samples) : _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.TEXTURE_2D, webglDepthTexture, 0);
      else if (renderTarget.depthTexture.format === DepthStencilFormat)
        useMultisampledRTT(renderTarget) ? multisampledRTTExt.framebufferTexture2DMultisampleEXT(_gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.TEXTURE_2D, webglDepthTexture, 0, samples) : _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.TEXTURE_2D, webglDepthTexture, 0);
      else
        throw new Error("Unknown depthTexture format");
    }
    function setupDepthRenderbuffer(renderTarget) {
      let renderTargetProperties = properties.get(renderTarget), isCube = renderTarget.isWebGLCubeRenderTarget === !0;
      if (renderTarget.depthTexture && !renderTargetProperties.__autoAllocateDepthBuffer) {
        if (isCube) throw new Error("target.depthTexture not supported in Cube render targets");
        setupDepthTexture(renderTargetProperties.__webglFramebuffer, renderTarget);
      } else if (isCube) {
        renderTargetProperties.__webglDepthbuffer = [];
        for (let i = 0; i < 6; i++)
          state.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[i]), renderTargetProperties.__webglDepthbuffer[i] = _gl.createRenderbuffer(), setupRenderBufferStorage(renderTargetProperties.__webglDepthbuffer[i], renderTarget, !1);
      } else
        state.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer), renderTargetProperties.__webglDepthbuffer = _gl.createRenderbuffer(), setupRenderBufferStorage(renderTargetProperties.__webglDepthbuffer, renderTarget, !1);
      state.bindFramebuffer(_gl.FRAMEBUFFER, null);
    }
    function rebindTextures(renderTarget, colorTexture, depthTexture) {
      let renderTargetProperties = properties.get(renderTarget);
      colorTexture !== void 0 && setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer, renderTarget, renderTarget.texture, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_2D, 0), depthTexture !== void 0 && setupDepthRenderbuffer(renderTarget);
    }
    function setupRenderTarget(renderTarget) {
      let texture = renderTarget.texture, renderTargetProperties = properties.get(renderTarget), textureProperties = properties.get(texture);
      renderTarget.addEventListener("dispose", onRenderTargetDispose);
      let textures = renderTarget.textures, isCube = renderTarget.isWebGLCubeRenderTarget === !0, isMultipleRenderTargets = textures.length > 1;
      if (isMultipleRenderTargets || (textureProperties.__webglTexture === void 0 && (textureProperties.__webglTexture = _gl.createTexture()), textureProperties.__version = texture.version, info.memory.textures++), isCube) {
        renderTargetProperties.__webglFramebuffer = [];
        for (let i = 0; i < 6; i++)
          if (texture.mipmaps && texture.mipmaps.length > 0) {
            renderTargetProperties.__webglFramebuffer[i] = [];
            for (let level = 0; level < texture.mipmaps.length; level++)
              renderTargetProperties.__webglFramebuffer[i][level] = _gl.createFramebuffer();
          } else
            renderTargetProperties.__webglFramebuffer[i] = _gl.createFramebuffer();
      } else {
        if (texture.mipmaps && texture.mipmaps.length > 0) {
          renderTargetProperties.__webglFramebuffer = [];
          for (let level = 0; level < texture.mipmaps.length; level++)
            renderTargetProperties.__webglFramebuffer[level] = _gl.createFramebuffer();
        } else
          renderTargetProperties.__webglFramebuffer = _gl.createFramebuffer();
        if (isMultipleRenderTargets)
          for (let i = 0, il = textures.length; i < il; i++) {
            let attachmentProperties = properties.get(textures[i]);
            attachmentProperties.__webglTexture === void 0 && (attachmentProperties.__webglTexture = _gl.createTexture(), info.memory.textures++);
          }
        if (renderTarget.samples > 0 && useMultisampledRTT(renderTarget) === !1) {
          renderTargetProperties.__webglMultisampledFramebuffer = _gl.createFramebuffer(), renderTargetProperties.__webglColorRenderbuffer = [], state.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer);
          for (let i = 0; i < textures.length; i++) {
            let texture2 = textures[i];
            renderTargetProperties.__webglColorRenderbuffer[i] = _gl.createRenderbuffer(), _gl.bindRenderbuffer(_gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);
            let glFormat = utils.convert(texture2.format, texture2.colorSpace), glType = utils.convert(texture2.type), glInternalFormat = getInternalFormat(texture2.internalFormat, glFormat, glType, texture2.colorSpace, renderTarget.isXRRenderTarget === !0), samples = getRenderTargetSamples(renderTarget);
            _gl.renderbufferStorageMultisample(_gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height), _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0 + i, _gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);
          }
          _gl.bindRenderbuffer(_gl.RENDERBUFFER, null), renderTarget.depthBuffer && (renderTargetProperties.__webglDepthRenderbuffer = _gl.createRenderbuffer(), setupRenderBufferStorage(renderTargetProperties.__webglDepthRenderbuffer, renderTarget, !0)), state.bindFramebuffer(_gl.FRAMEBUFFER, null);
        }
      }
      if (isCube) {
        state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture), setTextureParameters(_gl.TEXTURE_CUBE_MAP, texture);
        for (let i = 0; i < 6; i++)
          if (texture.mipmaps && texture.mipmaps.length > 0)
            for (let level = 0; level < texture.mipmaps.length; level++)
              setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer[i][level], renderTarget, texture, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, level);
          else
            setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer[i], renderTarget, texture, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0);
        textureNeedsGenerateMipmaps(texture) && generateMipmap(_gl.TEXTURE_CUBE_MAP), state.unbindTexture();
      } else if (isMultipleRenderTargets) {
        for (let i = 0, il = textures.length; i < il; i++) {
          let attachment = textures[i], attachmentProperties = properties.get(attachment);
          state.bindTexture(_gl.TEXTURE_2D, attachmentProperties.__webglTexture), setTextureParameters(_gl.TEXTURE_2D, attachment), setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer, renderTarget, attachment, _gl.COLOR_ATTACHMENT0 + i, _gl.TEXTURE_2D, 0), textureNeedsGenerateMipmaps(attachment) && generateMipmap(_gl.TEXTURE_2D);
        }
        state.unbindTexture();
      } else {
        let glTextureType = _gl.TEXTURE_2D;
        if ((renderTarget.isWebGL3DRenderTarget || renderTarget.isWebGLArrayRenderTarget) && (glTextureType = renderTarget.isWebGL3DRenderTarget ? _gl.TEXTURE_3D : _gl.TEXTURE_2D_ARRAY), state.bindTexture(glTextureType, textureProperties.__webglTexture), setTextureParameters(glTextureType, texture), texture.mipmaps && texture.mipmaps.length > 0)
          for (let level = 0; level < texture.mipmaps.length; level++)
            setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer[level], renderTarget, texture, _gl.COLOR_ATTACHMENT0, glTextureType, level);
        else
          setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer, renderTarget, texture, _gl.COLOR_ATTACHMENT0, glTextureType, 0);
        textureNeedsGenerateMipmaps(texture) && generateMipmap(glTextureType), state.unbindTexture();
      }
      renderTarget.depthBuffer && setupDepthRenderbuffer(renderTarget);
    }
    function updateRenderTargetMipmap(renderTarget) {
      let textures = renderTarget.textures;
      for (let i = 0, il = textures.length; i < il; i++) {
        let texture = textures[i];
        if (textureNeedsGenerateMipmaps(texture)) {
          let target = renderTarget.isWebGLCubeRenderTarget ? _gl.TEXTURE_CUBE_MAP : _gl.TEXTURE_2D, webglTexture = properties.get(texture).__webglTexture;
          state.bindTexture(target, webglTexture), generateMipmap(target), state.unbindTexture();
        }
      }
    }
    let invalidationArrayRead = [], invalidationArrayDraw = [];
    function updateMultisampleRenderTarget(renderTarget) {
      if (renderTarget.samples > 0) {
        if (useMultisampledRTT(renderTarget) === !1) {
          let textures = renderTarget.textures, width = renderTarget.width, height = renderTarget.height, mask = _gl.COLOR_BUFFER_BIT, depthStyle = renderTarget.stencilBuffer ? _gl.DEPTH_STENCIL_ATTACHMENT : _gl.DEPTH_ATTACHMENT, renderTargetProperties = properties.get(renderTarget), isMultipleRenderTargets = textures.length > 1;
          if (isMultipleRenderTargets)
            for (let i = 0; i < textures.length; i++)
              state.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer), _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0 + i, _gl.RENDERBUFFER, null), state.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer), _gl.framebufferTexture2D(_gl.DRAW_FRAMEBUFFER, _gl.COLOR_ATTACHMENT0 + i, _gl.TEXTURE_2D, null, 0);
          state.bindFramebuffer(_gl.READ_FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer), state.bindFramebuffer(_gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
          for (let i = 0; i < textures.length; i++) {
            if (renderTarget.resolveDepthBuffer && (renderTarget.depthBuffer && (mask |= _gl.DEPTH_BUFFER_BIT), renderTarget.stencilBuffer && renderTarget.resolveStencilBuffer && (mask |= _gl.STENCIL_BUFFER_BIT)), isMultipleRenderTargets) {
              _gl.framebufferRenderbuffer(_gl.READ_FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);
              let webglTexture = properties.get(textures[i]).__webglTexture;
              _gl.framebufferTexture2D(_gl.DRAW_FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_2D, webglTexture, 0);
            }
            _gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, mask, _gl.NEAREST), supportsInvalidateFramebuffer === !0 && (invalidationArrayRead.length = 0, invalidationArrayDraw.length = 0, invalidationArrayRead.push(_gl.COLOR_ATTACHMENT0 + i), renderTarget.depthBuffer && renderTarget.resolveDepthBuffer === !1 && (invalidationArrayRead.push(depthStyle), invalidationArrayDraw.push(depthStyle), _gl.invalidateFramebuffer(_gl.DRAW_FRAMEBUFFER, invalidationArrayDraw)), _gl.invalidateFramebuffer(_gl.READ_FRAMEBUFFER, invalidationArrayRead));
          }
          if (state.bindFramebuffer(_gl.READ_FRAMEBUFFER, null), state.bindFramebuffer(_gl.DRAW_FRAMEBUFFER, null), isMultipleRenderTargets)
            for (let i = 0; i < textures.length; i++) {
              state.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer), _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0 + i, _gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);
              let webglTexture = properties.get(textures[i]).__webglTexture;
              state.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer), _gl.framebufferTexture2D(_gl.DRAW_FRAMEBUFFER, _gl.COLOR_ATTACHMENT0 + i, _gl.TEXTURE_2D, webglTexture, 0);
            }
          state.bindFramebuffer(_gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer);
        } else if (renderTarget.depthBuffer && renderTarget.resolveDepthBuffer === !1 && supportsInvalidateFramebuffer) {
          let depthStyle = renderTarget.stencilBuffer ? _gl.DEPTH_STENCIL_ATTACHMENT : _gl.DEPTH_ATTACHMENT;
          _gl.invalidateFramebuffer(_gl.DRAW_FRAMEBUFFER, [depthStyle]);
        }
      }
    }
    function getRenderTargetSamples(renderTarget) {
      return Math.min(capabilities.maxSamples, renderTarget.samples);
    }
    function useMultisampledRTT(renderTarget) {
      let renderTargetProperties = properties.get(renderTarget);
      return renderTarget.samples > 0 && extensions.has("WEBGL_multisampled_render_to_texture") === !0 && renderTargetProperties.__useRenderToTexture !== !1;
    }
    function updateVideoTexture(texture) {
      let frame = info.render.frame;
      _videoTextures.get(texture) !== frame && (_videoTextures.set(texture, frame), texture.update());
    }
    function verifyColorSpace(texture, image) {
      let colorSpace = texture.colorSpace, format = texture.format, type = texture.type;
      return texture.isCompressedTexture === !0 || texture.isVideoTexture === !0 || colorSpace !== LinearSRGBColorSpace && colorSpace !== NoColorSpace && (ColorManagement.getTransfer(colorSpace) === SRGBTransfer ? (format !== RGBAFormat || type !== UnsignedByteType) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", colorSpace)), image;
    }
    function getDimensions(image) {
      return typeof HTMLImageElement < "u" && image instanceof HTMLImageElement ? (_imageDimensions.width = image.naturalWidth || image.width, _imageDimensions.height = image.naturalHeight || image.height) : typeof VideoFrame < "u" && image instanceof VideoFrame ? (_imageDimensions.width = image.displayWidth, _imageDimensions.height = image.displayHeight) : (_imageDimensions.width = image.width, _imageDimensions.height = image.height), _imageDimensions;
    }
    this.allocateTextureUnit = allocateTextureUnit, this.resetTextureUnits = resetTextureUnits, this.setTexture2D = setTexture2D, this.setTexture2DArray = setTexture2DArray, this.setTexture3D = setTexture3D, this.setTextureCube = setTextureCube, this.rebindTextures = rebindTextures, this.setupRenderTarget = setupRenderTarget, this.updateRenderTargetMipmap = updateRenderTargetMipmap, this.updateMultisampleRenderTarget = updateMultisampleRenderTarget, this.setupDepthRenderbuffer = setupDepthRenderbuffer, this.setupFrameBufferTexture = setupFrameBufferTexture, this.useMultisampledRTT = useMultisampledRTT;
  }
  function WebGLUtils(gl, extensions) {
    function convert(p, colorSpace = NoColorSpace) {
      let extension, transfer = ColorManagement.getTransfer(colorSpace);
      if (p === UnsignedByteType) return gl.UNSIGNED_BYTE;
      if (p === UnsignedShort4444Type) return gl.UNSIGNED_SHORT_4_4_4_4;
      if (p === UnsignedShort5551Type) return gl.UNSIGNED_SHORT_5_5_5_1;
      if (p === UnsignedInt5999Type) return gl.UNSIGNED_INT_5_9_9_9_REV;
      if (p === ByteType) return gl.BYTE;
      if (p === ShortType) return gl.SHORT;
      if (p === UnsignedShortType) return gl.UNSIGNED_SHORT;
      if (p === IntType) return gl.INT;
      if (p === UnsignedIntType) return gl.UNSIGNED_INT;
      if (p === FloatType) return gl.FLOAT;
      if (p === HalfFloatType) return gl.HALF_FLOAT;
      if (p === AlphaFormat) return gl.ALPHA;
      if (p === RGBFormat) return gl.RGB;
      if (p === RGBAFormat) return gl.RGBA;
      if (p === LuminanceFormat) return gl.LUMINANCE;
      if (p === LuminanceAlphaFormat) return gl.LUMINANCE_ALPHA;
      if (p === DepthFormat) return gl.DEPTH_COMPONENT;
      if (p === DepthStencilFormat) return gl.DEPTH_STENCIL;
      if (p === RedFormat) return gl.RED;
      if (p === RedIntegerFormat) return gl.RED_INTEGER;
      if (p === RGFormat) return gl.RG;
      if (p === RGIntegerFormat) return gl.RG_INTEGER;
      if (p === RGBAIntegerFormat) return gl.RGBA_INTEGER;
      if (p === RGB_S3TC_DXT1_Format || p === RGBA_S3TC_DXT1_Format || p === RGBA_S3TC_DXT3_Format || p === RGBA_S3TC_DXT5_Format)
        if (transfer === SRGBTransfer)
          if (extension = extensions.get("WEBGL_compressed_texture_s3tc_srgb"), extension !== null) {
            if (p === RGB_S3TC_DXT1_Format) return extension.COMPRESSED_SRGB_S3TC_DXT1_EXT;
            if (p === RGBA_S3TC_DXT1_Format) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
            if (p === RGBA_S3TC_DXT3_Format) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
            if (p === RGBA_S3TC_DXT5_Format) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
          } else
            return null;
        else if (extension = extensions.get("WEBGL_compressed_texture_s3tc"), extension !== null) {
          if (p === RGB_S3TC_DXT1_Format) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
          if (p === RGBA_S3TC_DXT1_Format) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
          if (p === RGBA_S3TC_DXT3_Format) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
          if (p === RGBA_S3TC_DXT5_Format) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        } else
          return null;
      if (p === RGB_PVRTC_4BPPV1_Format || p === RGB_PVRTC_2BPPV1_Format || p === RGBA_PVRTC_4BPPV1_Format || p === RGBA_PVRTC_2BPPV1_Format)
        if (extension = extensions.get("WEBGL_compressed_texture_pvrtc"), extension !== null) {
          if (p === RGB_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
          if (p === RGB_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
          if (p === RGBA_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
          if (p === RGBA_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        } else
          return null;
      if (p === RGB_ETC1_Format || p === RGB_ETC2_Format || p === RGBA_ETC2_EAC_Format)
        if (extension = extensions.get("WEBGL_compressed_texture_etc"), extension !== null) {
          if (p === RGB_ETC1_Format || p === RGB_ETC2_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ETC2 : extension.COMPRESSED_RGB8_ETC2;
          if (p === RGBA_ETC2_EAC_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : extension.COMPRESSED_RGBA8_ETC2_EAC;
        } else
          return null;
      if (p === RGBA_ASTC_4x4_Format || p === RGBA_ASTC_5x4_Format || p === RGBA_ASTC_5x5_Format || p === RGBA_ASTC_6x5_Format || p === RGBA_ASTC_6x6_Format || p === RGBA_ASTC_8x5_Format || p === RGBA_ASTC_8x6_Format || p === RGBA_ASTC_8x8_Format || p === RGBA_ASTC_10x5_Format || p === RGBA_ASTC_10x6_Format || p === RGBA_ASTC_10x8_Format || p === RGBA_ASTC_10x10_Format || p === RGBA_ASTC_12x10_Format || p === RGBA_ASTC_12x12_Format)
        if (extension = extensions.get("WEBGL_compressed_texture_astc"), extension !== null) {
          if (p === RGBA_ASTC_4x4_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : extension.COMPRESSED_RGBA_ASTC_4x4_KHR;
          if (p === RGBA_ASTC_5x4_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : extension.COMPRESSED_RGBA_ASTC_5x4_KHR;
          if (p === RGBA_ASTC_5x5_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : extension.COMPRESSED_RGBA_ASTC_5x5_KHR;
          if (p === RGBA_ASTC_6x5_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : extension.COMPRESSED_RGBA_ASTC_6x5_KHR;
          if (p === RGBA_ASTC_6x6_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : extension.COMPRESSED_RGBA_ASTC_6x6_KHR;
          if (p === RGBA_ASTC_8x5_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : extension.COMPRESSED_RGBA_ASTC_8x5_KHR;
          if (p === RGBA_ASTC_8x6_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : extension.COMPRESSED_RGBA_ASTC_8x6_KHR;
          if (p === RGBA_ASTC_8x8_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : extension.COMPRESSED_RGBA_ASTC_8x8_KHR;
          if (p === RGBA_ASTC_10x5_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : extension.COMPRESSED_RGBA_ASTC_10x5_KHR;
          if (p === RGBA_ASTC_10x6_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : extension.COMPRESSED_RGBA_ASTC_10x6_KHR;
          if (p === RGBA_ASTC_10x8_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : extension.COMPRESSED_RGBA_ASTC_10x8_KHR;
          if (p === RGBA_ASTC_10x10_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : extension.COMPRESSED_RGBA_ASTC_10x10_KHR;
          if (p === RGBA_ASTC_12x10_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : extension.COMPRESSED_RGBA_ASTC_12x10_KHR;
          if (p === RGBA_ASTC_12x12_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : extension.COMPRESSED_RGBA_ASTC_12x12_KHR;
        } else
          return null;
      if (p === RGBA_BPTC_Format || p === RGB_BPTC_SIGNED_Format || p === RGB_BPTC_UNSIGNED_Format)
        if (extension = extensions.get("EXT_texture_compression_bptc"), extension !== null) {
          if (p === RGBA_BPTC_Format) return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : extension.COMPRESSED_RGBA_BPTC_UNORM_EXT;
          if (p === RGB_BPTC_SIGNED_Format) return extension.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
          if (p === RGB_BPTC_UNSIGNED_Format) return extension.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
        } else
          return null;
      if (p === RED_RGTC1_Format || p === SIGNED_RED_RGTC1_Format || p === RED_GREEN_RGTC2_Format || p === SIGNED_RED_GREEN_RGTC2_Format)
        if (extension = extensions.get("EXT_texture_compression_rgtc"), extension !== null) {
          if (p === RGBA_BPTC_Format) return extension.COMPRESSED_RED_RGTC1_EXT;
          if (p === SIGNED_RED_RGTC1_Format) return extension.COMPRESSED_SIGNED_RED_RGTC1_EXT;
          if (p === RED_GREEN_RGTC2_Format) return extension.COMPRESSED_RED_GREEN_RGTC2_EXT;
          if (p === SIGNED_RED_GREEN_RGTC2_Format) return extension.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
        } else
          return null;
      return p === UnsignedInt248Type ? gl.UNSIGNED_INT_24_8 : gl[p] !== void 0 ? gl[p] : null;
    }
    return { convert };
  }
  var ArrayCamera = class extends PerspectiveCamera {
    constructor(array = []) {
      super(), this.isArrayCamera = !0, this.cameras = array;
    }
  }, Group = class extends Object3D {
    constructor() {
      super(), this.isGroup = !0, this.type = "Group";
    }
  }, _moveEvent = { type: "move" }, WebXRController = class {
    constructor() {
      this._targetRay = null, this._grip = null, this._hand = null;
    }
    getHandSpace() {
      return this._hand === null && (this._hand = new Group(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
    }
    getTargetRaySpace() {
      return this._targetRay === null && (this._targetRay = new Group(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new Vector3(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new Vector3()), this._targetRay;
    }
    getGripSpace() {
      return this._grip === null && (this._grip = new Group(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new Vector3(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new Vector3()), this._grip;
    }
    dispatchEvent(event) {
      return this._targetRay !== null && this._targetRay.dispatchEvent(event), this._grip !== null && this._grip.dispatchEvent(event), this._hand !== null && this._hand.dispatchEvent(event), this;
    }
    connect(inputSource) {
      if (inputSource && inputSource.hand) {
        let hand = this._hand;
        if (hand)
          for (let inputjoint of inputSource.hand.values())
            this._getHandJoint(hand, inputjoint);
      }
      return this.dispatchEvent({ type: "connected", data: inputSource }), this;
    }
    disconnect(inputSource) {
      return this.dispatchEvent({ type: "disconnected", data: inputSource }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
    }
    update(inputSource, frame, referenceSpace) {
      let inputPose = null, gripPose = null, handPose = null, targetRay = this._targetRay, grip = this._grip, hand = this._hand;
      if (inputSource && frame.session.visibilityState !== "visible-blurred") {
        if (hand && inputSource.hand) {
          handPose = !0;
          for (let inputjoint of inputSource.hand.values()) {
            let jointPose = frame.getJointPose(inputjoint, referenceSpace), joint = this._getHandJoint(hand, inputjoint);
            jointPose !== null && (joint.matrix.fromArray(jointPose.transform.matrix), joint.matrix.decompose(joint.position, joint.rotation, joint.scale), joint.matrixWorldNeedsUpdate = !0, joint.jointRadius = jointPose.radius), joint.visible = jointPose !== null;
          }
          let indexTip = hand.joints["index-finger-tip"], thumbTip = hand.joints["thumb-tip"], distance = indexTip.position.distanceTo(thumbTip.position), distanceToPinch = 0.02, threshold = 5e-3;
          hand.inputState.pinching && distance > distanceToPinch + threshold ? (hand.inputState.pinching = !1, this.dispatchEvent({
            type: "pinchend",
            handedness: inputSource.handedness,
            target: this
          })) : !hand.inputState.pinching && distance <= distanceToPinch - threshold && (hand.inputState.pinching = !0, this.dispatchEvent({
            type: "pinchstart",
            handedness: inputSource.handedness,
            target: this
          }));
        } else
          grip !== null && inputSource.gripSpace && (gripPose = frame.getPose(inputSource.gripSpace, referenceSpace), gripPose !== null && (grip.matrix.fromArray(gripPose.transform.matrix), grip.matrix.decompose(grip.position, grip.rotation, grip.scale), grip.matrixWorldNeedsUpdate = !0, gripPose.linearVelocity ? (grip.hasLinearVelocity = !0, grip.linearVelocity.copy(gripPose.linearVelocity)) : grip.hasLinearVelocity = !1, gripPose.angularVelocity ? (grip.hasAngularVelocity = !0, grip.angularVelocity.copy(gripPose.angularVelocity)) : grip.hasAngularVelocity = !1));
        targetRay !== null && (inputPose = frame.getPose(inputSource.targetRaySpace, referenceSpace), inputPose === null && gripPose !== null && (inputPose = gripPose), inputPose !== null && (targetRay.matrix.fromArray(inputPose.transform.matrix), targetRay.matrix.decompose(targetRay.position, targetRay.rotation, targetRay.scale), targetRay.matrixWorldNeedsUpdate = !0, inputPose.linearVelocity ? (targetRay.hasLinearVelocity = !0, targetRay.linearVelocity.copy(inputPose.linearVelocity)) : targetRay.hasLinearVelocity = !1, inputPose.angularVelocity ? (targetRay.hasAngularVelocity = !0, targetRay.angularVelocity.copy(inputPose.angularVelocity)) : targetRay.hasAngularVelocity = !1, this.dispatchEvent(_moveEvent)));
      }
      return targetRay !== null && (targetRay.visible = inputPose !== null), grip !== null && (grip.visible = gripPose !== null), hand !== null && (hand.visible = handPose !== null), this;
    }
    // private method
    _getHandJoint(hand, inputjoint) {
      if (hand.joints[inputjoint.jointName] === void 0) {
        let joint = new Group();
        joint.matrixAutoUpdate = !1, joint.visible = !1, hand.joints[inputjoint.jointName] = joint, hand.add(joint);
      }
      return hand.joints[inputjoint.jointName];
    }
  }, _occlusion_vertex = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, _occlusion_fragment = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`, WebXRDepthSensing = class {
    constructor() {
      this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
    }
    init(renderer, depthData, renderState) {
      if (this.texture === null) {
        let texture = new Texture(), texProps = renderer.properties.get(texture);
        texProps.__webglTexture = depthData.texture, (depthData.depthNear != renderState.depthNear || depthData.depthFar != renderState.depthFar) && (this.depthNear = depthData.depthNear, this.depthFar = depthData.depthFar), this.texture = texture;
      }
    }
    getMesh(cameraXR) {
      if (this.texture !== null && this.mesh === null) {
        let viewport = cameraXR.cameras[0].viewport, material = new ShaderMaterial({
          vertexShader: _occlusion_vertex,
          fragmentShader: _occlusion_fragment,
          uniforms: {
            depthColor: { value: this.texture },
            depthWidth: { value: viewport.z },
            depthHeight: { value: viewport.w }
          }
        });
        this.mesh = new Mesh(new PlaneGeometry(20, 20), material);
      }
      return this.mesh;
    }
    reset() {
      this.texture = null, this.mesh = null;
    }
    getDepthTexture() {
      return this.texture;
    }
  }, WebXRManager = class extends EventDispatcher {
    constructor(renderer, gl) {
      super();
      let scope = this, session = null, framebufferScaleFactor = 1, referenceSpace = null, referenceSpaceType = "local-floor", foveation = 1, customReferenceSpace = null, pose = null, glBinding = null, glProjLayer = null, glBaseLayer = null, xrFrame = null, depthSensing = new WebXRDepthSensing(), attributes = gl.getContextAttributes(), initialRenderTarget = null, newRenderTarget = null, controllers = [], controllerInputSources = [], currentSize = new Vector2(), currentPixelRatio = null, cameraL = new PerspectiveCamera();
      cameraL.layers.enable(1), cameraL.viewport = new Vector4();
      let cameraR = new PerspectiveCamera();
      cameraR.layers.enable(2), cameraR.viewport = new Vector4();
      let cameras = [cameraL, cameraR], cameraXR = new ArrayCamera();
      cameraXR.layers.enable(1), cameraXR.layers.enable(2);
      let _currentDepthNear = null, _currentDepthFar = null;
      this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(index) {
        let controller = controllers[index];
        return controller === void 0 && (controller = new WebXRController(), controllers[index] = controller), controller.getTargetRaySpace();
      }, this.getControllerGrip = function(index) {
        let controller = controllers[index];
        return controller === void 0 && (controller = new WebXRController(), controllers[index] = controller), controller.getGripSpace();
      }, this.getHand = function(index) {
        let controller = controllers[index];
        return controller === void 0 && (controller = new WebXRController(), controllers[index] = controller), controller.getHandSpace();
      };
      function onSessionEvent(event) {
        let controllerIndex = controllerInputSources.indexOf(event.inputSource);
        if (controllerIndex === -1)
          return;
        let controller = controllers[controllerIndex];
        controller !== void 0 && (controller.update(event.inputSource, event.frame, customReferenceSpace || referenceSpace), controller.dispatchEvent({ type: event.type, data: event.inputSource }));
      }
      function onSessionEnd() {
        session.removeEventListener("select", onSessionEvent), session.removeEventListener("selectstart", onSessionEvent), session.removeEventListener("selectend", onSessionEvent), session.removeEventListener("squeeze", onSessionEvent), session.removeEventListener("squeezestart", onSessionEvent), session.removeEventListener("squeezeend", onSessionEvent), session.removeEventListener("end", onSessionEnd), session.removeEventListener("inputsourceschange", onInputSourcesChange);
        for (let i = 0; i < controllers.length; i++) {
          let inputSource = controllerInputSources[i];
          inputSource !== null && (controllerInputSources[i] = null, controllers[i].disconnect(inputSource));
        }
        _currentDepthNear = null, _currentDepthFar = null, depthSensing.reset(), renderer.setRenderTarget(initialRenderTarget), glBaseLayer = null, glProjLayer = null, glBinding = null, session = null, newRenderTarget = null, animation.stop(), scope.isPresenting = !1, renderer.setPixelRatio(currentPixelRatio), renderer.setSize(currentSize.width, currentSize.height, !1), scope.dispatchEvent({ type: "sessionend" });
      }
      this.setFramebufferScaleFactor = function(value) {
        framebufferScaleFactor = value, scope.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
      }, this.setReferenceSpaceType = function(value) {
        referenceSpaceType = value, scope.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
      }, this.getReferenceSpace = function() {
        return customReferenceSpace || referenceSpace;
      }, this.setReferenceSpace = function(space) {
        customReferenceSpace = space;
      }, this.getBaseLayer = function() {
        return glProjLayer !== null ? glProjLayer : glBaseLayer;
      }, this.getBinding = function() {
        return glBinding;
      }, this.getFrame = function() {
        return xrFrame;
      }, this.getSession = function() {
        return session;
      }, this.setSession = async function(value) {
        if (session = value, session !== null) {
          if (initialRenderTarget = renderer.getRenderTarget(), session.addEventListener("select", onSessionEvent), session.addEventListener("selectstart", onSessionEvent), session.addEventListener("selectend", onSessionEvent), session.addEventListener("squeeze", onSessionEvent), session.addEventListener("squeezestart", onSessionEvent), session.addEventListener("squeezeend", onSessionEvent), session.addEventListener("end", onSessionEnd), session.addEventListener("inputsourceschange", onInputSourcesChange), attributes.xrCompatible !== !0 && await gl.makeXRCompatible(), currentPixelRatio = renderer.getPixelRatio(), renderer.getSize(currentSize), session.renderState.layers === void 0) {
            let layerInit = {
              antialias: attributes.antialias,
              alpha: !0,
              depth: attributes.depth,
              stencil: attributes.stencil,
              framebufferScaleFactor
            };
            glBaseLayer = new XRWebGLLayer(session, gl, layerInit), session.updateRenderState({ baseLayer: glBaseLayer }), renderer.setPixelRatio(1), renderer.setSize(glBaseLayer.framebufferWidth, glBaseLayer.framebufferHeight, !1), newRenderTarget = new WebGLRenderTarget(
              glBaseLayer.framebufferWidth,
              glBaseLayer.framebufferHeight,
              {
                format: RGBAFormat,
                type: UnsignedByteType,
                colorSpace: renderer.outputColorSpace,
                stencilBuffer: attributes.stencil
              }
            );
          } else {
            let depthFormat = null, depthType = null, glDepthFormat = null;
            attributes.depth && (glDepthFormat = attributes.stencil ? gl.DEPTH24_STENCIL8 : gl.DEPTH_COMPONENT24, depthFormat = attributes.stencil ? DepthStencilFormat : DepthFormat, depthType = attributes.stencil ? UnsignedInt248Type : UnsignedIntType);
            let projectionlayerInit = {
              colorFormat: gl.RGBA8,
              depthFormat: glDepthFormat,
              scaleFactor: framebufferScaleFactor
            };
            glBinding = new XRWebGLBinding(session, gl), glProjLayer = glBinding.createProjectionLayer(projectionlayerInit), session.updateRenderState({ layers: [glProjLayer] }), renderer.setPixelRatio(1), renderer.setSize(glProjLayer.textureWidth, glProjLayer.textureHeight, !1), newRenderTarget = new WebGLRenderTarget(
              glProjLayer.textureWidth,
              glProjLayer.textureHeight,
              {
                format: RGBAFormat,
                type: UnsignedByteType,
                depthTexture: new DepthTexture(glProjLayer.textureWidth, glProjLayer.textureHeight, depthType, void 0, void 0, void 0, void 0, void 0, void 0, depthFormat),
                stencilBuffer: attributes.stencil,
                colorSpace: renderer.outputColorSpace,
                samples: attributes.antialias ? 4 : 0,
                resolveDepthBuffer: glProjLayer.ignoreDepthValues === !1
              }
            );
          }
          newRenderTarget.isXRRenderTarget = !0, this.setFoveation(foveation), customReferenceSpace = null, referenceSpace = await session.requestReferenceSpace(referenceSpaceType), animation.setContext(session), animation.start(), scope.isPresenting = !0, scope.dispatchEvent({ type: "sessionstart" });
        }
      }, this.getEnvironmentBlendMode = function() {
        if (session !== null)
          return session.environmentBlendMode;
      }, this.getDepthTexture = function() {
        return depthSensing.getDepthTexture();
      };
      function onInputSourcesChange(event) {
        for (let i = 0; i < event.removed.length; i++) {
          let inputSource = event.removed[i], index = controllerInputSources.indexOf(inputSource);
          index >= 0 && (controllerInputSources[index] = null, controllers[index].disconnect(inputSource));
        }
        for (let i = 0; i < event.added.length; i++) {
          let inputSource = event.added[i], controllerIndex = controllerInputSources.indexOf(inputSource);
          if (controllerIndex === -1) {
            for (let i2 = 0; i2 < controllers.length; i2++)
              if (i2 >= controllerInputSources.length) {
                controllerInputSources.push(inputSource), controllerIndex = i2;
                break;
              } else if (controllerInputSources[i2] === null) {
                controllerInputSources[i2] = inputSource, controllerIndex = i2;
                break;
              }
            if (controllerIndex === -1) break;
          }
          let controller = controllers[controllerIndex];
          controller && controller.connect(inputSource);
        }
      }
      let cameraLPos = new Vector3(), cameraRPos = new Vector3();
      function setProjectionFromUnion(camera, cameraL2, cameraR2) {
        cameraLPos.setFromMatrixPosition(cameraL2.matrixWorld), cameraRPos.setFromMatrixPosition(cameraR2.matrixWorld);
        let ipd = cameraLPos.distanceTo(cameraRPos), projL = cameraL2.projectionMatrix.elements, projR = cameraR2.projectionMatrix.elements, near = projL[14] / (projL[10] - 1), far = projL[14] / (projL[10] + 1), topFov = (projL[9] + 1) / projL[5], bottomFov = (projL[9] - 1) / projL[5], leftFov = (projL[8] - 1) / projL[0], rightFov = (projR[8] + 1) / projR[0], left = near * leftFov, right = near * rightFov, zOffset = ipd / (-leftFov + rightFov), xOffset = zOffset * -leftFov;
        cameraL2.matrixWorld.decompose(camera.position, camera.quaternion, camera.scale), camera.translateX(xOffset), camera.translateZ(zOffset), camera.matrixWorld.compose(camera.position, camera.quaternion, camera.scale), camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
        let near2 = near + zOffset, far2 = far + zOffset, left2 = left - xOffset, right2 = right + (ipd - xOffset), top2 = topFov * far / far2 * near2, bottom2 = bottomFov * far / far2 * near2;
        camera.projectionMatrix.makePerspective(left2, right2, top2, bottom2, near2, far2), camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      }
      function updateCamera(camera, parent) {
        parent === null ? camera.matrixWorld.copy(camera.matrix) : camera.matrixWorld.multiplyMatrices(parent.matrixWorld, camera.matrix), camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
      }
      this.updateCamera = function(camera) {
        if (session === null) return;
        depthSensing.texture !== null && (camera.near = depthSensing.depthNear, camera.far = depthSensing.depthFar), cameraXR.near = cameraR.near = cameraL.near = camera.near, cameraXR.far = cameraR.far = cameraL.far = camera.far, (_currentDepthNear !== cameraXR.near || _currentDepthFar !== cameraXR.far) && (session.updateRenderState({
          depthNear: cameraXR.near,
          depthFar: cameraXR.far
        }), _currentDepthNear = cameraXR.near, _currentDepthFar = cameraXR.far, cameraL.near = _currentDepthNear, cameraL.far = _currentDepthFar, cameraR.near = _currentDepthNear, cameraR.far = _currentDepthFar, cameraL.updateProjectionMatrix(), cameraR.updateProjectionMatrix(), camera.updateProjectionMatrix());
        let parent = camera.parent, cameras2 = cameraXR.cameras;
        updateCamera(cameraXR, parent);
        for (let i = 0; i < cameras2.length; i++)
          updateCamera(cameras2[i], parent);
        cameras2.length === 2 ? setProjectionFromUnion(cameraXR, cameraL, cameraR) : cameraXR.projectionMatrix.copy(cameraL.projectionMatrix), updateUserCamera(camera, cameraXR, parent);
      };
      function updateUserCamera(camera, cameraXR2, parent) {
        parent === null ? camera.matrix.copy(cameraXR2.matrixWorld) : (camera.matrix.copy(parent.matrixWorld), camera.matrix.invert(), camera.matrix.multiply(cameraXR2.matrixWorld)), camera.matrix.decompose(camera.position, camera.quaternion, camera.scale), camera.updateMatrixWorld(!0), camera.projectionMatrix.copy(cameraXR2.projectionMatrix), camera.projectionMatrixInverse.copy(cameraXR2.projectionMatrixInverse), camera.isPerspectiveCamera && (camera.fov = RAD2DEG * 2 * Math.atan(1 / camera.projectionMatrix.elements[5]), camera.zoom = 1);
      }
      this.getCamera = function() {
        return cameraXR;
      }, this.getFoveation = function() {
        if (!(glProjLayer === null && glBaseLayer === null))
          return foveation;
      }, this.setFoveation = function(value) {
        foveation = value, glProjLayer !== null && (glProjLayer.fixedFoveation = value), glBaseLayer !== null && glBaseLayer.fixedFoveation !== void 0 && (glBaseLayer.fixedFoveation = value);
      }, this.hasDepthSensing = function() {
        return depthSensing.texture !== null;
      }, this.getDepthSensingMesh = function() {
        return depthSensing.getMesh(cameraXR);
      };
      let onAnimationFrameCallback = null;
      function onAnimationFrame(time, frame) {
        if (pose = frame.getViewerPose(customReferenceSpace || referenceSpace), xrFrame = frame, pose !== null) {
          let views = pose.views;
          glBaseLayer !== null && (renderer.setRenderTargetFramebuffer(newRenderTarget, glBaseLayer.framebuffer), renderer.setRenderTarget(newRenderTarget));
          let cameraXRNeedsUpdate = !1;
          views.length !== cameraXR.cameras.length && (cameraXR.cameras.length = 0, cameraXRNeedsUpdate = !0);
          for (let i = 0; i < views.length; i++) {
            let view = views[i], viewport = null;
            if (glBaseLayer !== null)
              viewport = glBaseLayer.getViewport(view);
            else {
              let glSubImage = glBinding.getViewSubImage(glProjLayer, view);
              viewport = glSubImage.viewport, i === 0 && (renderer.setRenderTargetTextures(
                newRenderTarget,
                glSubImage.colorTexture,
                glProjLayer.ignoreDepthValues ? void 0 : glSubImage.depthStencilTexture
              ), renderer.setRenderTarget(newRenderTarget));
            }
            let camera = cameras[i];
            camera === void 0 && (camera = new PerspectiveCamera(), camera.layers.enable(i), camera.viewport = new Vector4(), cameras[i] = camera), camera.matrix.fromArray(view.transform.matrix), camera.matrix.decompose(camera.position, camera.quaternion, camera.scale), camera.projectionMatrix.fromArray(view.projectionMatrix), camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert(), camera.viewport.set(viewport.x, viewport.y, viewport.width, viewport.height), i === 0 && (cameraXR.matrix.copy(camera.matrix), cameraXR.matrix.decompose(cameraXR.position, cameraXR.quaternion, cameraXR.scale)), cameraXRNeedsUpdate === !0 && cameraXR.cameras.push(camera);
          }
          let enabledFeatures = session.enabledFeatures;
          if (enabledFeatures && enabledFeatures.includes("depth-sensing")) {
            let depthData = glBinding.getDepthInformation(views[0]);
            depthData && depthData.isValid && depthData.texture && depthSensing.init(renderer, depthData, session.renderState);
          }
        }
        for (let i = 0; i < controllers.length; i++) {
          let inputSource = controllerInputSources[i], controller = controllers[i];
          inputSource !== null && controller !== void 0 && controller.update(inputSource, frame, customReferenceSpace || referenceSpace);
        }
        onAnimationFrameCallback && onAnimationFrameCallback(time, frame), frame.detectedPlanes && scope.dispatchEvent({ type: "planesdetected", data: frame }), xrFrame = null;
      }
      let animation = new WebGLAnimation();
      animation.setAnimationLoop(onAnimationFrame), this.setAnimationLoop = function(callback) {
        onAnimationFrameCallback = callback;
      }, this.dispose = function() {
      };
    }
  }, _e1 = /* @__PURE__ */ new Euler(), _m1 = /* @__PURE__ */ new Matrix4();
  function WebGLMaterials(renderer, properties) {
    function refreshTransformUniform(map, uniform) {
      map.matrixAutoUpdate === !0 && map.updateMatrix(), uniform.value.copy(map.matrix);
    }
    function refreshFogUniforms(uniforms, fog) {
      fog.color.getRGB(uniforms.fogColor.value, getUnlitUniformColorSpace(renderer)), fog.isFog ? (uniforms.fogNear.value = fog.near, uniforms.fogFar.value = fog.far) : fog.isFogExp2 && (uniforms.fogDensity.value = fog.density);
    }
    function refreshMaterialUniforms(uniforms, material, pixelRatio, height, transmissionRenderTarget) {
      material.isMeshBasicMaterial || material.isMeshLambertMaterial ? refreshUniformsCommon(uniforms, material) : material.isMeshToonMaterial ? (refreshUniformsCommon(uniforms, material), refreshUniformsToon(uniforms, material)) : material.isMeshPhongMaterial ? (refreshUniformsCommon(uniforms, material), refreshUniformsPhong(uniforms, material)) : material.isMeshStandardMaterial ? (refreshUniformsCommon(uniforms, material), refreshUniformsStandard(uniforms, material), material.isMeshPhysicalMaterial && refreshUniformsPhysical(uniforms, material, transmissionRenderTarget)) : material.isMeshMatcapMaterial ? (refreshUniformsCommon(uniforms, material), refreshUniformsMatcap(uniforms, material)) : material.isMeshDepthMaterial ? refreshUniformsCommon(uniforms, material) : material.isMeshDistanceMaterial ? (refreshUniformsCommon(uniforms, material), refreshUniformsDistance(uniforms, material)) : material.isMeshNormalMaterial ? refreshUniformsCommon(uniforms, material) : material.isLineBasicMaterial ? (refreshUniformsLine(uniforms, material), material.isLineDashedMaterial && refreshUniformsDash(uniforms, material)) : material.isPointsMaterial ? refreshUniformsPoints(uniforms, material, pixelRatio, height) : material.isSpriteMaterial ? refreshUniformsSprites(uniforms, material) : material.isShadowMaterial ? (uniforms.color.value.copy(material.color), uniforms.opacity.value = material.opacity) : material.isShaderMaterial && (material.uniformsNeedUpdate = !1);
    }
    function refreshUniformsCommon(uniforms, material) {
      uniforms.opacity.value = material.opacity, material.color && uniforms.diffuse.value.copy(material.color), material.emissive && uniforms.emissive.value.copy(material.emissive).multiplyScalar(material.emissiveIntensity), material.map && (uniforms.map.value = material.map, refreshTransformUniform(material.map, uniforms.mapTransform)), material.alphaMap && (uniforms.alphaMap.value = material.alphaMap, refreshTransformUniform(material.alphaMap, uniforms.alphaMapTransform)), material.bumpMap && (uniforms.bumpMap.value = material.bumpMap, refreshTransformUniform(material.bumpMap, uniforms.bumpMapTransform), uniforms.bumpScale.value = material.bumpScale, material.side === BackSide && (uniforms.bumpScale.value *= -1)), material.normalMap && (uniforms.normalMap.value = material.normalMap, refreshTransformUniform(material.normalMap, uniforms.normalMapTransform), uniforms.normalScale.value.copy(material.normalScale), material.side === BackSide && uniforms.normalScale.value.negate()), material.displacementMap && (uniforms.displacementMap.value = material.displacementMap, refreshTransformUniform(material.displacementMap, uniforms.displacementMapTransform), uniforms.displacementScale.value = material.displacementScale, uniforms.displacementBias.value = material.displacementBias), material.emissiveMap && (uniforms.emissiveMap.value = material.emissiveMap, refreshTransformUniform(material.emissiveMap, uniforms.emissiveMapTransform)), material.specularMap && (uniforms.specularMap.value = material.specularMap, refreshTransformUniform(material.specularMap, uniforms.specularMapTransform)), material.alphaTest > 0 && (uniforms.alphaTest.value = material.alphaTest);
      let materialProperties = properties.get(material), envMap = materialProperties.envMap, envMapRotation = materialProperties.envMapRotation;
      envMap && (uniforms.envMap.value = envMap, _e1.copy(envMapRotation), _e1.x *= -1, _e1.y *= -1, _e1.z *= -1, envMap.isCubeTexture && envMap.isRenderTargetTexture === !1 && (_e1.y *= -1, _e1.z *= -1), uniforms.envMapRotation.value.setFromMatrix4(_m1.makeRotationFromEuler(_e1)), uniforms.flipEnvMap.value = envMap.isCubeTexture && envMap.isRenderTargetTexture === !1 ? -1 : 1, uniforms.reflectivity.value = material.reflectivity, uniforms.ior.value = material.ior, uniforms.refractionRatio.value = material.refractionRatio), material.lightMap && (uniforms.lightMap.value = material.lightMap, uniforms.lightMapIntensity.value = material.lightMapIntensity, refreshTransformUniform(material.lightMap, uniforms.lightMapTransform)), material.aoMap && (uniforms.aoMap.value = material.aoMap, uniforms.aoMapIntensity.value = material.aoMapIntensity, refreshTransformUniform(material.aoMap, uniforms.aoMapTransform));
    }
    function refreshUniformsLine(uniforms, material) {
      uniforms.diffuse.value.copy(material.color), uniforms.opacity.value = material.opacity, material.map && (uniforms.map.value = material.map, refreshTransformUniform(material.map, uniforms.mapTransform));
    }
    function refreshUniformsDash(uniforms, material) {
      uniforms.dashSize.value = material.dashSize, uniforms.totalSize.value = material.dashSize + material.gapSize, uniforms.scale.value = material.scale;
    }
    function refreshUniformsPoints(uniforms, material, pixelRatio, height) {
      uniforms.diffuse.value.copy(material.color), uniforms.opacity.value = material.opacity, uniforms.size.value = material.size * pixelRatio, uniforms.scale.value = height * 0.5, material.map && (uniforms.map.value = material.map, refreshTransformUniform(material.map, uniforms.uvTransform)), material.alphaMap && (uniforms.alphaMap.value = material.alphaMap, refreshTransformUniform(material.alphaMap, uniforms.alphaMapTransform)), material.alphaTest > 0 && (uniforms.alphaTest.value = material.alphaTest);
    }
    function refreshUniformsSprites(uniforms, material) {
      uniforms.diffuse.value.copy(material.color), uniforms.opacity.value = material.opacity, uniforms.rotation.value = material.rotation, material.map && (uniforms.map.value = material.map, refreshTransformUniform(material.map, uniforms.mapTransform)), material.alphaMap && (uniforms.alphaMap.value = material.alphaMap, refreshTransformUniform(material.alphaMap, uniforms.alphaMapTransform)), material.alphaTest > 0 && (uniforms.alphaTest.value = material.alphaTest);
    }
    function refreshUniformsPhong(uniforms, material) {
      uniforms.specular.value.copy(material.specular), uniforms.shininess.value = Math.max(material.shininess, 1e-4);
    }
    function refreshUniformsToon(uniforms, material) {
      material.gradientMap && (uniforms.gradientMap.value = material.gradientMap);
    }
    function refreshUniformsStandard(uniforms, material) {
      uniforms.metalness.value = material.metalness, material.metalnessMap && (uniforms.metalnessMap.value = material.metalnessMap, refreshTransformUniform(material.metalnessMap, uniforms.metalnessMapTransform)), uniforms.roughness.value = material.roughness, material.roughnessMap && (uniforms.roughnessMap.value = material.roughnessMap, refreshTransformUniform(material.roughnessMap, uniforms.roughnessMapTransform)), material.envMap && (uniforms.envMapIntensity.value = material.envMapIntensity);
    }
    function refreshUniformsPhysical(uniforms, material, transmissionRenderTarget) {
      uniforms.ior.value = material.ior, material.sheen > 0 && (uniforms.sheenColor.value.copy(material.sheenColor).multiplyScalar(material.sheen), uniforms.sheenRoughness.value = material.sheenRoughness, material.sheenColorMap && (uniforms.sheenColorMap.value = material.sheenColorMap, refreshTransformUniform(material.sheenColorMap, uniforms.sheenColorMapTransform)), material.sheenRoughnessMap && (uniforms.sheenRoughnessMap.value = material.sheenRoughnessMap, refreshTransformUniform(material.sheenRoughnessMap, uniforms.sheenRoughnessMapTransform))), material.clearcoat > 0 && (uniforms.clearcoat.value = material.clearcoat, uniforms.clearcoatRoughness.value = material.clearcoatRoughness, material.clearcoatMap && (uniforms.clearcoatMap.value = material.clearcoatMap, refreshTransformUniform(material.clearcoatMap, uniforms.clearcoatMapTransform)), material.clearcoatRoughnessMap && (uniforms.clearcoatRoughnessMap.value = material.clearcoatRoughnessMap, refreshTransformUniform(material.clearcoatRoughnessMap, uniforms.clearcoatRoughnessMapTransform)), material.clearcoatNormalMap && (uniforms.clearcoatNormalMap.value = material.clearcoatNormalMap, refreshTransformUniform(material.clearcoatNormalMap, uniforms.clearcoatNormalMapTransform), uniforms.clearcoatNormalScale.value.copy(material.clearcoatNormalScale), material.side === BackSide && uniforms.clearcoatNormalScale.value.negate())), material.dispersion > 0 && (uniforms.dispersion.value = material.dispersion), material.iridescence > 0 && (uniforms.iridescence.value = material.iridescence, uniforms.iridescenceIOR.value = material.iridescenceIOR, uniforms.iridescenceThicknessMinimum.value = material.iridescenceThicknessRange[0], uniforms.iridescenceThicknessMaximum.value = material.iridescenceThicknessRange[1], material.iridescenceMap && (uniforms.iridescenceMap.value = material.iridescenceMap, refreshTransformUniform(material.iridescenceMap, uniforms.iridescenceMapTransform)), material.iridescenceThicknessMap && (uniforms.iridescenceThicknessMap.value = material.iridescenceThicknessMap, refreshTransformUniform(material.iridescenceThicknessMap, uniforms.iridescenceThicknessMapTransform))), material.transmission > 0 && (uniforms.transmission.value = material.transmission, uniforms.transmissionSamplerMap.value = transmissionRenderTarget.texture, uniforms.transmissionSamplerSize.value.set(transmissionRenderTarget.width, transmissionRenderTarget.height), material.transmissionMap && (uniforms.transmissionMap.value = material.transmissionMap, refreshTransformUniform(material.transmissionMap, uniforms.transmissionMapTransform)), uniforms.thickness.value = material.thickness, material.thicknessMap && (uniforms.thicknessMap.value = material.thicknessMap, refreshTransformUniform(material.thicknessMap, uniforms.thicknessMapTransform)), uniforms.attenuationDistance.value = material.attenuationDistance, uniforms.attenuationColor.value.copy(material.attenuationColor)), material.anisotropy > 0 && (uniforms.anisotropyVector.value.set(material.anisotropy * Math.cos(material.anisotropyRotation), material.anisotropy * Math.sin(material.anisotropyRotation)), material.anisotropyMap && (uniforms.anisotropyMap.value = material.anisotropyMap, refreshTransformUniform(material.anisotropyMap, uniforms.anisotropyMapTransform))), uniforms.specularIntensity.value = material.specularIntensity, uniforms.specularColor.value.copy(material.specularColor), material.specularColorMap && (uniforms.specularColorMap.value = material.specularColorMap, refreshTransformUniform(material.specularColorMap, uniforms.specularColorMapTransform)), material.specularIntensityMap && (uniforms.specularIntensityMap.value = material.specularIntensityMap, refreshTransformUniform(material.specularIntensityMap, uniforms.specularIntensityMapTransform));
    }
    function refreshUniformsMatcap(uniforms, material) {
      material.matcap && (uniforms.matcap.value = material.matcap);
    }
    function refreshUniformsDistance(uniforms, material) {
      let light = properties.get(material).light;
      uniforms.referencePosition.value.setFromMatrixPosition(light.matrixWorld), uniforms.nearDistance.value = light.shadow.camera.near, uniforms.farDistance.value = light.shadow.camera.far;
    }
    return {
      refreshFogUniforms,
      refreshMaterialUniforms
    };
  }
  function WebGLUniformsGroups(gl, info, capabilities, state) {
    let buffers = {}, updateList = {}, allocatedBindingPoints = [], maxBindingPoints = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
    function bind(uniformsGroup, program) {
      let webglProgram = program.program;
      state.uniformBlockBinding(uniformsGroup, webglProgram);
    }
    function update(uniformsGroup, program) {
      let buffer = buffers[uniformsGroup.id];
      buffer === void 0 && (prepareUniformsGroup(uniformsGroup), buffer = createBuffer(uniformsGroup), buffers[uniformsGroup.id] = buffer, uniformsGroup.addEventListener("dispose", onUniformsGroupsDispose));
      let webglProgram = program.program;
      state.updateUBOMapping(uniformsGroup, webglProgram);
      let frame = info.render.frame;
      updateList[uniformsGroup.id] !== frame && (updateBufferData(uniformsGroup), updateList[uniformsGroup.id] = frame);
    }
    function createBuffer(uniformsGroup) {
      let bindingPointIndex = allocateBindingPointIndex();
      uniformsGroup.__bindingPointIndex = bindingPointIndex;
      let buffer = gl.createBuffer(), size = uniformsGroup.__size, usage = uniformsGroup.usage;
      return gl.bindBuffer(gl.UNIFORM_BUFFER, buffer), gl.bufferData(gl.UNIFORM_BUFFER, size, usage), gl.bindBuffer(gl.UNIFORM_BUFFER, null), gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPointIndex, buffer), buffer;
    }
    function allocateBindingPointIndex() {
      for (let i = 0; i < maxBindingPoints; i++)
        if (allocatedBindingPoints.indexOf(i) === -1)
          return allocatedBindingPoints.push(i), i;
      return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
    }
    function updateBufferData(uniformsGroup) {
      let buffer = buffers[uniformsGroup.id], uniforms = uniformsGroup.uniforms, cache = uniformsGroup.__cache;
      gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
      for (let i = 0, il = uniforms.length; i < il; i++) {
        let uniformArray = Array.isArray(uniforms[i]) ? uniforms[i] : [uniforms[i]];
        for (let j = 0, jl = uniformArray.length; j < jl; j++) {
          let uniform = uniformArray[j];
          if (hasUniformChanged(uniform, i, j, cache) === !0) {
            let offset = uniform.__offset, values = Array.isArray(uniform.value) ? uniform.value : [uniform.value], arrayOffset = 0;
            for (let k = 0; k < values.length; k++) {
              let value = values[k], info2 = getUniformSize(value);
              typeof value == "number" || typeof value == "boolean" ? (uniform.__data[0] = value, gl.bufferSubData(gl.UNIFORM_BUFFER, offset + arrayOffset, uniform.__data)) : value.isMatrix3 ? (uniform.__data[0] = value.elements[0], uniform.__data[1] = value.elements[1], uniform.__data[2] = value.elements[2], uniform.__data[3] = 0, uniform.__data[4] = value.elements[3], uniform.__data[5] = value.elements[4], uniform.__data[6] = value.elements[5], uniform.__data[7] = 0, uniform.__data[8] = value.elements[6], uniform.__data[9] = value.elements[7], uniform.__data[10] = value.elements[8], uniform.__data[11] = 0) : (value.toArray(uniform.__data, arrayOffset), arrayOffset += info2.storage / Float32Array.BYTES_PER_ELEMENT);
            }
            gl.bufferSubData(gl.UNIFORM_BUFFER, offset, uniform.__data);
          }
        }
      }
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }
    function hasUniformChanged(uniform, index, indexArray, cache) {
      let value = uniform.value, indexString = index + "_" + indexArray;
      if (cache[indexString] === void 0)
        return typeof value == "number" || typeof value == "boolean" ? cache[indexString] = value : cache[indexString] = value.clone(), !0;
      {
        let cachedObject = cache[indexString];
        if (typeof value == "number" || typeof value == "boolean") {
          if (cachedObject !== value)
            return cache[indexString] = value, !0;
        } else if (cachedObject.equals(value) === !1)
          return cachedObject.copy(value), !0;
      }
      return !1;
    }
    function prepareUniformsGroup(uniformsGroup) {
      let uniforms = uniformsGroup.uniforms, offset = 0, chunkSize = 16;
      for (let i = 0, l = uniforms.length; i < l; i++) {
        let uniformArray = Array.isArray(uniforms[i]) ? uniforms[i] : [uniforms[i]];
        for (let j = 0, jl = uniformArray.length; j < jl; j++) {
          let uniform = uniformArray[j], values = Array.isArray(uniform.value) ? uniform.value : [uniform.value];
          for (let k = 0, kl = values.length; k < kl; k++) {
            let value = values[k], info2 = getUniformSize(value), chunkOffset2 = offset % chunkSize, chunkPadding = chunkOffset2 % info2.boundary, chunkStart = chunkOffset2 + chunkPadding;
            offset += chunkPadding, chunkStart !== 0 && chunkSize - chunkStart < info2.storage && (offset += chunkSize - chunkStart), uniform.__data = new Float32Array(info2.storage / Float32Array.BYTES_PER_ELEMENT), uniform.__offset = offset, offset += info2.storage;
          }
        }
      }
      let chunkOffset = offset % chunkSize;
      return chunkOffset > 0 && (offset += chunkSize - chunkOffset), uniformsGroup.__size = offset, uniformsGroup.__cache = {}, this;
    }
    function getUniformSize(value) {
      let info2 = {
        boundary: 0,
        // bytes
        storage: 0
        // bytes
      };
      return typeof value == "number" || typeof value == "boolean" ? (info2.boundary = 4, info2.storage = 4) : value.isVector2 ? (info2.boundary = 8, info2.storage = 8) : value.isVector3 || value.isColor ? (info2.boundary = 16, info2.storage = 12) : value.isVector4 ? (info2.boundary = 16, info2.storage = 16) : value.isMatrix3 ? (info2.boundary = 48, info2.storage = 48) : value.isMatrix4 ? (info2.boundary = 64, info2.storage = 64) : value.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", value), info2;
    }
    function onUniformsGroupsDispose(event) {
      let uniformsGroup = event.target;
      uniformsGroup.removeEventListener("dispose", onUniformsGroupsDispose);
      let index = allocatedBindingPoints.indexOf(uniformsGroup.__bindingPointIndex);
      allocatedBindingPoints.splice(index, 1), gl.deleteBuffer(buffers[uniformsGroup.id]), delete buffers[uniformsGroup.id], delete updateList[uniformsGroup.id];
    }
    function dispose() {
      for (let id in buffers)
        gl.deleteBuffer(buffers[id]);
      allocatedBindingPoints = [], buffers = {}, updateList = {};
    }
    return {
      bind,
      update,
      dispose
    };
  }
  var WebGLRenderer = class {
    constructor(parameters = {}) {
      let {
        canvas = createCanvasElement(),
        context = null,
        depth = !0,
        stencil = !1,
        alpha = !1,
        antialias = !1,
        premultipliedAlpha = !0,
        preserveDrawingBuffer = !1,
        powerPreference = "default",
        failIfMajorPerformanceCaveat = !1
      } = parameters;
      this.isWebGLRenderer = !0;
      let _alpha;
      if (context !== null) {
        if (typeof WebGLRenderingContext < "u" && context instanceof WebGLRenderingContext)
          throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
        _alpha = context.getContextAttributes().alpha;
      } else
        _alpha = alpha;
      let uintClearColor = new Uint32Array(4), intClearColor = new Int32Array(4), currentRenderList = null, currentRenderState = null, renderListStack = [], renderStateStack = [];
      this.domElement = canvas, this.debug = {
        /**
         * Enables error checking and reporting when shader programs are being compiled
         * @type {boolean}
         */
        checkShaderErrors: !0,
        /**
         * Callback for custom error reporting.
         * @type {?Function}
         */
        onShaderError: null
      }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = SRGBColorSpace, this.toneMapping = NoToneMapping, this.toneMappingExposure = 1;
      let _this = this, _isContextLost = !1, _currentActiveCubeFace = 0, _currentActiveMipmapLevel = 0, _currentRenderTarget = null, _currentMaterialId = -1, _currentCamera = null, _currentViewport = new Vector4(), _currentScissor = new Vector4(), _currentScissorTest = null, _currentClearColor = new Color(0), _currentClearAlpha = 0, _width = canvas.width, _height = canvas.height, _pixelRatio = 1, _opaqueSort = null, _transparentSort = null, _viewport = new Vector4(0, 0, _width, _height), _scissor = new Vector4(0, 0, _width, _height), _scissorTest = !1, _frustum = new Frustum(), _clippingEnabled = !1, _localClippingEnabled = !1, _projScreenMatrix = new Matrix4(), _vector3 = new Vector3(), _vector4 = new Vector4(), _emptyScene = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 }, _renderBackground = !1;
      function getTargetPixelRatio() {
        return _currentRenderTarget === null ? _pixelRatio : 1;
      }
      let _gl = context;
      function getContext(contextName, contextAttributes) {
        return canvas.getContext(contextName, contextAttributes);
      }
      try {
        let contextAttributes = {
          alpha: !0,
          depth,
          stencil,
          antialias,
          premultipliedAlpha,
          preserveDrawingBuffer,
          powerPreference,
          failIfMajorPerformanceCaveat
        };
        if ("setAttribute" in canvas && canvas.setAttribute("data-engine", `three.js r${REVISION}`), canvas.addEventListener("webglcontextlost", onContextLost, !1), canvas.addEventListener("webglcontextrestored", onContextRestore, !1), canvas.addEventListener("webglcontextcreationerror", onContextCreationError, !1), _gl === null) {
          let contextName = "webgl2";
          if (_gl = getContext(contextName, contextAttributes), _gl === null)
            throw getContext(contextName) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
        }
      } catch (error) {
        throw console.error("THREE.WebGLRenderer: " + error.message), error;
      }
      let extensions, capabilities, state, info, properties, textures, cubemaps, cubeuvmaps, attributes, geometries, objects, programCache, materials, renderLists, renderStates, clipping, shadowMap, background, morphtargets, bufferRenderer, indexedBufferRenderer, utils, bindingStates, uniformsGroups;
      function initGLContext() {
        extensions = new WebGLExtensions(_gl), extensions.init(), utils = new WebGLUtils(_gl, extensions), capabilities = new WebGLCapabilities(_gl, extensions, parameters, utils), state = new WebGLState(_gl), info = new WebGLInfo(_gl), properties = new WebGLProperties(), textures = new WebGLTextures(_gl, extensions, state, properties, capabilities, utils, info), cubemaps = new WebGLCubeMaps(_this), cubeuvmaps = new WebGLCubeUVMaps(_this), attributes = new WebGLAttributes(_gl), bindingStates = new WebGLBindingStates(_gl, attributes), geometries = new WebGLGeometries(_gl, attributes, info, bindingStates), objects = new WebGLObjects(_gl, geometries, attributes, info), morphtargets = new WebGLMorphtargets(_gl, capabilities, textures), clipping = new WebGLClipping(properties), programCache = new WebGLPrograms(_this, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping), materials = new WebGLMaterials(_this, properties), renderLists = new WebGLRenderLists(), renderStates = new WebGLRenderStates(extensions), background = new WebGLBackground(_this, cubemaps, cubeuvmaps, state, objects, _alpha, premultipliedAlpha), shadowMap = new WebGLShadowMap(_this, objects, capabilities), uniformsGroups = new WebGLUniformsGroups(_gl, info, capabilities, state), bufferRenderer = new WebGLBufferRenderer(_gl, extensions, info), indexedBufferRenderer = new WebGLIndexedBufferRenderer(_gl, extensions, info), info.programs = programCache.programs, _this.capabilities = capabilities, _this.extensions = extensions, _this.properties = properties, _this.renderLists = renderLists, _this.shadowMap = shadowMap, _this.state = state, _this.info = info;
      }
      initGLContext();
      let xr = new WebXRManager(_this, _gl);
      this.xr = xr, this.getContext = function() {
        return _gl;
      }, this.getContextAttributes = function() {
        return _gl.getContextAttributes();
      }, this.forceContextLoss = function() {
        let extension = extensions.get("WEBGL_lose_context");
        extension && extension.loseContext();
      }, this.forceContextRestore = function() {
        let extension = extensions.get("WEBGL_lose_context");
        extension && extension.restoreContext();
      }, this.getPixelRatio = function() {
        return _pixelRatio;
      }, this.setPixelRatio = function(value) {
        value !== void 0 && (_pixelRatio = value, this.setSize(_width, _height, !1));
      }, this.getSize = function(target) {
        return target.set(_width, _height);
      }, this.setSize = function(width, height, updateStyle = !0) {
        if (xr.isPresenting) {
          console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
          return;
        }
        _width = width, _height = height, canvas.width = Math.floor(width * _pixelRatio), canvas.height = Math.floor(height * _pixelRatio), updateStyle === !0 && (canvas.style.width = width + "px", canvas.style.height = height + "px"), this.setViewport(0, 0, width, height);
      }, this.getDrawingBufferSize = function(target) {
        return target.set(_width * _pixelRatio, _height * _pixelRatio).floor();
      }, this.setDrawingBufferSize = function(width, height, pixelRatio) {
        _width = width, _height = height, _pixelRatio = pixelRatio, canvas.width = Math.floor(width * pixelRatio), canvas.height = Math.floor(height * pixelRatio), this.setViewport(0, 0, width, height);
      }, this.getCurrentViewport = function(target) {
        return target.copy(_currentViewport);
      }, this.getViewport = function(target) {
        return target.copy(_viewport);
      }, this.setViewport = function(x, y, width, height) {
        x.isVector4 ? _viewport.set(x.x, x.y, x.z, x.w) : _viewport.set(x, y, width, height), state.viewport(_currentViewport.copy(_viewport).multiplyScalar(_pixelRatio).round());
      }, this.getScissor = function(target) {
        return target.copy(_scissor);
      }, this.setScissor = function(x, y, width, height) {
        x.isVector4 ? _scissor.set(x.x, x.y, x.z, x.w) : _scissor.set(x, y, width, height), state.scissor(_currentScissor.copy(_scissor).multiplyScalar(_pixelRatio).round());
      }, this.getScissorTest = function() {
        return _scissorTest;
      }, this.setScissorTest = function(boolean) {
        state.setScissorTest(_scissorTest = boolean);
      }, this.setOpaqueSort = function(method) {
        _opaqueSort = method;
      }, this.setTransparentSort = function(method) {
        _transparentSort = method;
      }, this.getClearColor = function(target) {
        return target.copy(background.getClearColor());
      }, this.setClearColor = function() {
        background.setClearColor.apply(background, arguments);
      }, this.getClearAlpha = function() {
        return background.getClearAlpha();
      }, this.setClearAlpha = function() {
        background.setClearAlpha.apply(background, arguments);
      }, this.clear = function(color = !0, depth2 = !0, stencil2 = !0) {
        let bits = 0;
        if (color) {
          let isIntegerFormat = !1;
          if (_currentRenderTarget !== null) {
            let targetFormat = _currentRenderTarget.texture.format;
            isIntegerFormat = targetFormat === RGBAIntegerFormat || targetFormat === RGIntegerFormat || targetFormat === RedIntegerFormat;
          }
          if (isIntegerFormat) {
            let targetType = _currentRenderTarget.texture.type, isUnsignedType = targetType === UnsignedByteType || targetType === UnsignedIntType || targetType === UnsignedShortType || targetType === UnsignedInt248Type || targetType === UnsignedShort4444Type || targetType === UnsignedShort5551Type, clearColor = background.getClearColor(), a = background.getClearAlpha(), r = clearColor.r, g = clearColor.g, b = clearColor.b;
            isUnsignedType ? (uintClearColor[0] = r, uintClearColor[1] = g, uintClearColor[2] = b, uintClearColor[3] = a, _gl.clearBufferuiv(_gl.COLOR, 0, uintClearColor)) : (intClearColor[0] = r, intClearColor[1] = g, intClearColor[2] = b, intClearColor[3] = a, _gl.clearBufferiv(_gl.COLOR, 0, intClearColor));
          } else
            bits |= _gl.COLOR_BUFFER_BIT;
        }
        depth2 && (bits |= _gl.DEPTH_BUFFER_BIT), stencil2 && (bits |= _gl.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), _gl.clear(bits);
      }, this.clearColor = function() {
        this.clear(!0, !1, !1);
      }, this.clearDepth = function() {
        this.clear(!1, !0, !1);
      }, this.clearStencil = function() {
        this.clear(!1, !1, !0);
      }, this.dispose = function() {
        canvas.removeEventListener("webglcontextlost", onContextLost, !1), canvas.removeEventListener("webglcontextrestored", onContextRestore, !1), canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, !1), renderLists.dispose(), renderStates.dispose(), properties.dispose(), cubemaps.dispose(), cubeuvmaps.dispose(), objects.dispose(), bindingStates.dispose(), uniformsGroups.dispose(), programCache.dispose(), xr.dispose(), xr.removeEventListener("sessionstart", onXRSessionStart), xr.removeEventListener("sessionend", onXRSessionEnd), animation.stop();
      };
      function onContextLost(event) {
        event.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), _isContextLost = !0;
      }
      function onContextRestore() {
        console.log("THREE.WebGLRenderer: Context Restored."), _isContextLost = !1;
        let infoAutoReset = info.autoReset, shadowMapEnabled = shadowMap.enabled, shadowMapAutoUpdate = shadowMap.autoUpdate, shadowMapNeedsUpdate = shadowMap.needsUpdate, shadowMapType = shadowMap.type;
        initGLContext(), info.autoReset = infoAutoReset, shadowMap.enabled = shadowMapEnabled, shadowMap.autoUpdate = shadowMapAutoUpdate, shadowMap.needsUpdate = shadowMapNeedsUpdate, shadowMap.type = shadowMapType;
      }
      function onContextCreationError(event) {
        console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", event.statusMessage);
      }
      function onMaterialDispose(event) {
        let material = event.target;
        material.removeEventListener("dispose", onMaterialDispose), deallocateMaterial(material);
      }
      function deallocateMaterial(material) {
        releaseMaterialProgramReferences(material), properties.remove(material);
      }
      function releaseMaterialProgramReferences(material) {
        let programs = properties.get(material).programs;
        programs !== void 0 && (programs.forEach(function(program) {
          programCache.releaseProgram(program);
        }), material.isShaderMaterial && programCache.releaseShaderCache(material));
      }
      this.renderBufferDirect = function(camera, scene, geometry, material, object, group) {
        scene === null && (scene = _emptyScene);
        let frontFaceCW = object.isMesh && object.matrixWorld.determinant() < 0, program = setProgram(camera, scene, geometry, material, object);
        state.setMaterial(material, frontFaceCW);
        let index = geometry.index, rangeFactor = 1;
        if (material.wireframe === !0) {
          if (index = geometries.getWireframeAttribute(geometry), index === void 0) return;
          rangeFactor = 2;
        }
        let drawRange = geometry.drawRange, position = geometry.attributes.position, drawStart = drawRange.start * rangeFactor, drawEnd = (drawRange.start + drawRange.count) * rangeFactor;
        group !== null && (drawStart = Math.max(drawStart, group.start * rangeFactor), drawEnd = Math.min(drawEnd, (group.start + group.count) * rangeFactor)), index !== null ? (drawStart = Math.max(drawStart, 0), drawEnd = Math.min(drawEnd, index.count)) : position != null && (drawStart = Math.max(drawStart, 0), drawEnd = Math.min(drawEnd, position.count));
        let drawCount = drawEnd - drawStart;
        if (drawCount < 0 || drawCount === 1 / 0) return;
        bindingStates.setup(object, material, program, geometry, index);
        let attribute, renderer = bufferRenderer;
        if (index !== null && (attribute = attributes.get(index), renderer = indexedBufferRenderer, renderer.setIndex(attribute)), object.isMesh)
          material.wireframe === !0 ? (state.setLineWidth(material.wireframeLinewidth * getTargetPixelRatio()), renderer.setMode(_gl.LINES)) : renderer.setMode(_gl.TRIANGLES);
        else if (object.isLine) {
          let lineWidth = material.linewidth;
          lineWidth === void 0 && (lineWidth = 1), state.setLineWidth(lineWidth * getTargetPixelRatio()), object.isLineSegments ? renderer.setMode(_gl.LINES) : object.isLineLoop ? renderer.setMode(_gl.LINE_LOOP) : renderer.setMode(_gl.LINE_STRIP);
        } else object.isPoints ? renderer.setMode(_gl.POINTS) : object.isSprite && renderer.setMode(_gl.TRIANGLES);
        if (object.isBatchedMesh)
          if (object._multiDrawInstances !== null)
            renderer.renderMultiDrawInstances(object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount, object._multiDrawInstances);
          else if (extensions.get("WEBGL_multi_draw"))
            renderer.renderMultiDraw(object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount);
          else {
            let starts = object._multiDrawStarts, counts = object._multiDrawCounts, drawCount2 = object._multiDrawCount, bytesPerElement = index ? attributes.get(index).bytesPerElement : 1, uniforms = properties.get(material).currentProgram.getUniforms();
            for (let i = 0; i < drawCount2; i++)
              uniforms.setValue(_gl, "_gl_DrawID", i), renderer.render(starts[i] / bytesPerElement, counts[i]);
          }
        else if (object.isInstancedMesh)
          renderer.renderInstances(drawStart, drawCount, object.count);
        else if (geometry.isInstancedBufferGeometry) {
          let maxInstanceCount = geometry._maxInstanceCount !== void 0 ? geometry._maxInstanceCount : 1 / 0, instanceCount = Math.min(geometry.instanceCount, maxInstanceCount);
          renderer.renderInstances(drawStart, drawCount, instanceCount);
        } else
          renderer.render(drawStart, drawCount);
      };
      function prepareMaterial(material, scene, object) {
        material.transparent === !0 && material.side === DoubleSide && material.forceSinglePass === !1 ? (material.side = BackSide, material.needsUpdate = !0, getProgram(material, scene, object), material.side = FrontSide, material.needsUpdate = !0, getProgram(material, scene, object), material.side = DoubleSide) : getProgram(material, scene, object);
      }
      this.compile = function(scene, camera, targetScene = null) {
        targetScene === null && (targetScene = scene), currentRenderState = renderStates.get(targetScene), currentRenderState.init(camera), renderStateStack.push(currentRenderState), targetScene.traverseVisible(function(object) {
          object.isLight && object.layers.test(camera.layers) && (currentRenderState.pushLight(object), object.castShadow && currentRenderState.pushShadow(object));
        }), scene !== targetScene && scene.traverseVisible(function(object) {
          object.isLight && object.layers.test(camera.layers) && (currentRenderState.pushLight(object), object.castShadow && currentRenderState.pushShadow(object));
        }), currentRenderState.setupLights();
        let materials2 = /* @__PURE__ */ new Set();
        return scene.traverse(function(object) {
          let material = object.material;
          if (material)
            if (Array.isArray(material))
              for (let i = 0; i < material.length; i++) {
                let material2 = material[i];
                prepareMaterial(material2, targetScene, object), materials2.add(material2);
              }
            else
              prepareMaterial(material, targetScene, object), materials2.add(material);
        }), renderStateStack.pop(), currentRenderState = null, materials2;
      }, this.compileAsync = function(scene, camera, targetScene = null) {
        let materials2 = this.compile(scene, camera, targetScene);
        return new Promise((resolve) => {
          function checkMaterialsReady() {
            if (materials2.forEach(function(material) {
              properties.get(material).currentProgram.isReady() && materials2.delete(material);
            }), materials2.size === 0) {
              resolve(scene);
              return;
            }
            setTimeout(checkMaterialsReady, 10);
          }
          extensions.get("KHR_parallel_shader_compile") !== null ? checkMaterialsReady() : setTimeout(checkMaterialsReady, 10);
        });
      };
      let onAnimationFrameCallback = null;
      function onAnimationFrame(time) {
        onAnimationFrameCallback && onAnimationFrameCallback(time);
      }
      function onXRSessionStart() {
        animation.stop();
      }
      function onXRSessionEnd() {
        animation.start();
      }
      let animation = new WebGLAnimation();
      animation.setAnimationLoop(onAnimationFrame), typeof self < "u" && animation.setContext(self), this.setAnimationLoop = function(callback) {
        onAnimationFrameCallback = callback, xr.setAnimationLoop(callback), callback === null ? animation.stop() : animation.start();
      }, xr.addEventListener("sessionstart", onXRSessionStart), xr.addEventListener("sessionend", onXRSessionEnd), this.render = function(scene, camera) {
        if (camera !== void 0 && camera.isCamera !== !0) {
          console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
          return;
        }
        if (_isContextLost === !0) return;
        if (scene.matrixWorldAutoUpdate === !0 && scene.updateMatrixWorld(), camera.parent === null && camera.matrixWorldAutoUpdate === !0 && camera.updateMatrixWorld(), xr.enabled === !0 && xr.isPresenting === !0 && (xr.cameraAutoUpdate === !0 && xr.updateCamera(camera), camera = xr.getCamera()), scene.isScene === !0 && scene.onBeforeRender(_this, scene, camera, _currentRenderTarget), currentRenderState = renderStates.get(scene, renderStateStack.length), currentRenderState.init(camera), renderStateStack.push(currentRenderState), _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse), _frustum.setFromProjectionMatrix(_projScreenMatrix), _localClippingEnabled = this.localClippingEnabled, _clippingEnabled = clipping.init(this.clippingPlanes, _localClippingEnabled), currentRenderList = renderLists.get(scene, renderListStack.length), currentRenderList.init(), renderListStack.push(currentRenderList), xr.enabled === !0 && xr.isPresenting === !0) {
          let depthSensingMesh = _this.xr.getDepthSensingMesh();
          depthSensingMesh !== null && projectObject(depthSensingMesh, camera, -1 / 0, _this.sortObjects);
        }
        projectObject(scene, camera, 0, _this.sortObjects), currentRenderList.finish(), _this.sortObjects === !0 && currentRenderList.sort(_opaqueSort, _transparentSort), _renderBackground = xr.enabled === !1 || xr.isPresenting === !1 || xr.hasDepthSensing() === !1, _renderBackground && background.addToRenderList(currentRenderList, scene), this.info.render.frame++, _clippingEnabled === !0 && clipping.beginShadows();
        let shadowsArray = currentRenderState.state.shadowsArray;
        shadowMap.render(shadowsArray, scene, camera), _clippingEnabled === !0 && clipping.endShadows(), this.info.autoReset === !0 && this.info.reset();
        let opaqueObjects = currentRenderList.opaque, transmissiveObjects = currentRenderList.transmissive;
        if (currentRenderState.setupLights(), camera.isArrayCamera) {
          let cameras = camera.cameras;
          if (transmissiveObjects.length > 0)
            for (let i = 0, l = cameras.length; i < l; i++) {
              let camera2 = cameras[i];
              renderTransmissionPass(opaqueObjects, transmissiveObjects, scene, camera2);
            }
          _renderBackground && background.render(scene);
          for (let i = 0, l = cameras.length; i < l; i++) {
            let camera2 = cameras[i];
            renderScene(currentRenderList, scene, camera2, camera2.viewport);
          }
        } else
          transmissiveObjects.length > 0 && renderTransmissionPass(opaqueObjects, transmissiveObjects, scene, camera), _renderBackground && background.render(scene), renderScene(currentRenderList, scene, camera);
        _currentRenderTarget !== null && (textures.updateMultisampleRenderTarget(_currentRenderTarget), textures.updateRenderTargetMipmap(_currentRenderTarget)), scene.isScene === !0 && scene.onAfterRender(_this, scene, camera), bindingStates.resetDefaultState(), _currentMaterialId = -1, _currentCamera = null, renderStateStack.pop(), renderStateStack.length > 0 ? (currentRenderState = renderStateStack[renderStateStack.length - 1], _clippingEnabled === !0 && clipping.setGlobalState(_this.clippingPlanes, currentRenderState.state.camera)) : currentRenderState = null, renderListStack.pop(), renderListStack.length > 0 ? currentRenderList = renderListStack[renderListStack.length - 1] : currentRenderList = null;
      };
      function projectObject(object, camera, groupOrder, sortObjects) {
        if (object.visible === !1) return;
        if (object.layers.test(camera.layers)) {
          if (object.isGroup)
            groupOrder = object.renderOrder;
          else if (object.isLOD)
            object.autoUpdate === !0 && object.update(camera);
          else if (object.isLight)
            currentRenderState.pushLight(object), object.castShadow && currentRenderState.pushShadow(object);
          else if (object.isSprite) {
            if (!object.frustumCulled || _frustum.intersectsSprite(object)) {
              sortObjects && _vector4.setFromMatrixPosition(object.matrixWorld).applyMatrix4(_projScreenMatrix);
              let geometry = objects.update(object), material = object.material;
              material.visible && currentRenderList.push(object, geometry, material, groupOrder, _vector4.z, null);
            }
          } else if ((object.isMesh || object.isLine || object.isPoints) && (!object.frustumCulled || _frustum.intersectsObject(object))) {
            let geometry = objects.update(object), material = object.material;
            if (sortObjects && (object.boundingSphere !== void 0 ? (object.boundingSphere === null && object.computeBoundingSphere(), _vector4.copy(object.boundingSphere.center)) : (geometry.boundingSphere === null && geometry.computeBoundingSphere(), _vector4.copy(geometry.boundingSphere.center)), _vector4.applyMatrix4(object.matrixWorld).applyMatrix4(_projScreenMatrix)), Array.isArray(material)) {
              let groups = geometry.groups;
              for (let i = 0, l = groups.length; i < l; i++) {
                let group = groups[i], groupMaterial = material[group.materialIndex];
                groupMaterial && groupMaterial.visible && currentRenderList.push(object, geometry, groupMaterial, groupOrder, _vector4.z, group);
              }
            } else material.visible && currentRenderList.push(object, geometry, material, groupOrder, _vector4.z, null);
          }
        }
        let children = object.children;
        for (let i = 0, l = children.length; i < l; i++)
          projectObject(children[i], camera, groupOrder, sortObjects);
      }
      function renderScene(currentRenderList2, scene, camera, viewport) {
        let opaqueObjects = currentRenderList2.opaque, transmissiveObjects = currentRenderList2.transmissive, transparentObjects = currentRenderList2.transparent;
        currentRenderState.setupLightsView(camera), _clippingEnabled === !0 && clipping.setGlobalState(_this.clippingPlanes, camera), viewport && state.viewport(_currentViewport.copy(viewport)), opaqueObjects.length > 0 && renderObjects(opaqueObjects, scene, camera), transmissiveObjects.length > 0 && renderObjects(transmissiveObjects, scene, camera), transparentObjects.length > 0 && renderObjects(transparentObjects, scene, camera), state.buffers.depth.setTest(!0), state.buffers.depth.setMask(!0), state.buffers.color.setMask(!0), state.setPolygonOffset(!1);
      }
      function renderTransmissionPass(opaqueObjects, transmissiveObjects, scene, camera) {
        if ((scene.isScene === !0 ? scene.overrideMaterial : null) !== null)
          return;
        currentRenderState.state.transmissionRenderTarget[camera.id] === void 0 && (currentRenderState.state.transmissionRenderTarget[camera.id] = new WebGLRenderTarget(1, 1, {
          generateMipmaps: !0,
          type: extensions.has("EXT_color_buffer_half_float") || extensions.has("EXT_color_buffer_float") ? HalfFloatType : UnsignedByteType,
          minFilter: LinearMipmapLinearFilter,
          samples: 4,
          stencilBuffer: stencil,
          resolveDepthBuffer: !1,
          resolveStencilBuffer: !1,
          colorSpace: ColorManagement.workingColorSpace
        }));
        let transmissionRenderTarget = currentRenderState.state.transmissionRenderTarget[camera.id], activeViewport = camera.viewport || _currentViewport;
        transmissionRenderTarget.setSize(activeViewport.z, activeViewport.w);
        let currentRenderTarget = _this.getRenderTarget();
        _this.setRenderTarget(transmissionRenderTarget), _this.getClearColor(_currentClearColor), _currentClearAlpha = _this.getClearAlpha(), _currentClearAlpha < 1 && _this.setClearColor(16777215, 0.5), _this.clear(), _renderBackground && background.render(scene);
        let currentToneMapping = _this.toneMapping;
        _this.toneMapping = NoToneMapping;
        let currentCameraViewport = camera.viewport;
        if (camera.viewport !== void 0 && (camera.viewport = void 0), currentRenderState.setupLightsView(camera), _clippingEnabled === !0 && clipping.setGlobalState(_this.clippingPlanes, camera), renderObjects(opaqueObjects, scene, camera), textures.updateMultisampleRenderTarget(transmissionRenderTarget), textures.updateRenderTargetMipmap(transmissionRenderTarget), extensions.has("WEBGL_multisampled_render_to_texture") === !1) {
          let renderTargetNeedsUpdate = !1;
          for (let i = 0, l = transmissiveObjects.length; i < l; i++) {
            let renderItem = transmissiveObjects[i], object = renderItem.object, geometry = renderItem.geometry, material = renderItem.material, group = renderItem.group;
            if (material.side === DoubleSide && object.layers.test(camera.layers)) {
              let currentSide = material.side;
              material.side = BackSide, material.needsUpdate = !0, renderObject(object, scene, camera, geometry, material, group), material.side = currentSide, material.needsUpdate = !0, renderTargetNeedsUpdate = !0;
            }
          }
          renderTargetNeedsUpdate === !0 && (textures.updateMultisampleRenderTarget(transmissionRenderTarget), textures.updateRenderTargetMipmap(transmissionRenderTarget));
        }
        _this.setRenderTarget(currentRenderTarget), _this.setClearColor(_currentClearColor, _currentClearAlpha), currentCameraViewport !== void 0 && (camera.viewport = currentCameraViewport), _this.toneMapping = currentToneMapping;
      }
      function renderObjects(renderList, scene, camera) {
        let overrideMaterial = scene.isScene === !0 ? scene.overrideMaterial : null;
        for (let i = 0, l = renderList.length; i < l; i++) {
          let renderItem = renderList[i], object = renderItem.object, geometry = renderItem.geometry, material = overrideMaterial === null ? renderItem.material : overrideMaterial, group = renderItem.group;
          object.layers.test(camera.layers) && renderObject(object, scene, camera, geometry, material, group);
        }
      }
      function renderObject(object, scene, camera, geometry, material, group) {
        object.onBeforeRender(_this, scene, camera, geometry, material, group), object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld), object.normalMatrix.getNormalMatrix(object.modelViewMatrix), material.transparent === !0 && material.side === DoubleSide && material.forceSinglePass === !1 ? (material.side = BackSide, material.needsUpdate = !0, _this.renderBufferDirect(camera, scene, geometry, material, object, group), material.side = FrontSide, material.needsUpdate = !0, _this.renderBufferDirect(camera, scene, geometry, material, object, group), material.side = DoubleSide) : _this.renderBufferDirect(camera, scene, geometry, material, object, group), object.onAfterRender(_this, scene, camera, geometry, material, group);
      }
      function getProgram(material, scene, object) {
        scene.isScene !== !0 && (scene = _emptyScene);
        let materialProperties = properties.get(material), lights = currentRenderState.state.lights, shadowsArray = currentRenderState.state.shadowsArray, lightsStateVersion = lights.state.version, parameters2 = programCache.getParameters(material, lights.state, shadowsArray, scene, object), programCacheKey = programCache.getProgramCacheKey(parameters2), programs = materialProperties.programs;
        materialProperties.environment = material.isMeshStandardMaterial ? scene.environment : null, materialProperties.fog = scene.fog, materialProperties.envMap = (material.isMeshStandardMaterial ? cubeuvmaps : cubemaps).get(material.envMap || materialProperties.environment), materialProperties.envMapRotation = materialProperties.environment !== null && material.envMap === null ? scene.environmentRotation : material.envMapRotation, programs === void 0 && (material.addEventListener("dispose", onMaterialDispose), programs = /* @__PURE__ */ new Map(), materialProperties.programs = programs);
        let program = programs.get(programCacheKey);
        if (program !== void 0) {
          if (materialProperties.currentProgram === program && materialProperties.lightsStateVersion === lightsStateVersion)
            return updateCommonMaterialProperties(material, parameters2), program;
        } else
          parameters2.uniforms = programCache.getUniforms(material), material.onBeforeCompile(parameters2, _this), program = programCache.acquireProgram(parameters2, programCacheKey), programs.set(programCacheKey, program), materialProperties.uniforms = parameters2.uniforms;
        let uniforms = materialProperties.uniforms;
        return (!material.isShaderMaterial && !material.isRawShaderMaterial || material.clipping === !0) && (uniforms.clippingPlanes = clipping.uniform), updateCommonMaterialProperties(material, parameters2), materialProperties.needsLights = materialNeedsLights(material), materialProperties.lightsStateVersion = lightsStateVersion, materialProperties.needsLights && (uniforms.ambientLightColor.value = lights.state.ambient, uniforms.lightProbe.value = lights.state.probe, uniforms.directionalLights.value = lights.state.directional, uniforms.directionalLightShadows.value = lights.state.directionalShadow, uniforms.spotLights.value = lights.state.spot, uniforms.spotLightShadows.value = lights.state.spotShadow, uniforms.rectAreaLights.value = lights.state.rectArea, uniforms.ltc_1.value = lights.state.rectAreaLTC1, uniforms.ltc_2.value = lights.state.rectAreaLTC2, uniforms.pointLights.value = lights.state.point, uniforms.pointLightShadows.value = lights.state.pointShadow, uniforms.hemisphereLights.value = lights.state.hemi, uniforms.directionalShadowMap.value = lights.state.directionalShadowMap, uniforms.directionalShadowMatrix.value = lights.state.directionalShadowMatrix, uniforms.spotShadowMap.value = lights.state.spotShadowMap, uniforms.spotLightMatrix.value = lights.state.spotLightMatrix, uniforms.spotLightMap.value = lights.state.spotLightMap, uniforms.pointShadowMap.value = lights.state.pointShadowMap, uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix), materialProperties.currentProgram = program, materialProperties.uniformsList = null, program;
      }
      function getUniformList(materialProperties) {
        if (materialProperties.uniformsList === null) {
          let progUniforms = materialProperties.currentProgram.getUniforms();
          materialProperties.uniformsList = WebGLUniforms.seqWithValue(progUniforms.seq, materialProperties.uniforms);
        }
        return materialProperties.uniformsList;
      }
      function updateCommonMaterialProperties(material, parameters2) {
        let materialProperties = properties.get(material);
        materialProperties.outputColorSpace = parameters2.outputColorSpace, materialProperties.batching = parameters2.batching, materialProperties.batchingColor = parameters2.batchingColor, materialProperties.instancing = parameters2.instancing, materialProperties.instancingColor = parameters2.instancingColor, materialProperties.instancingMorph = parameters2.instancingMorph, materialProperties.skinning = parameters2.skinning, materialProperties.morphTargets = parameters2.morphTargets, materialProperties.morphNormals = parameters2.morphNormals, materialProperties.morphColors = parameters2.morphColors, materialProperties.morphTargetsCount = parameters2.morphTargetsCount, materialProperties.numClippingPlanes = parameters2.numClippingPlanes, materialProperties.numIntersection = parameters2.numClipIntersection, materialProperties.vertexAlphas = parameters2.vertexAlphas, materialProperties.vertexTangents = parameters2.vertexTangents, materialProperties.toneMapping = parameters2.toneMapping;
      }
      function setProgram(camera, scene, geometry, material, object) {
        scene.isScene !== !0 && (scene = _emptyScene), textures.resetTextureUnits();
        let fog = scene.fog, environment = material.isMeshStandardMaterial ? scene.environment : null, colorSpace = _currentRenderTarget === null ? _this.outputColorSpace : _currentRenderTarget.isXRRenderTarget === !0 ? _currentRenderTarget.texture.colorSpace : LinearSRGBColorSpace, envMap = (material.isMeshStandardMaterial ? cubeuvmaps : cubemaps).get(material.envMap || environment), vertexAlphas = material.vertexColors === !0 && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4, vertexTangents = !!geometry.attributes.tangent && (!!material.normalMap || material.anisotropy > 0), morphTargets = !!geometry.morphAttributes.position, morphNormals = !!geometry.morphAttributes.normal, morphColors = !!geometry.morphAttributes.color, toneMapping = NoToneMapping;
        material.toneMapped && (_currentRenderTarget === null || _currentRenderTarget.isXRRenderTarget === !0) && (toneMapping = _this.toneMapping);
        let morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color, morphTargetsCount = morphAttribute !== void 0 ? morphAttribute.length : 0, materialProperties = properties.get(material), lights = currentRenderState.state.lights;
        if (_clippingEnabled === !0 && (_localClippingEnabled === !0 || camera !== _currentCamera)) {
          let useCache = camera === _currentCamera && material.id === _currentMaterialId;
          clipping.setState(material, camera, useCache);
        }
        let needsProgramChange = !1;
        material.version === materialProperties.__version ? (materialProperties.needsLights && materialProperties.lightsStateVersion !== lights.state.version || materialProperties.outputColorSpace !== colorSpace || object.isBatchedMesh && materialProperties.batching === !1 || !object.isBatchedMesh && materialProperties.batching === !0 || object.isBatchedMesh && materialProperties.batchingColor === !0 && object.colorTexture === null || object.isBatchedMesh && materialProperties.batchingColor === !1 && object.colorTexture !== null || object.isInstancedMesh && materialProperties.instancing === !1 || !object.isInstancedMesh && materialProperties.instancing === !0 || object.isSkinnedMesh && materialProperties.skinning === !1 || !object.isSkinnedMesh && materialProperties.skinning === !0 || object.isInstancedMesh && materialProperties.instancingColor === !0 && object.instanceColor === null || object.isInstancedMesh && materialProperties.instancingColor === !1 && object.instanceColor !== null || object.isInstancedMesh && materialProperties.instancingMorph === !0 && object.morphTexture === null || object.isInstancedMesh && materialProperties.instancingMorph === !1 && object.morphTexture !== null || materialProperties.envMap !== envMap || material.fog === !0 && materialProperties.fog !== fog || materialProperties.numClippingPlanes !== void 0 && (materialProperties.numClippingPlanes !== clipping.numPlanes || materialProperties.numIntersection !== clipping.numIntersection) || materialProperties.vertexAlphas !== vertexAlphas || materialProperties.vertexTangents !== vertexTangents || materialProperties.morphTargets !== morphTargets || materialProperties.morphNormals !== morphNormals || materialProperties.morphColors !== morphColors || materialProperties.toneMapping !== toneMapping || materialProperties.morphTargetsCount !== morphTargetsCount) && (needsProgramChange = !0) : (needsProgramChange = !0, materialProperties.__version = material.version);
        let program = materialProperties.currentProgram;
        needsProgramChange === !0 && (program = getProgram(material, scene, object));
        let refreshProgram = !1, refreshMaterial = !1, refreshLights = !1, p_uniforms = program.getUniforms(), m_uniforms = materialProperties.uniforms;
        if (state.useProgram(program.program) && (refreshProgram = !0, refreshMaterial = !0, refreshLights = !0), material.id !== _currentMaterialId && (_currentMaterialId = material.id, refreshMaterial = !0), refreshProgram || _currentCamera !== camera) {
          p_uniforms.setValue(_gl, "projectionMatrix", camera.projectionMatrix), p_uniforms.setValue(_gl, "viewMatrix", camera.matrixWorldInverse);
          let uCamPos = p_uniforms.map.cameraPosition;
          uCamPos !== void 0 && uCamPos.setValue(_gl, _vector3.setFromMatrixPosition(camera.matrixWorld)), capabilities.logarithmicDepthBuffer && p_uniforms.setValue(
            _gl,
            "logDepthBufFC",
            2 / (Math.log(camera.far + 1) / Math.LN2)
          ), (material.isMeshPhongMaterial || material.isMeshToonMaterial || material.isMeshLambertMaterial || material.isMeshBasicMaterial || material.isMeshStandardMaterial || material.isShaderMaterial) && p_uniforms.setValue(_gl, "isOrthographic", camera.isOrthographicCamera === !0), _currentCamera !== camera && (_currentCamera = camera, refreshMaterial = !0, refreshLights = !0);
        }
        if (object.isSkinnedMesh) {
          p_uniforms.setOptional(_gl, object, "bindMatrix"), p_uniforms.setOptional(_gl, object, "bindMatrixInverse");
          let skeleton = object.skeleton;
          skeleton && (skeleton.boneTexture === null && skeleton.computeBoneTexture(), p_uniforms.setValue(_gl, "boneTexture", skeleton.boneTexture, textures));
        }
        object.isBatchedMesh && (p_uniforms.setOptional(_gl, object, "batchingTexture"), p_uniforms.setValue(_gl, "batchingTexture", object._matricesTexture, textures), p_uniforms.setOptional(_gl, object, "batchingIdTexture"), p_uniforms.setValue(_gl, "batchingIdTexture", object._indirectTexture, textures), p_uniforms.setOptional(_gl, object, "batchingColorTexture"), object._colorsTexture !== null && p_uniforms.setValue(_gl, "batchingColorTexture", object._colorsTexture, textures));
        let morphAttributes = geometry.morphAttributes;
        if ((morphAttributes.position !== void 0 || morphAttributes.normal !== void 0 || morphAttributes.color !== void 0) && morphtargets.update(object, geometry, program), (refreshMaterial || materialProperties.receiveShadow !== object.receiveShadow) && (materialProperties.receiveShadow = object.receiveShadow, p_uniforms.setValue(_gl, "receiveShadow", object.receiveShadow)), material.isMeshGouraudMaterial && material.envMap !== null && (m_uniforms.envMap.value = envMap, m_uniforms.flipEnvMap.value = envMap.isCubeTexture && envMap.isRenderTargetTexture === !1 ? -1 : 1), material.isMeshStandardMaterial && material.envMap === null && scene.environment !== null && (m_uniforms.envMapIntensity.value = scene.environmentIntensity), refreshMaterial && (p_uniforms.setValue(_gl, "toneMappingExposure", _this.toneMappingExposure), materialProperties.needsLights && markUniformsLightsNeedsUpdate(m_uniforms, refreshLights), fog && material.fog === !0 && materials.refreshFogUniforms(m_uniforms, fog), materials.refreshMaterialUniforms(m_uniforms, material, _pixelRatio, _height, currentRenderState.state.transmissionRenderTarget[camera.id]), WebGLUniforms.upload(_gl, getUniformList(materialProperties), m_uniforms, textures)), material.isShaderMaterial && material.uniformsNeedUpdate === !0 && (WebGLUniforms.upload(_gl, getUniformList(materialProperties), m_uniforms, textures), material.uniformsNeedUpdate = !1), material.isSpriteMaterial && p_uniforms.setValue(_gl, "center", object.center), p_uniforms.setValue(_gl, "modelViewMatrix", object.modelViewMatrix), p_uniforms.setValue(_gl, "normalMatrix", object.normalMatrix), p_uniforms.setValue(_gl, "modelMatrix", object.matrixWorld), material.isShaderMaterial || material.isRawShaderMaterial) {
          let groups = material.uniformsGroups;
          for (let i = 0, l = groups.length; i < l; i++) {
            let group = groups[i];
            uniformsGroups.update(group, program), uniformsGroups.bind(group, program);
          }
        }
        return program;
      }
      function markUniformsLightsNeedsUpdate(uniforms, value) {
        uniforms.ambientLightColor.needsUpdate = value, uniforms.lightProbe.needsUpdate = value, uniforms.directionalLights.needsUpdate = value, uniforms.directionalLightShadows.needsUpdate = value, uniforms.pointLights.needsUpdate = value, uniforms.pointLightShadows.needsUpdate = value, uniforms.spotLights.needsUpdate = value, uniforms.spotLightShadows.needsUpdate = value, uniforms.rectAreaLights.needsUpdate = value, uniforms.hemisphereLights.needsUpdate = value;
      }
      function materialNeedsLights(material) {
        return material.isMeshLambertMaterial || material.isMeshToonMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial || material.isShadowMaterial || material.isShaderMaterial && material.lights === !0;
      }
      this.getActiveCubeFace = function() {
        return _currentActiveCubeFace;
      }, this.getActiveMipmapLevel = function() {
        return _currentActiveMipmapLevel;
      }, this.getRenderTarget = function() {
        return _currentRenderTarget;
      }, this.setRenderTargetTextures = function(renderTarget, colorTexture, depthTexture) {
        properties.get(renderTarget.texture).__webglTexture = colorTexture, properties.get(renderTarget.depthTexture).__webglTexture = depthTexture;
        let renderTargetProperties = properties.get(renderTarget);
        renderTargetProperties.__hasExternalTextures = !0, renderTargetProperties.__autoAllocateDepthBuffer = depthTexture === void 0, renderTargetProperties.__autoAllocateDepthBuffer || extensions.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), renderTargetProperties.__useRenderToTexture = !1);
      }, this.setRenderTargetFramebuffer = function(renderTarget, defaultFramebuffer) {
        let renderTargetProperties = properties.get(renderTarget);
        renderTargetProperties.__webglFramebuffer = defaultFramebuffer, renderTargetProperties.__useDefaultFramebuffer = defaultFramebuffer === void 0;
      }, this.setRenderTarget = function(renderTarget, activeCubeFace = 0, activeMipmapLevel = 0) {
        _currentRenderTarget = renderTarget, _currentActiveCubeFace = activeCubeFace, _currentActiveMipmapLevel = activeMipmapLevel;
        let useDefaultFramebuffer = !0, framebuffer = null, isCube = !1, isRenderTarget3D = !1;
        if (renderTarget) {
          let renderTargetProperties = properties.get(renderTarget);
          renderTargetProperties.__useDefaultFramebuffer !== void 0 ? (state.bindFramebuffer(_gl.FRAMEBUFFER, null), useDefaultFramebuffer = !1) : renderTargetProperties.__webglFramebuffer === void 0 ? textures.setupRenderTarget(renderTarget) : renderTargetProperties.__hasExternalTextures && textures.rebindTextures(renderTarget, properties.get(renderTarget.texture).__webglTexture, properties.get(renderTarget.depthTexture).__webglTexture);
          let texture = renderTarget.texture;
          (texture.isData3DTexture || texture.isDataArrayTexture || texture.isCompressedArrayTexture) && (isRenderTarget3D = !0);
          let __webglFramebuffer = properties.get(renderTarget).__webglFramebuffer;
          renderTarget.isWebGLCubeRenderTarget ? (Array.isArray(__webglFramebuffer[activeCubeFace]) ? framebuffer = __webglFramebuffer[activeCubeFace][activeMipmapLevel] : framebuffer = __webglFramebuffer[activeCubeFace], isCube = !0) : renderTarget.samples > 0 && textures.useMultisampledRTT(renderTarget) === !1 ? framebuffer = properties.get(renderTarget).__webglMultisampledFramebuffer : Array.isArray(__webglFramebuffer) ? framebuffer = __webglFramebuffer[activeMipmapLevel] : framebuffer = __webglFramebuffer, _currentViewport.copy(renderTarget.viewport), _currentScissor.copy(renderTarget.scissor), _currentScissorTest = renderTarget.scissorTest;
        } else
          _currentViewport.copy(_viewport).multiplyScalar(_pixelRatio).floor(), _currentScissor.copy(_scissor).multiplyScalar(_pixelRatio).floor(), _currentScissorTest = _scissorTest;
        if (state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer) && useDefaultFramebuffer && state.drawBuffers(renderTarget, framebuffer), state.viewport(_currentViewport), state.scissor(_currentScissor), state.setScissorTest(_currentScissorTest), isCube) {
          let textureProperties = properties.get(renderTarget.texture);
          _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + activeCubeFace, textureProperties.__webglTexture, activeMipmapLevel);
        } else if (isRenderTarget3D) {
          let textureProperties = properties.get(renderTarget.texture), layer = activeCubeFace || 0;
          _gl.framebufferTextureLayer(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, textureProperties.__webglTexture, activeMipmapLevel || 0, layer);
        }
        _currentMaterialId = -1;
      }, this.readRenderTargetPixels = function(renderTarget, x, y, width, height, buffer, activeCubeFaceIndex) {
        if (!(renderTarget && renderTarget.isWebGLRenderTarget)) {
          console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
          return;
        }
        let framebuffer = properties.get(renderTarget).__webglFramebuffer;
        if (renderTarget.isWebGLCubeRenderTarget && activeCubeFaceIndex !== void 0 && (framebuffer = framebuffer[activeCubeFaceIndex]), framebuffer) {
          state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
          try {
            let texture = renderTarget.texture, textureFormat = texture.format, textureType = texture.type;
            if (!capabilities.textureFormatReadable(textureFormat)) {
              console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
              return;
            }
            if (!capabilities.textureTypeReadable(textureType)) {
              console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
              return;
            }
            x >= 0 && x <= renderTarget.width - width && y >= 0 && y <= renderTarget.height - height && _gl.readPixels(x, y, width, height, utils.convert(textureFormat), utils.convert(textureType), buffer);
          } finally {
            let framebuffer2 = _currentRenderTarget !== null ? properties.get(_currentRenderTarget).__webglFramebuffer : null;
            state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer2);
          }
        }
      }, this.readRenderTargetPixelsAsync = async function(renderTarget, x, y, width, height, buffer, activeCubeFaceIndex) {
        if (!(renderTarget && renderTarget.isWebGLRenderTarget))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        let framebuffer = properties.get(renderTarget).__webglFramebuffer;
        if (renderTarget.isWebGLCubeRenderTarget && activeCubeFaceIndex !== void 0 && (framebuffer = framebuffer[activeCubeFaceIndex]), framebuffer) {
          state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
          try {
            let texture = renderTarget.texture, textureFormat = texture.format, textureType = texture.type;
            if (!capabilities.textureFormatReadable(textureFormat))
              throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
            if (!capabilities.textureTypeReadable(textureType))
              throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
            if (x >= 0 && x <= renderTarget.width - width && y >= 0 && y <= renderTarget.height - height) {
              let glBuffer = _gl.createBuffer();
              _gl.bindBuffer(_gl.PIXEL_PACK_BUFFER, glBuffer), _gl.bufferData(_gl.PIXEL_PACK_BUFFER, buffer.byteLength, _gl.STREAM_READ), _gl.readPixels(x, y, width, height, utils.convert(textureFormat), utils.convert(textureType), 0), _gl.flush();
              let sync = _gl.fenceSync(_gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
              await probeAsync(_gl, sync, 4);
              try {
                _gl.bindBuffer(_gl.PIXEL_PACK_BUFFER, glBuffer), _gl.getBufferSubData(_gl.PIXEL_PACK_BUFFER, 0, buffer);
              } finally {
                _gl.deleteBuffer(glBuffer), _gl.deleteSync(sync);
              }
              return buffer;
            }
          } finally {
            let framebuffer2 = _currentRenderTarget !== null ? properties.get(_currentRenderTarget).__webglFramebuffer : null;
            state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer2);
          }
        }
      }, this.copyFramebufferToTexture = function(texture, position = null, level = 0) {
        texture.isTexture !== !0 && (warnOnce("WebGLRenderer: copyFramebufferToTexture function signature has changed."), position = arguments[0] || null, texture = arguments[1]);
        let levelScale = Math.pow(2, -level), width = Math.floor(texture.image.width * levelScale), height = Math.floor(texture.image.height * levelScale), x = position !== null ? position.x : 0, y = position !== null ? position.y : 0;
        textures.setTexture2D(texture, 0), _gl.copyTexSubImage2D(_gl.TEXTURE_2D, level, 0, 0, x, y, width, height), state.unbindTexture();
      }, this.copyTextureToTexture = function(srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0) {
        srcTexture.isTexture !== !0 && (warnOnce("WebGLRenderer: copyTextureToTexture function signature has changed."), dstPosition = arguments[0] || null, srcTexture = arguments[1], dstTexture = arguments[2], level = arguments[3] || 0, srcRegion = null);
        let width, height, minX, minY, dstX, dstY;
        srcRegion !== null ? (width = srcRegion.max.x - srcRegion.min.x, height = srcRegion.max.y - srcRegion.min.y, minX = srcRegion.min.x, minY = srcRegion.min.y) : (width = srcTexture.image.width, height = srcTexture.image.height, minX = 0, minY = 0), dstPosition !== null ? (dstX = dstPosition.x, dstY = dstPosition.y) : (dstX = 0, dstY = 0);
        let glFormat = utils.convert(dstTexture.format), glType = utils.convert(dstTexture.type);
        textures.setTexture2D(dstTexture, 0), _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY), _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha), _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment);
        let currentUnpackRowLen = _gl.getParameter(_gl.UNPACK_ROW_LENGTH), currentUnpackImageHeight = _gl.getParameter(_gl.UNPACK_IMAGE_HEIGHT), currentUnpackSkipPixels = _gl.getParameter(_gl.UNPACK_SKIP_PIXELS), currentUnpackSkipRows = _gl.getParameter(_gl.UNPACK_SKIP_ROWS), currentUnpackSkipImages = _gl.getParameter(_gl.UNPACK_SKIP_IMAGES), image = srcTexture.isCompressedTexture ? srcTexture.mipmaps[level] : srcTexture.image;
        _gl.pixelStorei(_gl.UNPACK_ROW_LENGTH, image.width), _gl.pixelStorei(_gl.UNPACK_IMAGE_HEIGHT, image.height), _gl.pixelStorei(_gl.UNPACK_SKIP_PIXELS, minX), _gl.pixelStorei(_gl.UNPACK_SKIP_ROWS, minY), srcTexture.isDataTexture ? _gl.texSubImage2D(_gl.TEXTURE_2D, level, dstX, dstY, width, height, glFormat, glType, image.data) : srcTexture.isCompressedTexture ? _gl.compressedTexSubImage2D(_gl.TEXTURE_2D, level, dstX, dstY, image.width, image.height, glFormat, image.data) : _gl.texSubImage2D(_gl.TEXTURE_2D, level, dstX, dstY, width, height, glFormat, glType, image), _gl.pixelStorei(_gl.UNPACK_ROW_LENGTH, currentUnpackRowLen), _gl.pixelStorei(_gl.UNPACK_IMAGE_HEIGHT, currentUnpackImageHeight), _gl.pixelStorei(_gl.UNPACK_SKIP_PIXELS, currentUnpackSkipPixels), _gl.pixelStorei(_gl.UNPACK_SKIP_ROWS, currentUnpackSkipRows), _gl.pixelStorei(_gl.UNPACK_SKIP_IMAGES, currentUnpackSkipImages), level === 0 && dstTexture.generateMipmaps && _gl.generateMipmap(_gl.TEXTURE_2D), state.unbindTexture();
      }, this.copyTextureToTexture3D = function(srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0) {
        srcTexture.isTexture !== !0 && (warnOnce("WebGLRenderer: copyTextureToTexture3D function signature has changed."), srcRegion = arguments[0] || null, dstPosition = arguments[1] || null, srcTexture = arguments[2], dstTexture = arguments[3], level = arguments[4] || 0);
        let width, height, depth2, minX, minY, minZ, dstX, dstY, dstZ, image = srcTexture.isCompressedTexture ? srcTexture.mipmaps[level] : srcTexture.image;
        srcRegion !== null ? (width = srcRegion.max.x - srcRegion.min.x, height = srcRegion.max.y - srcRegion.min.y, depth2 = srcRegion.max.z - srcRegion.min.z, minX = srcRegion.min.x, minY = srcRegion.min.y, minZ = srcRegion.min.z) : (width = image.width, height = image.height, depth2 = image.depth, minX = 0, minY = 0, minZ = 0), dstPosition !== null ? (dstX = dstPosition.x, dstY = dstPosition.y, dstZ = dstPosition.z) : (dstX = 0, dstY = 0, dstZ = 0);
        let glFormat = utils.convert(dstTexture.format), glType = utils.convert(dstTexture.type), glTarget;
        if (dstTexture.isData3DTexture)
          textures.setTexture3D(dstTexture, 0), glTarget = _gl.TEXTURE_3D;
        else if (dstTexture.isDataArrayTexture || dstTexture.isCompressedArrayTexture)
          textures.setTexture2DArray(dstTexture, 0), glTarget = _gl.TEXTURE_2D_ARRAY;
        else {
          console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
          return;
        }
        _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY), _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha), _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment);
        let currentUnpackRowLen = _gl.getParameter(_gl.UNPACK_ROW_LENGTH), currentUnpackImageHeight = _gl.getParameter(_gl.UNPACK_IMAGE_HEIGHT), currentUnpackSkipPixels = _gl.getParameter(_gl.UNPACK_SKIP_PIXELS), currentUnpackSkipRows = _gl.getParameter(_gl.UNPACK_SKIP_ROWS), currentUnpackSkipImages = _gl.getParameter(_gl.UNPACK_SKIP_IMAGES);
        _gl.pixelStorei(_gl.UNPACK_ROW_LENGTH, image.width), _gl.pixelStorei(_gl.UNPACK_IMAGE_HEIGHT, image.height), _gl.pixelStorei(_gl.UNPACK_SKIP_PIXELS, minX), _gl.pixelStorei(_gl.UNPACK_SKIP_ROWS, minY), _gl.pixelStorei(_gl.UNPACK_SKIP_IMAGES, minZ), srcTexture.isDataTexture || srcTexture.isData3DTexture ? _gl.texSubImage3D(glTarget, level, dstX, dstY, dstZ, width, height, depth2, glFormat, glType, image.data) : dstTexture.isCompressedArrayTexture ? _gl.compressedTexSubImage3D(glTarget, level, dstX, dstY, dstZ, width, height, depth2, glFormat, image.data) : _gl.texSubImage3D(glTarget, level, dstX, dstY, dstZ, width, height, depth2, glFormat, glType, image), _gl.pixelStorei(_gl.UNPACK_ROW_LENGTH, currentUnpackRowLen), _gl.pixelStorei(_gl.UNPACK_IMAGE_HEIGHT, currentUnpackImageHeight), _gl.pixelStorei(_gl.UNPACK_SKIP_PIXELS, currentUnpackSkipPixels), _gl.pixelStorei(_gl.UNPACK_SKIP_ROWS, currentUnpackSkipRows), _gl.pixelStorei(_gl.UNPACK_SKIP_IMAGES, currentUnpackSkipImages), level === 0 && dstTexture.generateMipmaps && _gl.generateMipmap(glTarget), state.unbindTexture();
      }, this.initRenderTarget = function(target) {
        properties.get(target).__webglFramebuffer === void 0 && textures.setupRenderTarget(target);
      }, this.initTexture = function(texture) {
        texture.isCubeTexture ? textures.setTextureCube(texture, 0) : texture.isData3DTexture ? textures.setTexture3D(texture, 0) : texture.isDataArrayTexture || texture.isCompressedArrayTexture ? textures.setTexture2DArray(texture, 0) : textures.setTexture2D(texture, 0), state.unbindTexture();
      }, this.resetState = function() {
        _currentActiveCubeFace = 0, _currentActiveMipmapLevel = 0, _currentRenderTarget = null, state.reset(), bindingStates.reset();
      }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
    }
    get coordinateSystem() {
      return WebGLCoordinateSystem;
    }
    get outputColorSpace() {
      return this._outputColorSpace;
    }
    set outputColorSpace(colorSpace) {
      this._outputColorSpace = colorSpace;
      let gl = this.getContext();
      gl.drawingBufferColorSpace = colorSpace === DisplayP3ColorSpace ? "display-p3" : "srgb", gl.unpackColorSpace = ColorManagement.workingColorSpace === LinearDisplayP3ColorSpace ? "display-p3" : "srgb";
    }
  };
  var Scene = class extends Object3D {
    constructor() {
      super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Euler(), this.environmentIntensity = 1, this.environmentRotation = new Euler(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
    }
    copy(source, recursive) {
      return super.copy(source, recursive), source.background !== null && (this.background = source.background.clone()), source.environment !== null && (this.environment = source.environment.clone()), source.fog !== null && (this.fog = source.fog.clone()), this.backgroundBlurriness = source.backgroundBlurriness, this.backgroundIntensity = source.backgroundIntensity, this.backgroundRotation.copy(source.backgroundRotation), this.environmentIntensity = source.environmentIntensity, this.environmentRotation.copy(source.environmentRotation), source.overrideMaterial !== null && (this.overrideMaterial = source.overrideMaterial.clone()), this.matrixAutoUpdate = source.matrixAutoUpdate, this;
    }
    toJSON(meta) {
      let data = super.toJSON(meta);
      return this.fog !== null && (data.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (data.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (data.object.backgroundIntensity = this.backgroundIntensity), data.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (data.object.environmentIntensity = this.environmentIntensity), data.object.environmentRotation = this.environmentRotation.toArray(), data;
    }
  };
  var CanvasTexture = class extends Texture {
    constructor(canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy) {
      super(canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy), this.isCanvasTexture = !0, this.needsUpdate = !0;
    }
  };
  var MeshLambertMaterial = class extends Material {
    constructor(parameters) {
      super(), this.isMeshLambertMaterial = !0, this.type = "MeshLambertMaterial", this.color = new Color(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Color(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = TangentSpaceNormalMap, this.normalScale = new Vector2(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Euler(), this.combine = MultiplyOperation, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(parameters);
    }
    copy(source) {
      return super.copy(source), this.color.copy(source.color), this.map = source.map, this.lightMap = source.lightMap, this.lightMapIntensity = source.lightMapIntensity, this.aoMap = source.aoMap, this.aoMapIntensity = source.aoMapIntensity, this.emissive.copy(source.emissive), this.emissiveMap = source.emissiveMap, this.emissiveIntensity = source.emissiveIntensity, this.bumpMap = source.bumpMap, this.bumpScale = source.bumpScale, this.normalMap = source.normalMap, this.normalMapType = source.normalMapType, this.normalScale.copy(source.normalScale), this.displacementMap = source.displacementMap, this.displacementScale = source.displacementScale, this.displacementBias = source.displacementBias, this.specularMap = source.specularMap, this.alphaMap = source.alphaMap, this.envMap = source.envMap, this.envMapRotation.copy(source.envMapRotation), this.combine = source.combine, this.reflectivity = source.reflectivity, this.refractionRatio = source.refractionRatio, this.wireframe = source.wireframe, this.wireframeLinewidth = source.wireframeLinewidth, this.wireframeLinecap = source.wireframeLinecap, this.wireframeLinejoin = source.wireframeLinejoin, this.flatShading = source.flatShading, this.fog = source.fog, this;
    }
  };
  function convertArray(array, type, forceClone) {
    return !array || // let 'undefined' and 'null' pass
    !forceClone && array.constructor === type ? array : typeof type.BYTES_PER_ELEMENT == "number" ? new type(array) : Array.prototype.slice.call(array);
  }
  function isTypedArray(object) {
    return ArrayBuffer.isView(object) && !(object instanceof DataView);
  }
  var Interpolant = class {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      this.parameterPositions = parameterPositions, this._cachedIndex = 0, this.resultBuffer = resultBuffer !== void 0 ? resultBuffer : new sampleValues.constructor(sampleSize), this.sampleValues = sampleValues, this.valueSize = sampleSize, this.settings = null, this.DefaultSettings_ = {};
    }
    evaluate(t) {
      let pp = this.parameterPositions, i1 = this._cachedIndex, t1 = pp[i1], t0 = pp[i1 - 1];
      validate_interval: {
        seek: {
          let right;
          linear_scan: {
            forward_scan: if (!(t < t1)) {
              for (let giveUpAt = i1 + 2; ; ) {
                if (t1 === void 0) {
                  if (t < t0) break forward_scan;
                  return i1 = pp.length, this._cachedIndex = i1, this.copySampleValue_(i1 - 1);
                }
                if (i1 === giveUpAt) break;
                if (t0 = t1, t1 = pp[++i1], t < t1)
                  break seek;
              }
              right = pp.length;
              break linear_scan;
            }
            if (!(t >= t0)) {
              let t1global = pp[1];
              t < t1global && (i1 = 2, t0 = t1global);
              for (let giveUpAt = i1 - 2; ; ) {
                if (t0 === void 0)
                  return this._cachedIndex = 0, this.copySampleValue_(0);
                if (i1 === giveUpAt) break;
                if (t1 = t0, t0 = pp[--i1 - 1], t >= t0)
                  break seek;
              }
              right = i1, i1 = 0;
              break linear_scan;
            }
            break validate_interval;
          }
          for (; i1 < right; ) {
            let mid = i1 + right >>> 1;
            t < pp[mid] ? right = mid : i1 = mid + 1;
          }
          if (t1 = pp[i1], t0 = pp[i1 - 1], t0 === void 0)
            return this._cachedIndex = 0, this.copySampleValue_(0);
          if (t1 === void 0)
            return i1 = pp.length, this._cachedIndex = i1, this.copySampleValue_(i1 - 1);
        }
        this._cachedIndex = i1, this.intervalChanged_(i1, t0, t1);
      }
      return this.interpolate_(i1, t0, t, t1);
    }
    getSettings_() {
      return this.settings || this.DefaultSettings_;
    }
    copySampleValue_(index) {
      let result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, offset = index * stride;
      for (let i = 0; i !== stride; ++i)
        result[i] = values[offset + i];
      return result;
    }
    // Template methods for derived classes:
    interpolate_() {
      throw new Error("call to abstract method");
    }
    intervalChanged_() {
    }
  }, CubicInterpolant = class extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
        endingStart: ZeroCurvatureEnding,
        endingEnd: ZeroCurvatureEnding
      };
    }
    intervalChanged_(i1, t0, t1) {
      let pp = this.parameterPositions, iPrev = i1 - 2, iNext = i1 + 1, tPrev = pp[iPrev], tNext = pp[iNext];
      if (tPrev === void 0)
        switch (this.getSettings_().endingStart) {
          case ZeroSlopeEnding:
            iPrev = i1, tPrev = 2 * t0 - t1;
            break;
          case WrapAroundEnding:
            iPrev = pp.length - 2, tPrev = t0 + pp[iPrev] - pp[iPrev + 1];
            break;
          default:
            iPrev = i1, tPrev = t1;
        }
      if (tNext === void 0)
        switch (this.getSettings_().endingEnd) {
          case ZeroSlopeEnding:
            iNext = i1, tNext = 2 * t1 - t0;
            break;
          case WrapAroundEnding:
            iNext = 1, tNext = t1 + pp[1] - pp[0];
            break;
          default:
            iNext = i1 - 1, tNext = t0;
        }
      let halfDt = (t1 - t0) * 0.5, stride = this.valueSize;
      this._weightPrev = halfDt / (t0 - tPrev), this._weightNext = halfDt / (tNext - t1), this._offsetPrev = iPrev * stride, this._offsetNext = iNext * stride;
    }
    interpolate_(i1, t0, t, t1) {
      let result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, o1 = i1 * stride, o0 = o1 - stride, oP = this._offsetPrev, oN = this._offsetNext, wP = this._weightPrev, wN = this._weightNext, p = (t - t0) / (t1 - t0), pp = p * p, ppp = pp * p, sP = -wP * ppp + 2 * wP * pp - wP * p, s0 = (1 + wP) * ppp + (-1.5 - 2 * wP) * pp + (-0.5 + wP) * p + 1, s1 = (-1 - wN) * ppp + (1.5 + wN) * pp + 0.5 * p, sN = wN * ppp - wN * pp;
      for (let i = 0; i !== stride; ++i)
        result[i] = sP * values[oP + i] + s0 * values[o0 + i] + s1 * values[o1 + i] + sN * values[oN + i];
      return result;
    }
  }, LinearInterpolant = class extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }
    interpolate_(i1, t0, t, t1) {
      let result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, offset1 = i1 * stride, offset0 = offset1 - stride, weight1 = (t - t0) / (t1 - t0), weight0 = 1 - weight1;
      for (let i = 0; i !== stride; ++i)
        result[i] = values[offset0 + i] * weight0 + values[offset1 + i] * weight1;
      return result;
    }
  }, DiscreteInterpolant = class extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }
    interpolate_(i1) {
      return this.copySampleValue_(i1 - 1);
    }
  }, KeyframeTrack = class {
    constructor(name, times, values, interpolation) {
      if (name === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
      if (times === void 0 || times.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + name);
      this.name = name, this.times = convertArray(times, this.TimeBufferType), this.values = convertArray(values, this.ValueBufferType), this.setInterpolation(interpolation || this.DefaultInterpolation);
    }
    // Serialization (in static context, because of constructor invocation
    // and automatic invocation of .toJSON):
    static toJSON(track) {
      let trackType = track.constructor, json;
      if (trackType.toJSON !== this.toJSON)
        json = trackType.toJSON(track);
      else {
        json = {
          name: track.name,
          times: convertArray(track.times, Array),
          values: convertArray(track.values, Array)
        };
        let interpolation = track.getInterpolation();
        interpolation !== track.DefaultInterpolation && (json.interpolation = interpolation);
      }
      return json.type = track.ValueTypeName, json;
    }
    InterpolantFactoryMethodDiscrete(result) {
      return new DiscreteInterpolant(this.times, this.values, this.getValueSize(), result);
    }
    InterpolantFactoryMethodLinear(result) {
      return new LinearInterpolant(this.times, this.values, this.getValueSize(), result);
    }
    InterpolantFactoryMethodSmooth(result) {
      return new CubicInterpolant(this.times, this.values, this.getValueSize(), result);
    }
    setInterpolation(interpolation) {
      let factoryMethod;
      switch (interpolation) {
        case InterpolateDiscrete:
          factoryMethod = this.InterpolantFactoryMethodDiscrete;
          break;
        case InterpolateLinear:
          factoryMethod = this.InterpolantFactoryMethodLinear;
          break;
        case InterpolateSmooth:
          factoryMethod = this.InterpolantFactoryMethodSmooth;
          break;
      }
      if (factoryMethod === void 0) {
        let message = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
        if (this.createInterpolant === void 0)
          if (interpolation !== this.DefaultInterpolation)
            this.setInterpolation(this.DefaultInterpolation);
          else
            throw new Error(message);
        return console.warn("THREE.KeyframeTrack:", message), this;
      }
      return this.createInterpolant = factoryMethod, this;
    }
    getInterpolation() {
      switch (this.createInterpolant) {
        case this.InterpolantFactoryMethodDiscrete:
          return InterpolateDiscrete;
        case this.InterpolantFactoryMethodLinear:
          return InterpolateLinear;
        case this.InterpolantFactoryMethodSmooth:
          return InterpolateSmooth;
      }
    }
    getValueSize() {
      return this.values.length / this.times.length;
    }
    // move all keyframes either forwards or backwards in time
    shift(timeOffset) {
      if (timeOffset !== 0) {
        let times = this.times;
        for (let i = 0, n = times.length; i !== n; ++i)
          times[i] += timeOffset;
      }
      return this;
    }
    // scale all keyframe times by a factor (useful for frame <-> seconds conversions)
    scale(timeScale) {
      if (timeScale !== 1) {
        let times = this.times;
        for (let i = 0, n = times.length; i !== n; ++i)
          times[i] *= timeScale;
      }
      return this;
    }
    // removes keyframes before and after animation without changing any values within the range [startTime, endTime].
    // IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
    trim(startTime, endTime) {
      let times = this.times, nKeys = times.length, from = 0, to = nKeys - 1;
      for (; from !== nKeys && times[from] < startTime; )
        ++from;
      for (; to !== -1 && times[to] > endTime; )
        --to;
      if (++to, from !== 0 || to !== nKeys) {
        from >= to && (to = Math.max(to, 1), from = to - 1);
        let stride = this.getValueSize();
        this.times = times.slice(from, to), this.values = this.values.slice(from * stride, to * stride);
      }
      return this;
    }
    // ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
    validate() {
      let valid = !0, valueSize = this.getValueSize();
      valueSize - Math.floor(valueSize) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), valid = !1);
      let times = this.times, values = this.values, nKeys = times.length;
      nKeys === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), valid = !1);
      let prevTime = null;
      for (let i = 0; i !== nKeys; i++) {
        let currTime = times[i];
        if (typeof currTime == "number" && isNaN(currTime)) {
          console.error("THREE.KeyframeTrack: Time is not a valid number.", this, i, currTime), valid = !1;
          break;
        }
        if (prevTime !== null && prevTime > currTime) {
          console.error("THREE.KeyframeTrack: Out of order keys.", this, i, currTime, prevTime), valid = !1;
          break;
        }
        prevTime = currTime;
      }
      if (values !== void 0 && isTypedArray(values))
        for (let i = 0, n = values.length; i !== n; ++i) {
          let value = values[i];
          if (isNaN(value)) {
            console.error("THREE.KeyframeTrack: Value is not a valid number.", this, i, value), valid = !1;
            break;
          }
        }
      return valid;
    }
    // removes equivalent sequential keys as common in morph target sequences
    // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
    optimize() {
      let times = this.times.slice(), values = this.values.slice(), stride = this.getValueSize(), smoothInterpolation = this.getInterpolation() === InterpolateSmooth, lastIndex = times.length - 1, writeIndex = 1;
      for (let i = 1; i < lastIndex; ++i) {
        let keep = !1, time = times[i], timeNext = times[i + 1];
        if (time !== timeNext && (i !== 1 || time !== times[0]))
          if (smoothInterpolation)
            keep = !0;
          else {
            let offset = i * stride, offsetP = offset - stride, offsetN = offset + stride;
            for (let j = 0; j !== stride; ++j) {
              let value = values[offset + j];
              if (value !== values[offsetP + j] || value !== values[offsetN + j]) {
                keep = !0;
                break;
              }
            }
          }
        if (keep) {
          if (i !== writeIndex) {
            times[writeIndex] = times[i];
            let readOffset = i * stride, writeOffset = writeIndex * stride;
            for (let j = 0; j !== stride; ++j)
              values[writeOffset + j] = values[readOffset + j];
          }
          ++writeIndex;
        }
      }
      if (lastIndex > 0) {
        times[writeIndex] = times[lastIndex];
        for (let readOffset = lastIndex * stride, writeOffset = writeIndex * stride, j = 0; j !== stride; ++j)
          values[writeOffset + j] = values[readOffset + j];
        ++writeIndex;
      }
      return writeIndex !== times.length ? (this.times = times.slice(0, writeIndex), this.values = values.slice(0, writeIndex * stride)) : (this.times = times, this.values = values), this;
    }
    clone() {
      let times = this.times.slice(), values = this.values.slice(), TypedKeyframeTrack = this.constructor, track = new TypedKeyframeTrack(this.name, times, values);
      return track.createInterpolant = this.createInterpolant, track;
    }
  };
  KeyframeTrack.prototype.TimeBufferType = Float32Array;
  KeyframeTrack.prototype.ValueBufferType = Float32Array;
  KeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;
  var BooleanKeyframeTrack = class extends KeyframeTrack {
    // No interpolation parameter because only InterpolateDiscrete is valid.
    constructor(name, times, values) {
      super(name, times, values);
    }
  };
  BooleanKeyframeTrack.prototype.ValueTypeName = "bool";
  BooleanKeyframeTrack.prototype.ValueBufferType = Array;
  BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
  BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = void 0;
  BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
  var ColorKeyframeTrack = class extends KeyframeTrack {
  };
  ColorKeyframeTrack.prototype.ValueTypeName = "color";
  var NumberKeyframeTrack = class extends KeyframeTrack {
  };
  NumberKeyframeTrack.prototype.ValueTypeName = "number";
  var QuaternionLinearInterpolant = class extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }
    interpolate_(i1, t0, t, t1) {
      let result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, alpha = (t - t0) / (t1 - t0), offset = i1 * stride;
      for (let end = offset + stride; offset !== end; offset += 4)
        Quaternion.slerpFlat(result, 0, values, offset - stride, values, offset, alpha);
      return result;
    }
  }, QuaternionKeyframeTrack = class extends KeyframeTrack {
    InterpolantFactoryMethodLinear(result) {
      return new QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), result);
    }
  };
  QuaternionKeyframeTrack.prototype.ValueTypeName = "quaternion";
  QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
  var StringKeyframeTrack = class extends KeyframeTrack {
    // No interpolation parameter because only InterpolateDiscrete is valid.
    constructor(name, times, values) {
      super(name, times, values);
    }
  };
  StringKeyframeTrack.prototype.ValueTypeName = "string";
  StringKeyframeTrack.prototype.ValueBufferType = Array;
  StringKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
  StringKeyframeTrack.prototype.InterpolantFactoryMethodLinear = void 0;
  StringKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
  var VectorKeyframeTrack = class extends KeyframeTrack {
  };
  VectorKeyframeTrack.prototype.ValueTypeName = "vector";
  var LoadingManager = class {
    constructor(onLoad, onProgress, onError) {
      let scope = this, isLoading = !1, itemsLoaded = 0, itemsTotal = 0, urlModifier, handlers = [];
      this.onStart = void 0, this.onLoad = onLoad, this.onProgress = onProgress, this.onError = onError, this.itemStart = function(url) {
        itemsTotal++, isLoading === !1 && scope.onStart !== void 0 && scope.onStart(url, itemsLoaded, itemsTotal), isLoading = !0;
      }, this.itemEnd = function(url) {
        itemsLoaded++, scope.onProgress !== void 0 && scope.onProgress(url, itemsLoaded, itemsTotal), itemsLoaded === itemsTotal && (isLoading = !1, scope.onLoad !== void 0 && scope.onLoad());
      }, this.itemError = function(url) {
        scope.onError !== void 0 && scope.onError(url);
      }, this.resolveURL = function(url) {
        return urlModifier ? urlModifier(url) : url;
      }, this.setURLModifier = function(transform) {
        return urlModifier = transform, this;
      }, this.addHandler = function(regex, loader) {
        return handlers.push(regex, loader), this;
      }, this.removeHandler = function(regex) {
        let index = handlers.indexOf(regex);
        return index !== -1 && handlers.splice(index, 2), this;
      }, this.getHandler = function(file) {
        for (let i = 0, l = handlers.length; i < l; i += 2) {
          let regex = handlers[i], loader = handlers[i + 1];
          if (regex.global && (regex.lastIndex = 0), regex.test(file))
            return loader;
        }
        return null;
      };
    }
  }, DefaultLoadingManager = /* @__PURE__ */ new LoadingManager(), Loader = class {
    constructor(manager) {
      this.manager = manager !== void 0 ? manager : DefaultLoadingManager, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
    }
    load() {
    }
    loadAsync(url, onProgress) {
      let scope = this;
      return new Promise(function(resolve, reject) {
        scope.load(url, resolve, onProgress, reject);
      });
    }
    parse() {
    }
    setCrossOrigin(crossOrigin) {
      return this.crossOrigin = crossOrigin, this;
    }
    setWithCredentials(value) {
      return this.withCredentials = value, this;
    }
    setPath(path) {
      return this.path = path, this;
    }
    setResourcePath(resourcePath) {
      return this.resourcePath = resourcePath, this;
    }
    setRequestHeader(requestHeader) {
      return this.requestHeader = requestHeader, this;
    }
  };
  Loader.DEFAULT_MATERIAL_NAME = "__DEFAULT";
  var Light = class extends Object3D {
    constructor(color, intensity = 1) {
      super(), this.isLight = !0, this.type = "Light", this.color = new Color(color), this.intensity = intensity;
    }
    dispose() {
    }
    copy(source, recursive) {
      return super.copy(source, recursive), this.color.copy(source.color), this.intensity = source.intensity, this;
    }
    toJSON(meta) {
      let data = super.toJSON(meta);
      return data.object.color = this.color.getHex(), data.object.intensity = this.intensity, this.groundColor !== void 0 && (data.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (data.object.distance = this.distance), this.angle !== void 0 && (data.object.angle = this.angle), this.decay !== void 0 && (data.object.decay = this.decay), this.penumbra !== void 0 && (data.object.penumbra = this.penumbra), this.shadow !== void 0 && (data.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (data.object.target = this.target.uuid), data;
    }
  };
  var _projScreenMatrix$1 = /* @__PURE__ */ new Matrix4(), _lightPositionWorld$1 = /* @__PURE__ */ new Vector3(), _lookTarget$1 = /* @__PURE__ */ new Vector3(), LightShadow = class {
    constructor(camera) {
      this.camera = camera, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Vector2(512, 512), this.map = null, this.mapPass = null, this.matrix = new Matrix4(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Frustum(), this._frameExtents = new Vector2(1, 1), this._viewportCount = 1, this._viewports = [
        new Vector4(0, 0, 1, 1)
      ];
    }
    getViewportCount() {
      return this._viewportCount;
    }
    getFrustum() {
      return this._frustum;
    }
    updateMatrices(light) {
      let shadowCamera = this.camera, shadowMatrix = this.matrix;
      _lightPositionWorld$1.setFromMatrixPosition(light.matrixWorld), shadowCamera.position.copy(_lightPositionWorld$1), _lookTarget$1.setFromMatrixPosition(light.target.matrixWorld), shadowCamera.lookAt(_lookTarget$1), shadowCamera.updateMatrixWorld(), _projScreenMatrix$1.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse), this._frustum.setFromProjectionMatrix(_projScreenMatrix$1), shadowMatrix.set(
        0.5,
        0,
        0,
        0.5,
        0,
        0.5,
        0,
        0.5,
        0,
        0,
        0.5,
        0.5,
        0,
        0,
        0,
        1
      ), shadowMatrix.multiply(_projScreenMatrix$1);
    }
    getViewport(viewportIndex) {
      return this._viewports[viewportIndex];
    }
    getFrameExtents() {
      return this._frameExtents;
    }
    dispose() {
      this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
    }
    copy(source) {
      return this.camera = source.camera.clone(), this.intensity = source.intensity, this.bias = source.bias, this.radius = source.radius, this.mapSize.copy(source.mapSize), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      let object = {};
      return this.intensity !== 1 && (object.intensity = this.intensity), this.bias !== 0 && (object.bias = this.bias), this.normalBias !== 0 && (object.normalBias = this.normalBias), this.radius !== 1 && (object.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (object.mapSize = this.mapSize.toArray()), object.camera = this.camera.toJSON(!1).object, delete object.camera.matrix, object;
    }
  };
  var DirectionalLightShadow = class extends LightShadow {
    constructor() {
      super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
    }
  }, DirectionalLight = class extends Light {
    constructor(color, intensity) {
      super(color, intensity), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Object3D.DEFAULT_UP), this.updateMatrix(), this.target = new Object3D(), this.shadow = new DirectionalLightShadow();
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(source) {
      return super.copy(source), this.target = source.target.clone(), this.shadow = source.shadow.clone(), this;
    }
  }, AmbientLight = class extends Light {
    constructor(color, intensity) {
      super(color, intensity), this.isAmbientLight = !0, this.type = "AmbientLight";
    }
  };
  var _RESERVED_CHARS_RE = "\\[\\]\\.:\\/", _reservedRe = new RegExp("[" + _RESERVED_CHARS_RE + "]", "g"), _wordChar = "[^" + _RESERVED_CHARS_RE + "]", _wordCharOrDot = "[^" + _RESERVED_CHARS_RE.replace("\\.", "") + "]", _directoryRe = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", _wordChar), _nodeRe = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", _wordCharOrDot), _objectRe = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", _wordChar), _propertyRe = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", _wordChar), _trackRe = new RegExp(
    "^" + _directoryRe + _nodeRe + _objectRe + _propertyRe + "$"
  ), _supportedObjectNames = ["material", "materials", "bones", "map"], Composite = class {
    constructor(targetGroup, path, optionalParsedPath) {
      let parsedPath = optionalParsedPath || PropertyBinding.parseTrackName(path);
      this._targetGroup = targetGroup, this._bindings = targetGroup.subscribe_(path, parsedPath);
    }
    getValue(array, offset) {
      this.bind();
      let firstValidIndex = this._targetGroup.nCachedObjects_, binding = this._bindings[firstValidIndex];
      binding !== void 0 && binding.getValue(array, offset);
    }
    setValue(array, offset) {
      let bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i)
        bindings[i].setValue(array, offset);
    }
    bind() {
      let bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i)
        bindings[i].bind();
    }
    unbind() {
      let bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i)
        bindings[i].unbind();
    }
  }, PropertyBinding = class _PropertyBinding {
    constructor(rootNode, path, parsedPath) {
      this.path = path, this.parsedPath = parsedPath || _PropertyBinding.parseTrackName(path), this.node = _PropertyBinding.findNode(rootNode, this.parsedPath.nodeName), this.rootNode = rootNode, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
    }
    static create(root, path, parsedPath) {
      return root && root.isAnimationObjectGroup ? new _PropertyBinding.Composite(root, path, parsedPath) : new _PropertyBinding(root, path, parsedPath);
    }
    /**
     * Replaces spaces with underscores and removes unsupported characters from
     * node names, to ensure compatibility with parseTrackName().
     *
     * @param {string} name Node name to be sanitized.
     * @return {string}
     */
    static sanitizeNodeName(name) {
      return name.replace(/\s/g, "_").replace(_reservedRe, "");
    }
    static parseTrackName(trackName) {
      let matches = _trackRe.exec(trackName);
      if (matches === null)
        throw new Error("PropertyBinding: Cannot parse trackName: " + trackName);
      let results = {
        // directoryName: matches[ 1 ], // (tschw) currently unused
        nodeName: matches[2],
        objectName: matches[3],
        objectIndex: matches[4],
        propertyName: matches[5],
        // required
        propertyIndex: matches[6]
      }, lastDot = results.nodeName && results.nodeName.lastIndexOf(".");
      if (lastDot !== void 0 && lastDot !== -1) {
        let objectName = results.nodeName.substring(lastDot + 1);
        _supportedObjectNames.indexOf(objectName) !== -1 && (results.nodeName = results.nodeName.substring(0, lastDot), results.objectName = objectName);
      }
      if (results.propertyName === null || results.propertyName.length === 0)
        throw new Error("PropertyBinding: can not parse propertyName from trackName: " + trackName);
      return results;
    }
    static findNode(root, nodeName) {
      if (nodeName === void 0 || nodeName === "" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid)
        return root;
      if (root.skeleton) {
        let bone = root.skeleton.getBoneByName(nodeName);
        if (bone !== void 0)
          return bone;
      }
      if (root.children) {
        let searchNodeSubtree = function(children) {
          for (let i = 0; i < children.length; i++) {
            let childNode = children[i];
            if (childNode.name === nodeName || childNode.uuid === nodeName)
              return childNode;
            let result = searchNodeSubtree(childNode.children);
            if (result) return result;
          }
          return null;
        }, subTreeNode = searchNodeSubtree(root.children);
        if (subTreeNode)
          return subTreeNode;
      }
      return null;
    }
    // these are used to "bind" a nonexistent property
    _getValue_unavailable() {
    }
    _setValue_unavailable() {
    }
    // Getters
    _getValue_direct(buffer, offset) {
      buffer[offset] = this.targetObject[this.propertyName];
    }
    _getValue_array(buffer, offset) {
      let source = this.resolvedProperty;
      for (let i = 0, n = source.length; i !== n; ++i)
        buffer[offset++] = source[i];
    }
    _getValue_arrayElement(buffer, offset) {
      buffer[offset] = this.resolvedProperty[this.propertyIndex];
    }
    _getValue_toArray(buffer, offset) {
      this.resolvedProperty.toArray(buffer, offset);
    }
    // Direct
    _setValue_direct(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset];
    }
    _setValue_direct_setNeedsUpdate(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset], this.targetObject.needsUpdate = !0;
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset], this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    // EntireArray
    _setValue_array(buffer, offset) {
      let dest = this.resolvedProperty;
      for (let i = 0, n = dest.length; i !== n; ++i)
        dest[i] = buffer[offset++];
    }
    _setValue_array_setNeedsUpdate(buffer, offset) {
      let dest = this.resolvedProperty;
      for (let i = 0, n = dest.length; i !== n; ++i)
        dest[i] = buffer[offset++];
      this.targetObject.needsUpdate = !0;
    }
    _setValue_array_setMatrixWorldNeedsUpdate(buffer, offset) {
      let dest = this.resolvedProperty;
      for (let i = 0, n = dest.length; i !== n; ++i)
        dest[i] = buffer[offset++];
      this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    // ArrayElement
    _setValue_arrayElement(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset];
    }
    _setValue_arrayElement_setNeedsUpdate(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset], this.targetObject.needsUpdate = !0;
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset], this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    // HasToFromArray
    _setValue_fromArray(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset);
    }
    _setValue_fromArray_setNeedsUpdate(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset), this.targetObject.needsUpdate = !0;
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset), this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    _getValue_unbound(targetArray, offset) {
      this.bind(), this.getValue(targetArray, offset);
    }
    _setValue_unbound(sourceArray, offset) {
      this.bind(), this.setValue(sourceArray, offset);
    }
    // create getter / setter pair for a property in the scene graph
    bind() {
      let targetObject = this.node, parsedPath = this.parsedPath, objectName = parsedPath.objectName, propertyName = parsedPath.propertyName, propertyIndex = parsedPath.propertyIndex;
      if (targetObject || (targetObject = _PropertyBinding.findNode(this.rootNode, parsedPath.nodeName), this.node = targetObject), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !targetObject) {
        console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
        return;
      }
      if (objectName) {
        let objectIndex = parsedPath.objectIndex;
        switch (objectName) {
          case "materials":
            if (!targetObject.material) {
              console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
              return;
            }
            if (!targetObject.material.materials) {
              console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
              return;
            }
            targetObject = targetObject.material.materials;
            break;
          case "bones":
            if (!targetObject.skeleton) {
              console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
              return;
            }
            targetObject = targetObject.skeleton.bones;
            for (let i = 0; i < targetObject.length; i++)
              if (targetObject[i].name === objectIndex) {
                objectIndex = i;
                break;
              }
            break;
          case "map":
            if ("map" in targetObject) {
              targetObject = targetObject.map;
              break;
            }
            if (!targetObject.material) {
              console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
              return;
            }
            if (!targetObject.material.map) {
              console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
              return;
            }
            targetObject = targetObject.material.map;
            break;
          default:
            if (targetObject[objectName] === void 0) {
              console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
              return;
            }
            targetObject = targetObject[objectName];
        }
        if (objectIndex !== void 0) {
          if (targetObject[objectIndex] === void 0) {
            console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, targetObject);
            return;
          }
          targetObject = targetObject[objectIndex];
        }
      }
      let nodeProperty = targetObject[propertyName];
      if (nodeProperty === void 0) {
        let nodeName = parsedPath.nodeName;
        console.error("THREE.PropertyBinding: Trying to update property for track: " + nodeName + "." + propertyName + " but it wasn't found.", targetObject);
        return;
      }
      let versioning = this.Versioning.None;
      this.targetObject = targetObject, targetObject.needsUpdate !== void 0 ? versioning = this.Versioning.NeedsUpdate : targetObject.matrixWorldNeedsUpdate !== void 0 && (versioning = this.Versioning.MatrixWorldNeedsUpdate);
      let bindingType = this.BindingType.Direct;
      if (propertyIndex !== void 0) {
        if (propertyName === "morphTargetInfluences") {
          if (!targetObject.geometry) {
            console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
            return;
          }
          if (!targetObject.geometry.morphAttributes) {
            console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
            return;
          }
          targetObject.morphTargetDictionary[propertyIndex] !== void 0 && (propertyIndex = targetObject.morphTargetDictionary[propertyIndex]);
        }
        bindingType = this.BindingType.ArrayElement, this.resolvedProperty = nodeProperty, this.propertyIndex = propertyIndex;
      } else nodeProperty.fromArray !== void 0 && nodeProperty.toArray !== void 0 ? (bindingType = this.BindingType.HasFromToArray, this.resolvedProperty = nodeProperty) : Array.isArray(nodeProperty) ? (bindingType = this.BindingType.EntireArray, this.resolvedProperty = nodeProperty) : this.propertyName = propertyName;
      this.getValue = this.GetterByBindingType[bindingType], this.setValue = this.SetterByBindingTypeAndVersioning[bindingType][versioning];
    }
    unbind() {
      this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
    }
  };
  PropertyBinding.Composite = Composite;
  PropertyBinding.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
  };
  PropertyBinding.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
  };
  PropertyBinding.prototype.GetterByBindingType = [
    PropertyBinding.prototype._getValue_direct,
    PropertyBinding.prototype._getValue_array,
    PropertyBinding.prototype._getValue_arrayElement,
    PropertyBinding.prototype._getValue_toArray
  ];
  PropertyBinding.prototype.SetterByBindingTypeAndVersioning = [
    [
      // Direct
      PropertyBinding.prototype._setValue_direct,
      PropertyBinding.prototype._setValue_direct_setNeedsUpdate,
      PropertyBinding.prototype._setValue_direct_setMatrixWorldNeedsUpdate
    ],
    [
      // EntireArray
      PropertyBinding.prototype._setValue_array,
      PropertyBinding.prototype._setValue_array_setNeedsUpdate,
      PropertyBinding.prototype._setValue_array_setMatrixWorldNeedsUpdate
    ],
    [
      // ArrayElement
      PropertyBinding.prototype._setValue_arrayElement,
      PropertyBinding.prototype._setValue_arrayElement_setNeedsUpdate,
      PropertyBinding.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
    ],
    [
      // HasToFromArray
      PropertyBinding.prototype._setValue_fromArray,
      PropertyBinding.prototype._setValue_fromArray_setNeedsUpdate,
      PropertyBinding.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
    ]
  ];
  var _controlInterpolantsResultBuffer = new Float32Array(1);
  typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
    revision: REVISION
  } }));
  typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = REVISION);

  // src/index/terrain-viewer/camera-controller.ts
  var MOUSE_BUTTON_BITMASK = {
    left: 1,
    center: 4
  }, XY_PLANE = new Plane(new Vector3(0, 0, 1), 0), TILT_AXIS = new Vector3(1, 0, 0), TILT_RADIAN_BASE = new Vector3(0, -1, 0), TILT_MAX_RAD = Math.PI / 2, TILT_MIN_RAD = Math.PI / 6, MAX_ELEV = 255, TerrainViewerCameraController = class {
    camera;
    terrainSize = threePlaneSize(1, 1);
    mapWidth = 1;
    minZ = 1;
    maxZ = 1;
    speeds = { x: 0, y: 0, tilt: 0 };
    mouseMove = {
      left: { x: 0, y: 0 },
      center: { x: 0, y: 0 },
      wheel: 0
    };
    constructor(canvas, camera) {
      this.camera = camera, canvas.addEventListener("keydown", (event) => {
        switch (event.code) {
          case "KeyA":
            this.speeds.x = -1;
            return;
          case "KeyD":
            this.speeds.x = 1;
            return;
          case "KeyS":
            this.speeds.y = -1;
            return;
          case "KeyW":
            this.speeds.y = 1;
            return;
          case "KeyR":
            this.speeds.tilt = 1;
            return;
          case "KeyF":
            this.speeds.tilt = -1;
            return;
        }
      }), canvas.addEventListener("keyup", (event) => {
        switch (event.code) {
          case "KeyA":
          case "KeyD":
            this.speeds.x = 0;
            return;
          case "KeyS":
          case "KeyW":
            this.speeds.y = 0;
            return;
          case "KeyR":
          case "KeyF":
            this.speeds.tilt = 0;
            return;
        }
      }), canvas.addEventListener("wheel", (event) => {
        canvas !== document.activeElement || event.deltaY === 0 || (event.preventDefault(), this.mouseMove.wheel += event.deltaY);
      }), canvas.addEventListener("mousedown", (event) => {
        canvas === document.activeElement && (event.button === 0 || event.button === 1) && event.preventDefault();
      }), canvas.addEventListener("mousemove", (event) => {
        canvas === document.activeElement && ((event.buttons & MOUSE_BUTTON_BITMASK.left) > 0 && (event.preventDefault(), this.mouseMove.left.x += event.movementX, this.mouseMove.left.y += event.movementY), (event.buttons & MOUSE_BUTTON_BITMASK.center) > 0 && (event.preventDefault(), this.mouseMove.center.x += event.movementX, this.mouseMove.center.y += event.movementY));
      });
    }
    onResizeCanvas(aspect2) {
      this.camera.aspect = aspect2, this.camera.updateProjectionMatrix();
    }
    onUpdateTerrain(mapWidth, terrainSize) {
      this.mapWidth = mapWidth, this.terrainSize = terrainSize, this.minZ = MAX_ELEV * terrainSize.width / mapWidth, this.maxZ = terrainSize.height * 1.2, this.camera.far = this.terrainSize.height * 2, this.camera.position.x = 0, this.camera.position.y = -this.terrainSize.height, this.camera.position.z = this.terrainSize.height, this.camera.lookAt(0, 0, 0);
    }
    update(deltaMsec) {
      this.moveCameraXY(deltaMsec), this.tiltCamera(deltaMsec), this.moveCameraForward();
    }
    moveCameraXY(deltaMsec) {
      if (this.speeds.x === 0 && this.speeds.y === 0 && this.mouseMove.left.x === 0 && this.mouseMove.left.y === 0) return;
      let deltaDistKey = this.mapWidth / (this.terrainSize.width + 1) * 120 * 1e3 * deltaMsec / 1e3 / 60 / 60, deltaMouse = this.mouseMove.left, oldPosition = new Vector3().copy(this.camera.position);
      this.camera.position.x += deltaDistKey * this.speeds.x - deltaMouse.x, this.camera.position.y += deltaDistKey * this.speeds.y + deltaMouse.y, this.mouseMove.left.x = 0, this.mouseMove.left.y = 0;
      let lookAt = requireNonnull(this.pointLookAtXYPlane());
      (lookAt.x < -this.terrainSize.width / 2 || this.terrainSize.width / 2 < lookAt.x) && (this.camera.position.x = oldPosition.x), (lookAt.y < -this.terrainSize.height / 2 || this.terrainSize.height / 2 < lookAt.y) && (this.camera.position.y = oldPosition.y);
    }
    moveCameraForward() {
      if (this.mouseMove.wheel === 0) return;
      let moveDelta = this.mouseMove.wheel * this.terrainSize.width / -5e3;
      this.mouseMove.wheel = 0;
      let moveVector = this.camera.getWorldDirection(new Vector3()).normalize().multiplyScalar(moveDelta);
      this.camera.position.add(moveVector), (this.camera.position.z < this.minZ || this.maxZ < this.camera.position.z) && this.camera.position.sub(moveVector);
    }
    tiltCamera(deltaMsec) {
      if (this.mouseMove.center.y === 0 && this.speeds.tilt === 0) return;
      let deltaRadMouse = this.mouseMove.center.y * (-(Math.PI / 2) / 1e3), deltaRadKey = this.speeds.tilt * Math.PI / 4 * deltaMsec / 1e3, deltaRad = deltaRadMouse + deltaRadKey;
      this.mouseMove.center.y = 0;
      let center = requireNonnull(this.pointLookAtXYPlane());
      this.camera.position.sub(center), this.camera.position.applyAxisAngle(TILT_AXIS, deltaRad);
      let totalRad = TILT_RADIAN_BASE.angleTo(this.camera.position);
      (totalRad < TILT_MIN_RAD || TILT_MAX_RAD < totalRad || this.camera.position.z < this.minZ || this.maxZ < this.camera.position.z) && this.camera.position.applyAxisAngle(TILT_AXIS, -deltaRad), this.camera.position.add(center), this.camera.lookAt(center);
    }
    pointLookAtXYPlane() {
      let cameraDirection = this.camera.getWorldDirection(new Vector3());
      return new Ray(this.camera.position, cameraDirection).intersectPlane(XY_PLANE, new Vector3());
    }
  };

  // src/index/terrain-viewer.ts
  var TERRAIN_WIDTH = 2048, TerrainViewer = class {
    #doms;
    #dtm;
    #renderer;
    #cameraController;
    #scene;
    #terrain = null;
    #terrainSize = threePlaneSize(1, 1);
    #animationRequestId = null;
    constructor(doms, dtm) {
      this.#doms = doms, this.#dtm = dtm, this.#renderer = new WebGLRenderer({ canvas: doms.output, antialias: !1 }), this.#renderer.setPixelRatio(devicePixelRatio), this.#scene = new Scene();
      let light = new DirectionalLight(16777215, 5);
      light.position.set(1, 1, 1).normalize(), this.#scene.add(light), this.#scene.add(new AmbientLight(16777215, 0.09)), this.#cameraController = new TerrainViewerCameraController(doms.output, new PerspectiveCamera()), doms.show.addEventListener("click", () => {
        this.#show().catch(printError);
      }), doms.close.addEventListener("click", () => {
        this.#close();
      }), doms.output.addEventListener("blur", () => {
        this.#close();
      }), this.updateShowButton().catch(printError);
    }
    async updateShowButton() {
      this.#doms.show.disabled = await this.#dtm.size() === null;
    }
    async #show() {
      await this.#updateElevations();
      let { clientWidth, clientHeight } = document.documentElement;
      this.#renderer.setSize(clientWidth, clientHeight), this.#applyVisibleCss(), this.#cameraController.onResizeCanvas(clientWidth / clientHeight), this.#doms.output.focus(), this.#startRender();
    }
    async #updateElevations() {
      this.#terrain && this.#scene.remove(this.#terrain);
      let mapSize = await this.#dtm.size();
      if (mapSize === null) throw Error("Unexpected state");
      this.#terrainSize.width = TERRAIN_WIDTH, this.#terrainSize.height = Math.floor(TERRAIN_WIDTH / mapSize.width * mapSize.height), console.log("terrainSize=", this.#terrain, "mapSize=", mapSize), console.time("updateElevations");
      let geo = new PlaneGeometry(
        this.#terrainSize.width,
        this.#terrainSize.height,
        this.#terrainSize.width - 1,
        this.#terrainSize.height - 1
      );
      geo.clearGroups(), geo.addGroup(0, 1 / 0, 0), geo.addGroup(0, 1 / 0, 1), await this.#dtm.writeZ(geo), geo.computeBoundingSphere(), geo.computeVertexNormals();
      let map = new CanvasTexture(this.#doms.texture);
      map.colorSpace = SRGBColorSpace, this.#terrain = new Mesh(geo, [
        new MeshLambertMaterial({ map, transparent: !0 }),
        // Require a fallback mesh because the canvas of 7dtd-map can contain transparent pixels
        new MeshLambertMaterial({ color: new Color("lightgray") })
      ]), this.#scene.add(this.#terrain), this.#cameraController.onUpdateTerrain(mapSize.width, this.#terrainSize), console.timeEnd("updateElevations");
    }
    #applyVisibleCss() {
      Object.assign(this.#doms.output.style, {
        display: "block",
        zIndex: "100",
        position: "fixed",
        top: "0",
        left: "0"
      }), Object.assign(this.#doms.hud.style, {
        display: "block",
        zIndex: "101",
        position: "fixed",
        top: "0",
        left: "0",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        padding: "0 16px"
      }), Object.assign(this.#doms.close.style, {
        display: "block",
        zIndex: "101",
        position: "fixed",
        top: "0",
        right: "0"
      });
    }
    #startRender() {
      if (this.#animationRequestId) return;
      let r = (prevTime, currentTime) => {
        if (this.#doms.output.style.display === "none") {
          this.#animationRequestId = null;
          return;
        }
        this.#animationRequestId = requestAnimationFrame((t) => {
          r(currentTime, t);
        }), this.#cameraController.update(currentTime - prevTime), this.#renderer.render(this.#scene, this.#cameraController.camera);
      };
      r(0, 0);
    }
    #close() {
      this.#doms.output.blur(), this.#doms.output.style.display = "none", this.#doms.hud.style.display = "none", this.#doms.close.style.display = "none";
    }
  };

  // src/index/bundled-map-hander.ts
  var BundledMapHandler = class extends Generator {
    #doms;
    constructor(doms) {
      super(), this.#doms = doms, this.#renderOptions().catch(printError), this.#doms.select.addEventListener("change", () => {
        if (this.#doms.select.value === "") return;
        let mapName = this.#doms.select.value;
        this.emitNoAwait({ type: "select", mapName, mapDir: `maps/${mapName}` });
      });
    }
    async #renderOptions() {
      let maps = await fetchJson("maps/index.json");
      for (let map of maps) {
        let option = document.createElement("option");
        option.value = map, option.text = map, this.#doms.select.appendChild(option);
      }
    }
  };

  // src/lib/map-storage.ts
  var DB_NAME = "7dtd-map-a20";
  function flushDb() {
    return new Promise((resolve, reject) => {
      let req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = resolve, req.onerror = reject;
    });
  }
  flushDb().catch(printError);

  // src/index.ts
  function main() {
    init2(), init(), init4(), init3(), init5(), init6(), component("download").addEventListener("click", () => {
      let mapName = component("map_name", HTMLInputElement).value || "7dtd-map";
      downloadCanvasPng(`${mapName}.png`, component("map", HTMLCanvasElement));
    }), updateMapRightMargin(), window.addEventListener("resize", updateMapRightMargin);
    let dialogHandler = new DialogHandler({
      dialog: component("dialog", HTMLDialogElement),
      processingFiles: component("processing-files", HTMLUListElement)
    }), dndHandler = new DndHandler({ dragovered: document.body }, dialogHandler), bundledMapHandler = new BundledMapHandler({ select: component("bundled_map_select", HTMLSelectElement) }), fileHandler = new FileHandler(
      {
        files: component("files", HTMLInputElement),
        clearMap: component("clear_map", HTMLButtonElement),
        mapName: component("map_name", HTMLInputElement)
      },
      dialogHandler,
      () => new Worker("worker/file-processor.js"),
      dndHandler,
      bundledMapHandler
    ), labelHandler = new LabelHandler({ language: component("label_lang", HTMLSelectElement) }, navigator.languages), dtmHandler = new DtmHandler(() => new Worker("worker/dtm.js"), fileHandler), markerHandler = new MarkerHandler(
      {
        canvas: component("map", HTMLCanvasElement),
        output: component("mark_coods", HTMLElement),
        resetMarker: component("reset_mark", HTMLButtonElement)
      },
      dtmHandler
    ), prefabsHandler = new PrefabsHandler(
      {
        status: component("prefabs_num", HTMLElement),
        minTier: component("min_tier", HTMLInputElement),
        maxTier: component("max_tier", HTMLInputElement),
        prefabFilter: component("prefab_filter", HTMLInputElement),
        blockFilter: component("block_filter", HTMLInputElement)
      },
      new Worker("worker/prefabs-filter.js"),
      markerHandler,
      labelHandler,
      fileHandler,
      () => fetchJson("prefab-difficulties.json")
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
        scale: component("scale", HTMLInputElement)
      },
      new Worker("worker/map-renderer.js"),
      prefabsHandler,
      markerHandler,
      fileHandler
    ), new TerrainViewer(
      {
        output: component("terrain_viewer", HTMLCanvasElement),
        texture: component("map", HTMLCanvasElement),
        show: component("terrain_viewer_show", HTMLButtonElement),
        close: component("terrain_viewer_close", HTMLButtonElement),
        hud: component("terrarian_viewer_hud")
      },
      dtmHandler
    );
    let prefabListRenderer = new DelayedRenderer(
      component("controller", HTMLElement),
      component("prefabs_list", HTMLElement),
      (p) => prefabLi(p)
    );
    prefabsHandler.addListener((prefabs) => {
      prefabListRenderer.iterator = prefabs;
    }), new CursorCoodsHandler(
      {
        canvas: component("map", HTMLCanvasElement),
        output: component("cursor_coods", HTMLElement)
      },
      dtmHandler
    ), fileHandler.initialize().catch(printError);
  }
  function prefabLi(prefab) {
    let li = document.createElement("li");
    if (li.innerHTML = [
      `<button data-input-for="prefab_filter" data-input-text="${prefab.name}" title="Filter with this prefab name">\u25B2</button>`,
      ...prefab.dist ? [`${humanreadableDistance(prefab.dist)},`] : [],
      ...prefab.difficulty ? [
        `<span title="Difficulty Tier ${prefab.difficulty.toString()}" class="prefab_difficulty_${prefab.difficulty.toString()}">`,
        `  \u{1F480}${prefab.difficulty.toString()}`,
        "</span>"
      ] : [],
      `<a href="prefabs/${prefab.name}.html" target="_blank">`,
      prefab.highlightedLabel ?? "-",
      "/",
      `<small>${prefab.highlightedName ?? prefab.name}</small>`,
      "</a>",
      `(${prefab.x.toString()}, ${prefab.z.toString()})`
    ].join(" "), prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
      let blocksUl = document.createElement("ul");
      prefab.matchedBlocks.forEach((block) => {
        if (block.count === void 0) return;
        let blockLi = document.createElement("li");
        blockLi.innerHTML = [
          `<button data-input-for="block_filter" data-input-text="${block.name}" title="Filter with this block name">\u25B2</button>`,
          `${block.count.toString()}x`,
          block.highlightedLabel,
          `<small>${block.highlightedName}</small>`
        ].join(" "), blocksUl.appendChild(blockLi);
      }), li.appendChild(blocksUl);
    }
    return li;
  }
  function updateMapRightMargin() {
    let margin = component("controller").clientWidth + 48;
    component("map", HTMLCanvasElement).style.marginRight = `${margin.toString()}px`;
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", main) : main();
})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=index.js.map
