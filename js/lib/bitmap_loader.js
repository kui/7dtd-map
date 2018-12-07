export async function loadBitmapByUrl(window, url) {
  const image = await loadImageByUrl(window, url);
  return window.createImageBitmap(image);
}
export async function loadBitmapByFile(window, file) {
  if (!file) return null;
  const dataURL = await loadDataURLByFile(window, file);
  return loadBitmapByUrl(window, dataURL);
}

async function loadDataURLByFile(window, file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
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
