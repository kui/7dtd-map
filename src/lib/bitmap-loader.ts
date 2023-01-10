import { Png, PngParser } from "./png-parser";

// Workaround for weird semver of typescript :(
// See https://github.com/microsoft/TypeScript/issues/45745
declare function createImageBitmap(image: OffscreenCanvas, options?: ImageBitmapOptions): Promise<ImageBitmap>;

export class ImageBitmapLoader {
  private pngParser: PngParser;

  constructor(workerFactory: () => Worker) {
    this.pngParser = new PngParser(workerFactory);
  }

  async loadSplat3(file: File): Promise<ImageBitmap> {
    return renderSplat3(await this.pngParser.parse(file));
  }

  async loadSplat4(file: File): Promise<ImageBitmap> {
    return renderSplat4(await this.pngParser.parse(file));
  }

  async loadRad(file: File): Promise<ImageBitmap> {
    return renderRad(await this.pngParser.parse(file));
  }
}

// splatX.png should convert the pixels which:
//   * black to transparent
//   * other to non-transparent
function renderSplat3(pngjs: Png) {
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

// splat4.png should convert the pixels which:
//   * black to 100% transparent
//   * other to non-transparent
//   * swap green and blue
function renderSplat4(pngjs: Png) {
  return render(pngjs, (indata, out) => {
    for (let i = 0; i < indata.length; i += 4) {
      out[i] = indata[i];
      out[i + 1] = indata[i + 2];
      out[i + 2] = indata[i + 1];
      if (indata[i] === 0 && indata[i + 1] === 0 && indata[i + 2] === 0) {
        out[i + 3] = 0;
      } else {
        out[i + 3] = 255;
      }
    }
  });
}

// radioation.png should convert the pixels which:
//   * red to non-transparent
//   * other to transparent
function renderRad(pngjs: Png) {
  return render(pngjs, (indata, out) => {
    for (let i = 0; i < indata.length; i += 4) {
      out[i] = indata[i];
      out[i + 1] = 0;
      out[i + 2] = 0;
      if (indata[i] !== 0) {
        out[i + 3] = 255;
      } else {
        out[i + 3] = 0;
      }
    }
  });
}

type ConvertImageBitmap = (indata: Uint8Array, outData: Uint8ClampedArray) => void;

function render({ data, height, width }: Png, copyFunction: ConvertImageBitmap) {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw Error("Unexpected error: Canvas context not found");
  const imageData = context.getImageData(0, 0, width, height);
  copyFunction(new Uint8Array(data), imageData.data);
  context.putImageData(imageData, 0, 0);
  return createImageBitmap(canvas);
}
