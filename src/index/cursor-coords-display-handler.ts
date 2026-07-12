import type { CursorHandler } from "./cursor-handler.ts";
import type { DtmHandler } from "./dtm-handler.ts";
import type { GameCoords } from "../types/7dtdmap.ts";

import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { printError } from "../lib/utils.ts";

interface Doms {
  output: HTMLElement;
}

const EMPTY = "E/W: -, N/S: -, Elev: -";

/**
 * Sink for cursor events that renders the coords / elevation line.
 * Elevation is resolved here rather than in `CursorHandler` because it
 * is asynchronous and not needed by every subscriber.
 */
export class CursorCoordsDisplayHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #lastCoords: GameCoords | null = null;

  constructor(doms: Doms, cursor: CursorHandler, dtmHandler: DtmHandler) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;

    cursor.addListener(({ coords }) => {
      this.#lastCoords = coords;
      this.#update().catch(printError);
    });
  }

  #update = throttledInvoker(() => this.#updateImmediately(), 100);

  async #updateImmediately() {
    const coords = this.#lastCoords;
    if (!coords) {
      this.#doms.output.textContent = EMPTY;
      return;
    }
    const y = (await this.#dtmHandler.getElevation(coords)) ?? "-";
    this.#doms.output.textContent =
      `E/W: ${coords.x.toString()}, N/S: ${coords.z.toString()}, Elev: ${y.toString()}`;
  }
}
