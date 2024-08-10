"use strict";
(() => {
  // src/lib/utils.ts
  async function sleep(msec) {
    return new Promise((r) => setTimeout(r, msec));
  }
  function gameMapSize(s) {
    return { type: "game", ...s };
  }
  function printError(e) {
    console.error(e);
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

  // src/lib/map-renderer.ts
  var SIGN_CHAR = "\u2718", MARK_CHAR = "\u{1F6A9}\uFE0F", MapRenderer = class {
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
    #mapSize = gameMapSize({ width: 0, height: 0 });
    #biomesImage = new BitmapHolder("biomes.png");
    #splat3Image = new BitmapHolder("splat3.png");
    #splat4Image = new BitmapHolder("splat4.png");
    #radImage = new BitmapHolder("radiation.png");
    #imageFiles = [this.#biomesImage, this.#splat3Image, this.#splat4Image, this.#radImage];
    #fontFace;
    constructor(canvas, fontFace) {
      this.canvas = canvas, this.#fontFace = fontFace;
    }
    set invalidate(fileNames) {
      for (let fileName of fileNames)
        switch (fileName) {
          case "biomes.png":
            this.#biomesImage.invalidate();
            break;
          case "splat3.png":
            this.#splat3Image.invalidate();
            break;
          case "splat4.png":
            this.#splat4Image.invalidate();
            break;
          case "radiation.png":
            this.#radImage.invalidate();
            break;
          default:
            throw new Error(`Invalid file name: ${String(fileName)}`);
        }
    }
    update = throttledInvoker(async () => {
      console.log("MapUpdate"), console.time("MapUpdate"), await this.#updateImmediately(), console.timeEnd("MapUpdate");
    });
    async #updateImmediately() {
      let [biomes, splat3, splat4, rad] = await Promise.all(this.#imageFiles.map((i) => i.get())), { width, height } = mapSize(biomes, splat3, splat4, rad);
      if (this.#mapSize.width = width, this.#mapSize.height = height, width === 0 || height === 0) {
        this.canvas.width = 1, this.canvas.height = 1;
        return;
      }
      this.canvas.width = width * this.scale, this.canvas.height = height * this.scale;
      let context = this.canvas.getContext("2d");
      context && (context.imageSmoothingEnabled = !1, context.scale(this.scale, this.scale), context.filter = `brightness(${this.brightness})`, biomes && this.biomesAlpha !== 0 && (context.globalAlpha = this.biomesAlpha, context.drawImage(biomes, 0, 0, width, height)), context.imageSmoothingEnabled = !0, splat3 && this.splat3Alpha !== 0 && (context.globalAlpha = this.splat3Alpha, context.drawImage(splat3, 0, 0, width, height)), splat4 && this.splat4Alpha !== 0 && (context.globalAlpha = this.splat4Alpha, context.drawImage(splat4, 0, 0, width, height)), context.imageSmoothingEnabled = !1, context.filter = "none", rad && this.radAlpha !== 0 && (context.globalAlpha = this.radAlpha, context.drawImage(rad, 0, 0, width, height)), context.globalAlpha = this.signAlpha, this.showPrefabs && this.drawPrefabs(context, width, height), this.markerCoords && this.drawMark(context, width, height));
    }
    drawPrefabs(ctx, width, height) {
      ctx.font = `${this.signSize.toString()}px ${this.#fontFace.family}`, ctx.fillStyle = "red", ctx.textAlign = "center", ctx.textBaseline = "middle";
      let offsetX = width / 2, offsetY = height / 2, charOffsetX = Math.round(this.signSize * 0.01), charOffsetY = Math.round(this.signSize * 0.05);
      for (let prefab of this.prefabs.toReversed()) {
        let x = offsetX + prefab.x + charOffsetX, z = offsetY - prefab.z + charOffsetY;
        putText(ctx, { text: SIGN_CHAR, x, z, size: this.signSize });
      }
    }
    drawMark(ctx, width, height) {
      if (!this.markerCoords) return;
      ctx.font = `${this.signSize.toString()}px ${this.#fontFace.family}`, ctx.fillStyle = "red", ctx.textAlign = "left", ctx.textBaseline = "alphabetic";
      let offsetX = width / 2, offsetY = height / 2, charOffsetX = -1 * Math.round(this.signSize * 0.32), charOffsetY = -1 * Math.round(this.signSize * 0.1), x = offsetX + this.markerCoords.x + charOffsetX, z = offsetY - this.markerCoords.z + charOffsetY;
      putText(ctx, { text: MARK_CHAR, x, z, size: this.signSize });
    }
    size() {
      return this.#mapSize;
    }
  };
  function mapSize(...images) {
    return gameMapSize({
      width: Math.max(...images.map((i) => i?.width ?? 0)),
      height: Math.max(...images.map((i) => i?.height ?? 0))
    });
  }
  function putText(ctx, { text, x, z, size }) {
    ctx.lineWidth = Math.round(size * 0.2), ctx.strokeStyle = "rgba(0, 0, 0, 0.8)", ctx.strokeText(text, x, z), ctx.lineWidth = Math.round(size * 0.1), ctx.strokeStyle = "white", ctx.strokeText(text, x, z), ctx.fillText(text, x, z);
  }
  var BitmapHolder = class extends CacheHolder {
    constructor(fileName) {
      super(
        async () => {
          console.log("Loading image", fileName);
          let file = await (await workspaceDir()).get(fileName);
          try {
            return file ? await createImageBitmap(file) : null;
          } finally {
            console.log("Loaded image", fileName);
          }
        },
        (img) => img?.close()
      );
      this.fileName = fileName;
    }
  };

  // src/worker/map-renderer.ts
  var FONT_FACE = new FontFace("Noto Sans", "url(../NotoEmoji-Regular.ttf)"), map = null;
  FONT_FACE.load().then(() => (fonts.add(FONT_FACE), map?.update())).catch(printError);
  onmessage = async (event) => {
    let message = event.data;
    if (console.log("map-renderer: recieved %o", message), !map)
      if (message.canvas)
        map = new MapRenderer(message.canvas, FONT_FACE);
      else
        throw Error("Unexpected state");
    await Object.assign(map, message).update();
    let out = { mapSize: map.size() };
    console.log("map-renderer: sending %o", out), postMessage(out);
  };
})();
//# sourceMappingURL=map-renderer.js.map
