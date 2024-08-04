"use strict";
(() => {
  // src/lib/utils.ts
  function g(n, e = () => `Unexpected state: ${String(n)}`) {
    if (n == null) throw Error(e());
    return n;
  }
  function b(n, e, t = () => `Unexpected type: expected as ${String(e)}, but actual type ${String(n)}`) {
    if (n instanceof e) return n;
    throw Error(t());
  }
  function l(n, e) {
    let t = g(n, () => "Unexpected argument: id is null"), r = g(document.getElementById(t), () => `Element not found: #${t}`);
    return e ? b(r, e) : r;
  }
  function m(n) {
    console.error(n);
  }
  async function f(n) {
    let e = await fetch(n);
    if (!e.ok) throw Error(`Failed to fetch ${n}: ${e.statusText}`);
    return await e.json();
  }

  // src/lib/labels.ts
  var d = [
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
  ], E = {
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
  }, h = ["blocks", "prefabs", "shapes"], o = class n {
    static DEFAULT_LANGUAGE = "english";
    #t;
    #e;
    #r;
    #n;
    constructor(e, t) {
      this.#t = e, this.#e = s(t), this.#r = new Map(h.map((r) => [r, this.#o(n.DEFAULT_LANGUAGE, r)])), this.#n = this.#a();
    }
    get(e) {
      let t = this.#n.get(e);
      if (!t) throw new Error(`No labels for ${this.#e}/${e}`);
      return t;
    }
    set language(e) {
      e !== this.#e && (console.log("LabelHolder set language: %s -> %s", this.#e, e), this.#e = e, this.#n = this.#a());
    }
    #a() {
      return new Map(h.map((e) => [e, this.#s(e)]));
    }
    async #s(e) {
      let t = this.#r.get(e);
      if (!t) throw new Error(`No fallback for ${this.#e}/${e}`);
      return new u(await this.#o(this.#e, e), await t);
    }
    async #o(e, t) {
      return new Map(Object.entries(await f(`${this.#t}/${e}/${t}.json`)));
    }
  }, u = class {
    #t;
    #e;
    constructor(e, t) {
      this.#t = e, this.#e = t;
    }
    get(e) {
      return this.#t.get(e) ?? this.#e.get(e);
    }
  };
  function s(n) {
    for (let e of n)
      for (let [t, r] of Object.entries(E))
        if (e.startsWith(t)) return r;
    return o.DEFAULT_LANGUAGE;
  }

  // src/lib/label-handler.ts
  var i = class {
    doms;
    listener = [];
    constructor(e, t) {
      this.doms = e, this.buildSelectOptions(t), this.doms.language.addEventListener("change", () => {
        this.listener.forEach((r) => {
          r(this.doms.language.value)?.catch(m);
        });
      });
    }
    buildSelectOptions(e) {
      let t = new Set(Array.from(this.doms.language.options).map((a) => a.value));
      for (let a of d) {
        if (t.has(a))
          continue;
        let c = document.createElement("option");
        c.textContent = a, this.doms.language.appendChild(c);
      }
      let r = s(e);
      this.doms.language.value !== r && (this.doms.language.value = s(e), requestAnimationFrame(() => this.doms.language.dispatchEvent(new Event("change"))));
    }
    addListener(e) {
      this.listener.push(e);
    }
  };

  // src/prefabs/main.ts
  function p() {
    let n = new o("../labels", navigator.languages);
    new i({ language: l("label_lang", HTMLSelectElement) }, navigator.languages).addListener(async (t) => {
      n.language = t, L(await n.get("prefabs")), w(await n.get("blocks"), await n.get("shapes"));
    });
  }
  function L(n) {
    let e = document.querySelector(".prefab_name")?.textContent?.trim();
    if (!e) return;
    let t = document.querySelector(".prefab_label");
    t && (t.textContent = n.get(e) ?? "-");
  }
  function w(n, e) {
    for (let t of l("blocks", HTMLElement).querySelectorAll(".block")) {
      let r = t.querySelector(".block_name")?.textContent?.trim();
      if (!r) continue;
      let a = t.querySelector(".block_label");
      a && (a.textContent = n.get(r) ?? e.get(r) ?? "-");
    }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", p) : p();
})();
//# sourceMappingURL=main.js.map
