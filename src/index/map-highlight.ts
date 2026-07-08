import type { CssRect } from "../lib/dom-utils.ts";

/**
 * Shared overlay used by every "hover a list row → highlight it on the 2D
 * map" flow (prefab list, flag row, …). Only one target can be pointed at a
 * time, so a single DOM element and one visibility flag are enough — callers
 * do not need to coordinate to avoid overlap.
 */
export class MapHighlight {
  #el: HTMLElement;

  constructor(el: HTMLElement) {
    this.#el = el;
  }

  show(rect: CssRect): void {
    const s = this.#el.style;
    s.left = `${rect.left.toString()}px`;
    s.top = `${rect.top.toString()}px`;
    s.width = `${rect.width.toString()}px`;
    s.height = `${rect.height.toString()}px`;
    this.#el.classList.add("visible");
  }

  hide(): void {
    this.#el.classList.remove("visible");
  }

  get visible(): boolean {
    return this.#el.classList.contains("visible");
  }

  scrollIntoView(options: ScrollIntoViewOptions): void {
    this.#el.scrollIntoView(options);
  }
}
