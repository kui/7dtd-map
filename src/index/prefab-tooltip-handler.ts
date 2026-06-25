import type { CursorHandler } from "./cursor-handler.ts";
import type { LabelHandler } from "../lib/label-handler.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type {
  GameCoords,
  Prefab,
  PrefabDifficulties,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";

import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { escapeHtml, printError } from "../lib/utils.ts";

interface Doms {
  tooltip: HTMLElement;
  canvas: HTMLCanvasElement;
}

// Mirrors the exclusions in map-renderer's footprint draw so that the tooltip
// targets exactly the rectangles a user can see on the map. Tiles are the
// placement framework; part_driveway overlaps its parent POI and is never the
// thing the user is asking about.
const EXCLUDED_NAME_FRAGMENTS = ["rwg_tile", "part_driveway"] as const;

// Pixels offset from the cursor so the tooltip does not sit on top of the
// crosshair and is not captured by mouseout when the cursor advances.
const CURSOR_OFFSET = 16;

export class PrefabTooltipHandler {
  #doms: Doms;
  #labelHandler: LabelHandler;
  #meshSizes: Promise<PrefabMeshSizes>;
  #difficulties: Promise<PrefabDifficulties>;
  #allPrefabs: Prefab[] = [];
  #index: PrefabHitIndex | null = null;
  #lastEvent: MouseEvent | null = null;
  #lastCoords: GameCoords | null = null;
  #shownPrefabName: string | null = null;
  #currentHit: Prefab | null = null;
  #ctrlActive = false;

  constructor(
    doms: Doms,
    cursor: CursorHandler,
    prefabsHandler: PrefabsHandler,
    labelHandler: LabelHandler,
    meshSizes: Promise<PrefabMeshSizes>,
    difficulties: Promise<PrefabDifficulties>,
  ) {
    this.#doms = doms;
    this.#labelHandler = labelHandler;
    this.#meshSizes = meshSizes;
    this.#difficulties = difficulties;

    prefabsHandler.addAllPrefabsListener(({ update: { all } }) => {
      this.#allPrefabs = all;
      // Drop the cached index; a fresh one will be built lazily on the next
      // cursor sample once meshSizes is awaited.
      this.#index = null;
    });

    cursor.addListener(({ update: { event, coords } }) => {
      this.#lastEvent = event;
      this.#lastCoords = coords;
      if (event) this.#setCtrlActive(event.ctrlKey || event.metaKey);
      this.#update().catch(printError);
    });

    doms.canvas.addEventListener("click", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const hit = this.#currentHit;
      if (!hit) return;
      e.preventDefault();
      // Navigate to the per-prefab page. Same-tab navigation matches the
      // existing prefab-list links elsewhere in the app.
      globalThis.location.href = `prefabs/${encodeURIComponent(hit.name)}.html`;
    });

