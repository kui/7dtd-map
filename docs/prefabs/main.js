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
  function printError(e) {
    console.error(e);
  }
  async function fetchJson(url) {
    let r = await fetch(url);
    if (!r.ok) throw Error(`Failed to fetch ${url}: ${r.statusText}`);
    return await r.json();
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

  // src/lib/label-handler.ts
  var LabelHandler = class {
    #doms;
    #listener = new ListenerManager();
    constructor(doms, navigatorLanguages) {
      this.#doms = doms, this.buildSelectOptions(navigatorLanguages), this.#doms.language.addEventListener("change", () => {
        this.#listener.dispatchNoAwait({ update: { lang: this.#doms.language.value } });
      });
    }
    buildSelectOptions(navigatorLanguages) {
      let existingLangs = new Set(Array.from(this.#doms.language.options).map((o) => o.value));
      for (let lang of LANGUAGES) {
        if (existingLangs.has(lang))
          continue;
        let option = document.createElement("option");
        option.textContent = lang, this.#doms.language.appendChild(option);
      }
      let browserLang = resolveLanguage(navigatorLanguages);
      this.#doms.language.value !== browserLang && (this.#doms.language.value = resolveLanguage(navigatorLanguages), requestAnimationFrame(() => this.#doms.language.dispatchEvent(new Event("change"))));
    }
    addListener(fn) {
      this.#listener.addListener(fn);
    }
  };

  // src/prefabs/main.ts
  function main() {
    let labelHolder = new LabelHolder("../labels", navigator.languages);
    new LabelHandler({ language: component("label_lang", HTMLSelectElement) }, navigator.languages).addListener(async ({ update: { lang } }) => {
      labelHolder.language = lang, updatePrefabLabels(await labelHolder.get("prefabs")), udpateBlockLabels(await labelHolder.get("blocks"), await labelHolder.get("shapes"));
    });
  }
  function updatePrefabLabels(labels) {
    let name = document.querySelector(".prefab_name")?.textContent?.trim();
    if (!name) return;
    let labelEl = document.querySelector(".prefab_label");
    labelEl && (labelEl.textContent = labels.get(name) ?? "-");
  }
  function udpateBlockLabels(blockLabels, shapeLabels) {
    for (let blockEl of component("blocks", HTMLElement).querySelectorAll(".block")) {
      let name = blockEl.querySelector(".block_name")?.textContent?.trim();
      if (!name) continue;
      let labelEl = blockEl.querySelector(".block_label");
      labelEl && (labelEl.textContent = blockLabels.get(name) ?? shapeLabels.get(name) ?? "-");
    }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", main) : main();
})();
//# sourceMappingURL=main.js.map
