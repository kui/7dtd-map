import { throttledInvoker } from "./throttled-invoker.ts";
import { gameMapSize } from "./utils.ts";
import * as storage from "./storage.ts";
import * as mapFiles from "../../lib/map-files.ts";
import { CacheHolder } from "./cache-holder.ts";

const SIGN_CHAR = "✘";
const MARK_CHAR = "🚩";

interface FontFamilies {
  [SIGN_CHAR]: string;
  [MARK_CHAR]: string;
}

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
  #mapSize = gameMapSize({ width: 0, height: 0 });

  #biomesImage = new BitmapHolder("biomes.png");
  #splat3Image = new BitmapHolder("splat3.png");
  #splat4Image = new BitmapHolder("splat4.png");
  #radImage = new BitmapHolder("radiation.png");
  #imageFiles = [
    this.#biomesImage,
    this.#splat3Image,
    this.#splat4Image,
    this.#radImage,
  ] as const;
  #fontFamilies: FontFamilies;

  constructor(canvas: OffscreenCanvas, fontFamilies: FontFamilies) {
    this.canvas = canvas;
    this.#fontFamilies = fontFamilies;
  }

  set invalidate(
    fileNames: ("biomes.png" | "splat3.png" | "splat4.png" | "radiation.png")[],
  ) {
    for (const fileName of fileNames) {
      switch (fileName) {
        case "biomes.png":
          this.#biomesImage.invalidate();
          break;
        case "splat3.png":
          this.#splat3Image.invalidate();
          break;
        case "splat4.png":
          this.#splat4Image.invalidate();
          break;
        case "radiation.png":
          this.#radImage.invalidate();
          break;
        default:
          throw new Error(`Invalid file name: ${String(fileName)}`);
      }
    }
  }

  update = throttledInvoker(async () => {
    console.log("MapUpdate");
    console.time("MapUpdate");
    await this.#updateImmediately();
    console.timeEnd("MapUpdate");
  });

  async #updateImmediately(): Promise<void> {
    const [biomes, splat3, splat4, rad] = await Promise.all(
      this.#imageFiles.map((i) => i.get()),
    );

    const { width, height } = mapSize(biomes, splat3, splat4, rad);
    this.#mapSize.width = width;
    this.#mapSize.height = height;
    if (width === 0 || height === 0) {
      this.canvas.width = 1;
      this.canvas.height = 1;
      return;
    }

    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;

    const context = this.canvas.getContext("2d");
    if (!context) return;
    context.imageSmoothingEnabled = false;
    context.scale(this.scale, this.scale);
    context.filter = `brightness(${this.brightness})`;

    if (biomes && this.biomesAlpha !== 0) {
      context.globalAlpha = this.biomesAlpha;
      context.drawImage(biomes, 0, 0, width, height);
    }
    context.imageSmoothingEnabled = true;
    if (splat3 && this.splat3Alpha !== 0) {
      context.globalAlpha = this.splat3Alpha;
      context.drawImage(splat3, 0, 0, width, height);
    }
    if (splat4 && this.splat4Alpha !== 0) {
      context.globalAlpha = this.splat4Alpha;
      context.drawImage(splat4, 0, 0, width, height);
    }
    context.imageSmoothingEnabled = false;

    context.filter = "none";
    if (rad && this.radAlpha !== 0) {
      context.globalAlpha = this.radAlpha;
      context.drawImage(rad, 0, 0, width, height);
    }

    context.globalAlpha = this.signAlpha;
    if (this.showPrefabs) {
      this.drawPrefabs(context, width, height);
    }
    if (this.markerCoords) {
      this.drawMark(context, width, height);
    }
  }

  private drawPrefabs(
    ctx: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    ctx.font = `${this.signSize.toString()}px '${this.#fontFamilies[SIGN_CHAR]}'`;
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const offsetX = width / 2;
    const offsetY = height / 2;

    const charOffsetX = Math.round(this.signSize * 0.01);
    const charOffsetY = Math.round(this.signSize * 0.05);

    // Inverted iteration to overwrite signs by higher order prefabs
    for (const prefab of this.prefabs.toReversed()) {
      const x = offsetX + prefab.x + charOffsetX;
      // prefab vertical positions are inverted for canvas coodinates
      const z = offsetY - prefab.z + charOffsetY;
      putText(ctx, { text: SIGN_CHAR, x, z, size: this.signSize });
    }
  }

  private drawMark(
    ctx: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (!this.markerCoords) return;

    ctx.font = `${this.signSize.toString()}px '${this.#fontFamilies[MARK_CHAR]}'`;
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const offsetX = width / 2;
    const offsetY = height / 2;
    const charOffsetX = -1 * Math.round(this.signSize * 0.32);
    const charOffsetY = -1 * Math.round(this.signSize * 0.1);

    const x = offsetX + this.markerCoords.x + charOffsetX;
    const z = offsetY - this.markerCoords.z + charOffsetY;

    putText(ctx, { text: MARK_CHAR, x, z, size: this.signSize });
  }

  size(): GameMapSize {
    return this.#mapSize;
  }
}

function mapSize(...images: (ImageBitmap | null | undefined)[]): GameMapSize {
  return gameMapSize({
    width: Math.max(...images.map((i) => i?.width ?? 0)),
    height: Math.max(...images.map((i) => i?.height ?? 0)),
  });
}

interface MapSign {
  text: string;
  x: number;
  z: number;
  size: number;
}

function putText(
  ctx: OffscreenCanvasRenderingContext2D,
  { text, x, z, size }: MapSign,
) {
  ctx.lineWidth = Math.round(size * 0.2);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
  ctx.strokeText(text, x, z);

  ctx.lineWidth = Math.round(size * 0.1);
  ctx.strokeStyle = "white";
  ctx.strokeText(text, x, z);

  ctx.fillText(text, x, z);
}

class BitmapHolder extends CacheHolder<ImageBitmap | null> {
  constructor(readonly fileName: mapFiles.MapFileName) {
    super(
      async () => {
        console.log("Loading image", fileName);
        const workspace = await storage.workspaceDir();
        const file = await workspace.get(fileName);
        try {
          return file ? await createImageBitmap(file) : null;
        } finally {
          console.log("Loaded image", fileName);
        }
      },
      (img) => img?.close(),
    );
  }
}
