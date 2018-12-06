export default async function loadBitmap(window, file) {
  if (!file) return null;
  const dataURL = await loadDataURLByFile(window, file);
  const image = await loadImageByDataURL(window, dataURL);
  return window.createImageBitmap(image);
}

async function loadDataURLByFile(window, file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function loadImageByDataURL(window, dataURL) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = dataURL;
  });
}
