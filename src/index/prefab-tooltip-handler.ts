import type { CursorHandler } from "./cursor-handler.ts";
import type { LabelHandler } from "../lib/label-handler.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type {
  GameCoords,
  Prefab,
  PrefabDifficulties,
} from "../types/7dtdmap.ts";
import type { PrefabHitIndex } from "../lib/prefab-hit-index.ts";

import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { escapeHtml, printError } from "../lib/utils.ts";

interface Doms {
  tooltip: HTMLElement;
  canvas: HTMLCanvasElement;
}

// Pixels offset from the cursor so the tooltip does not sit on top of the
// crosshair and is not captured by mouseout when the cursor advances.
const CURSOR_OFFSET = 16;

export class PrefabTooltipHandler {
  #doms: Doms;
  #labelHandler: LabelHandler;
  #difficulties: Promise<PrefabDifficulties>;
  #index: PrefabHitIndex | null = null;
  #lastEvent: MouseEvent | null = null;
  #lastCoords: GameCoords | null = null;
  #shownPrefabName: string | null = null;
  #currentHit: Prefab | null = null;
  #shiftActive = false;

  constructor(
    doms: Doms,
    cursor: CursorHandler,
    prefabsHandler: PrefabsHandler,
    labelHandler: LabelHandler,
    difficulties: Promise<PrefabDifficulties>,
  ) {
    this.#doms = doms;
    this.#labelHandler = labelHandler;
    this.#difficulties = difficulties;

    prefabsHandler.addPrefabHitIndexListener(({ update: { index } }) => {
      this.#index = index;
    });

    cursor.addListener(({ update: { event, coords } }) => {
      this.#lastEvent = event;
      this.#lastCoords = coords;
      if (event) this.#setShiftActive(event.shiftKey);
      this.#update().catch(printError);
    });

    doms.canvas.addEventListener("click", (e) => {
      if (!e.shiftKey) return;
      const hit = this.#currentHit;
      if (!hit) return;
      e.preventDefault();
      // Shift is not a "background tab" modifier for browsers, so a plain
      // window.open() opens the new tab in the foreground.
      globalThis.open(
        `prefabs/${encodeURIComponent(hit.name)}.html`,
        "_blank",
        "noopener",
      );
    });

    // Track Shift state without requiring cursor movement so the hint
    // highlight flips the moment the user presses or releases the modifier.
    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "Shift") this.#setShiftActive(true);
    });
    globalThis.addEventListener("keyup", (e) => {
      if (e.key === "Shift") this.#setShiftActive(false);
    });
    globalThis.addEventListener("blur", () => this.#setShiftActive(false));
  }

  #setShiftActive(active: boolean) {
    if (this.#shiftActive === active) return;
    this.#shiftActive = active;
    this.#doms.tooltip.classList.toggle("shift-active", active);
  }

  #update = throttledInvoker(() => this.#updateImmediately(), 50);

  async #updateImmediately() {
    const event = this.#lastEvent;
    const coords = this.#lastCoords;
    if (!event || !coords) {
      this.#hide();
      return;
    }
    const hit = this.#index?.find(coords);
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
        `<div class="hint shift-click">🔗 Shift+Click: Open prefab page</div>` +
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
