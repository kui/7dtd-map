import type { DtmHandler } from "./dtm-handler.ts";
import type { MarkerStore } from "./marker-store.ts";
import type { MapHighlight } from "./map-highlight.ts";
import type { GameCoords } from "../types/7dtdmap.ts";

import { type CssRect } from "../lib/dom-utils.ts";
import { printError } from "../lib/utils.ts";

interface Doms {
  jump: HTMLButtonElement;
  row: HTMLElement;
  canvas: HTMLCanvasElement;
}

const HIGHLIGHT_SIZE_PX = 24;

/**
 * Flag-row companion to PrefabHighlightHandler: highlights the flag on the
 * map while the Flag row is hovered and scrolls the map to it when the row's
 * jump button is clicked. Shares the map highlight overlay with the prefab
 * hover, since only one target is ever pointed at at a time.
 */
export class MarkerJumpHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #store: MarkerStore;
  #highlight: MapHighlight;
  #hovering = false;

  constructor(
    doms: Doms,
    dtmHandler: DtmHandler,
    store: MarkerStore,
    highlight: MapHighlight,
  ) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;
    this.#store = store;
    this.#highlight = highlight;

    doms.jump.disabled = store.coords === null;
    store.addListener(({ coords }) => {
      doms.jump.disabled = coords === null;
      if (this.#hovering) {
        if (coords) this.#show(coords).catch(printError);
        else this.#highlight.hide();
      }
    });
    doms.jump.addEventListener("click", () => {
      this.#jump().catch(printError);
    });
    doms.row.addEventListener("mouseenter", () => {
      this.#hovering = true;
      const coords = store.coords;
      if (coords) this.#show(coords).catch(printError);
    });
    doms.row.addEventListener("mouseleave", () => {
      this.#hovering = false;
      this.#highlight.hide();
    });
  }

  async #jump(): Promise<void> {
    const coords = this.#store.coords;
    if (!coords) return;
    // On touch devices the click arrives without a preceding mouseenter, so
    // position the highlight ourselves before scrolling to it.
    await this.#show(coords);
    if (!this.#highlight.visible) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.#highlight.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
      inline: "center",
    });
  }

  async #show(coords: GameCoords): Promise<void> {
    const rect = await this.#computeRect(coords);
    if (!rect) {
      this.#highlight.hide();
      return;
    }
    this.#highlight.show(rect);
  }

  async #computeRect(coords: GameCoords): Promise<CssRect | null> {
    const mapSize = await this.#dtmHandler.size();
    if (!mapSize || mapSize.width === 0 || mapSize.height === 0) return null;
    const { canvas } = this.#doms;
    if (canvas.width <= 1 || canvas.height <= 1) return null;

    const scaleX = canvas.width / mapSize.width;
    const scaleY = canvas.height / mapSize.height;
    const left = (coords.x + Math.floor(mapSize.width / 2)) * scaleX;
    const top = (Math.floor(mapSize.height / 2) - coords.z) * scaleY;
    return {
      left: left - HIGHLIGHT_SIZE_PX / 2,
      top: top - HIGHLIGHT_SIZE_PX / 2,
      width: HIGHLIGHT_SIZE_PX,
      height: HIGHLIGHT_SIZE_PX,
    };
  }
}
