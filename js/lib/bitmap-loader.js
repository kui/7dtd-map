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