    // Track Ctrl/Cmd state without requiring cursor movement so the hint
    // highlight flips the moment the user presses or releases the modifier.
    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "Control" || e.key === "Meta") this.#setCtrlActive(true);
    });
    globalThis.addEventListener("keyup", (e) => {
      if (e.key === "Control" || e.key === "Meta") this.#setCtrlActive(false);
    });
    globalThis.addEventListener("blur", () => this.#setCtrlActive(false));
  }

  #setCtrlActive(active: boolean) {
    if (this.#ctrlActive === active) return;
    this.#ctrlActive = active;
    this.#doms.tooltip.classList.toggle("ctrl-active", active);
  }

  async #getIndex(): Promise<PrefabHitIndex | null> {
    if (this.#index && this.#index.source === this.#allPrefabs) {
      return this.#index;
    }
    if (this.#allPrefabs.length === 0) return null;
    const meshSizes = await this.#meshSizes;
    // allPrefabs may have changed during the await; re-check before reusing.
    if (this.#index && this.#index.source === this.#allPrefabs) {
      return this.#index;
    }
    this.#index = new PrefabHitIndex(this.#allPrefabs, meshSizes);
    return this.#index;
  }

  #update = throttledInvoker(() => this.#updateImmediately(), 50);

  async #updateImmediately() {
    const event = this.#lastEvent;
    const coords = this.#lastCoords;
    if (!event || !coords) {
      this.#hide();
      return;
    }
    const index = await this.#getIndex();
    if (!index) {
      this.#hide();
      return;
    }
    const hit = index.find(coords);
    if (!hit) {
      this.#hide();
      return;
    }
    const [labels, difficulties] = await Promise.all([
      this.#labelHandler.holder.get("prefabs"),
      this.#difficulties,
    ]);
    const label = labels.get(hit.name) ?? "-";
    const difficulty = difficulties[hit.name] ?? 0;
    this.#show(event, hit, label, difficulty);
  }

  #show(event: MouseEvent, prefab: Prefab, label: string, difficulty: number) {
    this.#currentHit = prefab;
    // Rebuild the inner HTML only when the prefab changes so we don't trigger
    // a new <img> request (and the flash that comes with it) on every
    // mousemove sample while hovering the same POI.
    if (this.#shownPrefabName !== prefab.name) {
      const safeName = escapeHtml(prefab.name);
      const safeLabel = escapeHtml(label);
      const tierLine = difficulty > 0
        ? `<div class="tier prefab_difficulty_${difficulty.toString()}" title="Difficulty Tier ${difficulty.toString()}">💀${difficulty.toString()}</div>`
        : "";
      this.#doms.tooltip.innerHTML =
        `<img src="prefabs/${safeName}.jpg" alt="" loading="lazy">` +
        `<div class="text">` +
        tierLine +
        `<div class="name">${safeLabel} / <small>${safeName}</small></div>` +
        `<div class="hints">` +
        `<div class="hint click">🚩 Click: Set flag</div>` +
        `<div class="hint dblclick">❌ Double-click: Reset flag</div>` +
        `<div class="hint ctrl-click">🔗 Ctrl+Click: Open prefab page</div>` +
        `</div>` +
        `</div>`;
      this.#shownPrefabName = prefab.name;
    }
    this.#doms.tooltip.style.left = `${
      (event.clientX + CURSOR_OFFSET).toString()
    }px`;
    this.#doms.tooltip.style.top = `${
      (event.clientY + CURSOR_OFFSET).toString()
    }px`;
    this.#doms.tooltip.style.display = "flex";
  }

  #hide() {
    this.#doms.tooltip.style.display = "none";
    this.#shownPrefabName = null;
    this.#currentHit = null;
  }
}

// Pre-built hit-test index over the current allPrefabs snapshot. Holds the
// AABB in four parallel Int32Arrays so the hot loop only does integer
// compares (no string `.includes`, no PrefabMeshSizes lookup, no rotation
// parity per sample). Rows are sorted ascending by footprint area so that
// `find` can return at the first hit and naturally prefer the smaller, more
// specific POI on overlapping footprints.
class PrefabHitIndex {
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
      // decoration.position is the SW corner of the rotated AABB; 90°/270°
      // rotations swap world-aligned width/depth. Matches the renderer's
      // footprint formula in src/worker/lib/map-renderer.ts.
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

  // Returns the smallest-area prefab whose AABB contains `coords`, or null.
  // Rows are area-ascending so the first hit is the smallest by construction.
  find(coords: GameCoords): Prefab | null {
    const { x, z } = coords;
    const { x0, z0, w, d, prefabs } = this;
    const n = prefabs.length;
    for (let i = 0; i < n; i++) {
      const xi = x0[i];
      if (x < xi || x >= xi + w[i]) continue;
      const zi = z0[i];
      if (z < zi || z >= zi + d[i]) continue;
      // deno-lint-ignore no-non-null-assertion
      return prefabs[i]!;
    }
    return null;
  }
}
