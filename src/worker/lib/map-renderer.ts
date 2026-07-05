import type {
  DistrictColors,
  GameCoords,
  GameMapSize,
  GlyphMarker,
  Prefab,
  PrefabDensityScores,
  PrefabMeshSizes,
} from "../../types/7dtdmap.ts";
import { throttledInvoker } from "../../lib/throttled-invoker.ts";
import { gameMapSize } from "../../lib/utils.ts";
import { CacheHolder } from "../../lib/cache-holder.ts";
import * as storage from "../../lib/storage.ts";
import * as mapFiles from "../../../lib/map-files.ts";
import { buildGlyphSprite } from "../../lib/glyph-sprite.ts";
import {
  GLYPH_MARKER_FONT_SIZE,
  GLYPH_MARKER_VIEWPORT,
} from "../../../lib/glyph-marker.ts";

// Edge length of an `rwg_tile_*` prefab in game blocks.
const TILE_SIZE = 150;

interface TileIndex {
  offsetX: number;
  offsetZ: number;
  // Key: `${gridX},${gridZ}` → district name (extracted from tile filename).
  cells: Map<string, string>;
}

export default class MapRenderer {
  brightness = "100%";
  markerCoords: GameCoords | null = null;
  scale = 0.1;
  filteredPrefabs: Prefab[] = [];
  // Full decoration list straight from prefabs.xml — drives the footprint
  // overlay and tile-district lookup regardless of the filter state.
  allPrefabs: Prefab[] = [];
  // Cache of the tile index keyed by the most recent `allPrefabs` reference,
  // so the index is rebuilt only when the upstream array changes.
  #tileIndex: { source: Prefab[]; index: TileIndex } | null = null;
  #meshSizesHolder: CacheHolder<PrefabMeshSizes>;
  #densityScoresHolder: CacheHolder<PrefabDensityScores>;
  #districtColorsHolder: CacheHolder<DistrictColors>;
  // On-screen glyph size in output pixels, independent of the map scale.
  prefabSignSize = 20;
  prefabSignAlpha = 1;
  prefabFootprintAlpha = 1;
  biomesAlpha = 1;
  splat3Alpha = 1;
  splat4Alpha = 1;
  radAlpha = 1;

  canvas: OffscreenCanvas;
  // Mirror of the sign/marker-free composite, kept for the terrain viewer
  // which samples its placeholder canvas element as a texture.
  compositeCanvas: OffscreenCanvas | null = null;
  #signPath2D: Path2D;
  #signAnchor: GlyphMarker["anchor"];
  #markPath2D: Path2D;
  #markAnchor: GlyphMarker["anchor"];

  #nativeSizes = new Map<
    mapFiles.MapFileName,
    { width: number; height: number }
  >();

  // Composited base map (layers + brightness + per-layer alpha + footprint
  // overlay) cached so that sign/marker-only updates can skip recompositing.
  #composite: OffscreenCanvas | null = null;
  #compositeKey: string | null = null;
  // Reference identity of the `allPrefabs` array that produced the cached
  // composite; bumped implicitly when the upstream array is replaced.
  #compositeAllPrefabs: Prefab[] | null = null;
  // Bumped whenever a source image is invalidated, to invalidate the composite.
  #generation = 0;

  constructor(
    canvas: OffscreenCanvas,
    signMarker: GlyphMarker,
    markMarker: GlyphMarker,
    fetchMeshSizes: () => Promise<PrefabMeshSizes>,
    fetchDensityScores: () => Promise<PrefabDensityScores>,
    fetchDistrictColors: () => Promise<DistrictColors>,
  ) {
    this.canvas = canvas;
    this.#signPath2D = new Path2D(signMarker.d);
    this.#signAnchor = signMarker.anchor;
    this.#markPath2D = new Path2D(markMarker.d);
    this.#markAnchor = markMarker.anchor;
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
    if (width === 0 || height === 0) {
      this.canvas.width = 1;
      this.canvas.height = 1;
      // This path skips #composeBase, so the mirror must be cleared here or
      // the previous map would linger in the terrain viewer.
      if (this.compositeCanvas) {
        this.compositeCanvas.width = 1;
        this.compositeCanvas.height = 1;
      }
      return;
    }

    const canvasWidth = Math.max(1, Math.round(width * this.scale));
    const canvasHeight = Math.max(1, Math.round(height * this.scale));

    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Failed to get 2d context");

    // Static lookup tables are fetched lazily inside the worker. Their values
    // never change between map loads so they are cheap to re-fetch (the
    // CacheHolder amortises to a no-op after the first call).
    const [meshSizes, districtColors, densityScores] = await Promise.all([
      this.#meshSizesHolder.get(),
      this.#districtColorsHolder.get(),
      this.#densityScoresHolder.get(),
    ]);

    // Compose the base map + footprint overlay (which may re-decode at the
    // new size) before touching the visible canvas. Resizing the canvas
    // clears it, so doing it ahead of an await would expose a blank canvas
    // and cause a flash while scaling; instead we resize and redraw in one
    // synchronous pass below.
    const base = await this.#composeBase(
      canvasWidth,
      canvasHeight,
      width,
      height,
      meshSizes,
      densityScores,
      districtColors,
    );
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    context.imageSmoothingEnabled = false;
    if (base) context.drawImage(base, 0, 0);

