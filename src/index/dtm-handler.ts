import { MapStorage } from "../lib/map-storage";
import { Png, PngParser } from "../lib/png-parser";

export class Dtm {
  data: Uint8Array;

  constructor(bitmap: Uint8Array) {
    this.data = bitmap;
  }

  getElevation(coords: GameCoords, size: GameMapSize): number {
    if (Math.floor(this.data.byteLength / size.width) !== size.height) {
      console.warn("Game map size does not match with DTM byte array length: inputMapSize=%o, byteLength=%d", size, this.data.byteLength);
    }
    // In-game coords with left-top offset
    const x = Math.floor(size.width / 2) + coords.x;
    const z = Math.floor(size.height / 2) - coords.z;
    const elev = this.data[x + z * size.width];
    if (elev === undefined) {
      throw Error(`Invalid coords: coords=${JSON.stringify(coords)}, size=${JSON.stringify(size)}`);
    }
    return elev;
  }
}

export class DtmHandler {
  private storage: MapStorage;
  private pngParser: PngParser;
  private listeners: ((dtm: Dtm | null) => unknown)[] = [];

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
      this.listeners.forEach((ln) => {
        ln(this.dtm);
      });
    });
  }

  async handle(blobOrUrl: File | string): Promise<void> {
    if (typeof blobOrUrl === "string") {
      this.dtm = await this.loadDtmByPngUrl(blobOrUrl);
    } else if (blobOrUrl.name.endsWith(".png")) {
      this.dtm = await this.loadByPngBlob(blobOrUrl);
    } else if (blobOrUrl.name.endsWith(".raw")) {
      this.dtm = await loadDtmByRaw(blobOrUrl);
    } else {
      throw Error(`Unknown data type: name=${blobOrUrl.name}, type=${blobOrUrl.type}`);
    }
    await this.storage.put("elevations", this.dtm.data);
    await Promise.all(this.listeners.map((ln) => ln(this.dtm)));
  }

  private async loadDtmByPngUrl(url: string): Promise<Dtm> {
    const res = await fetch(url);
    return this.loadByPngBlob(await res.blob());
  }

  private async loadByPngBlob(blob: Blob): Promise<Dtm> {
    return convertPng(await this.pngParser.parse(blob));
  }

  addListener(ln: (dtm: Dtm | null) => void): void {
    this.listeners.push(ln);
  }
}

function convertPng(png: Png) {
  const pngData = new Uint8Array(png.data);
  const data = new Uint8Array(pngData.length / 4);
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data[i] = pngData[i * 4]!;
  }
  return new Dtm(data);
}

async function loadDtmByRaw(blob: Blob): Promise<Dtm> {
  const src = new Uint8Array(await blob.arrayBuffer());
  const data = new Uint8Array(src.length / 2);
  for (let i = 0; i < data.length; i++) {
    // Higher 8 bits are a sub height in a block
    // Lower 8 bits are a height
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data[i] = src[i * 2 + 1]!;
  }
  return new Dtm(data);
}
