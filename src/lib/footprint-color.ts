import type {
  DistrictColors,
  Prefab,
  PrefabDensityScores,
} from "../types/7dtdmap.ts";

/** Edge length of an `rwg_tile_*` prefab in game blocks. */
const TILE_SIZE = 150;

export interface TileIndex {
  offsetX: number;
  offsetZ: number;
  /** Key `${gridX},${gridZ}` maps to a district name extracted from the tile filename. */
  cells: Map<string, string>;
}

/**
 * Tile prefabs are 150×150 `rwg_tile_<district>_*` blocks on a regular
 * lattice. Indexes each by grid cell for O(1) per-POI district lookups.
 */
export function buildTileIndex(allPrefabs: Prefab[]): TileIndex {
  const tiles: { x: number; z: number; district: string }[] = [];
  for (const p of allPrefabs) {
    const m = /^rwg_tile_([^_]+)_/.exec(p.name);
    if (!m) continue;
    // deno-lint-ignore no-non-null-assertion
    tiles.push({ x: p.x, z: p.z, district: m[1]! });
  }
  // WHY: the lattice origin is the world-centre offset, not a multiple of 150 in world coords. Derive it from any tile (mod 150 normalised to [0, 150)).
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
  return { offsetX, offsetZ, cells };
}

/**
 * Mirrors `WorldGenerationEngineFinal.StreetTile.SpawnMarkerPartsAndPrefabs`.
 * Returns `preview_color × (remnant/abandoned 0.75, low-density 0.4)`,
 * trader `#994d4d`, wilderness white.
 */
export function footprintColorRgb(
  prefab: Prefab,
  tileIndex: TileIndex,
  densityScores: PrefabDensityScores,
  districtColors: DistrictColors,
): [number, number, number] {
  const gx = Math.floor((prefab.x - tileIndex.offsetX) / TILE_SIZE);
  const gz = Math.floor((prefab.z - tileIndex.offsetZ) / TILE_SIZE);
  const district = tileIndex.cells.get(`${gx.toString()},${gz.toString()}`);
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
    return [color[0] * 0.75, color[1] * 0.75, color[2] * 0.75];
  } else if ((densityScores[prefab.name] ?? 0) < 1) {
    return [color[0] * 0.4, color[1] * 0.4, color[2] * 0.4];
  } else if (prefab.name.startsWith("trader_")) {
    return [0.6, 0.3, 0.3];
  }
  return color;
}

export function footprintColorHex(
  prefab: Prefab,
  tileIndex: TileIndex,
  densityScores: PrefabDensityScores,
  districtColors: DistrictColors,
): string {
  return rgbFloatToHex(
    footprintColorRgb(prefab, tileIndex, densityScores, districtColors),
  );
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
