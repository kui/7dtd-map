// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'pngj... Remove this comment to see the full error message
import { PNG } from "pngjs/browser";

export async function loadBitmapByUrl(window: any, url: any) {
  const res = await window.fetch(url);
  return window.createImageBitmap(await res.blob());
}
export async function loadBitmapByFile(window: any, file: any) {
  if (!file) return null;
  return window.createImageBitmap(file);
}
export async function loadSplatBitmapByUrl(window: any, url: any) {
  console.time(`loadPng: ${url}`);
  const p = await loadPngjsByUrl(window, url);
  console.timeEnd(`loadPng: ${url}`);
  console.time(`renderSplat: ${url}`);
  const i = renderSplat(window, p);
  console.timeEnd(`renderSplat: ${url}`);
  return i;
}
export async function loadSplatBitmapByFile(window: any, file: any) {
  console.time(`loadPng: ${file.name}`);
  const p = await loadPngjsFromBlob(window, file);
  console.timeEnd(`loadPng: ${file.name}`);
  console.time(`renderSplat: ${file.name}`);
  const i = renderSplat(window, p);
  console.timeEnd(`renderSplat: ${file.name}`);
  return i;
}
export async function loadRadBitmapByFile(window: any, file: any) {
  const p = await loadPngjsFromBlob(window, file);
  return renderRad(window, p);
}
export async function loadRadBitmapByUrl(window: any, url: any) {
  const p = await loadPngjsByUrl(window, url);
  return renderRad(window, p);
}

// splatX.png should convert the pixels which:
//   * black to transparent
//   * other to non-transparent
function renderSplat(window: any, pngjs: any) {
  return render(window, pngjs, (indata: any, out: any) => {
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
function renderRad(window: any, pngjs: any) {
  return render(window, pngjs, (indata: any, out: any) => {
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

function render(window: any, { data, height, width }: any, copyFunction: any) {
  const canvas = new window.OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, width, height);
  copyFunction(data, imageData.data);
  context.putImageData(imageData, 0, 0);
  return window.createImageBitmap(canvas);
}

async function loadPngjsByUrl(window: any, url: any) {
  const res = await window.fetch(url);
  return loadPngjs(await res.arrayBuffer());
}

async function loadPngjsFromBlob(window: any, blob: any) {
  return loadPngjs(await blob.arrayBuffer());
}

async function loadPngjs(buffer: any) {
  return new Promise((resolve, reject) => {
    new PNG({ deflateChunkSize: 1024 * 1024 }).parse(
      buffer,
      (err: any, data: any) => {
        if (err) reject(err);
        else resolve(data);
      }
    );
  });
}
