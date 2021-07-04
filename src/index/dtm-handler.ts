import { PNG } from "pngjs/browser";
import { MapStorage } from "../lib/map-storage";
import { pngjsByBlob, pngjsByUrl } from "../lib/pngjs";

export class Dtm {
  data: Uint8Array;

  constructor(bitmap: Uint8Array) {
    this.data = bitmap;
  }

  getElevation(x: number, z: number, width: number): number {
    return this.data[x + z * width];
  }
}

export class DtmHandler {
  storage: MapStorage;
  dtm: Dtm | null = null;

  constructor(storage: MapStorage) {
    this.storage = storage;
    storage.listeners.push(async () => {
      const h = await storage.getCurrent("elevations");
      if (h) {
        this.dtm = new Dtm(h.data);
      } else {
        this.dtm = null;
      }
    });
  }

  async handle(blobOrUrl: File | string): Promise<void> {
    if (typeof blobOrUrl === "string") {
      this.dtm = await loadDtmByPngUrl(blobOrUrl);
    } else if (blobOrUrl.type.toLocaleLowerCase() === "image/png") {
      this.dtm = await loadDtmByPngBlob(blobOrUrl);
    } else if (blobOrUrl.type.toLocaleLowerCase() === "image/raw") {
      this.dtm = await loadDtmByRaw(blobOrUrl);
    } else {
      throw Error(`Unknown data type: name=${blobOrUrl.name}, type=${blobOrUrl.type}`);
    }
    this.storage.put("elevations", this.dtm.data);
  }
}

async function loadDtmByPngUrl(url: string): Promise<Dtm> {
  return convertPng(await pngjsByUrl(url));
}

async function loadDtmByPngBlob(blob: Blob): Promise<Dtm> {
  return convertPng(await pngjsByBlob(blob));
}

function convertPng(png: PNG) {
  const data = new Uint8Array(png.data.length / 4);
  for (let i = 0; i < data.length; i++) {
    data[i] = png.data[i * 4];
  }
  return new Dtm(data);
}

async function loadDtmByRaw(blob: Blob): Promise<Dtm> {
  const src = new Uint8Array(await blob.arrayBuffer());
  const data = new Uint8Array(src.length / 2);
  for (let i = 0; i < data.length; i++) {
    // Higher 8 bits are a sub height in a block
    // Lower 8 bits are a height
    data[i] = src[i * 2 + 1];
  }
  return new Dtm(data);
}
