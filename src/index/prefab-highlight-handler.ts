import type { DtmHandler } from "./dtm-handler.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type { PrefabMeshSizes } from "../types/7dtdmap.ts";

import { printError } from "../lib/utils.ts";

interface Doms {
  list: HTMLElement;
  canvas: HTMLCanvasElement;
  highlight: HTMLElement;
}

interface CssRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Smallest on-screen edge of the highlight box so tiny footprints (or a
// zoomed-out map) stay noticeable.
const MIN_SIZE_PX = 24;

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
  #hoveredLi: HTMLElement | null = null;

  constructor(
    doms: Doms,
    dtmHandler: DtmHandler,
    prefabsHandler: PrefabsHandler,
    meshSizes: Promise<PrefabMeshSizes>,
  ) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;
    this.#meshSizes = meshSizes;

    // Delegated on the list so rows created later by DelayedRenderer are
    // covered. Nested block rows have no data-x, so closest() resolves them
    // to their parent prefab row.
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
    prefabsHandler.addFilteredPrefabsListener(() => {
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
    const style = this.#doms.highlight.style;
    style.left = `${rect.left.toString()}px`;
    style.top = `${rect.top.toString()}px`;
    style.width = `${rect.width.toString()}px`;
    style.height = `${rect.height.toString()}px`;
    this.#doms.highlight.classList.add("visible");
  }

  #hide(): void {
    this.#doms.highlight.classList.remove("visible");
  }

  async #jump(li: HTMLElement): Promise<void> {
    // On touch devices the click arrives without a preceding mouseover, so
    // position the highlight ourselves before scrolling to it.
    this.#hoveredLi = li;
    await this.#show(li);
    if (!this.#doms.highlight.classList.contains("visible")) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.#doms.highlight.scrollIntoView({
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

    // Inverse of canvasEventToGameCoords (src/lib/dom-utils.ts): game coords
    // are centre-offset with z pointing north, canvas pixels are
    // top-left-offset with y pointing south.
    const scaleX = canvas.width / mapSize.width;
    const scaleY = canvas.height / mapSize.height;
    const left = (x + Math.floor(mapSize.width / 2)) * scaleX;
    const bottom = (Math.floor(mapSize.height / 2) - z) * scaleY;

    const size = meshSizes[name];
    if (!size) {
      // decoration.position is the SW corner of the footprint AABB, so the
      // fixed-size fallback box keeps its left/bottom anchored there rather
      // than centring on the coords.
      return {
        left,
        top: bottom - MIN_SIZE_PX,
        width: MIN_SIZE_PX,
        height: MIN_SIZE_PX,
      };
    }

    // 90°/270° rotations swap the world-aligned width/depth; same formula as
    // the footprint pass in src/worker/lib/map-renderer.ts.
    const odd = (rotation & 1) === 1;
    let width = (odd ? size[1] : size[0]) * scaleX;
    let height = (odd ? size[0] : size[1]) * scaleY;
    let clampedLeft = left;
    let clampedBottom = bottom;
    if (width < MIN_SIZE_PX) {
      clampedLeft -= (MIN_SIZE_PX - width) / 2;
      width = MIN_SIZE_PX;
    }
    if (height < MIN_SIZE_PX) {
      clampedBottom += (MIN_SIZE_PX - height) / 2;
      height = MIN_SIZE_PX;
    }
    return { left: clampedLeft, top: clampedBottom - height, width, height };
  }
}

function coordsLi(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const li = target.closest("li[data-x]");
  return li instanceof HTMLElement ? li : null;
}
