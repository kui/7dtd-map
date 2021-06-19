import pako from 'pako';

export async function loadDtmRawGzByUrl(window, url) {
  const res = await window.fetch(url);
  const dtmRawGz = new Uint8Array(await res.arrayBuffer());
  return pako.inflate(dtmRawGz).buffer;
}

export async function loadDtmRawByFile(window, file) {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const r = new window.FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsArrayBuffer(file);
  });
}

export class Dtm {
  constructor(raw, width) {
    Object.assign(this, { data: new DataView(raw), width });
  }

  getElevation(x, z) {
    return this.data.getUint8((x + z * this.width) * 2 + 1);
  }
}
