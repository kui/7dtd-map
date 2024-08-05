"use strict";
(() => {
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
  function waitAnimationFrame() {
    return new Promise((r) => requestAnimationFrame(r));
  }
  function printError(e) {
    console.error(e);
  }
  async function fetchJson(url) {
    let r = await fetch(url);
    if (!r.ok) throw Error(`Failed to fetch ${url}: ${r.statusText}`);
    return await r.json();
  }

  // src/lib/ui/preset-button.ts
  function init() {
    document.body.addEventListener("click", ({ target }) => {
      if (target instanceof HTMLButtonElement && target.dataset.inputFor != null) {
        let input = component(target.dataset.inputFor, HTMLInputElement);
        input.value = requireNonnull(target.dataset.inputText ?? target.textContent), input.dispatchEvent(new Event("input", { bubbles: !0 }));
      }
    });
  }

  // src/lib/ui/sync-output.ts
  function init2() {
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

  // src/lib/ui/min-max-inputs.ts
  function init3() {
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
  async function renderUntil(self, stopPredicate) {
    do {
      let result = self._iterator.next();
      if (isReturn(result)) break;
      let df = new DocumentFragment();
      result.value.forEach((i) => df.appendChild(self.itemRenderer(i))), self.appendee.appendChild(df), await waitAnimationFrame();
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

  // src/lib/url-state.ts
  var UrlState = class _UrlState {
    url;
    inputs;
    udpateListeners = [];
    constructor(browserUrl, elements) {
      this.url = browserUrl, this.inputs = new Map(Array.from(elements).map((e) => [e.element, e])), this.init();
    }
    init() {
      for (let [input, { defaultValue }] of this.inputs.entries())
        this.url.searchParams.has(input.id) && (setValue(input, this.url.searchParams.get(input.id) ?? defaultValue), input.dispatchEvent(new Event("input"))), input.addEventListener("input", () => {
          this.updateUrl(input, defaultValue), this.udpateListeners.forEach((fn) => {
            fn(this.url);
          });
        });
    }
    static create(location2, elements) {
      return new _UrlState(
        new URL(location2.href),
        Array.from(elements).map((e) => ({ defaultValue: getValue(e), element: e }))
      );
    }
    updateUrl(input, defaultValue) {
      let value = getValue(input);
      value === defaultValue ? this.url.searchParams.delete(input.id) : this.url.searchParams.set(input.id, value);
    }
    addUpdateListener(listener) {
      this.udpateListeners.push(listener);
    }
  };
  function getValue(input) {
    switch (input.type) {
      case "checkbox":
        return input.checked ? "t" : "";
      default:
        return input.value;
    }
  }
  function setValue(input, value) {
    switch (input.type) {
      case "checkbox":
        input.checked = value === "t";
        break;
      default:
        input.value = value;
    }
  }

  // src/prefabs.ts
  function main() {
    init(), init2(), init3(), UrlState.create(location, document.querySelectorAll("input")).addUpdateListener((url) => {
      window.history.replaceState(null, "", url.toString());
    });
    let prefabsHandler = new PrefabsHandler(new Worker("worker/prefabs-filter.js"));
    (async () => {
      let [prefabBlockCounts, difficulties] = await Promise.all([
        fetchJson("prefab-block-counts.json"),
        fetchJson("prefab-difficulties.json")
      ]);
      prefabsHandler.prefabs = Object.keys(prefabBlockCounts).map((n) => ({
        name: n,
        x: 0,
        z: 0,
        difficulty: difficulties[n] ?? 0
      }));
    })().catch(printError);
    let minTier = component("min_tier", HTMLInputElement), maxTier = component("max_tier", HTMLInputElement), tierRange = { start: minTier.valueAsNumber, end: maxTier.valueAsNumber };
    prefabsHandler.tierRange = tierRange, minTier.addEventListener("input", () => {
      let newMinTier = minTier.valueAsNumber;
      newMinTier !== tierRange.start && (tierRange.start = newMinTier, newMinTier > maxTier.valueAsNumber && (maxTier.value = minTier.value, tierRange.end = newMinTier, maxTier.dispatchEvent(new Event("input"))), prefabsHandler.tierRange = tierRange);
    }), maxTier.addEventListener("input", () => {
      let newMaxTier = maxTier.valueAsNumber;
      newMaxTier !== tierRange.end && (tierRange.end = newMaxTier, newMaxTier < minTier.valueAsNumber && (minTier.value = maxTier.value, tierRange.start = newMaxTier, minTier.dispatchEvent(new Event("input"))), prefabsHandler.tierRange = tierRange);
    }), component("tier_clear", HTMLButtonElement).addEventListener("click", () => {
      minTier.value = minTier.defaultValue, maxTier.value = maxTier.defaultValue, minTier.dispatchEvent(new Event("input")), maxTier.dispatchEvent(new Event("input"));
    });
    let prefabFilter = component("prefab_filter", HTMLInputElement);
    prefabsHandler.prefabFilter = prefabFilter.value, prefabFilter.addEventListener("input", () => {
      prefabsHandler.prefabFilter = prefabFilter.value;
    });
    let blockFilter = component("block_filter", HTMLInputElement);
    prefabsHandler.blockFilter = blockFilter.value, blockFilter.addEventListener("input", () => {
      prefabsHandler.blockFilter = blockFilter.value;
    }), new LabelHandler({ language: component("label_lang", HTMLSelectElement) }, navigator.languages).addListener((lang) => {
      prefabsHandler.language = lang;
    });
    let prefabFilterHandler = new PrefabFilterHandler({ devPrefabs: component("dev_prefabs", HTMLInputElement) });
    prefabFilterHandler.addUpdateListener(() => {
      prefabsHandler.refresh();
    });
    let prefabListRenderer = new DelayedRenderer(
      document.documentElement,
      component("prefabs_list"),
      (p) => prefabLi(p)
    );
    prefabsHandler.listeners.push((update) => {
      prefabListRenderer.iterator = update.prefabs.filter(prefabFilterHandler.filter());
    }), document.addEventListener("scroll", () => {
      document.documentElement.dispatchEvent(new Event("scroll"));
    });
  }
  function prefabLi(prefab) {
    let li = document.createElement("li");
    if (li.innerHTML = [
      ...prefab.difficulty ? [
        `<span title="Difficulty Tier ${prefab.difficulty.toString()}" class="prefab_difficulty_${prefab.difficulty.toString()}">`,
        `  \u{1F480}${prefab.difficulty.toString()}`,
        "</span>"
      ] : [],
      `<a href="prefabs/${prefab.name}.html" target="_blank">`,
      prefab.highlightedLabel ?? "-",
      "/",
      `<small>${prefab.highlightedName ?? prefab.name}</small></a>`,
      ...prefab.matchedBlocks && prefab.matchedBlocks.length > 0 ? ["has", countHighlightedBlocks(prefab.matchedBlocks), "blocks"] : []
    ].join(" "), prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
      let blocksUl = document.createElement("ul");
      prefab.matchedBlocks.forEach((block) => {
        if (block.count === void 0) return;
        let blockLi = document.createElement("li");
        blockLi.innerHTML = [
          `<button data-input-for="blocks_filter" data-input-text="${block.name}" title="Filter with this block name">\u25B2</button>`,
          `${block.count.toString()}x`,
          block.highlightedLabel,
          `<small>${block.highlightedName}</small>`
        ].join(" "), blocksUl.appendChild(blockLi);
      }), li.appendChild(blocksUl);
    }
    return li;
  }
  function countHighlightedBlocks(blocks) {
    return blocks.reduce((acc, b) => acc + (b.count ?? 0), 0);
  }
  var PrefabsHandler = class {
    worker;
    listeners = [];
    constructor(worker) {
      this.worker = worker, this.worker.addEventListener("message", (event) => {
        for (let fn of this.listeners)
          fn(event.data)?.catch(printError);
      });
    }
    set prefabs(p) {
      this.worker.postMessage({ all: p });
    }
    set tierRange(range) {
      this.worker.postMessage({ difficulty: range });
    }
    set prefabFilter(filter) {
      this.worker.postMessage({ prefabFilterRegexp: filter });
    }
    set blockFilter(filter) {
      this.worker.postMessage({ blockFilterRegexp: filter });
    }
    set language(language) {
      this.worker.postMessage({ language });
    }
    refresh() {
      this.worker.postMessage({});
    }
  }, DEV_PREFAB_REGEXP = /^(aaa_|AAA_|spacercise_|terrain_smoothing_bug)/, PrefabFilterHandler = class {
    displayDevPrefab = !1;
    updateListener = [];
    constructor(doms) {
      this.displayDevPrefab = doms.devPrefabs.checked, doms.devPrefabs.addEventListener("input", () => {
        this.displayDevPrefab = doms.devPrefabs.checked, this.updateListener.forEach((fn) => {
          fn();
        });
      });
    }
    filter() {
      return (prefab) => this.displayDevPrefab ? !0 : !DEV_PREFAB_REGEXP.test(prefab.name);
    }
    addUpdateListener(fn) {
      this.updateListener.push(fn);
    }
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", main) : main();
})();
//# sourceMappingURL=prefabs.js.map
