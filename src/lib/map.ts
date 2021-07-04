import { FontFaceSet } from "css-font-loading-module";
import throttledInvoker from "./throttled-invoker";

const signChar = "✘";
const markChar = "🚩️";

declare const fonts: FontFaceSet;

export default class GameMap {
  biomesImg: ImageBitmap | null;
  brightness: string;
  canvas: OffscreenCanvas;
  fontFace: FontFace | null = null;
  throttledUpdater: () => Promise<void>;
  markerCoords: Coords | null;
  prefabs: HighlightedPrefab[];
  radImg: ImageBitmap | null;
  scale: number;
  showBiomes: boolean;
  showPrefabs: boolean;
  showRad: boolean;
  showSplat3: boolean;
  showSplat4: boolean;
  signSize: number;
  splat3Img: ImageBitmap | null;
  splat4Img: ImageBitmap | null;

  constructor(canvas: OffscreenCanvas) {
    this.canvas = canvas;
    this.showBiomes = true;
    this.showSplat3 = true;
    this.showSplat4 = true;
    this.showRad = true;
    this.showPrefabs = true;
    this.biomesImg = null;
    this.splat3Img = null;
    this.splat4Img = null;
    this.radImg = null;
    this.brightness = "100%";
    this.scale = 0.1;
    this.signSize = 200;
    this.prefabs = [];

    const fontFace = new FontFace("Noto Sans", "url(NotoEmoji-Regular.ttf)");
    fontFace.load().then((ff) => {
      this.fontFace = ff;
      fonts.add(ff);
    });
    this.markerCoords = null;

    this.throttledUpdater = throttledInvoker(() => this.updateImmediately());
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

  async updateImmediately(): Promise<void> {
    if (!this.biomesImg && !this.splat3Img && !this.splat4Img) {
      this.canvas.width = this.canvas.height = 0;
      return;
    }

    this.canvas.width = this.width * this.scale;
    this.canvas.height = this.height * this.scale;

    const context = this.canvas.getContext("2d");
    if (!context) return;
    context.scale(this.scale, this.scale);
    context.filter = `brightness(${this.brightness})`;
    if (this.biomesImg && this.showBiomes) {
      context.drawImage(this.biomesImg, 0, 0, this.width, this.height);
    }
    if (this.splat3Img && this.showSplat3) {
      context.drawImage(this.splat3Img, 0, 0, this.width, this.height);
    }
    if (this.splat4Img && this.showSplat4) {
      context.drawImage(this.splat4Img, 0, 0, this.width, this.height);
    }
    context.filter = "none";
    if (this.radImg && this.showRad) {
      context.imageSmoothingEnabled = false;
      context.drawImage(this.radImg, 0, 0, this.width, this.height);
      context.imageSmoothingEnabled = true;
    }
    if (this.showPrefabs) {
      drawPrefabs(this, context);
    }
    if (this.markerCoords) {
      drawMark(this, context);
    }
  }
}

function drawPrefabs(map: GameMap, ctx: OffscreenCanvasRenderingContext2D) {
  ctx.font = `${map.signSize}px ${map.fontFace?.family ?? ""}`;
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const offsetX = map.width / 2;
  const offsetY = map.height / 2;

  const charOffsetX = Math.round(map.signSize * 0.01);
  const charOffsetY = Math.round(map.signSize * 0.05);

  // Inverted iteration to overwrite signs by higher order prefabs
  for (let i = map.prefabs.length - 1; i >= 0; i -= 1) {
    const prefab = map.prefabs[i];
    const x = offsetX + prefab.x + charOffsetX;
    // prefab vertical positions are inverted for canvas coodinates
    const z = offsetY - prefab.z + charOffsetY;
    putText(ctx, { text: signChar, x, z, size: map.signSize });
  }
}

function drawMark(map: GameMap, ctx: OffscreenCanvasRenderingContext2D) {
  if (!map.markerCoords) return;

  ctx.font = `${map.signSize}px ${map.fontFace?.family ?? ""}`;
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const offsetX = map.width / 2;
  const offsetY = map.height / 2;
  const charOffsetX = -1 * Math.round(map.signSize * 0.32);
  const charOffsetY = -1 * Math.round(map.signSize * 0.1);

  const x = offsetX + map.markerCoords.x + charOffsetX;
  // prefab vertical positions are inverted for canvas coodinates
  const z = offsetY - map.markerCoords.z + charOffsetY;

  putText(ctx, { text: markChar, x, z, size: map.signSize });
  ctx.strokeText(markChar, x, z);
  ctx.fillText(markChar, x, z);
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
