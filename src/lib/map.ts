import throttledInvoker from "./throttled-invoker";

const signChar = "✘";
const markChar = "🚩️";

export default class GameMap {
  biomesAlpha = 1;
  splat3Alpha = 1;
  splat4Alpha = 1;
  radAlpha = 0.5;
  signAlpha = 1;
  brightness = "100%";
  scale = 0.1;
  showPrefabs = true;
  signSize = 200;
  prefabs: HighlightedPrefab[] = [];

  biomesImg: ImageBitmap | null = null;
  splat3Img: ImageBitmap | null = null;
  splat4Img: ImageBitmap | null = null;
  radImg: ImageBitmap | null = null;

  canvas: OffscreenCanvas;
  markerCoords: Coords | null = null;
  private fontFace: FontFace;

  private throttledUpdater = throttledInvoker(() => this.updateImmediately());

  constructor(canvas: OffscreenCanvas, fontFace: FontFace) {
    this.canvas = canvas;
    this.fontFace = fontFace;
  }

  get width(): number {
    return Math.max(this.biomesImg?.width ?? 0, this.splat3Img?.width ?? 0, this.splat4Img?.width ?? 0);
  }

  get height(): number {
    return Math.max(this.biomesImg?.height ?? 0, this.splat3Img?.height ?? 0, this.splat4Img?.height ?? 0);
  }

  async update(): Promise<void> {
    console.time("Map Update");
    await this.throttledUpdater();
    console.timeEnd("Map Update");
  }

  private isBlank(): boolean {
    return !this.biomesImg && !this.splat3Img && !this.splat4Img;
  }

  async updateImmediately(): Promise<void> {
    if (this.isBlank()) {
      this.canvas.width = 1;
      this.canvas.height = 1;
      return;
    }

    this.canvas.width = this.width * this.scale;
    this.canvas.height = this.height * this.scale;

    const context = this.canvas.getContext("2d");
    if (!context) return;
    context.scale(this.scale, this.scale);
    context.filter = `brightness(${this.brightness})`;

    if (this.biomesImg && this.biomesAlpha !== 0) {
      context.globalAlpha = this.biomesAlpha;
      context.drawImage(this.biomesImg, 0, 0, this.width, this.height);
    }

    if (this.splat3Img && this.splat3Alpha !== 0) {
      context.globalAlpha = this.splat3Alpha;
      context.drawImage(this.splat3Img, 0, 0, this.width, this.height);
    }
    if (this.splat4Img && this.splat4Alpha !== 0) {
      context.globalAlpha = this.splat4Alpha;
      context.drawImage(this.splat4Img, 0, 0, this.width, this.height);
    }

    context.filter = "none";
    if (this.radImg && this.radAlpha !== 0) {
      context.globalAlpha = this.radAlpha;
      context.imageSmoothingEnabled = false;
      context.drawImage(this.radImg, 0, 0, this.width, this.height);
      context.imageSmoothingEnabled = true;
    }

    context.globalAlpha = this.signAlpha;
    if (this.showPrefabs) {
      this.drawPrefabs(context);
    }
    if (this.markerCoords) {
      this.drawMark(context);
    }
  }

  private drawPrefabs(ctx: OffscreenCanvasRenderingContext2D) {
    ctx.font = `${this.signSize}px ${this.fontFace.family}`;
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const offsetX = this.width / 2;
    const offsetY = this.height / 2;

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

  private drawMark(ctx: OffscreenCanvasRenderingContext2D) {
    if (!this.markerCoords) return;

    ctx.font = `${this.signSize}px ${this.fontFace.family}`;
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const offsetX = this.width / 2;
    const offsetY = this.height / 2;
    const charOffsetX = -1 * Math.round(this.signSize * 0.32);
    const charOffsetY = -1 * Math.round(this.signSize * 0.1);

    const x = offsetX + this.markerCoords.x + charOffsetX;
    // prefab vertical positions are inverted for canvas coodinates
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
