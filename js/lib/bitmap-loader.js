import { PNG } from 'pngjs';
import TgaLoader from 'tga-js';
import pako from 'pako';
import streamToBlob from 'stream-to-blob';

export async function loadBitmapByUrl(window, url) {
  const res = await window.fetch(url);
  return window.createImageBitmap(await res.blob());
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
  const p = await loadPngJsByBlob(window, file);
  convertPngJsForSplat3(p);
  return loadBitmapByPngJs(window, p);
}
export async function loadSplat4BitmapByGzUrl(window, url) {
  const buffer = await loadSplat4BufferByGzUrl(window, url);
  return loadSplat4BitmapByBuffer(window, buffer);
}
export async function loadSplat4BitmapByFile(window, file) {
  return loadSplat4BitmapByBuffer(window, await file.arrayBuffer());
}

async function loadSplat4BitmapByBuffer(window, buffer) {
  const tga = new TgaLoader();
  tga.load(new Uint8Array(buffer));
  const image = tga.getImageData();
  convertImageForSplat4(image);
  return window.createImageBitmap(image);
}
async function loadSplat4BufferByGzUrl(window, url) {
  const res = await window.fetch(url);
  return pako.inflate(new Uint8Array(await res.arrayBuffer())).buffer;
}
function convertImageForSplat4({ data }) {
  for (let i = 0; i < data.length; i += 4) {
    const [red, green, blue] = data.slice(i, i + 3);
    if (red !== 0 || green !== 0 || blue !== 0) {
      data[i + 3] = 255;
    } else {
      data[i + 3] = 0;
    }
  }
}
export async function loadRadBitmapByFile(window, file) {
  const p = await loadPngJsByBlob(window, file);
  convertPngJsForRad(p);
  return loadBitmapByPngJs(window, p);
}
export async function loadRadBitmapByUrl(window, url) {
  const p = await loadPngJsByUrl(window, url);
  convertPngJsForRad(p);
  return loadBitmapByPngJs(window, p);
}

// splat3.png should convert the pixels which:
//   * black to transparent
//   * other to non-transparent
function convertPngJsForSplat3({ data }) {
  for (let i = 0; i < data.length; i += 4) {
    const [red, green, blue] = data.slice(i, i + 3);
    if (red !== 0 || green !== 0 || blue !== 0) {
      data[i + 3] = 255;
    } else {
      data[i + 3] = 0;
    }
  }
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

async function loadBitmapByPngJs(window, pngjs) {
  const blob = await streamToBlob(pngjs.pack(), 'image/png');
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
