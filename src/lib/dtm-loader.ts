import { pngjsByUrl } from "./pngjs";

export async function loadDtmByPngUrl(url: string, width = 8192): Promise<Dtm> {
  const png = await pngjsByUrl(url);
  const data = new Uint8Array(png.data.length / 4);
  for (let i = 0; i < data.length; i++) {
    data[i] = png.data[i * 4];
  }
  return new Dtm(data, width);
}

export async function loadDtmByRaw(blob: Blob, width = 8192): Promise<Dtm> {
  const src = new Uint8Array(await blob.arrayBuffer());
  const data = new Uint8Array(src.length / 2);
  for (let i = 0; i < data.length; i++) {
    // Higher 8 bits are a sub height in a block
    // Lower 8 bits are a height
    data[i] = src[i * 2 + 1];
  }
  return new Dtm(data, width);
}

export class Dtm {
  data: Uint8Array;
  width: number;

  constructor(bitmap: Uint8Array, width: number) {
    this.data = bitmap;
    this.width = width;
  }

  getElevation(x: number, z: number): number {
    return this.data[x + z * this.width];
  }
}
