import Jimp from 'jimp';

export async function loadBitmapByUrl(window, url) {
  const image = await loadImageByUrl(window, url);
  return window.createImageBitmap(image);
}
export async function loadBitmapByFile(window, file) {
  if (!file) return null;
  return window.createImageBitmap(file);
}
export async function loadSplat3BitmapByUrl(window, url) {
  return loadSplat3BitmapByJimp(window, await Jimp.read(url));
}
export async function loadSplat3BitmapByFile(window, file) {
  const buffer = await loadBufferByFile(window, file);
  return loadSplat3BitmapByJimp(window, await Jimp.read(buffer));
}
export async function loadRadBitmapByFile(window, file) {
  const orig = await loadBitmapByFile(window, file);
  return filterRad(window, orig);
}
export async function loadRadBitmapByUrl(window, url) {
  const orig = await loadBitmapByUrl(window, url);
  return filterRad(window, orig);
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

async function loadSplat3BitmapByJimp(window, jimp) {
  convertSplat3(jimp);
  return loadBitmapByUrl(window, await jimp.getBase64Async(Jimp.MIME_PNG));
}

async function convertSplat3(jimp) {
  const { data } = jimp.bitmap;
  for (let i = 0; i < data.length; i += 4) {
    const [red, green, blue] = data.slice(i, i + 3);
    if (red !== 0 || green !== 0 || blue !== 0) {
      data[i + 3] = 255;
    }
  }
}

async function loadBufferByFile(window, file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
}

async function loadImageByUrl(window, url) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = url;
  });
}
