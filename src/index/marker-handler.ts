import type { DtmHandler } from "./dtm-handler";

import { canvasEventToGameCoords, formatCoords, printError } from "../lib/utils";

interface Doms {
  canvas: HTMLCanvasElement;
  output: HTMLElement;
  resetMarker: HTMLButtonElement;
}

export class MarkerHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #listeners: ((c: GameCoords | null) => unknown)[] = [];

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
    this.#doms.output.textContent = await formatCoords(size, this.#doms.canvas, (c) => this.#dtmHandler.getElevation(c), event);
    const coords = event && size ? canvasEventToGameCoords(event, size, this.#doms.canvas) : null;
    await Promise.allSettled(this.#listeners.map((fn) => fn(coords))).catch(printError);
  }

  addListener(fn: (c: GameCoords | null) => unknown) {
    this.#listeners.push(fn);
  }
}
