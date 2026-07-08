import type { DtmHandler } from "./dtm-handler.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type { PrefabMeshSizes } from "../types/7dtdmap.ts";
import type { MapHighlight } from "./map-highlight.ts";

import { printError } from "../lib/utils.ts";
import { type CssRect, prefabFootprintCssRect } from "../lib/dom-utils.ts";

interface Doms {
  list: HTMLElement;
  canvas: HTMLCanvasElement;
}

/**
 * Highlights a prefab's footprint on the map while its row in the prefab
 * list is hovered, and scrolls the map to it when the row's jump button is
 * clicked. Rendered as a DOM overlay on top of the canvas: the highlight is
 * transient UI state, so it stays out of the canvas (and out of the PNG
 * download, where the flag marker is the persistent point of interest).
 */
export class PrefabHighlightHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #meshSizes: Promise<PrefabMeshSizes>;
  #highlight: MapHighlight;
  #hoveredLi: HTMLElement | null = null;

  constructor(
    doms: Doms,
    dtmHandler: DtmHandler,
    prefabsHandler: PrefabsHandler,
    meshSizes: Promise<PrefabMeshSizes>,
    highlight: MapHighlight,
  ) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;
    this.#meshSizes = meshSizes;
    this.#highlight = highlight;

    // Nested block rows have no data-x, so closest() resolves them to their
    // parent prefab row.
    doms.list.addEventListener("mouseover", (event) => {
      const li = coordsLi(event.target);
      if (li === this.#hoveredLi) return;
      this.#hoveredLi = li;
      if (li) this.#show(li).catch(printError);
      else this.#hide();
    });
    doms.list.addEventListener("mouseout", (event) => {
      const li = this.#hoveredLi;
      if (!li) return;
      const related = event.relatedTarget;
      if (related instanceof Node && li.contains(related)) return;
      this.#hoveredLi = null;
      this.#hide();
    });
    doms.list.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest("button[data-jump-to-map]")) return;
      const li = coordsLi(event.target);
      if (!li) return;
      this.#jump(li).catch(printError);
    });
    // A filter update can replace the hovered row without a mouseout; drop
    // the highlight instead of leaving it pinned to a stale position.
    prefabsHandler.addFilterHeaderListener(() => {
      this.#hoveredLi = null;
      this.#hide();
    });
  }

  async #show(li: HTMLElement): Promise<void> {
    const rect = await this.#computeRect(li);
    // The hover may have moved on during the awaits.
    if (this.#hoveredLi !== li) return;
    if (!rect) {
      this.#hide();
      return;
    }
    this.#highlight.show(rect);
  }

  #hide(): void {
    this.#highlight.hide();
  }

  async #jump(li: HTMLElement): Promise<void> {
    // On touch devices the click arrives without a preceding mouseover, so
    // position the highlight ourselves before scrolling to it.
    this.#hoveredLi = li;
    await this.#show(li);
    if (!this.#highlight.visible) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.#highlight.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
      inline: "center",
    });
  }

  async #computeRect(li: HTMLElement): Promise<CssRect | null> {
    const mapSize = await this.#dtmHandler.size();
    if (!mapSize || mapSize.width === 0 || mapSize.height === 0) return null;
    const { canvas } = this.#doms;
    if (canvas.width <= 1 || canvas.height <= 1) return null;

    const x = Number(li.dataset["x"]);
    const z = Number(li.dataset["z"]);
    const rotation = Number(li.dataset["rotation"] ?? "0");
    const name = li.dataset["name"];
    if (name === undefined || Number.isNaN(x) || Number.isNaN(z)) return null;
    const meshSizes = await this.#meshSizes;

    return prefabFootprintCssRect(
      { name, x, z, rotation },
      mapSize,
      canvas,
      meshSizes,
    );
  }
}

function coordsLi(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const li = target.closest("li[data-x]");
  return li instanceof HTMLElement ? li : null;
}
