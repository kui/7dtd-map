import { PNG } from "pngjs/browser";
import { pngjsByBlob } from "./pngjs";

export async function loadSplatBitmapByFile(file: File): Promise<ImageBitmap> {
  console.time(`loadPng: ${file.name}`);
  const p = await pngjsByBlob(file);
  console.timeEnd(`loadPng: ${file.name}`);
  console.time(`renderSplat: ${file.name}`);
  const i = renderSplat(p);
  console.timeEnd(`renderSplat: ${file.name}`);
  return i;
}
export async function loadRadBitmapByFile(file: File): Promise<ImageBitmap> {
  const p = await pngjsByBlob(file);
  return renderRad(p);
}

// splatX.png should convert the pixels which:
//   * black to transparent
//   * other to non-transparent
function renderSplat(pngjs: PNG) {
  return render(pngjs, (indata, out) => {
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
function renderRad(pngjs: PNG) {
  return render(pngjs, (indata, out) => {
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

type ConvertImageBitmap = (indata: Uint8Array, outData: Uint8ClampedArray) => void;

function render({ data, height, width }: PNG, copyFunction: ConvertImageBitmap) {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw Error("Unexpected error: Canvas context not found");
  const imageData = context.getImageData(0, 0, width, height);
  copyFunction(data, imageData.data);
  context.putImageData(imageData, 0, 0);
  return createImageBitmap(canvas);
}
