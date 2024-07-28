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
  private pngParser: PngParser;
  private listeners: ((dtm: Dtm | null) => unknown)[] = [];

  dtm: Dtm | null = null;

  constructor(workerFactory: () => Worker) {
    this.pngParser = new PngParser(workerFactory);
  }

  async handle(blob: File|null): Promise<void> {
    if (blob === null) {
      this.dtm = null;
    } else if (blob.name.endsWith(".png")) {
      this.dtm = await this.loadByPngBlob(blob);
    } else if (blob.name.endsWith(".raw")) {
      this.dtm = await loadDtmByRaw(blob);
    } else {
      throw Error(`Unknown data type: name=${blob.name}, type=${blob.type}`);
    }
    await Promise.all(this.listeners.map((ln) => ln(this.dtm)));
  }

  private async loadByPngBlob(blob: Blob): Promise<Dtm> {
    return convertPng(await this.pngParser.parse(blob));
  }

  addListener(ln: (dtm: Dtm | null) => unknown): void {
    this.listeners.push(ln);
  }
}

function convertPng(png: Png) {
  const pngData = new Uint8Array(png.data);
  const data = new Uint8Array(pngData.length / 4);
  for (let i = 0; i < data.length; i++) {
    // dtm.png has only one channel.
    // The color indicates the block height.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data[i] = pngData[i * 4]!;
  }
  return new Dtm(data);
}

async function loadDtmByRaw(blob: Blob): Promise<Dtm> {
  const src = new Uint8Array(await blob.arrayBuffer());
  const data = new Uint8Array(src.length / 2);
  for (let i = 0; i < data.length; i++) {
    // Higher 8 bits are sub-block height
    // Lower 8 bits are block height
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data[i] = src[i * 2 + 1]!;
  }
  return new Dtm(data);
}
