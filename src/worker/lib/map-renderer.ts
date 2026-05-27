import type {
  GameCoords,
  GameMapSize,
  HighlightedPrefab,
} from "../../types/7dtdmap.ts";
import { throttledInvoker } from "../../lib/throttled-invoker.ts";
import { gameMapSize } from "../../lib/utils.ts";
import * as storage from "../../lib/storage.ts";
import * as mapFiles from "../../../lib/map-files.ts";

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
  #fontFamilies: FontFamilies;

  #nativeSizes = new Map<
    mapFiles.MapFileName,
    { width: number; height: number }
  >();

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
      this.#nativeSizes.delete(fileName);
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
      mapFiles.MAP_IMAGE_FILE_NAMES.map((f) => this.#nativeSize(f)),
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

    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Failed to get 2d context");

    // Compose the base map (which may re-decode at the new size) before
    // touching the visible canvas. Resizing the canvas clears it, so doing it
    // ahead of an await would expose a blank canvas and cause a flash while
    // scaling; instead we resize and redraw in one synchronous pass below.
    const base = await this.#composeBase(canvasWidth, canvasHeight);
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
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

    const canvas = this.#composite ?? new OffscreenCanvas(width, height);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Failed to get 2d context");

    const [biomes, splat3, splat4, rad] = await Promise.all(
      mapFiles.MAP_IMAGE_FILE_NAMES.map((f) => this.#decode(f, width, height)),
    );

    try {
      context.clearRect(0, 0, width, height);
      context.filter = `brightness(${this.brightness})`;

      if (biomes && this.biomesAlpha !== 0) {
        context.globalAlpha = this.biomesAlpha;
        context.drawImage(biomes, 0, 0);
      }
      if (splat3 && this.splat3Alpha !== 0) {
        context.globalAlpha = this.splat3Alpha;
        context.drawImage(splat3, 0, 0);
      }
      if (splat4 && this.splat4Alpha !== 0) {
        context.globalAlpha = this.splat4Alpha;
        context.drawImage(splat4, 0, 0);
      }
      context.filter = "none";
      if (rad && this.radAlpha !== 0) {
        context.globalAlpha = this.radAlpha;
        context.drawImage(rad, 0, 0);
      }
    } finally {
      // Only the composite is cached; release the per-layer bitmaps.
      for (const bitmap of [biomes, splat3, splat4, rad]) bitmap?.close();
    }

    this.#composite = canvas;
    this.#compositeKey = key;
    return canvas;
  }

  private drawPrefabs(
    context: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    context.font = `${this.signSize.toString()}px '${
      this.#fontFamilies[SIGN_CHAR]
    }'`;
    context.fillStyle = "red";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const offsetX = width / 2;
    const offsetY = height / 2;

    const charOffsetX = Math.round(this.signSize * 0.01);
    const charOffsetY = Math.round(this.signSize * 0.05);

    // Inverted iteration to overwrite signs by higher order prefabs
    for (const prefab of this.prefabs.toReversed()) {
      const x = offsetX + prefab.x + charOffsetX;
      // prefab vertical positions are inverted for canvas coodinates
      const z = offsetY - prefab.z + charOffsetY;
      putText(context, { text: SIGN_CHAR, x, z, size: this.signSize });
    }
  }

  private drawMark(
    context: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (!this.markerCoords) return;

    context.font = `${this.signSize.toString()}px '${
      this.#fontFamilies[MARK_CHAR]
    }'`;
    context.fillStyle = "red";
    context.textAlign = "left";
    context.textBaseline = "alphabetic";

    const offsetX = width / 2;
    const offsetY = height / 2;
    const charOffsetX = -1 * Math.round(this.signSize * 0.32);
    const charOffsetY = -1 * Math.round(this.signSize * 0.1);

    const x = offsetX + this.markerCoords.x + charOffsetX;
    const z = offsetY - this.markerCoords.z + charOffsetY;

    putText(context, { text: MARK_CHAR, x, z, size: this.signSize });
  }

  async #nativeSize(
    fileName: mapFiles.MapFileName,
  ): Promise<{ width: number; height: number } | null> {
    const cached = this.#nativeSizes.get(fileName);
    if (cached) return cached;
    const file = await this.#getFile(fileName);
    if (!file) return null;
    const size = await readPngSize(file);
    this.#nativeSizes.set(fileName, size);
    return size;
  }

  async #decode(
    fileName: mapFiles.MapFileName,
    width: number,
    height: number,
  ): Promise<ImageBitmap | null> {
    if (width <= 0 || height <= 0) return null;
    const file = await this.#getFile(fileName);
    if (!file) return null;
    console.time(`Loading image ${fileName}`);
    try {
      const result = await createImageBitmap(file, {
        resizeWidth: width,
        resizeHeight: height,
        resizeQuality: "high",
      });
      console.log("Loaded image", fileName, width, height);
      return result;
    } catch (e) {
      const extra = `(size: ${file.size} bytes, type: ${file.type})`;
      throw new Error(`Failed to decode image: ${fileName} ${extra}`, {
        cause: e,
      });
    } finally {
      console.timeEnd(`Loading image ${fileName}`);
    }
  }

  async #getFile(fileName: mapFiles.MapFileName): Promise<File | null> {
    const workspace = await storage.workspaceDir();
    return workspace.get(fileName);
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
  context: OffscreenCanvasRenderingContext2D,
  { text, x, z, size }: MapSign,
) {
  context.lineWidth = Math.round(size * 0.2);
  context.strokeStyle = "rgba(0, 0, 0, 0.8)";
  context.strokeText(text, x, z);

  context.lineWidth = Math.round(size * 0.1);
  context.strokeStyle = "white";
  context.strokeText(text, x, z);

  context.fillText(text, x, z);
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
