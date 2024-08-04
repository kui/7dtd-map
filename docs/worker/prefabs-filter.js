"use strict";
(() => {
  // src/lib/utils.ts
  async function b(n) {
    return new Promise((e) => setTimeout(e, n));
  }
  function x(n) {
    console.error(n);
  }
  async function c(n) {
    let e = await fetch(n);
    if (!e.ok) throw Error(`Failed to fetch ${n}: ${e.statusText}`);
    return await e.json();
  }

  // src/lib/throttled-invoker.ts
  function k(n, e = 100) {
    let t = [], r = 0;
    return () => {
      switch (t.length) {
        case 0: {
          let i = (async () => {
            let s = Date.now();
            s < r + e && await b(r + e - s), r = Date.now();
            try {
              await n();
            } finally {
              t.shift();
            }
          })();
          return t.push(i), i;
        }
        case 1: {
          let i = t[0], s = (async () => {
            await i, await b(e), r = Date.now();
            try {
              await n();
            } finally {
              t.shift();
            }
          })();
          return t.push(s), s;
        }
        case 2:
          return t[1];
        default:
          throw Error(`Unexpected state: promiceses=${t.length.toString()}`);
      }
    };
  }

  // src/lib/labels.ts
  var v = {
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
  }, E = ["blocks", "prefabs", "shapes"], l = class n {
    static DEFAULT_LANGUAGE = "english";
    #r;
    #t;
    #n;
    #e;
    constructor(e, t) {
      this.#r = e, this.#t = M(t), this.#n = new Map(E.map((r) => [r, this.#a(n.DEFAULT_LANGUAGE, r)])), this.#e = this.#i();
    }
    get(e) {
      let t = this.#e.get(e);
      if (!t) throw new Error(`No labels for ${this.#t}/${e}`);
      return t;
    }
    set language(e) {
      e !== this.#t && (console.log("LabelHolder set language: %s -> %s", this.#t, e), this.#t = e, this.#e = this.#i());
    }
    #i() {
      return new Map(E.map((e) => [e, this.#s(e)]));
    }
    async #s(e) {
      let t = this.#n.get(e);
      if (!t) throw new Error(`No fallback for ${this.#t}/${e}`);
      return new w(await this.#a(this.#t, e), await t);
    }
    async #a(e, t) {
      return new Map(Object.entries(await c(`${this.#r}/${e}/${t}.json`)));
    }
  }, w = class {
    #r;
    #t;
    constructor(e, t) {
      this.#r = e, this.#t = t;
    }
    get(e) {
      return this.#r.get(e) ?? this.#t.get(e);
    }
  };
  function M(n) {
    for (let e of n)
      for (let [t, r] of Object.entries(v))
        if (e.startsWith(t)) return r;
    return l.DEFAULT_LANGUAGE;
  }

  // src/lib/cache-holder.ts
  var u = Symbol("NO_VALUE"), f = class {
    #r;
    #t;
    #n;
    #e = u;
    #i = null;
    #s = null;
    #a = Date.now();
    constructor(e, t, r = 1e4) {
      this.#r = e, this.#t = t, this.#n = r;
    }
    /**
     * Get the value from the cache.
     *
     * If the value is not in the cache, it is fetched and stored.
     */
    async get() {
      try {
        return this.#e === u ? this.#o() : this.#e;
      } finally {
        this.#h();
      }
    }
    async #o() {
      if (this.#i) return this.#i;
      this.#i = this.#l();
      try {
        this.#e = await this.#i;
      } finally {
        this.#i = null;
      }
      return this.#e;
    }
    async #l() {
      let e, t;
      do
        e = Date.now(), t = await this.#r();
      while (e < this.#a);
      return t;
    }
    /**
     * Invalidate the cache.
     */
    invalidate() {
      this.#e !== u && (this.#t(this.#e), this.#e = u), this.#s && clearTimeout(this.#s), this.#s = null, this.#a = Date.now();
    }
    #h() {
      this.#s && clearTimeout(this.#s), this.#s = setTimeout(() => {
        this.invalidate();
      }, this.#n);
    }
  };

  // src/lib/prefabs.ts
  var m = class {
    #r;
    #t;
    #n = [];
    #e = "";
    #i = [];
    all = [];
    markCoords = null;
    difficulty = { start: 0, end: 5 };
    prefabFilterRegexp = "";
    blockFilterRegexp = "";
    constructor(e, t, r) {
      this.#r = new l(e, t), this.#t = new f(r, () => {
      });
    }
    set language(e) {
      this.#r.language = e;
    }
    update = k(() => this.updateImmediately());
    async updateImmediately() {
      await this.#a(), this.#s(), this.#u(), this.#f();
      let e = { status: this.#e, prefabs: this.#n };
      this.#i.forEach((t) => {
        t(e);
      });
    }
    #s() {
      this.prefabFilterRegexp.length === 0 && this.blockFilterRegexp.length === 0 && this.difficulty.start === 0 && this.difficulty.end === 5 ? this.#e = `All ${this.all.length.toString()} prefabs` : this.#n.length === 0 ? this.#e = "No prefabs matched" : this.#e = `${this.#n.length.toString()} prefabs matched`;
    }
    addUpdateListener(e) {
      this.#i.push(e);
    }
    async #a() {
      let e = this.#o(this.all);
      e = await this.#l(e), e = await this.#h(e), this.#n = e;
    }
    #o(e) {
      return e.filter((t) => {
        let r = t.difficulty ?? 0;
        return r >= this.difficulty.start && r <= this.difficulty.end;
      });
    }
    async #l(e) {
      let t = await this.#r.get("prefabs"), r = new RegExp(this.prefabFilterRegexp, "i");
      return e.flatMap((i) => {
        let s = t.get(i.name);
        if (this.prefabFilterRegexp.length === 0)
          return {
            ...i,
            highlightedName: i.name,
            highlightedLabel: s ?? "-"
          };
        let o = g(i.name, r), a = s && g(s, r);
        return o != null || a != null ? {
          ...i,
          highlightedName: o ?? i.name,
          highlightedLabel: a ?? s ?? "-"
        } : [];
      });
    }
    async #h(e) {
      if (this.blockFilterRegexp.length === 0)
        return e;
      let t = await this.#c(e);
      return e.flatMap((r) => {
        let i = t[r.name];
        return i ? { ...r, matchedBlocks: i } : [];
      });
    }
    async #c(e) {
      let t = await this.#r.get("blocks"), r = await this.#r.get("shapes"), i = new Set(e.map((a) => a.name)), s = {}, o = new RegExp(this.blockFilterRegexp, "i");
      for (let [a, T] of Object.entries(await this.#t.get())) {
        let P = g(a, o), d = t.get(a) ?? r.get(a) ?? "-", y = d && g(d, o);
        if (!(P == null && y == null))
          for (let [p, N] of Object.entries(T))
            i.has(p) && (s[p] = (s[p] ?? []).concat({
              name: a,
              highlightedName: P ?? a,
              highlightedLabel: y ?? d,
              count: N
            }));
      }
      return s;
    }
    #u() {
      if (this.markCoords) {
        let { markCoords: e } = this;
        this.#n.forEach((t) => t.dist = S(t, e));
      } else
        this.#n.forEach((e) => e.dist = null);
    }
    #f() {
      this.all.length === 0 ? this.#e = "No prefabs loaded" : this.#n.length === 0 ? this.#e += ". Please relax the filter conditions" : this.markCoords ? (this.#e += ", order by distances from the flag", this.#n.sort(A)) : this.blockFilterRegexp.length > 0 ? (this.#e += ", order by counts of matched blocks", this.#n.sort(C)) : this.#n.sort(h);
    }
  };
  function h(n, e) {
    return n.name > e.name ? 1 : n.name < e.name ? -1 : 0;
  }
  function C(n, e) {
    if (!n.matchedBlocks || !e.matchedBlocks) return h(n, e);
    let t = n.matchedBlocks.reduce((i, s) => i + (s.count ?? 0), 0), r = e.matchedBlocks.reduce((i, s) => i + (s.count ?? 0), 0);
    return t < r ? 1 : t > r ? -1 : h(n, e);
  }
  function A(n, e) {
    return !n.dist || !e.dist ? h(n, e) : n.dist > e.dist ? 1 : n.dist < e.dist ? -1 : h(n, e);
  }
  function S(n, e) {
    return Math.round(Math.sqrt((n.x - e.x) ** 2 + (n.z - e.z) ** 2));
  }
  function g(n, e) {
    let t = !1, r = n.replace(e, (i) => (t = i.length > 0, `<mark>${i}</mark>`));
    return t ? r : null;
  }

  // src/worker/prefabs-filter.ts
  var L = new m(
    "../labels",
    navigator.languages,
    async () => U(await c("../prefab-block-counts.json"))
  );
  onmessage = ({ data: n }) => {
    console.log("Prefab-filter received message: ", n), Object.assign(L, n).update().catch(x);
  };
  L.addUpdateListener((n) => {
    console.log("Prefab-filter send message: ", n), postMessage(n);
  });
  function U(n) {
    let e = {};
    for (let [t, r] of Object.entries(n))
      for (let [i, s] of Object.entries(r))
        e[i] = Object.assign(e[i] ?? {}, { [t]: s });
    return e;
  }
})();
//# sourceMappingURL=prefabs-filter.js.map
