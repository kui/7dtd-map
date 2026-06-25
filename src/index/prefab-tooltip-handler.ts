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
  #lastEvent: MouseEvent | null = null;
  #lastCoords: GameCoords | null = null;
  #shownPrefabName: string | null = null;

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
    });

    cursor.addListener(({ update: { event, coords } }) => {
      this.#lastEvent = event;
      this.#lastCoords = coords;
      this.#update().catch(printError);
    });
  }

  #update = throttledInvoker(() => this.#updateImmediately(), 50);

  async #updateImmediately() {
    const event = this.#lastEvent;
    const coords = this.#lastCoords;
    if (!event || !coords || this.#allPrefabs.length === 0) {
      this.#hide();
      return;
    }
    const [meshSizes, labels, difficulties] = await Promise.all([
      this.#meshSizes,
      this.#labelHandler.holder.get("prefabs"),
      this.#difficulties,
    ]);
    const hit = findPrefabAt(coords, this.#allPrefabs, meshSizes);
    if (!hit) {
      this.#hide();
      return;
    }
    const label = labels.get(hit.name) ?? "-";
    const difficulty = difficulties[hit.name] ?? 0;
    this.#show(event, hit, label, difficulty);
  }

  #show(event: MouseEvent, prefab: Prefab, label: string, difficulty: number) {
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
  }
}

// Returns the smallest-footprint prefab whose AABB contains `coords`, or null
// if nothing matches. Smallest-area wins when multiple footprints overlap so
// the more specific POI is preferred over a containing structure.
function findPrefabAt(
  coords: GameCoords,
  prefabs: Prefab[],
  meshSizes: PrefabMeshSizes,
): Prefab | null {
  let best: { prefab: Prefab; area: number } | null = null;
  for (const p of prefabs) {
    if (EXCLUDED_NAME_FRAGMENTS.some((frag) => p.name.includes(frag))) continue;
    const size = meshSizes[p.name];
    if (!size) continue;
    const [sx, sz] = size;
    // decoration.position is the SW corner of the rotated AABB; 90°/270°
    // rotations swap world-aligned width/depth. Matches the renderer's
    // footprint formula in src/worker/lib/map-renderer.ts.
    const odd = ((p.rotation ?? 0) & 1) === 1;
    const w = odd ? sz : sx;
    const d = odd ? sx : sz;
    if (
      coords.x >= p.x && coords.x < p.x + w &&
      coords.z >= p.z && coords.z < p.z + d
    ) {
      const area = w * d;
      if (!best || area < best.area) best = { prefab: p, area };
    }
  }
  return best?.prefab ?? null;
}
