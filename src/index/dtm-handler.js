"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DtmHandler = exports.Dtm = void 0;
const map_storage_1 = require("../lib/map-storage");
const png_parser_1 = require("../lib/png-parser");
class Dtm {
  constructor(bitmap) {
    this.data = bitmap;
  }
  getElevation(coords, size) {
    if (Math.floor(this.data.byteLength / size.width) !== size.height) {
      console.warn("Game map size does not match with DTM byte array length: inputMapSize=%o, byteLength=%d", size, this.data.byteLength);
    }
    // In-game coords with left-top offset
    const x = Math.floor(size.width / 2) + coords.x;
    const z = Math.floor(size.height / 2) - coords.z;
    return this.data[x + z * size.width];
  }
}
exports.Dtm = Dtm;
class DtmHandler {
  constructor(storage, workerFactory) {
    this.listeners = [];
    this.dtm = null;
    this.storage = storage;
    this.pngParser = new png_parser_1.PngParser(workerFactory);
    map_storage_1.MapStorage.addListener(async () => {
      const h = await storage.getCurrent("elevations");
      if (h) {
        this.dtm = new Dtm(h.data);
      } else {
        this.dtm = null;
      }
      this.listeners.forEach((ln) => ln(this.dtm));
    });
  }
  async handle(blobOrUrl) {
    if (typeof blobOrUrl === "string") {
      this.dtm = await this.loadDtmByPngUrl(blobOrUrl);
    } else if (blobOrUrl.name.endsWith(".png")) {
      this.dtm = await this.loadByPngBlob(blobOrUrl);
    } else if (blobOrUrl.name.endsWith(".raw")) {
      this.dtm = await loadDtmByRaw(blobOrUrl);
    } else {
      throw Error(`Unknown data type: name=${blobOrUrl.name}, type=${blobOrUrl.type}`);
    }
    this.storage.put("elevations", this.dtm.data);
    this.listeners.forEach((ln) => ln(this.dtm));
  }
  async loadDtmByPngUrl(url) {
    const res = await fetch(url);
    return this.loadByPngBlob(await res.blob());
  }
  async loadByPngBlob(blob) {
    return convertPng(await this.pngParser.parse(blob));
  }
  addListener(ln) {
    this.listeners.push(ln);
  }
}
exports.DtmHandler = DtmHandler;
function convertPng(png) {
  const pngData = new Uint8Array(png.data);
  const data = new Uint8Array(pngData.length / 4);
  for (let i = 0; i < data.length; i++) {
    data[i] = pngData[i * 4];
  }
  return new Dtm(data);
}
async function loadDtmByRaw(blob) {
  const src = new Uint8Array(await blob.arrayBuffer());
  const data = new Uint8Array(src.length / 2);
  for (let i = 0; i < data.length; i++) {
    // Higher 8 bits are a sub height in a block
    // Lower 8 bits are a height
    data[i] = src[i * 2 + 1];
  }
  return new Dtm(data);
}
//# sourceMappingURL=dtm-handler.js.map
