import Tga from 'tga';

export async function parseDtmTgaByFile(window, file) {
  const arrayBuffer = await new Promise((resolve, reject) => {
    const r = new window.FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsArrayBuffer(file);
  });
  const tga = new Tga(Buffer.from(arrayBuffer));
  return new Dtm(tga);
}

export async function parseDtmTgaByUrl(window, url) {
  const response = await window.fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const tga = new Tga(Buffer.from(arrayBuffer));
  return new Dtm(tga);
}

class Dtm {
  constructor(tga) {
    this.width = tga.width;
    this.height = tga.height;
    this.values = copy(tga);
  }

  value(x, y) {
    return this.values[x + this.width * y];
  }
}

function copy(tga) {
  const a = new Uint8Array(tga.pixels.length / 4);
  for (let i = 0; i < a.length; i += 1) {
    a[i] = tga.pixels[i * 4];
  }
  return a;
}
