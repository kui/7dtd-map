import type { DtmHandler } from "./dtm-handler.ts";
import type { MarkerStore } from "./marker-store.ts";

import { printError } from "../lib/utils.ts";

interface Doms {
  jump: HTMLButtonElement;
  canvas: HTMLCanvasElement;
  anchor: HTMLElement;
}

/**
 * Scrolls the map to the flag marker when the flag row's jump button is
 * clicked. Mirrors PrefabHighlightHandler's jump behaviour: an invisible
 * anchor is positioned over the canvas at the flag's CSS coords and used as
 * the scrollIntoView target so both scroll axes are handled uniformly.
 */
export class MarkerJumpHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #store: MarkerStore;

  constructor(doms: Doms, dtmHandler: DtmHandler, store: MarkerStore) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;
    this.#store = store;

    doms.jump.disabled = store.coords === null;
    store.addListener(({ coords }) => {
      doms.jump.disabled = coords === null;
    });
    doms.jump.addEventListener("click", () => {
      this.#jump().catch(printError);
    });
  }

  async #jump(): Promise<void> {
    const coords = this.#store.coords;
    if (!coords) return;
    const mapSize = await this.#dtmHandler.size();
    if (!mapSize || mapSize.width === 0 || mapSize.height === 0) return;
    const { canvas, anchor } = this.#doms;
    if (canvas.width <= 1 || canvas.height <= 1) return;

    const scaleX = canvas.width / mapSize.width;
    const scaleY = canvas.height / mapSize.height;
    const left = (coords.x + Math.floor(mapSize.width / 2)) * scaleX;
    const top = (Math.floor(mapSize.height / 2) - coords.z) * scaleY;
    anchor.style.left = `${left.toString()}px`;
    anchor.style.top = `${top.toString()}px`;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    anchor.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
      inline: "center",
    });
  }
}
