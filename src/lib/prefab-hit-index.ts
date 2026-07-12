import type { GameCoords, Prefab, PrefabMeshSizes } from "../types/7dtdmap.ts";

/**
 * Mirrors the exclusions in `map-renderer`'s footprint draw so hit-tests
 * target exactly the rectangles a user can see on the map. `rwg_tile_`
 * is the placement framework and `part_driveway_` overlaps its parent
 * POI, so neither is ever what a user is asking about.
 */
export const EXCLUDED_NAME_FRAGMENTS = [
  "rwg_tile_",
  "part_driveway_",
] as const;

/**
 * AABB stored in four parallel `Int32Array`s so the hit-test loop is
 * pure integer compares (no string `.includes`, no `PrefabMeshSizes`
 * lookup, no rotation parity per sample). Rows are sorted ascending by
 * footprint area so the first hit is the smallest, naturally preferring
 * the more specific POI on overlapping footprints.
 */
export class PrefabHitIndex {
  readonly source: Prefab[];
  readonly prefabs: Prefab[];
  readonly x0: Int32Array;
  readonly z0: Int32Array;
  readonly w: Int32Array;
  readonly d: Int32Array;

  constructor(all: Prefab[], meshSizes: PrefabMeshSizes) {
    const tmp: {
      prefab: Prefab;
      x0: number;
      z0: number;
      w: number;
      d: number;
      area: number;
    }[] = [];
    for (const p of all) {
      if (EXCLUDED_NAME_FRAGMENTS.some((frag) => p.name.includes(frag))) {
        continue;
      }
      const size = meshSizes[p.name];
      if (!size) continue;
      const [sx, sz] = size;
      // WHY: decoration.position is the SW corner of the rotated AABB. Rotations by 90° or 270° swap world-aligned width and depth.
      const odd = ((p.rotation ?? 0) & 1) === 1;
      const w = odd ? sz : sx;
      const d = odd ? sx : sz;
      tmp.push({ prefab: p, x0: p.x, z0: p.z, w, d, area: w * d });
    }
    tmp.sort((a, b) => a.area - b.area);

    const n = tmp.length;
    this.source = all;
    this.prefabs = new Array<Prefab>(n);
    this.x0 = new Int32Array(n);
    this.z0 = new Int32Array(n);
    this.w = new Int32Array(n);
    this.d = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      // deno-lint-ignore no-non-null-assertion
      const e = tmp[i]!;
      this.prefabs[i] = e.prefab;
      this.x0[i] = e.x0;
      this.z0[i] = e.z0;
      this.w[i] = e.w;
      this.d[i] = e.d;
    }
  }

  find(coords: GameCoords): Prefab | null {
    const { x, z } = coords;
    const { x0, z0, w, d, prefabs } = this;
    const n = prefabs.length;
    for (let i = 0; i < n; i++) {
      // deno-lint-ignore no-non-null-assertion
      const xi = x0[i]!;
      // deno-lint-ignore no-non-null-assertion
      if (x < xi || x >= xi + w[i]!) continue;
      // deno-lint-ignore no-non-null-assertion
      const zi = z0[i]!;
      // deno-lint-ignore no-non-null-assertion
      if (z < zi || z >= zi + d[i]!) continue;
      // deno-lint-ignore no-non-null-assertion
      return prefabs[i]!;
    }
    return null;
  }
}
