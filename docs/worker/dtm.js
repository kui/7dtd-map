"use strict";
(() => {
  // lib/map-files.ts
  var PNG;
  var FILE_PROCESS_RULES = {
    "map_info.xml": {
      name: "map_info.xml",
      process: copy
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
      process: copy
    },
    "dtm.raw": {
      name: "dtm_block.raw.gz",
      process: (i, o) => i.pipeThrough(new DtmRawTransformer()).pipeTo(o)
    }
  }, MAP_FILE_NAME_MAP = Object.fromEntries(Object.entries(FILE_PROCESS_RULES).map(([k, v]) => [k, v.name]));
  var WORLD_FILE_NAMES = new Set(Object.keys(FILE_PROCESS_RULES));
  var MAP_FILE_NAMES = new Set(Object.values(FILE_PROCESS_RULES).map((v) => v.name));
  function copy(i, o) {
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

  // src/lib/utils.ts
  function printError(e) {
    console.error(e);
  }
  async function readWholeStream(stream) {
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // src/worker/dtm.ts
  async function main() {
    let workspace = await workspaceDir(), msg = null;
    try {
      msg = await readDtmBlockRaw(workspace);
    } catch (e) {
      console.error(e);
    }
    postMessage(msg, msg ? [msg.buffer] : []), close();
  }
  async function readDtmBlockRaw(workspace) {
    let file = await workspace.get("dtm_block.raw.gz");
    return file ? readWholeStream(file.stream().pipeThrough(new DtmBlockRawDecompressor())) : null;
  }
  main().catch(printError);
})();
//# sourceMappingURL=dtm.js.map
