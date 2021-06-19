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
  return renderSplat(window, p);
}
export async function loadSplatBitmapByFile(window, file) {
  const p = await loadPngJsByBlob(window, file);
  return renderSplat(window, p);
}

export async function loadRadBitmapByFile(window, file) {
  const p = await loadPngJsByBlob(window, file);
  return renderRad(window, p);
}
export async function loadRadBitmapByUrl(window, url) {
  const p = await loadPngJsByUrl(window, url);
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
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, width, height);
  copyFunction(data, imageData.data)
  context.putImageData(imageData, 0, 0);
  return window.createImageBitmap(canvas);
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
