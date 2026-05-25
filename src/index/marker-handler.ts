import type { DtmHandler } from "./dtm-handler.ts";
import type { GameCoords } from "../types/7dtdmap.ts";

import { canvasEventToGameCoords, formatCoords } from "../lib/dom-utils.ts";
import { printError } from "../lib/utils.ts";
import * as events from "../lib/events.ts";

interface Doms {
  canvas: HTMLCanvasElement;
  output: HTMLElement;
  resetMarker: HTMLButtonElement;
}

interface EventMessage {
  update: { coords: GameCoords | null };
}

export class MarkerHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #listeners = new events.ListenerManager<"update", EventMessage>();

  constructor(doms: Doms, dtmHandler: DtmHandler) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;

    doms.canvas.addEventListener("click", (e) => {
      this.#update(e).catch(printError);
    });
    doms.resetMarker.addEventListener("click", () => {
      this.#update(null).catch(printError);
    });
  }

  async #update(event: MouseEvent | null) {
    const size = await this.#dtmHandler.size();
    this.#doms.output.textContent = await formatCoords(
      size,
      this.#doms.canvas,
      (c) => this.#dtmHandler.getElevation(c),
      event,
    );
    const coords = event && size
      ? canvasEventToGameCoords(event, size, this.#doms.canvas)
      : null;
    await this.#listeners.dispatch({ update: { coords } });
  }

  addListener(fn: (m: EventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }
}
