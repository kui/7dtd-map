import { PNG } from 'pngjs/browser';

export async function loadBitmapByUrl(window, url) {
  const res = await window.fetch(url);
  return window.createImageBitmap(await res.blob());
}
export async function loadBitmapByFile(window, file) {
  if (!file) return null;
  return window.createImageBitmap(file);
}
export async function loadSplatBitmapByUrl(window, url) {
  const p = await loadPngJsByUrl(window, url);
  convertPngJsForSplat(p, url);
  return loadBitmapByPngJs(window, p, url);
}
export async function loadSplatBitmapByFile(window, file) {
  const p = await loadPngJsByBlob(window, file);
  convertPngJsForSplat(p, file.name);
  return loadBitmapByPngJs(window, p, file.name);
}

export async function loadRadBitmapByFile(window, file) {
  const p = await loadPngJsByBlob(window, file);
  convertPngJsForRad(p);
  return loadBitmapByPngJs(window, p, file.name);
}
export async function loadRadBitmapByUrl(window, url) {
  const p = await loadPngJsByUrl(window, url);
  convertPngJsForRad(p);
  return loadBitmapByPngJs(window, p, url);
}

// splatX.png should convert the pixels which:
//   * black to transparent
//   * other to non-transparent
function convertPngJsForSplat({ data }, label) {
  console.time(`convert_splat: ${label}`);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
      data[i + 3] = 0;
    } else {
      data[i + 3] = 255;
    }
  }
  console.timeEnd(`convert_splat: ${label}`);
}

// radioation.png should convert the pixels which:
//   * red to half-transparent
//   * other to transparent
function convertPngJsForRad({ data }) {
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    if (red !== 0) {
      data[i + 3] = 80;
    } else {
      data[i + 3] = 0;
    }
  }
}

async function loadBitmapByPngJs(window, pngjs, label) {
  console.time(`stream_to_blob: ${label}`);
  const blob = await convertBlobByPngJs(window, pngjs);
  console.timeEnd(`stream_to_blob: ${label}`);
  return window.createImageBitmap(blob);
}

async function loadPngJsByUrl(window, url) {
  const res = await window.fetch(url);
  return loadPngJsByBlob(window, res);
}

async function loadPngJsByBlob(window, blob) {
  return loadPngJs(await blob.arrayBuffer());
}

async function loadPngJs(buffer) {
  return new Promise((resolve, reject) => {
    new PNG().parse(buffer, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function convertBlobByPngJs(window, pngjs) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    pngjs.pack()
      .on('data', (c) => chunks.push(c))
      .once('end', () => resolve(new window.Blob(chunks, { type: 'image/png' })))
      .once('error', reject);
  });
}
