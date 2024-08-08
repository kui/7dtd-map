"use strict";
(() => {
  // src/lib/utils.ts
  async function sleep(msec) {
    return new Promise((r) => setTimeout(r, msec));
  }
  function printError(e) {
    console.error(e);
  }
  async function fetchJson(url) {
    let r = await fetch(url);
    if (!r.ok) throw Error(`Failed to fetch ${url}: ${r.statusText}`);
    return await r.json();
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

  // src/lib/labels.ts
  var LANGUAGE_TAGS = {
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

  // src/lib/errors.ts
  var MultipleErrors = class extends Error {
    #causes;
    constructor(errors) {
      super("Multiple errors occurred"), this.#causes = errors;
    }
    get causes() {
      return this.#causes;
    }
  };

  // src/lib/events.ts
  var ListenerManager = class {
    #listeners = [];
    addListener(listener) {
      this.#listeners.push(listener);
    }
    removeListener(listener) {
      let index = this.#listeners.indexOf(listener);
      index >= 0 && this.#listeners.splice(index, 1);
    }
    async dispatch(m) {
      let errors = (await Promise.allSettled(this.#listeners.map((fn) => fn(m)))).flatMap((r) => r.status === "rejected" ? [r.reason] : []);
      if (errors.length > 0) throw new MultipleErrors(errors);
    }
    dispatchNoAwait(m) {
      this.dispatch(m).catch(printError);
    }
  };

  // src/lib/prefabs.ts
  var PrefabFilter = class {
    #labelHolder;
    #blockPrefabCountsHolder;
    #preFiltereds = [];
    #filtered = [];
    #status = "";
    #listeners = new ListenerManager();
    #preExcluds = [];
    all = [];
    markCoords = null;
    difficulty = { start: 0, end: 5 };
    prefabFilterRegexp = "";
    blockFilterRegexp = "";
    constructor(labelsBaseUrl, navigatorLanguages, fetchPrefabBlockCounts) {
      this.#labelHolder = new LabelHolder(labelsBaseUrl, navigatorLanguages), this.#blockPrefabCountsHolder = new CacheHolder(fetchPrefabBlockCounts, () => {
      });
    }
    set language(lang) {
      this.#labelHolder.language = lang;
    }
    set preExcludes(patterns) {
      this.#preExcluds = patterns.map((f) => new RegExp(f));
    }
    update = throttledInvoker(() => this.updateImmediately());
    async updateImmediately() {
      await this.#applyFilter(), this.#updateStatus(), this.#updateDistance(), this.#sort(), await this.#listeners.dispatch({ update: { status: this.#status, prefabs: this.#filtered } });
    }
    #updateStatus() {
      this.prefabFilterRegexp.length === 0 && this.blockFilterRegexp.length === 0 && this.difficulty.start === 0 && this.difficulty.end === 5 ? this.#status = `All ${this.#preFiltereds.length.toString()} prefabs` : this.#filtered.length === 0 ? this.#status = "No prefabs matched" : this.#status = `${this.#filtered.length.toString()} prefabs matched`;
    }
    addListener(fn) {
      this.#listeners.addListener(fn);
    }
    async #applyFilter() {
      this.#preFiltereds = this.#preMatch(this.all);
      let result = this.#matchByDifficulty(this.#preFiltereds);
      result = await this.#matchByPrefabName(result), result = await this.#matchByBlockName(result), this.#filtered = result;
    }
    #preMatch(prefabs2) {
      return prefabs2.filter((p) => {
        for (let filter of this.#preExcluds) if (filter.test(p.name)) return !1;
        return !0;
      });
    }
    #matchByDifficulty(prefabs2) {
      return prefabs2.filter((p) => {
        let d = p.difficulty ?? 0;
        return d >= this.difficulty.start && d <= this.difficulty.end;
      });
    }
    async #matchByPrefabName(prefabs2) {
      let labels = await this.#labelHolder.get("prefabs"), pattern = new RegExp(this.prefabFilterRegexp, "i");
      return prefabs2.flatMap((prefab) => {
        let label = labels.get(prefab.name);
        if (this.prefabFilterRegexp.length === 0)
          return {
            ...prefab,
            highlightedName: prefab.name,
            highlightedLabel: label ?? "-"
          };
        let highlightedName = matchAndHighlight(prefab.name, pattern), highlightedLabel = label && matchAndHighlight(label, pattern);
        return highlightedName != null || highlightedLabel != null ? {
          ...prefab,
          highlightedName: highlightedName ?? prefab.name,
          highlightedLabel: highlightedLabel ?? label ?? "-"
        } : [];
      });
    }
    async #matchByBlockName(prefabs2) {
      if (this.blockFilterRegexp.length === 0)
        return prefabs2;
      let matchedPrefabNames = await this.#matchPrefabTypesByBlockName(prefabs2);
      return prefabs2.flatMap((prefab) => {
        let matchedBlocks = matchedPrefabNames[prefab.name];
        return matchedBlocks ? { ...prefab, matchedBlocks } : [];
      });
    }
    async #matchPrefabTypesByBlockName(prefabs2) {
      let blockLabels = await this.#labelHolder.get("blocks"), shapeLabels = await this.#labelHolder.get("shapes"), prefabNames = new Set(prefabs2.map((p) => p.name)), matchedPrefabNames = {}, pattern = new RegExp(this.blockFilterRegexp, "i");
      for (let [blockName, prefabs3] of Object.entries(await this.#blockPrefabCountsHolder.get())) {
        let highlightedName = matchAndHighlight(blockName, pattern), label = blockLabels.get(blockName) ?? shapeLabels.get(blockName) ?? "-", highlightedLabel = label && matchAndHighlight(label, pattern);
        if (!(highlightedName == null && highlightedLabel == null))
          for (let [prefabName, count] of Object.entries(prefabs3))
            prefabNames.has(prefabName) && (matchedPrefabNames[prefabName] = (matchedPrefabNames[prefabName] ?? []).concat({
              name: blockName,
              highlightedName: highlightedName ?? blockName,
              highlightedLabel: highlightedLabel ?? label,
              count
            }));
      }
      return matchedPrefabNames;
    }
    #updateDistance() {
      if (this.markCoords) {
        let { markCoords } = this;
        this.#filtered.forEach((p) => p.distance = [computeDirection(p, markCoords), computeDistance(p, markCoords)]);
      } else
        this.#filtered.forEach((p) => p.distance = null);
    }
    #sort() {
      this.all.length === 0 ? this.#status = "No prefabs loaded" : this.#filtered.length === 0 ? this.#status += ". Please relax the filter conditions" : this.markCoords ? (this.#status += ", order by distances from the flag", this.#filtered.sort(distSorter)) : this.blockFilterRegexp.length > 0 ? (this.#status += ", order by counts of matched blocks", this.#filtered.sort(blockCountSorter)) : this.#filtered.sort(nameSorter);
    }
  };
  function nameSorter(a, b) {
    return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
  }
  function blockCountSorter(a, b) {
    if (!a.matchedBlocks || !b.matchedBlocks) return nameSorter(a, b);
    let aCount = a.matchedBlocks.reduce((acc, b2) => acc + (b2.count ?? 0), 0), bCount = b.matchedBlocks.reduce((acc, b2) => acc + (b2.count ?? 0), 0);
    return aCount < bCount ? 1 : aCount > bCount ? -1 : nameSorter(a, b);
  }
  function distSorter(a, b) {
    return !a.distance || !b.distance ? nameSorter(a, b) : a.distance[1] > b.distance[1] ? 1 : a.distance[1] < b.distance[1] ? -1 : nameSorter(a, b);
  }
  function computeDistance(targetCoords, baseCoords) {
    return Math.round(Math.sqrt((targetCoords.x - baseCoords.x) ** 2 + (targetCoords.z - baseCoords.z) ** 2));
  }
  function computeDirection(targetCoords, baseCoords) {
    let dx = targetCoords.x - baseCoords.x, dz = targetCoords.z - baseCoords.z;
    if (dx === 0 && dz === 0) return null;
    let angle = Math.atan2(dz, dx) * 180 / Math.PI;
    return angle < -157.5 || angle >= 157.5 ? "W" : angle < -112.5 ? "SW" : angle < -67.5 ? "S" : angle < -22.5 ? "SE" : angle < 22.5 ? "E" : angle < 67.5 ? "NE" : angle < 112.5 ? "N" : "NW";
  }
  function matchAndHighlight(str, regex) {
    let isMatched = !1, highlighted = str.replace(regex, (m) => (isMatched = m.length > 0, `<mark>${m}</mark>`));
    return isMatched ? highlighted : null;
  }

  // src/worker/prefabs-filter.ts
  var prefabs = new PrefabFilter(
    "../labels",
    navigator.languages,
    async () => invertCounts(await fetchJson("../prefab-block-counts.json"))
  );
  onmessage = ({ data }) => {
    console.log("Prefab-filter received message: ", data), Object.assign(prefabs, data).update().catch(printError);
  };
  prefabs.addListener((m) => {
    console.log("Prefab-filter send message: ", m), postMessage(m);
  });
  function invertCounts(counts) {
    let blockPrefabCounts = {};
    for (let [prefabName, blockCounts] of Object.entries(counts))
      for (let [blockName, count] of Object.entries(blockCounts))
        blockPrefabCounts[blockName] = Object.assign(blockPrefabCounts[blockName] ?? {}, { [prefabName]: count });
    return blockPrefabCounts;
  }
})();
//# sourceMappingURL=prefabs-filter.js.map
