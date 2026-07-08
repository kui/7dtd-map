import type { DtmHandler } from "./dtm-handler.ts";
import type { FileHandler } from "./file-handler.ts";
import type { MarkerStore } from "./marker-store.ts";

import { canvasEventToGameCoords } from "../lib/dom-utils.ts";
import { printError } from "../lib/utils.ts";

interface Doms {
  canvas: HTMLCanvasElement;
  resetMarker: HTMLButtonElement;
}

// 2D map input adapter: turns canvas clicks/dblclicks, the reset button, and
// file loads into MarkerStore updates. The store owns the coordinate state and
// broadcasts to subscribers; this class only translates DOM events into calls.
export class MarkerHandler {
  constructor(
    doms: Doms,
    dtmHandler: DtmHandler,
    fileHandler: FileHandler,
    store: MarkerStore,
  ) {
    const setFromEvent = async (event: MouseEvent | null) => {
      const size = await dtmHandler.size();
      const coords = event && size
        ? canvasEventToGameCoords(event, size, doms.canvas)
        : null;
      await store.set(coords);
    };

    doms.canvas.addEventListener("click", (e) => {
      // Shift+Click is reserved for prefab page navigation in
      // PrefabTooltipHandler; the two click roles are mutually exclusive.
      if (e.shiftKey) return;
      setFromEvent(e).catch(printError);
    });
    doms.canvas.addEventListener("dblclick", (e) => {
      if (e.shiftKey) return;
      setFromEvent(null).catch(printError);
    });
    doms.resetMarker.addEventListener("click", () => {
      setFromEvent(null).catch(printError);
    });
    fileHandler.addListener(() => {
      store.set(null).catch(printError);
    });
  }
}
