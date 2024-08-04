"use strict";
(() => {
  // lib/map-files.ts
  var U;
  var E = {
    "map_info.xml": {
      name: "map_info.xml",
      process: h
    },
    "biomes.png": {
      name: "biomes.png",
      process: M
    },
    "splat3.png": {
      name: "splat3.png",
      process: F
    },
    "splat3_processed.png": {
      name: "splat3.png",
      process: F
    },
    "splat4.png": {
      name: "splat4.png",
      process: x
    },
    "splat4_processed.png": {
      name: "splat4.png",
      process: x
    },
    "radiation.png": {
      name: "radiation.png",
      process: P
    },
    "prefabs.xml": {
      name: "prefabs.xml",
      process: h
    },
    "dtm.raw": {
      name: "dtm_block.raw.gz",
      process: (n, e) => n.pipeThrough(new u()).pipeTo(e)
    }
  }, D = Object.fromEntries(Object.entries(E).map(([n, e]) => [n, e.name]));
  var O = new Set(Object.keys(E));
  var C = new Set(Object.values(E).map((n) => n.name));
  function h(n, e) {
    return n.pipeTo(e);
  }
  function M(n, e) {
    return n.pipeThrough(new d()).pipeTo(e);
  }
  function F(n, e) {
    return n.pipeThrough(new f()).pipeTo(e);
  }
  function x(n, e) {
    return n.pipeThrough(new y()).pipeTo(e);
  }
  function P(n, e) {
    return n.pipeThrough(new g()).pipeTo(e);
  }
  var A = { highWaterMark: 1024 * 1024 }, S = [A, A], c = class {
    readable;
    writable;
    constructor(e) {
      let { readable: r, writable: t } = new TransformStream({}, ...S);
      this.readable = e.reduce((a, o) => a.pipeThrough(o), r), this.writable = t;
    }
  }, m = class extends TransformStream {
    constructor() {
      let e = 1;
      super(
        {
          transform(r, t) {
            let a = new Uint8Array(
              r.length % 2 === 0 ? r.length / 2 : e === 1 ? (r.length - 1) / 2 : (r.length + 1) / 2
            ), o = e;
            for (; o < r.length; o += 2)
              a[(o - e) / 2] = r[o];
            e = o - r.length, t.enqueue(a);
          }
        },
        ...S
      );
    }
  }, u = class extends c {
    constructor() {
      super([new m(), new CompressionStream("gzip")]);
    }
  }, l = class extends DecompressionStream {
    constructor() {
      super("gzip");
    }
  }, i = class extends TransformStream {
    constructor(e) {
      let r = new U({ deflateLevel: 9, deflateStrategy: 0 }), { promise: t, resolve: a, reject: o } = Promise.withResolvers();
      super(
        {
          start(s) {
            r.on("parsed", () => {
              T(r, e, s).then(a).catch((p) => {
                o(p);
              });
            });
          },
          transform(s) {
            r.write(s);
          },
          flush() {
            return t;
          }
        },
        ...S
      );
    }
  };
  async function T(n, e, r) {
    if (globalThis.OffscreenCanvas) {
      let t = new OffscreenCanvas(n.width, n.height), a = t.getContext("2d"), o = a.createImageData(n.width, n.height);
      e(n.data, o.data), a.putImageData(o, 0, 0);
      let s = await t.convertToBlob({ type: "image/png" });
      for await (let p of s.stream()) r.enqueue(p);
    } else
      return e(n.data, n.data), new Promise((t, a) => {
        n.pack().on("data", (o) => {
          r.enqueue(o);
        }).on("error", a).on("end", t);
      });
  }
  var f = class extends i {
    constructor() {
      super((e, r) => {
        for (let t = 0; t < r.length; t += 4)
          e[t] === 0 && e[t + 1] === 0 && e[t + 2] === 0 ? (r[t] = 0, r[t + 1] = 0, r[t + 2] = 0, r[t + 3] = 0) : (r[t] = e[t], r[t + 1] = e[t + 1], r[t + 2] = e[t + 2], r[t + 3] = 255);
      });
    }
  }, y = class extends i {
    constructor() {
      super((e, r) => {
        for (let t = 0; t < e.length; t += 4)
          if (e[t] === 0 && e[t + 1] === 0 && e[t + 2] === 0)
            r[t] = 0, r[t + 1] = 0, r[t + 2] = 0, r[t + 3] = 0;
          else if (e[t + 1] === 255) {
            r[t] = e[t];
            let a = e[t + 1];
            r[t + 1] = e[t + 2], r[t + 2] = a, r[t + 3] = 255;
          } else
            r[t] = e[t], r[t + 1] = e[t + 1], r[t + 2] = e[t + 2], r[t + 3] = 255;
      });
    }
  }, g = class extends i {
    constructor() {
      super((e, r) => {
        for (let t = 0; t < e.length; t += 4)
          e[t] === 0 && e[t + 1] === 0 && e[t + 2] === 0 ? (r[t] = 0, r[t + 1] = 0, r[t + 2] = 0, r[t + 3] = 0) : (r[t] = e[t], r[t + 1] = e[t + 1], r[t + 2] = e[t + 2], r[t + 3] = 255);
      });
    }
  }, d = class extends i {
    constructor() {
      super((e, r) => {
        for (let t = 0; t < e.length; t++)
          r[t] = e[t];
      });
    }
  };

  // src/lib/storage.ts
  var N = "workspace";
  async function b() {
    let n = await navigator.storage.getDirectory();
    return new w(await n.getDirectoryHandle(N, { create: !0 }));
  }
  var w = class {
    #e;
    constructor(e) {
      this.#e = e;
    }
    get name() {
      return this.#e.name;
    }
    async put(e, r) {
      console.debug("put", e);
      let a = await (await this.#e.getFileHandle(e, { create: !0 })).createWritable();
      r instanceof ArrayBuffer || r instanceof Blob ? await a.write(r) : await r.pipeTo(a), await a.close();
    }
    async createWritable(e) {
      return await (await this.#e.getFileHandle(e, { create: !0 })).createWritable();
    }
    async get(e) {
      console.debug("get", e);
      try {
        return await (await this.#e.getFileHandle(e)).getFile();
      } catch (r) {
        if (r instanceof DOMException && r.name === "NotFoundError")
          return null;
        throw r;
      }
    }
    async size(e) {
      return (await (await this.#e.getFileHandle(e)).getFile()).size;
    }
    async remove(e) {
      await this.#e.removeEntry(e);
    }
  };

  // src/lib/utils.ts
  function R(n) {
    console.error(n);
  }
  async function _(n) {
    return new Uint8Array(await new Response(n).arrayBuffer());
  }

  // src/worker/dtm.ts
  async function v() {
    let n = await b(), e = null;
    try {
      e = await W(n);
    } catch (r) {
      console.error(r);
    }
    postMessage(e, e ? [e.buffer] : []), close();
  }
  async function W(n) {
    let e = await n.get("dtm_block.raw.gz");
    return e ? _(e.stream().pipeThrough(new l())) : null;
  }
  v().catch(R);
})();
//# sourceMappingURL=dtm.js.map
