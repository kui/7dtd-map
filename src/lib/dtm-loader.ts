import pako from "pako";

export async function loadDtmRawGzByUrl(
  window: Window,
  url: string
): Promise<ArrayBuffer> {
  const res = await window.fetch(url);
  const dtmRawGz = new Uint8Array(await res.arrayBuffer());
  return pako.inflate(dtmRawGz).buffer;
}

export async function loadDtmRawByFile(
  window: Window,
  file: File
): Promise<ArrayBuffer | null> {
  if (!file) return null;
  return file.arrayBuffer();
}

export class Dtm {
  data: any;
  width: any;

  constructor(raw: ArrayBufferLike, width: number) {
    Object.assign(this, { data: new DataView(raw), width });
  }

  getElevation(x: number, z: number): number {
    return this.data.getUint8((x + z * this.width) * 2 + 1);
  }
}
