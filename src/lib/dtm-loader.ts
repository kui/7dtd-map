import pako from "pako";

export async function loadDtmRawGzByUrl(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  const dtmRawGz = new Uint8Array(await res.arrayBuffer());
  return pako.inflate(dtmRawGz).buffer;
}

export class Dtm {
  data: DataView;
  width: number;

  constructor(raw: ArrayBufferLike, width: number) {
    this.data = new DataView(raw);
    this.width = width;
  }

  getElevation(x: number, z: number): number {
    return this.data.getUint8((x + z * this.width) * 2 + 1);
  }
}
