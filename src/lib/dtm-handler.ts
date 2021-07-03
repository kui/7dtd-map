import { MapStorage } from "./map-storage";
import { pngjsByUrl } from "./pngjs";

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

  async handle(blobOrUrl: Blob | string): Promise<Dtm> {
    if (typeof blobOrUrl === "string") {
      this.dtm = await loadDtmByPngUrl(blobOrUrl);
    } else {
      this.dtm = await loadDtmByRaw(blobOrUrl);
    }
    this.storage.put("elevations", this.dtm.data);
    return this.dtm;
  }
}

async function loadDtmByPngUrl(url: string): Promise<Dtm> {
  const png = await pngjsByUrl(url);
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
