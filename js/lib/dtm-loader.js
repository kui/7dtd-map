export async function loadDtmRawByFile(window, file) {
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
    // eslint-disable-next-line no-bitwise
    return this.data.getUint8((x + z * this.width) * 2 + 1);
  }
}