    // Sign + marker overlays sit on top of the cached composite and are
    // redrawn every paint so filter / flag interactions stay responsive.
    context.save();
    context.scale(this.scale, this.scale);
    if (this.prefabSignAlpha > 0) {
      context.globalAlpha = this.prefabSignAlpha;
      this.#drawPrefabSigns(context, width, height, meshSizes);
    }
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
    // Outline thickness in game-block units (the renderer's current transform
    // scales it down to canvas pixels). Drawn inset by `stroke / 2` further
    // below so two neighbours sharing an edge never double-stroke.
    const stroke = 8;
    const half = stroke / 2;

    const tileIndex = this.#getTileIndex();

    // Batch fill and stroke rects by color into Path2D objects so each unique
    // color requires only two GPU draw calls (fill + stroke) instead of one
    // pair per prefab. A Chrome trace showed CrGpuMain tasks of 300–865 ms
    // during footprint redraws (~10 k ops for 1000 prefabs), stalling the
    // compositor and causing visible slider stutter.
    const fillPaths = new Map<string, Path2D>();
    const strokePaths = new Map<string, Path2D>();

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

      const fillColor = withAlpha(color, 0.5);
      let fp = fillPaths.get(fillColor);
      if (!fp) {
        fp = new Path2D();
        fillPaths.set(fillColor, fp);
      }
      fp.rect(cx, cy - d, w, d);

