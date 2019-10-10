import { PNG } from 'pngjs';
import streamToBlob from 'stream-to-blob';

export async function loadBitmapByUrl(window, url) {
  const res = await window.fetch(url);
  return window.createImageBitmap(await res.body.blob());
}
export async function loadBitmapByFile(window, file) {
  if (!file) return null;
  return window.createImageBitmap(file);
}
export async function loadSplat3BitmapByUrl(window, url) {
  const p = await loadPngJsByUrl(window, url);
  convertPngJsForSplat3(p);
  return loadBitmapByPngJs(window, p);
}
export async function loadSplat3BitmapByFile(window, file) {
  const p = await loadPngJsByFile(window, file);
  convertPngJsForSplat3(p);
  return loadBitmapByPngJs(window, p);
}
export async function loadRadBitmapByFile(window, file) {
  const orig = await loadBitmapByFile(window, file);
  return filterRad(window, orig);
}
export async function loadRadBitmapByUrl(window, url) {
  const orig = await loadBitmapByUrl(window, url);
  return filterRad(window, orig);
}

function convertPngJsForSplat3(pngjs) {
  const { data } = pngjs;
  for (let i = 0; i < data.length; i += 4) {
    const [red, green, blue] = data.slice(i, i + 3);
    if (red !== 0 || green !== 0 || blue !== 0) {
      data[i + 3] = 255;
    }
  }
}

async function loadBitmapByPngJs(window, pngjs) {
  const blob = await streamToBlob(pngjs.pack(), 'image/png');
  return window.createImageBitmap(blob);
}

async function loadPngJsByUrl(window, url) {
  const res = await window.fetch(url);
  return loadPngJs(await res.body.arrayBuffer());
}

async function loadPngJsByFile(window, file) {
  return loadPngJs(await file.arrayBuffer());
}

async function loadPngJs(buffer) {
  return new Promise((resolve, reject) => {
    new PNG().parse(buffer, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

async function filterRad(window, orig) {
  // We cannot use OffscreenCanvas with url() filter.
  // So, instead of it, un-rendering canvas element is used.
  const canvas = window.document.createElement('canvas');
  canvas.width = orig.width;
  canvas.height = orig.height;
  const context = canvas.getContext('2d');
  context.filter = 'url("#rad_filter")';
  context.drawImage(orig, 0, 0);
  return window.createImageBitmap(canvas);
}
