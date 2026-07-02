import type { CursorHandler } from "./cursor-handler.ts";
import type { DtmHandler } from "./dtm-handler.ts";
import type { LabelHandler } from "../lib/label-handler.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type {
  GameCoords,
  GameMapSize,
  Prefab,
  PrefabAddedVersions,
  PrefabDifficulties,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";
import type { PrefabHitIndex } from "../lib/prefab-hit-index.ts";

import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { escapeHtml, printError } from "../lib/utils.ts";
import { latestAddedVersion } from "../lib/prefab-added-versions.ts";
import { prefabFootprintCssRect } from "../lib/dom-utils.ts";

interface Doms {
  tooltip: HTMLElement;
  canvas: HTMLCanvasElement;
}

// Pixels between the anchor (footprint box edge, or the cursor on the
// fallback path) and the tooltip, so it does not sit on top of the crosshair.
const CURSOR_OFFSET = 16;

export class PrefabTooltipHandler {
  #doms: Doms;
  #labelHandler: LabelHandler;
  #dtmHandler: DtmHandler;
  #meshSizes: Promise<PrefabMeshSizes>;
  #difficulties: Promise<PrefabDifficulties>;
  #addedVersions: Promise<PrefabAddedVersions>;
  #latestAddedVersion: Promise<string>;
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
    dtmHandler: DtmHandler,
    difficulties: Promise<PrefabDifficulties>,
    addedVersions: Promise<PrefabAddedVersions>,
    meshSizes: Promise<PrefabMeshSizes>,
  ) {
    this.#doms = doms;
    this.#labelHandler = labelHandler;
    this.#dtmHandler = dtmHandler;
    this.#meshSizes = meshSizes;
    this.#difficulties = difficulties;
    this.#addedVersions = addedVersions;
    this.#latestAddedVersion = addedVersions.then(latestAddedVersion);

    prefabsHandler.addPrefabHitIndexListener(({ index }) => {
      this.#index = index;
    });

    cursor.addListener(({ event, coords }) => {
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
    const [
      labels,
      difficulties,
      addedVersions,
      latestVersion,
      mapSize,
      meshSizes,
    ] = await Promise
      .all([
        this.#labelHandler.holder.get("prefabs"),
        this.#difficulties,
        this.#addedVersions,
        this.#latestAddedVersion,
        this.#dtmHandler.size(),
        this.#meshSizes,
      ]);
    const label = labels.get(hit.name) ?? "-";
    const difficulty = difficulties[hit.name] ?? 0;
    const addedVersion = addedVersions[hit.name];
    const isAddedInLatestVersion = addedVersion === latestVersion;
    this.#show(
      event,
      hit,
      label,
      difficulty,
      addedVersion,
      isAddedInLatestVersion,
      mapSize,
      meshSizes,
    );
  }

  #show(
    event: MouseEvent,
    prefab: Prefab,
    label: string,
    difficulty: number,
    addedVersion: string | undefined,
    isAddedInLatestVersion: boolean,
    mapSize: GameMapSize | null,
    meshSizes: PrefabMeshSizes,
  ) {
    this.#currentHit = prefab;
    // Rebuild the inner HTML only when the prefab changes so we don't trigger
    // a new <img> request (and the flash that comes with it) on every
    // mousemove sample while hovering the same POI.
    if (this.#shownPrefabName !== prefab.name) {
      const safeName = escapeHtml(prefab.name);
      const safeLabel = escapeHtml(label);
      const tierLine = difficulty > 0
        ? `<div class="tier prefab-difficulty-${difficulty.toString()}" title="Difficulty Tier ${difficulty.toString()}">💀${difficulty.toString()}</div>`
        : "";
      const newLine = isAddedInLatestVersion
        ? `<div class="new-badge" title="Added in v${
          escapeHtml(addedVersion ?? "")
        }">🆕 New in v${escapeHtml(addedVersion ?? "")}</div>`
        : "";
      this.#doms.tooltip.innerHTML =
        `<img src="prefabs/${safeName}.jpg" alt="" loading="lazy">` +
        `<div class="text">` +
        tierLine +
        newLine +
        `<div class="name">${safeLabel} / <small>${safeName}</small></div>` +
        `<div class="hints">` +
        `<div class="hint click">🚩 Click: Set flag</div>` +
        `<div class="hint dblclick">❌ Double-click: Reset flag</div>` +
        `<div class="hint shift-click">🔗 Shift+Click: Open prefab page</div>` +
        `</div>` +
        `</div>`;
      this.#shownPrefabName = prefab.name;
    }
    // Anchor the tooltip beside the POI's footprint AABB, using the same
    // game-coords-to-canvas-pixels mapping as the prefab-list hover
    // highlight, so it stays put while the cursor moves within one POI.
    // Falls back to cursor-relative placement when the map size is unknown.
    const canvas = this.#doms.canvas;
    if (mapSize && mapSize.width > 0 && canvas.width > 1) {
      const rect = prefabFootprintCssRect(prefab, mapSize, canvas, meshSizes);
      const canvasRect = canvas.getBoundingClientRect();
      this.#doms.tooltip.style.left = `${
        (canvasRect.left + rect.left + rect.width + CURSOR_OFFSET).toString()
      }px`;
      this.#doms.tooltip.style.top = `${
        (canvasRect.top + rect.top).toString()
      }px`;
    } else {
      this.#doms.tooltip.style.left = `${
        (event.clientX + CURSOR_OFFSET).toString()
      }px`;
      this.#doms.tooltip.style.top = `${
        (event.clientY + CURSOR_OFFSET).toString()
      }px`;
    }
    this.#doms.tooltip.showPopover();
  }

  #hide() {
    if (this.#doms.tooltip.matches(":popover-open")) {
      this.#doms.tooltip.hidePopover();
    }
    this.#shownPrefabName = null;
    this.#currentHit = null;
  }
}
