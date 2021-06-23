// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'pako... Remove this comment to see the full error message
import pako from "pako";

export async function loadDtmRawGzByUrl(window: any, url: any) {
  const res = await window.fetch(url);
  const dtmRawGz = new Uint8Array(await res.arrayBuffer());
  return pako.inflate(dtmRawGz).buffer;
}

export async function loadDtmRawByFile(window: any, file: any) {
  if (!file) return null;
  return file.arrayBuffer();
}

export class Dtm {
  data: any;
  width: any;
  constructor(raw: any, width: any) {
    Object.assign(this, { data: new DataView(raw), width });
  }

  getElevation(x: any, z: any) {
    return this.data.getUint8((x + z * this.width) * 2 + 1);
  }
}
