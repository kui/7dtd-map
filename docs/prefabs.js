"use strict";
(() => {
  // src/lib/utils.ts
  function m(t, e = () => `Unexpected state: ${String(t)}`) {
    if (t == null) throw Error(e());
    return t;
  }
  function _(t, e, n = () => `Unexpected type: expected as ${String(e)}, but actual type ${String(t)}`) {
    if (t instanceof e) return t;
    throw Error(n());
  }
  function o(t, e) {
    let n = m(t, () => "Unexpected argument: id is null"), r = m(document.getElementById(n), () => `Element not found: #${n}`);
    return e ? _(r, e) : r;
  }
  function x() {
    return new Promise((t) => requestAnimationFrame(t));
  }
  function l(t) {
    console.error(t);
  }
  async function d(t) {
    let e = await fetch(t);
    if (!e.ok) throw Error(`Failed to fetch ${t}: ${e.statusText}`);
    return await e.json();
  }

  // src/lib/ui/preset-button.ts
  function k() {
    document.body.addEventListener("click", ({ target: t }) => {
      if (t instanceof HTMLButtonElement && t.dataset.inputFor != null) {
        let e = o(t.dataset.inputFor, HTMLInputElement);
        e.value = m(t.dataset.inputText ?? t.textContent), e.dispatchEvent(new Event("input", { bubbles: !0 }));
      }
    });
  }

  // src/lib/ui/sync-output.ts
  function y() {
    for (let t of ["input", "change"])
      window.addEventListener(t, ({ target: e }) => {
        if (!(e instanceof HTMLInputElement) || !(e instanceof HTMLTextAreaElement || !(e instanceof HTMLSelectElement)))
          return;
        let n = document.querySelectorAll(`output[data-sync-for="${e.id}"]`);
        for (let r of n)
          r.value = e.value;
      });
    for (let t of document.querySelectorAll("output[data-sync-for]")) {
      let e = o(t.dataset.syncFor, HTMLInputElement);
      t.value = e.value;
    }
  }

  // src/lib/ui/min-max-inputs.ts
  function H() {
    for (let t of ["input", "change"])
      window.addEventListener(t, ({ target: e }) => {
        e instanceof HTMLInputElement && A(e);
      });
    for (let t of [
      ...document.querySelectorAll("input[data-max]"),
      ...document.querySelectorAll("input[data-min]")
    ])
      A(t);
  }
  function A(t) {
    t.dataset.min && D(t, t.dataset.min), t.dataset.max && W(t, t.dataset.max);
  }
  function D(t, e) {
    let n = document.querySelectorAll(`input[data-max="${e}"]`);
    for (let r of n)
      if (r.valueAsNumber < t.valueAsNumber) {
        let a = r.value;
        r.value = t.value, a !== r.value && I(r);
      }
  }
  function W(t, e) {
    let n = document.querySelectorAll(`input[data-min="${e}"]`);
    for (let r of n)
      if (r.valueAsNumber > t.valueAsNumber) {
        let a = r.value;
        r.value = t.value, a !== r.value && I(r);
      }
  }
  function I(t) {
    for (let e of ["input", "change"]) t.dispatchEvent(new Event(e, { bubbles: !0 }));
  }

  // src/lib/delayed-renderer.ts
  var f = class {
    _iterator = [][Symbol.iterator]();
    appendee;
    scrollableWrapper;
    itemRenderer;
    scrollCallback = () => {
      this.renderAll().catch(l);
    };
    constructor(e, n, r) {
      if (!e.contains(n)) throw Error("Wrapper element should contain appendee element");
      n.innerHTML = "", this.appendee = n, this.scrollableWrapper = e, this.itemRenderer = r;
    }
    set iterator(e) {
      "next" in e ? this._iterator = R(e) : this._iterator = R(e[Symbol.iterator]()), this.appendee.innerHTML = "", this.scrollableWrapper.removeEventListener("scroll", this.scrollCallback), requestAnimationFrame(() => {
        this.scrollableWrapper.removeEventListener("scroll", this.scrollCallback), this.scrollableWrapper.addEventListener("scroll", this.scrollCallback, { once: !0 }), P(this, () => q(this.scrollableWrapper)).catch(l);
      });
    }
    async renderAll() {
      await P(this, () => !1);
    }
  };
  async function P(t, e) {
    do {
      let n = t._iterator.next();
      if (p(n)) break;
      let r = new DocumentFragment();
      n.value.forEach((a) => r.appendChild(t.itemRenderer(a))), t.appendee.appendChild(r), await x();
    } while (!e());
  }
  function q(t) {
    return t.clientHeight + 100 < t.scrollHeight;
  }
  function R(t, e = 10) {
    let n = null, r = {
      next(...a) {
        if (n) return n;
        let s = Array(e);
        for (let u = 0; u < e; u++) {
          let c = t.next(...a);
          p(c) ? n = c : s[u] = c.value;
        }
        return {
          done: !1,
          value: s
        };
      }
    };
    return "throw" in t && (r.throw = (a) => {
      let s = t.throw(a);
      return p(s) ? s : { done: s.done ?? !1, value: [s.value] };
    }), "return" in t && (r.return = (a) => {
      let s = t.return(a);
      return p(s) ? s : { done: s.done ?? !1, value: [s.value] };
    }), r;
  }
  function p(t) {
    return !!t.done;
  }

  // src/lib/labels.ts
  var N = [
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
  ], O = {
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
  }, S = ["blocks", "prefabs", "shapes"], E = class t {
    static DEFAULT_LANGUAGE = "english";
    #t;
    #e;
    #r;
    #n;
    constructor(e, n) {
      this.#t = e, this.#e = h(n), this.#r = new Map(S.map((r) => [r, this.#i(t.DEFAULT_LANGUAGE, r)])), this.#n = this.#a();
    }
    get(e) {
      let n = this.#n.get(e);
      if (!n) throw new Error(`No labels for ${this.#e}/${e}`);
      return n;
    }
    set language(e) {
      e !== this.#e && (console.log("LabelHolder set language: %s -> %s", this.#e, e), this.#e = e, this.#n = this.#a());
    }
    #a() {
      return new Map(S.map((e) => [e, this.#s(e)]));
    }
    async #s(e) {
      let n = this.#r.get(e);
      if (!n) throw new Error(`No fallback for ${this.#e}/${e}`);
      return new b(await this.#i(this.#e, e), await n);
    }
    async #i(e, n) {
      return new Map(Object.entries(await d(`${this.#t}/${e}/${n}.json`)));
    }
  }, b = class {
    #t;
    #e;
    constructor(e, n) {
      this.#t = e, this.#e = n;
    }
    get(e) {
      return this.#t.get(e) ?? this.#e.get(e);
    }
  };
  function h(t) {
    for (let e of t)
      for (let [n, r] of Object.entries(O))
        if (e.startsWith(n)) return r;
    return E.DEFAULT_LANGUAGE;
  }

  // src/lib/label-handler.ts
  var g = class {
    doms;
    listener = [];
    constructor(e, n) {
      this.doms = e, this.buildSelectOptions(n), this.doms.language.addEventListener("change", () => {
        this.listener.forEach((r) => {
          r(this.doms.language.value)?.catch(l);
        });
      });
    }
    buildSelectOptions(e) {
      let n = new Set(Array.from(this.doms.language.options).map((a) => a.value));
      for (let a of N) {
        if (n.has(a))
          continue;
        let s = document.createElement("option");
        s.textContent = a, this.doms.language.appendChild(s);
      }
      let r = h(e);
      this.doms.language.value !== r && (this.doms.language.value = h(e), requestAnimationFrame(() => this.doms.language.dispatchEvent(new Event("change"))));
    }
    addListener(e) {
      this.listener.push(e);
    }
  };

  // src/lib/url-state.ts
  var v = class t {
    url;
    inputs;
    udpateListeners = [];
    constructor(e, n) {
      this.url = e, this.inputs = new Map(Array.from(n).map((r) => [r.element, r])), this.init();
    }
    init() {
      for (let [e, { defaultValue: n }] of this.inputs.entries())
        this.url.searchParams.has(e.id) && (V(e, this.url.searchParams.get(e.id) ?? n), e.dispatchEvent(new Event("input"))), e.addEventListener("input", () => {
          this.updateUrl(e, n), this.udpateListeners.forEach((r) => {
            r(this.url);
          });
        });
    }
    static create(e, n) {
      return new t(
        new URL(e.href),
        Array.from(n).map((r) => ({ defaultValue: F(r), element: r }))
      );
    }
    updateUrl(e, n) {
      let r = F(e);
      r === n ? this.url.searchParams.delete(e.id) : this.url.searchParams.set(e.id, r);
    }
    addUpdateListener(e) {
      this.udpateListeners.push(e);
    }
  };
  function F(t) {
    switch (t.type) {
      case "checkbox":
        return t.checked ? "t" : "";
      default:
        return t.value;
    }
  }
  function V(t, e) {
    switch (t.type) {
      case "checkbox":
        t.checked = e === "t";
        break;
      default:
        t.value = e;
    }
  }

  // src/prefabs.ts
  function U() {
    k(), y(), H(), v.create(location, document.querySelectorAll("input")).addUpdateListener((i) => {
      window.history.replaceState(null, "", i.toString());
    });
    let e = new L(new Worker("worker/prefabs-filter.js"));
    (async () => {
      let [i, $] = await Promise.all([
        d("prefab-block-counts.json"),
        d("prefab-difficulties.json")
      ]);
      e.prefabs = Object.keys(i).map((w) => ({
        name: w,
        x: 0,
        z: 0,
        difficulty: $[w] ?? 0
      }));
    })().catch(l);
    let n = o("min_tier", HTMLInputElement), r = o("max_tier", HTMLInputElement), a = { start: n.valueAsNumber, end: r.valueAsNumber };
    e.tierRange = a, n.addEventListener("input", () => {
      let i = n.valueAsNumber;
      i !== a.start && (a.start = i, i > r.valueAsNumber && (r.value = n.value, a.end = i, r.dispatchEvent(new Event("input"))), e.tierRange = a);
    }), r.addEventListener("input", () => {
      let i = r.valueAsNumber;
      i !== a.end && (a.end = i, i < n.valueAsNumber && (n.value = r.value, a.start = i, n.dispatchEvent(new Event("input"))), e.tierRange = a);
    }), o("tier_clear", HTMLButtonElement).addEventListener("click", () => {
      n.value = n.defaultValue, r.value = r.defaultValue, n.dispatchEvent(new Event("input")), r.dispatchEvent(new Event("input"));
    });
    let u = o("prefab_filter", HTMLInputElement);
    e.prefabFilter = u.value, u.addEventListener("input", () => {
      e.prefabFilter = u.value;
    });
    let c = o("block_filter", HTMLInputElement);
    e.blockFilter = c.value, c.addEventListener("input", () => {
      e.blockFilter = c.value;
    }), new g({ language: o("label_lang", HTMLSelectElement) }, navigator.languages).addListener((i) => {
      e.language = i;
    });
    let M = new T({ devPrefabs: o("dev_prefabs", HTMLInputElement) });
    M.addUpdateListener(() => {
      e.refresh();
    });
    let C = new f(
      document.documentElement,
      o("prefabs_list"),
      (i) => z(i)
    );
    e.listeners.push((i) => {
      C.iterator = i.prefabs.filter(M.filter());
    }), document.addEventListener("scroll", () => {
      document.documentElement.dispatchEvent(new Event("scroll"));
    });
  }
  function z(t) {
    let e = document.createElement("li");
    if (e.innerHTML = [
      ...t.difficulty ? [
        `<span title="Difficulty Tier ${t.difficulty.toString()}" class="prefab_difficulty_${t.difficulty.toString()}">`,
        `  \u{1F480}${t.difficulty.toString()}`,
        "</span>"
      ] : [],
      `<a href="prefabs/${t.name}.html" target="_blank">`,
      t.highlightedLabel ?? "-",
      "/",
      `<small>${t.highlightedName ?? t.name}</small></a>`,
      ...t.matchedBlocks && t.matchedBlocks.length > 0 ? ["has", J(t.matchedBlocks), "blocks"] : []
    ].join(" "), t.matchedBlocks && t.matchedBlocks.length > 0) {
      let n = document.createElement("ul");
      t.matchedBlocks.forEach((r) => {
        if (r.count === void 0) return;
        let a = document.createElement("li");
        a.innerHTML = [
          `<button data-input-for="blocks_filter" data-input-text="${r.name}" title="Filter with this block name">\u25B2</button>`,
          `${r.count.toString()}x`,
          r.highlightedLabel,
          `<small>${r.highlightedName}</small>`
        ].join(" "), n.appendChild(a);
      }), e.appendChild(n);
    }
    return e;
  }
  function J(t) {
    return t.reduce((e, n) => e + (n.count ?? 0), 0);
  }
  var L = class {
    worker;
    listeners = [];
    constructor(e) {
      this.worker = e, this.worker.addEventListener("message", (n) => {
        for (let r of this.listeners)
          r(n.data)?.catch(l);
      });
    }
    set prefabs(e) {
      this.worker.postMessage({ all: e });
    }
    set tierRange(e) {
      this.worker.postMessage({ difficulty: e });
    }
    set prefabFilter(e) {
      this.worker.postMessage({ prefabFilterRegexp: e });
    }
    set blockFilter(e) {
      this.worker.postMessage({ blockFilterRegexp: e });
    }
    set language(e) {
      this.worker.postMessage({ language: e });
    }
    refresh() {
      this.worker.postMessage({});
    }
  }, X = /^(aaa_|AAA_|spacercise_|terrain_smoothing_bug)/, T = class {
    displayDevPrefab = !1;
    updateListener = [];
    constructor(e) {
      this.displayDevPrefab = e.devPrefabs.checked, e.devPrefabs.addEventListener("input", () => {
        this.displayDevPrefab = e.devPrefabs.checked, this.updateListener.forEach((n) => {
          n();
        });
      });
    }
    filter() {
      return (e) => this.displayDevPrefab ? !0 : !X.test(e.name);
    }
    addUpdateListener(e) {
      this.updateListener.push(e);
    }
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", U) : U();
})();
//# sourceMappingURL=prefabs.js.map