      // Canvas strokes straddle the path, so an N-block outline would spill
      // N/2 blocks past the prefab edge and double-up where neighbours share
      // a boundary. Inset by half the stroke so the outer edge sits exactly
      // on the prefab boundary, then clamp negatives for prefabs smaller
      // than the stroke (very rare; they collapse to a point).
      const iw = Math.max(0, w - stroke);
      const id = Math.max(0, d - stroke);
      let sp = strokePaths.get(color);
      if (!sp) {
        sp = new Path2D();
        strokePaths.set(color, sp);
      }
      sp.rect(cx + half, cy - d + half, iw, id);
    }

    for (const [fillColor, path] of fillPaths) {
      context.fillStyle = fillColor;
      context.fill(path);
    }

    context.lineWidth = stroke;
    for (const [strokeColor, path] of strokePaths) {
      context.strokeStyle = strokeColor;
      context.stroke(path);
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
      // deno-lint-ignore no-non-null-assertion
      tiles.push({ x: p.x, z: p.z, district: m[1]! });
    }
    // Tiles align on a 150-block lattice but the lattice origin is the world
    // centre offset, not a multiple of 150 in world coords. Pick any tile to
    // derive the offset (mod 150 normalised to [0, 150)).
    const mod = (n: number) => ((n % TILE_SIZE) + TILE_SIZE) % TILE_SIZE;
    // deno-lint-ignore no-non-null-assertion
    const offsetX = tiles.length > 0 ? mod(tiles[0]!.x) : 0;
    // deno-lint-ignore no-non-null-assertion
    const offsetZ = tiles.length > 0 ? mod(tiles[0]!.z) : 0;
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
   * Composite the base layers (with brightness and per-layer alpha) and the
   * footprint overlay onto a cached offscreen canvas at the current display
   * resolution. The cache is reused as long as the display size, brightness,
   * alphas, source images, and footprint inputs are unchanged, so
   * sign/marker-only updates avoid re-decoding/compositing.
   */
  async #composeBase(
    width: number,
    height: number,
    nativeWidth: number,
    nativeHeight: number,
    meshSizes: PrefabMeshSizes,
    densityScores: PrefabDensityScores,
    districtColors: DistrictColors,
  ): Promise<OffscreenCanvas | null> {
    const key = [
      width,
      height,
      this.brightness,
      this.biomesAlpha,
      this.splat3Alpha,
      this.splat4Alpha,
      this.radAlpha,
      this.prefabFootprintAlpha,
      this.#generation,
    ].join(":");
    // The static lookup tables are pinned for the lifetime of the worker, so
    // their reference identity is enough; allPrefabs is replaced on every
    // prefabs.xml load and is the only input that escapes the key string.
    if (
      this.#composite &&
      this.#compositeKey === key &&
      this.#composite.width === width &&
      this.#composite.height === height &&
      this.#compositeAllPrefabs === this.allPrefabs
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
      if (rad && this.radAlpha !== 0) {
        // Radiation is intentionally drawn at full brightness so its tint
        // stays readable on dimmed maps.
        context.filter = "none";
        context.globalAlpha = this.radAlpha;
        context.drawImage(rad, 0, 0);
      }
      // Footprints go inside the cached composite so the brightness filter
      // applies the same way it does to the biomes/splat layers, and so
      // sign-only re-renders don't have to recompute them.
      if (this.prefabFootprintAlpha > 0) {
        context.save();
        context.filter = `brightness(${this.brightness})`;
        context.scale(this.scale, this.scale);
        context.globalAlpha = this.prefabFootprintAlpha;
        this.#drawPrefabFootprints(
          context,
          nativeWidth,
          nativeHeight,
          meshSizes,
          densityScores,
          districtColors,
        );
        context.restore();
      }
    } finally {
      // Only the composite is cached; release the per-layer bitmaps.
      for (const bitmap of [biomes, splat3, splat4, rad]) bitmap?.close();
    }

    this.#composite = canvas;
    this.#compositeKey = key;
    this.#compositeAllPrefabs = this.allPrefabs;
    // Copying only on recompose keeps the mirror current: cache hits mean
    // the composite content is unchanged.
    if (this.compositeCanvas) {
      this.compositeCanvas.width = width;
      this.compositeCanvas.height = height;
      this.compositeCanvas.getContext("2d")?.drawImage(canvas, 0, 0);
    }
    return canvas;
  }

  #drawPrefabSigns(
    context: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    meshSizes: PrefabMeshSizes,
  ) {
    const signSize = this.prefabSignSize;
    const scale = this.scale;

    const pixelSize = Math.max(1, Math.round(signSize));
    const sprite = buildGlyphSprite(this.#signPath2D, pixelSize);
    const spriteCX = sprite.width / 2;
    const spriteCY = sprite.height / 2;

    const offsetX = width / 2;
    const offsetY = height / 2;

    const { x: charOffsetX, z: charOffsetY } = anchorOffset(
      this.#signAnchor,
      signSize,
    );

    // Remove the active scale transform so the sprite stamps 1:1 on output
    // pixels. globalAlpha set by the caller is unaffected by resetTransform.
    context.save();
    context.resetTransform();

    // Inverted iteration to overwrite signs by higher order prefabs
    for (const prefab of this.filteredPrefabs.toReversed()) {
      // decoration.position is the SW corner of the rotated AABB; shift to
      // the centre so the ✘ marks the middle of the footprint. Falls back to
      // a zero-size offset when the mesh size is unknown.
      const meshSize = meshSizes[prefab.name];
      const odd = ((prefab.rotation ?? 0) & 1) === 1;
      const halfW = meshSize ? (odd ? meshSize[1] : meshSize[0]) / 2 : 0;
      const halfD = meshSize ? (odd ? meshSize[0] : meshSize[1]) / 2 : 0;
      const x = offsetX + prefab.x + halfW;
      // prefab vertical positions are inverted for canvas coordinates
      const z = offsetY - prefab.z - halfD;
      // Multiply by scale to convert game-world coords to canvas pixels; the
      // anchor offset is already in output pixels so it applies after scaling.
      context.drawImage(
        sprite,
        Math.round(x * scale + charOffsetX - spriteCX),
        Math.round(z * scale + charOffsetY - spriteCY),
      );
    }

    context.restore();
  }

  #drawMark(
    context: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (!this.markerCoords) return;

    const pixelSize = Math.max(1, Math.round(this.prefabSignSize));
    const sprite = buildGlyphSprite(this.#markPath2D, pixelSize);
    const spriteCX = sprite.width / 2;
    const spriteCY = sprite.height / 2;

    const offsetX = width / 2;
    const offsetY = height / 2;
    const { x: charOffsetX, z: charOffsetY } = anchorOffset(
      this.#markAnchor,
      this.prefabSignSize,
    );

    const x = offsetX + this.markerCoords.x;
    const z = offsetY - this.markerCoords.z;

    context.save();
    context.resetTransform();
    context.drawImage(
      sprite,
      Math.round(x * this.scale + charOffsetX - spriteCX),
      Math.round(z * this.scale + charOffsetY - spriteCY),
    );
    context.restore();
  }

  async #nativeSize(
    fileName: mapFiles.MapFileName,
  ): Promise<{ width: number; height: number } | null> {
    const cached = this.#nativeSizes.get(fileName);
    if (cached) return cached;
    const file = await this.#getFile(fileName);
    if (!file) return null;
    const size = await readPngSize(fileName, file);
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
}

