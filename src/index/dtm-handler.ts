import { MapStorage } from "../lib/map-storage";
import { Png, PngParser } from "../lib/png-parser";

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
  private storage: MapStorage;
  private pngParser: PngParser;

  dtm: Dtm | null = null;

  constructor(storage: MapStorage, workerFactory: () => Worker) {
    this.storage = storage;
    this.pngParser = new PngParser(workerFactory);
    MapStorage.addListener(async () => {
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
      this.dtm = await this.loadDtmByPngUrl(blobOrUrl);
    } else if (blobOrUrl.type.toLocaleLowerCase() === "image/png") {
      this.dtm = await this.loadByPngBlob(blobOrUrl);
    } else if (blobOrUrl.type.toLocaleLowerCase() === "image/raw") {
      this.dtm = await loadDtmByRaw(blobOrUrl);
    } else {
      throw Error(`Unknown data type: name=${blobOrUrl.name}, type=${blobOrUrl.type}`);
    }
    this.storage.put("elevations", this.dtm.data);
  }

  private async loadDtmByPngUrl(url: string): Promise<Dtm> {
    const res = await fetch(url);
    return this.loadByPngBlob(await res.blob());
  }

  private async loadByPngBlob(blob: Blob): Promise<Dtm> {
    return convertPng(await this.pngParser.parse(blob));
  }
}

function convertPng(png: Png) {
  const pngData = new Uint8Array(png.data);
  const data = new Uint8Array(pngData.length / 4);
  for (let i = 0; i < data.length; i++) {
    data[i] = pngData[i * 4];
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
