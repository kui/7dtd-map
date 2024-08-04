"use strict";
(() => {
  // src/lib/ui/copy-button.ts
  function Bo() {
    for (let i of Array.from(document.querySelectorAll("[data-copy-for]"))) {
      if (!(i instanceof HTMLButtonElement)) continue;
      let e = i.dataset.copyFor;
      if (!e) continue;
      let t = document.getElementById(e);
      t && (i.addEventListener("click", () => {
        Yc(t, i);
      }), i.addEventListener("mouseover", () => {
        pr(t);
      }), i.addEventListener(
        "mousemove",
        () => {
          pr(t);
        },
        { passive: !0 }
      ), i.addEventListener("mouseout", () => {
        Zc();
      }));
    }
  }
  var Xc = "Copied!", qc = "\u26A0Failure";
  function Yc(i, e) {
    pr(i);
    let t = document.execCommand("copy");
    t ? (console.log("Copy Success", i), e.dataset.message = e.dataset.successMessage ?? Xc) : (console.log("Copy Failure", i), e.dataset.message = e.dataset.failureMessage ?? qc), console.log(t);
  }
  function pr(i) {
    let e = getSelection();
    e?.removeAllRanges();
    let t = document.createRange();
    t.selectNodeContents(i), e?.addRange(t);
  }
  function Zc() {
    getSelection()?.removeAllRanges();
  }

  // src/lib/utils.ts
  function Xt(i, e = () => `Unexpected state: ${String(i)}`) {
    if (i == null) throw Error(e());
    return i;
  }
  function Jc(i, e, t = () => `Unexpected type: expected as ${String(e)}, but actual type ${String(i)}`) {
    if (i instanceof e) return i;
    throw Error(t());
  }
  function be(i, e) {
    let t = Xt(i, () => "Unexpected argument: id is null"), n = Xt(document.getElementById(t), () => `Element not found: #${t}`);
    return e ? Jc(n, e) : n;
  }
  function zo(i) {
    return i < 1e3 ? `${i.toString()}m` : `${(i / 1e3).toFixed(2)}km`;
  }
  function Hi() {
    return new Promise((i) => requestAnimationFrame(i));
  }
  async function Vi(i, e, t, n) {
    if (!n || !i) return "E/W: -, N/S: -, Elev: -";
    let s = gr(n, i, e);
    if (s === null) return "E/W: -, N/S: -, Elev: -";
    let r = await t(s) ?? "-";
    return `E/W: ${s.x.toString()}, N/S: ${s.z.toString()}, Elev: ${r.toString()}`;
  }
  function ko(i, e) {
    let t = document.createElement("a");
    t.download = i, t.href = e.toDataURL("image/png"), t.click();
  }
  async function mr(i) {
    return new Promise((e) => setTimeout(e, i));
  }
  function Ho(i) {
    return { type: "game", ...i };
  }
  function Kc(i) {
    return { type: "game", ...i };
  }
  function gr(i, e, t) {
    let n = i.offsetX * e.width / t.width, s = i.offsetY * e.height / t.height;
    if (n < 0 || n >= e.width || s < 0 || s >= e.height)
      return null;
    let r = n - Math.floor(e.width / 2), a = Math.floor(e.height / 2) - s;
    return Kc({ x: Math.round(r), z: Math.round(a) });
  }
  function Gi(i, e) {
    return { type: "threePlane", width: i, height: e };
  }
  function ze(i) {
    console.error(i);
  }
  async function Bn(i) {
    let e = await fetch(i);
    if (!e.ok) throw Error(`Failed to fetch ${i}: ${e.statusText}`);
    return await e.json();
  }
  function Vo(i) {
    return i.substring(i.lastIndexOf("/") + 1);
  }

  // src/lib/ui/preset-button.ts
  function Go() {
    document.body.addEventListener("click", ({ target: i }) => {
      if (i instanceof HTMLButtonElement && i.dataset.inputFor != null) {
        let e = be(i.dataset.inputFor, HTMLInputElement);
        e.value = Xt(i.dataset.inputText ?? i.textContent), e.dispatchEvent(new Event("input", { bubbles: !0 }));
      }
    });
  }

  // src/lib/ui/dialog-buttons.ts
  function Wo() {
    for (let i of document.querySelectorAll("button[data-show-dialog-for]")) {
      i.addEventListener("click", () => {
        let e = i.dataset.showDialogFor;
        if (!e) return;
        let t = document.getElementById(e);
        if (!t) throw Error(`Dialog not found: ${e}`);
        if (!(t instanceof HTMLDialogElement)) throw Error(`Unexpected element: ${e}`);
        t.showModal();
      });
      for (let e of document.querySelectorAll("button[data-close-dialog-for]"))
        e.addEventListener("click", () => {
          let t = e.dataset.closeDialogFor;
          if (t == null) return;
          let n = t === "" ? e.closest("dialog") : document.getElementById(t);
          if (!n) throw Error(`Dialog not found: ${t}`);
          if (!(n instanceof HTMLDialogElement)) throw Error(`Unexpected element: ${t}`);
          n.close("");
        });
    }
  }

  // src/lib/ui/sync-output.ts
  function Xo() {
    for (let i of ["input", "change"])
      window.addEventListener(i, ({ target: e }) => {
        if (!(e instanceof HTMLInputElement) || !(e instanceof HTMLTextAreaElement || !(e instanceof HTMLSelectElement)))
          return;
        let t = document.querySelectorAll(`output[data-sync-for="${e.id}"]`);
        for (let n of t)
          n.value = e.value;
      });
    for (let i of document.querySelectorAll("output[data-sync-for]")) {
      let e = be(i.dataset.syncFor, HTMLInputElement);
      i.value = e.value;
    }
  }

  // src/lib/ui/remember-value.ts
  function qo() {
    for (let i of ["input", "change"])
      window.addEventListener(i, ({ target: e }) => {
        if (!(e instanceof HTMLInputElement) || !(e instanceof HTMLTextAreaElement || !(e instanceof HTMLSelectElement)))
          return;
        let t = e.dataset.remember;
        t && localStorage.setItem(t, e.value);
      });
    for (let i of document.querySelectorAll("input[data-remember]")) {
      let e = i.dataset.remember;
      if (e === void 0) continue;
      let t = localStorage.getItem(e);
      t !== null && (i.value = t);
    }
  }

  // src/lib/ui/min-max-inputs.ts
  function Zo() {
    for (let i of ["input", "change"])
      window.addEventListener(i, ({ target: e }) => {
        e instanceof HTMLInputElement && Yo(e);
      });
    for (let i of [
      ...document.querySelectorAll("input[data-max]"),
      ...document.querySelectorAll("input[data-min]")
    ])
      Yo(i);
  }
  function Yo(i) {
    i.dataset.min && nh(i, i.dataset.min), i.dataset.max && ih(i, i.dataset.max);
  }
  function nh(i, e) {
    let t = document.querySelectorAll(`input[data-max="${e}"]`);
    for (let n of t)
      if (n.valueAsNumber < i.valueAsNumber) {
        let s = n.value;
        n.value = i.value, s !== n.value && $o(n);
      }
  }
  function ih(i, e) {
    let t = document.querySelectorAll(`input[data-min="${e}"]`);
    for (let n of t)
      if (n.valueAsNumber > i.valueAsNumber) {
        let s = n.value;
        n.value = i.value, s !== n.value && $o(n);
      }
  }
  function $o(i) {
    for (let e of ["input", "change"]) i.dispatchEvent(new Event(e, { bubbles: !0 }));
  }

  // src/lib/labels.ts
  var Ko = [
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
  ], rh = {
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
  }, Jo = ["blocks", "prefabs", "shapes"], _r = class i {
    static DEFAULT_LANGUAGE = "english";
    #e;
    #t;
    #i;
    #n;
    constructor(e, t) {
      this.#e = e, this.#t = Wi(t), this.#i = new Map(Jo.map((n) => [n, this.#a(i.DEFAULT_LANGUAGE, n)])), this.#n = this.#s();
    }
    get(e) {
      let t = this.#n.get(e);
      if (!t) throw new Error(`No labels for ${this.#t}/${e}`);
      return t;
    }
    set language(e) {
      e !== this.#t && (console.log("LabelHolder set language: %s -> %s", this.#t, e), this.#t = e, this.#n = this.#s());
    }
    #s() {
      return new Map(Jo.map((e) => [e, this.#r(e)]));
    }
    async #r(e) {
      let t = this.#i.get(e);
      if (!t) throw new Error(`No fallback for ${this.#t}/${e}`);
      return new xr(await this.#a(this.#t, e), await t);
    }
    async #a(e, t) {
      return new Map(Object.entries(await Bn(`${this.#e}/${e}/${t}.json`)));
    }
  }, xr = class {
    #e;
    #t;
    constructor(e, t) {
      this.#e = e, this.#t = t;
    }
    get(e) {
      return this.#e.get(e) ?? this.#t.get(e);
    }
  };
  function Wi(i) {
    for (let e of i)
      for (let [t, n] of Object.entries(rh))
        if (e.startsWith(t)) return n;
    return _r.DEFAULT_LANGUAGE;
  }

  // src/lib/label-handler.ts
  var Xi = class {
    doms;
    listener = [];
    constructor(e, t) {
      this.doms = e, this.buildSelectOptions(t), this.doms.language.addEventListener("change", () => {
        this.listener.forEach((n) => {
          n(this.doms.language.value)?.catch(ze);
        });
      });
    }
    buildSelectOptions(e) {
      let t = new Set(Array.from(this.doms.language.options).map((s) => s.value));
      for (let s of Ko) {
        if (t.has(s))
          continue;
        let r = document.createElement("option");
        r.textContent = s, this.doms.language.appendChild(r);
      }
      let n = Wi(e);
      this.doms.language.value !== n && (this.doms.language.value = Wi(e), requestAnimationFrame(() => this.doms.language.dispatchEvent(new Event("change"))));
    }
    addListener(e) {
      this.listener.push(e);
    }
  };

  // src/lib/cache-holder.ts
  var qi = Symbol("NO_VALUE"), yi = class {
    #e;
    #t;
    #i;
    #n = qi;
    #s = null;
    #r = null;
    #a = Date.now();
    constructor(e, t, n = 1e4) {
      this.#e = e, this.#t = t, this.#i = n;
    }
    /**
     * Get the value from the cache.
     *
     * If the value is not in the cache, it is fetched and stored.
     */
    async get() {
      try {
        return this.#n === qi ? this.#o() : this.#n;
      } finally {
        this.#l();
      }
    }
    async #o() {
      if (this.#s) return this.#s;
      this.#s = this.#h();
      try {
        this.#n = await this.#s;
      } finally {
        this.#s = null;
      }
      return this.#n;
    }
    async #h() {
      let e, t;
      do
        e = Date.now(), t = await this.#e();
      while (e < this.#a);
      return t;
    }
    /**
     * Invalidate the cache.
     */
    invalidate() {
      this.#n !== qi && (this.#t(this.#n), this.#n = qi), this.#r && clearTimeout(this.#r), this.#r = null, this.#a = Date.now();
    }
    #l() {
      this.#r && clearTimeout(this.#r), this.#r = setTimeout(() => {
        this.invalidate();
      }, this.#i);
    }
  };

  // src/lib/storage.ts
  var ah = "workspace";
  async function zn() {
    let i = await navigator.storage.getDirectory();
    return new vr(await i.getDirectoryHandle(ah, { create: !0 }));
  }
  var vr = class {
    #e;
    constructor(e) {
      this.#e = e;
    }
    get name() {
      return this.#e.name;
    }
    async put(e, t) {
      console.debug("put", e);
      let s = await (await this.#e.getFileHandle(e, { create: !0 })).createWritable();
      t instanceof ArrayBuffer || t instanceof Blob ? await s.write(t) : await t.pipeTo(s), await s.close();
    }
    async createWritable(e) {
      return await (await this.#e.getFileHandle(e, { create: !0 })).createWritable();
    }
    async get(e) {
      console.debug("get", e);
      try {
        return await (await this.#e.getFileHandle(e)).getFile();
      } catch (t) {
        if (t instanceof DOMException && t.name === "NotFoundError")
          return null;
        throw t;
      }
    }
    async size(e) {
      return (await (await this.#e.getFileHandle(e)).getFile()).size;
    }
    async remove(e) {
      await this.#e.removeEntry(e);
    }
  };

  // src/index/dtm-handler.ts
  var Yi = class {
    #e;
    #t = new yi(
      () => oh(),
      () => {
      }
    );
    constructor(e, t) {
      this.#e = new yi(
        async () => {
          let n = e();
          return new Promise((s) => {
            n.addEventListener("message", ({ data: r }) => {
              n.terminate(), s(r);
            });
          });
        },
        () => {
        }
      ), t.addListener((n) => {
        n.includes("dtm_block.raw.gz") && this.#e.invalidate(), n.includes("map_info.xml") && this.#t.invalidate();
      });
    }
    async size() {
      return this.#t.get();
    }
    async getElevation(e) {
      let t = await this.#t.get();
      return t ? new Zi(await this.#e.get(), t).getElevation(e) : null;
    }
    async writeZ(e) {
      let t = await this.#t.get();
      t && new Zi(await this.#e.get(), t).writeZ(e);
    }
  }, Zi = class {
    #e;
    #t;
    constructor(e, t) {
      this.#e = e, this.#t = t;
    }
    get size() {
      return this.#t;
    }
    getElevation(e) {
      if (!this.#e) return null;
      let { width: t, height: n } = this.#t;
      if (this.#e.byteLength % t !== 0 || this.#e.byteLength / t !== n)
        return console.warn(
          "Game map size does not match with DTM byte array length:",
          "mapSize=",
          this.#t,
          "data.byteLength=",
          this.#e.byteLength
        ), null;
      let s = Math.floor(t / 2) + e.x, r = Math.floor(n / 2) + e.z;
      return this.#e[s + r * t] ?? null;
    }
    writeZ(e) {
      if (!this.#e) return;
      let t = Xt(e.attributes.position, () => "No position attribute");
      if (t.itemSize !== 3) throw Error("Unexpected item size of position attribute");
      let n = (this.#t.width - 1) / e.parameters.width;
      for (let s = 0; s < t.count; s++) {
        let r = Math.round((t.getX(s) + e.parameters.width / 2) * n), a = Math.round((t.getY(s) + e.parameters.height / 2) * n), o = this.#e[r + a * this.#t.width] / n;
        t.setZ(s, o);
      }
    }
  };
  async function oh() {
    let e = await (await zn()).get("map_info.xml");
    if (!e) return null;
    let n = new DOMParser().parseFromString(await e.text(), "application/xml").querySelector("property[name=HeightMapSize]")?.getAttribute("value");
    if (!n)
      return console.warn("HeightMapSize not found in map_info.xml"), null;
    let [s, r] = n.split(",").map((a) => parseInt(a));
    return !s || isNaN(s) || !r || isNaN(r) ? (console.warn("Invalid HeightMapSize: size=", n, "width=", s, "height=", r), null) : Ho({ width: s, height: r });
  }

  // src/index/prefabs-handler.ts
  var $i = class {
    #e = [];
    #t;
    constructor(e, t, n, s, r) {
      this.#t = { start: e.minTier.valueAsNumber, end: e.maxTier.valueAsNumber }, t.addEventListener("message", (a) => {
        let { prefabs: o, status: l } = a.data;
        e.status.textContent = l, Promise.allSettled(this.#e.map((c) => c(o))).catch(ze);
      }), e.minTier.addEventListener("input", () => {
        let a = e.minTier.valueAsNumber;
        a !== this.#t.start && (this.#t.start = a, t.postMessage({ difficulty: this.#t }));
      }), e.maxTier.addEventListener("input", () => {
        let a = e.maxTier.valueAsNumber;
        a !== this.#t.end && (this.#t.end = a, t.postMessage({ difficulty: this.#t }));
      }), e.prefabFilter.addEventListener("input", () => {
        t.postMessage({ prefabFilterRegexp: e.prefabFilter.value });
      }), e.blockFilter.addEventListener("input", () => {
        t.postMessage({ blockFilterRegexp: e.blockFilter.value });
      }), n.addListener((a) => {
        t.postMessage({ markCoords: a });
      }), s.addListener((a) => {
        t.postMessage({ language: a });
      }), r.addListener(async (a) => {
        a.includes("prefabs.xml") && t.postMessage({ all: await lh() });
      });
    }
    addListener(e) {
      this.#e.push(e);
    }
  };
  async function lh() {
    let e = await (await zn()).get("prefabs.xml");
    return e ? ch(...await Promise.all([e.text(), Bn("../prefab-difficulties.json")])) : [];
  }
  function ch(i, e) {
    let t = new DOMParser().parseFromString(i, "text/xml");
    return Array.from(t.getElementsByTagName("decoration")).flatMap((n) => {
      let s = n.getAttribute("position")?.split(",");
      if (!s || s.length !== 3) return [];
      let [r, , a] = s;
      if (!r || !a) return [];
      let o = n.getAttribute("name");
      return o ? {
        name: o,
        x: parseInt(r),
        z: parseInt(a),
        difficulty: e[o] ?? 0
      } : [];
    });
  }

  // src/lib/delayed-renderer.ts
  var Ki = class {
    _iterator = [][Symbol.iterator]();
    appendee;
    scrollableWrapper;
    itemRenderer;
    scrollCallback = () => {
      this.renderAll().catch(ze);
    };
    constructor(e, t, n) {
      if (!e.contains(t)) throw Error("Wrapper element should contain appendee element");
      t.innerHTML = "", this.appendee = t, this.scrollableWrapper = e, this.itemRenderer = n;
    }
    set iterator(e) {
      "next" in e ? this._iterator = jo(e) : this._iterator = jo(e[Symbol.iterator]()), this.appendee.innerHTML = "", this.scrollableWrapper.removeEventListener("scroll", this.scrollCallback), requestAnimationFrame(() => {
        this.scrollableWrapper.removeEventListener("scroll", this.scrollCallback), this.scrollableWrapper.addEventListener("scroll", this.scrollCallback, { once: !0 }), Qo(this, () => hh(this.scrollableWrapper)).catch(ze);
      });
    }
    async renderAll() {
      await Qo(this, () => !1);
    }
  };
  async function Qo(i, e) {
    do {
      let t = i._iterator.next();
      if (Ji(t)) break;
      let n = new DocumentFragment();
      t.value.forEach((s) => n.appendChild(i.itemRenderer(s))), i.appendee.appendChild(n), await Hi();
    } while (!e());
  }
  function hh(i) {
    return i.clientHeight + 100 < i.scrollHeight;
  }
  function jo(i, e = 10) {
    let t = null, n = {
      next(...s) {
        if (t) return t;
        let r = Array(e);
        for (let a = 0; a < e; a++) {
          let o = i.next(...s);
          Ji(o) ? t = o : r[a] = o.value;
        }
        return {
          done: !1,
          value: r
        };
      }
    };
    return "throw" in i && (n.throw = (s) => {
      let r = i.throw(s);
      return Ji(r) ? r : { done: r.done ?? !1, value: [r.value] };
    }), "return" in i && (n.return = (s) => {
      let r = i.return(s);
      return Ji(r) ? r : { done: r.done ?? !1, value: [r.value] };
    }), n;
  }
  function Ji(i) {
    return !!i.done;
  }

  // src/lib/throttled-invoker.ts
  function el(i, e = 100) {
    let t = [], n = 0;
    return () => {
      switch (t.length) {
        case 0: {
          let s = (async () => {
            let r = Date.now();
            r < n + e && await mr(n + e - r), n = Date.now();
            try {
              await i();
            } finally {
              t.shift();
            }
          })();
          return t.push(s), s;
        }
        case 1: {
          let s = t[0], r = (async () => {
            await s, await mr(e), n = Date.now();
            try {
              await i();
            } finally {
              t.shift();
            }
          })();
          return t.push(r), r;
        }
        case 2:
          return t[1];
        default:
          throw Error(`Unexpected state: promiceses=${t.length.toString()}`);
      }
    };
  }

  // src/index/cursor-coods-handler.ts
  var Qi = class {
    #e;
    #t;
    #i = null;
    constructor(e, t) {
      this.#e = e, this.#t = t, e.canvas.addEventListener(
        "mousemove",
        (n) => {
          this.#i = n, this.#n().catch(ze);
        },
        { passive: !0 }
      ), e.canvas.addEventListener("mouseout", () => {
        this.#i = null, this.#n().catch(ze);
      });
    }
    #n = el(() => this.#s().catch(ze), 100);
    async #s() {
      this.#e.output.textContent = await Vi(
        await this.#t.size(),
        this.#e.canvas,
        (e) => this.#t.getElevation(e),
        this.#i
      );
    }
  };

  // src/index/marker-handler.ts
  var ji = class {
    #e;
    #t;
    #i = [];
    constructor(e, t) {
      this.#e = e, this.#t = t, e.canvas.addEventListener("click", (n) => {
        this.#n(n).catch(ze);
      }), e.resetMarker.addEventListener("click", () => {
        this.#n(null).catch(ze);
      });
    }
    async #n(e) {
      let t = await this.#t.size();
      this.#e.output.textContent = await Vi(t, this.#e.canvas, (s) => this.#t.getElevation(s), e);
      let n = e && t ? gr(e, t, this.#e.canvas) : null;
      await Promise.allSettled(this.#i.map((s) => s(n))).catch(ze);
    }
    addListener(e) {
      this.#i.push(e);
    }
  };

  // lib/map-files.ts
  var uh;
  var Cr = {
    "map_info.xml": {
      name: "map_info.xml",
      process: tl
    },
    "biomes.png": {
      name: "biomes.png",
      process: dh
    },
    "splat3.png": {
      name: "splat3.png",
      process: nl
    },
    "splat3_processed.png": {
      name: "splat3.png",
      process: nl
    },
    "splat4.png": {
      name: "splat4.png",
      process: il
    },
    "splat4_processed.png": {
      name: "splat4.png",
      process: il
    },
    "radiation.png": {
      name: "radiation.png",
      process: fh
    },
    "prefabs.xml": {
      name: "prefabs.xml",
      process: tl
    },
    "dtm.raw": {
      name: "dtm_block.raw.gz",
      process: (i, e) => i.pipeThrough(new Er()).pipeTo(e)
    }
  }, t_ = Object.fromEntries(Object.entries(Cr).map(([i, e]) => [i, e.name]));
  var n_ = new Set(Object.keys(Cr));
  var Mi = new Set(Object.values(Cr).map((i) => i.name));
  function es(i) {
    return Mi.has(i);
  }
  var Mr = {
    "splat3.png": "splat3_processed.png",
    "splat4.png": "splat4_processed.png"
  };
  function al(i, e) {
    return i in Mr && e.includes(Mr[i]);
  }
  function ol(i) {
    return Mr[i];
  }
  function tl(i, e) {
    return i.pipeTo(e);
  }
  function dh(i, e) {
    return i.pipeThrough(new Rr()).pipeTo(e);
  }
  function nl(i, e) {
    return i.pipeThrough(new wr()).pipeTo(e);
  }
  function il(i, e) {
    return i.pipeThrough(new Ar()).pipeTo(e);
  }
  function fh(i, e) {
    return i.pipeThrough(new Tr()).pipeTo(e);
  }
  var sl = { highWaterMark: 1024 * 1024 }, Pr = [sl, sl], Sr = class {
    readable;
    writable;
    constructor(e) {
      let { readable: t, writable: n } = new TransformStream({}, ...Pr);
      this.readable = e.reduce((s, r) => s.pipeThrough(r), t), this.writable = n;
    }
  }, br = class extends TransformStream {
    constructor() {
      let e = 1;
      super(
        {
          transform(t, n) {
            let s = new Uint8Array(
              t.length % 2 === 0 ? t.length / 2 : e === 1 ? (t.length - 1) / 2 : (t.length + 1) / 2
            ), r = e;
            for (; r < t.length; r += 2)
              s[(r - e) / 2] = t[r];
            e = r - t.length, n.enqueue(s);
          }
        },
        ...Pr
      );
    }
  }, Er = class extends Sr {
    constructor() {
      super([new br(), new CompressionStream("gzip")]);
    }
  }, rl = class extends DecompressionStream {
    constructor() {
      super("gzip");
    }
  }, kn = class extends TransformStream {
    constructor(e) {
      let t = new uh({ deflateLevel: 9, deflateStrategy: 0 }), { promise: n, resolve: s, reject: r } = Promise.withResolvers();
      super(
        {
          start(a) {
            t.on("parsed", () => {
              ph(t, e, a).then(s).catch((o) => {
                r(o);
              });
            });
          },
          transform(a) {
            t.write(a);
          },
          flush() {
            return n;
          }
        },
        ...Pr
      );
    }
  };
  async function ph(i, e, t) {
    if (globalThis.OffscreenCanvas) {
      let n = new OffscreenCanvas(i.width, i.height), s = n.getContext("2d"), r = s.createImageData(i.width, i.height);
      e(i.data, r.data), s.putImageData(r, 0, 0);
      let a = await n.convertToBlob({ type: "image/png" });
      for await (let o of a.stream()) t.enqueue(o);
    } else
      return e(i.data, i.data), new Promise((n, s) => {
        i.pack().on("data", (r) => {
          t.enqueue(r);
        }).on("error", s).on("end", n);
      });
  }
  var wr = class extends kn {
    constructor() {
      super((e, t) => {
        for (let n = 0; n < t.length; n += 4)
          e[n] === 0 && e[n + 1] === 0 && e[n + 2] === 0 ? (t[n] = 0, t[n + 1] = 0, t[n + 2] = 0, t[n + 3] = 0) : (t[n] = e[n], t[n + 1] = e[n + 1], t[n + 2] = e[n + 2], t[n + 3] = 255);
      });
    }
  }, Ar = class extends kn {
    constructor() {
      super((e, t) => {
        for (let n = 0; n < e.length; n += 4)
          if (e[n] === 0 && e[n + 1] === 0 && e[n + 2] === 0)
            t[n] = 0, t[n + 1] = 0, t[n + 2] = 0, t[n + 3] = 0;
          else if (e[n + 1] === 255) {
            t[n] = e[n];
            let s = e[n + 1];
            t[n + 1] = e[n + 2], t[n + 2] = s, t[n + 3] = 255;
          } else
            t[n] = e[n], t[n + 1] = e[n + 1], t[n + 2] = e[n + 2], t[n + 3] = 255;
      });
    }
  }, Tr = class extends kn {
    constructor() {
      super((e, t) => {
        for (let n = 0; n < e.length; n += 4)
          e[n] === 0 && e[n + 1] === 0 && e[n + 2] === 0 ? (t[n] = 0, t[n + 1] = 0, t[n + 2] = 0, t[n + 3] = 0) : (t[n] = e[n], t[n + 1] = e[n + 1], t[n + 2] = e[n + 2], t[n + 3] = 255);
      });
    }
  }, Rr = class extends kn {
    constructor() {
      super((e, t) => {
        for (let n = 0; n < e.length; n++)
          t[n] = e[n];
      });
    }
  };

  // src/index/file-handler.ts
  var mh = [
    "biomes.png",
    "splat3.png",
    "splat3_processed.png",
    "splat4.png",
    "splat4_processed.png",
    "radiation.png",
    "dtm.raw"
  ], ts = class {
    #e;
    #t = [];
    #i;
    #n;
    #s = zn();
    constructor(e, t, n, s, r) {
      this.#e = e, this.#i = t, this.#n = n, e.files.addEventListener("change", () => {
        e.files.files && this.#r(Array.from(e.files.files)).catch(ze);
      }), e.clearMap.addEventListener("click", () => {
        this.#c(""), this.#h().catch(ze);
      }), s.addListener(({ files: a }) => this.#a(a)), r.addListener(async ({ mapName: a, mapDir: o }) => {
        this.#c(a), await this.#o(
          Array.from(Mi).map((l) => `${o}/${l}`),
          // Bundled world files are preprocessed. See tools/copy-map-files.ts
          !0
        );
      });
    }
    async initialize() {
      await this.#u(Array.from(Mi));
    }
    addListener(e) {
      this.#t.push(e);
    }
    async #r(e) {
      await this.#l(
        e.flatMap((t) => {
          let n = t.name;
          return Ir(n) ? { name: n, blob: t, alreadyProcessed: !1 } : Lr(n) ? { name: n, blob: t } : Dr(n) ? { name: n, blob: t } : (console.warn("Ignore file: name=", n), []);
        })
      );
    }
    async #a(e) {
      let [t] = e;
      if (!t) return;
      if (e.length === 1 && xh(t)) {
        this.#c(t.name);
        let s = await Promise.all((await vh(t)).flatMap((r) => cl(r) ? [hl(r)] : []));
        await this.#r(s);
        return;
      }
      let n = await Promise.all(e.flatMap((s) => cl(s) ? [hl(s)] : []));
      await this.#r(n);
    }
    async #o(e, t = !1) {
      await this.#l(
        e.flatMap((n) => {
          let s = Vo(n);
          if (Ir(s))
            return { name: s, url: n, alreadyProcessed: t };
          if (Lr(s))
            return { name: s, url: n };
          if (Dr(s)) {
            if (t) throw new Error(`This file must be processed in advance: ${s}`);
            return { name: s, url: n };
          } else
            return console.log("Ignore file: name=", s, "alreadyProcessed=", t), [];
        })
      );
    }
    async #h() {
      await this.#l(Array.from(Mi).map((e) => ({ name: e, remove: !0 })));
    }
    async #l(e) {
      if (this.#i.isLoading())
        throw new Error("Loading is in progress");
      this.#i.add(e.map(({ name: r }) => r));
      let t = await this.#s, n = e.map(({ name: r }) => r), s = [];
      for (let r of e) {
        if (al(r.name, n)) {
          console.log("Skip ", r.name, " because ", ol(r.name), " is already in the list"), this.#i.delete(r.name);
          continue;
        }
        if ("remove" in r)
          console.log("Remove", r.name), s.push(r.name), await t.remove(r.name);
        else if (gh(r) || ll(r) && r.alreadyProcessed)
          if (console.log("Copy", r.name), s.push(r.name), "blob" in r)
            await t.put(r.name, r.blob);
          else {
            let a = await fetch(r.url);
            if (!a.ok) throw new Error(`Failed to fetch ${r.url}: ${a.statusText}`);
            await t.put(r.name, await a.blob());
          }
        else if (_h(r) || ll(r) && !r.alreadyProcessed) {
          console.log("Process", r.name), console.time(`Process ${r.name}`);
          let a = await this.#d(r);
          console.timeEnd(`Process ${r.name}`), console.log("Processed", a.name, "size=", a.size), s.push(a.name);
        } else
          throw new Error(`Unexpected resource: ${r.name}`);
        this.#i.delete(r.name);
      }
      s.length > 0 && await this.#u(s);
    }
    async #d(e) {
      let t = this.#n();
      return new Promise((n, s) => {
        t.onmessage = ({ data: r }) => {
          t.terminate(), "error" in r ? s(new Error(r.error)) : n(r);
        }, t.postMessage(e);
      });
    }
    async #u(e) {
      await Promise.allSettled(this.#t.map((t) => t(e)));
    }
    #c(e) {
      this.#e.mapName.value = e, this.#e.mapName.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
  };
  function Ur(i) {
    return mh.includes(i);
  }
  function Ir(i) {
    return es(i) && Ur(i);
  }
  function Lr(i) {
    return es(i) && !Ur(i);
  }
  function Dr(i) {
    return !es(i) && Ur(i);
  }
  function ll(i) {
    return Ir(i.name);
  }
  function gh(i) {
    return Lr(i.name);
  }
  function _h(i) {
    return Dr(i.name);
  }
  function cl(i) {
    return i.isFile;
  }
  function xh(i) {
    return i.isDirectory;
  }
  function hl(i) {
    return new Promise((e, t) => {
      i.file(e, t);
    });
  }
  function vh(i) {
    return new Promise((e, t) => {
      i.createReader().readEntries(e, t);
    });
  }

  // src/index/map-canvas-handler.ts
  var yh = ["biomes.png", "splat3.png", "splat4.png", "radiation.png"], ns = class {
    #e = [];
    constructor(e, t, n, s, r) {
      let a = e.canvas.transferControlToOffscreen();
      t.postMessage(
        {
          canvas: a,
          biomesAlpha: e.biomesAlpha.valueAsNumber,
          splat3Alpha: e.splat3Alpha.valueAsNumber,
          splat4Alpha: e.splat4Alpha.valueAsNumber,
          radAlpha: e.radAlpha.valueAsNumber,
          brightness: `${e.brightness.valueAsNumber.toString()}%`,
          signSize: e.signSize.valueAsNumber,
          signAlpha: e.signAlpha.valueAsNumber,
          scale: e.scale.valueAsNumber
        },
        [a]
      ), t.addEventListener("message", (o) => {
        let { mapSize: l } = o.data;
        Promise.allSettled(this.#e.map((c) => c(l))).catch(ze);
      }), e.biomesAlpha.addEventListener("input", () => {
        t.postMessage({ biomesAlpha: e.biomesAlpha.valueAsNumber });
      }), e.splat3Alpha.addEventListener("input", () => {
        t.postMessage({ splat3Alpha: e.splat3Alpha.valueAsNumber });
      }), e.splat4Alpha.addEventListener("input", () => {
        t.postMessage({ splat4Alpha: e.splat4Alpha.valueAsNumber });
      }), e.radAlpha.addEventListener("input", () => {
        t.postMessage({ radAlpha: e.radAlpha.valueAsNumber });
      }), e.signSize.addEventListener("input", () => {
        t.postMessage({ signSize: e.signSize.valueAsNumber });
      }), e.signAlpha.addEventListener("input", () => {
        t.postMessage({ signAlpha: e.signAlpha.valueAsNumber });
      }), e.brightness.addEventListener("input", () => {
        t.postMessage({ brightness: `${e.brightness.valueAsNumber.toString()}%` });
      }), e.scale.addEventListener("input", () => {
        t.postMessage({ scale: e.scale.valueAsNumber });
      }), n.addListener((o) => {
        t.postMessage({ prefabs: o });
      }), s.addListener((o) => {
        t.postMessage({ markerCoords: o });
      }), r.addListener((o) => {
        let l = [];
        for (let c of o)
          yh.includes(c) && l.push(c);
        t.postMessage({ invalidate: l });
      });
    }
    addUpdateListener(e) {
      this.#e.push(e);
    }
  };

  // src/lib/events.ts
  var Hn = class {
    #e = [];
    addListener(e) {
      this.#e.push(e);
    }
    async emit(e) {
      await Promise.allSettled(this.#e.map((t) => t(e)));
    }
    emitNoAwait(e) {
      this.emit(e).catch(ze);
    }
  };

  // src/index/dnd-handler.ts
  var is = class extends Hn {
    constructor(e) {
      super(), e.dragovered.addEventListener("dragenter", (t) => {
        t.preventDefault(), e.overlay.showPopover();
      }), e.dragovered.addEventListener("dragover", (t) => {
        t.preventDefault(), t.dataTransfer && (t.dataTransfer.dropEffect = "copy");
      }), document.body.addEventListener("dragleave", (t) => {
        t.target !== e.overlay && // Sometime "dragleave" event from the overlay is not fired when the mouse cursor is moved out quickly from the browser window frame.
        // This condition is a workaround for that issue. Mouse cursor position are (0, 0) when it is out of the window frame.
        t.clientX !== 0 && t.clientY !== 0 || (t.preventDefault(), e.overlay.hidePopover());
      }), e.dragovered.addEventListener("drop", (t) => {
        t.preventDefault(), e.overlay.hidePopover(), t.dataTransfer?.types.includes("Files") && this.emitNoAwait({
          type: "drop",
          files: Array.from(t.dataTransfer.items).flatMap((n) => n.webkitGetAsEntry() ?? [])
        });
      });
    }
  };

  // src/index/loading-handler.ts
  var dl = ["\uFF5C", "\uFF0F", "\u2015", "\uFF3C"], Mh = 1e3, ss = class {
    #e;
    #t = [];
    #i = /* @__PURE__ */ new Set();
    constructor(e) {
      this.#e = e;
    }
    add(e) {
      this.#t = this.#t.concat(e), this.startAnimation().catch(ze);
    }
    delete(e) {
      this.#t = this.#t.filter((t) => t !== e);
    }
    isLoading() {
      return this.#t.length !== 0;
    }
    #n() {
      let e = this.#e.disableTargets();
      for (let t of e)
        t.disabled = !0, this.#i.add(t);
    }
    #s() {
      for (let e of this.#i)
        e.disabled = !1, this.#i.delete(e);
    }
    async startAnimation() {
      for (this.#n(); this.#t.length !== 0; )
        this.#e.indicator.textContent = `${this.bar()} Loading: ${this.#t.join(", ")}`, await Hi();
      this.#e.indicator.textContent = "", this.#s();
    }
    bar() {
      return dl[Math.floor(Date.now() / Mh) % dl.length];
    }
  };

  // node_modules/three/build/three.module.js
  var vo = "167";
  var Sh = 0, fl = 1, bh = 2;
  var fc = 1, Eh = 2, Kt = 3, mn = 0, vt = 1, Qt = 2, fn = 0, li = 1, pl = 2, ml = 3, gl = 4, wh = 5, Tn = 100, Ah = 101, Th = 102, Rh = 103, Ch = 104, Ph = 200, Ih = 201, Lh = 202, Dh = 203, ha = 204, ua = 205, Uh = 206, Nh = 207, Fh = 208, Oh = 209, Bh = 210, zh = 211, kh = 212, Hh = 213, Vh = 214, Gh = 0, Wh = 1, Xh = 2, Ds = 3, qh = 4, Yh = 5, Zh = 6, $h = 7, yo = 0, Jh = 1, Kh = 2, pn = 0, Qh = 1, jh = 2, eu = 3, tu = 4, nu = 5, iu = 6, su = 7;
  var pc = 300, di = 301, fi = 302, da = 303, fa = 304, sr = 306, pa = 1e3, Cn = 1001, ma = 1002, Pt = 1003, ru = 1004;
  var rs = 1005;
  var Ot = 1006, Nr = 1007;
  var Pn = 1008;
  var nn = 1009, mc = 1010, gc = 1011, Ii = 1012, Mo = 1013, In = 1014, jt = 1015, Oi = 1016, So = 1017, bo = 1018, pi = 1020, _c = 35902, xc = 1021, vc = 1022, Bt = 1023, yc = 1024, Mc = 1025, ci = 1026, mi = 1027, Sc = 1028, Eo = 1029, bc = 1030, wo = 1031;
  var Ao = 1033, Rs = 33776, Cs = 33777, Ps = 33778, Is = 33779, ga = 35840, _a = 35841, xa = 35842, va = 35843, ya = 36196, Ma = 37492, Sa = 37496, ba = 37808, Ea = 37809, wa = 37810, Aa = 37811, Ta = 37812, Ra = 37813, Ca = 37814, Pa = 37815, Ia = 37816, La = 37817, Da = 37818, Ua = 37819, Na = 37820, Fa = 37821, Ls = 36492, Oa = 36494, Ba = 36495, Ec = 36283, za = 36284, ka = 36285, Ha = 36286;
  var Us = 2300, Va = 2301, Fr = 2302, _l = 2400, xl = 2401, vl = 2402;
  var au = 3200, ou = 3201;
  var wc = 0, lu = 1, dn = "", Ct = "srgb", xn = "srgb-linear", To = "display-p3", rr = "display-p3-linear", Ns = "linear", $e = "srgb", Fs = "rec709", Os = "p3";
  var Vn = 7680;
  var yl = 519, cu = 512, hu = 513, uu = 514, Ac = 515, du = 516, fu = 517, pu = 518, mu = 519, Ml = 35044;
  var Sl = "300 es", en = 2e3, Bs = 2001, gn = class {
    addEventListener(e, t) {
      this._listeners === void 0 && (this._listeners = {});
      let n = this._listeners;
      n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
    }
    hasEventListener(e, t) {
      if (this._listeners === void 0) return !1;
      let n = this._listeners;
      return n[e] !== void 0 && n[e].indexOf(t) !== -1;
    }
    removeEventListener(e, t) {
      if (this._listeners === void 0) return;
      let s = this._listeners[e];
      if (s !== void 0) {
        let r = s.indexOf(t);
        r !== -1 && s.splice(r, 1);
      }
    }
    dispatchEvent(e) {
      if (this._listeners === void 0) return;
      let n = this._listeners[e.type];
      if (n !== void 0) {
        e.target = this;
        let s = n.slice(0);
        for (let r = 0, a = s.length; r < a; r++)
          s[r].call(this, e);
        e.target = null;
      }
    }
  }, ft = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
  var Or = Math.PI / 180, Ga = 180 / Math.PI;
  function Bi() {
    let i = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
    return (ft[i & 255] + ft[i >> 8 & 255] + ft[i >> 16 & 255] + ft[i >> 24 & 255] + "-" + ft[e & 255] + ft[e >> 8 & 255] + "-" + ft[e >> 16 & 15 | 64] + ft[e >> 24 & 255] + "-" + ft[t & 63 | 128] + ft[t >> 8 & 255] + "-" + ft[t >> 16 & 255] + ft[t >> 24 & 255] + ft[n & 255] + ft[n >> 8 & 255] + ft[n >> 16 & 255] + ft[n >> 24 & 255]).toLowerCase();
  }
  function xt(i, e, t) {
    return Math.max(e, Math.min(t, i));
  }
  function gu(i, e) {
    return (i % e + e) % e;
  }
  function Br(i, e, t) {
    return (1 - t) * i + t * e;
  }
  function Si(i, e) {
    switch (e.constructor) {
      case Float32Array:
        return i;
      case Uint32Array:
        return i / 4294967295;
      case Uint16Array:
        return i / 65535;
      case Uint8Array:
        return i / 255;
      case Int32Array:
        return Math.max(i / 2147483647, -1);
      case Int16Array:
        return Math.max(i / 32767, -1);
      case Int8Array:
        return Math.max(i / 127, -1);
      default:
        throw new Error("Invalid component type.");
    }
  }
  function _t(i, e) {
    switch (e.constructor) {
      case Float32Array:
        return i;
      case Uint32Array:
        return Math.round(i * 4294967295);
      case Uint16Array:
        return Math.round(i * 65535);
      case Uint8Array:
        return Math.round(i * 255);
      case Int32Array:
        return Math.round(i * 2147483647);
      case Int16Array:
        return Math.round(i * 32767);
      case Int8Array:
        return Math.round(i * 127);
      default:
        throw new Error("Invalid component type.");
    }
  }
  var ke = class i {
    constructor(e = 0, t = 0) {
      i.prototype.isVector2 = !0, this.x = e, this.y = t;
    }
    get width() {
      return this.x;
    }
    set width(e) {
      this.x = e;
    }
    get height() {
      return this.y;
    }
    set height(e) {
      this.y = e;
    }
    set(e, t) {
      return this.x = e, this.y = t, this;
    }
    setScalar(e) {
      return this.x = e, this.y = e, this;
    }
    setX(e) {
      return this.x = e, this;
    }
    setY(e) {
      return this.y = e, this;
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        default:
          throw new Error("index is out of range: " + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("index is out of range: " + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y);
    }
    copy(e) {
      return this.x = e.x, this.y = e.y, this;
    }
    add(e) {
      return this.x += e.x, this.y += e.y, this;
    }
    addScalar(e) {
      return this.x += e, this.y += e, this;
    }
    addVectors(e, t) {
      return this.x = e.x + t.x, this.y = e.y + t.y, this;
    }
    addScaledVector(e, t) {
      return this.x += e.x * t, this.y += e.y * t, this;
    }
    sub(e) {
      return this.x -= e.x, this.y -= e.y, this;
    }
    subScalar(e) {
      return this.x -= e, this.y -= e, this;
    }
    subVectors(e, t) {
      return this.x = e.x - t.x, this.y = e.y - t.y, this;
    }
    multiply(e) {
      return this.x *= e.x, this.y *= e.y, this;
    }
    multiplyScalar(e) {
      return this.x *= e, this.y *= e, this;
    }
    divide(e) {
      return this.x /= e.x, this.y /= e.y, this;
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    applyMatrix3(e) {
      let t = this.x, n = this.y, s = e.elements;
      return this.x = s[0] * t + s[3] * n + s[6], this.y = s[1] * t + s[4] * n + s[7], this;
    }
    min(e) {
      return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
    }
    max(e) {
      return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
    }
    clamp(e, t) {
      return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this;
    }
    clampScalar(e, t) {
      return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this;
    }
    clampLength(e, t) {
      let n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
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
    dot(e) {
      return this.x * e.x + this.y * e.y;
    }
    cross(e) {
      return this.x * e.y - this.y * e.x;
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
    angleTo(e) {
      let t = Math.sqrt(this.lengthSq() * e.lengthSq());
      if (t === 0) return Math.PI / 2;
      let n = this.dot(e) / t;
      return Math.acos(xt(n, -1, 1));
    }
    distanceTo(e) {
      return Math.sqrt(this.distanceToSquared(e));
    }
    distanceToSquared(e) {
      let t = this.x - e.x, n = this.y - e.y;
      return t * t + n * n;
    }
    manhattanDistanceTo(e) {
      return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
    }
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
    }
    lerpVectors(e, t, n) {
      return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this;
    }
    equals(e) {
      return e.x === this.x && e.y === this.y;
    }
    fromArray(e, t = 0) {
      return this.x = e[t], this.y = e[t + 1], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this.x, e[t + 1] = this.y, e;
    }
    fromBufferAttribute(e, t) {
      return this.x = e.getX(t), this.y = e.getY(t), this;
    }
    rotateAround(e, t) {
      let n = Math.cos(t), s = Math.sin(t), r = this.x - e.x, a = this.y - e.y;
      return this.x = r * n - a * s + e.x, this.y = r * s + a * n + e.y, this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y;
    }
  }, Ie = class i {
    constructor(e, t, n, s, r, a, o, l, c) {
      i.prototype.isMatrix3 = !0, this.elements = [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ], e !== void 0 && this.set(e, t, n, s, r, a, o, l, c);
    }
    set(e, t, n, s, r, a, o, l, c) {
      let h = this.elements;
      return h[0] = e, h[1] = s, h[2] = o, h[3] = t, h[4] = r, h[5] = l, h[6] = n, h[7] = a, h[8] = c, this;
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
    copy(e) {
      let t = this.elements, n = e.elements;
      return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this;
    }
    extractBasis(e, t, n) {
      return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
    }
    setFromMatrix4(e) {
      let t = e.elements;
      return this.set(
        t[0],
        t[4],
        t[8],
        t[1],
        t[5],
        t[9],
        t[2],
        t[6],
        t[10]
      ), this;
    }
    multiply(e) {
      return this.multiplyMatrices(this, e);
    }
    premultiply(e) {
      return this.multiplyMatrices(e, this);
    }
    multiplyMatrices(e, t) {
      let n = e.elements, s = t.elements, r = this.elements, a = n[0], o = n[3], l = n[6], c = n[1], h = n[4], f = n[7], d = n[2], m = n[5], _ = n[8], y = s[0], p = s[3], u = s[6], w = s[1], S = s[4], E = s[7], O = s[2], T = s[5], R = s[8];
      return r[0] = a * y + o * w + l * O, r[3] = a * p + o * S + l * T, r[6] = a * u + o * E + l * R, r[1] = c * y + h * w + f * O, r[4] = c * p + h * S + f * T, r[7] = c * u + h * E + f * R, r[2] = d * y + m * w + _ * O, r[5] = d * p + m * S + _ * T, r[8] = d * u + m * E + _ * R, this;
    }
    multiplyScalar(e) {
      let t = this.elements;
      return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
    }
    determinant() {
      let e = this.elements, t = e[0], n = e[1], s = e[2], r = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8];
      return t * a * h - t * o * c - n * r * h + n * o * l + s * r * c - s * a * l;
    }
    invert() {
      let e = this.elements, t = e[0], n = e[1], s = e[2], r = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8], f = h * a - o * c, d = o * l - h * r, m = c * r - a * l, _ = t * f + n * d + s * m;
      if (_ === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      let y = 1 / _;
      return e[0] = f * y, e[1] = (s * c - h * n) * y, e[2] = (o * n - s * a) * y, e[3] = d * y, e[4] = (h * t - s * l) * y, e[5] = (s * r - o * t) * y, e[6] = m * y, e[7] = (n * l - c * t) * y, e[8] = (a * t - n * r) * y, this;
    }
    transpose() {
      let e, t = this.elements;
      return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
    }
    getNormalMatrix(e) {
      return this.setFromMatrix4(e).invert().transpose();
    }
    transposeIntoArray(e) {
      let t = this.elements;
      return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
    }
    setUvTransform(e, t, n, s, r, a, o) {
      let l = Math.cos(r), c = Math.sin(r);
      return this.set(
        n * l,
        n * c,
        -n * (l * a + c * o) + a + e,
        -s * c,
        s * l,
        -s * (-c * a + l * o) + o + t,
        0,
        0,
        1
      ), this;
    }
    //
    scale(e, t) {
      return this.premultiply(zr.makeScale(e, t)), this;
    }
    rotate(e) {
      return this.premultiply(zr.makeRotation(-e)), this;
    }
    translate(e, t) {
      return this.premultiply(zr.makeTranslation(e, t)), this;
    }
    // for 2D Transforms
    makeTranslation(e, t) {
      return e.isVector2 ? this.set(
        1,
        0,
        e.x,
        0,
        1,
        e.y,
        0,
        0,
        1
      ) : this.set(
        1,
        0,
        e,
        0,
        1,
        t,
        0,
        0,
        1
      ), this;
    }
    makeRotation(e) {
      let t = Math.cos(e), n = Math.sin(e);
      return this.set(
        t,
        -n,
        0,
        n,
        t,
        0,
        0,
        0,
        1
      ), this;
    }
    makeScale(e, t) {
      return this.set(
        e,
        0,
        0,
        0,
        t,
        0,
        0,
        0,
        1
      ), this;
    }
    //
    equals(e) {
      let t = this.elements, n = e.elements;
      for (let s = 0; s < 9; s++)
        if (t[s] !== n[s]) return !1;
      return !0;
    }
    fromArray(e, t = 0) {
      for (let n = 0; n < 9; n++)
        this.elements[n] = e[n + t];
      return this;
    }
    toArray(e = [], t = 0) {
      let n = this.elements;
      return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e;
    }
    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  }, zr = /* @__PURE__ */ new Ie();
  function Tc(i) {
    for (let e = i.length - 1; e >= 0; --e)
      if (i[e] >= 65535) return !0;
    return !1;
  }
  function zs(i) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", i);
  }
  function _u() {
    let i = zs("canvas");
    return i.style.display = "block", i;
  }
  var bl = {};
  function Ci(i) {
    i in bl || (bl[i] = !0, console.warn(i));
  }
  function xu(i, e, t) {
    return new Promise(function(n, s) {
      function r() {
        switch (i.clientWaitSync(e, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
          case i.WAIT_FAILED:
            s();
            break;
          case i.TIMEOUT_EXPIRED:
            setTimeout(r, t);
            break;
          default:
            n();
        }
      }
      setTimeout(r, t);
    });
  }
  var El = /* @__PURE__ */ new Ie().set(
    0.8224621,
    0.177538,
    0,
    0.0331941,
    0.9668058,
    0,
    0.0170827,
    0.0723974,
    0.9105199
  ), wl = /* @__PURE__ */ new Ie().set(
    1.2249401,
    -0.2249404,
    0,
    -0.0420569,
    1.0420571,
    0,
    -0.0196376,
    -0.0786361,
    1.0982735
  ), bi = {
    [xn]: {
      transfer: Ns,
      primaries: Fs,
      luminanceCoefficients: [0.2126, 0.7152, 0.0722],
      toReference: (i) => i,
      fromReference: (i) => i
    },
    [Ct]: {
      transfer: $e,
      primaries: Fs,
      luminanceCoefficients: [0.2126, 0.7152, 0.0722],
      toReference: (i) => i.convertSRGBToLinear(),
      fromReference: (i) => i.convertLinearToSRGB()
    },
    [rr]: {
      transfer: Ns,
      primaries: Os,
      luminanceCoefficients: [0.2289, 0.6917, 0.0793],
      toReference: (i) => i.applyMatrix3(wl),
      fromReference: (i) => i.applyMatrix3(El)
    },
    [To]: {
      transfer: $e,
      primaries: Os,
      luminanceCoefficients: [0.2289, 0.6917, 0.0793],
      toReference: (i) => i.convertSRGBToLinear().applyMatrix3(wl),
      fromReference: (i) => i.applyMatrix3(El).convertLinearToSRGB()
    }
  }, vu = /* @__PURE__ */ new Set([xn, rr]), Xe = {
    enabled: !0,
    _workingColorSpace: xn,
    get workingColorSpace() {
      return this._workingColorSpace;
    },
    set workingColorSpace(i) {
      if (!vu.has(i))
        throw new Error(`Unsupported working color space, "${i}".`);
      this._workingColorSpace = i;
    },
    convert: function(i, e, t) {
      if (this.enabled === !1 || e === t || !e || !t)
        return i;
      let n = bi[e].toReference, s = bi[t].fromReference;
      return s(n(i));
    },
    fromWorkingColorSpace: function(i, e) {
      return this.convert(i, this._workingColorSpace, e);
    },
    toWorkingColorSpace: function(i, e) {
      return this.convert(i, e, this._workingColorSpace);
    },
    getPrimaries: function(i) {
      return bi[i].primaries;
    },
    getTransfer: function(i) {
      return i === dn ? Ns : bi[i].transfer;
    },
    getLuminanceCoefficients: function(i, e = this._workingColorSpace) {
      return i.fromArray(bi[e].luminanceCoefficients);
    }
  };
  function hi(i) {
    return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
  }
  function kr(i) {
    return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
  }
  var Gn, Wa = class {
    static getDataURL(e) {
      if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
        return e.src;
      let t;
      if (e instanceof HTMLCanvasElement)
        t = e;
      else {
        Gn === void 0 && (Gn = zs("canvas")), Gn.width = e.width, Gn.height = e.height;
        let n = Gn.getContext("2d");
        e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = Gn;
      }
      return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
    }
    static sRGBToLinear(e) {
      if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
        let t = zs("canvas");
        t.width = e.width, t.height = e.height;
        let n = t.getContext("2d");
        n.drawImage(e, 0, 0, e.width, e.height);
        let s = n.getImageData(0, 0, e.width, e.height), r = s.data;
        for (let a = 0; a < r.length; a++)
          r[a] = hi(r[a] / 255) * 255;
        return n.putImageData(s, 0, 0), t;
      } else if (e.data) {
        let t = e.data.slice(0);
        for (let n = 0; n < t.length; n++)
          t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(hi(t[n] / 255) * 255) : t[n] = hi(t[n]);
        return {
          data: t,
          width: e.width,
          height: e.height
        };
      } else
        return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
    }
  }, yu = 0, ks = class {
    constructor(e = null) {
      this.isSource = !0, Object.defineProperty(this, "id", { value: yu++ }), this.uuid = Bi(), this.data = e, this.dataReady = !0, this.version = 0;
    }
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == "string";
      if (!t && e.images[this.uuid] !== void 0)
        return e.images[this.uuid];
      let n = {
        uuid: this.uuid,
        url: ""
      }, s = this.data;
      if (s !== null) {
        let r;
        if (Array.isArray(s)) {
          r = [];
          for (let a = 0, o = s.length; a < o; a++)
            s[a].isDataTexture ? r.push(Hr(s[a].image)) : r.push(Hr(s[a]));
        } else
          r = Hr(s);
        n.url = r;
      }
      return t || (e.images[this.uuid] = n), n;
    }
  };
  function Hr(i) {
    return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? Wa.getDataURL(i) : i.data ? {
      data: Array.from(i.data),
      width: i.width,
      height: i.height,
      type: i.data.constructor.name
    } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
  }
  var Mu = 0, At = class i extends gn {
    constructor(e = i.DEFAULT_IMAGE, t = i.DEFAULT_MAPPING, n = Cn, s = Cn, r = Ot, a = Pn, o = Bt, l = nn, c = i.DEFAULT_ANISOTROPY, h = dn) {
      super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: Mu++ }), this.uuid = Bi(), this.name = "", this.source = new ks(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = s, this.magFilter = r, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new ke(0, 0), this.repeat = new ke(1, 1), this.center = new ke(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Ie(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
    }
    get image() {
      return this.source.data;
    }
    set image(e = null) {
      this.source.data = e;
    }
    updateMatrix() {
      this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == "string";
      if (!t && e.textures[this.uuid] !== void 0)
        return e.textures[this.uuid];
      let n = {
        metadata: {
          version: 4.6,
          type: "Texture",
          generator: "Texture.toJSON"
        },
        uuid: this.uuid,
        name: this.name,
        image: this.source.toJSON(e).uuid,
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
      return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    transformUv(e) {
      if (this.mapping !== pc) return e;
      if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1)
        switch (this.wrapS) {
          case pa:
            e.x = e.x - Math.floor(e.x);
            break;
          case Cn:
            e.x = e.x < 0 ? 0 : 1;
            break;
          case ma:
            Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
            break;
        }
      if (e.y < 0 || e.y > 1)
        switch (this.wrapT) {
          case pa:
            e.y = e.y - Math.floor(e.y);
            break;
          case Cn:
            e.y = e.y < 0 ? 0 : 1;
            break;
          case ma:
            Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
            break;
        }
      return this.flipY && (e.y = 1 - e.y), e;
    }
    set needsUpdate(e) {
      e === !0 && (this.version++, this.source.needsUpdate = !0);
    }
    set needsPMREMUpdate(e) {
      e === !0 && this.pmremVersion++;
    }
  };
  At.DEFAULT_IMAGE = null;
  At.DEFAULT_MAPPING = pc;
  At.DEFAULT_ANISOTROPY = 1;
  var ot = class i {
    constructor(e = 0, t = 0, n = 0, s = 1) {
      i.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = n, this.w = s;
    }
    get width() {
      return this.z;
    }
    set width(e) {
      this.z = e;
    }
    get height() {
      return this.w;
    }
    set height(e) {
      this.w = e;
    }
    set(e, t, n, s) {
      return this.x = e, this.y = t, this.z = n, this.w = s, this;
    }
    setScalar(e) {
      return this.x = e, this.y = e, this.z = e, this.w = e, this;
    }
    setX(e) {
      return this.x = e, this;
    }
    setY(e) {
      return this.y = e, this;
    }
    setZ(e) {
      return this.z = e, this;
    }
    setW(e) {
      return this.w = e, this;
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        case 2:
          this.z = t;
          break;
        case 3:
          this.w = t;
          break;
        default:
          throw new Error("index is out of range: " + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw new Error("index is out of range: " + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }
    copy(e) {
      return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this;
    }
    add(e) {
      return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
    }
    addScalar(e) {
      return this.x += e, this.y += e, this.z += e, this.w += e, this;
    }
    addVectors(e, t) {
      return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
    }
    addScaledVector(e, t) {
      return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
    }
    sub(e) {
      return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
    }
    subScalar(e) {
      return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
    }
    subVectors(e, t) {
      return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
    }
    multiply(e) {
      return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
    }
    multiplyScalar(e) {
      return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
    }
    applyMatrix4(e) {
      let t = this.x, n = this.y, s = this.z, r = this.w, a = e.elements;
      return this.x = a[0] * t + a[4] * n + a[8] * s + a[12] * r, this.y = a[1] * t + a[5] * n + a[9] * s + a[13] * r, this.z = a[2] * t + a[6] * n + a[10] * s + a[14] * r, this.w = a[3] * t + a[7] * n + a[11] * s + a[15] * r, this;
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    setAxisAngleFromQuaternion(e) {
      this.w = 2 * Math.acos(e.w);
      let t = Math.sqrt(1 - e.w * e.w);
      return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
    }
    setAxisAngleFromRotationMatrix(e) {
      let t, n, s, r, l = e.elements, c = l[0], h = l[4], f = l[8], d = l[1], m = l[5], _ = l[9], y = l[2], p = l[6], u = l[10];
      if (Math.abs(h - d) < 0.01 && Math.abs(f - y) < 0.01 && Math.abs(_ - p) < 0.01) {
        if (Math.abs(h + d) < 0.1 && Math.abs(f + y) < 0.1 && Math.abs(_ + p) < 0.1 && Math.abs(c + m + u - 3) < 0.1)
          return this.set(1, 0, 0, 0), this;
        t = Math.PI;
        let S = (c + 1) / 2, E = (m + 1) / 2, O = (u + 1) / 2, T = (h + d) / 4, R = (f + y) / 4, B = (_ + p) / 4;
        return S > E && S > O ? S < 0.01 ? (n = 0, s = 0.707106781, r = 0.707106781) : (n = Math.sqrt(S), s = T / n, r = R / n) : E > O ? E < 0.01 ? (n = 0.707106781, s = 0, r = 0.707106781) : (s = Math.sqrt(E), n = T / s, r = B / s) : O < 0.01 ? (n = 0.707106781, s = 0.707106781, r = 0) : (r = Math.sqrt(O), n = R / r, s = B / r), this.set(n, s, r, t), this;
      }
      let w = Math.sqrt((p - _) * (p - _) + (f - y) * (f - y) + (d - h) * (d - h));
      return Math.abs(w) < 1e-3 && (w = 1), this.x = (p - _) / w, this.y = (f - y) / w, this.z = (d - h) / w, this.w = Math.acos((c + m + u - 1) / 2), this;
    }
    setFromMatrixPosition(e) {
      let t = e.elements;
      return this.x = t[12], this.y = t[13], this.z = t[14], this.w = t[15], this;
    }
    min(e) {
      return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
    }
    max(e) {
      return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
    }
    clamp(e, t) {
      return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this.w = Math.max(e.w, Math.min(t.w, this.w)), this;
    }
    clampScalar(e, t) {
      return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this.w = Math.max(e, Math.min(t, this.w)), this;
    }
    clampLength(e, t) {
      let n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
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
    dot(e) {
      return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
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
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
    }
    lerpVectors(e, t, n) {
      return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this;
    }
    equals(e) {
      return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
    }
    fromArray(e, t = 0) {
      return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
    }
    fromBufferAttribute(e, t) {
      return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z, yield this.w;
    }
  }, Xa = class extends gn {
    constructor(e = 1, t = 1, n = {}) {
      super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new ot(0, 0, e, t), this.scissorTest = !1, this.viewport = new ot(0, 0, e, t);
      let s = { width: e, height: t, depth: 1 };
      n = Object.assign({
        generateMipmaps: !1,
        internalFormat: null,
        minFilter: Ot,
        depthBuffer: !0,
        stencilBuffer: !1,
        resolveDepthBuffer: !0,
        resolveStencilBuffer: !0,
        depthTexture: null,
        samples: 0,
        count: 1
      }, n);
      let r = new At(s, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
      r.flipY = !1, r.generateMipmaps = n.generateMipmaps, r.internalFormat = n.internalFormat, this.textures = [];
      let a = n.count;
      for (let o = 0; o < a; o++)
        this.textures[o] = r.clone(), this.textures[o].isRenderTargetTexture = !0;
      this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this.depthTexture = n.depthTexture, this.samples = n.samples;
    }
    get texture() {
      return this.textures[0];
    }
    set texture(e) {
      this.textures[0] = e;
    }
    setSize(e, t, n = 1) {
      if (this.width !== e || this.height !== t || this.depth !== n) {
        this.width = e, this.height = t, this.depth = n;
        for (let s = 0, r = this.textures.length; s < r; s++)
          this.textures[s].image.width = e, this.textures[s].image.height = t, this.textures[s].image.depth = n;
        this.dispose();
      }
      this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
      for (let n = 0, s = e.textures.length; n < s; n++)
        this.textures[n] = e.textures[n].clone(), this.textures[n].isRenderTargetTexture = !0;
      let t = Object.assign({}, e.texture.image);
      return this.texture.source = new ks(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }, sn = class extends Xa {
    constructor(e = 1, t = 1, n = {}) {
      super(e, t, n), this.isWebGLRenderTarget = !0;
    }
  }, Hs = class extends At {
    constructor(e = null, t = 1, n = 1, s = 1) {
      super(null), this.isDataArrayTexture = !0, this.image = { data: e, width: t, height: n, depth: s }, this.magFilter = Pt, this.minFilter = Pt, this.wrapR = Cn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
    }
    addLayerUpdate(e) {
      this.layerUpdates.add(e);
    }
    clearLayerUpdates() {
      this.layerUpdates.clear();
    }
  };
  var qa = class extends At {
    constructor(e = null, t = 1, n = 1, s = 1) {
      super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: n, depth: s }, this.magFilter = Pt, this.minFilter = Pt, this.wrapR = Cn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
    }
  };
  var _n = class {
    constructor(e = 0, t = 0, n = 0, s = 1) {
      this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = s;
    }
    static slerpFlat(e, t, n, s, r, a, o) {
      let l = n[s + 0], c = n[s + 1], h = n[s + 2], f = n[s + 3], d = r[a + 0], m = r[a + 1], _ = r[a + 2], y = r[a + 3];
      if (o === 0) {
        e[t + 0] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = f;
        return;
      }
      if (o === 1) {
        e[t + 0] = d, e[t + 1] = m, e[t + 2] = _, e[t + 3] = y;
        return;
      }
      if (f !== y || l !== d || c !== m || h !== _) {
        let p = 1 - o, u = l * d + c * m + h * _ + f * y, w = u >= 0 ? 1 : -1, S = 1 - u * u;
        if (S > Number.EPSILON) {
          let O = Math.sqrt(S), T = Math.atan2(O, u * w);
          p = Math.sin(p * T) / O, o = Math.sin(o * T) / O;
        }
        let E = o * w;
        if (l = l * p + d * E, c = c * p + m * E, h = h * p + _ * E, f = f * p + y * E, p === 1 - o) {
          let O = 1 / Math.sqrt(l * l + c * c + h * h + f * f);
          l *= O, c *= O, h *= O, f *= O;
        }
      }
      e[t] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = f;
    }
    static multiplyQuaternionsFlat(e, t, n, s, r, a) {
      let o = n[s], l = n[s + 1], c = n[s + 2], h = n[s + 3], f = r[a], d = r[a + 1], m = r[a + 2], _ = r[a + 3];
      return e[t] = o * _ + h * f + l * m - c * d, e[t + 1] = l * _ + h * d + c * f - o * m, e[t + 2] = c * _ + h * m + o * d - l * f, e[t + 3] = h * _ - o * f - l * d - c * m, e;
    }
    get x() {
      return this._x;
    }
    set x(e) {
      this._x = e, this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(e) {
      this._y = e, this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(e) {
      this._z = e, this._onChangeCallback();
    }
    get w() {
      return this._w;
    }
    set w(e) {
      this._w = e, this._onChangeCallback();
    }
    set(e, t, n, s) {
      return this._x = e, this._y = t, this._z = n, this._w = s, this._onChangeCallback(), this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }
    copy(e) {
      return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
    }
    setFromEuler(e, t = !0) {
      let n = e._x, s = e._y, r = e._z, a = e._order, o = Math.cos, l = Math.sin, c = o(n / 2), h = o(s / 2), f = o(r / 2), d = l(n / 2), m = l(s / 2), _ = l(r / 2);
      switch (a) {
        case "XYZ":
          this._x = d * h * f + c * m * _, this._y = c * m * f - d * h * _, this._z = c * h * _ + d * m * f, this._w = c * h * f - d * m * _;
          break;
        case "YXZ":
          this._x = d * h * f + c * m * _, this._y = c * m * f - d * h * _, this._z = c * h * _ - d * m * f, this._w = c * h * f + d * m * _;
          break;
        case "ZXY":
          this._x = d * h * f - c * m * _, this._y = c * m * f + d * h * _, this._z = c * h * _ + d * m * f, this._w = c * h * f - d * m * _;
          break;
        case "ZYX":
          this._x = d * h * f - c * m * _, this._y = c * m * f + d * h * _, this._z = c * h * _ - d * m * f, this._w = c * h * f + d * m * _;
          break;
        case "YZX":
          this._x = d * h * f + c * m * _, this._y = c * m * f + d * h * _, this._z = c * h * _ - d * m * f, this._w = c * h * f - d * m * _;
          break;
        case "XZY":
          this._x = d * h * f - c * m * _, this._y = c * m * f - d * h * _, this._z = c * h * _ + d * m * f, this._w = c * h * f + d * m * _;
          break;
        default:
          console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a);
      }
      return t === !0 && this._onChangeCallback(), this;
    }
    setFromAxisAngle(e, t) {
      let n = t / 2, s = Math.sin(n);
      return this._x = e.x * s, this._y = e.y * s, this._z = e.z * s, this._w = Math.cos(n), this._onChangeCallback(), this;
    }
    setFromRotationMatrix(e) {
      let t = e.elements, n = t[0], s = t[4], r = t[8], a = t[1], o = t[5], l = t[9], c = t[2], h = t[6], f = t[10], d = n + o + f;
      if (d > 0) {
        let m = 0.5 / Math.sqrt(d + 1);
        this._w = 0.25 / m, this._x = (h - l) * m, this._y = (r - c) * m, this._z = (a - s) * m;
      } else if (n > o && n > f) {
        let m = 2 * Math.sqrt(1 + n - o - f);
        this._w = (h - l) / m, this._x = 0.25 * m, this._y = (s + a) / m, this._z = (r + c) / m;
      } else if (o > f) {
        let m = 2 * Math.sqrt(1 + o - n - f);
        this._w = (r - c) / m, this._x = (s + a) / m, this._y = 0.25 * m, this._z = (l + h) / m;
      } else {
        let m = 2 * Math.sqrt(1 + f - n - o);
        this._w = (a - s) / m, this._x = (r + c) / m, this._y = (l + h) / m, this._z = 0.25 * m;
      }
      return this._onChangeCallback(), this;
    }
    setFromUnitVectors(e, t) {
      let n = e.dot(t) + 1;
      return n < Number.EPSILON ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
    }
    angleTo(e) {
      return 2 * Math.acos(Math.abs(xt(this.dot(e), -1, 1)));
    }
    rotateTowards(e, t) {
      let n = this.angleTo(e);
      if (n === 0) return this;
      let s = Math.min(1, t / n);
      return this.slerp(e, s), this;
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
    dot(e) {
      return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
    }
    lengthSq() {
      return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }
    length() {
      return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    }
    normalize() {
      let e = this.length();
      return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
    }
    multiply(e) {
      return this.multiplyQuaternions(this, e);
    }
    premultiply(e) {
      return this.multiplyQuaternions(e, this);
    }
    multiplyQuaternions(e, t) {
      let n = e._x, s = e._y, r = e._z, a = e._w, o = t._x, l = t._y, c = t._z, h = t._w;
      return this._x = n * h + a * o + s * c - r * l, this._y = s * h + a * l + r * o - n * c, this._z = r * h + a * c + n * l - s * o, this._w = a * h - n * o - s * l - r * c, this._onChangeCallback(), this;
    }
    slerp(e, t) {
      if (t === 0) return this;
      if (t === 1) return this.copy(e);
      let n = this._x, s = this._y, r = this._z, a = this._w, o = a * e._w + n * e._x + s * e._y + r * e._z;
      if (o < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, o = -o) : this.copy(e), o >= 1)
        return this._w = a, this._x = n, this._y = s, this._z = r, this;
      let l = 1 - o * o;
      if (l <= Number.EPSILON) {
        let m = 1 - t;
        return this._w = m * a + t * this._w, this._x = m * n + t * this._x, this._y = m * s + t * this._y, this._z = m * r + t * this._z, this.normalize(), this;
      }
      let c = Math.sqrt(l), h = Math.atan2(c, o), f = Math.sin((1 - t) * h) / c, d = Math.sin(t * h) / c;
      return this._w = a * f + this._w * d, this._x = n * f + this._x * d, this._y = s * f + this._y * d, this._z = r * f + this._z * d, this._onChangeCallback(), this;
    }
    slerpQuaternions(e, t, n) {
      return this.copy(e).slerp(t, n);
    }
    random() {
      let e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), s = Math.sqrt(1 - n), r = Math.sqrt(n);
      return this.set(
        s * Math.sin(e),
        s * Math.cos(e),
        r * Math.sin(t),
        r * Math.cos(t)
      );
    }
    equals(e) {
      return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
    }
    fromArray(e, t = 0) {
      return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
    }
    fromBufferAttribute(e, t) {
      return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
    }
    toJSON() {
      return this.toArray();
    }
    _onChange(e) {
      return this._onChangeCallback = e, this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x, yield this._y, yield this._z, yield this._w;
    }
  }, D = class i {
    constructor(e = 0, t = 0, n = 0) {
      i.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = n;
    }
    set(e, t, n) {
      return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this;
    }
    setScalar(e) {
      return this.x = e, this.y = e, this.z = e, this;
    }
    setX(e) {
      return this.x = e, this;
    }
    setY(e) {
      return this.y = e, this;
    }
    setZ(e) {
      return this.z = e, this;
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        case 2:
          this.z = t;
          break;
        default:
          throw new Error("index is out of range: " + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }
    copy(e) {
      return this.x = e.x, this.y = e.y, this.z = e.z, this;
    }
    add(e) {
      return this.x += e.x, this.y += e.y, this.z += e.z, this;
    }
    addScalar(e) {
      return this.x += e, this.y += e, this.z += e, this;
    }
    addVectors(e, t) {
      return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
    }
    addScaledVector(e, t) {
      return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
    }
    sub(e) {
      return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
    }
    subScalar(e) {
      return this.x -= e, this.y -= e, this.z -= e, this;
    }
    subVectors(e, t) {
      return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
    }
    multiply(e) {
      return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
    }
    multiplyScalar(e) {
      return this.x *= e, this.y *= e, this.z *= e, this;
    }
    multiplyVectors(e, t) {
      return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
    }
    applyEuler(e) {
      return this.applyQuaternion(Al.setFromEuler(e));
    }
    applyAxisAngle(e, t) {
      return this.applyQuaternion(Al.setFromAxisAngle(e, t));
    }
    applyMatrix3(e) {
      let t = this.x, n = this.y, s = this.z, r = e.elements;
      return this.x = r[0] * t + r[3] * n + r[6] * s, this.y = r[1] * t + r[4] * n + r[7] * s, this.z = r[2] * t + r[5] * n + r[8] * s, this;
    }
    applyNormalMatrix(e) {
      return this.applyMatrix3(e).normalize();
    }
    applyMatrix4(e) {
      let t = this.x, n = this.y, s = this.z, r = e.elements, a = 1 / (r[3] * t + r[7] * n + r[11] * s + r[15]);
      return this.x = (r[0] * t + r[4] * n + r[8] * s + r[12]) * a, this.y = (r[1] * t + r[5] * n + r[9] * s + r[13]) * a, this.z = (r[2] * t + r[6] * n + r[10] * s + r[14]) * a, this;
    }
    applyQuaternion(e) {
      let t = this.x, n = this.y, s = this.z, r = e.x, a = e.y, o = e.z, l = e.w, c = 2 * (a * s - o * n), h = 2 * (o * t - r * s), f = 2 * (r * n - a * t);
      return this.x = t + l * c + a * f - o * h, this.y = n + l * h + o * c - r * f, this.z = s + l * f + r * h - a * c, this;
    }
    project(e) {
      return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
    }
    unproject(e) {
      return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
    }
    transformDirection(e) {
      let t = this.x, n = this.y, s = this.z, r = e.elements;
      return this.x = r[0] * t + r[4] * n + r[8] * s, this.y = r[1] * t + r[5] * n + r[9] * s, this.z = r[2] * t + r[6] * n + r[10] * s, this.normalize();
    }
    divide(e) {
      return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    min(e) {
      return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
    }
    max(e) {
      return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
    }
    clamp(e, t) {
      return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this;
    }
    clampScalar(e, t) {
      return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this;
    }
    clampLength(e, t) {
      let n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
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
    dot(e) {
      return this.x * e.x + this.y * e.y + this.z * e.z;
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
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
    }
    lerpVectors(e, t, n) {
      return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this;
    }
    cross(e) {
      return this.crossVectors(this, e);
    }
    crossVectors(e, t) {
      let n = e.x, s = e.y, r = e.z, a = t.x, o = t.y, l = t.z;
      return this.x = s * l - r * o, this.y = r * a - n * l, this.z = n * o - s * a, this;
    }
    projectOnVector(e) {
      let t = e.lengthSq();
      if (t === 0) return this.set(0, 0, 0);
      let n = e.dot(this) / t;
      return this.copy(e).multiplyScalar(n);
    }
    projectOnPlane(e) {
      return Vr.copy(this).projectOnVector(e), this.sub(Vr);
    }
    reflect(e) {
      return this.sub(Vr.copy(e).multiplyScalar(2 * this.dot(e)));
    }
    angleTo(e) {
      let t = Math.sqrt(this.lengthSq() * e.lengthSq());
      if (t === 0) return Math.PI / 2;
      let n = this.dot(e) / t;
      return Math.acos(xt(n, -1, 1));
    }
    distanceTo(e) {
      return Math.sqrt(this.distanceToSquared(e));
    }
    distanceToSquared(e) {
      let t = this.x - e.x, n = this.y - e.y, s = this.z - e.z;
      return t * t + n * n + s * s;
    }
    manhattanDistanceTo(e) {
      return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
    }
    setFromSpherical(e) {
      return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
    }
    setFromSphericalCoords(e, t, n) {
      let s = Math.sin(t) * e;
      return this.x = s * Math.sin(n), this.y = Math.cos(t) * e, this.z = s * Math.cos(n), this;
    }
    setFromCylindrical(e) {
      return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
    }
    setFromCylindricalCoords(e, t, n) {
      return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this;
    }
    setFromMatrixPosition(e) {
      let t = e.elements;
      return this.x = t[12], this.y = t[13], this.z = t[14], this;
    }
    setFromMatrixScale(e) {
      let t = this.setFromMatrixColumn(e, 0).length(), n = this.setFromMatrixColumn(e, 1).length(), s = this.setFromMatrixColumn(e, 2).length();
      return this.x = t, this.y = n, this.z = s, this;
    }
    setFromMatrixColumn(e, t) {
      return this.fromArray(e.elements, t * 4);
    }
    setFromMatrix3Column(e, t) {
      return this.fromArray(e.elements, t * 3);
    }
    setFromEuler(e) {
      return this.x = e._x, this.y = e._y, this.z = e._z, this;
    }
    setFromColor(e) {
      return this.x = e.r, this.y = e.g, this.z = e.b, this;
    }
    equals(e) {
      return e.x === this.x && e.y === this.y && e.z === this.z;
    }
    fromArray(e, t = 0) {
      return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
    }
    fromBufferAttribute(e, t) {
      return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
    }
    randomDirection() {
      let e = Math.random() * Math.PI * 2, t = Math.random() * 2 - 1, n = Math.sqrt(1 - t * t);
      return this.x = n * Math.cos(e), this.y = t, this.z = n * Math.sin(e), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z;
    }
  }, Vr = /* @__PURE__ */ new D(), Al = /* @__PURE__ */ new _n(), Ln = class {
    constructor(e = new D(1 / 0, 1 / 0, 1 / 0), t = new D(-1 / 0, -1 / 0, -1 / 0)) {
      this.isBox3 = !0, this.min = e, this.max = t;
    }
    set(e, t) {
      return this.min.copy(e), this.max.copy(t), this;
    }
    setFromArray(e) {
      this.makeEmpty();
      for (let t = 0, n = e.length; t < n; t += 3)
        this.expandByPoint(Dt.fromArray(e, t));
      return this;
    }
    setFromBufferAttribute(e) {
      this.makeEmpty();
      for (let t = 0, n = e.count; t < n; t++)
        this.expandByPoint(Dt.fromBufferAttribute(e, t));
      return this;
    }
    setFromPoints(e) {
      this.makeEmpty();
      for (let t = 0, n = e.length; t < n; t++)
        this.expandByPoint(e[t]);
      return this;
    }
    setFromCenterAndSize(e, t) {
      let n = Dt.copy(t).multiplyScalar(0.5);
      return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
    }
    setFromObject(e, t = !1) {
      return this.makeEmpty(), this.expandByObject(e, t);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return this.min.copy(e.min), this.max.copy(e.max), this;
    }
    makeEmpty() {
      return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
    }
    isEmpty() {
      return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    }
    getCenter(e) {
      return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    getSize(e) {
      return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
    }
    expandByPoint(e) {
      return this.min.min(e), this.max.max(e), this;
    }
    expandByVector(e) {
      return this.min.sub(e), this.max.add(e), this;
    }
    expandByScalar(e) {
      return this.min.addScalar(-e), this.max.addScalar(e), this;
    }
    expandByObject(e, t = !1) {
      e.updateWorldMatrix(!1, !1);
      let n = e.geometry;
      if (n !== void 0) {
        let r = n.getAttribute("position");
        if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0)
          for (let a = 0, o = r.count; a < o; a++)
            e.isMesh === !0 ? e.getVertexPosition(a, Dt) : Dt.fromBufferAttribute(r, a), Dt.applyMatrix4(e.matrixWorld), this.expandByPoint(Dt);
        else
          e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), as.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), as.copy(n.boundingBox)), as.applyMatrix4(e.matrixWorld), this.union(as);
      }
      let s = e.children;
      for (let r = 0, a = s.length; r < a; r++)
        this.expandByObject(s[r], t);
      return this;
    }
    containsPoint(e) {
      return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
    }
    containsBox(e) {
      return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
    }
    getParameter(e, t) {
      return t.set(
        (e.x - this.min.x) / (this.max.x - this.min.x),
        (e.y - this.min.y) / (this.max.y - this.min.y),
        (e.z - this.min.z) / (this.max.z - this.min.z)
      );
    }
    intersectsBox(e) {
      return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
    }
    intersectsSphere(e) {
      return this.clampPoint(e.center, Dt), Dt.distanceToSquared(e.center) <= e.radius * e.radius;
    }
    intersectsPlane(e) {
      let t, n;
      return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
    }
    intersectsTriangle(e) {
      if (this.isEmpty())
        return !1;
      this.getCenter(Ei), os.subVectors(this.max, Ei), Wn.subVectors(e.a, Ei), Xn.subVectors(e.b, Ei), qn.subVectors(e.c, Ei), an.subVectors(Xn, Wn), on.subVectors(qn, Xn), yn.subVectors(Wn, qn);
      let t = [
        0,
        -an.z,
        an.y,
        0,
        -on.z,
        on.y,
        0,
        -yn.z,
        yn.y,
        an.z,
        0,
        -an.x,
        on.z,
        0,
        -on.x,
        yn.z,
        0,
        -yn.x,
        -an.y,
        an.x,
        0,
        -on.y,
        on.x,
        0,
        -yn.y,
        yn.x,
        0
      ];
      return !Gr(t, Wn, Xn, qn, os) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Gr(t, Wn, Xn, qn, os)) ? !1 : (ls.crossVectors(an, on), t = [ls.x, ls.y, ls.z], Gr(t, Wn, Xn, qn, os));
    }
    clampPoint(e, t) {
      return t.copy(e).clamp(this.min, this.max);
    }
    distanceToPoint(e) {
      return this.clampPoint(e, Dt).distanceTo(e);
    }
    getBoundingSphere(e) {
      return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Dt).length() * 0.5), e;
    }
    intersect(e) {
      return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
    }
    union(e) {
      return this.min.min(e.min), this.max.max(e.max), this;
    }
    applyMatrix4(e) {
      return this.isEmpty() ? this : (qt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), qt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), qt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), qt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), qt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), qt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), qt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), qt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(qt), this);
    }
    translate(e) {
      return this.min.add(e), this.max.add(e), this;
    }
    equals(e) {
      return e.min.equals(this.min) && e.max.equals(this.max);
    }
  }, qt = [
    /* @__PURE__ */ new D(),
    /* @__PURE__ */ new D(),
    /* @__PURE__ */ new D(),
    /* @__PURE__ */ new D(),
    /* @__PURE__ */ new D(),
    /* @__PURE__ */ new D(),
    /* @__PURE__ */ new D(),
    /* @__PURE__ */ new D()
  ], Dt = /* @__PURE__ */ new D(), as = /* @__PURE__ */ new Ln(), Wn = /* @__PURE__ */ new D(), Xn = /* @__PURE__ */ new D(), qn = /* @__PURE__ */ new D(), an = /* @__PURE__ */ new D(), on = /* @__PURE__ */ new D(), yn = /* @__PURE__ */ new D(), Ei = /* @__PURE__ */ new D(), os = /* @__PURE__ */ new D(), ls = /* @__PURE__ */ new D(), Mn = /* @__PURE__ */ new D();
  function Gr(i, e, t, n, s) {
    for (let r = 0, a = i.length - 3; r <= a; r += 3) {
      Mn.fromArray(i, r);
      let o = s.x * Math.abs(Mn.x) + s.y * Math.abs(Mn.y) + s.z * Math.abs(Mn.z), l = e.dot(Mn), c = t.dot(Mn), h = n.dot(Mn);
      if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o)
        return !1;
    }
    return !0;
  }
  var Su = /* @__PURE__ */ new Ln(), wi = /* @__PURE__ */ new D(), Wr = /* @__PURE__ */ new D(), Li = class {
    constructor(e = new D(), t = -1) {
      this.isSphere = !0, this.center = e, this.radius = t;
    }
    set(e, t) {
      return this.center.copy(e), this.radius = t, this;
    }
    setFromPoints(e, t) {
      let n = this.center;
      t !== void 0 ? n.copy(t) : Su.setFromPoints(e).getCenter(n);
      let s = 0;
      for (let r = 0, a = e.length; r < a; r++)
        s = Math.max(s, n.distanceToSquared(e[r]));
      return this.radius = Math.sqrt(s), this;
    }
    copy(e) {
      return this.center.copy(e.center), this.radius = e.radius, this;
    }
    isEmpty() {
      return this.radius < 0;
    }
    makeEmpty() {
      return this.center.set(0, 0, 0), this.radius = -1, this;
    }
    containsPoint(e) {
      return e.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    distanceToPoint(e) {
      return e.distanceTo(this.center) - this.radius;
    }
    intersectsSphere(e) {
      let t = this.radius + e.radius;
      return e.center.distanceToSquared(this.center) <= t * t;
    }
    intersectsBox(e) {
      return e.intersectsSphere(this);
    }
    intersectsPlane(e) {
      return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
    }
    clampPoint(e, t) {
      let n = this.center.distanceToSquared(e);
      return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
    }
    getBoundingBox(e) {
      return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
    }
    applyMatrix4(e) {
      return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
    }
    translate(e) {
      return this.center.add(e), this;
    }
    expandByPoint(e) {
      if (this.isEmpty())
        return this.center.copy(e), this.radius = 0, this;
      wi.subVectors(e, this.center);
      let t = wi.lengthSq();
      if (t > this.radius * this.radius) {
        let n = Math.sqrt(t), s = (n - this.radius) * 0.5;
        this.center.addScaledVector(wi, s / n), this.radius += s;
      }
      return this;
    }
    union(e) {
      return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Wr.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(wi.copy(e.center).add(Wr)), this.expandByPoint(wi.copy(e.center).sub(Wr))), this);
    }
    equals(e) {
      return e.center.equals(this.center) && e.radius === this.radius;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }, Yt = /* @__PURE__ */ new D(), Xr = /* @__PURE__ */ new D(), cs = /* @__PURE__ */ new D(), ln = /* @__PURE__ */ new D(), qr = /* @__PURE__ */ new D(), hs = /* @__PURE__ */ new D(), Yr = /* @__PURE__ */ new D(), Di = class {
    constructor(e = new D(), t = new D(0, 0, -1)) {
      this.origin = e, this.direction = t;
    }
    set(e, t) {
      return this.origin.copy(e), this.direction.copy(t), this;
    }
    copy(e) {
      return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
    }
    at(e, t) {
      return t.copy(this.origin).addScaledVector(this.direction, e);
    }
    lookAt(e) {
      return this.direction.copy(e).sub(this.origin).normalize(), this;
    }
    recast(e) {
      return this.origin.copy(this.at(e, Yt)), this;
    }
    closestPointToPoint(e, t) {
      t.subVectors(e, this.origin);
      let n = t.dot(this.direction);
      return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
    }
    distanceToPoint(e) {
      return Math.sqrt(this.distanceSqToPoint(e));
    }
    distanceSqToPoint(e) {
      let t = Yt.subVectors(e, this.origin).dot(this.direction);
      return t < 0 ? this.origin.distanceToSquared(e) : (Yt.copy(this.origin).addScaledVector(this.direction, t), Yt.distanceToSquared(e));
    }
    distanceSqToSegment(e, t, n, s) {
      Xr.copy(e).add(t).multiplyScalar(0.5), cs.copy(t).sub(e).normalize(), ln.copy(this.origin).sub(Xr);
      let r = e.distanceTo(t) * 0.5, a = -this.direction.dot(cs), o = ln.dot(this.direction), l = -ln.dot(cs), c = ln.lengthSq(), h = Math.abs(1 - a * a), f, d, m, _;
      if (h > 0)
        if (f = a * l - o, d = a * o - l, _ = r * h, f >= 0)
          if (d >= -_)
            if (d <= _) {
              let y = 1 / h;
              f *= y, d *= y, m = f * (f + a * d + 2 * o) + d * (a * f + d + 2 * l) + c;
            } else
              d = r, f = Math.max(0, -(a * d + o)), m = -f * f + d * (d + 2 * l) + c;
          else
            d = -r, f = Math.max(0, -(a * d + o)), m = -f * f + d * (d + 2 * l) + c;
        else
          d <= -_ ? (f = Math.max(0, -(-a * r + o)), d = f > 0 ? -r : Math.min(Math.max(-r, -l), r), m = -f * f + d * (d + 2 * l) + c) : d <= _ ? (f = 0, d = Math.min(Math.max(-r, -l), r), m = d * (d + 2 * l) + c) : (f = Math.max(0, -(a * r + o)), d = f > 0 ? r : Math.min(Math.max(-r, -l), r), m = -f * f + d * (d + 2 * l) + c);
      else
        d = a > 0 ? -r : r, f = Math.max(0, -(a * d + o)), m = -f * f + d * (d + 2 * l) + c;
      return n && n.copy(this.origin).addScaledVector(this.direction, f), s && s.copy(Xr).addScaledVector(cs, d), m;
    }
    intersectSphere(e, t) {
      Yt.subVectors(e.center, this.origin);
      let n = Yt.dot(this.direction), s = Yt.dot(Yt) - n * n, r = e.radius * e.radius;
      if (s > r) return null;
      let a = Math.sqrt(r - s), o = n - a, l = n + a;
      return l < 0 ? null : o < 0 ? this.at(l, t) : this.at(o, t);
    }
    intersectsSphere(e) {
      return this.distanceSqToPoint(e.center) <= e.radius * e.radius;
    }
    distanceToPlane(e) {
      let t = e.normal.dot(this.direction);
      if (t === 0)
        return e.distanceToPoint(this.origin) === 0 ? 0 : null;
      let n = -(this.origin.dot(e.normal) + e.constant) / t;
      return n >= 0 ? n : null;
    }
    intersectPlane(e, t) {
      let n = this.distanceToPlane(e);
      return n === null ? null : this.at(n, t);
    }
    intersectsPlane(e) {
      let t = e.distanceToPoint(this.origin);
      return t === 0 || e.normal.dot(this.direction) * t < 0;
    }
    intersectBox(e, t) {
      let n, s, r, a, o, l, c = 1 / this.direction.x, h = 1 / this.direction.y, f = 1 / this.direction.z, d = this.origin;
      return c >= 0 ? (n = (e.min.x - d.x) * c, s = (e.max.x - d.x) * c) : (n = (e.max.x - d.x) * c, s = (e.min.x - d.x) * c), h >= 0 ? (r = (e.min.y - d.y) * h, a = (e.max.y - d.y) * h) : (r = (e.max.y - d.y) * h, a = (e.min.y - d.y) * h), n > a || r > s || ((r > n || isNaN(n)) && (n = r), (a < s || isNaN(s)) && (s = a), f >= 0 ? (o = (e.min.z - d.z) * f, l = (e.max.z - d.z) * f) : (o = (e.max.z - d.z) * f, l = (e.min.z - d.z) * f), n > l || o > s) || ((o > n || n !== n) && (n = o), (l < s || s !== s) && (s = l), s < 0) ? null : this.at(n >= 0 ? n : s, t);
    }
    intersectsBox(e) {
      return this.intersectBox(e, Yt) !== null;
    }
    intersectTriangle(e, t, n, s, r) {
      qr.subVectors(t, e), hs.subVectors(n, e), Yr.crossVectors(qr, hs);
      let a = this.direction.dot(Yr), o;
      if (a > 0) {
        if (s) return null;
        o = 1;
      } else if (a < 0)
        o = -1, a = -a;
      else
        return null;
      ln.subVectors(this.origin, e);
      let l = o * this.direction.dot(hs.crossVectors(ln, hs));
      if (l < 0)
        return null;
      let c = o * this.direction.dot(qr.cross(ln));
      if (c < 0 || l + c > a)
        return null;
      let h = -o * ln.dot(Yr);
      return h < 0 ? null : this.at(h / a, r);
    }
    applyMatrix4(e) {
      return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
    }
    equals(e) {
      return e.origin.equals(this.origin) && e.direction.equals(this.direction);
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }, at = class i {
    constructor(e, t, n, s, r, a, o, l, c, h, f, d, m, _, y, p) {
      i.prototype.isMatrix4 = !0, this.elements = [
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
      ], e !== void 0 && this.set(e, t, n, s, r, a, o, l, c, h, f, d, m, _, y, p);
    }
    set(e, t, n, s, r, a, o, l, c, h, f, d, m, _, y, p) {
      let u = this.elements;
      return u[0] = e, u[4] = t, u[8] = n, u[12] = s, u[1] = r, u[5] = a, u[9] = o, u[13] = l, u[2] = c, u[6] = h, u[10] = f, u[14] = d, u[3] = m, u[7] = _, u[11] = y, u[15] = p, this;
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
      return new i().fromArray(this.elements);
    }
    copy(e) {
      let t = this.elements, n = e.elements;
      return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this;
    }
    copyPosition(e) {
      let t = this.elements, n = e.elements;
      return t[12] = n[12], t[13] = n[13], t[14] = n[14], this;
    }
    setFromMatrix3(e) {
      let t = e.elements;
      return this.set(
        t[0],
        t[3],
        t[6],
        0,
        t[1],
        t[4],
        t[7],
        0,
        t[2],
        t[5],
        t[8],
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    extractBasis(e, t, n) {
      return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
    }
    makeBasis(e, t, n) {
      return this.set(
        e.x,
        t.x,
        n.x,
        0,
        e.y,
        t.y,
        n.y,
        0,
        e.z,
        t.z,
        n.z,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    extractRotation(e) {
      let t = this.elements, n = e.elements, s = 1 / Yn.setFromMatrixColumn(e, 0).length(), r = 1 / Yn.setFromMatrixColumn(e, 1).length(), a = 1 / Yn.setFromMatrixColumn(e, 2).length();
      return t[0] = n[0] * s, t[1] = n[1] * s, t[2] = n[2] * s, t[3] = 0, t[4] = n[4] * r, t[5] = n[5] * r, t[6] = n[6] * r, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
    }
    makeRotationFromEuler(e) {
      let t = this.elements, n = e.x, s = e.y, r = e.z, a = Math.cos(n), o = Math.sin(n), l = Math.cos(s), c = Math.sin(s), h = Math.cos(r), f = Math.sin(r);
      if (e.order === "XYZ") {
        let d = a * h, m = a * f, _ = o * h, y = o * f;
        t[0] = l * h, t[4] = -l * f, t[8] = c, t[1] = m + _ * c, t[5] = d - y * c, t[9] = -o * l, t[2] = y - d * c, t[6] = _ + m * c, t[10] = a * l;
      } else if (e.order === "YXZ") {
        let d = l * h, m = l * f, _ = c * h, y = c * f;
        t[0] = d + y * o, t[4] = _ * o - m, t[8] = a * c, t[1] = a * f, t[5] = a * h, t[9] = -o, t[2] = m * o - _, t[6] = y + d * o, t[10] = a * l;
      } else if (e.order === "ZXY") {
        let d = l * h, m = l * f, _ = c * h, y = c * f;
        t[0] = d - y * o, t[4] = -a * f, t[8] = _ + m * o, t[1] = m + _ * o, t[5] = a * h, t[9] = y - d * o, t[2] = -a * c, t[6] = o, t[10] = a * l;
      } else if (e.order === "ZYX") {
        let d = a * h, m = a * f, _ = o * h, y = o * f;
        t[0] = l * h, t[4] = _ * c - m, t[8] = d * c + y, t[1] = l * f, t[5] = y * c + d, t[9] = m * c - _, t[2] = -c, t[6] = o * l, t[10] = a * l;
      } else if (e.order === "YZX") {
        let d = a * l, m = a * c, _ = o * l, y = o * c;
        t[0] = l * h, t[4] = y - d * f, t[8] = _ * f + m, t[1] = f, t[5] = a * h, t[9] = -o * h, t[2] = -c * h, t[6] = m * f + _, t[10] = d - y * f;
      } else if (e.order === "XZY") {
        let d = a * l, m = a * c, _ = o * l, y = o * c;
        t[0] = l * h, t[4] = -f, t[8] = c * h, t[1] = d * f + y, t[5] = a * h, t[9] = m * f - _, t[2] = _ * f - m, t[6] = o * h, t[10] = y * f + d;
      }
      return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
    }
    makeRotationFromQuaternion(e) {
      return this.compose(bu, e, Eu);
    }
    lookAt(e, t, n) {
      let s = this.elements;
      return bt.subVectors(e, t), bt.lengthSq() === 0 && (bt.z = 1), bt.normalize(), cn.crossVectors(n, bt), cn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? bt.x += 1e-4 : bt.z += 1e-4, bt.normalize(), cn.crossVectors(n, bt)), cn.normalize(), us.crossVectors(bt, cn), s[0] = cn.x, s[4] = us.x, s[8] = bt.x, s[1] = cn.y, s[5] = us.y, s[9] = bt.y, s[2] = cn.z, s[6] = us.z, s[10] = bt.z, this;
    }
    multiply(e) {
      return this.multiplyMatrices(this, e);
    }
    premultiply(e) {
      return this.multiplyMatrices(e, this);
    }
    multiplyMatrices(e, t) {
      let n = e.elements, s = t.elements, r = this.elements, a = n[0], o = n[4], l = n[8], c = n[12], h = n[1], f = n[5], d = n[9], m = n[13], _ = n[2], y = n[6], p = n[10], u = n[14], w = n[3], S = n[7], E = n[11], O = n[15], T = s[0], R = s[4], B = s[8], M = s[12], v = s[1], P = s[5], W = s[9], z = s[13], G = s[2], Z = s[6], H = s[10], K = s[14], k = s[3], ae = s[7], he = s[11], me = s[15];
      return r[0] = a * T + o * v + l * G + c * k, r[4] = a * R + o * P + l * Z + c * ae, r[8] = a * B + o * W + l * H + c * he, r[12] = a * M + o * z + l * K + c * me, r[1] = h * T + f * v + d * G + m * k, r[5] = h * R + f * P + d * Z + m * ae, r[9] = h * B + f * W + d * H + m * he, r[13] = h * M + f * z + d * K + m * me, r[2] = _ * T + y * v + p * G + u * k, r[6] = _ * R + y * P + p * Z + u * ae, r[10] = _ * B + y * W + p * H + u * he, r[14] = _ * M + y * z + p * K + u * me, r[3] = w * T + S * v + E * G + O * k, r[7] = w * R + S * P + E * Z + O * ae, r[11] = w * B + S * W + E * H + O * he, r[15] = w * M + S * z + E * K + O * me, this;
    }
    multiplyScalar(e) {
      let t = this.elements;
      return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
    }
    determinant() {
      let e = this.elements, t = e[0], n = e[4], s = e[8], r = e[12], a = e[1], o = e[5], l = e[9], c = e[13], h = e[2], f = e[6], d = e[10], m = e[14], _ = e[3], y = e[7], p = e[11], u = e[15];
      return _ * (+r * l * f - s * c * f - r * o * d + n * c * d + s * o * m - n * l * m) + y * (+t * l * m - t * c * d + r * a * d - s * a * m + s * c * h - r * l * h) + p * (+t * c * f - t * o * m - r * a * f + n * a * m + r * o * h - n * c * h) + u * (-s * o * h - t * l * f + t * o * d + s * a * f - n * a * d + n * l * h);
    }
    transpose() {
      let e = this.elements, t;
      return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
    }
    setPosition(e, t, n) {
      let s = this.elements;
      return e.isVector3 ? (s[12] = e.x, s[13] = e.y, s[14] = e.z) : (s[12] = e, s[13] = t, s[14] = n), this;
    }
    invert() {
      let e = this.elements, t = e[0], n = e[1], s = e[2], r = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8], f = e[9], d = e[10], m = e[11], _ = e[12], y = e[13], p = e[14], u = e[15], w = f * p * c - y * d * c + y * l * m - o * p * m - f * l * u + o * d * u, S = _ * d * c - h * p * c - _ * l * m + a * p * m + h * l * u - a * d * u, E = h * y * c - _ * f * c + _ * o * m - a * y * m - h * o * u + a * f * u, O = _ * f * l - h * y * l - _ * o * d + a * y * d + h * o * p - a * f * p, T = t * w + n * S + s * E + r * O;
      if (T === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      let R = 1 / T;
      return e[0] = w * R, e[1] = (y * d * r - f * p * r - y * s * m + n * p * m + f * s * u - n * d * u) * R, e[2] = (o * p * r - y * l * r + y * s * c - n * p * c - o * s * u + n * l * u) * R, e[3] = (f * l * r - o * d * r - f * s * c + n * d * c + o * s * m - n * l * m) * R, e[4] = S * R, e[5] = (h * p * r - _ * d * r + _ * s * m - t * p * m - h * s * u + t * d * u) * R, e[6] = (_ * l * r - a * p * r - _ * s * c + t * p * c + a * s * u - t * l * u) * R, e[7] = (a * d * r - h * l * r + h * s * c - t * d * c - a * s * m + t * l * m) * R, e[8] = E * R, e[9] = (_ * f * r - h * y * r - _ * n * m + t * y * m + h * n * u - t * f * u) * R, e[10] = (a * y * r - _ * o * r + _ * n * c - t * y * c - a * n * u + t * o * u) * R, e[11] = (h * o * r - a * f * r - h * n * c + t * f * c + a * n * m - t * o * m) * R, e[12] = O * R, e[13] = (h * y * s - _ * f * s + _ * n * d - t * y * d - h * n * p + t * f * p) * R, e[14] = (_ * o * s - a * y * s - _ * n * l + t * y * l + a * n * p - t * o * p) * R, e[15] = (a * f * s - h * o * s + h * n * l - t * f * l - a * n * d + t * o * d) * R, this;
    }
    scale(e) {
      let t = this.elements, n = e.x, s = e.y, r = e.z;
      return t[0] *= n, t[4] *= s, t[8] *= r, t[1] *= n, t[5] *= s, t[9] *= r, t[2] *= n, t[6] *= s, t[10] *= r, t[3] *= n, t[7] *= s, t[11] *= r, this;
    }
    getMaxScaleOnAxis() {
      let e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], s = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
      return Math.sqrt(Math.max(t, n, s));
    }
    makeTranslation(e, t, n) {
      return e.isVector3 ? this.set(
        1,
        0,
        0,
        e.x,
        0,
        1,
        0,
        e.y,
        0,
        0,
        1,
        e.z,
        0,
        0,
        0,
        1
      ) : this.set(
        1,
        0,
        0,
        e,
        0,
        1,
        0,
        t,
        0,
        0,
        1,
        n,
        0,
        0,
        0,
        1
      ), this;
    }
    makeRotationX(e) {
      let t = Math.cos(e), n = Math.sin(e);
      return this.set(
        1,
        0,
        0,
        0,
        0,
        t,
        -n,
        0,
        0,
        n,
        t,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeRotationY(e) {
      let t = Math.cos(e), n = Math.sin(e);
      return this.set(
        t,
        0,
        n,
        0,
        0,
        1,
        0,
        0,
        -n,
        0,
        t,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeRotationZ(e) {
      let t = Math.cos(e), n = Math.sin(e);
      return this.set(
        t,
        -n,
        0,
        0,
        n,
        t,
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
    makeRotationAxis(e, t) {
      let n = Math.cos(t), s = Math.sin(t), r = 1 - n, a = e.x, o = e.y, l = e.z, c = r * a, h = r * o;
      return this.set(
        c * a + n,
        c * o - s * l,
        c * l + s * o,
        0,
        c * o + s * l,
        h * o + n,
        h * l - s * a,
        0,
        c * l - s * o,
        h * l + s * a,
        r * l * l + n,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeScale(e, t, n) {
      return this.set(
        e,
        0,
        0,
        0,
        0,
        t,
        0,
        0,
        0,
        0,
        n,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    makeShear(e, t, n, s, r, a) {
      return this.set(
        1,
        n,
        r,
        0,
        e,
        1,
        a,
        0,
        t,
        s,
        1,
        0,
        0,
        0,
        0,
        1
      ), this;
    }
    compose(e, t, n) {
      let s = this.elements, r = t._x, a = t._y, o = t._z, l = t._w, c = r + r, h = a + a, f = o + o, d = r * c, m = r * h, _ = r * f, y = a * h, p = a * f, u = o * f, w = l * c, S = l * h, E = l * f, O = n.x, T = n.y, R = n.z;
      return s[0] = (1 - (y + u)) * O, s[1] = (m + E) * O, s[2] = (_ - S) * O, s[3] = 0, s[4] = (m - E) * T, s[5] = (1 - (d + u)) * T, s[6] = (p + w) * T, s[7] = 0, s[8] = (_ + S) * R, s[9] = (p - w) * R, s[10] = (1 - (d + y)) * R, s[11] = 0, s[12] = e.x, s[13] = e.y, s[14] = e.z, s[15] = 1, this;
    }
    decompose(e, t, n) {
      let s = this.elements, r = Yn.set(s[0], s[1], s[2]).length(), a = Yn.set(s[4], s[5], s[6]).length(), o = Yn.set(s[8], s[9], s[10]).length();
      this.determinant() < 0 && (r = -r), e.x = s[12], e.y = s[13], e.z = s[14], Ut.copy(this);
      let c = 1 / r, h = 1 / a, f = 1 / o;
      return Ut.elements[0] *= c, Ut.elements[1] *= c, Ut.elements[2] *= c, Ut.elements[4] *= h, Ut.elements[5] *= h, Ut.elements[6] *= h, Ut.elements[8] *= f, Ut.elements[9] *= f, Ut.elements[10] *= f, t.setFromRotationMatrix(Ut), n.x = r, n.y = a, n.z = o, this;
    }
    makePerspective(e, t, n, s, r, a, o = en) {
      let l = this.elements, c = 2 * r / (t - e), h = 2 * r / (n - s), f = (t + e) / (t - e), d = (n + s) / (n - s), m, _;
      if (o === en)
        m = -(a + r) / (a - r), _ = -2 * a * r / (a - r);
      else if (o === Bs)
        m = -a / (a - r), _ = -a * r / (a - r);
      else
        throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
      return l[0] = c, l[4] = 0, l[8] = f, l[12] = 0, l[1] = 0, l[5] = h, l[9] = d, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = m, l[14] = _, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
    }
    makeOrthographic(e, t, n, s, r, a, o = en) {
      let l = this.elements, c = 1 / (t - e), h = 1 / (n - s), f = 1 / (a - r), d = (t + e) * c, m = (n + s) * h, _, y;
      if (o === en)
        _ = (a + r) * f, y = -2 * f;
      else if (o === Bs)
        _ = r * f, y = -1 * f;
      else
        throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
      return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -d, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -m, l[2] = 0, l[6] = 0, l[10] = y, l[14] = -_, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
    }
    equals(e) {
      let t = this.elements, n = e.elements;
      for (let s = 0; s < 16; s++)
        if (t[s] !== n[s]) return !1;
      return !0;
    }
    fromArray(e, t = 0) {
      for (let n = 0; n < 16; n++)
        this.elements[n] = e[n + t];
      return this;
    }
    toArray(e = [], t = 0) {
      let n = this.elements;
      return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e;
    }
  }, Yn = /* @__PURE__ */ new D(), Ut = /* @__PURE__ */ new at(), bu = /* @__PURE__ */ new D(0, 0, 0), Eu = /* @__PURE__ */ new D(1, 1, 1), cn = /* @__PURE__ */ new D(), us = /* @__PURE__ */ new D(), bt = /* @__PURE__ */ new D(), Tl = /* @__PURE__ */ new at(), Rl = /* @__PURE__ */ new _n(), Vt = class i {
    constructor(e = 0, t = 0, n = 0, s = i.DEFAULT_ORDER) {
      this.isEuler = !0, this._x = e, this._y = t, this._z = n, this._order = s;
    }
    get x() {
      return this._x;
    }
    set x(e) {
      this._x = e, this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(e) {
      this._y = e, this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(e) {
      this._z = e, this._onChangeCallback();
    }
    get order() {
      return this._order;
    }
    set order(e) {
      this._order = e, this._onChangeCallback();
    }
    set(e, t, n, s = this._order) {
      return this._x = e, this._y = t, this._z = n, this._order = s, this._onChangeCallback(), this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }
    copy(e) {
      return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
    }
    setFromRotationMatrix(e, t = this._order, n = !0) {
      let s = e.elements, r = s[0], a = s[4], o = s[8], l = s[1], c = s[5], h = s[9], f = s[2], d = s[6], m = s[10];
      switch (t) {
        case "XYZ":
          this._y = Math.asin(xt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, m), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(d, c), this._z = 0);
          break;
        case "YXZ":
          this._x = Math.asin(-xt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, m), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-f, r), this._z = 0);
          break;
        case "ZXY":
          this._x = Math.asin(xt(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-f, m), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, r));
          break;
        case "ZYX":
          this._y = Math.asin(-xt(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._x = Math.atan2(d, m), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-a, c));
          break;
        case "YZX":
          this._z = Math.asin(xt(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-f, r)) : (this._x = 0, this._y = Math.atan2(o, m));
          break;
        case "XZY":
          this._z = Math.asin(-xt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-h, m), this._y = 0);
          break;
        default:
          console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
      }
      return this._order = t, n === !0 && this._onChangeCallback(), this;
    }
    setFromQuaternion(e, t, n) {
      return Tl.makeRotationFromQuaternion(e), this.setFromRotationMatrix(Tl, t, n);
    }
    setFromVector3(e, t = this._order) {
      return this.set(e.x, e.y, e.z, t);
    }
    reorder(e) {
      return Rl.setFromEuler(this), this.setFromQuaternion(Rl, e);
    }
    equals(e) {
      return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
    }
    fromArray(e) {
      return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
    }
    _onChange(e) {
      return this._onChangeCallback = e, this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x, yield this._y, yield this._z, yield this._order;
    }
  };
  Vt.DEFAULT_ORDER = "XYZ";
  var Vs = class {
    constructor() {
      this.mask = 1;
    }
    set(e) {
      this.mask = (1 << e | 0) >>> 0;
    }
    enable(e) {
      this.mask |= 1 << e | 0;
    }
    enableAll() {
      this.mask = -1;
    }
    toggle(e) {
      this.mask ^= 1 << e | 0;
    }
    disable(e) {
      this.mask &= ~(1 << e | 0);
    }
    disableAll() {
      this.mask = 0;
    }
    test(e) {
      return (this.mask & e.mask) !== 0;
    }
    isEnabled(e) {
      return (this.mask & (1 << e | 0)) !== 0;
    }
  }, wu = 0, Cl = /* @__PURE__ */ new D(), Zn = /* @__PURE__ */ new _n(), Zt = /* @__PURE__ */ new at(), ds = /* @__PURE__ */ new D(), Ai = /* @__PURE__ */ new D(), Au = /* @__PURE__ */ new D(), Tu = /* @__PURE__ */ new _n(), Pl = /* @__PURE__ */ new D(1, 0, 0), Il = /* @__PURE__ */ new D(0, 1, 0), Ll = /* @__PURE__ */ new D(0, 0, 1), Dl = { type: "added" }, Ru = { type: "removed" }, $n = { type: "childadded", child: null }, Zr = { type: "childremoved", child: null }, yt = class i extends gn {
    constructor() {
      super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: wu++ }), this.uuid = Bi(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = i.DEFAULT_UP.clone();
      let e = new D(), t = new Vt(), n = new _n(), s = new D(1, 1, 1);
      function r() {
        n.setFromEuler(t, !1);
      }
      function a() {
        t.setFromQuaternion(n, void 0, !1);
      }
      t._onChange(r), n._onChange(a), Object.defineProperties(this, {
        position: {
          configurable: !0,
          enumerable: !0,
          value: e
        },
        rotation: {
          configurable: !0,
          enumerable: !0,
          value: t
        },
        quaternion: {
          configurable: !0,
          enumerable: !0,
          value: n
        },
        scale: {
          configurable: !0,
          enumerable: !0,
          value: s
        },
        modelViewMatrix: {
          value: new at()
        },
        normalMatrix: {
          value: new Ie()
        }
      }), this.matrix = new at(), this.matrixWorld = new at(), this.matrixAutoUpdate = i.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Vs(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
    }
    onBeforeShadow() {
    }
    onAfterShadow() {
    }
    onBeforeRender() {
    }
    onAfterRender() {
    }
    applyMatrix4(e) {
      this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
    }
    applyQuaternion(e) {
      return this.quaternion.premultiply(e), this;
    }
    setRotationFromAxisAngle(e, t) {
      this.quaternion.setFromAxisAngle(e, t);
    }
    setRotationFromEuler(e) {
      this.quaternion.setFromEuler(e, !0);
    }
    setRotationFromMatrix(e) {
      this.quaternion.setFromRotationMatrix(e);
    }
    setRotationFromQuaternion(e) {
      this.quaternion.copy(e);
    }
    rotateOnAxis(e, t) {
      return Zn.setFromAxisAngle(e, t), this.quaternion.multiply(Zn), this;
    }
    rotateOnWorldAxis(e, t) {
      return Zn.setFromAxisAngle(e, t), this.quaternion.premultiply(Zn), this;
    }
    rotateX(e) {
      return this.rotateOnAxis(Pl, e);
    }
    rotateY(e) {
      return this.rotateOnAxis(Il, e);
    }
    rotateZ(e) {
      return this.rotateOnAxis(Ll, e);
    }
    translateOnAxis(e, t) {
      return Cl.copy(e).applyQuaternion(this.quaternion), this.position.add(Cl.multiplyScalar(t)), this;
    }
    translateX(e) {
      return this.translateOnAxis(Pl, e);
    }
    translateY(e) {
      return this.translateOnAxis(Il, e);
    }
    translateZ(e) {
      return this.translateOnAxis(Ll, e);
    }
    localToWorld(e) {
      return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
    }
    worldToLocal(e) {
      return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Zt.copy(this.matrixWorld).invert());
    }
    lookAt(e, t, n) {
      e.isVector3 ? ds.copy(e) : ds.set(e, t, n);
      let s = this.parent;
      this.updateWorldMatrix(!0, !1), Ai.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Zt.lookAt(Ai, ds, this.up) : Zt.lookAt(ds, Ai, this.up), this.quaternion.setFromRotationMatrix(Zt), s && (Zt.extractRotation(s.matrixWorld), Zn.setFromRotationMatrix(Zt), this.quaternion.premultiply(Zn.invert()));
    }
    add(e) {
      if (arguments.length > 1) {
        for (let t = 0; t < arguments.length; t++)
          this.add(arguments[t]);
        return this;
      }
      return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(Dl), $n.child = e, this.dispatchEvent($n), $n.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
    }
    remove(e) {
      if (arguments.length > 1) {
        for (let n = 0; n < arguments.length; n++)
          this.remove(arguments[n]);
        return this;
      }
      let t = this.children.indexOf(e);
      return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Ru), Zr.child = e, this.dispatchEvent(Zr), Zr.child = null), this;
    }
    removeFromParent() {
      let e = this.parent;
      return e !== null && e.remove(this), this;
    }
    clear() {
      return this.remove(...this.children);
    }
    attach(e) {
      return this.updateWorldMatrix(!0, !1), Zt.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Zt.multiply(e.parent.matrixWorld)), e.applyMatrix4(Zt), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(Dl), $n.child = e, this.dispatchEvent($n), $n.child = null, this;
    }
    getObjectById(e) {
      return this.getObjectByProperty("id", e);
    }
    getObjectByName(e) {
      return this.getObjectByProperty("name", e);
    }
    getObjectByProperty(e, t) {
      if (this[e] === t) return this;
      for (let n = 0, s = this.children.length; n < s; n++) {
        let a = this.children[n].getObjectByProperty(e, t);
        if (a !== void 0)
          return a;
      }
    }
    getObjectsByProperty(e, t, n = []) {
      this[e] === t && n.push(this);
      let s = this.children;
      for (let r = 0, a = s.length; r < a; r++)
        s[r].getObjectsByProperty(e, t, n);
      return n;
    }
    getWorldPosition(e) {
      return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
    }
    getWorldQuaternion(e) {
      return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Ai, e, Au), e;
    }
    getWorldScale(e) {
      return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Ai, Tu, e), e;
    }
    getWorldDirection(e) {
      this.updateWorldMatrix(!0, !1);
      let t = this.matrixWorld.elements;
      return e.set(t[8], t[9], t[10]).normalize();
    }
    raycast() {
    }
    traverse(e) {
      e(this);
      let t = this.children;
      for (let n = 0, s = t.length; n < s; n++)
        t[n].traverse(e);
    }
    traverseVisible(e) {
      if (this.visible === !1) return;
      e(this);
      let t = this.children;
      for (let n = 0, s = t.length; n < s; n++)
        t[n].traverseVisible(e);
    }
    traverseAncestors(e) {
      let t = this.parent;
      t !== null && (e(t), t.traverseAncestors(e));
    }
    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
    }
    updateMatrixWorld(e) {
      this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
      let t = this.children;
      for (let n = 0, s = t.length; n < s; n++)
        t[n].updateMatrixWorld(e);
    }
    updateWorldMatrix(e, t) {
      let n = this.parent;
      if (e === !0 && n !== null && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), t === !0) {
        let s = this.children;
        for (let r = 0, a = s.length; r < a; r++)
          s[r].updateWorldMatrix(!1, !0);
      }
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == "string", n = {};
      t && (e = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {}
      }, n.metadata = {
        version: 4.6,
        type: "Object",
        generator: "Object3D.toJSON"
      });
      let s = {};
      s.uuid = this.uuid, s.type = this.type, this.name !== "" && (s.name = this.name), this.castShadow === !0 && (s.castShadow = !0), this.receiveShadow === !0 && (s.receiveShadow = !0), this.visible === !1 && (s.visible = !1), this.frustumCulled === !1 && (s.frustumCulled = !1), this.renderOrder !== 0 && (s.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (s.userData = this.userData), s.layers = this.layers.mask, s.matrix = this.matrix.toArray(), s.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (s.matrixAutoUpdate = !1), this.isInstancedMesh && (s.type = "InstancedMesh", s.count = this.count, s.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (s.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (s.type = "BatchedMesh", s.perObjectFrustumCulled = this.perObjectFrustumCulled, s.sortObjects = this.sortObjects, s.drawRanges = this._drawRanges, s.reservedRanges = this._reservedRanges, s.visibility = this._visibility, s.active = this._active, s.bounds = this._bounds.map((o) => ({
        boxInitialized: o.boxInitialized,
        boxMin: o.box.min.toArray(),
        boxMax: o.box.max.toArray(),
        sphereInitialized: o.sphereInitialized,
        sphereRadius: o.sphere.radius,
        sphereCenter: o.sphere.center.toArray()
      })), s.maxInstanceCount = this._maxInstanceCount, s.maxVertexCount = this._maxVertexCount, s.maxIndexCount = this._maxIndexCount, s.geometryInitialized = this._geometryInitialized, s.geometryCount = this._geometryCount, s.matricesTexture = this._matricesTexture.toJSON(e), this._colorsTexture !== null && (s.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (s.boundingSphere = {
        center: s.boundingSphere.center.toArray(),
        radius: s.boundingSphere.radius
      }), this.boundingBox !== null && (s.boundingBox = {
        min: s.boundingBox.min.toArray(),
        max: s.boundingBox.max.toArray()
      }));
      function r(o, l) {
        return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(e)), l.uuid;
      }
      if (this.isScene)
        this.background && (this.background.isColor ? s.background = this.background.toJSON() : this.background.isTexture && (s.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (s.environment = this.environment.toJSON(e).uuid);
      else if (this.isMesh || this.isLine || this.isPoints) {
        s.geometry = r(e.geometries, this.geometry);
        let o = this.geometry.parameters;
        if (o !== void 0 && o.shapes !== void 0) {
          let l = o.shapes;
          if (Array.isArray(l))
            for (let c = 0, h = l.length; c < h; c++) {
              let f = l[c];
              r(e.shapes, f);
            }
          else
            r(e.shapes, l);
        }
      }
      if (this.isSkinnedMesh && (s.bindMode = this.bindMode, s.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(e.skeletons, this.skeleton), s.skeleton = this.skeleton.uuid)), this.material !== void 0)
        if (Array.isArray(this.material)) {
          let o = [];
          for (let l = 0, c = this.material.length; l < c; l++)
            o.push(r(e.materials, this.material[l]));
          s.material = o;
        } else
          s.material = r(e.materials, this.material);
      if (this.children.length > 0) {
        s.children = [];
        for (let o = 0; o < this.children.length; o++)
          s.children.push(this.children[o].toJSON(e).object);
      }
      if (this.animations.length > 0) {
        s.animations = [];
        for (let o = 0; o < this.animations.length; o++) {
          let l = this.animations[o];
          s.animations.push(r(e.animations, l));
        }
      }
      if (t) {
        let o = a(e.geometries), l = a(e.materials), c = a(e.textures), h = a(e.images), f = a(e.shapes), d = a(e.skeletons), m = a(e.animations), _ = a(e.nodes);
        o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), f.length > 0 && (n.shapes = f), d.length > 0 && (n.skeletons = d), m.length > 0 && (n.animations = m), _.length > 0 && (n.nodes = _);
      }
      return n.object = s, n;
      function a(o) {
        let l = [];
        for (let c in o) {
          let h = o[c];
          delete h.metadata, l.push(h);
        }
        return l;
      }
    }
    clone(e) {
      return new this.constructor().copy(this, e);
    }
    copy(e, t = !0) {
      if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
        for (let n = 0; n < e.children.length; n++) {
          let s = e.children[n];
          this.add(s.clone());
        }
      return this;
    }
  };
  yt.DEFAULT_UP = /* @__PURE__ */ new D(0, 1, 0);
  yt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
  yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
  var Nt = /* @__PURE__ */ new D(), $t = /* @__PURE__ */ new D(), $r = /* @__PURE__ */ new D(), Jt = /* @__PURE__ */ new D(), Jn = /* @__PURE__ */ new D(), Kn = /* @__PURE__ */ new D(), Ul = /* @__PURE__ */ new D(), Jr = /* @__PURE__ */ new D(), Kr = /* @__PURE__ */ new D(), Qr = /* @__PURE__ */ new D(), ri = class i {
    constructor(e = new D(), t = new D(), n = new D()) {
      this.a = e, this.b = t, this.c = n;
    }
    static getNormal(e, t, n, s) {
      s.subVectors(n, t), Nt.subVectors(e, t), s.cross(Nt);
      let r = s.lengthSq();
      return r > 0 ? s.multiplyScalar(1 / Math.sqrt(r)) : s.set(0, 0, 0);
    }
    // static/instance method to calculate barycentric coordinates
    // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
    static getBarycoord(e, t, n, s, r) {
      Nt.subVectors(s, t), $t.subVectors(n, t), $r.subVectors(e, t);
      let a = Nt.dot(Nt), o = Nt.dot($t), l = Nt.dot($r), c = $t.dot($t), h = $t.dot($r), f = a * c - o * o;
      if (f === 0)
        return r.set(0, 0, 0), null;
      let d = 1 / f, m = (c * l - o * h) * d, _ = (a * h - o * l) * d;
      return r.set(1 - m - _, _, m);
    }
    static containsPoint(e, t, n, s) {
      return this.getBarycoord(e, t, n, s, Jt) === null ? !1 : Jt.x >= 0 && Jt.y >= 0 && Jt.x + Jt.y <= 1;
    }
    static getInterpolation(e, t, n, s, r, a, o, l) {
      return this.getBarycoord(e, t, n, s, Jt) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, Jt.x), l.addScaledVector(a, Jt.y), l.addScaledVector(o, Jt.z), l);
    }
    static isFrontFacing(e, t, n, s) {
      return Nt.subVectors(n, t), $t.subVectors(e, t), Nt.cross($t).dot(s) < 0;
    }
    set(e, t, n) {
      return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
    }
    setFromPointsAndIndices(e, t, n, s) {
      return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[s]), this;
    }
    setFromAttributeAndIndices(e, t, n, s) {
      return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, s), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
    }
    getArea() {
      return Nt.subVectors(this.c, this.b), $t.subVectors(this.a, this.b), Nt.cross($t).length() * 0.5;
    }
    getMidpoint(e) {
      return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    }
    getNormal(e) {
      return i.getNormal(this.a, this.b, this.c, e);
    }
    getPlane(e) {
      return e.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(e, t) {
      return i.getBarycoord(e, this.a, this.b, this.c, t);
    }
    getInterpolation(e, t, n, s, r) {
      return i.getInterpolation(e, this.a, this.b, this.c, t, n, s, r);
    }
    containsPoint(e) {
      return i.containsPoint(e, this.a, this.b, this.c);
    }
    isFrontFacing(e) {
      return i.isFrontFacing(this.a, this.b, this.c, e);
    }
    intersectsBox(e) {
      return e.intersectsTriangle(this);
    }
    closestPointToPoint(e, t) {
      let n = this.a, s = this.b, r = this.c, a, o;
      Jn.subVectors(s, n), Kn.subVectors(r, n), Jr.subVectors(e, n);
      let l = Jn.dot(Jr), c = Kn.dot(Jr);
      if (l <= 0 && c <= 0)
        return t.copy(n);
      Kr.subVectors(e, s);
      let h = Jn.dot(Kr), f = Kn.dot(Kr);
      if (h >= 0 && f <= h)
        return t.copy(s);
      let d = l * f - h * c;
      if (d <= 0 && l >= 0 && h <= 0)
        return a = l / (l - h), t.copy(n).addScaledVector(Jn, a);
      Qr.subVectors(e, r);
      let m = Jn.dot(Qr), _ = Kn.dot(Qr);
      if (_ >= 0 && m <= _)
        return t.copy(r);
      let y = m * c - l * _;
      if (y <= 0 && c >= 0 && _ <= 0)
        return o = c / (c - _), t.copy(n).addScaledVector(Kn, o);
      let p = h * _ - m * f;
      if (p <= 0 && f - h >= 0 && m - _ >= 0)
        return Ul.subVectors(r, s), o = (f - h) / (f - h + (m - _)), t.copy(s).addScaledVector(Ul, o);
      let u = 1 / (p + y + d);
      return a = y * u, o = d * u, t.copy(n).addScaledVector(Jn, a).addScaledVector(Kn, o);
    }
    equals(e) {
      return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
    }
  }, Rc = {
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
  }, hn = { h: 0, s: 0, l: 0 }, fs = { h: 0, s: 0, l: 0 };
  function jr(i, e, t) {
    return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? i + (e - i) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? i + (e - i) * 6 * (2 / 3 - t) : i;
  }
  var Ne = class {
    constructor(e, t, n) {
      return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
    }
    set(e, t, n) {
      if (t === void 0 && n === void 0) {
        let s = e;
        s && s.isColor ? this.copy(s) : typeof s == "number" ? this.setHex(s) : typeof s == "string" && this.setStyle(s);
      } else
        this.setRGB(e, t, n);
      return this;
    }
    setScalar(e) {
      return this.r = e, this.g = e, this.b = e, this;
    }
    setHex(e, t = Ct) {
      return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, Xe.toWorkingColorSpace(this, t), this;
    }
    setRGB(e, t, n, s = Xe.workingColorSpace) {
      return this.r = e, this.g = t, this.b = n, Xe.toWorkingColorSpace(this, s), this;
    }
    setHSL(e, t, n, s = Xe.workingColorSpace) {
      if (e = gu(e, 1), t = xt(t, 0, 1), n = xt(n, 0, 1), t === 0)
        this.r = this.g = this.b = n;
      else {
        let r = n <= 0.5 ? n * (1 + t) : n + t - n * t, a = 2 * n - r;
        this.r = jr(a, r, e + 1 / 3), this.g = jr(a, r, e), this.b = jr(a, r, e - 1 / 3);
      }
      return Xe.toWorkingColorSpace(this, s), this;
    }
    setStyle(e, t = Ct) {
      function n(r) {
        r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
      }
      let s;
      if (s = /^(\w+)\(([^\)]*)\)/.exec(e)) {
        let r, a = s[1], o = s[2];
        switch (a) {
          case "rgb":
          case "rgba":
            if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
              return n(r[4]), this.setRGB(
                Math.min(255, parseInt(r[1], 10)) / 255,
                Math.min(255, parseInt(r[2], 10)) / 255,
                Math.min(255, parseInt(r[3], 10)) / 255,
                t
              );
            if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
              return n(r[4]), this.setRGB(
                Math.min(100, parseInt(r[1], 10)) / 100,
                Math.min(100, parseInt(r[2], 10)) / 100,
                Math.min(100, parseInt(r[3], 10)) / 100,
                t
              );
            break;
          case "hsl":
          case "hsla":
            if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
              return n(r[4]), this.setHSL(
                parseFloat(r[1]) / 360,
                parseFloat(r[2]) / 100,
                parseFloat(r[3]) / 100,
                t
              );
            break;
          default:
            console.warn("THREE.Color: Unknown color model " + e);
        }
      } else if (s = /^\#([A-Fa-f\d]+)$/.exec(e)) {
        let r = s[1], a = r.length;
        if (a === 3)
          return this.setRGB(
            parseInt(r.charAt(0), 16) / 15,
            parseInt(r.charAt(1), 16) / 15,
            parseInt(r.charAt(2), 16) / 15,
            t
          );
        if (a === 6)
          return this.setHex(parseInt(r, 16), t);
        console.warn("THREE.Color: Invalid hex color " + e);
      } else if (e && e.length > 0)
        return this.setColorName(e, t);
      return this;
    }
    setColorName(e, t = Ct) {
      let n = Rc[e.toLowerCase()];
      return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
    }
    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }
    copy(e) {
      return this.r = e.r, this.g = e.g, this.b = e.b, this;
    }
    copySRGBToLinear(e) {
      return this.r = hi(e.r), this.g = hi(e.g), this.b = hi(e.b), this;
    }
    copyLinearToSRGB(e) {
      return this.r = kr(e.r), this.g = kr(e.g), this.b = kr(e.b), this;
    }
    convertSRGBToLinear() {
      return this.copySRGBToLinear(this), this;
    }
    convertLinearToSRGB() {
      return this.copyLinearToSRGB(this), this;
    }
    getHex(e = Ct) {
      return Xe.fromWorkingColorSpace(pt.copy(this), e), Math.round(xt(pt.r * 255, 0, 255)) * 65536 + Math.round(xt(pt.g * 255, 0, 255)) * 256 + Math.round(xt(pt.b * 255, 0, 255));
    }
    getHexString(e = Ct) {
      return ("000000" + this.getHex(e).toString(16)).slice(-6);
    }
    getHSL(e, t = Xe.workingColorSpace) {
      Xe.fromWorkingColorSpace(pt.copy(this), t);
      let n = pt.r, s = pt.g, r = pt.b, a = Math.max(n, s, r), o = Math.min(n, s, r), l, c, h = (o + a) / 2;
      if (o === a)
        l = 0, c = 0;
      else {
        let f = a - o;
        switch (c = h <= 0.5 ? f / (a + o) : f / (2 - a - o), a) {
          case n:
            l = (s - r) / f + (s < r ? 6 : 0);
            break;
          case s:
            l = (r - n) / f + 2;
            break;
          case r:
            l = (n - s) / f + 4;
            break;
        }
        l /= 6;
      }
      return e.h = l, e.s = c, e.l = h, e;
    }
    getRGB(e, t = Xe.workingColorSpace) {
      return Xe.fromWorkingColorSpace(pt.copy(this), t), e.r = pt.r, e.g = pt.g, e.b = pt.b, e;
    }
    getStyle(e = Ct) {
      Xe.fromWorkingColorSpace(pt.copy(this), e);
      let t = pt.r, n = pt.g, s = pt.b;
      return e !== Ct ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(s * 255)})`;
    }
    offsetHSL(e, t, n) {
      return this.getHSL(hn), this.setHSL(hn.h + e, hn.s + t, hn.l + n);
    }
    add(e) {
      return this.r += e.r, this.g += e.g, this.b += e.b, this;
    }
    addColors(e, t) {
      return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
    }
    addScalar(e) {
      return this.r += e, this.g += e, this.b += e, this;
    }
    sub(e) {
      return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
    }
    multiply(e) {
      return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
    }
    multiplyScalar(e) {
      return this.r *= e, this.g *= e, this.b *= e, this;
    }
    lerp(e, t) {
      return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
    }
    lerpColors(e, t, n) {
      return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
    }
    lerpHSL(e, t) {
      this.getHSL(hn), e.getHSL(fs);
      let n = Br(hn.h, fs.h, t), s = Br(hn.s, fs.s, t), r = Br(hn.l, fs.l, t);
      return this.setHSL(n, s, r), this;
    }
    setFromVector3(e) {
      return this.r = e.x, this.g = e.y, this.b = e.z, this;
    }
    applyMatrix3(e) {
      let t = this.r, n = this.g, s = this.b, r = e.elements;
      return this.r = r[0] * t + r[3] * n + r[6] * s, this.g = r[1] * t + r[4] * n + r[7] * s, this.b = r[2] * t + r[5] * n + r[8] * s, this;
    }
    equals(e) {
      return e.r === this.r && e.g === this.g && e.b === this.b;
    }
    fromArray(e, t = 0) {
      return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
    }
    fromBufferAttribute(e, t) {
      return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
    }
    toJSON() {
      return this.getHex();
    }
    *[Symbol.iterator]() {
      yield this.r, yield this.g, yield this.b;
    }
  }, pt = /* @__PURE__ */ new Ne();
  Ne.NAMES = Rc;
  var Cu = 0, Dn = class extends gn {
    constructor() {
      super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Cu++ }), this.uuid = Bi(), this.name = "", this.type = "Material", this.blending = li, this.side = mn, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = ha, this.blendDst = ua, this.blendEquation = Tn, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Ne(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Ds, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = yl, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Vn, this.stencilZFail = Vn, this.stencilZPass = Vn, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
    }
    get alphaTest() {
      return this._alphaTest;
    }
    set alphaTest(e) {
      this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
    }
    onBeforeCompile() {
    }
    customProgramCacheKey() {
      return this.onBeforeCompile.toString();
    }
    setValues(e) {
      if (e !== void 0)
        for (let t in e) {
          let n = e[t];
          if (n === void 0) {
            console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
            continue;
          }
          let s = this[t];
          if (s === void 0) {
            console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
            continue;
          }
          s && s.isColor ? s.set(n) : s && s.isVector3 && n && n.isVector3 ? s.copy(n) : this[t] = n;
        }
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == "string";
      t && (e = {
        textures: {},
        images: {}
      });
      let n = {
        metadata: {
          version: 4.6,
          type: "Material",
          generator: "Material.toJSON"
        }
      };
      n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== li && (n.blending = this.blending), this.side !== mn && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== ha && (n.blendSrc = this.blendSrc), this.blendDst !== ua && (n.blendDst = this.blendDst), this.blendEquation !== Tn && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Ds && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== yl && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Vn && (n.stencilFail = this.stencilFail), this.stencilZFail !== Vn && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Vn && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
      function s(r) {
        let a = [];
        for (let o in r) {
          let l = r[o];
          delete l.metadata, a.push(l);
        }
        return a;
      }
      if (t) {
        let r = s(e.textures), a = s(e.images);
        r.length > 0 && (n.textures = r), a.length > 0 && (n.images = a);
      }
      return n;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
      let t = e.clippingPlanes, n = null;
      if (t !== null) {
        let s = t.length;
        n = new Array(s);
        for (let r = 0; r !== s; ++r)
          n[r] = t[r].clone();
      }
      return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
    onBuild() {
      console.warn("Material: onBuild() has been removed.");
    }
    onBeforeRender() {
      console.warn("Material: onBeforeRender() has been removed.");
    }
  }, Gs = class extends Dn {
    constructor(e) {
      super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Ne(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Vt(), this.combine = yo, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
    }
  };
  var rt = /* @__PURE__ */ new D(), ps = /* @__PURE__ */ new ke(), It = class {
    constructor(e, t, n = !1) {
      if (Array.isArray(e))
        throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
      this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = Ml, this._updateRange = { offset: 0, count: -1 }, this.updateRanges = [], this.gpuType = jt, this.version = 0;
    }
    onUploadCallback() {
    }
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
    get updateRange() {
      return Ci("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."), this._updateRange;
    }
    setUsage(e) {
      return this.usage = e, this;
    }
    addUpdateRange(e, t) {
      this.updateRanges.push({ start: e, count: t });
    }
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    copy(e) {
      return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
    }
    copyAt(e, t, n) {
      e *= this.itemSize, n *= t.itemSize;
      for (let s = 0, r = this.itemSize; s < r; s++)
        this.array[e + s] = t.array[n + s];
      return this;
    }
    copyArray(e) {
      return this.array.set(e), this;
    }
    applyMatrix3(e) {
      if (this.itemSize === 2)
        for (let t = 0, n = this.count; t < n; t++)
          ps.fromBufferAttribute(this, t), ps.applyMatrix3(e), this.setXY(t, ps.x, ps.y);
      else if (this.itemSize === 3)
        for (let t = 0, n = this.count; t < n; t++)
          rt.fromBufferAttribute(this, t), rt.applyMatrix3(e), this.setXYZ(t, rt.x, rt.y, rt.z);
      return this;
    }
    applyMatrix4(e) {
      for (let t = 0, n = this.count; t < n; t++)
        rt.fromBufferAttribute(this, t), rt.applyMatrix4(e), this.setXYZ(t, rt.x, rt.y, rt.z);
      return this;
    }
    applyNormalMatrix(e) {
      for (let t = 0, n = this.count; t < n; t++)
        rt.fromBufferAttribute(this, t), rt.applyNormalMatrix(e), this.setXYZ(t, rt.x, rt.y, rt.z);
      return this;
    }
    transformDirection(e) {
      for (let t = 0, n = this.count; t < n; t++)
        rt.fromBufferAttribute(this, t), rt.transformDirection(e), this.setXYZ(t, rt.x, rt.y, rt.z);
      return this;
    }
    set(e, t = 0) {
      return this.array.set(e, t), this;
    }
    getComponent(e, t) {
      let n = this.array[e * this.itemSize + t];
      return this.normalized && (n = Si(n, this.array)), n;
    }
    setComponent(e, t, n) {
      return this.normalized && (n = _t(n, this.array)), this.array[e * this.itemSize + t] = n, this;
    }
    getX(e) {
      let t = this.array[e * this.itemSize];
      return this.normalized && (t = Si(t, this.array)), t;
    }
    setX(e, t) {
      return this.normalized && (t = _t(t, this.array)), this.array[e * this.itemSize] = t, this;
    }
    getY(e) {
      let t = this.array[e * this.itemSize + 1];
      return this.normalized && (t = Si(t, this.array)), t;
    }
    setY(e, t) {
      return this.normalized && (t = _t(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
    }
    getZ(e) {
      let t = this.array[e * this.itemSize + 2];
      return this.normalized && (t = Si(t, this.array)), t;
    }
    setZ(e, t) {
      return this.normalized && (t = _t(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
    }
    getW(e) {
      let t = this.array[e * this.itemSize + 3];
      return this.normalized && (t = Si(t, this.array)), t;
    }
    setW(e, t) {
      return this.normalized && (t = _t(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
    }
    setXY(e, t, n) {
      return e *= this.itemSize, this.normalized && (t = _t(t, this.array), n = _t(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
    }
    setXYZ(e, t, n, s) {
      return e *= this.itemSize, this.normalized && (t = _t(t, this.array), n = _t(n, this.array), s = _t(s, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = s, this;
    }
    setXYZW(e, t, n, s, r) {
      return e *= this.itemSize, this.normalized && (t = _t(t, this.array), n = _t(n, this.array), s = _t(s, this.array), r = _t(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = s, this.array[e + 3] = r, this;
    }
    onUpload(e) {
      return this.onUploadCallback = e, this;
    }
    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }
    toJSON() {
      let e = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized
      };
      return this.name !== "" && (e.name = this.name), this.usage !== Ml && (e.usage = this.usage), e;
    }
  };
  var Ws = class extends It {
    constructor(e, t, n) {
      super(new Uint16Array(e), t, n);
    }
  };
  var Xs = class extends It {
    constructor(e, t, n) {
      super(new Uint32Array(e), t, n);
    }
  };
  var tn = class extends It {
    constructor(e, t, n) {
      super(new Float32Array(e), t, n);
    }
  }, Pu = 0, Rt = /* @__PURE__ */ new at(), ea = /* @__PURE__ */ new yt(), Qn = /* @__PURE__ */ new D(), Et = /* @__PURE__ */ new Ln(), Ti = /* @__PURE__ */ new Ln(), ht = /* @__PURE__ */ new D(), Un = class i extends gn {
    constructor() {
      super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Pu++ }), this.uuid = Bi(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
    }
    getIndex() {
      return this.index;
    }
    setIndex(e) {
      return Array.isArray(e) ? this.index = new (Tc(e) ? Xs : Ws)(e, 1) : this.index = e, this;
    }
    getAttribute(e) {
      return this.attributes[e];
    }
    setAttribute(e, t) {
      return this.attributes[e] = t, this;
    }
    deleteAttribute(e) {
      return delete this.attributes[e], this;
    }
    hasAttribute(e) {
      return this.attributes[e] !== void 0;
    }
    addGroup(e, t, n = 0) {
      this.groups.push({
        start: e,
        count: t,
        materialIndex: n
      });
    }
    clearGroups() {
      this.groups = [];
    }
    setDrawRange(e, t) {
      this.drawRange.start = e, this.drawRange.count = t;
    }
    applyMatrix4(e) {
      let t = this.attributes.position;
      t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
      let n = this.attributes.normal;
      if (n !== void 0) {
        let r = new Ie().getNormalMatrix(e);
        n.applyNormalMatrix(r), n.needsUpdate = !0;
      }
      let s = this.attributes.tangent;
      return s !== void 0 && (s.transformDirection(e), s.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
    }
    applyQuaternion(e) {
      return Rt.makeRotationFromQuaternion(e), this.applyMatrix4(Rt), this;
    }
    rotateX(e) {
      return Rt.makeRotationX(e), this.applyMatrix4(Rt), this;
    }
    rotateY(e) {
      return Rt.makeRotationY(e), this.applyMatrix4(Rt), this;
    }
    rotateZ(e) {
      return Rt.makeRotationZ(e), this.applyMatrix4(Rt), this;
    }
    translate(e, t, n) {
      return Rt.makeTranslation(e, t, n), this.applyMatrix4(Rt), this;
    }
    scale(e, t, n) {
      return Rt.makeScale(e, t, n), this.applyMatrix4(Rt), this;
    }
    lookAt(e) {
      return ea.lookAt(e), ea.updateMatrix(), this.applyMatrix4(ea.matrix), this;
    }
    center() {
      return this.computeBoundingBox(), this.boundingBox.getCenter(Qn).negate(), this.translate(Qn.x, Qn.y, Qn.z), this;
    }
    setFromPoints(e) {
      let t = [];
      for (let n = 0, s = e.length; n < s; n++) {
        let r = e[n];
        t.push(r.x, r.y, r.z || 0);
      }
      return this.setAttribute("position", new tn(t, 3)), this;
    }
    computeBoundingBox() {
      this.boundingBox === null && (this.boundingBox = new Ln());
      let e = this.attributes.position, t = this.morphAttributes.position;
      if (e && e.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
          new D(-1 / 0, -1 / 0, -1 / 0),
          new D(1 / 0, 1 / 0, 1 / 0)
        );
        return;
      }
      if (e !== void 0) {
        if (this.boundingBox.setFromBufferAttribute(e), t)
          for (let n = 0, s = t.length; n < s; n++) {
            let r = t[n];
            Et.setFromBufferAttribute(r), this.morphTargetsRelative ? (ht.addVectors(this.boundingBox.min, Et.min), this.boundingBox.expandByPoint(ht), ht.addVectors(this.boundingBox.max, Et.max), this.boundingBox.expandByPoint(ht)) : (this.boundingBox.expandByPoint(Et.min), this.boundingBox.expandByPoint(Et.max));
          }
      } else
        this.boundingBox.makeEmpty();
      (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
    }
    computeBoundingSphere() {
      this.boundingSphere === null && (this.boundingSphere = new Li());
      let e = this.attributes.position, t = this.morphAttributes.position;
      if (e && e.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new D(), 1 / 0);
        return;
      }
      if (e) {
        let n = this.boundingSphere.center;
        if (Et.setFromBufferAttribute(e), t)
          for (let r = 0, a = t.length; r < a; r++) {
            let o = t[r];
            Ti.setFromBufferAttribute(o), this.morphTargetsRelative ? (ht.addVectors(Et.min, Ti.min), Et.expandByPoint(ht), ht.addVectors(Et.max, Ti.max), Et.expandByPoint(ht)) : (Et.expandByPoint(Ti.min), Et.expandByPoint(Ti.max));
          }
        Et.getCenter(n);
        let s = 0;
        for (let r = 0, a = e.count; r < a; r++)
          ht.fromBufferAttribute(e, r), s = Math.max(s, n.distanceToSquared(ht));
        if (t)
          for (let r = 0, a = t.length; r < a; r++) {
            let o = t[r], l = this.morphTargetsRelative;
            for (let c = 0, h = o.count; c < h; c++)
              ht.fromBufferAttribute(o, c), l && (Qn.fromBufferAttribute(e, c), ht.add(Qn)), s = Math.max(s, n.distanceToSquared(ht));
          }
        this.boundingSphere.radius = Math.sqrt(s), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
      }
    }
    computeTangents() {
      let e = this.index, t = this.attributes;
      if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
        console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
        return;
      }
      let n = t.position, s = t.normal, r = t.uv;
      this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new It(new Float32Array(4 * n.count), 4));
      let a = this.getAttribute("tangent"), o = [], l = [];
      for (let B = 0; B < n.count; B++)
        o[B] = new D(), l[B] = new D();
      let c = new D(), h = new D(), f = new D(), d = new ke(), m = new ke(), _ = new ke(), y = new D(), p = new D();
      function u(B, M, v) {
        c.fromBufferAttribute(n, B), h.fromBufferAttribute(n, M), f.fromBufferAttribute(n, v), d.fromBufferAttribute(r, B), m.fromBufferAttribute(r, M), _.fromBufferAttribute(r, v), h.sub(c), f.sub(c), m.sub(d), _.sub(d);
        let P = 1 / (m.x * _.y - _.x * m.y);
        isFinite(P) && (y.copy(h).multiplyScalar(_.y).addScaledVector(f, -m.y).multiplyScalar(P), p.copy(f).multiplyScalar(m.x).addScaledVector(h, -_.x).multiplyScalar(P), o[B].add(y), o[M].add(y), o[v].add(y), l[B].add(p), l[M].add(p), l[v].add(p));
      }
      let w = this.groups;
      w.length === 0 && (w = [{
        start: 0,
        count: e.count
      }]);
      for (let B = 0, M = w.length; B < M; ++B) {
        let v = w[B], P = v.start, W = v.count;
        for (let z = P, G = P + W; z < G; z += 3)
          u(
            e.getX(z + 0),
            e.getX(z + 1),
            e.getX(z + 2)
          );
      }
      let S = new D(), E = new D(), O = new D(), T = new D();
      function R(B) {
        O.fromBufferAttribute(s, B), T.copy(O);
        let M = o[B];
        S.copy(M), S.sub(O.multiplyScalar(O.dot(M))).normalize(), E.crossVectors(T, M);
        let P = E.dot(l[B]) < 0 ? -1 : 1;
        a.setXYZW(B, S.x, S.y, S.z, P);
      }
      for (let B = 0, M = w.length; B < M; ++B) {
        let v = w[B], P = v.start, W = v.count;
        for (let z = P, G = P + W; z < G; z += 3)
          R(e.getX(z + 0)), R(e.getX(z + 1)), R(e.getX(z + 2));
      }
    }
    computeVertexNormals() {
      let e = this.index, t = this.getAttribute("position");
      if (t !== void 0) {
        let n = this.getAttribute("normal");
        if (n === void 0)
          n = new It(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
        else
          for (let d = 0, m = n.count; d < m; d++)
            n.setXYZ(d, 0, 0, 0);
        let s = new D(), r = new D(), a = new D(), o = new D(), l = new D(), c = new D(), h = new D(), f = new D();
        if (e)
          for (let d = 0, m = e.count; d < m; d += 3) {
            let _ = e.getX(d + 0), y = e.getX(d + 1), p = e.getX(d + 2);
            s.fromBufferAttribute(t, _), r.fromBufferAttribute(t, y), a.fromBufferAttribute(t, p), h.subVectors(a, r), f.subVectors(s, r), h.cross(f), o.fromBufferAttribute(n, _), l.fromBufferAttribute(n, y), c.fromBufferAttribute(n, p), o.add(h), l.add(h), c.add(h), n.setXYZ(_, o.x, o.y, o.z), n.setXYZ(y, l.x, l.y, l.z), n.setXYZ(p, c.x, c.y, c.z);
          }
        else
          for (let d = 0, m = t.count; d < m; d += 3)
            s.fromBufferAttribute(t, d + 0), r.fromBufferAttribute(t, d + 1), a.fromBufferAttribute(t, d + 2), h.subVectors(a, r), f.subVectors(s, r), h.cross(f), n.setXYZ(d + 0, h.x, h.y, h.z), n.setXYZ(d + 1, h.x, h.y, h.z), n.setXYZ(d + 2, h.x, h.y, h.z);
        this.normalizeNormals(), n.needsUpdate = !0;
      }
    }
    normalizeNormals() {
      let e = this.attributes.normal;
      for (let t = 0, n = e.count; t < n; t++)
        ht.fromBufferAttribute(e, t), ht.normalize(), e.setXYZ(t, ht.x, ht.y, ht.z);
    }
    toNonIndexed() {
      function e(o, l) {
        let c = o.array, h = o.itemSize, f = o.normalized, d = new c.constructor(l.length * h), m = 0, _ = 0;
        for (let y = 0, p = l.length; y < p; y++) {
          o.isInterleavedBufferAttribute ? m = l[y] * o.data.stride + o.offset : m = l[y] * h;
          for (let u = 0; u < h; u++)
            d[_++] = c[m++];
        }
        return new It(d, h, f);
      }
      if (this.index === null)
        return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
      let t = new i(), n = this.index.array, s = this.attributes;
      for (let o in s) {
        let l = s[o], c = e(l, n);
        t.setAttribute(o, c);
      }
      let r = this.morphAttributes;
      for (let o in r) {
        let l = [], c = r[o];
        for (let h = 0, f = c.length; h < f; h++) {
          let d = c[h], m = e(d, n);
          l.push(m);
        }
        t.morphAttributes[o] = l;
      }
      t.morphTargetsRelative = this.morphTargetsRelative;
      let a = this.groups;
      for (let o = 0, l = a.length; o < l; o++) {
        let c = a[o];
        t.addGroup(c.start, c.count, c.materialIndex);
      }
      return t;
    }
    toJSON() {
      let e = {
        metadata: {
          version: 4.6,
          type: "BufferGeometry",
          generator: "BufferGeometry.toJSON"
        }
      };
      if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
        let l = this.parameters;
        for (let c in l)
          l[c] !== void 0 && (e[c] = l[c]);
        return e;
      }
      e.data = { attributes: {} };
      let t = this.index;
      t !== null && (e.data.index = {
        type: t.array.constructor.name,
        array: Array.prototype.slice.call(t.array)
      });
      let n = this.attributes;
      for (let l in n) {
        let c = n[l];
        e.data.attributes[l] = c.toJSON(e.data);
      }
      let s = {}, r = !1;
      for (let l in this.morphAttributes) {
        let c = this.morphAttributes[l], h = [];
        for (let f = 0, d = c.length; f < d; f++) {
          let m = c[f];
          h.push(m.toJSON(e.data));
        }
        h.length > 0 && (s[l] = h, r = !0);
      }
      r && (e.data.morphAttributes = s, e.data.morphTargetsRelative = this.morphTargetsRelative);
      let a = this.groups;
      a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
      let o = this.boundingSphere;
      return o !== null && (e.data.boundingSphere = {
        center: o.center.toArray(),
        radius: o.radius
      }), e;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
      let t = {};
      this.name = e.name;
      let n = e.index;
      n !== null && this.setIndex(n.clone(t));
      let s = e.attributes;
      for (let c in s) {
        let h = s[c];
        this.setAttribute(c, h.clone(t));
      }
      let r = e.morphAttributes;
      for (let c in r) {
        let h = [], f = r[c];
        for (let d = 0, m = f.length; d < m; d++)
          h.push(f[d].clone(t));
        this.morphAttributes[c] = h;
      }
      this.morphTargetsRelative = e.morphTargetsRelative;
      let a = e.groups;
      for (let c = 0, h = a.length; c < h; c++) {
        let f = a[c];
        this.addGroup(f.start, f.count, f.materialIndex);
      }
      let o = e.boundingBox;
      o !== null && (this.boundingBox = o.clone());
      let l = e.boundingSphere;
      return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }, Nl = /* @__PURE__ */ new at(), Sn = /* @__PURE__ */ new Di(), ms = /* @__PURE__ */ new Li(), Fl = /* @__PURE__ */ new D(), jn = /* @__PURE__ */ new D(), ei = /* @__PURE__ */ new D(), ti = /* @__PURE__ */ new D(), ta = /* @__PURE__ */ new D(), gs = /* @__PURE__ */ new D(), _s = /* @__PURE__ */ new ke(), xs = /* @__PURE__ */ new ke(), vs = /* @__PURE__ */ new ke(), Ol = /* @__PURE__ */ new D(), Bl = /* @__PURE__ */ new D(), zl = /* @__PURE__ */ new D(), ys = /* @__PURE__ */ new D(), Ms = /* @__PURE__ */ new D(), wt = class extends yt {
    constructor(e = new Un(), t = new Gs()) {
      super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.updateMorphTargets();
    }
    copy(e, t) {
      return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
    }
    updateMorphTargets() {
      let t = this.geometry.morphAttributes, n = Object.keys(t);
      if (n.length > 0) {
        let s = t[n[0]];
        if (s !== void 0) {
          this.morphTargetInfluences = [], this.morphTargetDictionary = {};
          for (let r = 0, a = s.length; r < a; r++) {
            let o = s[r].name || String(r);
            this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r;
          }
        }
      }
    }
    getVertexPosition(e, t) {
      let n = this.geometry, s = n.attributes.position, r = n.morphAttributes.position, a = n.morphTargetsRelative;
      t.fromBufferAttribute(s, e);
      let o = this.morphTargetInfluences;
      if (r && o) {
        gs.set(0, 0, 0);
        for (let l = 0, c = r.length; l < c; l++) {
          let h = o[l], f = r[l];
          h !== 0 && (ta.fromBufferAttribute(f, e), a ? gs.addScaledVector(ta, h) : gs.addScaledVector(ta.sub(t), h));
        }
        t.add(gs);
      }
      return t;
    }
    raycast(e, t) {
      let n = this.geometry, s = this.material, r = this.matrixWorld;
      s !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), ms.copy(n.boundingSphere), ms.applyMatrix4(r), Sn.copy(e.ray).recast(e.near), !(ms.containsPoint(Sn.origin) === !1 && (Sn.intersectSphere(ms, Fl) === null || Sn.origin.distanceToSquared(Fl) > (e.far - e.near) ** 2)) && (Nl.copy(r).invert(), Sn.copy(e.ray).applyMatrix4(Nl), !(n.boundingBox !== null && Sn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, Sn)));
    }
    _computeIntersections(e, t, n) {
      let s, r = this.geometry, a = this.material, o = r.index, l = r.attributes.position, c = r.attributes.uv, h = r.attributes.uv1, f = r.attributes.normal, d = r.groups, m = r.drawRange;
      if (o !== null)
        if (Array.isArray(a))
          for (let _ = 0, y = d.length; _ < y; _++) {
            let p = d[_], u = a[p.materialIndex], w = Math.max(p.start, m.start), S = Math.min(o.count, Math.min(p.start + p.count, m.start + m.count));
            for (let E = w, O = S; E < O; E += 3) {
              let T = o.getX(E), R = o.getX(E + 1), B = o.getX(E + 2);
              s = Ss(this, u, e, n, c, h, f, T, R, B), s && (s.faceIndex = Math.floor(E / 3), s.face.materialIndex = p.materialIndex, t.push(s));
            }
          }
        else {
          let _ = Math.max(0, m.start), y = Math.min(o.count, m.start + m.count);
          for (let p = _, u = y; p < u; p += 3) {
            let w = o.getX(p), S = o.getX(p + 1), E = o.getX(p + 2);
            s = Ss(this, a, e, n, c, h, f, w, S, E), s && (s.faceIndex = Math.floor(p / 3), t.push(s));
          }
        }
      else if (l !== void 0)
        if (Array.isArray(a))
          for (let _ = 0, y = d.length; _ < y; _++) {
            let p = d[_], u = a[p.materialIndex], w = Math.max(p.start, m.start), S = Math.min(l.count, Math.min(p.start + p.count, m.start + m.count));
            for (let E = w, O = S; E < O; E += 3) {
              let T = E, R = E + 1, B = E + 2;
              s = Ss(this, u, e, n, c, h, f, T, R, B), s && (s.faceIndex = Math.floor(E / 3), s.face.materialIndex = p.materialIndex, t.push(s));
            }
          }
        else {
          let _ = Math.max(0, m.start), y = Math.min(l.count, m.start + m.count);
          for (let p = _, u = y; p < u; p += 3) {
            let w = p, S = p + 1, E = p + 2;
            s = Ss(this, a, e, n, c, h, f, w, S, E), s && (s.faceIndex = Math.floor(p / 3), t.push(s));
          }
        }
    }
  };
  function Iu(i, e, t, n, s, r, a, o) {
    let l;
    if (e.side === vt ? l = n.intersectTriangle(a, r, s, !0, o) : l = n.intersectTriangle(s, r, a, e.side === mn, o), l === null) return null;
    Ms.copy(o), Ms.applyMatrix4(i.matrixWorld);
    let c = t.ray.origin.distanceTo(Ms);
    return c < t.near || c > t.far ? null : {
      distance: c,
      point: Ms.clone(),
      object: i
    };
  }
  function Ss(i, e, t, n, s, r, a, o, l, c) {
    i.getVertexPosition(o, jn), i.getVertexPosition(l, ei), i.getVertexPosition(c, ti);
    let h = Iu(i, e, t, n, jn, ei, ti, ys);
    if (h) {
      s && (_s.fromBufferAttribute(s, o), xs.fromBufferAttribute(s, l), vs.fromBufferAttribute(s, c), h.uv = ri.getInterpolation(ys, jn, ei, ti, _s, xs, vs, new ke())), r && (_s.fromBufferAttribute(r, o), xs.fromBufferAttribute(r, l), vs.fromBufferAttribute(r, c), h.uv1 = ri.getInterpolation(ys, jn, ei, ti, _s, xs, vs, new ke())), a && (Ol.fromBufferAttribute(a, o), Bl.fromBufferAttribute(a, l), zl.fromBufferAttribute(a, c), h.normal = ri.getInterpolation(ys, jn, ei, ti, Ol, Bl, zl, new D()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
      let f = {
        a: o,
        b: l,
        c,
        normal: new D(),
        materialIndex: 0
      };
      ri.getNormal(jn, ei, ti, f.normal), h.face = f;
    }
    return h;
  }
  var Ui = class i extends Un {
    constructor(e = 1, t = 1, n = 1, s = 1, r = 1, a = 1) {
      super(), this.type = "BoxGeometry", this.parameters = {
        width: e,
        height: t,
        depth: n,
        widthSegments: s,
        heightSegments: r,
        depthSegments: a
      };
      let o = this;
      s = Math.floor(s), r = Math.floor(r), a = Math.floor(a);
      let l = [], c = [], h = [], f = [], d = 0, m = 0;
      _("z", "y", "x", -1, -1, n, t, e, a, r, 0), _("z", "y", "x", 1, -1, n, t, -e, a, r, 1), _("x", "z", "y", 1, 1, e, n, t, s, a, 2), _("x", "z", "y", 1, -1, e, n, -t, s, a, 3), _("x", "y", "z", 1, -1, e, t, n, s, r, 4), _("x", "y", "z", -1, -1, e, t, -n, s, r, 5), this.setIndex(l), this.setAttribute("position", new tn(c, 3)), this.setAttribute("normal", new tn(h, 3)), this.setAttribute("uv", new tn(f, 2));
      function _(y, p, u, w, S, E, O, T, R, B, M) {
        let v = E / R, P = O / B, W = E / 2, z = O / 2, G = T / 2, Z = R + 1, H = B + 1, K = 0, k = 0, ae = new D();
        for (let he = 0; he < H; he++) {
          let me = he * P - z;
          for (let Fe = 0; Fe < Z; Fe++) {
            let Ye = Fe * v - W;
            ae[y] = Ye * w, ae[p] = me * S, ae[u] = G, c.push(ae.x, ae.y, ae.z), ae[y] = 0, ae[p] = 0, ae[u] = T > 0 ? 1 : -1, h.push(ae.x, ae.y, ae.z), f.push(Fe / R), f.push(1 - he / B), K += 1;
          }
        }
        for (let he = 0; he < B; he++)
          for (let me = 0; me < R; me++) {
            let Fe = d + me + Z * he, Ye = d + me + Z * (he + 1), V = d + (me + 1) + Z * (he + 1), Q = d + (me + 1) + Z * he;
            l.push(Fe, Ye, Q), l.push(Ye, V, Q), k += 6;
          }
        o.addGroup(m, k, M), m += k, d += K;
      }
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
    }
  };
  function gi(i) {
    let e = {};
    for (let t in i) {
      e[t] = {};
      for (let n in i[t]) {
        let s = i[t][n];
        s && (s.isColor || s.isMatrix3 || s.isMatrix4 || s.isVector2 || s.isVector3 || s.isVector4 || s.isTexture || s.isQuaternion) ? s.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[t][n] = null) : e[t][n] = s.clone() : Array.isArray(s) ? e[t][n] = s.slice() : e[t][n] = s;
      }
    }
    return e;
  }
  function mt(i) {
    let e = {};
    for (let t = 0; t < i.length; t++) {
      let n = gi(i[t]);
      for (let s in n)
        e[s] = n[s];
    }
    return e;
  }
  function Lu(i) {
    let e = [];
    for (let t = 0; t < i.length; t++)
      e.push(i[t].clone());
    return e;
  }
  function Cc(i) {
    let e = i.getRenderTarget();
    return e === null ? i.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : Xe.workingColorSpace;
  }
  var Du = { clone: gi, merge: mt }, Uu = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Nu = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`, Gt = class extends Dn {
    constructor(e) {
      super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Uu, this.fragmentShader = Nu, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
        clipCullDistance: !1,
        // set to use vertex shader clipping
        multiDraw: !1
        // set to use vertex shader multi_draw / enable gl_DrawID
      }, this.defaultAttributeValues = {
        color: [1, 1, 1],
        uv: [0, 0],
        uv1: [0, 0]
      }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = gi(e.uniforms), this.uniformsGroups = Lu(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
    }
    toJSON(e) {
      let t = super.toJSON(e);
      t.glslVersion = this.glslVersion, t.uniforms = {};
      for (let s in this.uniforms) {
        let a = this.uniforms[s].value;
        a && a.isTexture ? t.uniforms[s] = {
          type: "t",
          value: a.toJSON(e).uuid
        } : a && a.isColor ? t.uniforms[s] = {
          type: "c",
          value: a.getHex()
        } : a && a.isVector2 ? t.uniforms[s] = {
          type: "v2",
          value: a.toArray()
        } : a && a.isVector3 ? t.uniforms[s] = {
          type: "v3",
          value: a.toArray()
        } : a && a.isVector4 ? t.uniforms[s] = {
          type: "v4",
          value: a.toArray()
        } : a && a.isMatrix3 ? t.uniforms[s] = {
          type: "m3",
          value: a.toArray()
        } : a && a.isMatrix4 ? t.uniforms[s] = {
          type: "m4",
          value: a.toArray()
        } : t.uniforms[s] = {
          value: a
        };
      }
      Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
      let n = {};
      for (let s in this.extensions)
        this.extensions[s] === !0 && (n[s] = !0);
      return Object.keys(n).length > 0 && (t.extensions = n), t;
    }
  }, qs = class extends yt {
    constructor() {
      super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new at(), this.projectionMatrix = new at(), this.projectionMatrixInverse = new at(), this.coordinateSystem = en;
    }
    copy(e, t) {
      return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
    }
    getWorldDirection(e) {
      return super.getWorldDirection(e).negate();
    }
    updateMatrixWorld(e) {
      super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    updateWorldMatrix(e, t) {
      super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }, un = /* @__PURE__ */ new D(), kl = /* @__PURE__ */ new ke(), Hl = /* @__PURE__ */ new ke(), gt = class extends qs {
    constructor(e = 50, t = 1, n = 0.1, s = 2e3) {
      super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = s, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
    }
    copy(e, t) {
      return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
    }
    /**
     * Sets the FOV by focal length in respect to the current .filmGauge.
     *
     * The default film gauge is 35, so that the focal length can be specified for
     * a 35mm (full frame) camera.
     *
     * Values for focal length and film gauge must have the same unit.
     */
    setFocalLength(e) {
      let t = 0.5 * this.getFilmHeight() / e;
      this.fov = Ga * 2 * Math.atan(t), this.updateProjectionMatrix();
    }
    /**
     * Calculates the focal length from the current .fov and .filmGauge.
     */
    getFocalLength() {
      let e = Math.tan(Or * 0.5 * this.fov);
      return 0.5 * this.getFilmHeight() / e;
    }
    getEffectiveFOV() {
      return Ga * 2 * Math.atan(
        Math.tan(Or * 0.5 * this.fov) / this.zoom
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
    getViewBounds(e, t, n) {
      un.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(un.x, un.y).multiplyScalar(-e / un.z), un.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(un.x, un.y).multiplyScalar(-e / un.z);
    }
    /**
     * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
     * Copies the result into the target Vector2, where x is width and y is height.
     */
    getViewSize(e, t) {
      return this.getViewBounds(e, kl, Hl), t.subVectors(Hl, kl);
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
    setViewOffset(e, t, n, s, r, a) {
      this.aspect = e / t, this.view === null && (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = a, this.updateProjectionMatrix();
    }
    clearViewOffset() {
      this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      let e = this.near, t = e * Math.tan(Or * 0.5 * this.fov) / this.zoom, n = 2 * t, s = this.aspect * n, r = -0.5 * s, a = this.view;
      if (this.view !== null && this.view.enabled) {
        let l = a.fullWidth, c = a.fullHeight;
        r += a.offsetX * s / l, t -= a.offsetY * n / c, s *= a.width / l, n *= a.height / c;
      }
      let o = this.filmOffset;
      o !== 0 && (r += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + s, t, t - n, e, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
    }
  }, ni = -90, ii = 1, Ya = class extends yt {
    constructor(e, t, n) {
      super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
      let s = new gt(ni, ii, e, t);
      s.layers = this.layers, this.add(s);
      let r = new gt(ni, ii, e, t);
      r.layers = this.layers, this.add(r);
      let a = new gt(ni, ii, e, t);
      a.layers = this.layers, this.add(a);
      let o = new gt(ni, ii, e, t);
      o.layers = this.layers, this.add(o);
      let l = new gt(ni, ii, e, t);
      l.layers = this.layers, this.add(l);
      let c = new gt(ni, ii, e, t);
      c.layers = this.layers, this.add(c);
    }
    updateCoordinateSystem() {
      let e = this.coordinateSystem, t = this.children.concat(), [n, s, r, a, o, l] = t;
      for (let c of t) this.remove(c);
      if (e === en)
        n.up.set(0, 1, 0), n.lookAt(1, 0, 0), s.up.set(0, 1, 0), s.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
      else if (e === Bs)
        n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), s.up.set(0, -1, 0), s.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
      else
        throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
      for (let c of t)
        this.add(c), c.updateMatrixWorld();
    }
    update(e, t) {
      this.parent === null && this.updateMatrixWorld();
      let { renderTarget: n, activeMipmapLevel: s } = this;
      this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
      let [r, a, o, l, c, h] = this.children, f = e.getRenderTarget(), d = e.getActiveCubeFace(), m = e.getActiveMipmapLevel(), _ = e.xr.enabled;
      e.xr.enabled = !1;
      let y = n.texture.generateMipmaps;
      n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, s), e.render(t, r), e.setRenderTarget(n, 1, s), e.render(t, a), e.setRenderTarget(n, 2, s), e.render(t, o), e.setRenderTarget(n, 3, s), e.render(t, l), e.setRenderTarget(n, 4, s), e.render(t, c), n.texture.generateMipmaps = y, e.setRenderTarget(n, 5, s), e.render(t, h), e.setRenderTarget(f, d, m), e.xr.enabled = _, n.texture.needsPMREMUpdate = !0;
    }
  }, Ys = class extends At {
    constructor(e, t, n, s, r, a, o, l, c, h) {
      e = e !== void 0 ? e : [], t = t !== void 0 ? t : di, super(e, t, n, s, r, a, o, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
    }
    get images() {
      return this.image;
    }
    set images(e) {
      this.image = e;
    }
  }, Za = class extends sn {
    constructor(e = 1, t = {}) {
      super(e, e, t), this.isWebGLCubeRenderTarget = !0;
      let n = { width: e, height: e, depth: 1 }, s = [n, n, n, n, n, n];
      this.texture = new Ys(s, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : Ot;
    }
    fromEquirectangularTexture(e, t) {
      this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
      let n = {
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
      }, s = new Ui(5, 5, 5), r = new Gt({
        name: "CubemapFromEquirect",
        uniforms: gi(n.uniforms),
        vertexShader: n.vertexShader,
        fragmentShader: n.fragmentShader,
        side: vt,
        blending: fn
      });
      r.uniforms.tEquirect.value = t;
      let a = new wt(s, r), o = t.minFilter;
      return t.minFilter === Pn && (t.minFilter = Ot), new Ya(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
    }
    clear(e, t, n, s) {
      let r = e.getRenderTarget();
      for (let a = 0; a < 6; a++)
        e.setRenderTarget(this, a), e.clear(t, n, s);
      e.setRenderTarget(r);
    }
  }, na = /* @__PURE__ */ new D(), Fu = /* @__PURE__ */ new D(), Ou = /* @__PURE__ */ new Ie(), Ft = class {
    constructor(e = new D(1, 0, 0), t = 0) {
      this.isPlane = !0, this.normal = e, this.constant = t;
    }
    set(e, t) {
      return this.normal.copy(e), this.constant = t, this;
    }
    setComponents(e, t, n, s) {
      return this.normal.set(e, t, n), this.constant = s, this;
    }
    setFromNormalAndCoplanarPoint(e, t) {
      return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
    }
    setFromCoplanarPoints(e, t, n) {
      let s = na.subVectors(n, t).cross(Fu.subVectors(e, t)).normalize();
      return this.setFromNormalAndCoplanarPoint(s, e), this;
    }
    copy(e) {
      return this.normal.copy(e.normal), this.constant = e.constant, this;
    }
    normalize() {
      let e = 1 / this.normal.length();
      return this.normal.multiplyScalar(e), this.constant *= e, this;
    }
    negate() {
      return this.constant *= -1, this.normal.negate(), this;
    }
    distanceToPoint(e) {
      return this.normal.dot(e) + this.constant;
    }
    distanceToSphere(e) {
      return this.distanceToPoint(e.center) - e.radius;
    }
    projectPoint(e, t) {
      return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
    }
    intersectLine(e, t) {
      let n = e.delta(na), s = this.normal.dot(n);
      if (s === 0)
        return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
      let r = -(e.start.dot(this.normal) + this.constant) / s;
      return r < 0 || r > 1 ? null : t.copy(e.start).addScaledVector(n, r);
    }
    intersectsLine(e) {
      let t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
      return t < 0 && n > 0 || n < 0 && t > 0;
    }
    intersectsBox(e) {
      return e.intersectsPlane(this);
    }
    intersectsSphere(e) {
      return e.intersectsPlane(this);
    }
    coplanarPoint(e) {
      return e.copy(this.normal).multiplyScalar(-this.constant);
    }
    applyMatrix4(e, t) {
      let n = t || Ou.getNormalMatrix(e), s = this.coplanarPoint(na).applyMatrix4(e), r = this.normal.applyMatrix3(n).normalize();
      return this.constant = -s.dot(r), this;
    }
    translate(e) {
      return this.constant -= e.dot(this.normal), this;
    }
    equals(e) {
      return e.normal.equals(this.normal) && e.constant === this.constant;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }, bn = /* @__PURE__ */ new Li(), bs = /* @__PURE__ */ new D(), Ni = class {
    constructor(e = new Ft(), t = new Ft(), n = new Ft(), s = new Ft(), r = new Ft(), a = new Ft()) {
      this.planes = [e, t, n, s, r, a];
    }
    set(e, t, n, s, r, a) {
      let o = this.planes;
      return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(s), o[4].copy(r), o[5].copy(a), this;
    }
    copy(e) {
      let t = this.planes;
      for (let n = 0; n < 6; n++)
        t[n].copy(e.planes[n]);
      return this;
    }
    setFromProjectionMatrix(e, t = en) {
      let n = this.planes, s = e.elements, r = s[0], a = s[1], o = s[2], l = s[3], c = s[4], h = s[5], f = s[6], d = s[7], m = s[8], _ = s[9], y = s[10], p = s[11], u = s[12], w = s[13], S = s[14], E = s[15];
      if (n[0].setComponents(l - r, d - c, p - m, E - u).normalize(), n[1].setComponents(l + r, d + c, p + m, E + u).normalize(), n[2].setComponents(l + a, d + h, p + _, E + w).normalize(), n[3].setComponents(l - a, d - h, p - _, E - w).normalize(), n[4].setComponents(l - o, d - f, p - y, E - S).normalize(), t === en)
        n[5].setComponents(l + o, d + f, p + y, E + S).normalize();
      else if (t === Bs)
        n[5].setComponents(o, f, y, S).normalize();
      else
        throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
      return this;
    }
    intersectsObject(e) {
      if (e.boundingSphere !== void 0)
        e.boundingSphere === null && e.computeBoundingSphere(), bn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
      else {
        let t = e.geometry;
        t.boundingSphere === null && t.computeBoundingSphere(), bn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
      }
      return this.intersectsSphere(bn);
    }
    intersectsSprite(e) {
      return bn.center.set(0, 0, 0), bn.radius = 0.7071067811865476, bn.applyMatrix4(e.matrixWorld), this.intersectsSphere(bn);
    }
    intersectsSphere(e) {
      let t = this.planes, n = e.center, s = -e.radius;
      for (let r = 0; r < 6; r++)
        if (t[r].distanceToPoint(n) < s)
          return !1;
      return !0;
    }
    intersectsBox(e) {
      let t = this.planes;
      for (let n = 0; n < 6; n++) {
        let s = t[n];
        if (bs.x = s.normal.x > 0 ? e.max.x : e.min.x, bs.y = s.normal.y > 0 ? e.max.y : e.min.y, bs.z = s.normal.z > 0 ? e.max.z : e.min.z, s.distanceToPoint(bs) < 0)
          return !1;
      }
      return !0;
    }
    containsPoint(e) {
      let t = this.planes;
      for (let n = 0; n < 6; n++)
        if (t[n].distanceToPoint(e) < 0)
          return !1;
      return !0;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  };
  function Pc() {
    let i = null, e = !1, t = null, n = null;
    function s(r, a) {
      t(r, a), n = i.requestAnimationFrame(s);
    }
    return {
      start: function() {
        e !== !0 && t !== null && (n = i.requestAnimationFrame(s), e = !0);
      },
      stop: function() {
        i.cancelAnimationFrame(n), e = !1;
      },
      setAnimationLoop: function(r) {
        t = r;
      },
      setContext: function(r) {
        i = r;
      }
    };
  }
  function Bu(i) {
    let e = /* @__PURE__ */ new WeakMap();
    function t(o, l) {
      let c = o.array, h = o.usage, f = c.byteLength, d = i.createBuffer();
      i.bindBuffer(l, d), i.bufferData(l, c, h), o.onUploadCallback();
      let m;
      if (c instanceof Float32Array)
        m = i.FLOAT;
      else if (c instanceof Uint16Array)
        o.isFloat16BufferAttribute ? m = i.HALF_FLOAT : m = i.UNSIGNED_SHORT;
      else if (c instanceof Int16Array)
        m = i.SHORT;
      else if (c instanceof Uint32Array)
        m = i.UNSIGNED_INT;
      else if (c instanceof Int32Array)
        m = i.INT;
      else if (c instanceof Int8Array)
        m = i.BYTE;
      else if (c instanceof Uint8Array)
        m = i.UNSIGNED_BYTE;
      else if (c instanceof Uint8ClampedArray)
        m = i.UNSIGNED_BYTE;
      else
        throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
      return {
        buffer: d,
        type: m,
        bytesPerElement: c.BYTES_PER_ELEMENT,
        version: o.version,
        size: f
      };
    }
    function n(o, l, c) {
      let h = l.array, f = l._updateRange, d = l.updateRanges;
      if (i.bindBuffer(c, o), f.count === -1 && d.length === 0 && i.bufferSubData(c, 0, h), d.length !== 0) {
        for (let m = 0, _ = d.length; m < _; m++) {
          let y = d[m];
          i.bufferSubData(
            c,
            y.start * h.BYTES_PER_ELEMENT,
            h,
            y.start,
            y.count
          );
        }
        l.clearUpdateRanges();
      }
      f.count !== -1 && (i.bufferSubData(
        c,
        f.offset * h.BYTES_PER_ELEMENT,
        h,
        f.offset,
        f.count
      ), f.count = -1), l.onUploadCallback();
    }
    function s(o) {
      return o.isInterleavedBufferAttribute && (o = o.data), e.get(o);
    }
    function r(o) {
      o.isInterleavedBufferAttribute && (o = o.data);
      let l = e.get(o);
      l && (i.deleteBuffer(l.buffer), e.delete(o));
    }
    function a(o, l) {
      if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
        let h = e.get(o);
        (!h || h.version < o.version) && e.set(o, {
          buffer: o.buffer,
          type: o.type,
          bytesPerElement: o.elementSize,
          version: o.version
        });
        return;
      }
      let c = e.get(o);
      if (c === void 0)
        e.set(o, t(o, l));
      else if (c.version < o.version) {
        if (c.size !== o.array.byteLength)
          throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
        n(c.buffer, o, l), c.version = o.version;
      }
    }
    return {
      get: s,
      remove: r,
      update: a
    };
  }
  var _i = class i extends Un {
    constructor(e = 1, t = 1, n = 1, s = 1) {
      super(), this.type = "PlaneGeometry", this.parameters = {
        width: e,
        height: t,
        widthSegments: n,
        heightSegments: s
      };
      let r = e / 2, a = t / 2, o = Math.floor(n), l = Math.floor(s), c = o + 1, h = l + 1, f = e / o, d = t / l, m = [], _ = [], y = [], p = [];
      for (let u = 0; u < h; u++) {
        let w = u * d - a;
        for (let S = 0; S < c; S++) {
          let E = S * f - r;
          _.push(E, -w, 0), y.push(0, 0, 1), p.push(S / o), p.push(1 - u / l);
        }
      }
      for (let u = 0; u < l; u++)
        for (let w = 0; w < o; w++) {
          let S = w + c * u, E = w + c * (u + 1), O = w + 1 + c * (u + 1), T = w + 1 + c * u;
          m.push(S, E, T), m.push(E, O, T);
        }
      this.setIndex(m), this.setAttribute("position", new tn(_, 3)), this.setAttribute("normal", new tn(y, 3)), this.setAttribute("uv", new tn(p, 2));
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.width, e.height, e.widthSegments, e.heightSegments);
    }
  }, zu = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, ku = `#ifdef USE_ALPHAHASH
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
#endif`, Hu = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, Vu = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Gu = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, Wu = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, Xu = `#ifdef USE_AOMAP
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
#endif`, qu = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, Yu = `#ifdef USE_BATCHING
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
#endif`, Zu = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, $u = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, Ju = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, Ku = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, Qu = `#ifdef USE_IRIDESCENCE
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
#endif`, ju = `#ifdef USE_BUMPMAP
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
#endif`, ed = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, td = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, nd = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, id = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, sd = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, rd = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, ad = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, od = `#if defined( USE_COLOR_ALPHA )
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
#endif`, ld = `#define PI 3.141592653589793
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
} // validated`, cd = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, hd = `vec3 transformedNormal = objectNormal;
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
#endif`, ud = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, dd = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, fd = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, pd = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, md = "gl_FragColor = linearToOutputTexel( gl_FragColor );", gd = `
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
}`, _d = `#ifdef USE_ENVMAP
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
#endif`, xd = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, vd = `#ifdef USE_ENVMAP
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
#endif`, yd = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Md = `#ifdef USE_ENVMAP
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
#endif`, Sd = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, bd = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Ed = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, wd = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Ad = `#ifdef USE_GRADIENTMAP
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
}`, Td = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Rd = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Cd = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Pd = `uniform bool receiveShadow;
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
#endif`, Id = `#ifdef USE_ENVMAP
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
#endif`, Ld = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, Dd = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Ud = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, Nd = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, Fd = `PhysicalMaterial material;
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
#endif`, Od = `struct PhysicalMaterial {
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
}`, Bd = `
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
#endif`, zd = `#if defined( RE_IndirectDiffuse )
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
#endif`, kd = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Hd = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, Vd = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Gd = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Wd = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, Xd = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, qd = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, Yd = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, Zd = `#if defined( USE_POINTS_UV )
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
#endif`, $d = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, Jd = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, Kd = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, Qd = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, jd = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, ef = `#ifdef USE_MORPHTARGETS
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
#endif`, tf = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, nf = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, sf = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, rf = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, af = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, of = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, lf = `#ifdef USE_NORMALMAP
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
#endif`, cf = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, hf = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, uf = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, df = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, ff = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, pf = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, mf = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, gf = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, _f = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, xf = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, vf = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, yf = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Mf = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Sf = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, bf = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, Ef = `float getShadowMask() {
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
}`, wf = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Af = `#ifdef USE_SKINNING
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
#endif`, Tf = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Rf = `#ifdef USE_SKINNING
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
#endif`, Cf = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Pf = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, If = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Lf = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, Df = `#ifdef USE_TRANSMISSION
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
#endif`, Uf = `#ifdef USE_TRANSMISSION
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
#endif`, Nf = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Ff = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Of = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Bf = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`, zf = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, kf = `uniform sampler2D t2D;
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
}`, Hf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Vf = `#ifdef ENVMAP_TYPE_CUBE
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
}`, Gf = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Wf = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Xf = `#include <common>
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
}`, qf = `#if DEPTH_PACKING == 3200
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
}`, Yf = `#define DISTANCE
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
}`, Zf = `#define DISTANCE
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
}`, $f = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, Jf = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Kf = `uniform float scale;
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
}`, Qf = `uniform vec3 diffuse;
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
}`, jf = `#include <common>
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
}`, ep = `uniform vec3 diffuse;
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
}`, tp = `#define LAMBERT
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
}`, np = `#define LAMBERT
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
}`, ip = `#define MATCAP
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
}`, sp = `#define MATCAP
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
}`, rp = `#define NORMAL
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
}`, ap = `#define NORMAL
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
}`, op = `#define PHONG
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
}`, lp = `#define PHONG
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
}`, cp = `#define STANDARD
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
}`, hp = `#define STANDARD
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
}`, up = `#define TOON
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
}`, dp = `#define TOON
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
}`, fp = `uniform float size;
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
}`, pp = `uniform vec3 diffuse;
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
}`, mp = `#include <common>
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
}`, gp = `uniform vec3 color;
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
}`, _p = `uniform float rotation;
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
}`, xp = `uniform vec3 diffuse;
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
}`, Pe = {
    alphahash_fragment: zu,
    alphahash_pars_fragment: ku,
    alphamap_fragment: Hu,
    alphamap_pars_fragment: Vu,
    alphatest_fragment: Gu,
    alphatest_pars_fragment: Wu,
    aomap_fragment: Xu,
    aomap_pars_fragment: qu,
    batching_pars_vertex: Yu,
    batching_vertex: Zu,
    begin_vertex: $u,
    beginnormal_vertex: Ju,
    bsdfs: Ku,
    iridescence_fragment: Qu,
    bumpmap_pars_fragment: ju,
    clipping_planes_fragment: ed,
    clipping_planes_pars_fragment: td,
    clipping_planes_pars_vertex: nd,
    clipping_planes_vertex: id,
    color_fragment: sd,
    color_pars_fragment: rd,
    color_pars_vertex: ad,
    color_vertex: od,
    common: ld,
    cube_uv_reflection_fragment: cd,
    defaultnormal_vertex: hd,
    displacementmap_pars_vertex: ud,
    displacementmap_vertex: dd,
    emissivemap_fragment: fd,
    emissivemap_pars_fragment: pd,
    colorspace_fragment: md,
    colorspace_pars_fragment: gd,
    envmap_fragment: _d,
    envmap_common_pars_fragment: xd,
    envmap_pars_fragment: vd,
    envmap_pars_vertex: yd,
    envmap_physical_pars_fragment: Id,
    envmap_vertex: Md,
    fog_vertex: Sd,
    fog_pars_vertex: bd,
    fog_fragment: Ed,
    fog_pars_fragment: wd,
    gradientmap_pars_fragment: Ad,
    lightmap_pars_fragment: Td,
    lights_lambert_fragment: Rd,
    lights_lambert_pars_fragment: Cd,
    lights_pars_begin: Pd,
    lights_toon_fragment: Ld,
    lights_toon_pars_fragment: Dd,
    lights_phong_fragment: Ud,
    lights_phong_pars_fragment: Nd,
    lights_physical_fragment: Fd,
    lights_physical_pars_fragment: Od,
    lights_fragment_begin: Bd,
    lights_fragment_maps: zd,
    lights_fragment_end: kd,
    logdepthbuf_fragment: Hd,
    logdepthbuf_pars_fragment: Vd,
    logdepthbuf_pars_vertex: Gd,
    logdepthbuf_vertex: Wd,
    map_fragment: Xd,
    map_pars_fragment: qd,
    map_particle_fragment: Yd,
    map_particle_pars_fragment: Zd,
    metalnessmap_fragment: $d,
    metalnessmap_pars_fragment: Jd,
    morphinstance_vertex: Kd,
    morphcolor_vertex: Qd,
    morphnormal_vertex: jd,
    morphtarget_pars_vertex: ef,
    morphtarget_vertex: tf,
    normal_fragment_begin: nf,
    normal_fragment_maps: sf,
    normal_pars_fragment: rf,
    normal_pars_vertex: af,
    normal_vertex: of,
    normalmap_pars_fragment: lf,
    clearcoat_normal_fragment_begin: cf,
    clearcoat_normal_fragment_maps: hf,
    clearcoat_pars_fragment: uf,
    iridescence_pars_fragment: df,
    opaque_fragment: ff,
    packing: pf,
    premultiplied_alpha_fragment: mf,
    project_vertex: gf,
    dithering_fragment: _f,
    dithering_pars_fragment: xf,
    roughnessmap_fragment: vf,
    roughnessmap_pars_fragment: yf,
    shadowmap_pars_fragment: Mf,
    shadowmap_pars_vertex: Sf,
    shadowmap_vertex: bf,
    shadowmask_pars_fragment: Ef,
    skinbase_vertex: wf,
    skinning_pars_vertex: Af,
    skinning_vertex: Tf,
    skinnormal_vertex: Rf,
    specularmap_fragment: Cf,
    specularmap_pars_fragment: Pf,
    tonemapping_fragment: If,
    tonemapping_pars_fragment: Lf,
    transmission_fragment: Df,
    transmission_pars_fragment: Uf,
    uv_pars_fragment: Nf,
    uv_pars_vertex: Ff,
    uv_vertex: Of,
    worldpos_vertex: Bf,
    background_vert: zf,
    background_frag: kf,
    backgroundCube_vert: Hf,
    backgroundCube_frag: Vf,
    cube_vert: Gf,
    cube_frag: Wf,
    depth_vert: Xf,
    depth_frag: qf,
    distanceRGBA_vert: Yf,
    distanceRGBA_frag: Zf,
    equirect_vert: $f,
    equirect_frag: Jf,
    linedashed_vert: Kf,
    linedashed_frag: Qf,
    meshbasic_vert: jf,
    meshbasic_frag: ep,
    meshlambert_vert: tp,
    meshlambert_frag: np,
    meshmatcap_vert: ip,
    meshmatcap_frag: sp,
    meshnormal_vert: rp,
    meshnormal_frag: ap,
    meshphong_vert: op,
    meshphong_frag: lp,
    meshphysical_vert: cp,
    meshphysical_frag: hp,
    meshtoon_vert: up,
    meshtoon_frag: dp,
    points_vert: fp,
    points_frag: pp,
    shadow_vert: mp,
    shadow_frag: gp,
    sprite_vert: _p,
    sprite_frag: xp
  }, ie = {
    common: {
      diffuse: { value: /* @__PURE__ */ new Ne(16777215) },
      opacity: { value: 1 },
      map: { value: null },
      mapTransform: { value: /* @__PURE__ */ new Ie() },
      alphaMap: { value: null },
      alphaMapTransform: { value: /* @__PURE__ */ new Ie() },
      alphaTest: { value: 0 }
    },
    specularmap: {
      specularMap: { value: null },
      specularMapTransform: { value: /* @__PURE__ */ new Ie() }
    },
    envmap: {
      envMap: { value: null },
      envMapRotation: { value: /* @__PURE__ */ new Ie() },
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
      aoMapTransform: { value: /* @__PURE__ */ new Ie() }
    },
    lightmap: {
      lightMap: { value: null },
      lightMapIntensity: { value: 1 },
      lightMapTransform: { value: /* @__PURE__ */ new Ie() }
    },
    bumpmap: {
      bumpMap: { value: null },
      bumpMapTransform: { value: /* @__PURE__ */ new Ie() },
      bumpScale: { value: 1 }
    },
    normalmap: {
      normalMap: { value: null },
      normalMapTransform: { value: /* @__PURE__ */ new Ie() },
      normalScale: { value: /* @__PURE__ */ new ke(1, 1) }
    },
    displacementmap: {
      displacementMap: { value: null },
      displacementMapTransform: { value: /* @__PURE__ */ new Ie() },
      displacementScale: { value: 1 },
      displacementBias: { value: 0 }
    },
    emissivemap: {
      emissiveMap: { value: null },
      emissiveMapTransform: { value: /* @__PURE__ */ new Ie() }
    },
    metalnessmap: {
      metalnessMap: { value: null },
      metalnessMapTransform: { value: /* @__PURE__ */ new Ie() }
    },
    roughnessmap: {
      roughnessMap: { value: null },
      roughnessMapTransform: { value: /* @__PURE__ */ new Ie() }
    },
    gradientmap: {
      gradientMap: { value: null }
    },
    fog: {
      fogDensity: { value: 25e-5 },
      fogNear: { value: 1 },
      fogFar: { value: 2e3 },
      fogColor: { value: /* @__PURE__ */ new Ne(16777215) }
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
      diffuse: { value: /* @__PURE__ */ new Ne(16777215) },
      opacity: { value: 1 },
      size: { value: 1 },
      scale: { value: 1 },
      map: { value: null },
      alphaMap: { value: null },
      alphaMapTransform: { value: /* @__PURE__ */ new Ie() },
      alphaTest: { value: 0 },
      uvTransform: { value: /* @__PURE__ */ new Ie() }
    },
    sprite: {
      diffuse: { value: /* @__PURE__ */ new Ne(16777215) },
      opacity: { value: 1 },
      center: { value: /* @__PURE__ */ new ke(0.5, 0.5) },
      rotation: { value: 0 },
      map: { value: null },
      mapTransform: { value: /* @__PURE__ */ new Ie() },
      alphaMap: { value: null },
      alphaMapTransform: { value: /* @__PURE__ */ new Ie() },
      alphaTest: { value: 0 }
    }
  }, Ht = {
    basic: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.specularmap,
        ie.envmap,
        ie.aomap,
        ie.lightmap,
        ie.fog
      ]),
      vertexShader: Pe.meshbasic_vert,
      fragmentShader: Pe.meshbasic_frag
    },
    lambert: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.specularmap,
        ie.envmap,
        ie.aomap,
        ie.lightmap,
        ie.emissivemap,
        ie.bumpmap,
        ie.normalmap,
        ie.displacementmap,
        ie.fog,
        ie.lights,
        {
          emissive: { value: /* @__PURE__ */ new Ne(0) }
        }
      ]),
      vertexShader: Pe.meshlambert_vert,
      fragmentShader: Pe.meshlambert_frag
    },
    phong: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.specularmap,
        ie.envmap,
        ie.aomap,
        ie.lightmap,
        ie.emissivemap,
        ie.bumpmap,
        ie.normalmap,
        ie.displacementmap,
        ie.fog,
        ie.lights,
        {
          emissive: { value: /* @__PURE__ */ new Ne(0) },
          specular: { value: /* @__PURE__ */ new Ne(1118481) },
          shininess: { value: 30 }
        }
      ]),
      vertexShader: Pe.meshphong_vert,
      fragmentShader: Pe.meshphong_frag
    },
    standard: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.envmap,
        ie.aomap,
        ie.lightmap,
        ie.emissivemap,
        ie.bumpmap,
        ie.normalmap,
        ie.displacementmap,
        ie.roughnessmap,
        ie.metalnessmap,
        ie.fog,
        ie.lights,
        {
          emissive: { value: /* @__PURE__ */ new Ne(0) },
          roughness: { value: 1 },
          metalness: { value: 0 },
          envMapIntensity: { value: 1 }
        }
      ]),
      vertexShader: Pe.meshphysical_vert,
      fragmentShader: Pe.meshphysical_frag
    },
    toon: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.aomap,
        ie.lightmap,
        ie.emissivemap,
        ie.bumpmap,
        ie.normalmap,
        ie.displacementmap,
        ie.gradientmap,
        ie.fog,
        ie.lights,
        {
          emissive: { value: /* @__PURE__ */ new Ne(0) }
        }
      ]),
      vertexShader: Pe.meshtoon_vert,
      fragmentShader: Pe.meshtoon_frag
    },
    matcap: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.bumpmap,
        ie.normalmap,
        ie.displacementmap,
        ie.fog,
        {
          matcap: { value: null }
        }
      ]),
      vertexShader: Pe.meshmatcap_vert,
      fragmentShader: Pe.meshmatcap_frag
    },
    points: {
      uniforms: /* @__PURE__ */ mt([
        ie.points,
        ie.fog
      ]),
      vertexShader: Pe.points_vert,
      fragmentShader: Pe.points_frag
    },
    dashed: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.fog,
        {
          scale: { value: 1 },
          dashSize: { value: 1 },
          totalSize: { value: 2 }
        }
      ]),
      vertexShader: Pe.linedashed_vert,
      fragmentShader: Pe.linedashed_frag
    },
    depth: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.displacementmap
      ]),
      vertexShader: Pe.depth_vert,
      fragmentShader: Pe.depth_frag
    },
    normal: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.bumpmap,
        ie.normalmap,
        ie.displacementmap,
        {
          opacity: { value: 1 }
        }
      ]),
      vertexShader: Pe.meshnormal_vert,
      fragmentShader: Pe.meshnormal_frag
    },
    sprite: {
      uniforms: /* @__PURE__ */ mt([
        ie.sprite,
        ie.fog
      ]),
      vertexShader: Pe.sprite_vert,
      fragmentShader: Pe.sprite_frag
    },
    background: {
      uniforms: {
        uvTransform: { value: /* @__PURE__ */ new Ie() },
        t2D: { value: null },
        backgroundIntensity: { value: 1 }
      },
      vertexShader: Pe.background_vert,
      fragmentShader: Pe.background_frag
    },
    backgroundCube: {
      uniforms: {
        envMap: { value: null },
        flipEnvMap: { value: -1 },
        backgroundBlurriness: { value: 0 },
        backgroundIntensity: { value: 1 },
        backgroundRotation: { value: /* @__PURE__ */ new Ie() }
      },
      vertexShader: Pe.backgroundCube_vert,
      fragmentShader: Pe.backgroundCube_frag
    },
    cube: {
      uniforms: {
        tCube: { value: null },
        tFlip: { value: -1 },
        opacity: { value: 1 }
      },
      vertexShader: Pe.cube_vert,
      fragmentShader: Pe.cube_frag
    },
    equirect: {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: Pe.equirect_vert,
      fragmentShader: Pe.equirect_frag
    },
    distanceRGBA: {
      uniforms: /* @__PURE__ */ mt([
        ie.common,
        ie.displacementmap,
        {
          referencePosition: { value: /* @__PURE__ */ new D() },
          nearDistance: { value: 1 },
          farDistance: { value: 1e3 }
        }
      ]),
      vertexShader: Pe.distanceRGBA_vert,
      fragmentShader: Pe.distanceRGBA_frag
    },
    shadow: {
      uniforms: /* @__PURE__ */ mt([
        ie.lights,
        ie.fog,
        {
          color: { value: /* @__PURE__ */ new Ne(0) },
          opacity: { value: 1 }
        }
      ]),
      vertexShader: Pe.shadow_vert,
      fragmentShader: Pe.shadow_frag
    }
  };
  Ht.physical = {
    uniforms: /* @__PURE__ */ mt([
      Ht.standard.uniforms,
      {
        clearcoat: { value: 0 },
        clearcoatMap: { value: null },
        clearcoatMapTransform: { value: /* @__PURE__ */ new Ie() },
        clearcoatNormalMap: { value: null },
        clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Ie() },
        clearcoatNormalScale: { value: /* @__PURE__ */ new ke(1, 1) },
        clearcoatRoughness: { value: 0 },
        clearcoatRoughnessMap: { value: null },
        clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Ie() },
        dispersion: { value: 0 },
        iridescence: { value: 0 },
        iridescenceMap: { value: null },
        iridescenceMapTransform: { value: /* @__PURE__ */ new Ie() },
        iridescenceIOR: { value: 1.3 },
        iridescenceThicknessMinimum: { value: 100 },
        iridescenceThicknessMaximum: { value: 400 },
        iridescenceThicknessMap: { value: null },
        iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Ie() },
        sheen: { value: 0 },
        sheenColor: { value: /* @__PURE__ */ new Ne(0) },
        sheenColorMap: { value: null },
        sheenColorMapTransform: { value: /* @__PURE__ */ new Ie() },
        sheenRoughness: { value: 1 },
        sheenRoughnessMap: { value: null },
        sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Ie() },
        transmission: { value: 0 },
        transmissionMap: { value: null },
        transmissionMapTransform: { value: /* @__PURE__ */ new Ie() },
        transmissionSamplerSize: { value: /* @__PURE__ */ new ke() },
        transmissionSamplerMap: { value: null },
        thickness: { value: 0 },
        thicknessMap: { value: null },
        thicknessMapTransform: { value: /* @__PURE__ */ new Ie() },
        attenuationDistance: { value: 0 },
        attenuationColor: { value: /* @__PURE__ */ new Ne(0) },
        specularColor: { value: /* @__PURE__ */ new Ne(1, 1, 1) },
        specularColorMap: { value: null },
        specularColorMapTransform: { value: /* @__PURE__ */ new Ie() },
        specularIntensity: { value: 1 },
        specularIntensityMap: { value: null },
        specularIntensityMapTransform: { value: /* @__PURE__ */ new Ie() },
        anisotropyVector: { value: /* @__PURE__ */ new ke() },
        anisotropyMap: { value: null },
        anisotropyMapTransform: { value: /* @__PURE__ */ new Ie() }
      }
    ]),
    vertexShader: Pe.meshphysical_vert,
    fragmentShader: Pe.meshphysical_frag
  };
  var Es = { r: 0, b: 0, g: 0 }, En = /* @__PURE__ */ new Vt(), vp = /* @__PURE__ */ new at();
  function yp(i, e, t, n, s, r, a) {
    let o = new Ne(0), l = r === !0 ? 0 : 1, c, h, f = null, d = 0, m = null;
    function _(w) {
      let S = w.isScene === !0 ? w.background : null;
      return S && S.isTexture && (S = (w.backgroundBlurriness > 0 ? t : e).get(S)), S;
    }
    function y(w) {
      let S = !1, E = _(w);
      E === null ? u(o, l) : E && E.isColor && (u(E, 1), S = !0);
      let O = i.xr.getEnvironmentBlendMode();
      O === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : O === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || S) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
    }
    function p(w, S) {
      let E = _(S);
      E && (E.isCubeTexture || E.mapping === sr) ? (h === void 0 && (h = new wt(
        new Ui(1, 1, 1),
        new Gt({
          name: "BackgroundCubeMaterial",
          uniforms: gi(Ht.backgroundCube.uniforms),
          vertexShader: Ht.backgroundCube.vertexShader,
          fragmentShader: Ht.backgroundCube.fragmentShader,
          side: vt,
          depthTest: !1,
          depthWrite: !1,
          fog: !1
        })
      ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(O, T, R) {
        this.matrixWorld.copyPosition(R.matrixWorld);
      }, Object.defineProperty(h.material, "envMap", {
        get: function() {
          return this.uniforms.envMap.value;
        }
      }), s.update(h)), En.copy(S.backgroundRotation), En.x *= -1, En.y *= -1, En.z *= -1, E.isCubeTexture && E.isRenderTargetTexture === !1 && (En.y *= -1, En.z *= -1), h.material.uniforms.envMap.value = E, h.material.uniforms.flipEnvMap.value = E.isCubeTexture && E.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = S.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(vp.makeRotationFromEuler(En)), h.material.toneMapped = Xe.getTransfer(E.colorSpace) !== $e, (f !== E || d !== E.version || m !== i.toneMapping) && (h.material.needsUpdate = !0, f = E, d = E.version, m = i.toneMapping), h.layers.enableAll(), w.unshift(h, h.geometry, h.material, 0, 0, null)) : E && E.isTexture && (c === void 0 && (c = new wt(
        new _i(2, 2),
        new Gt({
          name: "BackgroundMaterial",
          uniforms: gi(Ht.background.uniforms),
          vertexShader: Ht.background.vertexShader,
          fragmentShader: Ht.background.fragmentShader,
          side: mn,
          depthTest: !1,
          depthWrite: !1,
          fog: !1
        })
      ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
        get: function() {
          return this.uniforms.t2D.value;
        }
      }), s.update(c)), c.material.uniforms.t2D.value = E, c.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, c.material.toneMapped = Xe.getTransfer(E.colorSpace) !== $e, E.matrixAutoUpdate === !0 && E.updateMatrix(), c.material.uniforms.uvTransform.value.copy(E.matrix), (f !== E || d !== E.version || m !== i.toneMapping) && (c.material.needsUpdate = !0, f = E, d = E.version, m = i.toneMapping), c.layers.enableAll(), w.unshift(c, c.geometry, c.material, 0, 0, null));
    }
    function u(w, S) {
      w.getRGB(Es, Cc(i)), n.buffers.color.setClear(Es.r, Es.g, Es.b, S, a);
    }
    return {
      getClearColor: function() {
        return o;
      },
      setClearColor: function(w, S = 1) {
        o.set(w), l = S, u(o, l);
      },
      getClearAlpha: function() {
        return l;
      },
      setClearAlpha: function(w) {
        l = w, u(o, l);
      },
      render: y,
      addToRenderList: p
    };
  }
  function Mp(i, e) {
    let t = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, s = d(null), r = s, a = !1;
    function o(v, P, W, z, G) {
      let Z = !1, H = f(z, W, P);
      r !== H && (r = H, c(r.object)), Z = m(v, z, W, G), Z && _(v, z, W, G), G !== null && e.update(G, i.ELEMENT_ARRAY_BUFFER), (Z || a) && (a = !1, E(v, P, W, z), G !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, e.get(G).buffer));
    }
    function l() {
      return i.createVertexArray();
    }
    function c(v) {
      return i.bindVertexArray(v);
    }
    function h(v) {
      return i.deleteVertexArray(v);
    }
    function f(v, P, W) {
      let z = W.wireframe === !0, G = n[v.id];
      G === void 0 && (G = {}, n[v.id] = G);
      let Z = G[P.id];
      Z === void 0 && (Z = {}, G[P.id] = Z);
      let H = Z[z];
      return H === void 0 && (H = d(l()), Z[z] = H), H;
    }
    function d(v) {
      let P = [], W = [], z = [];
      for (let G = 0; G < t; G++)
        P[G] = 0, W[G] = 0, z[G] = 0;
      return {
        // for backward compatibility on non-VAO support browser
        geometry: null,
        program: null,
        wireframe: !1,
        newAttributes: P,
        enabledAttributes: W,
        attributeDivisors: z,
        object: v,
        attributes: {},
        index: null
      };
    }
    function m(v, P, W, z) {
      let G = r.attributes, Z = P.attributes, H = 0, K = W.getAttributes();
      for (let k in K)
        if (K[k].location >= 0) {
          let he = G[k], me = Z[k];
          if (me === void 0 && (k === "instanceMatrix" && v.instanceMatrix && (me = v.instanceMatrix), k === "instanceColor" && v.instanceColor && (me = v.instanceColor)), he === void 0 || he.attribute !== me || me && he.data !== me.data) return !0;
          H++;
        }
      return r.attributesNum !== H || r.index !== z;
    }
    function _(v, P, W, z) {
      let G = {}, Z = P.attributes, H = 0, K = W.getAttributes();
      for (let k in K)
        if (K[k].location >= 0) {
          let he = Z[k];
          he === void 0 && (k === "instanceMatrix" && v.instanceMatrix && (he = v.instanceMatrix), k === "instanceColor" && v.instanceColor && (he = v.instanceColor));
          let me = {};
          me.attribute = he, he && he.data && (me.data = he.data), G[k] = me, H++;
        }
      r.attributes = G, r.attributesNum = H, r.index = z;
    }
    function y() {
      let v = r.newAttributes;
      for (let P = 0, W = v.length; P < W; P++)
        v[P] = 0;
    }
    function p(v) {
      u(v, 0);
    }
    function u(v, P) {
      let W = r.newAttributes, z = r.enabledAttributes, G = r.attributeDivisors;
      W[v] = 1, z[v] === 0 && (i.enableVertexAttribArray(v), z[v] = 1), G[v] !== P && (i.vertexAttribDivisor(v, P), G[v] = P);
    }
    function w() {
      let v = r.newAttributes, P = r.enabledAttributes;
      for (let W = 0, z = P.length; W < z; W++)
        P[W] !== v[W] && (i.disableVertexAttribArray(W), P[W] = 0);
    }
    function S(v, P, W, z, G, Z, H) {
      H === !0 ? i.vertexAttribIPointer(v, P, W, G, Z) : i.vertexAttribPointer(v, P, W, z, G, Z);
    }
    function E(v, P, W, z) {
      y();
      let G = z.attributes, Z = W.getAttributes(), H = P.defaultAttributeValues;
      for (let K in Z) {
        let k = Z[K];
        if (k.location >= 0) {
          let ae = G[K];
          if (ae === void 0 && (K === "instanceMatrix" && v.instanceMatrix && (ae = v.instanceMatrix), K === "instanceColor" && v.instanceColor && (ae = v.instanceColor)), ae !== void 0) {
            let he = ae.normalized, me = ae.itemSize, Fe = e.get(ae);
            if (Fe === void 0) continue;
            let Ye = Fe.buffer, V = Fe.type, Q = Fe.bytesPerElement, de = V === i.INT || V === i.UNSIGNED_INT || ae.gpuType === Mo;
            if (ae.isInterleavedBufferAttribute) {
              let le = ae.data, Te = le.stride, Le = ae.offset;
              if (le.isInstancedInterleavedBuffer) {
                for (let Ue = 0; Ue < k.locationSize; Ue++)
                  u(k.location + Ue, le.meshPerAttribute);
                v.isInstancedMesh !== !0 && z._maxInstanceCount === void 0 && (z._maxInstanceCount = le.meshPerAttribute * le.count);
              } else
                for (let Ue = 0; Ue < k.locationSize; Ue++)
                  p(k.location + Ue);
              i.bindBuffer(i.ARRAY_BUFFER, Ye);
              for (let Ue = 0; Ue < k.locationSize; Ue++)
                S(
                  k.location + Ue,
                  me / k.locationSize,
                  V,
                  he,
                  Te * Q,
                  (Le + me / k.locationSize * Ue) * Q,
                  de
                );
            } else {
              if (ae.isInstancedBufferAttribute) {
                for (let le = 0; le < k.locationSize; le++)
                  u(k.location + le, ae.meshPerAttribute);
                v.isInstancedMesh !== !0 && z._maxInstanceCount === void 0 && (z._maxInstanceCount = ae.meshPerAttribute * ae.count);
              } else
                for (let le = 0; le < k.locationSize; le++)
                  p(k.location + le);
              i.bindBuffer(i.ARRAY_BUFFER, Ye);
              for (let le = 0; le < k.locationSize; le++)
                S(
                  k.location + le,
                  me / k.locationSize,
                  V,
                  he,
                  me * Q,
                  me / k.locationSize * le * Q,
                  de
                );
            }
          } else if (H !== void 0) {
            let he = H[K];
            if (he !== void 0)
              switch (he.length) {
                case 2:
                  i.vertexAttrib2fv(k.location, he);
                  break;
                case 3:
                  i.vertexAttrib3fv(k.location, he);
                  break;
                case 4:
                  i.vertexAttrib4fv(k.location, he);
                  break;
                default:
                  i.vertexAttrib1fv(k.location, he);
              }
          }
        }
      }
      w();
    }
    function O() {
      B();
      for (let v in n) {
        let P = n[v];
        for (let W in P) {
          let z = P[W];
          for (let G in z)
            h(z[G].object), delete z[G];
          delete P[W];
        }
        delete n[v];
      }
    }
    function T(v) {
      if (n[v.id] === void 0) return;
      let P = n[v.id];
      for (let W in P) {
        let z = P[W];
        for (let G in z)
          h(z[G].object), delete z[G];
        delete P[W];
      }
      delete n[v.id];
    }
    function R(v) {
      for (let P in n) {
        let W = n[P];
        if (W[v.id] === void 0) continue;
        let z = W[v.id];
        for (let G in z)
          h(z[G].object), delete z[G];
        delete W[v.id];
      }
    }
    function B() {
      M(), a = !0, r !== s && (r = s, c(r.object));
    }
    function M() {
      s.geometry = null, s.program = null, s.wireframe = !1;
    }
    return {
      setup: o,
      reset: B,
      resetDefaultState: M,
      dispose: O,
      releaseStatesOfGeometry: T,
      releaseStatesOfProgram: R,
      initAttributes: y,
      enableAttribute: p,
      disableUnusedAttributes: w
    };
  }
  function Sp(i, e, t) {
    let n;
    function s(c) {
      n = c;
    }
    function r(c, h) {
      i.drawArrays(n, c, h), t.update(h, n, 1);
    }
    function a(c, h, f) {
      f !== 0 && (i.drawArraysInstanced(n, c, h, f), t.update(h, n, f));
    }
    function o(c, h, f) {
      if (f === 0) return;
      e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, f);
      let m = 0;
      for (let _ = 0; _ < f; _++)
        m += h[_];
      t.update(m, n, 1);
    }
    function l(c, h, f, d) {
      if (f === 0) return;
      let m = e.get("WEBGL_multi_draw");
      if (m === null)
        for (let _ = 0; _ < c.length; _++)
          a(c[_], h[_], d[_]);
      else {
        m.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, d, 0, f);
        let _ = 0;
        for (let y = 0; y < f; y++)
          _ += h[y];
        for (let y = 0; y < d.length; y++)
          t.update(_, n, d[y]);
      }
    }
    this.setMode = s, this.render = r, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
  }
  function bp(i, e, t, n) {
    let s;
    function r() {
      if (s !== void 0) return s;
      if (e.has("EXT_texture_filter_anisotropic") === !0) {
        let T = e.get("EXT_texture_filter_anisotropic");
        s = i.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      } else
        s = 0;
      return s;
    }
    function a(T) {
      return !(T !== Bt && n.convert(T) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
    }
    function o(T) {
      let R = T === Oi && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
      return !(T !== nn && n.convert(T) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
      T !== jt && !R);
    }
    function l(T) {
      if (T === "highp") {
        if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0)
          return "highp";
        T = "mediump";
      }
      return T === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
    }
    let c = t.precision !== void 0 ? t.precision : "highp", h = l(c);
    h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
    let f = t.logarithmicDepthBuffer === !0, d = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), m = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = i.getParameter(i.MAX_TEXTURE_SIZE), y = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), p = i.getParameter(i.MAX_VERTEX_ATTRIBS), u = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), w = i.getParameter(i.MAX_VARYING_VECTORS), S = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), E = m > 0, O = i.getParameter(i.MAX_SAMPLES);
    return {
      isWebGL2: !0,
      // keeping this for backwards compatibility
      getMaxAnisotropy: r,
      getMaxPrecision: l,
      textureFormatReadable: a,
      textureTypeReadable: o,
      precision: c,
      logarithmicDepthBuffer: f,
      maxTextures: d,
      maxVertexTextures: m,
      maxTextureSize: _,
      maxCubemapSize: y,
      maxAttributes: p,
      maxVertexUniforms: u,
      maxVaryings: w,
      maxFragmentUniforms: S,
      vertexTextures: E,
      maxSamples: O
    };
  }
  function Ep(i) {
    let e = this, t = null, n = 0, s = !1, r = !1, a = new Ft(), o = new Ie(), l = { value: null, needsUpdate: !1 };
    this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(f, d) {
      let m = f.length !== 0 || d || // enable state of previous frame - the clipping code has to
      // run another frame in order to reset the state:
      n !== 0 || s;
      return s = d, n = f.length, m;
    }, this.beginShadows = function() {
      r = !0, h(null);
    }, this.endShadows = function() {
      r = !1;
    }, this.setGlobalState = function(f, d) {
      t = h(f, d, 0);
    }, this.setState = function(f, d, m) {
      let _ = f.clippingPlanes, y = f.clipIntersection, p = f.clipShadows, u = i.get(f);
      if (!s || _ === null || _.length === 0 || r && !p)
        r ? h(null) : c();
      else {
        let w = r ? 0 : n, S = w * 4, E = u.clippingState || null;
        l.value = E, E = h(_, d, S, m);
        for (let O = 0; O !== S; ++O)
          E[O] = t[O];
        u.clippingState = E, this.numIntersection = y ? this.numPlanes : 0, this.numPlanes += w;
      }
    };
    function c() {
      l.value !== t && (l.value = t, l.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0;
    }
    function h(f, d, m, _) {
      let y = f !== null ? f.length : 0, p = null;
      if (y !== 0) {
        if (p = l.value, _ !== !0 || p === null) {
          let u = m + y * 4, w = d.matrixWorldInverse;
          o.getNormalMatrix(w), (p === null || p.length < u) && (p = new Float32Array(u));
          for (let S = 0, E = m; S !== y; ++S, E += 4)
            a.copy(f[S]).applyMatrix4(w, o), a.normal.toArray(p, E), p[E + 3] = a.constant;
        }
        l.value = p, l.needsUpdate = !0;
      }
      return e.numPlanes = y, e.numIntersection = 0, p;
    }
  }
  function wp(i) {
    let e = /* @__PURE__ */ new WeakMap();
    function t(a, o) {
      return o === da ? a.mapping = di : o === fa && (a.mapping = fi), a;
    }
    function n(a) {
      if (a && a.isTexture) {
        let o = a.mapping;
        if (o === da || o === fa)
          if (e.has(a)) {
            let l = e.get(a).texture;
            return t(l, a.mapping);
          } else {
            let l = a.image;
            if (l && l.height > 0) {
              let c = new Za(l.height);
              return c.fromEquirectangularTexture(i, a), e.set(a, c), a.addEventListener("dispose", s), t(c.texture, a.mapping);
            } else
              return null;
          }
      }
      return a;
    }
    function s(a) {
      let o = a.target;
      o.removeEventListener("dispose", s);
      let l = e.get(o);
      l !== void 0 && (e.delete(o), l.dispose());
    }
    function r() {
      e = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: n,
      dispose: r
    };
  }
  var Zs = class extends qs {
    constructor(e = -1, t = 1, n = 1, s = -1, r = 0.1, a = 2e3) {
      super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = s, this.near = r, this.far = a, this.updateProjectionMatrix();
    }
    copy(e, t) {
      return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
    }
    setViewOffset(e, t, n, s, r, a) {
      this.view === null && (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = a, this.updateProjectionMatrix();
    }
    clearViewOffset() {
      this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      let e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, s = (this.top + this.bottom) / 2, r = n - e, a = n + e, o = s + t, l = s - t;
      if (this.view !== null && this.view.enabled) {
        let c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
        r += c * this.view.offsetX, a = r + c * this.view.width, o -= h * this.view.offsetY, l = o - h * this.view.height;
      }
      this.projectionMatrix.makeOrthographic(r, a, o, l, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
    }
  }, ai = 4, Vl = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], Rn = 20, ia = /* @__PURE__ */ new Zs(), Gl = /* @__PURE__ */ new Ne(), sa = null, ra = 0, aa = 0, oa = !1, An = (1 + Math.sqrt(5)) / 2, si = 1 / An, Wl = [
    /* @__PURE__ */ new D(-An, si, 0),
    /* @__PURE__ */ new D(An, si, 0),
    /* @__PURE__ */ new D(-si, 0, An),
    /* @__PURE__ */ new D(si, 0, An),
    /* @__PURE__ */ new D(0, An, -si),
    /* @__PURE__ */ new D(0, An, si),
    /* @__PURE__ */ new D(-1, 1, -1),
    /* @__PURE__ */ new D(1, 1, -1),
    /* @__PURE__ */ new D(-1, 1, 1),
    /* @__PURE__ */ new D(1, 1, 1)
  ], $s = class {
    constructor(e) {
      this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
    }
    /**
     * Generates a PMREM from a supplied Scene, which can be faster than using an
     * image if networking bandwidth is low. Optional sigma specifies a blur radius
     * in radians to be applied to the scene before PMREM generation. Optional near
     * and far planes ensure the scene is rendered in its entirety (the cubeCamera
     * is placed at the origin).
     */
    fromScene(e, t = 0, n = 0.1, s = 100) {
      sa = this._renderer.getRenderTarget(), ra = this._renderer.getActiveCubeFace(), aa = this._renderer.getActiveMipmapLevel(), oa = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
      let r = this._allocateTargets();
      return r.depthBuffer = !0, this._sceneToCubeUV(e, n, s, r), t > 0 && this._blur(r, 0, 0, t), this._applyPMREM(r), this._cleanup(r), r;
    }
    /**
     * Generates a PMREM from an equirectangular texture, which can be either LDR
     * or HDR. The ideal input image size is 1k (1024 x 512),
     * as this matches best with the 256 x 256 cubemap output.
     * The smallest supported equirectangular image size is 64 x 32.
     */
    fromEquirectangular(e, t = null) {
      return this._fromTexture(e, t);
    }
    /**
     * Generates a PMREM from an cubemap texture, which can be either LDR
     * or HDR. The ideal input cube size is 256 x 256,
     * as this matches best with the 256 x 256 cubemap output.
     * The smallest supported cube size is 16 x 16.
     */
    fromCubemap(e, t = null) {
      return this._fromTexture(e, t);
    }
    /**
     * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
     * your texture's network fetch for increased concurrency.
     */
    compileCubemapShader() {
      this._cubemapMaterial === null && (this._cubemapMaterial = Yl(), this._compileMaterial(this._cubemapMaterial));
    }
    /**
     * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
     * your texture's network fetch for increased concurrency.
     */
    compileEquirectangularShader() {
      this._equirectMaterial === null && (this._equirectMaterial = ql(), this._compileMaterial(this._equirectMaterial));
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
    _setSize(e) {
      this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
    }
    _dispose() {
      this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
      for (let e = 0; e < this._lodPlanes.length; e++)
        this._lodPlanes[e].dispose();
    }
    _cleanup(e) {
      this._renderer.setRenderTarget(sa, ra, aa), this._renderer.xr.enabled = oa, e.scissorTest = !1, ws(e, 0, 0, e.width, e.height);
    }
    _fromTexture(e, t) {
      e.mapping === di || e.mapping === fi ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), sa = this._renderer.getRenderTarget(), ra = this._renderer.getActiveCubeFace(), aa = this._renderer.getActiveMipmapLevel(), oa = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
      let n = t || this._allocateTargets();
      return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
    }
    _allocateTargets() {
      let e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
        magFilter: Ot,
        minFilter: Ot,
        generateMipmaps: !1,
        type: Oi,
        format: Bt,
        colorSpace: xn,
        depthBuffer: !1
      }, s = Xl(e, t, n);
      if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
        this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Xl(e, t, n);
        let { _lodMax: r } = this;
        ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Ap(r)), this._blurMaterial = Tp(r, e, t);
      }
      return s;
    }
    _compileMaterial(e) {
      let t = new wt(this._lodPlanes[0], e);
      this._renderer.compile(t, ia);
    }
    _sceneToCubeUV(e, t, n, s) {
      let o = new gt(90, 1, t, n), l = [1, -1, 1, 1, 1, 1], c = [1, 1, 1, -1, -1, -1], h = this._renderer, f = h.autoClear, d = h.toneMapping;
      h.getClearColor(Gl), h.toneMapping = pn, h.autoClear = !1;
      let m = new Gs({
        name: "PMREM.Background",
        side: vt,
        depthWrite: !1,
        depthTest: !1
      }), _ = new wt(new Ui(), m), y = !1, p = e.background;
      p ? p.isColor && (m.color.copy(p), e.background = null, y = !0) : (m.color.copy(Gl), y = !0);
      for (let u = 0; u < 6; u++) {
        let w = u % 3;
        w === 0 ? (o.up.set(0, l[u], 0), o.lookAt(c[u], 0, 0)) : w === 1 ? (o.up.set(0, 0, l[u]), o.lookAt(0, c[u], 0)) : (o.up.set(0, l[u], 0), o.lookAt(0, 0, c[u]));
        let S = this._cubeSize;
        ws(s, w * S, u > 2 ? S : 0, S, S), h.setRenderTarget(s), y && h.render(_, o), h.render(e, o);
      }
      _.geometry.dispose(), _.material.dispose(), h.toneMapping = d, h.autoClear = f, e.background = p;
    }
    _textureToCubeUV(e, t) {
      let n = this._renderer, s = e.mapping === di || e.mapping === fi;
      s ? (this._cubemapMaterial === null && (this._cubemapMaterial = Yl()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = ql());
      let r = s ? this._cubemapMaterial : this._equirectMaterial, a = new wt(this._lodPlanes[0], r), o = r.uniforms;
      o.envMap.value = e;
      let l = this._cubeSize;
      ws(t, 0, 0, 3 * l, 2 * l), n.setRenderTarget(t), n.render(a, ia);
    }
    _applyPMREM(e) {
      let t = this._renderer, n = t.autoClear;
      t.autoClear = !1;
      let s = this._lodPlanes.length;
      for (let r = 1; r < s; r++) {
        let a = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), o = Wl[(s - r - 1) % Wl.length];
        this._blur(e, r - 1, r, a, o);
      }
      t.autoClear = n;
    }
    /**
     * This is a two-pass Gaussian blur for a cubemap. Normally this is done
     * vertically and horizontally, but this breaks down on a cube. Here we apply
     * the blur latitudinally (around the poles), and then longitudinally (towards
     * the poles) to approximate the orthogonally-separable blur. It is least
     * accurate at the poles, but still does a decent job.
     */
    _blur(e, t, n, s, r) {
      let a = this._pingPongRenderTarget;
      this._halfBlur(
        e,
        a,
        t,
        n,
        s,
        "latitudinal",
        r
      ), this._halfBlur(
        a,
        e,
        n,
        n,
        s,
        "longitudinal",
        r
      );
    }
    _halfBlur(e, t, n, s, r, a, o) {
      let l = this._renderer, c = this._blurMaterial;
      a !== "latitudinal" && a !== "longitudinal" && console.error(
        "blur direction must be either latitudinal or longitudinal!"
      );
      let h = 3, f = new wt(this._lodPlanes[s], c), d = c.uniforms, m = this._sizeLods[n] - 1, _ = isFinite(r) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * Rn - 1), y = r / _, p = isFinite(r) ? 1 + Math.floor(h * y) : Rn;
      p > Rn && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Rn}`);
      let u = [], w = 0;
      for (let R = 0; R < Rn; ++R) {
        let B = R / y, M = Math.exp(-B * B / 2);
        u.push(M), R === 0 ? w += M : R < p && (w += 2 * M);
      }
      for (let R = 0; R < u.length; R++)
        u[R] = u[R] / w;
      d.envMap.value = e.texture, d.samples.value = p, d.weights.value = u, d.latitudinal.value = a === "latitudinal", o && (d.poleAxis.value = o);
      let { _lodMax: S } = this;
      d.dTheta.value = _, d.mipInt.value = S - n;
      let E = this._sizeLods[s], O = 3 * E * (s > S - ai ? s - S + ai : 0), T = 4 * (this._cubeSize - E);
      ws(t, O, T, 3 * E, 2 * E), l.setRenderTarget(t), l.render(f, ia);
    }
  };
  function Ap(i) {
    let e = [], t = [], n = [], s = i, r = i - ai + 1 + Vl.length;
    for (let a = 0; a < r; a++) {
      let o = Math.pow(2, s);
      t.push(o);
      let l = 1 / o;
      a > i - ai ? l = Vl[a - i + ai - 1] : a === 0 && (l = 0), n.push(l);
      let c = 1 / (o - 2), h = -c, f = 1 + c, d = [h, h, f, h, f, f, h, h, f, f, h, f], m = 6, _ = 6, y = 3, p = 2, u = 1, w = new Float32Array(y * _ * m), S = new Float32Array(p * _ * m), E = new Float32Array(u * _ * m);
      for (let T = 0; T < m; T++) {
        let R = T % 3 * 2 / 3 - 1, B = T > 2 ? 0 : -1, M = [
          R,
          B,
          0,
          R + 2 / 3,
          B,
          0,
          R + 2 / 3,
          B + 1,
          0,
          R,
          B,
          0,
          R + 2 / 3,
          B + 1,
          0,
          R,
          B + 1,
          0
        ];
        w.set(M, y * _ * T), S.set(d, p * _ * T);
        let v = [T, T, T, T, T, T];
        E.set(v, u * _ * T);
      }
      let O = new Un();
      O.setAttribute("position", new It(w, y)), O.setAttribute("uv", new It(S, p)), O.setAttribute("faceIndex", new It(E, u)), e.push(O), s > ai && s--;
    }
    return { lodPlanes: e, sizeLods: t, sigmas: n };
  }
  function Xl(i, e, t) {
    let n = new sn(i, e, t);
    return n.texture.mapping = sr, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
  }
  function ws(i, e, t, n, s) {
    i.viewport.set(e, t, n, s), i.scissor.set(e, t, n, s);
  }
  function Tp(i, e, t) {
    let n = new Float32Array(Rn), s = new D(0, 1, 0);
    return new Gt({
      name: "SphericalGaussianBlur",
      defines: {
        n: Rn,
        CUBEUV_TEXEL_WIDTH: 1 / e,
        CUBEUV_TEXEL_HEIGHT: 1 / t,
        CUBEUV_MAX_MIP: `${i}.0`
      },
      uniforms: {
        envMap: { value: null },
        samples: { value: 1 },
        weights: { value: n },
        latitudinal: { value: !1 },
        dTheta: { value: 0 },
        mipInt: { value: 0 },
        poleAxis: { value: s }
      },
      vertexShader: Ro(),
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
      blending: fn,
      depthTest: !1,
      depthWrite: !1
    });
  }
  function ql() {
    return new Gt({
      name: "EquirectangularToCubeUV",
      uniforms: {
        envMap: { value: null }
      },
      vertexShader: Ro(),
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
      blending: fn,
      depthTest: !1,
      depthWrite: !1
    });
  }
  function Yl() {
    return new Gt({
      name: "CubemapToCubeUV",
      uniforms: {
        envMap: { value: null },
        flipEnvMap: { value: -1 }
      },
      vertexShader: Ro(),
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
      blending: fn,
      depthTest: !1,
      depthWrite: !1
    });
  }
  function Ro() {
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
  function Rp(i) {
    let e = /* @__PURE__ */ new WeakMap(), t = null;
    function n(o) {
      if (o && o.isTexture) {
        let l = o.mapping, c = l === da || l === fa, h = l === di || l === fi;
        if (c || h) {
          let f = e.get(o), d = f !== void 0 ? f.texture.pmremVersion : 0;
          if (o.isRenderTargetTexture && o.pmremVersion !== d)
            return t === null && (t = new $s(i)), f = c ? t.fromEquirectangular(o, f) : t.fromCubemap(o, f), f.texture.pmremVersion = o.pmremVersion, e.set(o, f), f.texture;
          if (f !== void 0)
            return f.texture;
          {
            let m = o.image;
            return c && m && m.height > 0 || h && m && s(m) ? (t === null && (t = new $s(i)), f = c ? t.fromEquirectangular(o) : t.fromCubemap(o), f.texture.pmremVersion = o.pmremVersion, e.set(o, f), o.addEventListener("dispose", r), f.texture) : null;
          }
        }
      }
      return o;
    }
    function s(o) {
      let l = 0, c = 6;
      for (let h = 0; h < c; h++)
        o[h] !== void 0 && l++;
      return l === c;
    }
    function r(o) {
      let l = o.target;
      l.removeEventListener("dispose", r);
      let c = e.get(l);
      c !== void 0 && (e.delete(l), c.dispose());
    }
    function a() {
      e = /* @__PURE__ */ new WeakMap(), t !== null && (t.dispose(), t = null);
    }
    return {
      get: n,
      dispose: a
    };
  }
  function Cp(i) {
    let e = {};
    function t(n) {
      if (e[n] !== void 0)
        return e[n];
      let s;
      switch (n) {
        case "WEBGL_depth_texture":
          s = i.getExtension("WEBGL_depth_texture") || i.getExtension("MOZ_WEBGL_depth_texture") || i.getExtension("WEBKIT_WEBGL_depth_texture");
          break;
        case "EXT_texture_filter_anisotropic":
          s = i.getExtension("EXT_texture_filter_anisotropic") || i.getExtension("MOZ_EXT_texture_filter_anisotropic") || i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
          break;
        case "WEBGL_compressed_texture_s3tc":
          s = i.getExtension("WEBGL_compressed_texture_s3tc") || i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
          break;
        case "WEBGL_compressed_texture_pvrtc":
          s = i.getExtension("WEBGL_compressed_texture_pvrtc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
          break;
        default:
          s = i.getExtension(n);
      }
      return e[n] = s, s;
    }
    return {
      has: function(n) {
        return t(n) !== null;
      },
      init: function() {
        t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent");
      },
      get: function(n) {
        let s = t(n);
        return s === null && Ci("THREE.WebGLRenderer: " + n + " extension not supported."), s;
      }
    };
  }
  function Pp(i, e, t, n) {
    let s = {}, r = /* @__PURE__ */ new WeakMap();
    function a(f) {
      let d = f.target;
      d.index !== null && e.remove(d.index);
      for (let _ in d.attributes)
        e.remove(d.attributes[_]);
      for (let _ in d.morphAttributes) {
        let y = d.morphAttributes[_];
        for (let p = 0, u = y.length; p < u; p++)
          e.remove(y[p]);
      }
      d.removeEventListener("dispose", a), delete s[d.id];
      let m = r.get(d);
      m && (e.remove(m), r.delete(d)), n.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === !0 && delete d._maxInstanceCount, t.memory.geometries--;
    }
    function o(f, d) {
      return s[d.id] === !0 || (d.addEventListener("dispose", a), s[d.id] = !0, t.memory.geometries++), d;
    }
    function l(f) {
      let d = f.attributes;
      for (let _ in d)
        e.update(d[_], i.ARRAY_BUFFER);
      let m = f.morphAttributes;
      for (let _ in m) {
        let y = m[_];
        for (let p = 0, u = y.length; p < u; p++)
          e.update(y[p], i.ARRAY_BUFFER);
      }
    }
    function c(f) {
      let d = [], m = f.index, _ = f.attributes.position, y = 0;
      if (m !== null) {
        let w = m.array;
        y = m.version;
        for (let S = 0, E = w.length; S < E; S += 3) {
          let O = w[S + 0], T = w[S + 1], R = w[S + 2];
          d.push(O, T, T, R, R, O);
        }
      } else if (_ !== void 0) {
        let w = _.array;
        y = _.version;
        for (let S = 0, E = w.length / 3 - 1; S < E; S += 3) {
          let O = S + 0, T = S + 1, R = S + 2;
          d.push(O, T, T, R, R, O);
        }
      } else
        return;
      let p = new (Tc(d) ? Xs : Ws)(d, 1);
      p.version = y;
      let u = r.get(f);
      u && e.remove(u), r.set(f, p);
    }
    function h(f) {
      let d = r.get(f);
      if (d) {
        let m = f.index;
        m !== null && d.version < m.version && c(f);
      } else
        c(f);
      return r.get(f);
    }
    return {
      get: o,
      update: l,
      getWireframeAttribute: h
    };
  }
  function Ip(i, e, t) {
    let n;
    function s(d) {
      n = d;
    }
    let r, a;
    function o(d) {
      r = d.type, a = d.bytesPerElement;
    }
    function l(d, m) {
      i.drawElements(n, m, r, d * a), t.update(m, n, 1);
    }
    function c(d, m, _) {
      _ !== 0 && (i.drawElementsInstanced(n, m, r, d * a, _), t.update(m, n, _));
    }
    function h(d, m, _) {
      if (_ === 0) return;
      e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, m, 0, r, d, 0, _);
      let p = 0;
      for (let u = 0; u < _; u++)
        p += m[u];
      t.update(p, n, 1);
    }
    function f(d, m, _, y) {
      if (_ === 0) return;
      let p = e.get("WEBGL_multi_draw");
      if (p === null)
        for (let u = 0; u < d.length; u++)
          c(d[u] / a, m[u], y[u]);
      else {
        p.multiDrawElementsInstancedWEBGL(n, m, 0, r, d, 0, y, 0, _);
        let u = 0;
        for (let w = 0; w < _; w++)
          u += m[w];
        for (let w = 0; w < y.length; w++)
          t.update(u, n, y[w]);
      }
    }
    this.setMode = s, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = f;
  }
  function Lp(i) {
    let e = {
      geometries: 0,
      textures: 0
    }, t = {
      frame: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
    function n(r, a, o) {
      switch (t.calls++, a) {
        case i.TRIANGLES:
          t.triangles += o * (r / 3);
          break;
        case i.LINES:
          t.lines += o * (r / 2);
          break;
        case i.LINE_STRIP:
          t.lines += o * (r - 1);
          break;
        case i.LINE_LOOP:
          t.lines += o * r;
          break;
        case i.POINTS:
          t.points += o * r;
          break;
        default:
          console.error("THREE.WebGLInfo: Unknown draw mode:", a);
          break;
      }
    }
    function s() {
      t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0;
    }
    return {
      memory: e,
      render: t,
      programs: null,
      autoReset: !0,
      reset: s,
      update: n
    };
  }
  function Dp(i, e, t) {
    let n = /* @__PURE__ */ new WeakMap(), s = new ot();
    function r(a, o, l) {
      let c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, f = h !== void 0 ? h.length : 0, d = n.get(o);
      if (d === void 0 || d.count !== f) {
        let M = function() {
          R.dispose(), n.delete(o), o.removeEventListener("dispose", M);
        };
        d !== void 0 && d.texture.dispose();
        let m = o.morphAttributes.position !== void 0, _ = o.morphAttributes.normal !== void 0, y = o.morphAttributes.color !== void 0, p = o.morphAttributes.position || [], u = o.morphAttributes.normal || [], w = o.morphAttributes.color || [], S = 0;
        m === !0 && (S = 1), _ === !0 && (S = 2), y === !0 && (S = 3);
        let E = o.attributes.position.count * S, O = 1;
        E > e.maxTextureSize && (O = Math.ceil(E / e.maxTextureSize), E = e.maxTextureSize);
        let T = new Float32Array(E * O * 4 * f), R = new Hs(T, E, O, f);
        R.type = jt, R.needsUpdate = !0;
        let B = S * 4;
        for (let v = 0; v < f; v++) {
          let P = p[v], W = u[v], z = w[v], G = E * O * 4 * v;
          for (let Z = 0; Z < P.count; Z++) {
            let H = Z * B;
            m === !0 && (s.fromBufferAttribute(P, Z), T[G + H + 0] = s.x, T[G + H + 1] = s.y, T[G + H + 2] = s.z, T[G + H + 3] = 0), _ === !0 && (s.fromBufferAttribute(W, Z), T[G + H + 4] = s.x, T[G + H + 5] = s.y, T[G + H + 6] = s.z, T[G + H + 7] = 0), y === !0 && (s.fromBufferAttribute(z, Z), T[G + H + 8] = s.x, T[G + H + 9] = s.y, T[G + H + 10] = s.z, T[G + H + 11] = z.itemSize === 4 ? s.w : 1);
          }
        }
        d = {
          count: f,
          texture: R,
          size: new ke(E, O)
        }, n.set(o, d), o.addEventListener("dispose", M);
      }
      if (a.isInstancedMesh === !0 && a.morphTexture !== null)
        l.getUniforms().setValue(i, "morphTexture", a.morphTexture, t);
      else {
        let m = 0;
        for (let y = 0; y < c.length; y++)
          m += c[y];
        let _ = o.morphTargetsRelative ? 1 : 1 - m;
        l.getUniforms().setValue(i, "morphTargetBaseInfluence", _), l.getUniforms().setValue(i, "morphTargetInfluences", c);
      }
      l.getUniforms().setValue(i, "morphTargetsTexture", d.texture, t), l.getUniforms().setValue(i, "morphTargetsTextureSize", d.size);
    }
    return {
      update: r
    };
  }
  function Up(i, e, t, n) {
    let s = /* @__PURE__ */ new WeakMap();
    function r(l) {
      let c = n.render.frame, h = l.geometry, f = e.get(l, h);
      if (s.get(f) !== c && (e.update(f), s.set(f, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), s.get(l) !== c && (t.update(l.instanceMatrix, i.ARRAY_BUFFER), l.instanceColor !== null && t.update(l.instanceColor, i.ARRAY_BUFFER), s.set(l, c))), l.isSkinnedMesh) {
        let d = l.skeleton;
        s.get(d) !== c && (d.update(), s.set(d, c));
      }
      return f;
    }
    function a() {
      s = /* @__PURE__ */ new WeakMap();
    }
    function o(l) {
      let c = l.target;
      c.removeEventListener("dispose", o), t.remove(c.instanceMatrix), c.instanceColor !== null && t.remove(c.instanceColor);
    }
    return {
      update: r,
      dispose: a
    };
  }
  var Js = class extends At {
    constructor(e, t, n, s, r, a, o, l, c, h = ci) {
      if (h !== ci && h !== mi)
        throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
      n === void 0 && h === ci && (n = In), n === void 0 && h === mi && (n = pi), super(null, s, r, a, o, l, h, n, c), this.isDepthTexture = !0, this.image = { width: e, height: t }, this.magFilter = o !== void 0 ? o : Pt, this.minFilter = l !== void 0 ? l : Pt, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
    }
    copy(e) {
      return super.copy(e), this.compareFunction = e.compareFunction, this;
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
    }
  }, Ic = /* @__PURE__ */ new At(), Zl = /* @__PURE__ */ new Js(1, 1), Lc = /* @__PURE__ */ new Hs(), Dc = /* @__PURE__ */ new qa(), Uc = /* @__PURE__ */ new Ys(), $l = [], Jl = [], Kl = new Float32Array(16), Ql = new Float32Array(9), jl = new Float32Array(4);
  function vi(i, e, t) {
    let n = i[0];
    if (n <= 0 || n > 0) return i;
    let s = e * t, r = $l[s];
    if (r === void 0 && (r = new Float32Array(s), $l[s] = r), e !== 0) {
      n.toArray(r, 0);
      for (let a = 1, o = 0; a !== e; ++a)
        o += t, i[a].toArray(r, o);
    }
    return r;
  }
  function lt(i, e) {
    if (i.length !== e.length) return !1;
    for (let t = 0, n = i.length; t < n; t++)
      if (i[t] !== e[t]) return !1;
    return !0;
  }
  function ct(i, e) {
    for (let t = 0, n = e.length; t < n; t++)
      i[t] = e[t];
  }
  function ar(i, e) {
    let t = Jl[e];
    t === void 0 && (t = new Int32Array(e), Jl[e] = t);
    for (let n = 0; n !== e; ++n)
      t[n] = i.allocateTextureUnit();
    return t;
  }
  function Np(i, e) {
    let t = this.cache;
    t[0] !== e && (i.uniform1f(this.addr, e), t[0] = e);
  }
  function Fp(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y) && (i.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
    else {
      if (lt(t, e)) return;
      i.uniform2fv(this.addr, e), ct(t, e);
    }
  }
  function Op(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
    else if (e.r !== void 0)
      (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (i.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
    else {
      if (lt(t, e)) return;
      i.uniform3fv(this.addr, e), ct(t, e);
    }
  }
  function Bp(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
    else {
      if (lt(t, e)) return;
      i.uniform4fv(this.addr, e), ct(t, e);
    }
  }
  function zp(i, e) {
    let t = this.cache, n = e.elements;
    if (n === void 0) {
      if (lt(t, e)) return;
      i.uniformMatrix2fv(this.addr, !1, e), ct(t, e);
    } else {
      if (lt(t, n)) return;
      jl.set(n), i.uniformMatrix2fv(this.addr, !1, jl), ct(t, n);
    }
  }
  function kp(i, e) {
    let t = this.cache, n = e.elements;
    if (n === void 0) {
      if (lt(t, e)) return;
      i.uniformMatrix3fv(this.addr, !1, e), ct(t, e);
    } else {
      if (lt(t, n)) return;
      Ql.set(n), i.uniformMatrix3fv(this.addr, !1, Ql), ct(t, n);
    }
  }
  function Hp(i, e) {
    let t = this.cache, n = e.elements;
    if (n === void 0) {
      if (lt(t, e)) return;
      i.uniformMatrix4fv(this.addr, !1, e), ct(t, e);
    } else {
      if (lt(t, n)) return;
      Kl.set(n), i.uniformMatrix4fv(this.addr, !1, Kl), ct(t, n);
    }
  }
  function Vp(i, e) {
    let t = this.cache;
    t[0] !== e && (i.uniform1i(this.addr, e), t[0] = e);
  }
  function Gp(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y) && (i.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
    else {
      if (lt(t, e)) return;
      i.uniform2iv(this.addr, e), ct(t, e);
    }
  }
  function Wp(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
    else {
      if (lt(t, e)) return;
      i.uniform3iv(this.addr, e), ct(t, e);
    }
  }
  function Xp(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
    else {
      if (lt(t, e)) return;
      i.uniform4iv(this.addr, e), ct(t, e);
    }
  }
  function qp(i, e) {
    let t = this.cache;
    t[0] !== e && (i.uniform1ui(this.addr, e), t[0] = e);
  }
  function Yp(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y) && (i.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
    else {
      if (lt(t, e)) return;
      i.uniform2uiv(this.addr, e), ct(t, e);
    }
  }
  function Zp(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
    else {
      if (lt(t, e)) return;
      i.uniform3uiv(this.addr, e), ct(t, e);
    }
  }
  function $p(i, e) {
    let t = this.cache;
    if (e.x !== void 0)
      (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
    else {
      if (lt(t, e)) return;
      i.uniform4uiv(this.addr, e), ct(t, e);
    }
  }
  function Jp(i, e, t) {
    let n = this.cache, s = t.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s);
    let r;
    this.type === i.SAMPLER_2D_SHADOW ? (Zl.compareFunction = Ac, r = Zl) : r = Ic, t.setTexture2D(e || r, s);
  }
  function Kp(i, e, t) {
    let n = this.cache, s = t.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), t.setTexture3D(e || Dc, s);
  }
  function Qp(i, e, t) {
    let n = this.cache, s = t.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), t.setTextureCube(e || Uc, s);
  }
  function jp(i, e, t) {
    let n = this.cache, s = t.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), t.setTexture2DArray(e || Lc, s);
  }
  function em(i) {
    switch (i) {
      case 5126:
        return Np;
      case 35664:
        return Fp;
      case 35665:
        return Op;
      case 35666:
        return Bp;
      case 35674:
        return zp;
      case 35675:
        return kp;
      case 35676:
        return Hp;
      case 5124:
      case 35670:
        return Vp;
      case 35667:
      case 35671:
        return Gp;
      case 35668:
      case 35672:
        return Wp;
      case 35669:
      case 35673:
        return Xp;
      case 5125:
        return qp;
      case 36294:
        return Yp;
      case 36295:
        return Zp;
      case 36296:
        return $p;
      case 35678:
      case 36198:
      case 36298:
      case 36306:
      case 35682:
        return Jp;
      case 35679:
      case 36299:
      case 36307:
        return Kp;
      case 35680:
      case 36300:
      case 36308:
      case 36293:
        return Qp;
      case 36289:
      case 36303:
      case 36311:
      case 36292:
        return jp;
    }
  }
  function tm(i, e) {
    i.uniform1fv(this.addr, e);
  }
  function nm(i, e) {
    let t = vi(e, this.size, 2);
    i.uniform2fv(this.addr, t);
  }
  function im(i, e) {
    let t = vi(e, this.size, 3);
    i.uniform3fv(this.addr, t);
  }
  function sm(i, e) {
    let t = vi(e, this.size, 4);
    i.uniform4fv(this.addr, t);
  }
  function rm(i, e) {
    let t = vi(e, this.size, 4);
    i.uniformMatrix2fv(this.addr, !1, t);
  }
  function am(i, e) {
    let t = vi(e, this.size, 9);
    i.uniformMatrix3fv(this.addr, !1, t);
  }
  function om(i, e) {
    let t = vi(e, this.size, 16);
    i.uniformMatrix4fv(this.addr, !1, t);
  }
  function lm(i, e) {
    i.uniform1iv(this.addr, e);
  }
  function cm(i, e) {
    i.uniform2iv(this.addr, e);
  }
  function hm(i, e) {
    i.uniform3iv(this.addr, e);
  }
  function um(i, e) {
    i.uniform4iv(this.addr, e);
  }
  function dm(i, e) {
    i.uniform1uiv(this.addr, e);
  }
  function fm(i, e) {
    i.uniform2uiv(this.addr, e);
  }
  function pm(i, e) {
    i.uniform3uiv(this.addr, e);
  }
  function mm(i, e) {
    i.uniform4uiv(this.addr, e);
  }
  function gm(i, e, t) {
    let n = this.cache, s = e.length, r = ar(t, s);
    lt(n, r) || (i.uniform1iv(this.addr, r), ct(n, r));
    for (let a = 0; a !== s; ++a)
      t.setTexture2D(e[a] || Ic, r[a]);
  }
  function _m(i, e, t) {
    let n = this.cache, s = e.length, r = ar(t, s);
    lt(n, r) || (i.uniform1iv(this.addr, r), ct(n, r));
    for (let a = 0; a !== s; ++a)
      t.setTexture3D(e[a] || Dc, r[a]);
  }
  function xm(i, e, t) {
    let n = this.cache, s = e.length, r = ar(t, s);
    lt(n, r) || (i.uniform1iv(this.addr, r), ct(n, r));
    for (let a = 0; a !== s; ++a)
      t.setTextureCube(e[a] || Uc, r[a]);
  }
  function vm(i, e, t) {
    let n = this.cache, s = e.length, r = ar(t, s);
    lt(n, r) || (i.uniform1iv(this.addr, r), ct(n, r));
    for (let a = 0; a !== s; ++a)
      t.setTexture2DArray(e[a] || Lc, r[a]);
  }
  function ym(i) {
    switch (i) {
      case 5126:
        return tm;
      case 35664:
        return nm;
      case 35665:
        return im;
      case 35666:
        return sm;
      case 35674:
        return rm;
      case 35675:
        return am;
      case 35676:
        return om;
      case 5124:
      case 35670:
        return lm;
      case 35667:
      case 35671:
        return cm;
      case 35668:
      case 35672:
        return hm;
      case 35669:
      case 35673:
        return um;
      case 5125:
        return dm;
      case 36294:
        return fm;
      case 36295:
        return pm;
      case 36296:
        return mm;
      case 35678:
      case 36198:
      case 36298:
      case 36306:
      case 35682:
        return gm;
      case 35679:
      case 36299:
      case 36307:
        return _m;
      case 35680:
      case 36300:
      case 36308:
      case 36293:
        return xm;
      case 36289:
      case 36303:
      case 36311:
      case 36292:
        return vm;
    }
  }
  var $a = class {
    constructor(e, t, n) {
      this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = em(t.type);
    }
  }, Ja = class {
    constructor(e, t, n) {
      this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = ym(t.type);
    }
  }, Ka = class {
    constructor(e) {
      this.id = e, this.seq = [], this.map = {};
    }
    setValue(e, t, n) {
      let s = this.seq;
      for (let r = 0, a = s.length; r !== a; ++r) {
        let o = s[r];
        o.setValue(e, t[o.id], n);
      }
    }
  }, la = /(\w+)(\])?(\[|\.)?/g;
  function ec(i, e) {
    i.seq.push(e), i.map[e.id] = e;
  }
  function Mm(i, e, t) {
    let n = i.name, s = n.length;
    for (la.lastIndex = 0; ; ) {
      let r = la.exec(n), a = la.lastIndex, o = r[1], l = r[2] === "]", c = r[3];
      if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === s) {
        ec(t, c === void 0 ? new $a(o, i, e) : new Ja(o, i, e));
        break;
      } else {
        let f = t.map[o];
        f === void 0 && (f = new Ka(o), ec(t, f)), t = f;
      }
    }
  }
  var ui = class {
    constructor(e, t) {
      this.seq = [], this.map = {};
      let n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
      for (let s = 0; s < n; ++s) {
        let r = e.getActiveUniform(t, s), a = e.getUniformLocation(t, r.name);
        Mm(r, a, this);
      }
    }
    setValue(e, t, n, s) {
      let r = this.map[t];
      r !== void 0 && r.setValue(e, n, s);
    }
    setOptional(e, t, n) {
      let s = t[n];
      s !== void 0 && this.setValue(e, n, s);
    }
    static upload(e, t, n, s) {
      for (let r = 0, a = t.length; r !== a; ++r) {
        let o = t[r], l = n[o.id];
        l.needsUpdate !== !1 && o.setValue(e, l.value, s);
      }
    }
    static seqWithValue(e, t) {
      let n = [];
      for (let s = 0, r = e.length; s !== r; ++s) {
        let a = e[s];
        a.id in t && n.push(a);
      }
      return n;
    }
  };
  function tc(i, e, t) {
    let n = i.createShader(e);
    return i.shaderSource(n, t), i.compileShader(n), n;
  }
  var Sm = 37297, bm = 0;
  function Em(i, e) {
    let t = i.split(`
`), n = [], s = Math.max(e - 6, 0), r = Math.min(e + 6, t.length);
    for (let a = s; a < r; a++) {
      let o = a + 1;
      n.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
    }
    return n.join(`
`);
  }
  function wm(i) {
    let e = Xe.getPrimaries(Xe.workingColorSpace), t = Xe.getPrimaries(i), n;
    switch (e === t ? n = "" : e === Os && t === Fs ? n = "LinearDisplayP3ToLinearSRGB" : e === Fs && t === Os && (n = "LinearSRGBToLinearDisplayP3"), i) {
      case xn:
      case rr:
        return [n, "LinearTransferOETF"];
      case Ct:
      case To:
        return [n, "sRGBTransferOETF"];
      default:
        return console.warn("THREE.WebGLProgram: Unsupported color space:", i), [n, "LinearTransferOETF"];
    }
  }
  function nc(i, e, t) {
    let n = i.getShaderParameter(e, i.COMPILE_STATUS), s = i.getShaderInfoLog(e).trim();
    if (n && s === "") return "";
    let r = /ERROR: 0:(\d+)/.exec(s);
    if (r) {
      let a = parseInt(r[1]);
      return t.toUpperCase() + `

` + s + `

` + Em(i.getShaderSource(e), a);
    } else
      return s;
  }
  function Am(i, e) {
    let t = wm(e);
    return `vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
  }
  function Tm(i, e) {
    let t;
    switch (e) {
      case Qh:
        t = "Linear";
        break;
      case jh:
        t = "Reinhard";
        break;
      case eu:
        t = "OptimizedCineon";
        break;
      case tu:
        t = "ACESFilmic";
        break;
      case iu:
        t = "AgX";
        break;
      case su:
        t = "Neutral";
        break;
      case nu:
        t = "Custom";
        break;
      default:
        console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
    }
    return "vec3 " + i + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
  }
  var As = /* @__PURE__ */ new D();
  function Rm() {
    Xe.getLuminanceCoefficients(As);
    let i = As.x.toFixed(4), e = As.y.toFixed(4), t = As.z.toFixed(4);
    return [
      "float luminance( const in vec3 rgb ) {",
      `	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,
      "	return dot( weights, rgb );",
      "}"
    ].join(`
`);
  }
  function Cm(i) {
    return [
      i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
      i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
    ].filter(Ri).join(`
`);
  }
  function Pm(i) {
    let e = [];
    for (let t in i) {
      let n = i[t];
      n !== !1 && e.push("#define " + t + " " + n);
    }
    return e.join(`
`);
  }
  function Im(i, e) {
    let t = {}, n = i.getProgramParameter(e, i.ACTIVE_ATTRIBUTES);
    for (let s = 0; s < n; s++) {
      let r = i.getActiveAttrib(e, s), a = r.name, o = 1;
      r.type === i.FLOAT_MAT2 && (o = 2), r.type === i.FLOAT_MAT3 && (o = 3), r.type === i.FLOAT_MAT4 && (o = 4), t[a] = {
        type: r.type,
        location: i.getAttribLocation(e, a),
        locationSize: o
      };
    }
    return t;
  }
  function Ri(i) {
    return i !== "";
  }
  function ic(i, e) {
    let t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
    return i.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
  }
  function sc(i, e) {
    return i.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
  }
  var Lm = /^[ \t]*#include +<([\w\d./]+)>/gm;
  function Qa(i) {
    return i.replace(Lm, Um);
  }
  var Dm = /* @__PURE__ */ new Map();
  function Um(i, e) {
    let t = Pe[e];
    if (t === void 0) {
      let n = Dm.get(e);
      if (n !== void 0)
        t = Pe[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
      else
        throw new Error("Can not resolve #include <" + e + ">");
    }
    return Qa(t);
  }
  var Nm = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
  function rc(i) {
    return i.replace(Nm, Fm);
  }
  function Fm(i, e, t, n) {
    let s = "";
    for (let r = parseInt(e); r < parseInt(t); r++)
      s += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
    return s;
  }
  function ac(i) {
    let e = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
    return i.precision === "highp" ? e += `
#define HIGH_PRECISION` : i.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : i.precision === "lowp" && (e += `
#define LOW_PRECISION`), e;
  }
  function Om(i) {
    let e = "SHADOWMAP_TYPE_BASIC";
    return i.shadowMapType === fc ? e = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === Eh ? e = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === Kt && (e = "SHADOWMAP_TYPE_VSM"), e;
  }
  function Bm(i) {
    let e = "ENVMAP_TYPE_CUBE";
    if (i.envMap)
      switch (i.envMapMode) {
        case di:
        case fi:
          e = "ENVMAP_TYPE_CUBE";
          break;
        case sr:
          e = "ENVMAP_TYPE_CUBE_UV";
          break;
      }
    return e;
  }
  function zm(i) {
    let e = "ENVMAP_MODE_REFLECTION";
    if (i.envMap)
      switch (i.envMapMode) {
        case fi:
          e = "ENVMAP_MODE_REFRACTION";
          break;
      }
    return e;
  }
  function km(i) {
    let e = "ENVMAP_BLENDING_NONE";
    if (i.envMap)
      switch (i.combine) {
        case yo:
          e = "ENVMAP_BLENDING_MULTIPLY";
          break;
        case Jh:
          e = "ENVMAP_BLENDING_MIX";
          break;
        case Kh:
          e = "ENVMAP_BLENDING_ADD";
          break;
      }
    return e;
  }
  function Hm(i) {
    let e = i.envMapCubeUVHeight;
    if (e === null) return null;
    let t = Math.log2(e) - 2, n = 1 / e;
    return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: n, maxMip: t };
  }
  function Vm(i, e, t, n) {
    let s = i.getContext(), r = t.defines, a = t.vertexShader, o = t.fragmentShader, l = Om(t), c = Bm(t), h = zm(t), f = km(t), d = Hm(t), m = Cm(t), _ = Pm(r), y = s.createProgram(), p, u, w = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
    t.isRawShaderMaterial ? (p = [
      "#define SHADER_TYPE " + t.shaderType,
      "#define SHADER_NAME " + t.shaderName,
      _
    ].filter(Ri).join(`
`), p.length > 0 && (p += `
`), u = [
      "#define SHADER_TYPE " + t.shaderType,
      "#define SHADER_NAME " + t.shaderName,
      _
    ].filter(Ri).join(`
`), u.length > 0 && (u += `
`)) : (p = [
      ac(t),
      "#define SHADER_TYPE " + t.shaderType,
      "#define SHADER_NAME " + t.shaderName,
      _,
      t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
      t.batching ? "#define USE_BATCHING" : "",
      t.batchingColor ? "#define USE_BATCHING_COLOR" : "",
      t.instancing ? "#define USE_INSTANCING" : "",
      t.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
      t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
      t.useFog && t.fog ? "#define USE_FOG" : "",
      t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
      t.map ? "#define USE_MAP" : "",
      t.envMap ? "#define USE_ENVMAP" : "",
      t.envMap ? "#define " + h : "",
      t.lightMap ? "#define USE_LIGHTMAP" : "",
      t.aoMap ? "#define USE_AOMAP" : "",
      t.bumpMap ? "#define USE_BUMPMAP" : "",
      t.normalMap ? "#define USE_NORMALMAP" : "",
      t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
      t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
      t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
      t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
      t.anisotropy ? "#define USE_ANISOTROPY" : "",
      t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
      t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
      t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
      t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
      t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
      t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
      t.specularMap ? "#define USE_SPECULARMAP" : "",
      t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
      t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
      t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
      t.metalnessMap ? "#define USE_METALNESSMAP" : "",
      t.alphaMap ? "#define USE_ALPHAMAP" : "",
      t.alphaHash ? "#define USE_ALPHAHASH" : "",
      t.transmission ? "#define USE_TRANSMISSION" : "",
      t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
      t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
      t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
      t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
      //
      t.mapUv ? "#define MAP_UV " + t.mapUv : "",
      t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "",
      t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "",
      t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "",
      t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "",
      t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "",
      t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "",
      t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "",
      t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "",
      t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "",
      t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "",
      t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "",
      t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "",
      t.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv : "",
      t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "",
      t.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv : "",
      t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "",
      t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "",
      t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "",
      t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "",
      t.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv : "",
      t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "",
      t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "",
      //
      t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
      t.vertexColors ? "#define USE_COLOR" : "",
      t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
      t.vertexUv1s ? "#define USE_UV1" : "",
      t.vertexUv2s ? "#define USE_UV2" : "",
      t.vertexUv3s ? "#define USE_UV3" : "",
      t.pointsUvs ? "#define USE_POINTS_UV" : "",
      t.flatShading ? "#define FLAT_SHADED" : "",
      t.skinning ? "#define USE_SKINNING" : "",
      t.morphTargets ? "#define USE_MORPHTARGETS" : "",
      t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
      t.morphColors ? "#define USE_MORPHCOLORS" : "",
      t.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "",
      t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "",
      t.doubleSided ? "#define DOUBLE_SIDED" : "",
      t.flipSided ? "#define FLIP_SIDED" : "",
      t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
      t.shadowMapEnabled ? "#define " + l : "",
      t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
      t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
      t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
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
    ].filter(Ri).join(`
`), u = [
      ac(t),
      "#define SHADER_TYPE " + t.shaderType,
      "#define SHADER_NAME " + t.shaderName,
      _,
      t.useFog && t.fog ? "#define USE_FOG" : "",
      t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
      t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
      t.map ? "#define USE_MAP" : "",
      t.matcap ? "#define USE_MATCAP" : "",
      t.envMap ? "#define USE_ENVMAP" : "",
      t.envMap ? "#define " + c : "",
      t.envMap ? "#define " + h : "",
      t.envMap ? "#define " + f : "",
      d ? "#define CUBEUV_TEXEL_WIDTH " + d.texelWidth : "",
      d ? "#define CUBEUV_TEXEL_HEIGHT " + d.texelHeight : "",
      d ? "#define CUBEUV_MAX_MIP " + d.maxMip + ".0" : "",
      t.lightMap ? "#define USE_LIGHTMAP" : "",
      t.aoMap ? "#define USE_AOMAP" : "",
      t.bumpMap ? "#define USE_BUMPMAP" : "",
      t.normalMap ? "#define USE_NORMALMAP" : "",
      t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
      t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
      t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
      t.anisotropy ? "#define USE_ANISOTROPY" : "",
      t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
      t.clearcoat ? "#define USE_CLEARCOAT" : "",
      t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
      t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
      t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
      t.dispersion ? "#define USE_DISPERSION" : "",
      t.iridescence ? "#define USE_IRIDESCENCE" : "",
      t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
      t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
      t.specularMap ? "#define USE_SPECULARMAP" : "",
      t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
      t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
      t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
      t.metalnessMap ? "#define USE_METALNESSMAP" : "",
      t.alphaMap ? "#define USE_ALPHAMAP" : "",
      t.alphaTest ? "#define USE_ALPHATEST" : "",
      t.alphaHash ? "#define USE_ALPHAHASH" : "",
      t.sheen ? "#define USE_SHEEN" : "",
      t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
      t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
      t.transmission ? "#define USE_TRANSMISSION" : "",
      t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
      t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
      t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
      t.vertexColors || t.instancingColor || t.batchingColor ? "#define USE_COLOR" : "",
      t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
      t.vertexUv1s ? "#define USE_UV1" : "",
      t.vertexUv2s ? "#define USE_UV2" : "",
      t.vertexUv3s ? "#define USE_UV3" : "",
      t.pointsUvs ? "#define USE_POINTS_UV" : "",
      t.gradientMap ? "#define USE_GRADIENTMAP" : "",
      t.flatShading ? "#define FLAT_SHADED" : "",
      t.doubleSided ? "#define DOUBLE_SIDED" : "",
      t.flipSided ? "#define FLIP_SIDED" : "",
      t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
      t.shadowMapEnabled ? "#define " + l : "",
      t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
      t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
      t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
      t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
      "uniform mat4 viewMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      t.toneMapping !== pn ? "#define TONE_MAPPING" : "",
      t.toneMapping !== pn ? Pe.tonemapping_pars_fragment : "",
      // this code is required here because it is used by the toneMapping() function defined below
      t.toneMapping !== pn ? Tm("toneMapping", t.toneMapping) : "",
      t.dithering ? "#define DITHERING" : "",
      t.opaque ? "#define OPAQUE" : "",
      Pe.colorspace_pars_fragment,
      // this code is required here because it is used by the various encoding/decoding function defined below
      Am("linearToOutputTexel", t.outputColorSpace),
      Rm(),
      t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
      `
`
    ].filter(Ri).join(`
`)), a = Qa(a), a = ic(a, t), a = sc(a, t), o = Qa(o), o = ic(o, t), o = sc(o, t), a = rc(a), o = rc(o), t.isRawShaderMaterial !== !0 && (w = `#version 300 es
`, p = [
      m,
      "#define attribute in",
      "#define varying out",
      "#define texture2D texture"
    ].join(`
`) + `
` + p, u = [
      "#define varying in",
      t.glslVersion === Sl ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
      t.glslVersion === Sl ? "" : "#define gl_FragColor pc_fragColor",
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
` + u);
    let S = w + p + a, E = w + u + o, O = tc(s, s.VERTEX_SHADER, S), T = tc(s, s.FRAGMENT_SHADER, E);
    s.attachShader(y, O), s.attachShader(y, T), t.index0AttributeName !== void 0 ? s.bindAttribLocation(y, 0, t.index0AttributeName) : t.morphTargets === !0 && s.bindAttribLocation(y, 0, "position"), s.linkProgram(y);
    function R(P) {
      if (i.debug.checkShaderErrors) {
        let W = s.getProgramInfoLog(y).trim(), z = s.getShaderInfoLog(O).trim(), G = s.getShaderInfoLog(T).trim(), Z = !0, H = !0;
        if (s.getProgramParameter(y, s.LINK_STATUS) === !1)
          if (Z = !1, typeof i.debug.onShaderError == "function")
            i.debug.onShaderError(s, y, O, T);
          else {
            let K = nc(s, O, "vertex"), k = nc(s, T, "fragment");
            console.error(
              "THREE.WebGLProgram: Shader Error " + s.getError() + " - VALIDATE_STATUS " + s.getProgramParameter(y, s.VALIDATE_STATUS) + `

Material Name: ` + P.name + `
Material Type: ` + P.type + `

Program Info Log: ` + W + `
` + K + `
` + k
            );
          }
        else W !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", W) : (z === "" || G === "") && (H = !1);
        H && (P.diagnostics = {
          runnable: Z,
          programLog: W,
          vertexShader: {
            log: z,
            prefix: p
          },
          fragmentShader: {
            log: G,
            prefix: u
          }
        });
      }
      s.deleteShader(O), s.deleteShader(T), B = new ui(s, y), M = Im(s, y);
    }
    let B;
    this.getUniforms = function() {
      return B === void 0 && R(this), B;
    };
    let M;
    this.getAttributes = function() {
      return M === void 0 && R(this), M;
    };
    let v = t.rendererExtensionParallelShaderCompile === !1;
    return this.isReady = function() {
      return v === !1 && (v = s.getProgramParameter(y, Sm)), v;
    }, this.destroy = function() {
      n.releaseStatesOfProgram(this), s.deleteProgram(y), this.program = void 0;
    }, this.type = t.shaderType, this.name = t.shaderName, this.id = bm++, this.cacheKey = e, this.usedTimes = 1, this.program = y, this.vertexShader = O, this.fragmentShader = T, this;
  }
  var Gm = 0, ja = class {
    constructor() {
      this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
    }
    update(e) {
      let t = e.vertexShader, n = e.fragmentShader, s = this._getShaderStage(t), r = this._getShaderStage(n), a = this._getShaderCacheForMaterial(e);
      return a.has(s) === !1 && (a.add(s), s.usedTimes++), a.has(r) === !1 && (a.add(r), r.usedTimes++), this;
    }
    remove(e) {
      let t = this.materialCache.get(e);
      for (let n of t)
        n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
      return this.materialCache.delete(e), this;
    }
    getVertexShaderID(e) {
      return this._getShaderStage(e.vertexShader).id;
    }
    getFragmentShaderID(e) {
      return this._getShaderStage(e.fragmentShader).id;
    }
    dispose() {
      this.shaderCache.clear(), this.materialCache.clear();
    }
    _getShaderCacheForMaterial(e) {
      let t = this.materialCache, n = t.get(e);
      return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
    }
    _getShaderStage(e) {
      let t = this.shaderCache, n = t.get(e);
      return n === void 0 && (n = new eo(e), t.set(e, n)), n;
    }
  }, eo = class {
    constructor(e) {
      this.id = Gm++, this.code = e, this.usedTimes = 0;
    }
  };
  function Wm(i, e, t, n, s, r, a) {
    let o = new Vs(), l = new ja(), c = /* @__PURE__ */ new Set(), h = [], f = s.logarithmicDepthBuffer, d = s.vertexTextures, m = s.precision, _ = {
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
    function y(M) {
      return c.add(M), M === 0 ? "uv" : `uv${M}`;
    }
    function p(M, v, P, W, z) {
      let G = W.fog, Z = z.geometry, H = M.isMeshStandardMaterial ? W.environment : null, K = (M.isMeshStandardMaterial ? t : e).get(M.envMap || H), k = K && K.mapping === sr ? K.image.height : null, ae = _[M.type];
      M.precision !== null && (m = s.getMaxPrecision(M.precision), m !== M.precision && console.warn("THREE.WebGLProgram.getParameters:", M.precision, "not supported, using", m, "instead."));
      let he = Z.morphAttributes.position || Z.morphAttributes.normal || Z.morphAttributes.color, me = he !== void 0 ? he.length : 0, Fe = 0;
      Z.morphAttributes.position !== void 0 && (Fe = 1), Z.morphAttributes.normal !== void 0 && (Fe = 2), Z.morphAttributes.color !== void 0 && (Fe = 3);
      let Ye, V, Q, de;
      if (ae) {
        let He = Ht[ae];
        Ye = He.vertexShader, V = He.fragmentShader;
      } else
        Ye = M.vertexShader, V = M.fragmentShader, l.update(M), Q = l.getVertexShaderID(M), de = l.getFragmentShaderID(M);
      let le = i.getRenderTarget(), Te = z.isInstancedMesh === !0, Le = z.isBatchedMesh === !0, Ue = !!M.map, Qe = !!M.matcap, A = !!K, tt = !!M.aoMap, qe = !!M.lightMap, Ze = !!M.bumpMap, _e = !!M.normalMap, nt = !!M.displacementMap, we = !!M.emissiveMap, Re = !!M.metalnessMap, b = !!M.roughnessMap, g = M.anisotropy > 0, F = M.clearcoat > 0, $ = M.dispersion > 0, J = M.iridescence > 0, Y = M.sheen > 0, xe = M.transmission > 0, se = g && !!M.anisotropyMap, ce = F && !!M.clearcoatMap, Ce = F && !!M.clearcoatNormalMap, j = F && !!M.clearcoatRoughnessMap, oe = J && !!M.iridescenceMap, Oe = J && !!M.iridescenceThicknessMap, Ee = Y && !!M.sheenColorMap, ue = Y && !!M.sheenRoughnessMap, Ae = !!M.specularMap, De = !!M.specularColorMap, Ke = !!M.specularIntensityMap, C = xe && !!M.transmissionMap, ee = xe && !!M.thicknessMap, X = !!M.gradientMap, q = !!M.alphaMap, ne = M.alphaTest > 0, ye = !!M.alphaHash, Be = !!M.extensions, it = pn;
      M.toneMapped && (le === null || le.isXRRenderTarget === !0) && (it = i.toneMapping);
      let ut = {
        shaderID: ae,
        shaderType: M.type,
        shaderName: M.name,
        vertexShader: Ye,
        fragmentShader: V,
        defines: M.defines,
        customVertexShaderID: Q,
        customFragmentShaderID: de,
        isRawShaderMaterial: M.isRawShaderMaterial === !0,
        glslVersion: M.glslVersion,
        precision: m,
        batching: Le,
        batchingColor: Le && z._colorsTexture !== null,
        instancing: Te,
        instancingColor: Te && z.instanceColor !== null,
        instancingMorph: Te && z.morphTexture !== null,
        supportsVertexTextures: d,
        outputColorSpace: le === null ? i.outputColorSpace : le.isXRRenderTarget === !0 ? le.texture.colorSpace : xn,
        alphaToCoverage: !!M.alphaToCoverage,
        map: Ue,
        matcap: Qe,
        envMap: A,
        envMapMode: A && K.mapping,
        envMapCubeUVHeight: k,
        aoMap: tt,
        lightMap: qe,
        bumpMap: Ze,
        normalMap: _e,
        displacementMap: d && nt,
        emissiveMap: we,
        normalMapObjectSpace: _e && M.normalMapType === lu,
        normalMapTangentSpace: _e && M.normalMapType === wc,
        metalnessMap: Re,
        roughnessMap: b,
        anisotropy: g,
        anisotropyMap: se,
        clearcoat: F,
        clearcoatMap: ce,
        clearcoatNormalMap: Ce,
        clearcoatRoughnessMap: j,
        dispersion: $,
        iridescence: J,
        iridescenceMap: oe,
        iridescenceThicknessMap: Oe,
        sheen: Y,
        sheenColorMap: Ee,
        sheenRoughnessMap: ue,
        specularMap: Ae,
        specularColorMap: De,
        specularIntensityMap: Ke,
        transmission: xe,
        transmissionMap: C,
        thicknessMap: ee,
        gradientMap: X,
        opaque: M.transparent === !1 && M.blending === li && M.alphaToCoverage === !1,
        alphaMap: q,
        alphaTest: ne,
        alphaHash: ye,
        combine: M.combine,
        //
        mapUv: Ue && y(M.map.channel),
        aoMapUv: tt && y(M.aoMap.channel),
        lightMapUv: qe && y(M.lightMap.channel),
        bumpMapUv: Ze && y(M.bumpMap.channel),
        normalMapUv: _e && y(M.normalMap.channel),
        displacementMapUv: nt && y(M.displacementMap.channel),
        emissiveMapUv: we && y(M.emissiveMap.channel),
        metalnessMapUv: Re && y(M.metalnessMap.channel),
        roughnessMapUv: b && y(M.roughnessMap.channel),
        anisotropyMapUv: se && y(M.anisotropyMap.channel),
        clearcoatMapUv: ce && y(M.clearcoatMap.channel),
        clearcoatNormalMapUv: Ce && y(M.clearcoatNormalMap.channel),
        clearcoatRoughnessMapUv: j && y(M.clearcoatRoughnessMap.channel),
        iridescenceMapUv: oe && y(M.iridescenceMap.channel),
        iridescenceThicknessMapUv: Oe && y(M.iridescenceThicknessMap.channel),
        sheenColorMapUv: Ee && y(M.sheenColorMap.channel),
        sheenRoughnessMapUv: ue && y(M.sheenRoughnessMap.channel),
        specularMapUv: Ae && y(M.specularMap.channel),
        specularColorMapUv: De && y(M.specularColorMap.channel),
        specularIntensityMapUv: Ke && y(M.specularIntensityMap.channel),
        transmissionMapUv: C && y(M.transmissionMap.channel),
        thicknessMapUv: ee && y(M.thicknessMap.channel),
        alphaMapUv: q && y(M.alphaMap.channel),
        //
        vertexTangents: !!Z.attributes.tangent && (_e || g),
        vertexColors: M.vertexColors,
        vertexAlphas: M.vertexColors === !0 && !!Z.attributes.color && Z.attributes.color.itemSize === 4,
        pointsUvs: z.isPoints === !0 && !!Z.attributes.uv && (Ue || q),
        fog: !!G,
        useFog: M.fog === !0,
        fogExp2: !!G && G.isFogExp2,
        flatShading: M.flatShading === !0,
        sizeAttenuation: M.sizeAttenuation === !0,
        logarithmicDepthBuffer: f,
        skinning: z.isSkinnedMesh === !0,
        morphTargets: Z.morphAttributes.position !== void 0,
        morphNormals: Z.morphAttributes.normal !== void 0,
        morphColors: Z.morphAttributes.color !== void 0,
        morphTargetsCount: me,
        morphTextureStride: Fe,
        numDirLights: v.directional.length,
        numPointLights: v.point.length,
        numSpotLights: v.spot.length,
        numSpotLightMaps: v.spotLightMap.length,
        numRectAreaLights: v.rectArea.length,
        numHemiLights: v.hemi.length,
        numDirLightShadows: v.directionalShadowMap.length,
        numPointLightShadows: v.pointShadowMap.length,
        numSpotLightShadows: v.spotShadowMap.length,
        numSpotLightShadowsWithMaps: v.numSpotLightShadowsWithMaps,
        numLightProbes: v.numLightProbes,
        numClippingPlanes: a.numPlanes,
        numClipIntersection: a.numIntersection,
        dithering: M.dithering,
        shadowMapEnabled: i.shadowMap.enabled && P.length > 0,
        shadowMapType: i.shadowMap.type,
        toneMapping: it,
        decodeVideoTexture: Ue && M.map.isVideoTexture === !0 && Xe.getTransfer(M.map.colorSpace) === $e,
        premultipliedAlpha: M.premultipliedAlpha,
        doubleSided: M.side === Qt,
        flipSided: M.side === vt,
        useDepthPacking: M.depthPacking >= 0,
        depthPacking: M.depthPacking || 0,
        index0AttributeName: M.index0AttributeName,
        extensionClipCullDistance: Be && M.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
        extensionMultiDraw: (Be && M.extensions.multiDraw === !0 || Le) && n.has("WEBGL_multi_draw"),
        rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
        customProgramCacheKey: M.customProgramCacheKey()
      };
      return ut.vertexUv1s = c.has(1), ut.vertexUv2s = c.has(2), ut.vertexUv3s = c.has(3), c.clear(), ut;
    }
    function u(M) {
      let v = [];
      if (M.shaderID ? v.push(M.shaderID) : (v.push(M.customVertexShaderID), v.push(M.customFragmentShaderID)), M.defines !== void 0)
        for (let P in M.defines)
          v.push(P), v.push(M.defines[P]);
      return M.isRawShaderMaterial === !1 && (w(v, M), S(v, M), v.push(i.outputColorSpace)), v.push(M.customProgramCacheKey), v.join();
    }
    function w(M, v) {
      M.push(v.precision), M.push(v.outputColorSpace), M.push(v.envMapMode), M.push(v.envMapCubeUVHeight), M.push(v.mapUv), M.push(v.alphaMapUv), M.push(v.lightMapUv), M.push(v.aoMapUv), M.push(v.bumpMapUv), M.push(v.normalMapUv), M.push(v.displacementMapUv), M.push(v.emissiveMapUv), M.push(v.metalnessMapUv), M.push(v.roughnessMapUv), M.push(v.anisotropyMapUv), M.push(v.clearcoatMapUv), M.push(v.clearcoatNormalMapUv), M.push(v.clearcoatRoughnessMapUv), M.push(v.iridescenceMapUv), M.push(v.iridescenceThicknessMapUv), M.push(v.sheenColorMapUv), M.push(v.sheenRoughnessMapUv), M.push(v.specularMapUv), M.push(v.specularColorMapUv), M.push(v.specularIntensityMapUv), M.push(v.transmissionMapUv), M.push(v.thicknessMapUv), M.push(v.combine), M.push(v.fogExp2), M.push(v.sizeAttenuation), M.push(v.morphTargetsCount), M.push(v.morphAttributeCount), M.push(v.numDirLights), M.push(v.numPointLights), M.push(v.numSpotLights), M.push(v.numSpotLightMaps), M.push(v.numHemiLights), M.push(v.numRectAreaLights), M.push(v.numDirLightShadows), M.push(v.numPointLightShadows), M.push(v.numSpotLightShadows), M.push(v.numSpotLightShadowsWithMaps), M.push(v.numLightProbes), M.push(v.shadowMapType), M.push(v.toneMapping), M.push(v.numClippingPlanes), M.push(v.numClipIntersection), M.push(v.depthPacking);
    }
    function S(M, v) {
      o.disableAll(), v.supportsVertexTextures && o.enable(0), v.instancing && o.enable(1), v.instancingColor && o.enable(2), v.instancingMorph && o.enable(3), v.matcap && o.enable(4), v.envMap && o.enable(5), v.normalMapObjectSpace && o.enable(6), v.normalMapTangentSpace && o.enable(7), v.clearcoat && o.enable(8), v.iridescence && o.enable(9), v.alphaTest && o.enable(10), v.vertexColors && o.enable(11), v.vertexAlphas && o.enable(12), v.vertexUv1s && o.enable(13), v.vertexUv2s && o.enable(14), v.vertexUv3s && o.enable(15), v.vertexTangents && o.enable(16), v.anisotropy && o.enable(17), v.alphaHash && o.enable(18), v.batching && o.enable(19), v.dispersion && o.enable(20), v.batchingColor && o.enable(21), M.push(o.mask), o.disableAll(), v.fog && o.enable(0), v.useFog && o.enable(1), v.flatShading && o.enable(2), v.logarithmicDepthBuffer && o.enable(3), v.skinning && o.enable(4), v.morphTargets && o.enable(5), v.morphNormals && o.enable(6), v.morphColors && o.enable(7), v.premultipliedAlpha && o.enable(8), v.shadowMapEnabled && o.enable(9), v.doubleSided && o.enable(10), v.flipSided && o.enable(11), v.useDepthPacking && o.enable(12), v.dithering && o.enable(13), v.transmission && o.enable(14), v.sheen && o.enable(15), v.opaque && o.enable(16), v.pointsUvs && o.enable(17), v.decodeVideoTexture && o.enable(18), v.alphaToCoverage && o.enable(19), M.push(o.mask);
    }
    function E(M) {
      let v = _[M.type], P;
      if (v) {
        let W = Ht[v];
        P = Du.clone(W.uniforms);
      } else
        P = M.uniforms;
      return P;
    }
    function O(M, v) {
      let P;
      for (let W = 0, z = h.length; W < z; W++) {
        let G = h[W];
        if (G.cacheKey === v) {
          P = G, ++P.usedTimes;
          break;
        }
      }
      return P === void 0 && (P = new Vm(i, v, M, r), h.push(P)), P;
    }
    function T(M) {
      if (--M.usedTimes === 0) {
        let v = h.indexOf(M);
        h[v] = h[h.length - 1], h.pop(), M.destroy();
      }
    }
    function R(M) {
      l.remove(M);
    }
    function B() {
      l.dispose();
    }
    return {
      getParameters: p,
      getProgramCacheKey: u,
      getUniforms: E,
      acquireProgram: O,
      releaseProgram: T,
      releaseShaderCache: R,
      // Exposed for resource monitoring & error feedback via renderer.info:
      programs: h,
      dispose: B
    };
  }
  function Xm() {
    let i = /* @__PURE__ */ new WeakMap();
    function e(r) {
      let a = i.get(r);
      return a === void 0 && (a = {}, i.set(r, a)), a;
    }
    function t(r) {
      i.delete(r);
    }
    function n(r, a, o) {
      i.get(r)[a] = o;
    }
    function s() {
      i = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: e,
      remove: t,
      update: n,
      dispose: s
    };
  }
  function qm(i, e) {
    return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.material.id !== e.material.id ? i.material.id - e.material.id : i.z !== e.z ? i.z - e.z : i.id - e.id;
  }
  function oc(i, e) {
    return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.z !== e.z ? e.z - i.z : i.id - e.id;
  }
  function lc() {
    let i = [], e = 0, t = [], n = [], s = [];
    function r() {
      e = 0, t.length = 0, n.length = 0, s.length = 0;
    }
    function a(f, d, m, _, y, p) {
      let u = i[e];
      return u === void 0 ? (u = {
        id: f.id,
        object: f,
        geometry: d,
        material: m,
        groupOrder: _,
        renderOrder: f.renderOrder,
        z: y,
        group: p
      }, i[e] = u) : (u.id = f.id, u.object = f, u.geometry = d, u.material = m, u.groupOrder = _, u.renderOrder = f.renderOrder, u.z = y, u.group = p), e++, u;
    }
    function o(f, d, m, _, y, p) {
      let u = a(f, d, m, _, y, p);
      m.transmission > 0 ? n.push(u) : m.transparent === !0 ? s.push(u) : t.push(u);
    }
    function l(f, d, m, _, y, p) {
      let u = a(f, d, m, _, y, p);
      m.transmission > 0 ? n.unshift(u) : m.transparent === !0 ? s.unshift(u) : t.unshift(u);
    }
    function c(f, d) {
      t.length > 1 && t.sort(f || qm), n.length > 1 && n.sort(d || oc), s.length > 1 && s.sort(d || oc);
    }
    function h() {
      for (let f = e, d = i.length; f < d; f++) {
        let m = i[f];
        if (m.id === null) break;
        m.id = null, m.object = null, m.geometry = null, m.material = null, m.group = null;
      }
    }
    return {
      opaque: t,
      transmissive: n,
      transparent: s,
      init: r,
      push: o,
      unshift: l,
      finish: h,
      sort: c
    };
  }
  function Ym() {
    let i = /* @__PURE__ */ new WeakMap();
    function e(n, s) {
      let r = i.get(n), a;
      return r === void 0 ? (a = new lc(), i.set(n, [a])) : s >= r.length ? (a = new lc(), r.push(a)) : a = r[s], a;
    }
    function t() {
      i = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: e,
      dispose: t
    };
  }
  function Zm() {
    let i = {};
    return {
      get: function(e) {
        if (i[e.id] !== void 0)
          return i[e.id];
        let t;
        switch (e.type) {
          case "DirectionalLight":
            t = {
              direction: new D(),
              color: new Ne()
            };
            break;
          case "SpotLight":
            t = {
              position: new D(),
              direction: new D(),
              color: new Ne(),
              distance: 0,
              coneCos: 0,
              penumbraCos: 0,
              decay: 0
            };
            break;
          case "PointLight":
            t = {
              position: new D(),
              color: new Ne(),
              distance: 0,
              decay: 0
            };
            break;
          case "HemisphereLight":
            t = {
              direction: new D(),
              skyColor: new Ne(),
              groundColor: new Ne()
            };
            break;
          case "RectAreaLight":
            t = {
              color: new Ne(),
              position: new D(),
              halfWidth: new D(),
              halfHeight: new D()
            };
            break;
        }
        return i[e.id] = t, t;
      }
    };
  }
  function $m() {
    let i = {};
    return {
      get: function(e) {
        if (i[e.id] !== void 0)
          return i[e.id];
        let t;
        switch (e.type) {
          case "DirectionalLight":
            t = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new ke()
            };
            break;
          case "SpotLight":
            t = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new ke()
            };
            break;
          case "PointLight":
            t = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new ke(),
              shadowCameraNear: 1,
              shadowCameraFar: 1e3
            };
            break;
        }
        return i[e.id] = t, t;
      }
    };
  }
  var Jm = 0;
  function Km(i, e) {
    return (e.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (i.map ? 1 : 0);
  }
  function Qm(i) {
    let e = new Zm(), t = $m(), n = {
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
    for (let c = 0; c < 9; c++) n.probe.push(new D());
    let s = new D(), r = new at(), a = new at();
    function o(c) {
      let h = 0, f = 0, d = 0;
      for (let M = 0; M < 9; M++) n.probe[M].set(0, 0, 0);
      let m = 0, _ = 0, y = 0, p = 0, u = 0, w = 0, S = 0, E = 0, O = 0, T = 0, R = 0;
      c.sort(Km);
      for (let M = 0, v = c.length; M < v; M++) {
        let P = c[M], W = P.color, z = P.intensity, G = P.distance, Z = P.shadow && P.shadow.map ? P.shadow.map.texture : null;
        if (P.isAmbientLight)
          h += W.r * z, f += W.g * z, d += W.b * z;
        else if (P.isLightProbe) {
          for (let H = 0; H < 9; H++)
            n.probe[H].addScaledVector(P.sh.coefficients[H], z);
          R++;
        } else if (P.isDirectionalLight) {
          let H = e.get(P);
          if (H.color.copy(P.color).multiplyScalar(P.intensity), P.castShadow) {
            let K = P.shadow, k = t.get(P);
            k.shadowIntensity = K.intensity, k.shadowBias = K.bias, k.shadowNormalBias = K.normalBias, k.shadowRadius = K.radius, k.shadowMapSize = K.mapSize, n.directionalShadow[m] = k, n.directionalShadowMap[m] = Z, n.directionalShadowMatrix[m] = P.shadow.matrix, w++;
          }
          n.directional[m] = H, m++;
        } else if (P.isSpotLight) {
          let H = e.get(P);
          H.position.setFromMatrixPosition(P.matrixWorld), H.color.copy(W).multiplyScalar(z), H.distance = G, H.coneCos = Math.cos(P.angle), H.penumbraCos = Math.cos(P.angle * (1 - P.penumbra)), H.decay = P.decay, n.spot[y] = H;
          let K = P.shadow;
          if (P.map && (n.spotLightMap[O] = P.map, O++, K.updateMatrices(P), P.castShadow && T++), n.spotLightMatrix[y] = K.matrix, P.castShadow) {
            let k = t.get(P);
            k.shadowIntensity = K.intensity, k.shadowBias = K.bias, k.shadowNormalBias = K.normalBias, k.shadowRadius = K.radius, k.shadowMapSize = K.mapSize, n.spotShadow[y] = k, n.spotShadowMap[y] = Z, E++;
          }
          y++;
        } else if (P.isRectAreaLight) {
          let H = e.get(P);
          H.color.copy(W).multiplyScalar(z), H.halfWidth.set(P.width * 0.5, 0, 0), H.halfHeight.set(0, P.height * 0.5, 0), n.rectArea[p] = H, p++;
        } else if (P.isPointLight) {
          let H = e.get(P);
          if (H.color.copy(P.color).multiplyScalar(P.intensity), H.distance = P.distance, H.decay = P.decay, P.castShadow) {
            let K = P.shadow, k = t.get(P);
            k.shadowIntensity = K.intensity, k.shadowBias = K.bias, k.shadowNormalBias = K.normalBias, k.shadowRadius = K.radius, k.shadowMapSize = K.mapSize, k.shadowCameraNear = K.camera.near, k.shadowCameraFar = K.camera.far, n.pointShadow[_] = k, n.pointShadowMap[_] = Z, n.pointShadowMatrix[_] = P.shadow.matrix, S++;
          }
          n.point[_] = H, _++;
        } else if (P.isHemisphereLight) {
          let H = e.get(P);
          H.skyColor.copy(P.color).multiplyScalar(z), H.groundColor.copy(P.groundColor).multiplyScalar(z), n.hemi[u] = H, u++;
        }
      }
      p > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = ie.LTC_FLOAT_1, n.rectAreaLTC2 = ie.LTC_FLOAT_2) : (n.rectAreaLTC1 = ie.LTC_HALF_1, n.rectAreaLTC2 = ie.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = f, n.ambient[2] = d;
      let B = n.hash;
      (B.directionalLength !== m || B.pointLength !== _ || B.spotLength !== y || B.rectAreaLength !== p || B.hemiLength !== u || B.numDirectionalShadows !== w || B.numPointShadows !== S || B.numSpotShadows !== E || B.numSpotMaps !== O || B.numLightProbes !== R) && (n.directional.length = m, n.spot.length = y, n.rectArea.length = p, n.point.length = _, n.hemi.length = u, n.directionalShadow.length = w, n.directionalShadowMap.length = w, n.pointShadow.length = S, n.pointShadowMap.length = S, n.spotShadow.length = E, n.spotShadowMap.length = E, n.directionalShadowMatrix.length = w, n.pointShadowMatrix.length = S, n.spotLightMatrix.length = E + O - T, n.spotLightMap.length = O, n.numSpotLightShadowsWithMaps = T, n.numLightProbes = R, B.directionalLength = m, B.pointLength = _, B.spotLength = y, B.rectAreaLength = p, B.hemiLength = u, B.numDirectionalShadows = w, B.numPointShadows = S, B.numSpotShadows = E, B.numSpotMaps = O, B.numLightProbes = R, n.version = Jm++);
    }
    function l(c, h) {
      let f = 0, d = 0, m = 0, _ = 0, y = 0, p = h.matrixWorldInverse;
      for (let u = 0, w = c.length; u < w; u++) {
        let S = c[u];
        if (S.isDirectionalLight) {
          let E = n.directional[f];
          E.direction.setFromMatrixPosition(S.matrixWorld), s.setFromMatrixPosition(S.target.matrixWorld), E.direction.sub(s), E.direction.transformDirection(p), f++;
        } else if (S.isSpotLight) {
          let E = n.spot[m];
          E.position.setFromMatrixPosition(S.matrixWorld), E.position.applyMatrix4(p), E.direction.setFromMatrixPosition(S.matrixWorld), s.setFromMatrixPosition(S.target.matrixWorld), E.direction.sub(s), E.direction.transformDirection(p), m++;
        } else if (S.isRectAreaLight) {
          let E = n.rectArea[_];
          E.position.setFromMatrixPosition(S.matrixWorld), E.position.applyMatrix4(p), a.identity(), r.copy(S.matrixWorld), r.premultiply(p), a.extractRotation(r), E.halfWidth.set(S.width * 0.5, 0, 0), E.halfHeight.set(0, S.height * 0.5, 0), E.halfWidth.applyMatrix4(a), E.halfHeight.applyMatrix4(a), _++;
        } else if (S.isPointLight) {
          let E = n.point[d];
          E.position.setFromMatrixPosition(S.matrixWorld), E.position.applyMatrix4(p), d++;
        } else if (S.isHemisphereLight) {
          let E = n.hemi[y];
          E.direction.setFromMatrixPosition(S.matrixWorld), E.direction.transformDirection(p), y++;
        }
      }
    }
    return {
      setup: o,
      setupView: l,
      state: n
    };
  }
  function cc(i) {
    let e = new Qm(i), t = [], n = [];
    function s(h) {
      c.camera = h, t.length = 0, n.length = 0;
    }
    function r(h) {
      t.push(h);
    }
    function a(h) {
      n.push(h);
    }
    function o() {
      e.setup(t);
    }
    function l(h) {
      e.setupView(t, h);
    }
    let c = {
      lightsArray: t,
      shadowsArray: n,
      camera: null,
      lights: e,
      transmissionRenderTarget: {}
    };
    return {
      init: s,
      state: c,
      setupLights: o,
      setupLightsView: l,
      pushLight: r,
      pushShadow: a
    };
  }
  function jm(i) {
    let e = /* @__PURE__ */ new WeakMap();
    function t(s, r = 0) {
      let a = e.get(s), o;
      return a === void 0 ? (o = new cc(i), e.set(s, [o])) : r >= a.length ? (o = new cc(i), a.push(o)) : o = a[r], o;
    }
    function n() {
      e = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: t,
      dispose: n
    };
  }
  var to = class extends Dn {
    constructor(e) {
      super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = au, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
    }
  }, no = class extends Dn {
    constructor(e) {
      super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
    }
  }, eg = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, tg = `uniform sampler2D shadow_pass;
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
  function ng(i, e, t) {
    let n = new Ni(), s = new ke(), r = new ke(), a = new ot(), o = new to({ depthPacking: ou }), l = new no(), c = {}, h = t.maxTextureSize, f = { [mn]: vt, [vt]: mn, [Qt]: Qt }, d = new Gt({
      defines: {
        VSM_SAMPLES: 8
      },
      uniforms: {
        shadow_pass: { value: null },
        resolution: { value: new ke() },
        radius: { value: 4 }
      },
      vertexShader: eg,
      fragmentShader: tg
    }), m = d.clone();
    m.defines.HORIZONTAL_PASS = 1;
    let _ = new Un();
    _.setAttribute(
      "position",
      new It(
        new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
        3
      )
    );
    let y = new wt(_, d), p = this;
    this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = fc;
    let u = this.type;
    this.render = function(T, R, B) {
      if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || T.length === 0) return;
      let M = i.getRenderTarget(), v = i.getActiveCubeFace(), P = i.getActiveMipmapLevel(), W = i.state;
      W.setBlending(fn), W.buffers.color.setClear(1, 1, 1, 1), W.buffers.depth.setTest(!0), W.setScissorTest(!1);
      let z = u !== Kt && this.type === Kt, G = u === Kt && this.type !== Kt;
      for (let Z = 0, H = T.length; Z < H; Z++) {
        let K = T[Z], k = K.shadow;
        if (k === void 0) {
          console.warn("THREE.WebGLShadowMap:", K, "has no shadow.");
          continue;
        }
        if (k.autoUpdate === !1 && k.needsUpdate === !1) continue;
        s.copy(k.mapSize);
        let ae = k.getFrameExtents();
        if (s.multiply(ae), r.copy(k.mapSize), (s.x > h || s.y > h) && (s.x > h && (r.x = Math.floor(h / ae.x), s.x = r.x * ae.x, k.mapSize.x = r.x), s.y > h && (r.y = Math.floor(h / ae.y), s.y = r.y * ae.y, k.mapSize.y = r.y)), k.map === null || z === !0 || G === !0) {
          let me = this.type !== Kt ? { minFilter: Pt, magFilter: Pt } : {};
          k.map !== null && k.map.dispose(), k.map = new sn(s.x, s.y, me), k.map.texture.name = K.name + ".shadowMap", k.camera.updateProjectionMatrix();
        }
        i.setRenderTarget(k.map), i.clear();
        let he = k.getViewportCount();
        for (let me = 0; me < he; me++) {
          let Fe = k.getViewport(me);
          a.set(
            r.x * Fe.x,
            r.y * Fe.y,
            r.x * Fe.z,
            r.y * Fe.w
          ), W.viewport(a), k.updateMatrices(K, me), n = k.getFrustum(), E(R, B, k.camera, K, this.type);
        }
        k.isPointLightShadow !== !0 && this.type === Kt && w(k, B), k.needsUpdate = !1;
      }
      u = this.type, p.needsUpdate = !1, i.setRenderTarget(M, v, P);
    };
    function w(T, R) {
      let B = e.update(y);
      d.defines.VSM_SAMPLES !== T.blurSamples && (d.defines.VSM_SAMPLES = T.blurSamples, m.defines.VSM_SAMPLES = T.blurSamples, d.needsUpdate = !0, m.needsUpdate = !0), T.mapPass === null && (T.mapPass = new sn(s.x, s.y)), d.uniforms.shadow_pass.value = T.map.texture, d.uniforms.resolution.value = T.mapSize, d.uniforms.radius.value = T.radius, i.setRenderTarget(T.mapPass), i.clear(), i.renderBufferDirect(R, null, B, d, y, null), m.uniforms.shadow_pass.value = T.mapPass.texture, m.uniforms.resolution.value = T.mapSize, m.uniforms.radius.value = T.radius, i.setRenderTarget(T.map), i.clear(), i.renderBufferDirect(R, null, B, m, y, null);
    }
    function S(T, R, B, M) {
      let v = null, P = B.isPointLight === !0 ? T.customDistanceMaterial : T.customDepthMaterial;
      if (P !== void 0)
        v = P;
      else if (v = B.isPointLight === !0 ? l : o, i.localClippingEnabled && R.clipShadows === !0 && Array.isArray(R.clippingPlanes) && R.clippingPlanes.length !== 0 || R.displacementMap && R.displacementScale !== 0 || R.alphaMap && R.alphaTest > 0 || R.map && R.alphaTest > 0) {
        let W = v.uuid, z = R.uuid, G = c[W];
        G === void 0 && (G = {}, c[W] = G);
        let Z = G[z];
        Z === void 0 && (Z = v.clone(), G[z] = Z, R.addEventListener("dispose", O)), v = Z;
      }
      if (v.visible = R.visible, v.wireframe = R.wireframe, M === Kt ? v.side = R.shadowSide !== null ? R.shadowSide : R.side : v.side = R.shadowSide !== null ? R.shadowSide : f[R.side], v.alphaMap = R.alphaMap, v.alphaTest = R.alphaTest, v.map = R.map, v.clipShadows = R.clipShadows, v.clippingPlanes = R.clippingPlanes, v.clipIntersection = R.clipIntersection, v.displacementMap = R.displacementMap, v.displacementScale = R.displacementScale, v.displacementBias = R.displacementBias, v.wireframeLinewidth = R.wireframeLinewidth, v.linewidth = R.linewidth, B.isPointLight === !0 && v.isMeshDistanceMaterial === !0) {
        let W = i.properties.get(v);
        W.light = B;
      }
      return v;
    }
    function E(T, R, B, M, v) {
      if (T.visible === !1) return;
      if (T.layers.test(R.layers) && (T.isMesh || T.isLine || T.isPoints) && (T.castShadow || T.receiveShadow && v === Kt) && (!T.frustumCulled || n.intersectsObject(T))) {
        T.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse, T.matrixWorld);
        let z = e.update(T), G = T.material;
        if (Array.isArray(G)) {
          let Z = z.groups;
          for (let H = 0, K = Z.length; H < K; H++) {
            let k = Z[H], ae = G[k.materialIndex];
            if (ae && ae.visible) {
              let he = S(T, ae, M, v);
              T.onBeforeShadow(i, T, R, B, z, he, k), i.renderBufferDirect(B, null, z, he, T, k), T.onAfterShadow(i, T, R, B, z, he, k);
            }
          }
        } else if (G.visible) {
          let Z = S(T, G, M, v);
          T.onBeforeShadow(i, T, R, B, z, Z, null), i.renderBufferDirect(B, null, z, Z, T, null), T.onAfterShadow(i, T, R, B, z, Z, null);
        }
      }
      let W = T.children;
      for (let z = 0, G = W.length; z < G; z++)
        E(W[z], R, B, M, v);
    }
    function O(T) {
      T.target.removeEventListener("dispose", O);
      for (let B in c) {
        let M = c[B], v = T.target.uuid;
        v in M && (M[v].dispose(), delete M[v]);
      }
    }
  }
  function ig(i) {
    function e() {
      let C = !1, ee = new ot(), X = null, q = new ot(0, 0, 0, 0);
      return {
        setMask: function(ne) {
          X !== ne && !C && (i.colorMask(ne, ne, ne, ne), X = ne);
        },
        setLocked: function(ne) {
          C = ne;
        },
        setClear: function(ne, ye, Be, it, ut) {
          ut === !0 && (ne *= it, ye *= it, Be *= it), ee.set(ne, ye, Be, it), q.equals(ee) === !1 && (i.clearColor(ne, ye, Be, it), q.copy(ee));
        },
        reset: function() {
          C = !1, X = null, q.set(-1, 0, 0, 0);
        }
      };
    }
    function t() {
      let C = !1, ee = null, X = null, q = null;
      return {
        setTest: function(ne) {
          ne ? de(i.DEPTH_TEST) : le(i.DEPTH_TEST);
        },
        setMask: function(ne) {
          ee !== ne && !C && (i.depthMask(ne), ee = ne);
        },
        setFunc: function(ne) {
          if (X !== ne) {
            switch (ne) {
              case Gh:
                i.depthFunc(i.NEVER);
                break;
              case Wh:
                i.depthFunc(i.ALWAYS);
                break;
              case Xh:
                i.depthFunc(i.LESS);
                break;
              case Ds:
                i.depthFunc(i.LEQUAL);
                break;
              case qh:
                i.depthFunc(i.EQUAL);
                break;
              case Yh:
                i.depthFunc(i.GEQUAL);
                break;
              case Zh:
                i.depthFunc(i.GREATER);
                break;
              case $h:
                i.depthFunc(i.NOTEQUAL);
                break;
              default:
                i.depthFunc(i.LEQUAL);
            }
            X = ne;
          }
        },
        setLocked: function(ne) {
          C = ne;
        },
        setClear: function(ne) {
          q !== ne && (i.clearDepth(ne), q = ne);
        },
        reset: function() {
          C = !1, ee = null, X = null, q = null;
        }
      };
    }
    function n() {
      let C = !1, ee = null, X = null, q = null, ne = null, ye = null, Be = null, it = null, ut = null;
      return {
        setTest: function(He) {
          C || (He ? de(i.STENCIL_TEST) : le(i.STENCIL_TEST));
        },
        setMask: function(He) {
          ee !== He && !C && (i.stencilMask(He), ee = He);
        },
        setFunc: function(He, Wt, kt) {
          (X !== He || q !== Wt || ne !== kt) && (i.stencilFunc(He, Wt, kt), X = He, q = Wt, ne = kt);
        },
        setOp: function(He, Wt, kt) {
          (ye !== He || Be !== Wt || it !== kt) && (i.stencilOp(He, Wt, kt), ye = He, Be = Wt, it = kt);
        },
        setLocked: function(He) {
          C = He;
        },
        setClear: function(He) {
          ut !== He && (i.clearStencil(He), ut = He);
        },
        reset: function() {
          C = !1, ee = null, X = null, q = null, ne = null, ye = null, Be = null, it = null, ut = null;
        }
      };
    }
    let s = new e(), r = new t(), a = new n(), o = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), c = {}, h = {}, f = /* @__PURE__ */ new WeakMap(), d = [], m = null, _ = !1, y = null, p = null, u = null, w = null, S = null, E = null, O = null, T = new Ne(0, 0, 0), R = 0, B = !1, M = null, v = null, P = null, W = null, z = null, G = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS), Z = !1, H = 0, K = i.getParameter(i.VERSION);
    K.indexOf("WebGL") !== -1 ? (H = parseFloat(/^WebGL (\d)/.exec(K)[1]), Z = H >= 1) : K.indexOf("OpenGL ES") !== -1 && (H = parseFloat(/^OpenGL ES (\d)/.exec(K)[1]), Z = H >= 2);
    let k = null, ae = {}, he = i.getParameter(i.SCISSOR_BOX), me = i.getParameter(i.VIEWPORT), Fe = new ot().fromArray(he), Ye = new ot().fromArray(me);
    function V(C, ee, X, q) {
      let ne = new Uint8Array(4), ye = i.createTexture();
      i.bindTexture(C, ye), i.texParameteri(C, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(C, i.TEXTURE_MAG_FILTER, i.NEAREST);
      for (let Be = 0; Be < X; Be++)
        C === i.TEXTURE_3D || C === i.TEXTURE_2D_ARRAY ? i.texImage3D(ee, 0, i.RGBA, 1, 1, q, 0, i.RGBA, i.UNSIGNED_BYTE, ne) : i.texImage2D(ee + Be, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, ne);
      return ye;
    }
    let Q = {};
    Q[i.TEXTURE_2D] = V(i.TEXTURE_2D, i.TEXTURE_2D, 1), Q[i.TEXTURE_CUBE_MAP] = V(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), Q[i.TEXTURE_2D_ARRAY] = V(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), Q[i.TEXTURE_3D] = V(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), r.setClear(1), a.setClear(0), de(i.DEPTH_TEST), r.setFunc(Ds), Ze(!1), _e(fl), de(i.CULL_FACE), tt(fn);
    function de(C) {
      c[C] !== !0 && (i.enable(C), c[C] = !0);
    }
    function le(C) {
      c[C] !== !1 && (i.disable(C), c[C] = !1);
    }
    function Te(C, ee) {
      return h[C] !== ee ? (i.bindFramebuffer(C, ee), h[C] = ee, C === i.DRAW_FRAMEBUFFER && (h[i.FRAMEBUFFER] = ee), C === i.FRAMEBUFFER && (h[i.DRAW_FRAMEBUFFER] = ee), !0) : !1;
    }
    function Le(C, ee) {
      let X = d, q = !1;
      if (C) {
        X = f.get(ee), X === void 0 && (X = [], f.set(ee, X));
        let ne = C.textures;
        if (X.length !== ne.length || X[0] !== i.COLOR_ATTACHMENT0) {
          for (let ye = 0, Be = ne.length; ye < Be; ye++)
            X[ye] = i.COLOR_ATTACHMENT0 + ye;
          X.length = ne.length, q = !0;
        }
      } else
        X[0] !== i.BACK && (X[0] = i.BACK, q = !0);
      q && i.drawBuffers(X);
    }
    function Ue(C) {
      return m !== C ? (i.useProgram(C), m = C, !0) : !1;
    }
    let Qe = {
      [Tn]: i.FUNC_ADD,
      [Ah]: i.FUNC_SUBTRACT,
      [Th]: i.FUNC_REVERSE_SUBTRACT
    };
    Qe[Rh] = i.MIN, Qe[Ch] = i.MAX;
    let A = {
      [Ph]: i.ZERO,
      [Ih]: i.ONE,
      [Lh]: i.SRC_COLOR,
      [ha]: i.SRC_ALPHA,
      [Bh]: i.SRC_ALPHA_SATURATE,
      [Fh]: i.DST_COLOR,
      [Uh]: i.DST_ALPHA,
      [Dh]: i.ONE_MINUS_SRC_COLOR,
      [ua]: i.ONE_MINUS_SRC_ALPHA,
      [Oh]: i.ONE_MINUS_DST_COLOR,
      [Nh]: i.ONE_MINUS_DST_ALPHA,
      [zh]: i.CONSTANT_COLOR,
      [kh]: i.ONE_MINUS_CONSTANT_COLOR,
      [Hh]: i.CONSTANT_ALPHA,
      [Vh]: i.ONE_MINUS_CONSTANT_ALPHA
    };
    function tt(C, ee, X, q, ne, ye, Be, it, ut, He) {
      if (C === fn) {
        _ === !0 && (le(i.BLEND), _ = !1);
        return;
      }
      if (_ === !1 && (de(i.BLEND), _ = !0), C !== wh) {
        if (C !== y || He !== B) {
          if ((p !== Tn || S !== Tn) && (i.blendEquation(i.FUNC_ADD), p = Tn, S = Tn), He)
            switch (C) {
              case li:
                i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
                break;
              case pl:
                i.blendFunc(i.ONE, i.ONE);
                break;
              case ml:
                i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
                break;
              case gl:
                i.blendFuncSeparate(i.ZERO, i.SRC_COLOR, i.ZERO, i.SRC_ALPHA);
                break;
              default:
                console.error("THREE.WebGLState: Invalid blending: ", C);
                break;
            }
          else
            switch (C) {
              case li:
                i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
                break;
              case pl:
                i.blendFunc(i.SRC_ALPHA, i.ONE);
                break;
              case ml:
                i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
                break;
              case gl:
                i.blendFunc(i.ZERO, i.SRC_COLOR);
                break;
              default:
                console.error("THREE.WebGLState: Invalid blending: ", C);
                break;
            }
          u = null, w = null, E = null, O = null, T.set(0, 0, 0), R = 0, y = C, B = He;
        }
        return;
      }
      ne = ne || ee, ye = ye || X, Be = Be || q, (ee !== p || ne !== S) && (i.blendEquationSeparate(Qe[ee], Qe[ne]), p = ee, S = ne), (X !== u || q !== w || ye !== E || Be !== O) && (i.blendFuncSeparate(A[X], A[q], A[ye], A[Be]), u = X, w = q, E = ye, O = Be), (it.equals(T) === !1 || ut !== R) && (i.blendColor(it.r, it.g, it.b, ut), T.copy(it), R = ut), y = C, B = !1;
    }
    function qe(C, ee) {
      C.side === Qt ? le(i.CULL_FACE) : de(i.CULL_FACE);
      let X = C.side === vt;
      ee && (X = !X), Ze(X), C.blending === li && C.transparent === !1 ? tt(fn) : tt(C.blending, C.blendEquation, C.blendSrc, C.blendDst, C.blendEquationAlpha, C.blendSrcAlpha, C.blendDstAlpha, C.blendColor, C.blendAlpha, C.premultipliedAlpha), r.setFunc(C.depthFunc), r.setTest(C.depthTest), r.setMask(C.depthWrite), s.setMask(C.colorWrite);
      let q = C.stencilWrite;
      a.setTest(q), q && (a.setMask(C.stencilWriteMask), a.setFunc(C.stencilFunc, C.stencilRef, C.stencilFuncMask), a.setOp(C.stencilFail, C.stencilZFail, C.stencilZPass)), we(C.polygonOffset, C.polygonOffsetFactor, C.polygonOffsetUnits), C.alphaToCoverage === !0 ? de(i.SAMPLE_ALPHA_TO_COVERAGE) : le(i.SAMPLE_ALPHA_TO_COVERAGE);
    }
    function Ze(C) {
      M !== C && (C ? i.frontFace(i.CW) : i.frontFace(i.CCW), M = C);
    }
    function _e(C) {
      C !== Sh ? (de(i.CULL_FACE), C !== v && (C === fl ? i.cullFace(i.BACK) : C === bh ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : le(i.CULL_FACE), v = C;
    }
    function nt(C) {
      C !== P && (Z && i.lineWidth(C), P = C);
    }
    function we(C, ee, X) {
      C ? (de(i.POLYGON_OFFSET_FILL), (W !== ee || z !== X) && (i.polygonOffset(ee, X), W = ee, z = X)) : le(i.POLYGON_OFFSET_FILL);
    }
    function Re(C) {
      C ? de(i.SCISSOR_TEST) : le(i.SCISSOR_TEST);
    }
    function b(C) {
      C === void 0 && (C = i.TEXTURE0 + G - 1), k !== C && (i.activeTexture(C), k = C);
    }
    function g(C, ee, X) {
      X === void 0 && (k === null ? X = i.TEXTURE0 + G - 1 : X = k);
      let q = ae[X];
      q === void 0 && (q = { type: void 0, texture: void 0 }, ae[X] = q), (q.type !== C || q.texture !== ee) && (k !== X && (i.activeTexture(X), k = X), i.bindTexture(C, ee || Q[C]), q.type = C, q.texture = ee);
    }
    function F() {
      let C = ae[k];
      C !== void 0 && C.type !== void 0 && (i.bindTexture(C.type, null), C.type = void 0, C.texture = void 0);
    }
    function $() {
      try {
        i.compressedTexImage2D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function J() {
      try {
        i.compressedTexImage3D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function Y() {
      try {
        i.texSubImage2D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function xe() {
      try {
        i.texSubImage3D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function se() {
      try {
        i.compressedTexSubImage2D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function ce() {
      try {
        i.compressedTexSubImage3D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function Ce() {
      try {
        i.texStorage2D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function j() {
      try {
        i.texStorage3D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function oe() {
      try {
        i.texImage2D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function Oe() {
      try {
        i.texImage3D.apply(i, arguments);
      } catch (C) {
        console.error("THREE.WebGLState:", C);
      }
    }
    function Ee(C) {
      Fe.equals(C) === !1 && (i.scissor(C.x, C.y, C.z, C.w), Fe.copy(C));
    }
    function ue(C) {
      Ye.equals(C) === !1 && (i.viewport(C.x, C.y, C.z, C.w), Ye.copy(C));
    }
    function Ae(C, ee) {
      let X = l.get(ee);
      X === void 0 && (X = /* @__PURE__ */ new WeakMap(), l.set(ee, X));
      let q = X.get(C);
      q === void 0 && (q = i.getUniformBlockIndex(ee, C.name), X.set(C, q));
    }
    function De(C, ee) {
      let q = l.get(ee).get(C);
      o.get(ee) !== q && (i.uniformBlockBinding(ee, q, C.__bindingPointIndex), o.set(ee, q));
    }
    function Ke() {
      i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), c = {}, k = null, ae = {}, h = {}, f = /* @__PURE__ */ new WeakMap(), d = [], m = null, _ = !1, y = null, p = null, u = null, w = null, S = null, E = null, O = null, T = new Ne(0, 0, 0), R = 0, B = !1, M = null, v = null, P = null, W = null, z = null, Fe.set(0, 0, i.canvas.width, i.canvas.height), Ye.set(0, 0, i.canvas.width, i.canvas.height), s.reset(), r.reset(), a.reset();
    }
    return {
      buffers: {
        color: s,
        depth: r,
        stencil: a
      },
      enable: de,
      disable: le,
      bindFramebuffer: Te,
      drawBuffers: Le,
      useProgram: Ue,
      setBlending: tt,
      setMaterial: qe,
      setFlipSided: Ze,
      setCullFace: _e,
      setLineWidth: nt,
      setPolygonOffset: we,
      setScissorTest: Re,
      activeTexture: b,
      bindTexture: g,
      unbindTexture: F,
      compressedTexImage2D: $,
      compressedTexImage3D: J,
      texImage2D: oe,
      texImage3D: Oe,
      updateUBOMapping: Ae,
      uniformBlockBinding: De,
      texStorage2D: Ce,
      texStorage3D: j,
      texSubImage2D: Y,
      texSubImage3D: xe,
      compressedTexSubImage2D: se,
      compressedTexSubImage3D: ce,
      scissor: Ee,
      viewport: ue,
      reset: Ke
    };
  }
  function hc(i, e, t, n) {
    let s = sg(n);
    switch (t) {
      case xc:
        return i * e;
      case yc:
        return i * e;
      case Mc:
        return i * e * 2;
      case Sc:
        return i * e / s.components * s.byteLength;
      case Eo:
        return i * e / s.components * s.byteLength;
      case bc:
        return i * e * 2 / s.components * s.byteLength;
      case wo:
        return i * e * 2 / s.components * s.byteLength;
      case vc:
        return i * e * 3 / s.components * s.byteLength;
      case Bt:
        return i * e * 4 / s.components * s.byteLength;
      case Ao:
        return i * e * 4 / s.components * s.byteLength;
      case Rs:
      case Cs:
        return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 8;
      case Ps:
      case Is:
        return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
      case _a:
      case va:
        return Math.max(i, 16) * Math.max(e, 8) / 4;
      case ga:
      case xa:
        return Math.max(i, 8) * Math.max(e, 8) / 2;
      case ya:
      case Ma:
        return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 8;
      case Sa:
        return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
      case ba:
        return Math.floor((i + 3) / 4) * Math.floor((e + 3) / 4) * 16;
      case Ea:
        return Math.floor((i + 4) / 5) * Math.floor((e + 3) / 4) * 16;
      case wa:
        return Math.floor((i + 4) / 5) * Math.floor((e + 4) / 5) * 16;
      case Aa:
        return Math.floor((i + 5) / 6) * Math.floor((e + 4) / 5) * 16;
      case Ta:
        return Math.floor((i + 5) / 6) * Math.floor((e + 5) / 6) * 16;
      case Ra:
        return Math.floor((i + 7) / 8) * Math.floor((e + 4) / 5) * 16;
      case Ca:
        return Math.floor((i + 7) / 8) * Math.floor((e + 5) / 6) * 16;
      case Pa:
        return Math.floor((i + 7) / 8) * Math.floor((e + 7) / 8) * 16;
      case Ia:
        return Math.floor((i + 9) / 10) * Math.floor((e + 4) / 5) * 16;
      case La:
        return Math.floor((i + 9) / 10) * Math.floor((e + 5) / 6) * 16;
      case Da:
        return Math.floor((i + 9) / 10) * Math.floor((e + 7) / 8) * 16;
      case Ua:
        return Math.floor((i + 9) / 10) * Math.floor((e + 9) / 10) * 16;
      case Na:
        return Math.floor((i + 11) / 12) * Math.floor((e + 9) / 10) * 16;
      case Fa:
        return Math.floor((i + 11) / 12) * Math.floor((e + 11) / 12) * 16;
      case Ls:
      case Oa:
      case Ba:
        return Math.ceil(i / 4) * Math.ceil(e / 4) * 16;
      case Ec:
      case za:
        return Math.ceil(i / 4) * Math.ceil(e / 4) * 8;
      case ka:
      case Ha:
        return Math.ceil(i / 4) * Math.ceil(e / 4) * 16;
    }
    throw new Error(
      `Unable to determine texture byte length for ${t} format.`
    );
  }
  function sg(i) {
    switch (i) {
      case nn:
      case mc:
        return { byteLength: 1, components: 1 };
      case Ii:
      case gc:
      case Oi:
        return { byteLength: 2, components: 1 };
      case So:
      case bo:
        return { byteLength: 2, components: 4 };
      case In:
      case Mo:
      case jt:
        return { byteLength: 4, components: 1 };
      case _c:
        return { byteLength: 4, components: 3 };
    }
    throw new Error(`Unknown texture type ${i}.`);
  }
  function rg(i, e, t, n, s, r, a) {
    let o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new ke(), h = /* @__PURE__ */ new WeakMap(), f, d = /* @__PURE__ */ new WeakMap(), m = !1;
    try {
      m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
    } catch {
    }
    function _(b, g) {
      return m ? (
        // eslint-disable-next-line compat/compat
        new OffscreenCanvas(b, g)
      ) : zs("canvas");
    }
    function y(b, g, F) {
      let $ = 1, J = Re(b);
      if ((J.width > F || J.height > F) && ($ = F / Math.max(J.width, J.height)), $ < 1)
        if (typeof HTMLImageElement < "u" && b instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && b instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && b instanceof ImageBitmap || typeof VideoFrame < "u" && b instanceof VideoFrame) {
          let Y = Math.floor($ * J.width), xe = Math.floor($ * J.height);
          f === void 0 && (f = _(Y, xe));
          let se = g ? _(Y, xe) : f;
          return se.width = Y, se.height = xe, se.getContext("2d").drawImage(b, 0, 0, Y, xe), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + J.width + "x" + J.height + ") to (" + Y + "x" + xe + ")."), se;
        } else
          return "data" in b && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + J.width + "x" + J.height + ")."), b;
      return b;
    }
    function p(b) {
      return b.generateMipmaps && b.minFilter !== Pt && b.minFilter !== Ot;
    }
    function u(b) {
      i.generateMipmap(b);
    }
    function w(b, g, F, $, J = !1) {
      if (b !== null) {
        if (i[b] !== void 0) return i[b];
        console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + b + "'");
      }
      let Y = g;
      if (g === i.RED && (F === i.FLOAT && (Y = i.R32F), F === i.HALF_FLOAT && (Y = i.R16F), F === i.UNSIGNED_BYTE && (Y = i.R8)), g === i.RED_INTEGER && (F === i.UNSIGNED_BYTE && (Y = i.R8UI), F === i.UNSIGNED_SHORT && (Y = i.R16UI), F === i.UNSIGNED_INT && (Y = i.R32UI), F === i.BYTE && (Y = i.R8I), F === i.SHORT && (Y = i.R16I), F === i.INT && (Y = i.R32I)), g === i.RG && (F === i.FLOAT && (Y = i.RG32F), F === i.HALF_FLOAT && (Y = i.RG16F), F === i.UNSIGNED_BYTE && (Y = i.RG8)), g === i.RG_INTEGER && (F === i.UNSIGNED_BYTE && (Y = i.RG8UI), F === i.UNSIGNED_SHORT && (Y = i.RG16UI), F === i.UNSIGNED_INT && (Y = i.RG32UI), F === i.BYTE && (Y = i.RG8I), F === i.SHORT && (Y = i.RG16I), F === i.INT && (Y = i.RG32I)), g === i.RGB && F === i.UNSIGNED_INT_5_9_9_9_REV && (Y = i.RGB9_E5), g === i.RGBA) {
        let xe = J ? Ns : Xe.getTransfer($);
        F === i.FLOAT && (Y = i.RGBA32F), F === i.HALF_FLOAT && (Y = i.RGBA16F), F === i.UNSIGNED_BYTE && (Y = xe === $e ? i.SRGB8_ALPHA8 : i.RGBA8), F === i.UNSIGNED_SHORT_4_4_4_4 && (Y = i.RGBA4), F === i.UNSIGNED_SHORT_5_5_5_1 && (Y = i.RGB5_A1);
      }
      return (Y === i.R16F || Y === i.R32F || Y === i.RG16F || Y === i.RG32F || Y === i.RGBA16F || Y === i.RGBA32F) && e.get("EXT_color_buffer_float"), Y;
    }
    function S(b, g) {
      let F;
      return b ? g === null || g === In || g === pi ? F = i.DEPTH24_STENCIL8 : g === jt ? F = i.DEPTH32F_STENCIL8 : g === Ii && (F = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : g === null || g === In || g === pi ? F = i.DEPTH_COMPONENT24 : g === jt ? F = i.DEPTH_COMPONENT32F : g === Ii && (F = i.DEPTH_COMPONENT16), F;
    }
    function E(b, g) {
      return p(b) === !0 || b.isFramebufferTexture && b.minFilter !== Pt && b.minFilter !== Ot ? Math.log2(Math.max(g.width, g.height)) + 1 : b.mipmaps !== void 0 && b.mipmaps.length > 0 ? b.mipmaps.length : b.isCompressedTexture && Array.isArray(b.image) ? g.mipmaps.length : 1;
    }
    function O(b) {
      let g = b.target;
      g.removeEventListener("dispose", O), R(g), g.isVideoTexture && h.delete(g);
    }
    function T(b) {
      let g = b.target;
      g.removeEventListener("dispose", T), M(g);
    }
    function R(b) {
      let g = n.get(b);
      if (g.__webglInit === void 0) return;
      let F = b.source, $ = d.get(F);
      if ($) {
        let J = $[g.__cacheKey];
        J.usedTimes--, J.usedTimes === 0 && B(b), Object.keys($).length === 0 && d.delete(F);
      }
      n.remove(b);
    }
    function B(b) {
      let g = n.get(b);
      i.deleteTexture(g.__webglTexture);
      let F = b.source, $ = d.get(F);
      delete $[g.__cacheKey], a.memory.textures--;
    }
    function M(b) {
      let g = n.get(b);
      if (b.depthTexture && b.depthTexture.dispose(), b.isWebGLCubeRenderTarget)
        for (let $ = 0; $ < 6; $++) {
          if (Array.isArray(g.__webglFramebuffer[$]))
            for (let J = 0; J < g.__webglFramebuffer[$].length; J++) i.deleteFramebuffer(g.__webglFramebuffer[$][J]);
          else
            i.deleteFramebuffer(g.__webglFramebuffer[$]);
          g.__webglDepthbuffer && i.deleteRenderbuffer(g.__webglDepthbuffer[$]);
        }
      else {
        if (Array.isArray(g.__webglFramebuffer))
          for (let $ = 0; $ < g.__webglFramebuffer.length; $++) i.deleteFramebuffer(g.__webglFramebuffer[$]);
        else
          i.deleteFramebuffer(g.__webglFramebuffer);
        if (g.__webglDepthbuffer && i.deleteRenderbuffer(g.__webglDepthbuffer), g.__webglMultisampledFramebuffer && i.deleteFramebuffer(g.__webglMultisampledFramebuffer), g.__webglColorRenderbuffer)
          for (let $ = 0; $ < g.__webglColorRenderbuffer.length; $++)
            g.__webglColorRenderbuffer[$] && i.deleteRenderbuffer(g.__webglColorRenderbuffer[$]);
        g.__webglDepthRenderbuffer && i.deleteRenderbuffer(g.__webglDepthRenderbuffer);
      }
      let F = b.textures;
      for (let $ = 0, J = F.length; $ < J; $++) {
        let Y = n.get(F[$]);
        Y.__webglTexture && (i.deleteTexture(Y.__webglTexture), a.memory.textures--), n.remove(F[$]);
      }
      n.remove(b);
    }
    let v = 0;
    function P() {
      v = 0;
    }
    function W() {
      let b = v;
      return b >= s.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + b + " texture units while this GPU supports only " + s.maxTextures), v += 1, b;
    }
    function z(b) {
      let g = [];
      return g.push(b.wrapS), g.push(b.wrapT), g.push(b.wrapR || 0), g.push(b.magFilter), g.push(b.minFilter), g.push(b.anisotropy), g.push(b.internalFormat), g.push(b.format), g.push(b.type), g.push(b.generateMipmaps), g.push(b.premultiplyAlpha), g.push(b.flipY), g.push(b.unpackAlignment), g.push(b.colorSpace), g.join();
    }
    function G(b, g) {
      let F = n.get(b);
      if (b.isVideoTexture && nt(b), b.isRenderTargetTexture === !1 && b.version > 0 && F.__version !== b.version) {
        let $ = b.image;
        if ($ === null)
          console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
        else if ($.complete === !1)
          console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
        else {
          Ye(F, b, g);
          return;
        }
      }
      t.bindTexture(i.TEXTURE_2D, F.__webglTexture, i.TEXTURE0 + g);
    }
    function Z(b, g) {
      let F = n.get(b);
      if (b.version > 0 && F.__version !== b.version) {
        Ye(F, b, g);
        return;
      }
      t.bindTexture(i.TEXTURE_2D_ARRAY, F.__webglTexture, i.TEXTURE0 + g);
    }
    function H(b, g) {
      let F = n.get(b);
      if (b.version > 0 && F.__version !== b.version) {
        Ye(F, b, g);
        return;
      }
      t.bindTexture(i.TEXTURE_3D, F.__webglTexture, i.TEXTURE0 + g);
    }
    function K(b, g) {
      let F = n.get(b);
      if (b.version > 0 && F.__version !== b.version) {
        V(F, b, g);
        return;
      }
      t.bindTexture(i.TEXTURE_CUBE_MAP, F.__webglTexture, i.TEXTURE0 + g);
    }
    let k = {
      [pa]: i.REPEAT,
      [Cn]: i.CLAMP_TO_EDGE,
      [ma]: i.MIRRORED_REPEAT
    }, ae = {
      [Pt]: i.NEAREST,
      [ru]: i.NEAREST_MIPMAP_NEAREST,
      [rs]: i.NEAREST_MIPMAP_LINEAR,
      [Ot]: i.LINEAR,
      [Nr]: i.LINEAR_MIPMAP_NEAREST,
      [Pn]: i.LINEAR_MIPMAP_LINEAR
    }, he = {
      [cu]: i.NEVER,
      [mu]: i.ALWAYS,
      [hu]: i.LESS,
      [Ac]: i.LEQUAL,
      [uu]: i.EQUAL,
      [pu]: i.GEQUAL,
      [du]: i.GREATER,
      [fu]: i.NOTEQUAL
    };
    function me(b, g) {
      if (g.type === jt && e.has("OES_texture_float_linear") === !1 && (g.magFilter === Ot || g.magFilter === Nr || g.magFilter === rs || g.magFilter === Pn || g.minFilter === Ot || g.minFilter === Nr || g.minFilter === rs || g.minFilter === Pn) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(b, i.TEXTURE_WRAP_S, k[g.wrapS]), i.texParameteri(b, i.TEXTURE_WRAP_T, k[g.wrapT]), (b === i.TEXTURE_3D || b === i.TEXTURE_2D_ARRAY) && i.texParameteri(b, i.TEXTURE_WRAP_R, k[g.wrapR]), i.texParameteri(b, i.TEXTURE_MAG_FILTER, ae[g.magFilter]), i.texParameteri(b, i.TEXTURE_MIN_FILTER, ae[g.minFilter]), g.compareFunction && (i.texParameteri(b, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(b, i.TEXTURE_COMPARE_FUNC, he[g.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
        if (g.magFilter === Pt || g.minFilter !== rs && g.minFilter !== Pn || g.type === jt && e.has("OES_texture_float_linear") === !1) return;
        if (g.anisotropy > 1 || n.get(g).__currentAnisotropy) {
          let F = e.get("EXT_texture_filter_anisotropic");
          i.texParameterf(b, F.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(g.anisotropy, s.getMaxAnisotropy())), n.get(g).__currentAnisotropy = g.anisotropy;
        }
      }
    }
    function Fe(b, g) {
      let F = !1;
      b.__webglInit === void 0 && (b.__webglInit = !0, g.addEventListener("dispose", O));
      let $ = g.source, J = d.get($);
      J === void 0 && (J = {}, d.set($, J));
      let Y = z(g);
      if (Y !== b.__cacheKey) {
        J[Y] === void 0 && (J[Y] = {
          texture: i.createTexture(),
          usedTimes: 0
        }, a.memory.textures++, F = !0), J[Y].usedTimes++;
        let xe = J[b.__cacheKey];
        xe !== void 0 && (J[b.__cacheKey].usedTimes--, xe.usedTimes === 0 && B(g)), b.__cacheKey = Y, b.__webglTexture = J[Y].texture;
      }
      return F;
    }
    function Ye(b, g, F) {
      let $ = i.TEXTURE_2D;
      (g.isDataArrayTexture || g.isCompressedArrayTexture) && ($ = i.TEXTURE_2D_ARRAY), g.isData3DTexture && ($ = i.TEXTURE_3D);
      let J = Fe(b, g), Y = g.source;
      t.bindTexture($, b.__webglTexture, i.TEXTURE0 + F);
      let xe = n.get(Y);
      if (Y.version !== xe.__version || J === !0) {
        t.activeTexture(i.TEXTURE0 + F);
        let se = Xe.getPrimaries(Xe.workingColorSpace), ce = g.colorSpace === dn ? null : Xe.getPrimaries(g.colorSpace), Ce = g.colorSpace === dn || se === ce ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
        i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Ce);
        let j = y(g.image, !1, s.maxTextureSize);
        j = we(g, j);
        let oe = r.convert(g.format, g.colorSpace), Oe = r.convert(g.type), Ee = w(g.internalFormat, oe, Oe, g.colorSpace, g.isVideoTexture);
        me($, g);
        let ue, Ae = g.mipmaps, De = g.isVideoTexture !== !0, Ke = xe.__version === void 0 || J === !0, C = Y.dataReady, ee = E(g, j);
        if (g.isDepthTexture)
          Ee = S(g.format === mi, g.type), Ke && (De ? t.texStorage2D(i.TEXTURE_2D, 1, Ee, j.width, j.height) : t.texImage2D(i.TEXTURE_2D, 0, Ee, j.width, j.height, 0, oe, Oe, null));
        else if (g.isDataTexture)
          if (Ae.length > 0) {
            De && Ke && t.texStorage2D(i.TEXTURE_2D, ee, Ee, Ae[0].width, Ae[0].height);
            for (let X = 0, q = Ae.length; X < q; X++)
              ue = Ae[X], De ? C && t.texSubImage2D(i.TEXTURE_2D, X, 0, 0, ue.width, ue.height, oe, Oe, ue.data) : t.texImage2D(i.TEXTURE_2D, X, Ee, ue.width, ue.height, 0, oe, Oe, ue.data);
            g.generateMipmaps = !1;
          } else
            De ? (Ke && t.texStorage2D(i.TEXTURE_2D, ee, Ee, j.width, j.height), C && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, j.width, j.height, oe, Oe, j.data)) : t.texImage2D(i.TEXTURE_2D, 0, Ee, j.width, j.height, 0, oe, Oe, j.data);
        else if (g.isCompressedTexture)
          if (g.isCompressedArrayTexture) {
            De && Ke && t.texStorage3D(i.TEXTURE_2D_ARRAY, ee, Ee, Ae[0].width, Ae[0].height, j.depth);
            for (let X = 0, q = Ae.length; X < q; X++)
              if (ue = Ae[X], g.format !== Bt)
                if (oe !== null)
                  if (De) {
                    if (C)
                      if (g.layerUpdates.size > 0) {
                        let ne = hc(ue.width, ue.height, g.format, g.type);
                        for (let ye of g.layerUpdates) {
                          let Be = ue.data.subarray(
                            ye * ne / ue.data.BYTES_PER_ELEMENT,
                            (ye + 1) * ne / ue.data.BYTES_PER_ELEMENT
                          );
                          t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, ye, ue.width, ue.height, 1, oe, Be, 0, 0);
                        }
                        g.clearLayerUpdates();
                      } else
                        t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, 0, ue.width, ue.height, j.depth, oe, ue.data, 0, 0);
                  } else
                    t.compressedTexImage3D(i.TEXTURE_2D_ARRAY, X, Ee, ue.width, ue.height, j.depth, 0, ue.data, 0, 0);
                else
                  console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
              else
                De ? C && t.texSubImage3D(i.TEXTURE_2D_ARRAY, X, 0, 0, 0, ue.width, ue.height, j.depth, oe, Oe, ue.data) : t.texImage3D(i.TEXTURE_2D_ARRAY, X, Ee, ue.width, ue.height, j.depth, 0, oe, Oe, ue.data);
          } else {
            De && Ke && t.texStorage2D(i.TEXTURE_2D, ee, Ee, Ae[0].width, Ae[0].height);
            for (let X = 0, q = Ae.length; X < q; X++)
              ue = Ae[X], g.format !== Bt ? oe !== null ? De ? C && t.compressedTexSubImage2D(i.TEXTURE_2D, X, 0, 0, ue.width, ue.height, oe, ue.data) : t.compressedTexImage2D(i.TEXTURE_2D, X, Ee, ue.width, ue.height, 0, ue.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : De ? C && t.texSubImage2D(i.TEXTURE_2D, X, 0, 0, ue.width, ue.height, oe, Oe, ue.data) : t.texImage2D(i.TEXTURE_2D, X, Ee, ue.width, ue.height, 0, oe, Oe, ue.data);
          }
        else if (g.isDataArrayTexture)
          if (De) {
            if (Ke && t.texStorage3D(i.TEXTURE_2D_ARRAY, ee, Ee, j.width, j.height, j.depth), C)
              if (g.layerUpdates.size > 0) {
                let X = hc(j.width, j.height, g.format, g.type);
                for (let q of g.layerUpdates) {
                  let ne = j.data.subarray(
                    q * X / j.data.BYTES_PER_ELEMENT,
                    (q + 1) * X / j.data.BYTES_PER_ELEMENT
                  );
                  t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, q, j.width, j.height, 1, oe, Oe, ne);
                }
                g.clearLayerUpdates();
              } else
                t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, j.width, j.height, j.depth, oe, Oe, j.data);
          } else
            t.texImage3D(i.TEXTURE_2D_ARRAY, 0, Ee, j.width, j.height, j.depth, 0, oe, Oe, j.data);
        else if (g.isData3DTexture)
          De ? (Ke && t.texStorage3D(i.TEXTURE_3D, ee, Ee, j.width, j.height, j.depth), C && t.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, j.width, j.height, j.depth, oe, Oe, j.data)) : t.texImage3D(i.TEXTURE_3D, 0, Ee, j.width, j.height, j.depth, 0, oe, Oe, j.data);
        else if (g.isFramebufferTexture) {
          if (Ke)
            if (De)
              t.texStorage2D(i.TEXTURE_2D, ee, Ee, j.width, j.height);
            else {
              let X = j.width, q = j.height;
              for (let ne = 0; ne < ee; ne++)
                t.texImage2D(i.TEXTURE_2D, ne, Ee, X, q, 0, oe, Oe, null), X >>= 1, q >>= 1;
            }
        } else if (Ae.length > 0) {
          if (De && Ke) {
            let X = Re(Ae[0]);
            t.texStorage2D(i.TEXTURE_2D, ee, Ee, X.width, X.height);
          }
          for (let X = 0, q = Ae.length; X < q; X++)
            ue = Ae[X], De ? C && t.texSubImage2D(i.TEXTURE_2D, X, 0, 0, oe, Oe, ue) : t.texImage2D(i.TEXTURE_2D, X, Ee, oe, Oe, ue);
          g.generateMipmaps = !1;
        } else if (De) {
          if (Ke) {
            let X = Re(j);
            t.texStorage2D(i.TEXTURE_2D, ee, Ee, X.width, X.height);
          }
          C && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, oe, Oe, j);
        } else
          t.texImage2D(i.TEXTURE_2D, 0, Ee, oe, Oe, j);
        p(g) && u($), xe.__version = Y.version, g.onUpdate && g.onUpdate(g);
      }
      b.__version = g.version;
    }
    function V(b, g, F) {
      if (g.image.length !== 6) return;
      let $ = Fe(b, g), J = g.source;
      t.bindTexture(i.TEXTURE_CUBE_MAP, b.__webglTexture, i.TEXTURE0 + F);
      let Y = n.get(J);
      if (J.version !== Y.__version || $ === !0) {
        t.activeTexture(i.TEXTURE0 + F);
        let xe = Xe.getPrimaries(Xe.workingColorSpace), se = g.colorSpace === dn ? null : Xe.getPrimaries(g.colorSpace), ce = g.colorSpace === dn || xe === se ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
        i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, ce);
        let Ce = g.isCompressedTexture || g.image[0].isCompressedTexture, j = g.image[0] && g.image[0].isDataTexture, oe = [];
        for (let q = 0; q < 6; q++)
          !Ce && !j ? oe[q] = y(g.image[q], !0, s.maxCubemapSize) : oe[q] = j ? g.image[q].image : g.image[q], oe[q] = we(g, oe[q]);
        let Oe = oe[0], Ee = r.convert(g.format, g.colorSpace), ue = r.convert(g.type), Ae = w(g.internalFormat, Ee, ue, g.colorSpace), De = g.isVideoTexture !== !0, Ke = Y.__version === void 0 || $ === !0, C = J.dataReady, ee = E(g, Oe);
        me(i.TEXTURE_CUBE_MAP, g);
        let X;
        if (Ce) {
          De && Ke && t.texStorage2D(i.TEXTURE_CUBE_MAP, ee, Ae, Oe.width, Oe.height);
          for (let q = 0; q < 6; q++) {
            X = oe[q].mipmaps;
            for (let ne = 0; ne < X.length; ne++) {
              let ye = X[ne];
              g.format !== Bt ? Ee !== null ? De ? C && t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, ne, 0, 0, ye.width, ye.height, Ee, ye.data) : t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, ne, Ae, ye.width, ye.height, 0, ye.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : De ? C && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, ne, 0, 0, ye.width, ye.height, Ee, ue, ye.data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, ne, Ae, ye.width, ye.height, 0, Ee, ue, ye.data);
            }
          }
        } else {
          if (X = g.mipmaps, De && Ke) {
            X.length > 0 && ee++;
            let q = Re(oe[0]);
            t.texStorage2D(i.TEXTURE_CUBE_MAP, ee, Ae, q.width, q.height);
          }
          for (let q = 0; q < 6; q++)
            if (j) {
              De ? C && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, 0, 0, oe[q].width, oe[q].height, Ee, ue, oe[q].data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, Ae, oe[q].width, oe[q].height, 0, Ee, ue, oe[q].data);
              for (let ne = 0; ne < X.length; ne++) {
                let Be = X[ne].image[q].image;
                De ? C && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, ne + 1, 0, 0, Be.width, Be.height, Ee, ue, Be.data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, ne + 1, Ae, Be.width, Be.height, 0, Ee, ue, Be.data);
              }
            } else {
              De ? C && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, 0, 0, Ee, ue, oe[q]) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, Ae, Ee, ue, oe[q]);
              for (let ne = 0; ne < X.length; ne++) {
                let ye = X[ne];
                De ? C && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, ne + 1, 0, 0, Ee, ue, ye.image[q]) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + q, ne + 1, Ae, Ee, ue, ye.image[q]);
              }
            }
        }
        p(g) && u(i.TEXTURE_CUBE_MAP), Y.__version = J.version, g.onUpdate && g.onUpdate(g);
      }
      b.__version = g.version;
    }
    function Q(b, g, F, $, J, Y) {
      let xe = r.convert(F.format, F.colorSpace), se = r.convert(F.type), ce = w(F.internalFormat, xe, se, F.colorSpace);
      if (!n.get(g).__hasExternalTextures) {
        let j = Math.max(1, g.width >> Y), oe = Math.max(1, g.height >> Y);
        J === i.TEXTURE_3D || J === i.TEXTURE_2D_ARRAY ? t.texImage3D(J, Y, ce, j, oe, g.depth, 0, xe, se, null) : t.texImage2D(J, Y, ce, j, oe, 0, xe, se, null);
      }
      t.bindFramebuffer(i.FRAMEBUFFER, b), _e(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, $, J, n.get(F).__webglTexture, 0, Ze(g)) : (J === i.TEXTURE_2D || J >= i.TEXTURE_CUBE_MAP_POSITIVE_X && J <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, $, J, n.get(F).__webglTexture, Y), t.bindFramebuffer(i.FRAMEBUFFER, null);
    }
    function de(b, g, F) {
      if (i.bindRenderbuffer(i.RENDERBUFFER, b), g.depthBuffer) {
        let $ = g.depthTexture, J = $ && $.isDepthTexture ? $.type : null, Y = S(g.stencilBuffer, J), xe = g.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, se = Ze(g);
        _e(g) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, se, Y, g.width, g.height) : F ? i.renderbufferStorageMultisample(i.RENDERBUFFER, se, Y, g.width, g.height) : i.renderbufferStorage(i.RENDERBUFFER, Y, g.width, g.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, xe, i.RENDERBUFFER, b);
      } else {
        let $ = g.textures;
        for (let J = 0; J < $.length; J++) {
          let Y = $[J], xe = r.convert(Y.format, Y.colorSpace), se = r.convert(Y.type), ce = w(Y.internalFormat, xe, se, Y.colorSpace), Ce = Ze(g);
          F && _e(g) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Ce, ce, g.width, g.height) : _e(g) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Ce, ce, g.width, g.height) : i.renderbufferStorage(i.RENDERBUFFER, ce, g.width, g.height);
        }
      }
      i.bindRenderbuffer(i.RENDERBUFFER, null);
    }
    function le(b, g) {
      if (g && g.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
      if (t.bindFramebuffer(i.FRAMEBUFFER, b), !(g.depthTexture && g.depthTexture.isDepthTexture))
        throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
      (!n.get(g.depthTexture).__webglTexture || g.depthTexture.image.width !== g.width || g.depthTexture.image.height !== g.height) && (g.depthTexture.image.width = g.width, g.depthTexture.image.height = g.height, g.depthTexture.needsUpdate = !0), G(g.depthTexture, 0);
      let $ = n.get(g.depthTexture).__webglTexture, J = Ze(g);
      if (g.depthTexture.format === ci)
        _e(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, $, 0, J) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, $, 0);
      else if (g.depthTexture.format === mi)
        _e(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, $, 0, J) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, $, 0);
      else
        throw new Error("Unknown depthTexture format");
    }
    function Te(b) {
      let g = n.get(b), F = b.isWebGLCubeRenderTarget === !0;
      if (b.depthTexture && !g.__autoAllocateDepthBuffer) {
        if (F) throw new Error("target.depthTexture not supported in Cube render targets");
        le(g.__webglFramebuffer, b);
      } else if (F) {
        g.__webglDepthbuffer = [];
        for (let $ = 0; $ < 6; $++)
          t.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer[$]), g.__webglDepthbuffer[$] = i.createRenderbuffer(), de(g.__webglDepthbuffer[$], b, !1);
      } else
        t.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer), g.__webglDepthbuffer = i.createRenderbuffer(), de(g.__webglDepthbuffer, b, !1);
      t.bindFramebuffer(i.FRAMEBUFFER, null);
    }
    function Le(b, g, F) {
      let $ = n.get(b);
      g !== void 0 && Q($.__webglFramebuffer, b, b.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), F !== void 0 && Te(b);
    }
    function Ue(b) {
      let g = b.texture, F = n.get(b), $ = n.get(g);
      b.addEventListener("dispose", T);
      let J = b.textures, Y = b.isWebGLCubeRenderTarget === !0, xe = J.length > 1;
      if (xe || ($.__webglTexture === void 0 && ($.__webglTexture = i.createTexture()), $.__version = g.version, a.memory.textures++), Y) {
        F.__webglFramebuffer = [];
        for (let se = 0; se < 6; se++)
          if (g.mipmaps && g.mipmaps.length > 0) {
            F.__webglFramebuffer[se] = [];
            for (let ce = 0; ce < g.mipmaps.length; ce++)
              F.__webglFramebuffer[se][ce] = i.createFramebuffer();
          } else
            F.__webglFramebuffer[se] = i.createFramebuffer();
      } else {
        if (g.mipmaps && g.mipmaps.length > 0) {
          F.__webglFramebuffer = [];
          for (let se = 0; se < g.mipmaps.length; se++)
            F.__webglFramebuffer[se] = i.createFramebuffer();
        } else
          F.__webglFramebuffer = i.createFramebuffer();
        if (xe)
          for (let se = 0, ce = J.length; se < ce; se++) {
            let Ce = n.get(J[se]);
            Ce.__webglTexture === void 0 && (Ce.__webglTexture = i.createTexture(), a.memory.textures++);
          }
        if (b.samples > 0 && _e(b) === !1) {
          F.__webglMultisampledFramebuffer = i.createFramebuffer(), F.__webglColorRenderbuffer = [], t.bindFramebuffer(i.FRAMEBUFFER, F.__webglMultisampledFramebuffer);
          for (let se = 0; se < J.length; se++) {
            let ce = J[se];
            F.__webglColorRenderbuffer[se] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, F.__webglColorRenderbuffer[se]);
            let Ce = r.convert(ce.format, ce.colorSpace), j = r.convert(ce.type), oe = w(ce.internalFormat, Ce, j, ce.colorSpace, b.isXRRenderTarget === !0), Oe = Ze(b);
            i.renderbufferStorageMultisample(i.RENDERBUFFER, Oe, oe, b.width, b.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + se, i.RENDERBUFFER, F.__webglColorRenderbuffer[se]);
          }
          i.bindRenderbuffer(i.RENDERBUFFER, null), b.depthBuffer && (F.__webglDepthRenderbuffer = i.createRenderbuffer(), de(F.__webglDepthRenderbuffer, b, !0)), t.bindFramebuffer(i.FRAMEBUFFER, null);
        }
      }
      if (Y) {
        t.bindTexture(i.TEXTURE_CUBE_MAP, $.__webglTexture), me(i.TEXTURE_CUBE_MAP, g);
        for (let se = 0; se < 6; se++)
          if (g.mipmaps && g.mipmaps.length > 0)
            for (let ce = 0; ce < g.mipmaps.length; ce++)
              Q(F.__webglFramebuffer[se][ce], b, g, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + se, ce);
          else
            Q(F.__webglFramebuffer[se], b, g, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + se, 0);
        p(g) && u(i.TEXTURE_CUBE_MAP), t.unbindTexture();
      } else if (xe) {
        for (let se = 0, ce = J.length; se < ce; se++) {
          let Ce = J[se], j = n.get(Ce);
          t.bindTexture(i.TEXTURE_2D, j.__webglTexture), me(i.TEXTURE_2D, Ce), Q(F.__webglFramebuffer, b, Ce, i.COLOR_ATTACHMENT0 + se, i.TEXTURE_2D, 0), p(Ce) && u(i.TEXTURE_2D);
        }
        t.unbindTexture();
      } else {
        let se = i.TEXTURE_2D;
        if ((b.isWebGL3DRenderTarget || b.isWebGLArrayRenderTarget) && (se = b.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), t.bindTexture(se, $.__webglTexture), me(se, g), g.mipmaps && g.mipmaps.length > 0)
          for (let ce = 0; ce < g.mipmaps.length; ce++)
            Q(F.__webglFramebuffer[ce], b, g, i.COLOR_ATTACHMENT0, se, ce);
        else
          Q(F.__webglFramebuffer, b, g, i.COLOR_ATTACHMENT0, se, 0);
        p(g) && u(se), t.unbindTexture();
      }
      b.depthBuffer && Te(b);
    }
    function Qe(b) {
      let g = b.textures;
      for (let F = 0, $ = g.length; F < $; F++) {
        let J = g[F];
        if (p(J)) {
          let Y = b.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : i.TEXTURE_2D, xe = n.get(J).__webglTexture;
          t.bindTexture(Y, xe), u(Y), t.unbindTexture();
        }
      }
    }
    let A = [], tt = [];
    function qe(b) {
      if (b.samples > 0) {
        if (_e(b) === !1) {
          let g = b.textures, F = b.width, $ = b.height, J = i.COLOR_BUFFER_BIT, Y = b.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, xe = n.get(b), se = g.length > 1;
          if (se)
            for (let ce = 0; ce < g.length; ce++)
              t.bindFramebuffer(i.FRAMEBUFFER, xe.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ce, i.RENDERBUFFER, null), t.bindFramebuffer(i.FRAMEBUFFER, xe.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ce, i.TEXTURE_2D, null, 0);
          t.bindFramebuffer(i.READ_FRAMEBUFFER, xe.__webglMultisampledFramebuffer), t.bindFramebuffer(i.DRAW_FRAMEBUFFER, xe.__webglFramebuffer);
          for (let ce = 0; ce < g.length; ce++) {
            if (b.resolveDepthBuffer && (b.depthBuffer && (J |= i.DEPTH_BUFFER_BIT), b.stencilBuffer && b.resolveStencilBuffer && (J |= i.STENCIL_BUFFER_BIT)), se) {
              i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, xe.__webglColorRenderbuffer[ce]);
              let Ce = n.get(g[ce]).__webglTexture;
              i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, Ce, 0);
            }
            i.blitFramebuffer(0, 0, F, $, 0, 0, F, $, J, i.NEAREST), l === !0 && (A.length = 0, tt.length = 0, A.push(i.COLOR_ATTACHMENT0 + ce), b.depthBuffer && b.resolveDepthBuffer === !1 && (A.push(Y), tt.push(Y), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, tt)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, A));
          }
          if (t.bindFramebuffer(i.READ_FRAMEBUFFER, null), t.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), se)
            for (let ce = 0; ce < g.length; ce++) {
              t.bindFramebuffer(i.FRAMEBUFFER, xe.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ce, i.RENDERBUFFER, xe.__webglColorRenderbuffer[ce]);
              let Ce = n.get(g[ce]).__webglTexture;
              t.bindFramebuffer(i.FRAMEBUFFER, xe.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ce, i.TEXTURE_2D, Ce, 0);
            }
          t.bindFramebuffer(i.DRAW_FRAMEBUFFER, xe.__webglMultisampledFramebuffer);
        } else if (b.depthBuffer && b.resolveDepthBuffer === !1 && l) {
          let g = b.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
          i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [g]);
        }
      }
    }
    function Ze(b) {
      return Math.min(s.maxSamples, b.samples);
    }
    function _e(b) {
      let g = n.get(b);
      return b.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && g.__useRenderToTexture !== !1;
    }
    function nt(b) {
      let g = a.render.frame;
      h.get(b) !== g && (h.set(b, g), b.update());
    }
    function we(b, g) {
      let F = b.colorSpace, $ = b.format, J = b.type;
      return b.isCompressedTexture === !0 || b.isVideoTexture === !0 || F !== xn && F !== dn && (Xe.getTransfer(F) === $e ? ($ !== Bt || J !== nn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), g;
    }
    function Re(b) {
      return typeof HTMLImageElement < "u" && b instanceof HTMLImageElement ? (c.width = b.naturalWidth || b.width, c.height = b.naturalHeight || b.height) : typeof VideoFrame < "u" && b instanceof VideoFrame ? (c.width = b.displayWidth, c.height = b.displayHeight) : (c.width = b.width, c.height = b.height), c;
    }
    this.allocateTextureUnit = W, this.resetTextureUnits = P, this.setTexture2D = G, this.setTexture2DArray = Z, this.setTexture3D = H, this.setTextureCube = K, this.rebindTextures = Le, this.setupRenderTarget = Ue, this.updateRenderTargetMipmap = Qe, this.updateMultisampleRenderTarget = qe, this.setupDepthRenderbuffer = Te, this.setupFrameBufferTexture = Q, this.useMultisampledRTT = _e;
  }
  function ag(i, e) {
    function t(n, s = dn) {
      let r, a = Xe.getTransfer(s);
      if (n === nn) return i.UNSIGNED_BYTE;
      if (n === So) return i.UNSIGNED_SHORT_4_4_4_4;
      if (n === bo) return i.UNSIGNED_SHORT_5_5_5_1;
      if (n === _c) return i.UNSIGNED_INT_5_9_9_9_REV;
      if (n === mc) return i.BYTE;
      if (n === gc) return i.SHORT;
      if (n === Ii) return i.UNSIGNED_SHORT;
      if (n === Mo) return i.INT;
      if (n === In) return i.UNSIGNED_INT;
      if (n === jt) return i.FLOAT;
      if (n === Oi) return i.HALF_FLOAT;
      if (n === xc) return i.ALPHA;
      if (n === vc) return i.RGB;
      if (n === Bt) return i.RGBA;
      if (n === yc) return i.LUMINANCE;
      if (n === Mc) return i.LUMINANCE_ALPHA;
      if (n === ci) return i.DEPTH_COMPONENT;
      if (n === mi) return i.DEPTH_STENCIL;
      if (n === Sc) return i.RED;
      if (n === Eo) return i.RED_INTEGER;
      if (n === bc) return i.RG;
      if (n === wo) return i.RG_INTEGER;
      if (n === Ao) return i.RGBA_INTEGER;
      if (n === Rs || n === Cs || n === Ps || n === Is)
        if (a === $e)
          if (r = e.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
            if (n === Rs) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
            if (n === Cs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
            if (n === Ps) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
            if (n === Is) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
          } else
            return null;
        else if (r = e.get("WEBGL_compressed_texture_s3tc"), r !== null) {
          if (n === Rs) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
          if (n === Cs) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
          if (n === Ps) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
          if (n === Is) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        } else
          return null;
      if (n === ga || n === _a || n === xa || n === va)
        if (r = e.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
          if (n === ga) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
          if (n === _a) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
          if (n === xa) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
          if (n === va) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        } else
          return null;
      if (n === ya || n === Ma || n === Sa)
        if (r = e.get("WEBGL_compressed_texture_etc"), r !== null) {
          if (n === ya || n === Ma) return a === $e ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
          if (n === Sa) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
        } else
          return null;
      if (n === ba || n === Ea || n === wa || n === Aa || n === Ta || n === Ra || n === Ca || n === Pa || n === Ia || n === La || n === Da || n === Ua || n === Na || n === Fa)
        if (r = e.get("WEBGL_compressed_texture_astc"), r !== null) {
          if (n === ba) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
          if (n === Ea) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
          if (n === wa) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
          if (n === Aa) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
          if (n === Ta) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
          if (n === Ra) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
          if (n === Ca) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
          if (n === Pa) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
          if (n === Ia) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
          if (n === La) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
          if (n === Da) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
          if (n === Ua) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
          if (n === Na) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
          if (n === Fa) return a === $e ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
        } else
          return null;
      if (n === Ls || n === Oa || n === Ba)
        if (r = e.get("EXT_texture_compression_bptc"), r !== null) {
          if (n === Ls) return a === $e ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
          if (n === Oa) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
          if (n === Ba) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
        } else
          return null;
      if (n === Ec || n === za || n === ka || n === Ha)
        if (r = e.get("EXT_texture_compression_rgtc"), r !== null) {
          if (n === Ls) return r.COMPRESSED_RED_RGTC1_EXT;
          if (n === za) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
          if (n === ka) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
          if (n === Ha) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
        } else
          return null;
      return n === pi ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
    }
    return { convert: t };
  }
  var io = class extends gt {
    constructor(e = []) {
      super(), this.isArrayCamera = !0, this.cameras = e;
    }
  }, oi = class extends yt {
    constructor() {
      super(), this.isGroup = !0, this.type = "Group";
    }
  }, og = { type: "move" }, Pi = class {
    constructor() {
      this._targetRay = null, this._grip = null, this._hand = null;
    }
    getHandSpace() {
      return this._hand === null && (this._hand = new oi(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
    }
    getTargetRaySpace() {
      return this._targetRay === null && (this._targetRay = new oi(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new D(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new D()), this._targetRay;
    }
    getGripSpace() {
      return this._grip === null && (this._grip = new oi(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new D(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new D()), this._grip;
    }
    dispatchEvent(e) {
      return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
    }
    connect(e) {
      if (e && e.hand) {
        let t = this._hand;
        if (t)
          for (let n of e.hand.values())
            this._getHandJoint(t, n);
      }
      return this.dispatchEvent({ type: "connected", data: e }), this;
    }
    disconnect(e) {
      return this.dispatchEvent({ type: "disconnected", data: e }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
    }
    update(e, t, n) {
      let s = null, r = null, a = null, o = this._targetRay, l = this._grip, c = this._hand;
      if (e && t.session.visibilityState !== "visible-blurred") {
        if (c && e.hand) {
          a = !0;
          for (let y of e.hand.values()) {
            let p = t.getJointPose(y, n), u = this._getHandJoint(c, y);
            p !== null && (u.matrix.fromArray(p.transform.matrix), u.matrix.decompose(u.position, u.rotation, u.scale), u.matrixWorldNeedsUpdate = !0, u.jointRadius = p.radius), u.visible = p !== null;
          }
          let h = c.joints["index-finger-tip"], f = c.joints["thumb-tip"], d = h.position.distanceTo(f.position), m = 0.02, _ = 5e-3;
          c.inputState.pinching && d > m + _ ? (c.inputState.pinching = !1, this.dispatchEvent({
            type: "pinchend",
            handedness: e.handedness,
            target: this
          })) : !c.inputState.pinching && d <= m - _ && (c.inputState.pinching = !0, this.dispatchEvent({
            type: "pinchstart",
            handedness: e.handedness,
            target: this
          }));
        } else
          l !== null && e.gripSpace && (r = t.getPose(e.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = !1, r.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = !1));
        o !== null && (s = t.getPose(e.targetRaySpace, n), s === null && r !== null && (s = r), s !== null && (o.matrix.fromArray(s.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(s.linearVelocity)) : o.hasLinearVelocity = !1, s.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(s.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(og)));
      }
      return o !== null && (o.visible = s !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = a !== null), this;
    }
    // private method
    _getHandJoint(e, t) {
      if (e.joints[t.jointName] === void 0) {
        let n = new oi();
        n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
      }
      return e.joints[t.jointName];
    }
  }, lg = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, cg = `
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

}`, so = class {
    constructor() {
      this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
    }
    init(e, t, n) {
      if (this.texture === null) {
        let s = new At(), r = e.properties.get(s);
        r.__webglTexture = t.texture, (t.depthNear != n.depthNear || t.depthFar != n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = s;
      }
    }
    getMesh(e) {
      if (this.texture !== null && this.mesh === null) {
        let t = e.cameras[0].viewport, n = new Gt({
          vertexShader: lg,
          fragmentShader: cg,
          uniforms: {
            depthColor: { value: this.texture },
            depthWidth: { value: t.z },
            depthHeight: { value: t.w }
          }
        });
        this.mesh = new wt(new _i(20, 20), n);
      }
      return this.mesh;
    }
    reset() {
      this.texture = null, this.mesh = null;
    }
    getDepthTexture() {
      return this.texture;
    }
  }, ro = class extends gn {
    constructor(e, t) {
      super();
      let n = this, s = null, r = 1, a = null, o = "local-floor", l = 1, c = null, h = null, f = null, d = null, m = null, _ = null, y = new so(), p = t.getContextAttributes(), u = null, w = null, S = [], E = [], O = new ke(), T = null, R = new gt();
      R.layers.enable(1), R.viewport = new ot();
      let B = new gt();
      B.layers.enable(2), B.viewport = new ot();
      let M = [R, B], v = new io();
      v.layers.enable(1), v.layers.enable(2);
      let P = null, W = null;
      this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(V) {
        let Q = S[V];
        return Q === void 0 && (Q = new Pi(), S[V] = Q), Q.getTargetRaySpace();
      }, this.getControllerGrip = function(V) {
        let Q = S[V];
        return Q === void 0 && (Q = new Pi(), S[V] = Q), Q.getGripSpace();
      }, this.getHand = function(V) {
        let Q = S[V];
        return Q === void 0 && (Q = new Pi(), S[V] = Q), Q.getHandSpace();
      };
      function z(V) {
        let Q = E.indexOf(V.inputSource);
        if (Q === -1)
          return;
        let de = S[Q];
        de !== void 0 && (de.update(V.inputSource, V.frame, c || a), de.dispatchEvent({ type: V.type, data: V.inputSource }));
      }
      function G() {
        s.removeEventListener("select", z), s.removeEventListener("selectstart", z), s.removeEventListener("selectend", z), s.removeEventListener("squeeze", z), s.removeEventListener("squeezestart", z), s.removeEventListener("squeezeend", z), s.removeEventListener("end", G), s.removeEventListener("inputsourceschange", Z);
        for (let V = 0; V < S.length; V++) {
          let Q = E[V];
          Q !== null && (E[V] = null, S[V].disconnect(Q));
        }
        P = null, W = null, y.reset(), e.setRenderTarget(u), m = null, d = null, f = null, s = null, w = null, Ye.stop(), n.isPresenting = !1, e.setPixelRatio(T), e.setSize(O.width, O.height, !1), n.dispatchEvent({ type: "sessionend" });
      }
      this.setFramebufferScaleFactor = function(V) {
        r = V, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
      }, this.setReferenceSpaceType = function(V) {
        o = V, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
      }, this.getReferenceSpace = function() {
        return c || a;
      }, this.setReferenceSpace = function(V) {
        c = V;
      }, this.getBaseLayer = function() {
        return d !== null ? d : m;
      }, this.getBinding = function() {
        return f;
      }, this.getFrame = function() {
        return _;
      }, this.getSession = function() {
        return s;
      }, this.setSession = async function(V) {
        if (s = V, s !== null) {
          if (u = e.getRenderTarget(), s.addEventListener("select", z), s.addEventListener("selectstart", z), s.addEventListener("selectend", z), s.addEventListener("squeeze", z), s.addEventListener("squeezestart", z), s.addEventListener("squeezeend", z), s.addEventListener("end", G), s.addEventListener("inputsourceschange", Z), p.xrCompatible !== !0 && await t.makeXRCompatible(), T = e.getPixelRatio(), e.getSize(O), s.renderState.layers === void 0) {
            let Q = {
              antialias: p.antialias,
              alpha: !0,
              depth: p.depth,
              stencil: p.stencil,
              framebufferScaleFactor: r
            };
            m = new XRWebGLLayer(s, t, Q), s.updateRenderState({ baseLayer: m }), e.setPixelRatio(1), e.setSize(m.framebufferWidth, m.framebufferHeight, !1), w = new sn(
              m.framebufferWidth,
              m.framebufferHeight,
              {
                format: Bt,
                type: nn,
                colorSpace: e.outputColorSpace,
                stencilBuffer: p.stencil
              }
            );
          } else {
            let Q = null, de = null, le = null;
            p.depth && (le = p.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, Q = p.stencil ? mi : ci, de = p.stencil ? pi : In);
            let Te = {
              colorFormat: t.RGBA8,
              depthFormat: le,
              scaleFactor: r
            };
            f = new XRWebGLBinding(s, t), d = f.createProjectionLayer(Te), s.updateRenderState({ layers: [d] }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), w = new sn(
              d.textureWidth,
              d.textureHeight,
              {
                format: Bt,
                type: nn,
                depthTexture: new Js(d.textureWidth, d.textureHeight, de, void 0, void 0, void 0, void 0, void 0, void 0, Q),
                stencilBuffer: p.stencil,
                colorSpace: e.outputColorSpace,
                samples: p.antialias ? 4 : 0,
                resolveDepthBuffer: d.ignoreDepthValues === !1
              }
            );
          }
          w.isXRRenderTarget = !0, this.setFoveation(l), c = null, a = await s.requestReferenceSpace(o), Ye.setContext(s), Ye.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
        }
      }, this.getEnvironmentBlendMode = function() {
        if (s !== null)
          return s.environmentBlendMode;
      }, this.getDepthTexture = function() {
        return y.getDepthTexture();
      };
      function Z(V) {
        for (let Q = 0; Q < V.removed.length; Q++) {
          let de = V.removed[Q], le = E.indexOf(de);
          le >= 0 && (E[le] = null, S[le].disconnect(de));
        }
        for (let Q = 0; Q < V.added.length; Q++) {
          let de = V.added[Q], le = E.indexOf(de);
          if (le === -1) {
            for (let Le = 0; Le < S.length; Le++)
              if (Le >= E.length) {
                E.push(de), le = Le;
                break;
              } else if (E[Le] === null) {
                E[Le] = de, le = Le;
                break;
              }
            if (le === -1) break;
          }
          let Te = S[le];
          Te && Te.connect(de);
        }
      }
      let H = new D(), K = new D();
      function k(V, Q, de) {
        H.setFromMatrixPosition(Q.matrixWorld), K.setFromMatrixPosition(de.matrixWorld);
        let le = H.distanceTo(K), Te = Q.projectionMatrix.elements, Le = de.projectionMatrix.elements, Ue = Te[14] / (Te[10] - 1), Qe = Te[14] / (Te[10] + 1), A = (Te[9] + 1) / Te[5], tt = (Te[9] - 1) / Te[5], qe = (Te[8] - 1) / Te[0], Ze = (Le[8] + 1) / Le[0], _e = Ue * qe, nt = Ue * Ze, we = le / (-qe + Ze), Re = we * -qe;
        Q.matrixWorld.decompose(V.position, V.quaternion, V.scale), V.translateX(Re), V.translateZ(we), V.matrixWorld.compose(V.position, V.quaternion, V.scale), V.matrixWorldInverse.copy(V.matrixWorld).invert();
        let b = Ue + we, g = Qe + we, F = _e - Re, $ = nt + (le - Re), J = A * Qe / g * b, Y = tt * Qe / g * b;
        V.projectionMatrix.makePerspective(F, $, J, Y, b, g), V.projectionMatrixInverse.copy(V.projectionMatrix).invert();
      }
      function ae(V, Q) {
        Q === null ? V.matrixWorld.copy(V.matrix) : V.matrixWorld.multiplyMatrices(Q.matrixWorld, V.matrix), V.matrixWorldInverse.copy(V.matrixWorld).invert();
      }
      this.updateCamera = function(V) {
        if (s === null) return;
        y.texture !== null && (V.near = y.depthNear, V.far = y.depthFar), v.near = B.near = R.near = V.near, v.far = B.far = R.far = V.far, (P !== v.near || W !== v.far) && (s.updateRenderState({
          depthNear: v.near,
          depthFar: v.far
        }), P = v.near, W = v.far, R.near = P, R.far = W, B.near = P, B.far = W, R.updateProjectionMatrix(), B.updateProjectionMatrix(), V.updateProjectionMatrix());
        let Q = V.parent, de = v.cameras;
        ae(v, Q);
        for (let le = 0; le < de.length; le++)
          ae(de[le], Q);
        de.length === 2 ? k(v, R, B) : v.projectionMatrix.copy(R.projectionMatrix), he(V, v, Q);
      };
      function he(V, Q, de) {
        de === null ? V.matrix.copy(Q.matrixWorld) : (V.matrix.copy(de.matrixWorld), V.matrix.invert(), V.matrix.multiply(Q.matrixWorld)), V.matrix.decompose(V.position, V.quaternion, V.scale), V.updateMatrixWorld(!0), V.projectionMatrix.copy(Q.projectionMatrix), V.projectionMatrixInverse.copy(Q.projectionMatrixInverse), V.isPerspectiveCamera && (V.fov = Ga * 2 * Math.atan(1 / V.projectionMatrix.elements[5]), V.zoom = 1);
      }
      this.getCamera = function() {
        return v;
      }, this.getFoveation = function() {
        if (!(d === null && m === null))
          return l;
      }, this.setFoveation = function(V) {
        l = V, d !== null && (d.fixedFoveation = V), m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = V);
      }, this.hasDepthSensing = function() {
        return y.texture !== null;
      }, this.getDepthSensingMesh = function() {
        return y.getMesh(v);
      };
      let me = null;
      function Fe(V, Q) {
        if (h = Q.getViewerPose(c || a), _ = Q, h !== null) {
          let de = h.views;
          m !== null && (e.setRenderTargetFramebuffer(w, m.framebuffer), e.setRenderTarget(w));
          let le = !1;
          de.length !== v.cameras.length && (v.cameras.length = 0, le = !0);
          for (let Le = 0; Le < de.length; Le++) {
            let Ue = de[Le], Qe = null;
            if (m !== null)
              Qe = m.getViewport(Ue);
            else {
              let tt = f.getViewSubImage(d, Ue);
              Qe = tt.viewport, Le === 0 && (e.setRenderTargetTextures(
                w,
                tt.colorTexture,
                d.ignoreDepthValues ? void 0 : tt.depthStencilTexture
              ), e.setRenderTarget(w));
            }
            let A = M[Le];
            A === void 0 && (A = new gt(), A.layers.enable(Le), A.viewport = new ot(), M[Le] = A), A.matrix.fromArray(Ue.transform.matrix), A.matrix.decompose(A.position, A.quaternion, A.scale), A.projectionMatrix.fromArray(Ue.projectionMatrix), A.projectionMatrixInverse.copy(A.projectionMatrix).invert(), A.viewport.set(Qe.x, Qe.y, Qe.width, Qe.height), Le === 0 && (v.matrix.copy(A.matrix), v.matrix.decompose(v.position, v.quaternion, v.scale)), le === !0 && v.cameras.push(A);
          }
          let Te = s.enabledFeatures;
          if (Te && Te.includes("depth-sensing")) {
            let Le = f.getDepthInformation(de[0]);
            Le && Le.isValid && Le.texture && y.init(e, Le, s.renderState);
          }
        }
        for (let de = 0; de < S.length; de++) {
          let le = E[de], Te = S[de];
          le !== null && Te !== void 0 && Te.update(le, Q, c || a);
        }
        me && me(V, Q), Q.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: Q }), _ = null;
      }
      let Ye = new Pc();
      Ye.setAnimationLoop(Fe), this.setAnimationLoop = function(V) {
        me = V;
      }, this.dispose = function() {
      };
    }
  }, wn = /* @__PURE__ */ new Vt(), hg = /* @__PURE__ */ new at();
  function ug(i, e) {
    function t(p, u) {
      p.matrixAutoUpdate === !0 && p.updateMatrix(), u.value.copy(p.matrix);
    }
    function n(p, u) {
      u.color.getRGB(p.fogColor.value, Cc(i)), u.isFog ? (p.fogNear.value = u.near, p.fogFar.value = u.far) : u.isFogExp2 && (p.fogDensity.value = u.density);
    }
    function s(p, u, w, S, E) {
      u.isMeshBasicMaterial || u.isMeshLambertMaterial ? r(p, u) : u.isMeshToonMaterial ? (r(p, u), f(p, u)) : u.isMeshPhongMaterial ? (r(p, u), h(p, u)) : u.isMeshStandardMaterial ? (r(p, u), d(p, u), u.isMeshPhysicalMaterial && m(p, u, E)) : u.isMeshMatcapMaterial ? (r(p, u), _(p, u)) : u.isMeshDepthMaterial ? r(p, u) : u.isMeshDistanceMaterial ? (r(p, u), y(p, u)) : u.isMeshNormalMaterial ? r(p, u) : u.isLineBasicMaterial ? (a(p, u), u.isLineDashedMaterial && o(p, u)) : u.isPointsMaterial ? l(p, u, w, S) : u.isSpriteMaterial ? c(p, u) : u.isShadowMaterial ? (p.color.value.copy(u.color), p.opacity.value = u.opacity) : u.isShaderMaterial && (u.uniformsNeedUpdate = !1);
    }
    function r(p, u) {
      p.opacity.value = u.opacity, u.color && p.diffuse.value.copy(u.color), u.emissive && p.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity), u.map && (p.map.value = u.map, t(u.map, p.mapTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.bumpMap && (p.bumpMap.value = u.bumpMap, t(u.bumpMap, p.bumpMapTransform), p.bumpScale.value = u.bumpScale, u.side === vt && (p.bumpScale.value *= -1)), u.normalMap && (p.normalMap.value = u.normalMap, t(u.normalMap, p.normalMapTransform), p.normalScale.value.copy(u.normalScale), u.side === vt && p.normalScale.value.negate()), u.displacementMap && (p.displacementMap.value = u.displacementMap, t(u.displacementMap, p.displacementMapTransform), p.displacementScale.value = u.displacementScale, p.displacementBias.value = u.displacementBias), u.emissiveMap && (p.emissiveMap.value = u.emissiveMap, t(u.emissiveMap, p.emissiveMapTransform)), u.specularMap && (p.specularMap.value = u.specularMap, t(u.specularMap, p.specularMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
      let w = e.get(u), S = w.envMap, E = w.envMapRotation;
      S && (p.envMap.value = S, wn.copy(E), wn.x *= -1, wn.y *= -1, wn.z *= -1, S.isCubeTexture && S.isRenderTargetTexture === !1 && (wn.y *= -1, wn.z *= -1), p.envMapRotation.value.setFromMatrix4(hg.makeRotationFromEuler(wn)), p.flipEnvMap.value = S.isCubeTexture && S.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = u.reflectivity, p.ior.value = u.ior, p.refractionRatio.value = u.refractionRatio), u.lightMap && (p.lightMap.value = u.lightMap, p.lightMapIntensity.value = u.lightMapIntensity, t(u.lightMap, p.lightMapTransform)), u.aoMap && (p.aoMap.value = u.aoMap, p.aoMapIntensity.value = u.aoMapIntensity, t(u.aoMap, p.aoMapTransform));
    }
    function a(p, u) {
      p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, u.map && (p.map.value = u.map, t(u.map, p.mapTransform));
    }
    function o(p, u) {
      p.dashSize.value = u.dashSize, p.totalSize.value = u.dashSize + u.gapSize, p.scale.value = u.scale;
    }
    function l(p, u, w, S) {
      p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, p.size.value = u.size * w, p.scale.value = S * 0.5, u.map && (p.map.value = u.map, t(u.map, p.uvTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
    }
    function c(p, u) {
      p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, p.rotation.value = u.rotation, u.map && (p.map.value = u.map, t(u.map, p.mapTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
    }
    function h(p, u) {
      p.specular.value.copy(u.specular), p.shininess.value = Math.max(u.shininess, 1e-4);
    }
    function f(p, u) {
      u.gradientMap && (p.gradientMap.value = u.gradientMap);
    }
    function d(p, u) {
      p.metalness.value = u.metalness, u.metalnessMap && (p.metalnessMap.value = u.metalnessMap, t(u.metalnessMap, p.metalnessMapTransform)), p.roughness.value = u.roughness, u.roughnessMap && (p.roughnessMap.value = u.roughnessMap, t(u.roughnessMap, p.roughnessMapTransform)), u.envMap && (p.envMapIntensity.value = u.envMapIntensity);
    }
    function m(p, u, w) {
      p.ior.value = u.ior, u.sheen > 0 && (p.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen), p.sheenRoughness.value = u.sheenRoughness, u.sheenColorMap && (p.sheenColorMap.value = u.sheenColorMap, t(u.sheenColorMap, p.sheenColorMapTransform)), u.sheenRoughnessMap && (p.sheenRoughnessMap.value = u.sheenRoughnessMap, t(u.sheenRoughnessMap, p.sheenRoughnessMapTransform))), u.clearcoat > 0 && (p.clearcoat.value = u.clearcoat, p.clearcoatRoughness.value = u.clearcoatRoughness, u.clearcoatMap && (p.clearcoatMap.value = u.clearcoatMap, t(u.clearcoatMap, p.clearcoatMapTransform)), u.clearcoatRoughnessMap && (p.clearcoatRoughnessMap.value = u.clearcoatRoughnessMap, t(u.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)), u.clearcoatNormalMap && (p.clearcoatNormalMap.value = u.clearcoatNormalMap, t(u.clearcoatNormalMap, p.clearcoatNormalMapTransform), p.clearcoatNormalScale.value.copy(u.clearcoatNormalScale), u.side === vt && p.clearcoatNormalScale.value.negate())), u.dispersion > 0 && (p.dispersion.value = u.dispersion), u.iridescence > 0 && (p.iridescence.value = u.iridescence, p.iridescenceIOR.value = u.iridescenceIOR, p.iridescenceThicknessMinimum.value = u.iridescenceThicknessRange[0], p.iridescenceThicknessMaximum.value = u.iridescenceThicknessRange[1], u.iridescenceMap && (p.iridescenceMap.value = u.iridescenceMap, t(u.iridescenceMap, p.iridescenceMapTransform)), u.iridescenceThicknessMap && (p.iridescenceThicknessMap.value = u.iridescenceThicknessMap, t(u.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))), u.transmission > 0 && (p.transmission.value = u.transmission, p.transmissionSamplerMap.value = w.texture, p.transmissionSamplerSize.value.set(w.width, w.height), u.transmissionMap && (p.transmissionMap.value = u.transmissionMap, t(u.transmissionMap, p.transmissionMapTransform)), p.thickness.value = u.thickness, u.thicknessMap && (p.thicknessMap.value = u.thicknessMap, t(u.thicknessMap, p.thicknessMapTransform)), p.attenuationDistance.value = u.attenuationDistance, p.attenuationColor.value.copy(u.attenuationColor)), u.anisotropy > 0 && (p.anisotropyVector.value.set(u.anisotropy * Math.cos(u.anisotropyRotation), u.anisotropy * Math.sin(u.anisotropyRotation)), u.anisotropyMap && (p.anisotropyMap.value = u.anisotropyMap, t(u.anisotropyMap, p.anisotropyMapTransform))), p.specularIntensity.value = u.specularIntensity, p.specularColor.value.copy(u.specularColor), u.specularColorMap && (p.specularColorMap.value = u.specularColorMap, t(u.specularColorMap, p.specularColorMapTransform)), u.specularIntensityMap && (p.specularIntensityMap.value = u.specularIntensityMap, t(u.specularIntensityMap, p.specularIntensityMapTransform));
    }
    function _(p, u) {
      u.matcap && (p.matcap.value = u.matcap);
    }
    function y(p, u) {
      let w = e.get(u).light;
      p.referencePosition.value.setFromMatrixPosition(w.matrixWorld), p.nearDistance.value = w.shadow.camera.near, p.farDistance.value = w.shadow.camera.far;
    }
    return {
      refreshFogUniforms: n,
      refreshMaterialUniforms: s
    };
  }
  function dg(i, e, t, n) {
    let s = {}, r = {}, a = [], o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
    function l(w, S) {
      let E = S.program;
      n.uniformBlockBinding(w, E);
    }
    function c(w, S) {
      let E = s[w.id];
      E === void 0 && (_(w), E = h(w), s[w.id] = E, w.addEventListener("dispose", p));
      let O = S.program;
      n.updateUBOMapping(w, O);
      let T = e.render.frame;
      r[w.id] !== T && (d(w), r[w.id] = T);
    }
    function h(w) {
      let S = f();
      w.__bindingPointIndex = S;
      let E = i.createBuffer(), O = w.__size, T = w.usage;
      return i.bindBuffer(i.UNIFORM_BUFFER, E), i.bufferData(i.UNIFORM_BUFFER, O, T), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, S, E), E;
    }
    function f() {
      for (let w = 0; w < o; w++)
        if (a.indexOf(w) === -1)
          return a.push(w), w;
      return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
    }
    function d(w) {
      let S = s[w.id], E = w.uniforms, O = w.__cache;
      i.bindBuffer(i.UNIFORM_BUFFER, S);
      for (let T = 0, R = E.length; T < R; T++) {
        let B = Array.isArray(E[T]) ? E[T] : [E[T]];
        for (let M = 0, v = B.length; M < v; M++) {
          let P = B[M];
          if (m(P, T, M, O) === !0) {
            let W = P.__offset, z = Array.isArray(P.value) ? P.value : [P.value], G = 0;
            for (let Z = 0; Z < z.length; Z++) {
              let H = z[Z], K = y(H);
              typeof H == "number" || typeof H == "boolean" ? (P.__data[0] = H, i.bufferSubData(i.UNIFORM_BUFFER, W + G, P.__data)) : H.isMatrix3 ? (P.__data[0] = H.elements[0], P.__data[1] = H.elements[1], P.__data[2] = H.elements[2], P.__data[3] = 0, P.__data[4] = H.elements[3], P.__data[5] = H.elements[4], P.__data[6] = H.elements[5], P.__data[7] = 0, P.__data[8] = H.elements[6], P.__data[9] = H.elements[7], P.__data[10] = H.elements[8], P.__data[11] = 0) : (H.toArray(P.__data, G), G += K.storage / Float32Array.BYTES_PER_ELEMENT);
            }
            i.bufferSubData(i.UNIFORM_BUFFER, W, P.__data);
          }
        }
      }
      i.bindBuffer(i.UNIFORM_BUFFER, null);
    }
    function m(w, S, E, O) {
      let T = w.value, R = S + "_" + E;
      if (O[R] === void 0)
        return typeof T == "number" || typeof T == "boolean" ? O[R] = T : O[R] = T.clone(), !0;
      {
        let B = O[R];
        if (typeof T == "number" || typeof T == "boolean") {
          if (B !== T)
            return O[R] = T, !0;
        } else if (B.equals(T) === !1)
          return B.copy(T), !0;
      }
      return !1;
    }
    function _(w) {
      let S = w.uniforms, E = 0, O = 16;
      for (let R = 0, B = S.length; R < B; R++) {
        let M = Array.isArray(S[R]) ? S[R] : [S[R]];
        for (let v = 0, P = M.length; v < P; v++) {
          let W = M[v], z = Array.isArray(W.value) ? W.value : [W.value];
          for (let G = 0, Z = z.length; G < Z; G++) {
            let H = z[G], K = y(H), k = E % O, ae = k % K.boundary, he = k + ae;
            E += ae, he !== 0 && O - he < K.storage && (E += O - he), W.__data = new Float32Array(K.storage / Float32Array.BYTES_PER_ELEMENT), W.__offset = E, E += K.storage;
          }
        }
      }
      let T = E % O;
      return T > 0 && (E += O - T), w.__size = E, w.__cache = {}, this;
    }
    function y(w) {
      let S = {
        boundary: 0,
        // bytes
        storage: 0
        // bytes
      };
      return typeof w == "number" || typeof w == "boolean" ? (S.boundary = 4, S.storage = 4) : w.isVector2 ? (S.boundary = 8, S.storage = 8) : w.isVector3 || w.isColor ? (S.boundary = 16, S.storage = 12) : w.isVector4 ? (S.boundary = 16, S.storage = 16) : w.isMatrix3 ? (S.boundary = 48, S.storage = 48) : w.isMatrix4 ? (S.boundary = 64, S.storage = 64) : w.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", w), S;
    }
    function p(w) {
      let S = w.target;
      S.removeEventListener("dispose", p);
      let E = a.indexOf(S.__bindingPointIndex);
      a.splice(E, 1), i.deleteBuffer(s[S.id]), delete s[S.id], delete r[S.id];
    }
    function u() {
      for (let w in s)
        i.deleteBuffer(s[w]);
      a = [], s = {}, r = {};
    }
    return {
      bind: l,
      update: c,
      dispose: u
    };
  }
  var Ks = class {
    constructor(e = {}) {
      let {
        canvas: t = _u(),
        context: n = null,
        depth: s = !0,
        stencil: r = !1,
        alpha: a = !1,
        antialias: o = !1,
        premultipliedAlpha: l = !0,
        preserveDrawingBuffer: c = !1,
        powerPreference: h = "default",
        failIfMajorPerformanceCaveat: f = !1
      } = e;
      this.isWebGLRenderer = !0;
      let d;
      if (n !== null) {
        if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
          throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
        d = n.getContextAttributes().alpha;
      } else
        d = a;
      let m = new Uint32Array(4), _ = new Int32Array(4), y = null, p = null, u = [], w = [];
      this.domElement = t, this.debug = {
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
      }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = Ct, this.toneMapping = pn, this.toneMappingExposure = 1;
      let S = this, E = !1, O = 0, T = 0, R = null, B = -1, M = null, v = new ot(), P = new ot(), W = null, z = new Ne(0), G = 0, Z = t.width, H = t.height, K = 1, k = null, ae = null, he = new ot(0, 0, Z, H), me = new ot(0, 0, Z, H), Fe = !1, Ye = new Ni(), V = !1, Q = !1, de = new at(), le = new D(), Te = new ot(), Le = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 }, Ue = !1;
      function Qe() {
        return R === null ? K : 1;
      }
      let A = n;
      function tt(x, I) {
        return t.getContext(x, I);
      }
      try {
        let x = {
          alpha: !0,
          depth: s,
          stencil: r,
          antialias: o,
          premultipliedAlpha: l,
          preserveDrawingBuffer: c,
          powerPreference: h,
          failIfMajorPerformanceCaveat: f
        };
        if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${vo}`), t.addEventListener("webglcontextlost", X, !1), t.addEventListener("webglcontextrestored", q, !1), t.addEventListener("webglcontextcreationerror", ne, !1), A === null) {
          let I = "webgl2";
          if (A = tt(I, x), A === null)
            throw tt(I) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
        }
      } catch (x) {
        throw console.error("THREE.WebGLRenderer: " + x.message), x;
      }
      let qe, Ze, _e, nt, we, Re, b, g, F, $, J, Y, xe, se, ce, Ce, j, oe, Oe, Ee, ue, Ae, De, Ke;
      function C() {
        qe = new Cp(A), qe.init(), Ae = new ag(A, qe), Ze = new bp(A, qe, e, Ae), _e = new ig(A), nt = new Lp(A), we = new Xm(), Re = new rg(A, qe, _e, we, Ze, Ae, nt), b = new wp(S), g = new Rp(S), F = new Bu(A), De = new Mp(A, F), $ = new Pp(A, F, nt, De), J = new Up(A, $, F, nt), Oe = new Dp(A, Ze, Re), Ce = new Ep(we), Y = new Wm(S, b, g, qe, Ze, De, Ce), xe = new ug(S, we), se = new Ym(), ce = new jm(qe), oe = new yp(S, b, g, _e, J, d, l), j = new ng(S, J, Ze), Ke = new dg(A, nt, Ze, _e), Ee = new Sp(A, qe, nt), ue = new Ip(A, qe, nt), nt.programs = Y.programs, S.capabilities = Ze, S.extensions = qe, S.properties = we, S.renderLists = se, S.shadowMap = j, S.state = _e, S.info = nt;
      }
      C();
      let ee = new ro(S, A);
      this.xr = ee, this.getContext = function() {
        return A;
      }, this.getContextAttributes = function() {
        return A.getContextAttributes();
      }, this.forceContextLoss = function() {
        let x = qe.get("WEBGL_lose_context");
        x && x.loseContext();
      }, this.forceContextRestore = function() {
        let x = qe.get("WEBGL_lose_context");
        x && x.restoreContext();
      }, this.getPixelRatio = function() {
        return K;
      }, this.setPixelRatio = function(x) {
        x !== void 0 && (K = x, this.setSize(Z, H, !1));
      }, this.getSize = function(x) {
        return x.set(Z, H);
      }, this.setSize = function(x, I, U = !0) {
        if (ee.isPresenting) {
          console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
          return;
        }
        Z = x, H = I, t.width = Math.floor(x * K), t.height = Math.floor(I * K), U === !0 && (t.style.width = x + "px", t.style.height = I + "px"), this.setViewport(0, 0, x, I);
      }, this.getDrawingBufferSize = function(x) {
        return x.set(Z * K, H * K).floor();
      }, this.setDrawingBufferSize = function(x, I, U) {
        Z = x, H = I, K = U, t.width = Math.floor(x * U), t.height = Math.floor(I * U), this.setViewport(0, 0, x, I);
      }, this.getCurrentViewport = function(x) {
        return x.copy(v);
      }, this.getViewport = function(x) {
        return x.copy(he);
      }, this.setViewport = function(x, I, U, N) {
        x.isVector4 ? he.set(x.x, x.y, x.z, x.w) : he.set(x, I, U, N), _e.viewport(v.copy(he).multiplyScalar(K).round());
      }, this.getScissor = function(x) {
        return x.copy(me);
      }, this.setScissor = function(x, I, U, N) {
        x.isVector4 ? me.set(x.x, x.y, x.z, x.w) : me.set(x, I, U, N), _e.scissor(P.copy(me).multiplyScalar(K).round());
      }, this.getScissorTest = function() {
        return Fe;
      }, this.setScissorTest = function(x) {
        _e.setScissorTest(Fe = x);
      }, this.setOpaqueSort = function(x) {
        k = x;
      }, this.setTransparentSort = function(x) {
        ae = x;
      }, this.getClearColor = function(x) {
        return x.copy(oe.getClearColor());
      }, this.setClearColor = function() {
        oe.setClearColor.apply(oe, arguments);
      }, this.getClearAlpha = function() {
        return oe.getClearAlpha();
      }, this.setClearAlpha = function() {
        oe.setClearAlpha.apply(oe, arguments);
      }, this.clear = function(x = !0, I = !0, U = !0) {
        let N = 0;
        if (x) {
          let L = !1;
          if (R !== null) {
            let te = R.texture.format;
            L = te === Ao || te === wo || te === Eo;
          }
          if (L) {
            let te = R.texture.type, re = te === nn || te === In || te === Ii || te === pi || te === So || te === bo, fe = oe.getClearColor(), pe = oe.getClearAlpha(), Me = fe.r, Se = fe.g, ve = fe.b;
            re ? (m[0] = Me, m[1] = Se, m[2] = ve, m[3] = pe, A.clearBufferuiv(A.COLOR, 0, m)) : (_[0] = Me, _[1] = Se, _[2] = ve, _[3] = pe, A.clearBufferiv(A.COLOR, 0, _));
          } else
            N |= A.COLOR_BUFFER_BIT;
        }
        I && (N |= A.DEPTH_BUFFER_BIT), U && (N |= A.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), A.clear(N);
      }, this.clearColor = function() {
        this.clear(!0, !1, !1);
      }, this.clearDepth = function() {
        this.clear(!1, !0, !1);
      }, this.clearStencil = function() {
        this.clear(!1, !1, !0);
      }, this.dispose = function() {
        t.removeEventListener("webglcontextlost", X, !1), t.removeEventListener("webglcontextrestored", q, !1), t.removeEventListener("webglcontextcreationerror", ne, !1), se.dispose(), ce.dispose(), we.dispose(), b.dispose(), g.dispose(), J.dispose(), De.dispose(), Ke.dispose(), Y.dispose(), ee.dispose(), ee.removeEventListener("sessionstart", kt), ee.removeEventListener("sessionend", Io), vn.stop();
      };
      function X(x) {
        x.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), E = !0;
      }
      function q() {
        console.log("THREE.WebGLRenderer: Context Restored."), E = !1;
        let x = nt.autoReset, I = j.enabled, U = j.autoUpdate, N = j.needsUpdate, L = j.type;
        C(), nt.autoReset = x, j.enabled = I, j.autoUpdate = U, j.needsUpdate = N, j.type = L;
      }
      function ne(x) {
        console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", x.statusMessage);
      }
      function ye(x) {
        let I = x.target;
        I.removeEventListener("dispose", ye), Be(I);
      }
      function Be(x) {
        it(x), we.remove(x);
      }
      function it(x) {
        let I = we.get(x).programs;
        I !== void 0 && (I.forEach(function(U) {
          Y.releaseProgram(U);
        }), x.isShaderMaterial && Y.releaseShaderCache(x));
      }
      this.renderBufferDirect = function(x, I, U, N, L, te) {
        I === null && (I = Le);
        let re = L.isMesh && L.matrixWorld.determinant() < 0, fe = Hc(x, I, U, N, L);
        _e.setMaterial(N, re);
        let pe = U.index, Me = 1;
        if (N.wireframe === !0) {
          if (pe = $.getWireframeAttribute(U), pe === void 0) return;
          Me = 2;
        }
        let Se = U.drawRange, ve = U.attributes.position, Ve = Se.start * Me, je = (Se.start + Se.count) * Me;
        te !== null && (Ve = Math.max(Ve, te.start * Me), je = Math.min(je, (te.start + te.count) * Me)), pe !== null ? (Ve = Math.max(Ve, 0), je = Math.min(je, pe.count)) : ve != null && (Ve = Math.max(Ve, 0), je = Math.min(je, ve.count));
        let et = je - Ve;
        if (et < 0 || et === 1 / 0) return;
        De.setup(L, N, fe, U, pe);
        let Mt, Ge = Ee;
        if (pe !== null && (Mt = F.get(pe), Ge = ue, Ge.setIndex(Mt)), L.isMesh)
          N.wireframe === !0 ? (_e.setLineWidth(N.wireframeLinewidth * Qe()), Ge.setMode(A.LINES)) : Ge.setMode(A.TRIANGLES);
        else if (L.isLine) {
          let ge = N.linewidth;
          ge === void 0 && (ge = 1), _e.setLineWidth(ge * Qe()), L.isLineSegments ? Ge.setMode(A.LINES) : L.isLineLoop ? Ge.setMode(A.LINE_LOOP) : Ge.setMode(A.LINE_STRIP);
        } else L.isPoints ? Ge.setMode(A.POINTS) : L.isSprite && Ge.setMode(A.TRIANGLES);
        if (L.isBatchedMesh)
          if (L._multiDrawInstances !== null)
            Ge.renderMultiDrawInstances(L._multiDrawStarts, L._multiDrawCounts, L._multiDrawCount, L._multiDrawInstances);
          else if (qe.get("WEBGL_multi_draw"))
            Ge.renderMultiDraw(L._multiDrawStarts, L._multiDrawCounts, L._multiDrawCount);
          else {
            let ge = L._multiDrawStarts, dt = L._multiDrawCounts, We = L._multiDrawCount, Lt = pe ? F.get(pe).bytesPerElement : 1, On = we.get(N).currentProgram.getUniforms();
            for (let St = 0; St < We; St++)
              On.setValue(A, "_gl_DrawID", St), Ge.render(ge[St] / Lt, dt[St]);
          }
        else if (L.isInstancedMesh)
          Ge.renderInstances(Ve, et, L.count);
        else if (U.isInstancedBufferGeometry) {
          let ge = U._maxInstanceCount !== void 0 ? U._maxInstanceCount : 1 / 0, dt = Math.min(U.instanceCount, ge);
          Ge.renderInstances(Ve, et, dt);
        } else
          Ge.render(Ve, et);
      };
      function ut(x, I, U) {
        x.transparent === !0 && x.side === Qt && x.forceSinglePass === !1 ? (x.side = vt, x.needsUpdate = !0, ki(x, I, U), x.side = mn, x.needsUpdate = !0, ki(x, I, U), x.side = Qt) : ki(x, I, U);
      }
      this.compile = function(x, I, U = null) {
        U === null && (U = x), p = ce.get(U), p.init(I), w.push(p), U.traverseVisible(function(L) {
          L.isLight && L.layers.test(I.layers) && (p.pushLight(L), L.castShadow && p.pushShadow(L));
        }), x !== U && x.traverseVisible(function(L) {
          L.isLight && L.layers.test(I.layers) && (p.pushLight(L), L.castShadow && p.pushShadow(L));
        }), p.setupLights();
        let N = /* @__PURE__ */ new Set();
        return x.traverse(function(L) {
          let te = L.material;
          if (te)
            if (Array.isArray(te))
              for (let re = 0; re < te.length; re++) {
                let fe = te[re];
                ut(fe, U, L), N.add(fe);
              }
            else
              ut(te, U, L), N.add(te);
        }), w.pop(), p = null, N;
      }, this.compileAsync = function(x, I, U = null) {
        let N = this.compile(x, I, U);
        return new Promise((L) => {
          function te() {
            if (N.forEach(function(re) {
              we.get(re).currentProgram.isReady() && N.delete(re);
            }), N.size === 0) {
              L(x);
              return;
            }
            setTimeout(te, 10);
          }
          qe.get("KHR_parallel_shader_compile") !== null ? te() : setTimeout(te, 10);
        });
      };
      let He = null;
      function Wt(x) {
        He && He(x);
      }
      function kt() {
        vn.stop();
      }
      function Io() {
        vn.start();
      }
      let vn = new Pc();
      vn.setAnimationLoop(Wt), typeof self < "u" && vn.setContext(self), this.setAnimationLoop = function(x) {
        He = x, ee.setAnimationLoop(x), x === null ? vn.stop() : vn.start();
      }, ee.addEventListener("sessionstart", kt), ee.addEventListener("sessionend", Io), this.render = function(x, I) {
        if (I !== void 0 && I.isCamera !== !0) {
          console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
          return;
        }
        if (E === !0) return;
        if (x.matrixWorldAutoUpdate === !0 && x.updateMatrixWorld(), I.parent === null && I.matrixWorldAutoUpdate === !0 && I.updateMatrixWorld(), ee.enabled === !0 && ee.isPresenting === !0 && (ee.cameraAutoUpdate === !0 && ee.updateCamera(I), I = ee.getCamera()), x.isScene === !0 && x.onBeforeRender(S, x, I, R), p = ce.get(x, w.length), p.init(I), w.push(p), de.multiplyMatrices(I.projectionMatrix, I.matrixWorldInverse), Ye.setFromProjectionMatrix(de), Q = this.localClippingEnabled, V = Ce.init(this.clippingPlanes, Q), y = se.get(x, u.length), y.init(), u.push(y), ee.enabled === !0 && ee.isPresenting === !0) {
          let te = S.xr.getDepthSensingMesh();
          te !== null && hr(te, I, -1 / 0, S.sortObjects);
        }
        hr(x, I, 0, S.sortObjects), y.finish(), S.sortObjects === !0 && y.sort(k, ae), Ue = ee.enabled === !1 || ee.isPresenting === !1 || ee.hasDepthSensing() === !1, Ue && oe.addToRenderList(y, x), this.info.render.frame++, V === !0 && Ce.beginShadows();
        let U = p.state.shadowsArray;
        j.render(U, x, I), V === !0 && Ce.endShadows(), this.info.autoReset === !0 && this.info.reset();
        let N = y.opaque, L = y.transmissive;
        if (p.setupLights(), I.isArrayCamera) {
          let te = I.cameras;
          if (L.length > 0)
            for (let re = 0, fe = te.length; re < fe; re++) {
              let pe = te[re];
              Do(N, L, x, pe);
            }
          Ue && oe.render(x);
          for (let re = 0, fe = te.length; re < fe; re++) {
            let pe = te[re];
            Lo(y, x, pe, pe.viewport);
          }
        } else
          L.length > 0 && Do(N, L, x, I), Ue && oe.render(x), Lo(y, x, I);
        R !== null && (Re.updateMultisampleRenderTarget(R), Re.updateRenderTargetMipmap(R)), x.isScene === !0 && x.onAfterRender(S, x, I), De.resetDefaultState(), B = -1, M = null, w.pop(), w.length > 0 ? (p = w[w.length - 1], V === !0 && Ce.setGlobalState(S.clippingPlanes, p.state.camera)) : p = null, u.pop(), u.length > 0 ? y = u[u.length - 1] : y = null;
      };
      function hr(x, I, U, N) {
        if (x.visible === !1) return;
        if (x.layers.test(I.layers)) {
          if (x.isGroup)
            U = x.renderOrder;
          else if (x.isLOD)
            x.autoUpdate === !0 && x.update(I);
          else if (x.isLight)
            p.pushLight(x), x.castShadow && p.pushShadow(x);
          else if (x.isSprite) {
            if (!x.frustumCulled || Ye.intersectsSprite(x)) {
              N && Te.setFromMatrixPosition(x.matrixWorld).applyMatrix4(de);
              let re = J.update(x), fe = x.material;
              fe.visible && y.push(x, re, fe, U, Te.z, null);
            }
          } else if ((x.isMesh || x.isLine || x.isPoints) && (!x.frustumCulled || Ye.intersectsObject(x))) {
            let re = J.update(x), fe = x.material;
            if (N && (x.boundingSphere !== void 0 ? (x.boundingSphere === null && x.computeBoundingSphere(), Te.copy(x.boundingSphere.center)) : (re.boundingSphere === null && re.computeBoundingSphere(), Te.copy(re.boundingSphere.center)), Te.applyMatrix4(x.matrixWorld).applyMatrix4(de)), Array.isArray(fe)) {
              let pe = re.groups;
              for (let Me = 0, Se = pe.length; Me < Se; Me++) {
                let ve = pe[Me], Ve = fe[ve.materialIndex];
                Ve && Ve.visible && y.push(x, re, Ve, U, Te.z, ve);
              }
            } else fe.visible && y.push(x, re, fe, U, Te.z, null);
          }
        }
        let te = x.children;
        for (let re = 0, fe = te.length; re < fe; re++)
          hr(te[re], I, U, N);
      }
      function Lo(x, I, U, N) {
        let L = x.opaque, te = x.transmissive, re = x.transparent;
        p.setupLightsView(U), V === !0 && Ce.setGlobalState(S.clippingPlanes, U), N && _e.viewport(v.copy(N)), L.length > 0 && zi(L, I, U), te.length > 0 && zi(te, I, U), re.length > 0 && zi(re, I, U), _e.buffers.depth.setTest(!0), _e.buffers.depth.setMask(!0), _e.buffers.color.setMask(!0), _e.setPolygonOffset(!1);
      }
      function Do(x, I, U, N) {
        if ((U.isScene === !0 ? U.overrideMaterial : null) !== null)
          return;
        p.state.transmissionRenderTarget[N.id] === void 0 && (p.state.transmissionRenderTarget[N.id] = new sn(1, 1, {
          generateMipmaps: !0,
          type: qe.has("EXT_color_buffer_half_float") || qe.has("EXT_color_buffer_float") ? Oi : nn,
          minFilter: Pn,
          samples: 4,
          stencilBuffer: r,
          resolveDepthBuffer: !1,
          resolveStencilBuffer: !1,
          colorSpace: Xe.workingColorSpace
        }));
        let te = p.state.transmissionRenderTarget[N.id], re = N.viewport || v;
        te.setSize(re.z, re.w);
        let fe = S.getRenderTarget();
        S.setRenderTarget(te), S.getClearColor(z), G = S.getClearAlpha(), G < 1 && S.setClearColor(16777215, 0.5), S.clear(), Ue && oe.render(U);
        let pe = S.toneMapping;
        S.toneMapping = pn;
        let Me = N.viewport;
        if (N.viewport !== void 0 && (N.viewport = void 0), p.setupLightsView(N), V === !0 && Ce.setGlobalState(S.clippingPlanes, N), zi(x, U, N), Re.updateMultisampleRenderTarget(te), Re.updateRenderTargetMipmap(te), qe.has("WEBGL_multisampled_render_to_texture") === !1) {
          let Se = !1;
          for (let ve = 0, Ve = I.length; ve < Ve; ve++) {
            let je = I[ve], et = je.object, Mt = je.geometry, Ge = je.material, ge = je.group;
            if (Ge.side === Qt && et.layers.test(N.layers)) {
              let dt = Ge.side;
              Ge.side = vt, Ge.needsUpdate = !0, Uo(et, U, N, Mt, Ge, ge), Ge.side = dt, Ge.needsUpdate = !0, Se = !0;
            }
          }
          Se === !0 && (Re.updateMultisampleRenderTarget(te), Re.updateRenderTargetMipmap(te));
        }
        S.setRenderTarget(fe), S.setClearColor(z, G), Me !== void 0 && (N.viewport = Me), S.toneMapping = pe;
      }
      function zi(x, I, U) {
        let N = I.isScene === !0 ? I.overrideMaterial : null;
        for (let L = 0, te = x.length; L < te; L++) {
          let re = x[L], fe = re.object, pe = re.geometry, Me = N === null ? re.material : N, Se = re.group;
          fe.layers.test(U.layers) && Uo(fe, I, U, pe, Me, Se);
        }
      }
      function Uo(x, I, U, N, L, te) {
        x.onBeforeRender(S, I, U, N, L, te), x.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse, x.matrixWorld), x.normalMatrix.getNormalMatrix(x.modelViewMatrix), L.transparent === !0 && L.side === Qt && L.forceSinglePass === !1 ? (L.side = vt, L.needsUpdate = !0, S.renderBufferDirect(U, I, N, L, x, te), L.side = mn, L.needsUpdate = !0, S.renderBufferDirect(U, I, N, L, x, te), L.side = Qt) : S.renderBufferDirect(U, I, N, L, x, te), x.onAfterRender(S, I, U, N, L, te);
      }
      function ki(x, I, U) {
        I.isScene !== !0 && (I = Le);
        let N = we.get(x), L = p.state.lights, te = p.state.shadowsArray, re = L.state.version, fe = Y.getParameters(x, L.state, te, I, U), pe = Y.getProgramCacheKey(fe), Me = N.programs;
        N.environment = x.isMeshStandardMaterial ? I.environment : null, N.fog = I.fog, N.envMap = (x.isMeshStandardMaterial ? g : b).get(x.envMap || N.environment), N.envMapRotation = N.environment !== null && x.envMap === null ? I.environmentRotation : x.envMapRotation, Me === void 0 && (x.addEventListener("dispose", ye), Me = /* @__PURE__ */ new Map(), N.programs = Me);
        let Se = Me.get(pe);
        if (Se !== void 0) {
          if (N.currentProgram === Se && N.lightsStateVersion === re)
            return Fo(x, fe), Se;
        } else
          fe.uniforms = Y.getUniforms(x), x.onBeforeCompile(fe, S), Se = Y.acquireProgram(fe, pe), Me.set(pe, Se), N.uniforms = fe.uniforms;
        let ve = N.uniforms;
        return (!x.isShaderMaterial && !x.isRawShaderMaterial || x.clipping === !0) && (ve.clippingPlanes = Ce.uniform), Fo(x, fe), N.needsLights = Gc(x), N.lightsStateVersion = re, N.needsLights && (ve.ambientLightColor.value = L.state.ambient, ve.lightProbe.value = L.state.probe, ve.directionalLights.value = L.state.directional, ve.directionalLightShadows.value = L.state.directionalShadow, ve.spotLights.value = L.state.spot, ve.spotLightShadows.value = L.state.spotShadow, ve.rectAreaLights.value = L.state.rectArea, ve.ltc_1.value = L.state.rectAreaLTC1, ve.ltc_2.value = L.state.rectAreaLTC2, ve.pointLights.value = L.state.point, ve.pointLightShadows.value = L.state.pointShadow, ve.hemisphereLights.value = L.state.hemi, ve.directionalShadowMap.value = L.state.directionalShadowMap, ve.directionalShadowMatrix.value = L.state.directionalShadowMatrix, ve.spotShadowMap.value = L.state.spotShadowMap, ve.spotLightMatrix.value = L.state.spotLightMatrix, ve.spotLightMap.value = L.state.spotLightMap, ve.pointShadowMap.value = L.state.pointShadowMap, ve.pointShadowMatrix.value = L.state.pointShadowMatrix), N.currentProgram = Se, N.uniformsList = null, Se;
      }
      function No(x) {
        if (x.uniformsList === null) {
          let I = x.currentProgram.getUniforms();
          x.uniformsList = ui.seqWithValue(I.seq, x.uniforms);
        }
        return x.uniformsList;
      }
      function Fo(x, I) {
        let U = we.get(x);
        U.outputColorSpace = I.outputColorSpace, U.batching = I.batching, U.batchingColor = I.batchingColor, U.instancing = I.instancing, U.instancingColor = I.instancingColor, U.instancingMorph = I.instancingMorph, U.skinning = I.skinning, U.morphTargets = I.morphTargets, U.morphNormals = I.morphNormals, U.morphColors = I.morphColors, U.morphTargetsCount = I.morphTargetsCount, U.numClippingPlanes = I.numClippingPlanes, U.numIntersection = I.numClipIntersection, U.vertexAlphas = I.vertexAlphas, U.vertexTangents = I.vertexTangents, U.toneMapping = I.toneMapping;
      }
      function Hc(x, I, U, N, L) {
        I.isScene !== !0 && (I = Le), Re.resetTextureUnits();
        let te = I.fog, re = N.isMeshStandardMaterial ? I.environment : null, fe = R === null ? S.outputColorSpace : R.isXRRenderTarget === !0 ? R.texture.colorSpace : xn, pe = (N.isMeshStandardMaterial ? g : b).get(N.envMap || re), Me = N.vertexColors === !0 && !!U.attributes.color && U.attributes.color.itemSize === 4, Se = !!U.attributes.tangent && (!!N.normalMap || N.anisotropy > 0), ve = !!U.morphAttributes.position, Ve = !!U.morphAttributes.normal, je = !!U.morphAttributes.color, et = pn;
        N.toneMapped && (R === null || R.isXRRenderTarget === !0) && (et = S.toneMapping);
        let Mt = U.morphAttributes.position || U.morphAttributes.normal || U.morphAttributes.color, Ge = Mt !== void 0 ? Mt.length : 0, ge = we.get(N), dt = p.state.lights;
        if (V === !0 && (Q === !0 || x !== M)) {
          let Tt = x === M && N.id === B;
          Ce.setState(N, x, Tt);
        }
        let We = !1;
        N.version === ge.__version ? (ge.needsLights && ge.lightsStateVersion !== dt.state.version || ge.outputColorSpace !== fe || L.isBatchedMesh && ge.batching === !1 || !L.isBatchedMesh && ge.batching === !0 || L.isBatchedMesh && ge.batchingColor === !0 && L.colorTexture === null || L.isBatchedMesh && ge.batchingColor === !1 && L.colorTexture !== null || L.isInstancedMesh && ge.instancing === !1 || !L.isInstancedMesh && ge.instancing === !0 || L.isSkinnedMesh && ge.skinning === !1 || !L.isSkinnedMesh && ge.skinning === !0 || L.isInstancedMesh && ge.instancingColor === !0 && L.instanceColor === null || L.isInstancedMesh && ge.instancingColor === !1 && L.instanceColor !== null || L.isInstancedMesh && ge.instancingMorph === !0 && L.morphTexture === null || L.isInstancedMesh && ge.instancingMorph === !1 && L.morphTexture !== null || ge.envMap !== pe || N.fog === !0 && ge.fog !== te || ge.numClippingPlanes !== void 0 && (ge.numClippingPlanes !== Ce.numPlanes || ge.numIntersection !== Ce.numIntersection) || ge.vertexAlphas !== Me || ge.vertexTangents !== Se || ge.morphTargets !== ve || ge.morphNormals !== Ve || ge.morphColors !== je || ge.toneMapping !== et || ge.morphTargetsCount !== Ge) && (We = !0) : (We = !0, ge.__version = N.version);
        let Lt = ge.currentProgram;
        We === !0 && (Lt = ki(N, I, L));
        let On = !1, St = !1, ur = !1, st = Lt.getUniforms(), rn = ge.uniforms;
        if (_e.useProgram(Lt.program) && (On = !0, St = !0, ur = !0), N.id !== B && (B = N.id, St = !0), On || M !== x) {
          st.setValue(A, "projectionMatrix", x.projectionMatrix), st.setValue(A, "viewMatrix", x.matrixWorldInverse);
          let Tt = st.map.cameraPosition;
          Tt !== void 0 && Tt.setValue(A, le.setFromMatrixPosition(x.matrixWorld)), Ze.logarithmicDepthBuffer && st.setValue(
            A,
            "logDepthBufFC",
            2 / (Math.log(x.far + 1) / Math.LN2)
          ), (N.isMeshPhongMaterial || N.isMeshToonMaterial || N.isMeshLambertMaterial || N.isMeshBasicMaterial || N.isMeshStandardMaterial || N.isShaderMaterial) && st.setValue(A, "isOrthographic", x.isOrthographicCamera === !0), M !== x && (M = x, St = !0, ur = !0);
        }
        if (L.isSkinnedMesh) {
          st.setOptional(A, L, "bindMatrix"), st.setOptional(A, L, "bindMatrixInverse");
          let Tt = L.skeleton;
          Tt && (Tt.boneTexture === null && Tt.computeBoneTexture(), st.setValue(A, "boneTexture", Tt.boneTexture, Re));
        }
        L.isBatchedMesh && (st.setOptional(A, L, "batchingTexture"), st.setValue(A, "batchingTexture", L._matricesTexture, Re), st.setOptional(A, L, "batchingIdTexture"), st.setValue(A, "batchingIdTexture", L._indirectTexture, Re), st.setOptional(A, L, "batchingColorTexture"), L._colorsTexture !== null && st.setValue(A, "batchingColorTexture", L._colorsTexture, Re));
        let dr = U.morphAttributes;
        if ((dr.position !== void 0 || dr.normal !== void 0 || dr.color !== void 0) && Oe.update(L, U, Lt), (St || ge.receiveShadow !== L.receiveShadow) && (ge.receiveShadow = L.receiveShadow, st.setValue(A, "receiveShadow", L.receiveShadow)), N.isMeshGouraudMaterial && N.envMap !== null && (rn.envMap.value = pe, rn.flipEnvMap.value = pe.isCubeTexture && pe.isRenderTargetTexture === !1 ? -1 : 1), N.isMeshStandardMaterial && N.envMap === null && I.environment !== null && (rn.envMapIntensity.value = I.environmentIntensity), St && (st.setValue(A, "toneMappingExposure", S.toneMappingExposure), ge.needsLights && Vc(rn, ur), te && N.fog === !0 && xe.refreshFogUniforms(rn, te), xe.refreshMaterialUniforms(rn, N, K, H, p.state.transmissionRenderTarget[x.id]), ui.upload(A, No(ge), rn, Re)), N.isShaderMaterial && N.uniformsNeedUpdate === !0 && (ui.upload(A, No(ge), rn, Re), N.uniformsNeedUpdate = !1), N.isSpriteMaterial && st.setValue(A, "center", L.center), st.setValue(A, "modelViewMatrix", L.modelViewMatrix), st.setValue(A, "normalMatrix", L.normalMatrix), st.setValue(A, "modelMatrix", L.matrixWorld), N.isShaderMaterial || N.isRawShaderMaterial) {
          let Tt = N.uniformsGroups;
          for (let fr = 0, Wc = Tt.length; fr < Wc; fr++) {
            let Oo = Tt[fr];
            Ke.update(Oo, Lt), Ke.bind(Oo, Lt);
          }
        }
        return Lt;
      }
      function Vc(x, I) {
        x.ambientLightColor.needsUpdate = I, x.lightProbe.needsUpdate = I, x.directionalLights.needsUpdate = I, x.directionalLightShadows.needsUpdate = I, x.pointLights.needsUpdate = I, x.pointLightShadows.needsUpdate = I, x.spotLights.needsUpdate = I, x.spotLightShadows.needsUpdate = I, x.rectAreaLights.needsUpdate = I, x.hemisphereLights.needsUpdate = I;
      }
      function Gc(x) {
        return x.isMeshLambertMaterial || x.isMeshToonMaterial || x.isMeshPhongMaterial || x.isMeshStandardMaterial || x.isShadowMaterial || x.isShaderMaterial && x.lights === !0;
      }
      this.getActiveCubeFace = function() {
        return O;
      }, this.getActiveMipmapLevel = function() {
        return T;
      }, this.getRenderTarget = function() {
        return R;
      }, this.setRenderTargetTextures = function(x, I, U) {
        we.get(x.texture).__webglTexture = I, we.get(x.depthTexture).__webglTexture = U;
        let N = we.get(x);
        N.__hasExternalTextures = !0, N.__autoAllocateDepthBuffer = U === void 0, N.__autoAllocateDepthBuffer || qe.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), N.__useRenderToTexture = !1);
      }, this.setRenderTargetFramebuffer = function(x, I) {
        let U = we.get(x);
        U.__webglFramebuffer = I, U.__useDefaultFramebuffer = I === void 0;
      }, this.setRenderTarget = function(x, I = 0, U = 0) {
        R = x, O = I, T = U;
        let N = !0, L = null, te = !1, re = !1;
        if (x) {
          let pe = we.get(x);
          pe.__useDefaultFramebuffer !== void 0 ? (_e.bindFramebuffer(A.FRAMEBUFFER, null), N = !1) : pe.__webglFramebuffer === void 0 ? Re.setupRenderTarget(x) : pe.__hasExternalTextures && Re.rebindTextures(x, we.get(x.texture).__webglTexture, we.get(x.depthTexture).__webglTexture);
          let Me = x.texture;
          (Me.isData3DTexture || Me.isDataArrayTexture || Me.isCompressedArrayTexture) && (re = !0);
          let Se = we.get(x).__webglFramebuffer;
          x.isWebGLCubeRenderTarget ? (Array.isArray(Se[I]) ? L = Se[I][U] : L = Se[I], te = !0) : x.samples > 0 && Re.useMultisampledRTT(x) === !1 ? L = we.get(x).__webglMultisampledFramebuffer : Array.isArray(Se) ? L = Se[U] : L = Se, v.copy(x.viewport), P.copy(x.scissor), W = x.scissorTest;
        } else
          v.copy(he).multiplyScalar(K).floor(), P.copy(me).multiplyScalar(K).floor(), W = Fe;
        if (_e.bindFramebuffer(A.FRAMEBUFFER, L) && N && _e.drawBuffers(x, L), _e.viewport(v), _e.scissor(P), _e.setScissorTest(W), te) {
          let pe = we.get(x.texture);
          A.framebufferTexture2D(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, A.TEXTURE_CUBE_MAP_POSITIVE_X + I, pe.__webglTexture, U);
        } else if (re) {
          let pe = we.get(x.texture), Me = I || 0;
          A.framebufferTextureLayer(A.FRAMEBUFFER, A.COLOR_ATTACHMENT0, pe.__webglTexture, U || 0, Me);
        }
        B = -1;
      }, this.readRenderTargetPixels = function(x, I, U, N, L, te, re) {
        if (!(x && x.isWebGLRenderTarget)) {
          console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
          return;
        }
        let fe = we.get(x).__webglFramebuffer;
        if (x.isWebGLCubeRenderTarget && re !== void 0 && (fe = fe[re]), fe) {
          _e.bindFramebuffer(A.FRAMEBUFFER, fe);
          try {
            let pe = x.texture, Me = pe.format, Se = pe.type;
            if (!Ze.textureFormatReadable(Me)) {
              console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
              return;
            }
            if (!Ze.textureTypeReadable(Se)) {
              console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
              return;
            }
            I >= 0 && I <= x.width - N && U >= 0 && U <= x.height - L && A.readPixels(I, U, N, L, Ae.convert(Me), Ae.convert(Se), te);
          } finally {
            let pe = R !== null ? we.get(R).__webglFramebuffer : null;
            _e.bindFramebuffer(A.FRAMEBUFFER, pe);
          }
        }
      }, this.readRenderTargetPixelsAsync = async function(x, I, U, N, L, te, re) {
        if (!(x && x.isWebGLRenderTarget))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        let fe = we.get(x).__webglFramebuffer;
        if (x.isWebGLCubeRenderTarget && re !== void 0 && (fe = fe[re]), fe) {
          _e.bindFramebuffer(A.FRAMEBUFFER, fe);
          try {
            let pe = x.texture, Me = pe.format, Se = pe.type;
            if (!Ze.textureFormatReadable(Me))
              throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
            if (!Ze.textureTypeReadable(Se))
              throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
            if (I >= 0 && I <= x.width - N && U >= 0 && U <= x.height - L) {
              let ve = A.createBuffer();
              A.bindBuffer(A.PIXEL_PACK_BUFFER, ve), A.bufferData(A.PIXEL_PACK_BUFFER, te.byteLength, A.STREAM_READ), A.readPixels(I, U, N, L, Ae.convert(Me), Ae.convert(Se), 0), A.flush();
              let Ve = A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE, 0);
              await xu(A, Ve, 4);
              try {
                A.bindBuffer(A.PIXEL_PACK_BUFFER, ve), A.getBufferSubData(A.PIXEL_PACK_BUFFER, 0, te);
              } finally {
                A.deleteBuffer(ve), A.deleteSync(Ve);
              }
              return te;
            }
          } finally {
            let pe = R !== null ? we.get(R).__webglFramebuffer : null;
            _e.bindFramebuffer(A.FRAMEBUFFER, pe);
          }
        }
      }, this.copyFramebufferToTexture = function(x, I = null, U = 0) {
        x.isTexture !== !0 && (Ci("WebGLRenderer: copyFramebufferToTexture function signature has changed."), I = arguments[0] || null, x = arguments[1]);
        let N = Math.pow(2, -U), L = Math.floor(x.image.width * N), te = Math.floor(x.image.height * N), re = I !== null ? I.x : 0, fe = I !== null ? I.y : 0;
        Re.setTexture2D(x, 0), A.copyTexSubImage2D(A.TEXTURE_2D, U, 0, 0, re, fe, L, te), _e.unbindTexture();
      }, this.copyTextureToTexture = function(x, I, U = null, N = null, L = 0) {
        x.isTexture !== !0 && (Ci("WebGLRenderer: copyTextureToTexture function signature has changed."), N = arguments[0] || null, x = arguments[1], I = arguments[2], L = arguments[3] || 0, U = null);
        let te, re, fe, pe, Me, Se;
        U !== null ? (te = U.max.x - U.min.x, re = U.max.y - U.min.y, fe = U.min.x, pe = U.min.y) : (te = x.image.width, re = x.image.height, fe = 0, pe = 0), N !== null ? (Me = N.x, Se = N.y) : (Me = 0, Se = 0);
        let ve = Ae.convert(I.format), Ve = Ae.convert(I.type);
        Re.setTexture2D(I, 0), A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL, I.flipY), A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL, I.premultiplyAlpha), A.pixelStorei(A.UNPACK_ALIGNMENT, I.unpackAlignment);
        let je = A.getParameter(A.UNPACK_ROW_LENGTH), et = A.getParameter(A.UNPACK_IMAGE_HEIGHT), Mt = A.getParameter(A.UNPACK_SKIP_PIXELS), Ge = A.getParameter(A.UNPACK_SKIP_ROWS), ge = A.getParameter(A.UNPACK_SKIP_IMAGES), dt = x.isCompressedTexture ? x.mipmaps[L] : x.image;
        A.pixelStorei(A.UNPACK_ROW_LENGTH, dt.width), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, dt.height), A.pixelStorei(A.UNPACK_SKIP_PIXELS, fe), A.pixelStorei(A.UNPACK_SKIP_ROWS, pe), x.isDataTexture ? A.texSubImage2D(A.TEXTURE_2D, L, Me, Se, te, re, ve, Ve, dt.data) : x.isCompressedTexture ? A.compressedTexSubImage2D(A.TEXTURE_2D, L, Me, Se, dt.width, dt.height, ve, dt.data) : A.texSubImage2D(A.TEXTURE_2D, L, Me, Se, te, re, ve, Ve, dt), A.pixelStorei(A.UNPACK_ROW_LENGTH, je), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, et), A.pixelStorei(A.UNPACK_SKIP_PIXELS, Mt), A.pixelStorei(A.UNPACK_SKIP_ROWS, Ge), A.pixelStorei(A.UNPACK_SKIP_IMAGES, ge), L === 0 && I.generateMipmaps && A.generateMipmap(A.TEXTURE_2D), _e.unbindTexture();
      }, this.copyTextureToTexture3D = function(x, I, U = null, N = null, L = 0) {
        x.isTexture !== !0 && (Ci("WebGLRenderer: copyTextureToTexture3D function signature has changed."), U = arguments[0] || null, N = arguments[1] || null, x = arguments[2], I = arguments[3], L = arguments[4] || 0);
        let te, re, fe, pe, Me, Se, ve, Ve, je, et = x.isCompressedTexture ? x.mipmaps[L] : x.image;
        U !== null ? (te = U.max.x - U.min.x, re = U.max.y - U.min.y, fe = U.max.z - U.min.z, pe = U.min.x, Me = U.min.y, Se = U.min.z) : (te = et.width, re = et.height, fe = et.depth, pe = 0, Me = 0, Se = 0), N !== null ? (ve = N.x, Ve = N.y, je = N.z) : (ve = 0, Ve = 0, je = 0);
        let Mt = Ae.convert(I.format), Ge = Ae.convert(I.type), ge;
        if (I.isData3DTexture)
          Re.setTexture3D(I, 0), ge = A.TEXTURE_3D;
        else if (I.isDataArrayTexture || I.isCompressedArrayTexture)
          Re.setTexture2DArray(I, 0), ge = A.TEXTURE_2D_ARRAY;
        else {
          console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
          return;
        }
        A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL, I.flipY), A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL, I.premultiplyAlpha), A.pixelStorei(A.UNPACK_ALIGNMENT, I.unpackAlignment);
        let dt = A.getParameter(A.UNPACK_ROW_LENGTH), We = A.getParameter(A.UNPACK_IMAGE_HEIGHT), Lt = A.getParameter(A.UNPACK_SKIP_PIXELS), On = A.getParameter(A.UNPACK_SKIP_ROWS), St = A.getParameter(A.UNPACK_SKIP_IMAGES);
        A.pixelStorei(A.UNPACK_ROW_LENGTH, et.width), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, et.height), A.pixelStorei(A.UNPACK_SKIP_PIXELS, pe), A.pixelStorei(A.UNPACK_SKIP_ROWS, Me), A.pixelStorei(A.UNPACK_SKIP_IMAGES, Se), x.isDataTexture || x.isData3DTexture ? A.texSubImage3D(ge, L, ve, Ve, je, te, re, fe, Mt, Ge, et.data) : I.isCompressedArrayTexture ? A.compressedTexSubImage3D(ge, L, ve, Ve, je, te, re, fe, Mt, et.data) : A.texSubImage3D(ge, L, ve, Ve, je, te, re, fe, Mt, Ge, et), A.pixelStorei(A.UNPACK_ROW_LENGTH, dt), A.pixelStorei(A.UNPACK_IMAGE_HEIGHT, We), A.pixelStorei(A.UNPACK_SKIP_PIXELS, Lt), A.pixelStorei(A.UNPACK_SKIP_ROWS, On), A.pixelStorei(A.UNPACK_SKIP_IMAGES, St), L === 0 && I.generateMipmaps && A.generateMipmap(ge), _e.unbindTexture();
      }, this.initRenderTarget = function(x) {
        we.get(x).__webglFramebuffer === void 0 && Re.setupRenderTarget(x);
      }, this.initTexture = function(x) {
        x.isCubeTexture ? Re.setTextureCube(x, 0) : x.isData3DTexture ? Re.setTexture3D(x, 0) : x.isDataArrayTexture || x.isCompressedArrayTexture ? Re.setTexture2DArray(x, 0) : Re.setTexture2D(x, 0), _e.unbindTexture();
      }, this.resetState = function() {
        O = 0, T = 0, R = null, _e.reset(), De.reset();
      }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
    }
    get coordinateSystem() {
      return en;
    }
    get outputColorSpace() {
      return this._outputColorSpace;
    }
    set outputColorSpace(e) {
      this._outputColorSpace = e;
      let t = this.getContext();
      t.drawingBufferColorSpace = e === To ? "display-p3" : "srgb", t.unpackColorSpace = Xe.workingColorSpace === rr ? "display-p3" : "srgb";
    }
  };
  var Qs = class extends yt {
    constructor() {
      super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Vt(), this.environmentIntensity = 1, this.environmentRotation = new Vt(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
    }
    copy(e, t) {
      return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
    }
  };
  var js = class extends At {
    constructor(e, t, n, s, r, a, o, l, c) {
      super(e, t, n, s, r, a, o, l, c), this.isCanvasTexture = !0, this.needsUpdate = !0;
    }
  };
  var Fi = class extends Dn {
    constructor(e) {
      super(), this.isMeshLambertMaterial = !0, this.type = "MeshLambertMaterial", this.color = new Ne(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Ne(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = wc, this.normalScale = new ke(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Vt(), this.combine = yo, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
    }
  };
  function Ts(i, e, t) {
    return !i || // let 'undefined' and 'null' pass
    !t && i.constructor === e ? i : typeof e.BYTES_PER_ELEMENT == "number" ? new e(i) : Array.prototype.slice.call(i);
  }
  function fg(i) {
    return ArrayBuffer.isView(i) && !(i instanceof DataView);
  }
  var xi = class {
    constructor(e, t, n, s) {
      this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = s !== void 0 ? s : new t.constructor(n), this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {};
    }
    evaluate(e) {
      let t = this.parameterPositions, n = this._cachedIndex, s = t[n], r = t[n - 1];
      n: {
        e: {
          let a;
          t: {
            i: if (!(e < s)) {
              for (let o = n + 2; ; ) {
                if (s === void 0) {
                  if (e < r) break i;
                  return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
                }
                if (n === o) break;
                if (r = s, s = t[++n], e < s)
                  break e;
              }
              a = t.length;
              break t;
            }
            if (!(e >= r)) {
              let o = t[1];
              e < o && (n = 2, r = o);
              for (let l = n - 2; ; ) {
                if (r === void 0)
                  return this._cachedIndex = 0, this.copySampleValue_(0);
                if (n === l) break;
                if (s = r, r = t[--n - 1], e >= r)
                  break e;
              }
              a = n, n = 0;
              break t;
            }
            break n;
          }
          for (; n < a; ) {
            let o = n + a >>> 1;
            e < t[o] ? a = o : n = o + 1;
          }
          if (s = t[n], r = t[n - 1], r === void 0)
            return this._cachedIndex = 0, this.copySampleValue_(0);
          if (s === void 0)
            return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
        }
        this._cachedIndex = n, this.intervalChanged_(n, r, s);
      }
      return this.interpolate_(n, r, e, s);
    }
    getSettings_() {
      return this.settings || this.DefaultSettings_;
    }
    copySampleValue_(e) {
      let t = this.resultBuffer, n = this.sampleValues, s = this.valueSize, r = e * s;
      for (let a = 0; a !== s; ++a)
        t[a] = n[r + a];
      return t;
    }
    // Template methods for derived classes:
    interpolate_() {
      throw new Error("call to abstract method");
    }
    intervalChanged_() {
    }
  }, ao = class extends xi {
    constructor(e, t, n, s) {
      super(e, t, n, s), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
        endingStart: _l,
        endingEnd: _l
      };
    }
    intervalChanged_(e, t, n) {
      let s = this.parameterPositions, r = e - 2, a = e + 1, o = s[r], l = s[a];
      if (o === void 0)
        switch (this.getSettings_().endingStart) {
          case xl:
            r = e, o = 2 * t - n;
            break;
          case vl:
            r = s.length - 2, o = t + s[r] - s[r + 1];
            break;
          default:
            r = e, o = n;
        }
      if (l === void 0)
        switch (this.getSettings_().endingEnd) {
          case xl:
            a = e, l = 2 * n - t;
            break;
          case vl:
            a = 1, l = n + s[1] - s[0];
            break;
          default:
            a = e - 1, l = t;
        }
      let c = (n - t) * 0.5, h = this.valueSize;
      this._weightPrev = c / (t - o), this._weightNext = c / (l - n), this._offsetPrev = r * h, this._offsetNext = a * h;
    }
    interpolate_(e, t, n, s) {
      let r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, l = e * o, c = l - o, h = this._offsetPrev, f = this._offsetNext, d = this._weightPrev, m = this._weightNext, _ = (n - t) / (s - t), y = _ * _, p = y * _, u = -d * p + 2 * d * y - d * _, w = (1 + d) * p + (-1.5 - 2 * d) * y + (-0.5 + d) * _ + 1, S = (-1 - m) * p + (1.5 + m) * y + 0.5 * _, E = m * p - m * y;
      for (let O = 0; O !== o; ++O)
        r[O] = u * a[h + O] + w * a[c + O] + S * a[l + O] + E * a[f + O];
      return r;
    }
  }, oo = class extends xi {
    constructor(e, t, n, s) {
      super(e, t, n, s);
    }
    interpolate_(e, t, n, s) {
      let r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, l = e * o, c = l - o, h = (n - t) / (s - t), f = 1 - h;
      for (let d = 0; d !== o; ++d)
        r[d] = a[c + d] * f + a[l + d] * h;
      return r;
    }
  }, lo = class extends xi {
    constructor(e, t, n, s) {
      super(e, t, n, s);
    }
    interpolate_(e) {
      return this.copySampleValue_(e - 1);
    }
  }, zt = class {
    constructor(e, t, n, s) {
      if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
      if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
      this.name = e, this.times = Ts(t, this.TimeBufferType), this.values = Ts(n, this.ValueBufferType), this.setInterpolation(s || this.DefaultInterpolation);
    }
    // Serialization (in static context, because of constructor invocation
    // and automatic invocation of .toJSON):
    static toJSON(e) {
      let t = e.constructor, n;
      if (t.toJSON !== this.toJSON)
        n = t.toJSON(e);
      else {
        n = {
          name: e.name,
          times: Ts(e.times, Array),
          values: Ts(e.values, Array)
        };
        let s = e.getInterpolation();
        s !== e.DefaultInterpolation && (n.interpolation = s);
      }
      return n.type = e.ValueTypeName, n;
    }
    InterpolantFactoryMethodDiscrete(e) {
      return new lo(this.times, this.values, this.getValueSize(), e);
    }
    InterpolantFactoryMethodLinear(e) {
      return new oo(this.times, this.values, this.getValueSize(), e);
    }
    InterpolantFactoryMethodSmooth(e) {
      return new ao(this.times, this.values, this.getValueSize(), e);
    }
    setInterpolation(e) {
      let t;
      switch (e) {
        case Us:
          t = this.InterpolantFactoryMethodDiscrete;
          break;
        case Va:
          t = this.InterpolantFactoryMethodLinear;
          break;
        case Fr:
          t = this.InterpolantFactoryMethodSmooth;
          break;
      }
      if (t === void 0) {
        let n = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
        if (this.createInterpolant === void 0)
          if (e !== this.DefaultInterpolation)
            this.setInterpolation(this.DefaultInterpolation);
          else
            throw new Error(n);
        return console.warn("THREE.KeyframeTrack:", n), this;
      }
      return this.createInterpolant = t, this;
    }
    getInterpolation() {
      switch (this.createInterpolant) {
        case this.InterpolantFactoryMethodDiscrete:
          return Us;
        case this.InterpolantFactoryMethodLinear:
          return Va;
        case this.InterpolantFactoryMethodSmooth:
          return Fr;
      }
    }
    getValueSize() {
      return this.values.length / this.times.length;
    }
    // move all keyframes either forwards or backwards in time
    shift(e) {
      if (e !== 0) {
        let t = this.times;
        for (let n = 0, s = t.length; n !== s; ++n)
          t[n] += e;
      }
      return this;
    }
    // scale all keyframe times by a factor (useful for frame <-> seconds conversions)
    scale(e) {
      if (e !== 1) {
        let t = this.times;
        for (let n = 0, s = t.length; n !== s; ++n)
          t[n] *= e;
      }
      return this;
    }
    // removes keyframes before and after animation without changing any values within the range [startTime, endTime].
    // IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
    trim(e, t) {
      let n = this.times, s = n.length, r = 0, a = s - 1;
      for (; r !== s && n[r] < e; )
        ++r;
      for (; a !== -1 && n[a] > t; )
        --a;
      if (++a, r !== 0 || a !== s) {
        r >= a && (a = Math.max(a, 1), r = a - 1);
        let o = this.getValueSize();
        this.times = n.slice(r, a), this.values = this.values.slice(r * o, a * o);
      }
      return this;
    }
    // ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
    validate() {
      let e = !0, t = this.getValueSize();
      t - Math.floor(t) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), e = !1);
      let n = this.times, s = this.values, r = n.length;
      r === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), e = !1);
      let a = null;
      for (let o = 0; o !== r; o++) {
        let l = n[o];
        if (typeof l == "number" && isNaN(l)) {
          console.error("THREE.KeyframeTrack: Time is not a valid number.", this, o, l), e = !1;
          break;
        }
        if (a !== null && a > l) {
          console.error("THREE.KeyframeTrack: Out of order keys.", this, o, l, a), e = !1;
          break;
        }
        a = l;
      }
      if (s !== void 0 && fg(s))
        for (let o = 0, l = s.length; o !== l; ++o) {
          let c = s[o];
          if (isNaN(c)) {
            console.error("THREE.KeyframeTrack: Value is not a valid number.", this, o, c), e = !1;
            break;
          }
        }
      return e;
    }
    // removes equivalent sequential keys as common in morph target sequences
    // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
    optimize() {
      let e = this.times.slice(), t = this.values.slice(), n = this.getValueSize(), s = this.getInterpolation() === Fr, r = e.length - 1, a = 1;
      for (let o = 1; o < r; ++o) {
        let l = !1, c = e[o], h = e[o + 1];
        if (c !== h && (o !== 1 || c !== e[0]))
          if (s)
            l = !0;
          else {
            let f = o * n, d = f - n, m = f + n;
            for (let _ = 0; _ !== n; ++_) {
              let y = t[f + _];
              if (y !== t[d + _] || y !== t[m + _]) {
                l = !0;
                break;
              }
            }
          }
        if (l) {
          if (o !== a) {
            e[a] = e[o];
            let f = o * n, d = a * n;
            for (let m = 0; m !== n; ++m)
              t[d + m] = t[f + m];
          }
          ++a;
        }
      }
      if (r > 0) {
        e[a] = e[r];
        for (let o = r * n, l = a * n, c = 0; c !== n; ++c)
          t[l + c] = t[o + c];
        ++a;
      }
      return a !== e.length ? (this.times = e.slice(0, a), this.values = t.slice(0, a * n)) : (this.times = e, this.values = t), this;
    }
    clone() {
      let e = this.times.slice(), t = this.values.slice(), n = this.constructor, s = new n(this.name, e, t);
      return s.createInterpolant = this.createInterpolant, s;
    }
  };
  zt.prototype.TimeBufferType = Float32Array;
  zt.prototype.ValueBufferType = Float32Array;
  zt.prototype.DefaultInterpolation = Va;
  var Nn = class extends zt {
    // No interpolation parameter because only InterpolateDiscrete is valid.
    constructor(e, t, n) {
      super(e, t, n);
    }
  };
  Nn.prototype.ValueTypeName = "bool";
  Nn.prototype.ValueBufferType = Array;
  Nn.prototype.DefaultInterpolation = Us;
  Nn.prototype.InterpolantFactoryMethodLinear = void 0;
  Nn.prototype.InterpolantFactoryMethodSmooth = void 0;
  var co = class extends zt {
  };
  co.prototype.ValueTypeName = "color";
  var ho = class extends zt {
  };
  ho.prototype.ValueTypeName = "number";
  var uo = class extends xi {
    constructor(e, t, n, s) {
      super(e, t, n, s);
    }
    interpolate_(e, t, n, s) {
      let r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, l = (n - t) / (s - t), c = e * o;
      for (let h = c + o; c !== h; c += 4)
        _n.slerpFlat(r, 0, a, c - o, a, c, l);
      return r;
    }
  }, er = class extends zt {
    InterpolantFactoryMethodLinear(e) {
      return new uo(this.times, this.values, this.getValueSize(), e);
    }
  };
  er.prototype.ValueTypeName = "quaternion";
  er.prototype.InterpolantFactoryMethodSmooth = void 0;
  var Fn = class extends zt {
    // No interpolation parameter because only InterpolateDiscrete is valid.
    constructor(e, t, n) {
      super(e, t, n);
    }
  };
  Fn.prototype.ValueTypeName = "string";
  Fn.prototype.ValueBufferType = Array;
  Fn.prototype.DefaultInterpolation = Us;
  Fn.prototype.InterpolantFactoryMethodLinear = void 0;
  Fn.prototype.InterpolantFactoryMethodSmooth = void 0;
  var fo = class extends zt {
  };
  fo.prototype.ValueTypeName = "vector";
  var po = class {
    constructor(e, t, n) {
      let s = this, r = !1, a = 0, o = 0, l, c = [];
      this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = n, this.itemStart = function(h) {
        o++, r === !1 && s.onStart !== void 0 && s.onStart(h, a, o), r = !0;
      }, this.itemEnd = function(h) {
        a++, s.onProgress !== void 0 && s.onProgress(h, a, o), a === o && (r = !1, s.onLoad !== void 0 && s.onLoad());
      }, this.itemError = function(h) {
        s.onError !== void 0 && s.onError(h);
      }, this.resolveURL = function(h) {
        return l ? l(h) : h;
      }, this.setURLModifier = function(h) {
        return l = h, this;
      }, this.addHandler = function(h, f) {
        return c.push(h, f), this;
      }, this.removeHandler = function(h) {
        let f = c.indexOf(h);
        return f !== -1 && c.splice(f, 2), this;
      }, this.getHandler = function(h) {
        for (let f = 0, d = c.length; f < d; f += 2) {
          let m = c[f], _ = c[f + 1];
          if (m.global && (m.lastIndex = 0), m.test(h))
            return _;
        }
        return null;
      };
    }
  }, pg = /* @__PURE__ */ new po(), mo = class {
    constructor(e) {
      this.manager = e !== void 0 ? e : pg, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
    }
    load() {
    }
    loadAsync(e, t) {
      let n = this;
      return new Promise(function(s, r) {
        n.load(e, s, t, r);
      });
    }
    parse() {
    }
    setCrossOrigin(e) {
      return this.crossOrigin = e, this;
    }
    setWithCredentials(e) {
      return this.withCredentials = e, this;
    }
    setPath(e) {
      return this.path = e, this;
    }
    setResourcePath(e) {
      return this.resourcePath = e, this;
    }
    setRequestHeader(e) {
      return this.requestHeader = e, this;
    }
  };
  mo.DEFAULT_MATERIAL_NAME = "__DEFAULT";
  var tr = class extends yt {
    constructor(e, t = 1) {
      super(), this.isLight = !0, this.type = "Light", this.color = new Ne(e), this.intensity = t;
    }
    dispose() {
    }
    copy(e, t) {
      return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (t.object.target = this.target.uuid), t;
    }
  };
  var ca = /* @__PURE__ */ new at(), uc = /* @__PURE__ */ new D(), dc = /* @__PURE__ */ new D(), go = class {
    constructor(e) {
      this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new ke(512, 512), this.map = null, this.mapPass = null, this.matrix = new at(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Ni(), this._frameExtents = new ke(1, 1), this._viewportCount = 1, this._viewports = [
        new ot(0, 0, 1, 1)
      ];
    }
    getViewportCount() {
      return this._viewportCount;
    }
    getFrustum() {
      return this._frustum;
    }
    updateMatrices(e) {
      let t = this.camera, n = this.matrix;
      uc.setFromMatrixPosition(e.matrixWorld), t.position.copy(uc), dc.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(dc), t.updateMatrixWorld(), ca.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(ca), n.set(
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
      ), n.multiply(ca);
    }
    getViewport(e) {
      return this._viewports[e];
    }
    getFrameExtents() {
      return this._frameExtents;
    }
    dispose() {
      this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
    }
    copy(e) {
      return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.mapSize.copy(e.mapSize), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      let e = {};
      return this.intensity !== 1 && (e.intensity = this.intensity), this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
    }
  };
  var _o = class extends go {
    constructor() {
      super(new Zs(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
    }
  }, nr = class extends tr {
    constructor(e, t) {
      super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(yt.DEFAULT_UP), this.updateMatrix(), this.target = new yt(), this.shadow = new _o();
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(e) {
      return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
    }
  }, ir = class extends tr {
    constructor(e, t) {
      super(e, t), this.isAmbientLight = !0, this.type = "AmbientLight";
    }
  };
  var Co = "\\[\\]\\.:\\/", mg = new RegExp("[" + Co + "]", "g"), Po = "[^" + Co + "]", gg = "[^" + Co.replace("\\.", "") + "]", _g = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", Po), xg = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", gg), vg = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", Po), yg = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", Po), Mg = new RegExp(
    "^" + _g + xg + vg + yg + "$"
  ), Sg = ["material", "materials", "bones", "map"], xo = class {
    constructor(e, t, n) {
      let s = n || Je.parseTrackName(t);
      this._targetGroup = e, this._bindings = e.subscribe_(t, s);
    }
    getValue(e, t) {
      this.bind();
      let n = this._targetGroup.nCachedObjects_, s = this._bindings[n];
      s !== void 0 && s.getValue(e, t);
    }
    setValue(e, t) {
      let n = this._bindings;
      for (let s = this._targetGroup.nCachedObjects_, r = n.length; s !== r; ++s)
        n[s].setValue(e, t);
    }
    bind() {
      let e = this._bindings;
      for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t)
        e[t].bind();
    }
    unbind() {
      let e = this._bindings;
      for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t)
        e[t].unbind();
    }
  }, Je = class i {
    constructor(e, t, n) {
      this.path = t, this.parsedPath = n || i.parseTrackName(t), this.node = i.findNode(e, this.parsedPath.nodeName), this.rootNode = e, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
    }
    static create(e, t, n) {
      return e && e.isAnimationObjectGroup ? new i.Composite(e, t, n) : new i(e, t, n);
    }
    /**
     * Replaces spaces with underscores and removes unsupported characters from
     * node names, to ensure compatibility with parseTrackName().
     *
     * @param {string} name Node name to be sanitized.
     * @return {string}
     */
    static sanitizeNodeName(e) {
      return e.replace(/\s/g, "_").replace(mg, "");
    }
    static parseTrackName(e) {
      let t = Mg.exec(e);
      if (t === null)
        throw new Error("PropertyBinding: Cannot parse trackName: " + e);
      let n = {
        // directoryName: matches[ 1 ], // (tschw) currently unused
        nodeName: t[2],
        objectName: t[3],
        objectIndex: t[4],
        propertyName: t[5],
        // required
        propertyIndex: t[6]
      }, s = n.nodeName && n.nodeName.lastIndexOf(".");
      if (s !== void 0 && s !== -1) {
        let r = n.nodeName.substring(s + 1);
        Sg.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, s), n.objectName = r);
      }
      if (n.propertyName === null || n.propertyName.length === 0)
        throw new Error("PropertyBinding: can not parse propertyName from trackName: " + e);
      return n;
    }
    static findNode(e, t) {
      if (t === void 0 || t === "" || t === "." || t === -1 || t === e.name || t === e.uuid)
        return e;
      if (e.skeleton) {
        let n = e.skeleton.getBoneByName(t);
        if (n !== void 0)
          return n;
      }
      if (e.children) {
        let n = function(r) {
          for (let a = 0; a < r.length; a++) {
            let o = r[a];
            if (o.name === t || o.uuid === t)
              return o;
            let l = n(o.children);
            if (l) return l;
          }
          return null;
        }, s = n(e.children);
        if (s)
          return s;
      }
      return null;
    }
    // these are used to "bind" a nonexistent property
    _getValue_unavailable() {
    }
    _setValue_unavailable() {
    }
    // Getters
    _getValue_direct(e, t) {
      e[t] = this.targetObject[this.propertyName];
    }
    _getValue_array(e, t) {
      let n = this.resolvedProperty;
      for (let s = 0, r = n.length; s !== r; ++s)
        e[t++] = n[s];
    }
    _getValue_arrayElement(e, t) {
      e[t] = this.resolvedProperty[this.propertyIndex];
    }
    _getValue_toArray(e, t) {
      this.resolvedProperty.toArray(e, t);
    }
    // Direct
    _setValue_direct(e, t) {
      this.targetObject[this.propertyName] = e[t];
    }
    _setValue_direct_setNeedsUpdate(e, t) {
      this.targetObject[this.propertyName] = e[t], this.targetObject.needsUpdate = !0;
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
      this.targetObject[this.propertyName] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    // EntireArray
    _setValue_array(e, t) {
      let n = this.resolvedProperty;
      for (let s = 0, r = n.length; s !== r; ++s)
        n[s] = e[t++];
    }
    _setValue_array_setNeedsUpdate(e, t) {
      let n = this.resolvedProperty;
      for (let s = 0, r = n.length; s !== r; ++s)
        n[s] = e[t++];
      this.targetObject.needsUpdate = !0;
    }
    _setValue_array_setMatrixWorldNeedsUpdate(e, t) {
      let n = this.resolvedProperty;
      for (let s = 0, r = n.length; s !== r; ++s)
        n[s] = e[t++];
      this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    // ArrayElement
    _setValue_arrayElement(e, t) {
      this.resolvedProperty[this.propertyIndex] = e[t];
    }
    _setValue_arrayElement_setNeedsUpdate(e, t) {
      this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.needsUpdate = !0;
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
      this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    // HasToFromArray
    _setValue_fromArray(e, t) {
      this.resolvedProperty.fromArray(e, t);
    }
    _setValue_fromArray_setNeedsUpdate(e, t) {
      this.resolvedProperty.fromArray(e, t), this.targetObject.needsUpdate = !0;
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
      this.resolvedProperty.fromArray(e, t), this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    _getValue_unbound(e, t) {
      this.bind(), this.getValue(e, t);
    }
    _setValue_unbound(e, t) {
      this.bind(), this.setValue(e, t);
    }
    // create getter / setter pair for a property in the scene graph
    bind() {
      let e = this.node, t = this.parsedPath, n = t.objectName, s = t.propertyName, r = t.propertyIndex;
      if (e || (e = i.findNode(this.rootNode, t.nodeName), this.node = e), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !e) {
        console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
        return;
      }
      if (n) {
        let c = t.objectIndex;
        switch (n) {
          case "materials":
            if (!e.material) {
              console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
              return;
            }
            if (!e.material.materials) {
              console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
              return;
            }
            e = e.material.materials;
            break;
          case "bones":
            if (!e.skeleton) {
              console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
              return;
            }
            e = e.skeleton.bones;
            for (let h = 0; h < e.length; h++)
              if (e[h].name === c) {
                c = h;
                break;
              }
            break;
          case "map":
            if ("map" in e) {
              e = e.map;
              break;
            }
            if (!e.material) {
              console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
              return;
            }
            if (!e.material.map) {
              console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
              return;
            }
            e = e.material.map;
            break;
          default:
            if (e[n] === void 0) {
              console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
              return;
            }
            e = e[n];
        }
        if (c !== void 0) {
          if (e[c] === void 0) {
            console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, e);
            return;
          }
          e = e[c];
        }
      }
      let a = e[s];
      if (a === void 0) {
        let c = t.nodeName;
        console.error("THREE.PropertyBinding: Trying to update property for track: " + c + "." + s + " but it wasn't found.", e);
        return;
      }
      let o = this.Versioning.None;
      this.targetObject = e, e.needsUpdate !== void 0 ? o = this.Versioning.NeedsUpdate : e.matrixWorldNeedsUpdate !== void 0 && (o = this.Versioning.MatrixWorldNeedsUpdate);
      let l = this.BindingType.Direct;
      if (r !== void 0) {
        if (s === "morphTargetInfluences") {
          if (!e.geometry) {
            console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
            return;
          }
          if (!e.geometry.morphAttributes) {
            console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
            return;
          }
          e.morphTargetDictionary[r] !== void 0 && (r = e.morphTargetDictionary[r]);
        }
        l = this.BindingType.ArrayElement, this.resolvedProperty = a, this.propertyIndex = r;
      } else a.fromArray !== void 0 && a.toArray !== void 0 ? (l = this.BindingType.HasFromToArray, this.resolvedProperty = a) : Array.isArray(a) ? (l = this.BindingType.EntireArray, this.resolvedProperty = a) : this.propertyName = s;
      this.getValue = this.GetterByBindingType[l], this.setValue = this.SetterByBindingTypeAndVersioning[l][o];
    }
    unbind() {
      this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
    }
  };
  Je.Composite = xo;
  Je.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
  };
  Je.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
  };
  Je.prototype.GetterByBindingType = [
    Je.prototype._getValue_direct,
    Je.prototype._getValue_array,
    Je.prototype._getValue_arrayElement,
    Je.prototype._getValue_toArray
  ];
  Je.prototype.SetterByBindingTypeAndVersioning = [
    [
      // Direct
      Je.prototype._setValue_direct,
      Je.prototype._setValue_direct_setNeedsUpdate,
      Je.prototype._setValue_direct_setMatrixWorldNeedsUpdate
    ],
    [
      // EntireArray
      Je.prototype._setValue_array,
      Je.prototype._setValue_array_setNeedsUpdate,
      Je.prototype._setValue_array_setMatrixWorldNeedsUpdate
    ],
    [
      // ArrayElement
      Je.prototype._setValue_arrayElement,
      Je.prototype._setValue_arrayElement_setNeedsUpdate,
      Je.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
    ],
    [
      // HasToFromArray
      Je.prototype._setValue_fromArray,
      Je.prototype._setValue_fromArray_setNeedsUpdate,
      Je.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
    ]
  ];
  var p_ = new Float32Array(1);
  typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
    revision: vo
  } }));
  typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = vo);

  // src/index/terrain-viewer/camera-controller.ts
  var Fc = {
    left: 1,
    center: 4
  }, bg = new Ft(new D(0, 0, 1), 0), Oc = new D(1, 0, 0), Eg = new D(0, -1, 0), wg = Math.PI / 2, Ag = Math.PI / 6, Tg = 255, or = class {
    camera;
    terrainSize = Gi(1, 1);
    mapWidth = 1;
    minZ = 1;
    maxZ = 1;
    speeds = { x: 0, y: 0, tilt: 0 };
    mouseMove = {
      left: { x: 0, y: 0 },
      center: { x: 0, y: 0 },
      wheel: 0
    };
    constructor(e, t) {
      this.camera = t, e.addEventListener("keydown", (n) => {
        switch (n.code) {
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
      }), e.addEventListener("keyup", (n) => {
        switch (n.code) {
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
      }), e.addEventListener("wheel", (n) => {
        e !== document.activeElement || n.deltaY === 0 || (n.preventDefault(), this.mouseMove.wheel += n.deltaY);
      }), e.addEventListener("mousedown", (n) => {
        e === document.activeElement && (n.button === 0 || n.button === 1) && n.preventDefault();
      }), e.addEventListener("mousemove", (n) => {
        e === document.activeElement && ((n.buttons & Fc.left) > 0 && (n.preventDefault(), this.mouseMove.left.x += n.movementX, this.mouseMove.left.y += n.movementY), (n.buttons & Fc.center) > 0 && (n.preventDefault(), this.mouseMove.center.x += n.movementX, this.mouseMove.center.y += n.movementY));
      });
    }
    onResizeCanvas(e) {
      this.camera.aspect = e, this.camera.updateProjectionMatrix();
    }
    onUpdateTerrain(e, t) {
      this.mapWidth = e, this.terrainSize = t, this.minZ = Tg * t.width / e, this.maxZ = t.height * 1.2, this.camera.far = this.terrainSize.height * 2, this.camera.position.x = 0, this.camera.position.y = -this.terrainSize.height, this.camera.position.z = this.terrainSize.height, this.camera.lookAt(0, 0, 0);
    }
    update(e) {
      this.moveCameraXY(e), this.tiltCamera(e), this.moveCameraForward();
    }
    moveCameraXY(e) {
      if (this.speeds.x === 0 && this.speeds.y === 0 && this.mouseMove.left.x === 0 && this.mouseMove.left.y === 0) return;
      let n = this.mapWidth / (this.terrainSize.width + 1) * 120 * 1e3 * e / 1e3 / 60 / 60, s = this.mouseMove.left, r = new D().copy(this.camera.position);
      this.camera.position.x += n * this.speeds.x - s.x, this.camera.position.y += n * this.speeds.y + s.y, this.mouseMove.left.x = 0, this.mouseMove.left.y = 0;
      let a = Xt(this.pointLookAtXYPlane());
      (a.x < -this.terrainSize.width / 2 || this.terrainSize.width / 2 < a.x) && (this.camera.position.x = r.x), (a.y < -this.terrainSize.height / 2 || this.terrainSize.height / 2 < a.y) && (this.camera.position.y = r.y);
    }
    moveCameraForward() {
      if (this.mouseMove.wheel === 0) return;
      let e = this.mouseMove.wheel * this.terrainSize.width / -5e3;
      this.mouseMove.wheel = 0;
      let n = this.camera.getWorldDirection(new D()).normalize().multiplyScalar(e);
      this.camera.position.add(n), (this.camera.position.z < this.minZ || this.maxZ < this.camera.position.z) && this.camera.position.sub(n);
    }
    tiltCamera(e) {
      if (this.mouseMove.center.y === 0 && this.speeds.tilt === 0) return;
      let t = this.mouseMove.center.y * (-(Math.PI / 2) / 1e3), n = this.speeds.tilt * Math.PI / 4 * e / 1e3, s = t + n;
      this.mouseMove.center.y = 0;
      let r = Xt(this.pointLookAtXYPlane());
      this.camera.position.sub(r), this.camera.position.applyAxisAngle(Oc, s);
      let a = Eg.angleTo(this.camera.position);
      (a < Ag || wg < a || this.camera.position.z < this.minZ || this.maxZ < this.camera.position.z) && this.camera.position.applyAxisAngle(Oc, -s), this.camera.position.add(r), this.camera.lookAt(r);
    }
    pointLookAtXYPlane() {
      let e = this.camera.getWorldDirection(new D());
      return new Di(this.camera.position, e).intersectPlane(bg, new D());
    }
  };

  // src/index/terrain-viewer.ts
  var Bc = 2048, lr = class {
    #e;
    #t;
    #i;
    #n;
    #s;
    #r = null;
    #a = Gi(1, 1);
    #o = null;
    constructor(e, t) {
      this.#e = e, this.#t = t, this.#i = new Ks({ canvas: e.output, antialias: !1 }), this.#i.setPixelRatio(devicePixelRatio), this.#s = new Qs();
      let n = new nr(16777215, 5);
      n.position.set(1, 1, 1).normalize(), this.#s.add(n), this.#s.add(new ir(16777215, 0.09)), this.#n = new or(e.output, new gt()), e.show.addEventListener("click", () => {
        this.#h().catch(ze);
      }), e.close.addEventListener("click", () => {
        this.#c();
      }), e.output.addEventListener("blur", () => {
        this.#c();
      }), this.updateShowButton().catch(ze);
    }
    async updateShowButton() {
      this.#e.show.disabled = await this.#t.size() === null;
    }
    async #h() {
      await this.#l();
      let { clientWidth: e, clientHeight: t } = document.documentElement;
      this.#i.setSize(e, t), this.#d(), this.#n.onResizeCanvas(e / t), this.#e.output.focus(), this.#u();
    }
    async #l() {
      this.#r && this.#s.remove(this.#r);
      let e = await this.#t.size();
      if (e === null) throw Error("Unexpected state");
      this.#a.width = Bc, this.#a.height = Math.floor(Bc / e.width * e.height), console.log("terrainSize=", this.#r, "mapSize=", e), console.time("updateElevations");
      let t = new _i(
        this.#a.width,
        this.#a.height,
        this.#a.width - 1,
        this.#a.height - 1
      );
      t.clearGroups(), t.addGroup(0, 1 / 0, 0), t.addGroup(0, 1 / 0, 1), await this.#t.writeZ(t), t.computeBoundingSphere(), t.computeVertexNormals();
      let n = new js(this.#e.texture);
      n.colorSpace = Ct, this.#r = new wt(t, [
        new Fi({ map: n, transparent: !0 }),
        // Require a fallback mesh because the canvas of 7dtd-map can contain transparent pixels
        new Fi({ color: new Ne("lightgray") })
      ]), this.#s.add(this.#r), this.#n.onUpdateTerrain(e.width, this.#a), console.timeEnd("updateElevations");
    }
    #d() {
      Object.assign(this.#e.output.style, {
        display: "block",
        zIndex: "100",
        position: "fixed",
        top: "0",
        left: "0"
      }), Object.assign(this.#e.hud.style, {
        display: "block",
        zIndex: "101",
        position: "fixed",
        top: "0",
        left: "0",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        padding: "0 16px"
      }), Object.assign(this.#e.close.style, {
        display: "block",
        zIndex: "101",
        position: "fixed",
        top: "0",
        right: "0"
      });
    }
    #u() {
      if (this.#o) return;
      let e = (t, n) => {
        if (this.#e.output.style.display === "none") {
          this.#o = null;
          return;
        }
        this.#o = requestAnimationFrame((s) => {
          e(n, s);
        }), this.#n.update(n - t), this.#i.render(this.#s, this.#n.camera);
      };
      e(0, 0);
    }
    #c() {
      this.#e.output.blur(), this.#e.output.style.display = "none", this.#e.hud.style.display = "none", this.#e.close.style.display = "none";
    }
  };

  // src/index/bundled-map-hander.ts
  var cr = class extends Hn {
    #e;
    constructor(e) {
      super(), this.#e = e, this.#t().catch(ze), this.#e.select.addEventListener("change", () => {
        if (this.#e.select.value === "") return;
        let t = this.#e.select.value;
        this.emitNoAwait({ type: "select", mapName: t, mapDir: `maps/${t}` });
      });
    }
    async #t() {
      let e = await Bn("maps/index.json");
      for (let t of e) {
        let n = document.createElement("option");
        n.value = t, n.text = t, this.#e.select.appendChild(n);
      }
    }
  };

  // src/lib/map-storage.ts
  var Rg = "7dtd-map-a20";
  function Cg() {
    return new Promise((i, e) => {
      let t = indexedDB.deleteDatabase(Rg);
      t.onsuccess = i, t.onerror = e;
    });
  }
  Cg().catch(ze);

  // src/index.ts
  function zc() {
    Go(), Bo(), Xo(), Wo(), qo(), Zo(), be("download").addEventListener("click", () => {
      let c = be("map_name", HTMLInputElement).value || "7dtd-map";
      ko(`${c}.png`, be("map", HTMLCanvasElement));
    }), kc(), window.addEventListener("resize", kc);
    let i = new ss({
      indicator: be("loading_indicator"),
      disableTargets() {
        return [
          be("files", HTMLInputElement),
          be("map_name", HTMLInputElement),
          be("terrain_viewer_show", HTMLButtonElement),
          ...document.querySelectorAll("button[data-show-dialog-for]"),
          ...document.querySelectorAll("button[data-map-dir]")
        ];
      }
    }), e = new is({
      dragovered: document.body,
      overlay: be("dnd_overlay")
    }), t = new cr({ select: be("bundled_map_select", HTMLSelectElement) }), n = new ts(
      {
        files: be("files", HTMLInputElement),
        clearMap: be("clear_map", HTMLButtonElement),
        mapName: be("map_name", HTMLInputElement)
      },
      i,
      () => new Worker("worker/file-processor.js"),
      e,
      t
    ), s = new Xi({ language: be("label_lang", HTMLSelectElement) }, navigator.languages), r = new Yi(() => new Worker("worker/dtm.js"), n), a = new ji(
      {
        canvas: be("map", HTMLCanvasElement),
        output: be("mark_coods", HTMLElement),
        resetMarker: be("reset_mark", HTMLButtonElement)
      },
      r
    ), o = new $i(
      {
        status: be("prefabs_num", HTMLElement),
        minTier: be("min_tier", HTMLInputElement),
        maxTier: be("max_tier", HTMLInputElement),
        prefabFilter: be("prefab_filter", HTMLInputElement),
        blockFilter: be("block_filter", HTMLInputElement)
      },
      new Worker("worker/prefabs-filter.js"),
      a,
      s,
      n
    );
    new ns(
      {
        canvas: be("map", HTMLCanvasElement),
        biomesAlpha: be("biomes_alpha", HTMLInputElement),
        splat3Alpha: be("splat3_alpha", HTMLInputElement),
        splat4Alpha: be("splat4_alpha", HTMLInputElement),
        radAlpha: be("rad_alpha", HTMLInputElement),
        signSize: be("sign_size", HTMLInputElement),
        signAlpha: be("sign_alpha", HTMLInputElement),
        brightness: be("brightness", HTMLInputElement),
        scale: be("scale", HTMLInputElement)
      },
      new Worker("worker/map-renderer.js"),
      o,
      a,
      n
    ), new lr(
      {
        output: be("terrain_viewer", HTMLCanvasElement),
        texture: be("map", HTMLCanvasElement),
        show: be("terrain_viewer_show", HTMLButtonElement),
        close: be("terrain_viewer_close", HTMLButtonElement),
        hud: be("terrarian_viewer_hud")
      },
      r
    );
    let l = new Ki(
      be("controller", HTMLElement),
      be("prefabs_list", HTMLElement),
      (c) => Pg(c)
    );
    o.addListener((c) => {
      l.iterator = c;
    }), new Qi(
      {
        canvas: be("map", HTMLCanvasElement),
        output: be("cursor_coods", HTMLElement)
      },
      r
    ), n.initialize().catch(ze);
  }
  function Pg(i) {
    let e = document.createElement("li");
    if (e.innerHTML = [
      `<button data-input-for="prefab_filter" data-input-text="${i.name}" title="Filter with this prefab name">\u25B2</button>`,
      ...i.dist ? [`${zo(i.dist)},`] : [],
      ...i.difficulty ? [
        `<span title="Difficulty Tier ${i.difficulty.toString()}" class="prefab_difficulty_${i.difficulty.toString()}">`,
        `  \u{1F480}${i.difficulty.toString()}`,
        "</span>"
      ] : [],
      `<a href="prefabs/${i.name}.html" target="_blank">`,
      i.highlightedLabel ?? "-",
      "/",
      `<small>${i.highlightedName ?? i.name}</small>`,
      "</a>",
      `(${i.x.toString()}, ${i.z.toString()})`
    ].join(" "), i.matchedBlocks && i.matchedBlocks.length > 0) {
      let t = document.createElement("ul");
      i.matchedBlocks.forEach((n) => {
        if (n.count === void 0) return;
        let s = document.createElement("li");
        s.innerHTML = [
          `<button data-input-for="block_filter" data-input-text="${n.name}" title="Filter with this block name">\u25B2</button>`,
          `${n.count.toString()}x`,
          n.highlightedLabel,
          `<small>${n.highlightedName}</small>`
        ].join(" "), t.appendChild(s);
      }), e.appendChild(t);
    }
    return e;
  }
  function kc() {
    let i = be("controller").clientWidth + 48;
    be("map", HTMLCanvasElement).style.marginRight = `${i.toString()}px`;
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", zc) : zc();
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
