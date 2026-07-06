import type { CursorHandler } from "./cursor-handler.ts";
import type { DtmHandler } from "./dtm-handler.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type {
  GameCoords,
  GameMapSize,
  Prefab,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";
import type { PrefabHitIndex } from "../lib/prefab-hit-index.ts";
import type { PrefabTooltipController } from "../lib/prefab-tooltip.ts";

import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { printError } from "../lib/utils.ts";
import { prefabFootprintCssRect } from "../lib/dom-utils.ts";
import { CURSOR_OFFSET } from "../lib/prefab-tooltip.ts";

interface Doms {
  canvas: HTMLCanvasElement;
}

// 2D map side of the shared tooltip: turns cursor coords into a footprint hit
// and a footprint-relative anchor, feeding the shared PrefabTooltipController.
// (The terrain viewer feeds the same controller via TerrainViewerHoverController.)
export class PrefabTooltipHandler {
  #doms: Doms;
  #controller: PrefabTooltipController;
  #dtmHandler: DtmHandler;
  #meshSizes: Promise<PrefabMeshSizes>;
  #index: PrefabHitIndex | null = null;
  #lastEvent: MouseEvent | null = null;
  #lastCoords: GameCoords | null = null;
  #currentHit: Prefab | null = null;

  constructor(
    doms: Doms,
    cursor: CursorHandler,
    prefabsHandler: PrefabsHandler,
    dtmHandler: DtmHandler,
    meshSizes: Promise<PrefabMeshSizes>,
    controller: PrefabTooltipController,
  ) {
    this.#doms = doms;
    this.#controller = controller;
    this.#dtmHandler = dtmHandler;
    this.#meshSizes = meshSizes;

    prefabsHandler.addPrefabHitIndexListener(({ index }) => {
      this.#index = index;
    });

    cursor.addListener(({ event, coords }) => {
      this.#lastEvent = event;
      this.#lastCoords = coords;
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
    const [mapSize, meshSizes] = await Promise.all([
      this.#dtmHandler.size(),
      this.#meshSizes,
    ]);
    this.#currentHit = hit;
    await this.#controller.showFor(
      hit,
      ["click", "dblclick", "shift-click"],
      () => this.#anchor(event, hit, mapSize, meshSizes),
    );
  }

  // Anchor beside the POI's footprint AABB (same game-coords-to-canvas mapping
  // as the prefab-list hover highlight) so it stays put while the cursor moves
  // within one POI; falls back to the cursor when the map size is unknown.
  #anchor(
    event: MouseEvent,
    prefab: Prefab,
    mapSize: GameMapSize | null,
    meshSizes: PrefabMeshSizes,
  ): { left: number; top: number } {
    const canvas = this.#doms.canvas;
    if (mapSize && mapSize.width > 0 && canvas.width > 1) {
      const rect = prefabFootprintCssRect(prefab, mapSize, canvas, meshSizes);
      const canvasRect = canvas.getBoundingClientRect();
      return {
        left: canvasRect.left + rect.left + rect.width + CURSOR_OFFSET,
        top: canvasRect.top + rect.top,
      };
    }
    return {
      left: event.clientX + CURSOR_OFFSET,
      top: event.clientY + CURSOR_OFFSET,
    };
  }

  #hide() {
    this.#controller.hide();
    this.#currentHit = null;
  }
}
