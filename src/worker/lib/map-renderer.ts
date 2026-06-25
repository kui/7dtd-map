import type {
  DistrictColors,
  GameCoords,
  GameMapSize,
  HighlightedPrefab,
  Prefab,
  PrefabDensityScores,
  PrefabMeshSizes,
} from "../../types/7dtdmap.ts";
import { throttledInvoker } from "../../lib/throttled-invoker.ts";
import { gameMapSize } from "../../lib/utils.ts";
import { CacheHolder } from "../../lib/cache-holder.ts";
import * as storage from "../../lib/storage.ts";
import * as mapFiles from "../../../lib/map-files.ts";

const SIGN_CHAR = "✘";
const MARK_CHAR = "🚩";
// Edge length of an `rwg_tile_*` prefab in game blocks.
const TILE_SIZE = 150;

interface TileIndex {
  offsetX: number;
  offsetZ: number;
  // Key: `${gridX},${gridZ}` → district name (extracted from tile filename).
  cells: Map<string, string>;
}

interface FontFamilies {
  [SIGN_CHAR]: string;
  [MARK_CHAR]: string;
}

export default class MapRenderer {
  brightness = "100%";
  markerCoords: GameCoords | null = null;
  scale = 0.1;
  // Filtered subset emitted by the prefabs-filter worker — drives the ✘
  // sign overlay and reflects the user's active search/difficulty filter.
  filteredPrefabs: HighlightedPrefab[] = [];
  // Full decoration list straight from prefabs.xml — drives the footprint
  // overlay and tile-district lookup regardless of the filter state.
  allPrefabs: Prefab[] = [];
  // Cache of the tile index keyed by the most recent `allPrefabs` reference,
  // so the index is rebuilt only when the upstream array changes.
  #tileIndex: { source: Prefab[]; index: TileIndex } | null = null;
  #meshSizesHolder: CacheHolder<PrefabMeshSizes>;
  #densityScoresHolder: CacheHolder<PrefabDensityScores>;
  #districtColorsHolder: CacheHolder<DistrictColors>;
  signSize = 200;
  signAlpha = 1;
  prefabFootprintAlpha = 1;
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

