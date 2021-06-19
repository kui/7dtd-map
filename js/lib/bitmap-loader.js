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
  console.time(`loadPng: ${url}`);
  const p = await loadPngjsByUrl(window, url);
  console.timeEnd(`loadPng: ${url}`);
  console.time(`renderSplat: ${url}`);
  const i = renderSplat(window, p);
  console.timeEnd(`renderSplat: ${url}`);
  return i;
}
export async function loadSplatBitmapByFile(window, file) {
  console.time(`loadPng: ${file.name}`);
  const p = await loadPngjsFromBlob(window, file);
  console.timeEnd(`loadPng: ${file.name}`);
  console.time(`renderSplat: ${file.name}`);
  const i = renderSplat(window, p);
  console.timeEnd(`renderSplat: ${file.name}`);
  return i;
}
export async function loadRadBitmapByFile(window, file) {
  const p = await loadPngjsFromBlob(window, file);
  return renderRad(window, p);
}
export async function loadRadBitmapByUrl(window, url) {
  const p = await loadPngjsByUrl(window, url);
  return renderRad(window, p);
}

// splatX.png should convert the pixels which:
//   * black to transparent
//   * other to non-transparent
function renderSplat(window, pngjs) {
  return render(window, pngjs, (indata, out) => {
    for (let i = 0; i < indata.length; i += 4) {
      out[i] = indata[i];
      out[i + 1] = indata[i + 1];
      out[i + 2] = indata[i + 2];
      if (indata[i] === 0 && indata[i + 1] === 0 && indata[i + 2] === 0) {
        out[i + 3] = 0;
      } else {
        out[i + 3] = 255;
      }
    }
  });
}

// radioation.png should convert the pixels which:
//   * red to half-transparent
//   * other to transparent
function renderRad(window, pngjs) {
  return render(window, pngjs, (indata, out) => {
    for (let i = 0; i < indata.length; i += 4) {
      out[i] = indata[i];
      out[i + 1] = 0;
      out[i + 2] = 0;
      if (indata[i] !== 0) {
        out[i + 3] = 80;
      } else {
        out[i + 3] = 0;
      }
    }
  });
}

function render(window, { data, height, width }, copyFunction) {
  const canvas = new window.OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, width, height);
  copyFunction(data, imageData.data);
  context.putImageData(imageData, 0, 0);
  return window.createImageBitmap(canvas);
}

async function loadPngjsByUrl(window, url) {
  const res = await window.fetch(url);
  return loadPngjs(await res.arrayBuffer());
}

async function loadPngjsFromBlob(window, blob) {
  return loadPngjs(await blob.arrayBuffer());
}

async function loadPngjs(buffer) {
  return new Promise((resolve, reject) => {
    new PNG().parse(buffer, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
