"use strict";
(() => {
  // src/lib/utils.ts
  async function d(n) {
    return new Promise((e) => setTimeout(e, n));
  }
  function g(n) {
    return { type: "game", ...n };
  }
  function b(n) {
    console.error(n);
  }

  // src/lib/throttled-invoker.ts
  function v(n, e = 100) {
    let t = [], a = 0;
    return () => {
      switch (t.length) {
        case 0: {
          let i = (async () => {
            let s = Date.now();
            s < a + e && await d(a + e - s), a = Date.now();
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
            await i, await d(e), a = Date.now();
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

  // src/lib/storage.ts
  var T = "workspace";
  async function S() {
    let n = await navigator.storage.getDirectory();
    return new w(await n.getDirectoryHandle(T, { create: !0 }));
  }
  var w = class {
    #e;
    constructor(e) {
      this.#e = e;
    }
    get name() {
      return this.#e.name;
    }
    async put(e, t) {
      console.debug("put", e);
      let i = await (await this.#e.getFileHandle(e, { create: !0 })).createWritable();
      t instanceof ArrayBuffer || t instanceof Blob ? await i.write(t) : await t.pipeTo(i), await i.close();
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

  // src/lib/cache-holder.ts
  var m = Symbol("NO_VALUE"), p = class {
    #e;
    #r;
    #s;
    #t = m;
    #n = null;
    #a = null;
    #i = Date.now();
    constructor(e, t, a = 1e4) {
      this.#e = e, this.#r = t, this.#s = a;
    }
    /**
     * Get the value from the cache.
     *
     * If the value is not in the cache, it is fetched and stored.
     */
    async get() {
      try {
        return this.#t === m ? this.#o() : this.#t;
      } finally {
        this.#c();
      }
    }
    async #o() {
      if (this.#n) return this.#n;
      this.#n = this.#l();
      try {
        this.#t = await this.#n;
      } finally {
        this.#n = null;
      }
      return this.#t;
    }
    async #l() {
      let e, t;
      do
        e = Date.now(), t = await this.#e();
      while (e < this.#i);
      return t;
    }
    /**
     * Invalidate the cache.
     */
    invalidate() {
      this.#t !== m && (this.#r(this.#t), this.#t = m), this.#a && clearTimeout(this.#a), this.#a = null, this.#i = Date.now();
    }
    #c() {
      this.#a && clearTimeout(this.#a), this.#a = setTimeout(() => {
        this.invalidate();
      }, this.#s);
    }
  };

  // src/lib/map-renderer.ts
  var E = "\u2718", P = "\u{1F6A9}\uFE0F", h = class {
    brightness = "100%";
    markerCoords = null;
    scale = 0.1;
    showPrefabs = !0;
    prefabs = [];
    signSize = 200;
    signAlpha = 1;
    biomesAlpha = 1;
    splat3Alpha = 1;
    splat4Alpha = 1;
    radAlpha = 1;
    canvas;
    #e = g({ width: 0, height: 0 });
    #r = new c("biomes.png");
    #s = new c("splat3.png");
    #t = new c("splat4.png");
    #n = new c("radiation.png");
    #a = [this.#r, this.#s, this.#t, this.#n];
    #i;
    constructor(e, t) {
      this.canvas = e, this.#i = t;
    }
    set invalidate(e) {
      for (let t of e)
        switch (t) {
          case "biomes.png":
            this.#r.invalidate();
            break;
          case "splat3.png":
            this.#s.invalidate();
            break;
          case "splat4.png":
            this.#t.invalidate();
            break;
          case "radiation.png":
            this.#n.invalidate();
            break;
          default:
            throw new Error(`Invalid file name: ${String(t)}`);
        }
    }
    update = v(async () => {
      console.log("MapUpdate"), console.time("MapUpdate"), await this.#o(), console.timeEnd("MapUpdate");
    });
    async #o() {
      let [e, t, a, i] = await Promise.all(this.#a.map((l) => l.get())), { width: s, height: o } = k(e, t, a, i);
      if (this.#e.width = s, this.#e.height = o, s === 0 || o === 0) {
        this.canvas.width = 1, this.canvas.height = 1;
        return;
      }
      this.canvas.width = s * this.scale, this.canvas.height = o * this.scale;
      let r = this.canvas.getContext("2d");
      r && (r.scale(this.scale, this.scale), r.filter = `brightness(${this.brightness})`, e && this.biomesAlpha !== 0 && (r.globalAlpha = this.biomesAlpha, r.drawImage(e, 0, 0, s, o)), t && this.splat3Alpha !== 0 && (r.globalAlpha = this.splat3Alpha, r.drawImage(t, 0, 0, s, o)), a && this.splat4Alpha !== 0 && (r.globalAlpha = this.splat4Alpha, r.drawImage(a, 0, 0, s, o)), r.filter = "none", i && this.radAlpha !== 0 && (r.globalAlpha = this.radAlpha, r.imageSmoothingEnabled = !1, r.drawImage(i, 0, 0, s, o), r.imageSmoothingEnabled = !0), r.globalAlpha = this.signAlpha, this.showPrefabs && this.drawPrefabs(r, s, o), this.markerCoords && this.drawMark(r, s, o));
    }
    drawPrefabs(e, t, a) {
      e.font = `${this.signSize.toString()}px ${this.#i.family}`, e.fillStyle = "red", e.textAlign = "center", e.textBaseline = "middle";
      let i = t / 2, s = a / 2, o = Math.round(this.signSize * 0.01), r = Math.round(this.signSize * 0.05);
      for (let l of this.prefabs.toReversed()) {
        let f = i + l.x + o, M = s - l.z + r;
        x(e, { text: E, x: f, z: M, size: this.signSize });
      }
    }
    drawMark(e, t, a) {
      if (!this.markerCoords) return;
      e.font = `${this.signSize.toString()}px ${this.#i.family}`, e.fillStyle = "red", e.textAlign = "left", e.textBaseline = "alphabetic";
      let i = t / 2, s = a / 2, o = -1 * Math.round(this.signSize * 0.32), r = -1 * Math.round(this.signSize * 0.1), l = i + this.markerCoords.x + o, f = s - this.markerCoords.z + r;
      x(e, { text: P, x: l, z: f, size: this.signSize });
    }
    size() {
      return this.#e;
    }
  };
  function k(...n) {
    return g({
      width: Math.max(...n.map((e) => e?.width ?? 0)),
      height: Math.max(...n.map((e) => e?.height ?? 0))
    });
  }
  function x(n, { text: e, x: t, z: a, size: i }) {
    n.lineWidth = Math.round(i * 0.2), n.strokeStyle = "rgba(0, 0, 0, 0.8)", n.strokeText(e, t, a), n.lineWidth = Math.round(i * 0.1), n.strokeStyle = "white", n.strokeText(e, t, a), n.fillText(e, t, a);
  }
  var c = class extends p {
    constructor(t) {
      super(
        async () => {
          console.log("Loading image", t);
          let i = await (await S()).get(t);
          try {
            return i ? await createImageBitmap(i) : null;
          } finally {
            console.log("Loaded image", t);
          }
        },
        (a) => a?.close()
      );
      this.fileName = t;
    }
  };

  // src/worker/map-renderer.ts
  var y = new FontFace("Noto Sans", "url(../NotoEmoji-Regular.ttf)"), u = null;
  y.load().then(() => (fonts.add(y), u?.update())).catch(b);
  onmessage = async (n) => {
    let e = n.data;
    if (console.log("map-renderer: recieved %o", e), !u)
      if (e.canvas)
        u = new h(e.canvas, y);
      else
        throw Error("Unexpected state");
    await Object.assign(u, e).update();
    let t = { mapSize: u.size() };
    console.log("map-renderer: sending %o", t), postMessage(t);
  };
})();
//# sourceMappingURL=map-renderer.js.map
