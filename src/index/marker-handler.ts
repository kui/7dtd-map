import type { DtmHandler } from "./dtm-handler.ts";
import type { FileHandler } from "./file-handler.ts";
import type { GameCoords } from "../types/7dtdmap.ts";

import { canvasEventToGameCoords } from "../lib/dom-utils.ts";
import { printError } from "../lib/utils.ts";
import * as events from "../lib/events.ts";

interface Doms {
  canvas: HTMLCanvasElement;
  resetMarker: HTMLButtonElement;
}

interface EventMessage {
  update: { coords: GameCoords | null };
}

export class MarkerHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #listeners = new events.ListenerManager<"update", EventMessage>();

  constructor(doms: Doms, dtmHandler: DtmHandler, fileHandler: FileHandler) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;

    doms.canvas.addEventListener("click", (e) => {
      // Shift+Click is reserved for prefab page navigation in
      // PrefabTooltipHandler; the two click roles are mutually exclusive.
      if (e.shiftKey) return;
      this.#dispatch(e).catch(printError);
    });
    doms.canvas.addEventListener("dblclick", (e) => {
      if (e.shiftKey) return;
      this.#dispatch(null).catch(printError);
    });
    doms.resetMarker.addEventListener("click", () => {
      this.#dispatch(null).catch(printError);
    });
    fileHandler.addListener(() => this.#dispatch(null));
  }

  async #dispatch(event: MouseEvent | null) {
    const size = await this.#dtmHandler.size();
    const coords = event && size
      ? canvasEventToGameCoords(event, size, this.#doms.canvas)
      : null;
    await this.#listeners.dispatch({ update: { coords } });
  }

  addListener(fn: (m: EventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }
}
