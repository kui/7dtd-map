"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapCanvasHandler = void 0;
const map_storage_1 = require("../lib/map-storage");
const utils_1 = require("../lib/utils");
const FIELDNAME_STORAGENAME_MAP = {
  biomesImg: "biomes",
  splat3Img: "splat3",
  splat4Img: "splat4",
  radImg: "rad",
};
class MapCanvasHandler {
  constructor(doms, worker, storage, loadingHandler) {
    this.mapSizeListeners = [];
    this.doms = doms;
    this.worker = worker;
    this.storage = storage;
    this.update({
      canvas: doms.canvas.transferControlToOffscreen(),
      ...this.biomesAlpha(),
      ...this.splat3Alpha(),
      ...this.splat4Alpha(),
      ...this.radAlpha(),
      ...this.brightness(),
      ...this.signSize(),
      ...this.signAlpha(),
      ...this.scale(),
    });
    map_storage_1.MapStorage.addListener(async () => {
      console.log("Change map: ", await storage.currentId());
      this.update({ biomesImg: null, splat3Img: null, splat4Img: null, radImg: null }, false);
      loadingHandler.add(["bioms", "splat3", "splat4", "radiation"]);
      this.update({ biomesImg: (await storage.getCurrent("biomes"))?.data }, false);
      loadingHandler.delete("bioms");
      this.update({ splat3Img: (await storage.getCurrent("splat3"))?.data }, false);
      loadingHandler.delete("splat3");
      this.update({ splat4Img: (await storage.getCurrent("splat4"))?.data }, false);
      loadingHandler.delete("splat4");
      this.update({ radImg: (await storage.getCurrent("rad"))?.data }, false);
      loadingHandler.delete("radiation");
    });
    worker.addEventListener("message", (e) => {
      const { mapSize } = e.data;
      this.mapSizeListeners.map((fn) => fn(mapSize));
    });
    doms.biomesAlpha.addEventListener("input", () => this.update(this.biomesAlpha()));
    doms.splat3Alpha.addEventListener("input", () => this.update(this.splat3Alpha()));
    doms.splat4Alpha.addEventListener("input", () => this.update(this.splat4Alpha()));
    doms.radAlpha.addEventListener("input", () => this.update(this.radAlpha()));
    doms.signSize.addEventListener("input", () => this.update(this.signSize()));
    doms.signAlpha.addEventListener("input", () => this.update(this.signAlpha()));
    doms.brightness.addEventListener("input", () => this.update(this.brightness()));
    doms.scale.addEventListener("input", () => this.update(this.scale()));
  }
  async update(msg, shouldStore = true) {
    if (shouldStore) {
      for (const entry of Object.entries(msg)) {
        if (isStoreTarget(entry)) {
          this.storage.put(FIELDNAME_STORAGENAME_MAP[entry[0]], await (0, utils_1.imageBitmapToPngBlob)(entry[1]));
        }
      }
    }
    const transferables = Object.values(msg).filter(isTransferable);
    this.worker.postMessage(msg, transferables);
  }
  addMapSizeListener(ln) {
    this.mapSizeListeners.push(ln);
  }
  biomesAlpha() {
    return { biomesAlpha: this.doms.biomesAlpha.valueAsNumber };
  }
  splat3Alpha() {
    return { splat3Alpha: this.doms.splat3Alpha.valueAsNumber };
  }
  splat4Alpha() {
    return { splat4Alpha: this.doms.splat4Alpha.valueAsNumber };
  }
  radAlpha() {
    return { radAlpha: this.doms.radAlpha.valueAsNumber };
  }
  signSize() {
    return { signSize: this.doms.signSize.valueAsNumber };
  }
  signAlpha() {
    return { signAlpha: this.doms.signAlpha.valueAsNumber };
  }
  brightness() {
    return { brightness: `${this.doms.brightness.valueAsNumber}%` };
  }
  scale() {
    return { scale: this.doms.scale.valueAsNumber };
  }
}
exports.MapCanvasHandler = MapCanvasHandler;
function isTransferable(v) {
  return v instanceof ImageBitmap || v instanceof OffscreenCanvas;
}
function isStoreTarget(e) {
  return e[0] in FIELDNAME_STORAGENAME_MAP;
}
//# sourceMappingURL=map-canvas-handler.js.map