  constructor(
    canvas: OffscreenCanvas,
    fontFamilies: FontFamilies,
    fetchMeshSizes: () => Promise<PrefabMeshSizes>,
    fetchDensityScores: () => Promise<PrefabDensityScores>,
    fetchDistrictColors: () => Promise<DistrictColors>,
  ) {
    this.canvas = canvas;
    this.#fontFamilies = fontFamilies;
    // Static tables fetched on demand inside the worker, mirroring the
    // CacheHolder usage in PrefabFilter. The deconstructor is a no-op
    // because nothing here owns external resources.
    const noop = () => {};
    this.#meshSizesHolder = new CacheHolder(fetchMeshSizes, noop);
    this.#densityScoresHolder = new CacheHolder(fetchDensityScores, noop);
    this.#districtColorsHolder = new CacheHolder(fetchDistrictColors, noop);
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

    // Static lookup tables are fetched lazily inside the worker. They are
    // resolved here in parallel with the base-map composition; the renderer
    // can defer the overlay until they're ready without blocking the
    // background layers.
    const [meshSizes, districtColors, densityScores] = await Promise.all([
      this.#meshSizesHolder.get(),
      this.#districtColorsHolder.get(),
      this.#densityScoresHolder.get(),
    ]);

    // Overlays are drawn in native map coordinates, scaled down to the canvas.
    context.save();
    context.scale(this.scale, this.scale);
    // Prefab footprints (independent of the active filter) are drawn first so
    // the sign markers for filtered prefabs sit on top of them.
    if (this.prefabFootprintAlpha > 0) {
      context.globalAlpha = this.prefabFootprintAlpha;
      this.#drawPrefabFootprints(
        context,
        width,
        height,
        meshSizes,
        densityScores,
        districtColors,
      );
    }
    context.globalAlpha = this.signAlpha;
    this.#drawPrefabs(context, width, height, meshSizes);
    if (this.markerCoords) {
      this.#drawMark(context, width, height);
    }
    context.restore();
  }

  // Draw each prefab as a rotated rectangle sized by PrefabSize. Drawn under
  // the ✘ marker so the filter highlight remains visible on top. Mirrors the
  // game's PrefabPreviewManager: skip `rwg_tile*` (the placement framework
  // itself) and `part_driveway*` (sub-parts that overlap their parent POI).
  // Per-POI colour matches the in-game preview: it comes from the tile that
  // contains the POI, with name- and DensityScore-based modifiers applied.
  #drawPrefabFootprints(
    context: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    meshSizes: PrefabMeshSizes,
    densityScores: PrefabDensityScores,
    districtColors: DistrictColors,
  ) {
    const offsetX = width / 2;
    const offsetY = height / 2;
    // Stroke widths are in game-block units (the renderer's current transform
    // scales them down to canvas pixels). 1 block ≈ 1 unit, so ~2 blocks of
    // stroke renders cleanly even at small zoom.
    const stroke = 2;

    context.lineWidth = stroke;

    const tileIndex = this.#getTileIndex();

    for (const prefab of this.allPrefabs) {
      if (
        prefab.name.includes("rwg_tile") ||
        prefab.name.includes("part_driveway")
      ) continue;
      const size = meshSizes[prefab.name];
      if (!size) continue;
      const [sx, sz] = size;
      // decoration.position is the SW corner of the rotated AABB, so for
      // 90°/270° rotations the world-aligned width/depth swap. No canvas
      // rotation is needed because the bounding box stays axis-aligned.
      const odd = ((prefab.rotation ?? 0) & 1) === 1;
      const w = odd ? sz : sx;
      const d = odd ? sx : sz;

      const cx = offsetX + prefab.x;
      // prefab vertical positions are inverted for canvas coordinates
      const cy = offsetY - prefab.z;

      const color = this.#footprintColor(
        prefab,
        tileIndex,
        densityScores,
        districtColors,
      );
      context.strokeStyle = color;
      context.fillStyle = withAlpha(color, 0.35);
      context.beginPath();
      context.rect(cx, cy - d, w, d);
      context.fill();
      context.stroke();
    }
  }

  // Tile prefabs are 150×150 axis-aligned blocks named `rwg_tile_<district>_*`
  // and their positions form a regular grid. The index keys each tile by its
  // grid cell so footprint lookups are O(1).
  #getTileIndex(): TileIndex {
    if (this.#tileIndex && this.#tileIndex.source === this.allPrefabs) {
      return this.#tileIndex.index;
    }
    const tiles: { x: number; z: number; district: string }[] = [];
    for (const p of this.allPrefabs) {
      const m = /^rwg_tile_([^_]+)_/.exec(p.name);
      if (!m) continue;
      tiles.push({ x: p.x, z: p.z, district: m[1] });
    }
    // Tiles align on a 150-block lattice but the lattice origin is the world
    // centre offset, not a multiple of 150 in world coords. Pick any tile to
    // derive the offset (mod 150 normalised to [0, 150)).
    const mod = (n: number) => ((n % TILE_SIZE) + TILE_SIZE) % TILE_SIZE;
    const offsetX = tiles.length > 0 ? mod(tiles[0].x) : 0;
    const offsetZ = tiles.length > 0 ? mod(tiles[0].z) : 0;
    const cells = new Map<string, string>();
    for (const t of tiles) {
      const gx = Math.floor((t.x - offsetX) / TILE_SIZE);
      const gz = Math.floor((t.z - offsetZ) / TILE_SIZE);
      cells.set(`${gx.toString()},${gz.toString()}`, t.district);
    }
    const index: TileIndex = { offsetX, offsetZ, cells };
    this.#tileIndex = { source: this.allPrefabs, index };
    return index;
  }

  #footprintColor(
    prefab: Prefab,
    tileIndex: TileIndex,
    densityScores: PrefabDensityScores,
    districtColors: DistrictColors,
  ): string {
    const gx = Math.floor((prefab.x - tileIndex.offsetX) / TILE_SIZE);
    const gz = Math.floor((prefab.z - tileIndex.offsetZ) / TILE_SIZE);
    const district = tileIndex.cells.get(
      `${gx.toString()},${gz.toString()}`,
    );
    // Mirrors WorldGenerationEngineFinal.StreetTile.SpawnMarkerPartsAndPrefabs:
    //   remnant/abandoned ×0.75, low-density ×0.4, trader override #994d4d.
    // Wilderness POIs (no containing tile) keep the in-game default of white.
    let color: [number, number, number];
    if (district === undefined) {
      color = [1, 1, 1];
    } else {
      const hex = districtColors[district];
      color = hex ? hexToRgbFloat(hex) : [1, 1, 1];
    }
    if (
      prefab.name.startsWith("remnant_") ||
      prefab.name.startsWith("abandoned_")
    ) {
      color = [color[0] * 0.75, color[1] * 0.75, color[2] * 0.75];
    } else if ((densityScores[prefab.name] ?? 0) < 1) {
      color = [color[0] * 0.4, color[1] * 0.4, color[2] * 0.4];
    } else if (prefab.name.startsWith("trader_")) {
      color = [0.6, 0.3, 0.3];
    }
    return rgbFloatToHex(color);
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

  #drawPrefabs(
    context: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    meshSizes: PrefabMeshSizes,
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
    for (const prefab of this.filteredPrefabs.toReversed()) {
      // decoration.position is the SW corner of the rotated AABB; shift to
      // the centre so the ✘ marks the middle of the footprint. Falls back to
      // a zero-size offset when the mesh size is unknown.
      const size = meshSizes[prefab.name];
      const odd = ((prefab.rotation ?? 0) & 1) === 1;
      const halfW = size ? (odd ? size[1] : size[0]) / 2 : 0;
      const halfD = size ? (odd ? size[0] : size[1]) / 2 : 0;
      const x = offsetX + prefab.x + halfW + charOffsetX;
      // prefab vertical positions are inverted for canvas coodinates
      const z = offsetY - prefab.z - halfD + charOffsetY;
      putText(context, { text: SIGN_CHAR, x, z, size: this.signSize });
    }
  }

  #drawMark(
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

// Build an `rgba(r, g, b, a)` string from a `#rrggbb` colour. Falls back to
// the input when the hex format is unrecognised so the renderer still gets a
// valid CSS colour for the stroke pass.
function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r.toString()}, ${g.toString()}, ${b.toString()}, ${alpha.toString()})`;
}

function hexToRgbFloat(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return [1, 1, 1];
  return [
    parseInt(m[1], 16) / 255,
    parseInt(m[2], 16) / 255,
    parseInt(m[3], 16) / 255,
  ];
}

function rgbFloatToHex([r, g, b]: [number, number, number]): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n * 255)));
  const hex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
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
