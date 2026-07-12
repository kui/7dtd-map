import type { DtmHandler } from "./dtm-handler.ts";
import type { GameCoords } from "../types/7dtdmap.ts";

import { canvasEventToGameCoords } from "../lib/dom-utils.ts";
import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { printError } from "../lib/utils.ts";
import * as events from "../lib/events.ts";

interface Doms {
  canvas: HTMLCanvasElement;
}

export interface CursorEventMessage {
  /** `null` when the cursor left the canvas. */
  event: MouseEvent | null;
  /**
   * `null` when the cursor is outside the map area, or when the map
   * size is not yet known (no `map_info.xml` loaded).
   */
  coords: GameCoords | null;
}

/**
 * Streams "what is under the cursor" events to any number of
 * subscribers (coords/elevation display, prefab tooltip, and so on).
 * Holding the single source here avoids per-feature `mousemove`
 * listeners and lets the canvas-to-game coord conversion happen once
 * per cursor sample.
 */
export class CursorHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #lastEvent: MouseEvent | null = null;
  #listeners = new events.ListenerManager<CursorEventMessage>();

  constructor(doms: Doms, dtmHandler: DtmHandler) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;

    doms.canvas.addEventListener(
      "mousemove",
      (e) => {
        this.#lastEvent = e;
        this.#dispatch().catch(printError);
      },
      { passive: true },
    );
    doms.canvas.addEventListener("mouseout", () => {
      this.#lastEvent = null;
      this.#dispatch().catch(printError);
    });
  }

  /**
   * Source-side debounce keeps the dispatch rate near rAF so even a
   * fast-moving cursor does not fire dozens of subscriber chains per
   * frame. Subscribers can layer their own throttle on top when their
   * work (DOM writes, async fetches) is more expensive than the
   * dispatch itself.
   */
  #dispatch = throttledInvoker(() => this.#dispatchImmediately(), 16);

  async #dispatchImmediately() {
    const event = this.#lastEvent;
    const size = await this.#dtmHandler.size();
    const coords = event && size
      ? canvasEventToGameCoords(event, size, this.#doms.canvas)
      : null;
    await this.#listeners.dispatch({ event, coords });
  }

  addListener(fn: events.Listener<CursorEventMessage>) {
    this.#listeners.addListener(fn);
  }
}