// Build an `rgba(r, g, b, a)` string from a `#rrggbb` colour. Falls back to
// the input when the hex format is unrecognised so the renderer still gets a
// valid CSS colour for the stroke pass.
function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return hex;
  // deno-lint-ignore no-non-null-assertion
  const r = parseInt(m[1]!, 16);
  // deno-lint-ignore no-non-null-assertion
  const g = parseInt(m[2]!, 16);
  // deno-lint-ignore no-non-null-assertion
  const b = parseInt(m[3]!, 16);
  return `rgba(${r.toString()}, ${g.toString()}, ${b.toString()}, ${alpha.toString()})`;
}

function hexToRgbFloat(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return [1, 1, 1];
  return [
    // deno-lint-ignore no-non-null-assertion
    parseInt(m[1]!, 16) / 255,
    // deno-lint-ignore no-non-null-assertion
    parseInt(m[2]!, 16) / 255,
    // deno-lint-ignore no-non-null-assertion
    parseInt(m[3]!, 16) / 255,
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

// The sprite stamps centred on the target coordinate, but `anchor` (a point
// in the shared VIEWPORT square, see lib/glyph-marker.ts) should land there
// instead. Converts the offset between the two into output pixels.
function anchorOffset(
  anchor: GlyphMarker["anchor"],
  targetSize: number,
): { x: number; z: number } {
  const k = targetSize / GLYPH_MARKER_FONT_SIZE;
  return {
    x: k * (GLYPH_MARKER_VIEWPORT / 2 - anchor.x),
    z: k * (GLYPH_MARKER_VIEWPORT / 2 - anchor.y),
  };
}

// 8-byte signature + 4-byte chunk length + 4-byte "IHDR" type + 4-byte width
// + 4-byte height.
const PNG_HEADER_BYTES = 24;

/**
 * Read width/height from a PNG's IHDR chunk without decoding pixels.
 * Layout: 8-byte signature, 4-byte chunk length, 4-byte "IHDR" type,
 * then 4-byte width and 4-byte height (big-endian).
 */
async function readPngSize(
  fileName: string,
  file: Blob,
): Promise<{ width: number; height: number }> {
  const header = await file.slice(0, PNG_HEADER_BYTES).arrayBuffer();
  // Diagnostic for https://github.com/kui/7dtd-map/issues/202 (flaky short
  // read of bundled PNGs in CI). Throw a descriptive error with the file
  // metadata that was visible at the moment of the short read so the next
  // CI flake captures what would otherwise be lost behind a bare RangeError.
  if (header.byteLength < PNG_HEADER_BYTES) {
    const headerHex = Array.from(new Uint8Array(header))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    throw new Error(
      `readPngSize: short read for ${fileName} ` +
        `(file.size=${file.size.toString()}, file.type=${file.type}, ` +
        `header.byteLength=${header.byteLength.toString()}, ` +
        `header[hex]=${headerHex}). ` +
        `See https://github.com/kui/7dtd-map/issues/202`,
    );
  }
  const view = new DataView(header);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}
