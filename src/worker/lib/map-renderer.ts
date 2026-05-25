import type {
  GameCoords,
  GameMapSize,
  HighlightedPrefab,
} from "../../types/7dtdmap.ts";
import { throttledInvoker } from "../../lib/throttled-invoker.ts";
import { gameMapSize } from "../../lib/utils.ts";
import * as storage from "../../lib/storage.ts";
import * as mapFiles from "../../../lib/map-files.ts";
import { CacheHolder } from "../../lib/cache-holder.ts";

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

  #biomesImage = new ScaledImageHolder("biomes.png");
  #splat3Image = new ScaledImageHolder("splat3.png");
  #splat4Image = new ScaledImageHolder("splat4.png");
  #radImage = new ScaledImageHolder("radiation.png");
  #imageFiles = [
    this.#biomesImage,
    this.#splat3Image,
    this.#splat4Image,
    this.#radImage,
  ] as const;
  #fontFamilies: FontFamilies;

  // Composited base map (layers + brightness + per-layer alpha) cached so that
  // prefab/marker-only updates can skip recompositing.
  #composite: OffscreenCanvas | null = null;
  #compositeKey: string | null = null;
  // Bumped whenever a source image is invalidated, to invalidate the composite.
  #generation = 0;

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
    this.#generation++;
  }

  update = throttledInvoker(async () => {
    console.log("MapUpdate");
    console.time("MapUpdate");
    await this.#updateImmediately();
    console.timeEnd("MapUpdate");
  });

  async #updateImmediately(): Promise<void> {
    const sizes = await Promise.all(
      this.#imageFiles.map((i) => i.nativeSize()),
    );
    const { width, height } = mapSize(...sizes);
    this.#mapSize.width = width;
    this.#mapSize.height = height;
    if (width === 0 || height === 0) {
      this.canvas.width = 1;
      this.canvas.height = 1;
      return;
    }

    const canvasWidth = Math.max(1, Math.round(width * this.scale));
    const canvasHeight = Math.max(1, Math.round(height * this.scale));
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    const context = this.canvas.getContext("2d");
    if (!context) return;

    const base = await this.#composeBase(canvasWidth, canvasHeight);
    context.imageSmoothingEnabled = false;
    if (base) context.drawImage(base, 0, 0);

    // Overlays are drawn in native map coordinates, scaled down to the canvas.
    context.save();
    context.scale(this.scale, this.scale);
    context.globalAlpha = this.signAlpha;
    if (this.showPrefabs) {
      this.drawPrefabs(context, width, height);
    }
    if (this.markerCoords) {
      this.drawMark(context, width, height);
    }
    context.restore();
  }

  /**
   * Composite the base layers (with brightness and per-layer alpha) onto a
   * cached offscreen canvas at the current display resolution. The cache is
   * reused as long as the display size, brightness, alphas, and source images
   * are unchanged, so prefab/marker-only updates avoid re-decoding/compositing.
   */
  async #composeBase(
    width: number,
    height: number,
  ): Promise<OffscreenCanvas | null> {
    const key = [
      width,
      height,
      this.brightness,
      this.biomesAlpha,
      this.splat3Alpha,
      this.splat4Alpha,
      this.radAlpha,
      this.#generation,
    ].join(":");
    if (
      this.#composite &&
      this.#compositeKey === key &&
      this.#composite.width === width &&
      this.#composite.height === height
    ) {
      return this.#composite;
    }

    const [biomes, splat3, splat4, rad] = await Promise.all([
      this.#biomesImage.get(width, height),
      this.#splat3Image.get(width, height),
      this.#splat4Image.get(width, height),
      this.#radImage.get(width, height),
    ]);

    const canvas = this.#composite ?? new OffscreenCanvas(width, height);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, width, height);
    ctx.filter = `brightness(${this.brightness})`;

    if (biomes && this.biomesAlpha !== 0) {
      ctx.globalAlpha = this.biomesAlpha;
      ctx.drawImage(biomes, 0, 0);
    }
    if (splat3 && this.splat3Alpha !== 0) {
      ctx.globalAlpha = this.splat3Alpha;
      ctx.drawImage(splat3, 0, 0);
    }
    if (splat4 && this.splat4Alpha !== 0) {
      ctx.globalAlpha = this.splat4Alpha;
      ctx.drawImage(splat4, 0, 0);
    }
    ctx.filter = "none";
    if (rad && this.radAlpha !== 0) {
      ctx.globalAlpha = this.radAlpha;
      ctx.drawImage(rad, 0, 0);
    }

    this.#composite = canvas;
    this.#compositeKey = key;
    return canvas;
  }

  private drawPrefabs(
    ctx: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    ctx.font = `${this.signSize.toString()}px '${
      this.#fontFamilies[SIGN_CHAR]
    }'`;
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

    ctx.font = `${this.signSize.toString()}px '${
      this.#fontFamilies[MARK_CHAR]
    }'`;
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

function mapSize(
  ...sizes: ({ width: number; height: number } | null | undefined)[]
): GameMapSize {
  return gameMapSize({
    width: Math.max(0, ...sizes.map((s) => s?.width ?? 0)),
    height: Math.max(0, ...sizes.map((s) => s?.height ?? 0)),
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

/**
 * Holds a source map image, decoding it lazily at the requested display
 * resolution rather than at full resolution. The decoded bitmap is cached
 * (with TTL) and re-decoded only when the requested size changes or the
 * source image is invalidated, keeping memory proportional to the displayed
 * size instead of the native image size.
 */
class ScaledImageHolder {
  #targetWidth = 0;
  #targetHeight = 0;
  #nativeSize: { width: number; height: number } | null = null;
  #holder: CacheHolder<ImageBitmap | null>;

  constructor(readonly fileName: mapFiles.MapFileName) {
    this.#holder = new CacheHolder<ImageBitmap | null>(
      () => this.#decode(),
      (img) => img?.close(),
    );
  }

  invalidate() {
    this.#nativeSize = null;
    this.#holder.invalidate();
  }

  async nativeSize(): Promise<{ width: number; height: number } | null> {
    if (this.#nativeSize) return this.#nativeSize;
    const file = await this.#getFile();
    if (!file) return null;
    this.#nativeSize = await readPngSize(file);
    return this.#nativeSize;
  }

  get(width: number, height: number): Promise<ImageBitmap | null> {
    if (width !== this.#targetWidth || height !== this.#targetHeight) {
      this.#targetWidth = width;
      this.#targetHeight = height;
      this.#holder.invalidate();
    }
    return this.#holder.get();
  }

  async #getFile(): Promise<File | null> {
    const workspace = await storage.workspaceDir();
    return workspace.get(this.fileName);
  }

  async #decode(): Promise<ImageBitmap | null> {
    const width = this.#targetWidth;
    const height = this.#targetHeight;
    if (width <= 0 || height <= 0) return null;
    console.time(`Loading image ${this.fileName}`);
    const file = await this.#getFile();
    try {
      if (!file) return null;
      const result = await createImageBitmap(file, {
        resizeWidth: width,
        resizeHeight: height,
        resizeQuality: "high",
      });
      console.log("Loaded image", this.fileName, width, height);
      return result;
    } catch (e) {
      const extra = file
        ? `(size: ${file.size} bytes, type: ${file.type})`
        : "(file not found)";
      throw new Error(`Failed to decode image: ${this.fileName} ${extra}`, {
        cause: e,
      });
    } finally {
      console.timeEnd(`Loading image ${this.fileName}`);
    }
  }
}

/**
 * Read width/height from a PNG's IHDR chunk without decoding pixels.
 * Layout: 8-byte signature, 4-byte chunk length, 4-byte "IHDR" type,
 * then 4-byte width and 4-byte height (big-endian).
 */
async function readPngSize(
  file: Blob,
): Promise<{ width: number; height: number }> {
  const header = await file.slice(0, 24).arrayBuffer();
  const view = new DataView(header);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}
