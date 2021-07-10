import { ImageBitmapHolder } from "./image-bitmap-holder";
import throttledInvoker from "./throttled-invoker";
import { gameMapSize } from "./utils";

const signChar = "✘";
const markChar = "🚩️";

export default class MapRenderer {
  brightness = "100%";
  markerCoords: GameCoords | null = null;
  scale = 0.1;
  showPrefabs = true;
  prefabs: HighlightedPrefab[] = [];
  signSize = 200;
  signAlpha = 1;
  biomesAlpha = 1;
  splat3Alpha = 1;
  splat4Alpha = 1;
  radAlpha = 1;

  canvas: OffscreenCanvas;
  throttledUpdater = throttledInvoker(() => this.updateImmediately());

  private _biomesImg: ImageBitmapHolder | null = null;
  private _splat3Img: ImageBitmapHolder | null = null;
  private _splat4Img: ImageBitmapHolder | null = null;
  private _radImg: ImageBitmapHolder | null = null;
  private fontFace: FontFace;

  constructor(canvas: OffscreenCanvas, fontFace: FontFace) {
    this.canvas = canvas;
    this.fontFace = fontFace;
  }

  set biomesImg(img: ImageBitmap | PngBlob | null) {
    this._biomesImg = img ? new ImageBitmapHolder("biomes", img) : null;
  }
  set splat3Img(img: ImageBitmap | PngBlob | null) {
    this._splat3Img = img ? new ImageBitmapHolder("splat3", img) : null;
  }
  set splat4Img(img: ImageBitmap | PngBlob | null) {
    this._splat4Img = img ? new ImageBitmapHolder("splat4", img) : null;
  }
  set radImg(img: ImageBitmap | PngBlob | null) {
    this._radImg = img ? new ImageBitmapHolder("rad", img) : null;
  }

  async size(): Promise<GameMapSize> {
    const rects = await Promise.all([this._biomesImg?.get(), this._splat3Img?.get(), this._splat4Img?.get()]);
    return gameMapSize({
      width: Math.max(...rects.map((r) => r?.width ?? 0)),
      height: Math.max(...rects.map((r) => r?.height ?? 0)),
    });
  }

  async update(): Promise<void> {
    await this.throttledUpdater();
  }

  private isBlank(): boolean {
    return !this._biomesImg && !this._splat3Img && !this._splat4Img;
  }

  async updateImmediately(): Promise<void> {
    console.time("Map Update");

    if (this.isBlank()) {
      this.canvas.width = 1;
      this.canvas.height = 1;
      return;
    }

    const { width, height } = await this.size();

    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;

    const context = this.canvas.getContext("2d");
    if (!context) return;
    context.scale(this.scale, this.scale);
    context.filter = `brightness(${this.brightness})`;

    if (this._biomesImg && this.biomesAlpha !== 0) {
      context.globalAlpha = this.biomesAlpha;
      context.drawImage(await this._biomesImg.get(), 0, 0, width, height);
    }
    if (this._splat3Img && this.splat3Alpha !== 0) {
      context.globalAlpha = this.splat3Alpha;
      context.drawImage(await this._splat3Img.get(), 0, 0, width, height);
    }
    if (this._splat4Img && this.splat4Alpha !== 0) {
      context.globalAlpha = this.splat4Alpha;
      context.drawImage(await this._splat4Img.get(), 0, 0, width, height);
    }

    context.filter = "none";
    if (this._radImg && this.radAlpha !== 0) {
      context.globalAlpha = this.radAlpha;
      context.imageSmoothingEnabled = false;
      context.drawImage(await this._radImg.get(), 0, 0, width, height);
      context.imageSmoothingEnabled = true;
    }

    context.globalAlpha = this.signAlpha;
    if (this.showPrefabs) {
      this.drawPrefabs(context, width, height);
    }
    if (this.markerCoords) {
      this.drawMark(context, width, height);
    }
    console.timeEnd("Map Update");
  }

  private drawPrefabs(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number) {
    ctx.font = `${this.signSize}px ${this.fontFace?.family ?? ""}`;
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const offsetX = width / 2;
    const offsetY = height / 2;

    const charOffsetX = Math.round(this.signSize * 0.01);
    const charOffsetY = Math.round(this.signSize * 0.05);

    // Inverted iteration to overwrite signs by higher order prefabs
    for (let i = this.prefabs.length - 1; i >= 0; i -= 1) {
      const prefab = this.prefabs[i];
      const x = offsetX + prefab.x + charOffsetX;
      // prefab vertical positions are inverted for canvas coodinates
      const z = offsetY - prefab.z + charOffsetY;
      putText(ctx, { text: signChar, x, z, size: this.signSize });
    }
  }

  private drawMark(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number) {
    if (!this.markerCoords) return;

    ctx.font = `${this.signSize}px ${this.fontFace?.family ?? ""}`;
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const offsetX = width / 2;
    const offsetY = height / 2;
    const charOffsetX = -1 * Math.round(this.signSize * 0.32);
    const charOffsetY = -1 * Math.round(this.signSize * 0.1);

    const x = offsetX + this.markerCoords.x + charOffsetX;
    const z = offsetY - this.markerCoords.z + charOffsetY;

    putText(ctx, { text: markChar, x, z, size: this.signSize });
    ctx.strokeText(markChar, x, z);
    ctx.fillText(markChar, x, z);
  }
}

interface MapSign {
  text: string;
  x: number;
  z: number;
  size: number;
}

function putText(ctx: OffscreenCanvasRenderingContext2D, { text, x, z, size }: MapSign) {
  ctx.lineWidth = Math.round(size * 0.2);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
  ctx.strokeText(text, x, z);

  ctx.lineWidth = Math.round(size * 0.1);
  ctx.strokeStyle = "white";
  ctx.strokeText(text, x, z);

  ctx.fillText(text, x, z);
}
