import type {
  Prefab,
  PrefabAddedVersions,
  PrefabDifficulties,
} from "../types/7dtdmap.ts";
import type { LabelHandler } from "./label-handler.ts";
import { escapeHtml } from "./utils.ts";
import { latestAddedVersion } from "./prefab-added-versions.ts";

/**
 * Pixels between the anchor (footprint box edge, or the cursor on the
 * fallback path) and the tooltip. Keeps the tooltip off the crosshair.
 */
export const CURSOR_OFFSET = 16;

/**
 * Which action hints to list. The 2D map wires all three. The 3D
 * terrain viewer only supports Shift+Click and passes just that one.
 */
type TooltipHint = "click" | "dblclick" | "shift-click";

interface TooltipContent {
  prefab: Pick<Prefab, "name">;
  label: string;
  difficulty: number;
  addedVersion: string | undefined;
  isAddedInLatestVersion: boolean;
  hints: TooltipHint[];
}

const HINT_HTML: Record<TooltipHint, string> = {
  "click": `<div class="hint click">🚩 Click: Set flag</div>`,
  "dblclick": `<div class="hint dblclick">❌ Double-click: Reset flag</div>`,
  "shift-click":
    `<div class="hint shift-click">🔗 Shift+Click: Open prefab page</div>`,
};

/**
 * Shared prefab popover (image, badges, name, hints) for the 2D map
 * and 3D hover. Each caller computes its own anchor and passes viewport
 * coords to `showAt()`.
 */
class PrefabTooltip {
  #dom: HTMLElement;
  /**
   * Rebuild `innerHTML` only when the shown prefab changes so hovering
   * within one POI does not re-request the `<img>` (and flash) on
   * every sample.
   */
  #shownKey: string | null = null;

  constructor(dom: HTMLElement) {
    this.#dom = dom;
  }

  setShiftActive(active: boolean): void {
    this.#dom.classList.toggle("shift-active", active);
  }

  render(content: TooltipContent): void {
    const key = [content.prefab.name, ...content.hints].join("|");
    if (this.#shownKey === key) return;
    const safeName = escapeHtml(content.prefab.name);
    const safeLabel = escapeHtml(content.label);
    const tierLine = content.difficulty > 0
      ? `<div class="tier prefab-difficulty-${content.difficulty.toString()}" title="Difficulty Tier ${content.difficulty.toString()}">💀${content.difficulty.toString()}</div>`
      : "";
    const newLine = content.isAddedInLatestVersion
      ? `<div class="new-badge" title="Added in v${
        escapeHtml(content.addedVersion ?? "")
      }">🆕 New in v${escapeHtml(content.addedVersion ?? "")}</div>`
      : "";
    const hints = content.hints.map((h) => HINT_HTML[h]).join("");
    this.#dom.innerHTML =
      `<img src="prefabs/${safeName}.jpg" alt="" loading="lazy">` +
      `<div class="text">` +
      tierLine +
      newLine +
      `<div class="name">${safeLabel} / <small>${safeName}</small></div>` +
      `<div class="hints">${hints}</div>` +
      `</div>`;
    this.#shownKey = key;
  }

  showAt(left: number, top: number): void {
    this.#dom.style.left = `${left.toString()}px`;
    this.#dom.style.top = `${top.toString()}px`;
    // WHY: showPopover() throws if already open, so only enter the top layer once and let subsequent calls just reposition (e.g. while the camera pans).
    if (!this.#dom.matches(":popover-open")) this.#dom.showPopover();
  }

  hide(): void {
    if (this.#dom.matches(":popover-open")) this.#dom.hidePopover();
    this.#shownKey = null;
  }
}

/**
 * Single owner of the shared tooltip DOM for both the 2D map and the
 * terrain viewer. Each caller supplies hit detection and an anchor.
 * This class resolves the prefab to content, owns the Shift-hint
 * state, and positions the popover.
 */
export class PrefabTooltipController {
  #view: PrefabTooltip;
  #labelHandler: LabelHandler;
  #difficulties: Promise<PrefabDifficulties>;
  #addedVersions: Promise<PrefabAddedVersions>;
  #latestAddedVersion: Promise<string>;
  #shiftActive = false;
  /**
   * Bumped by every `showFor` and `hide` so a late-resolving content
   * lookup that has since been superseded (newer hover or a hide)
   * never renders.
   */
  #token = 0;

  constructor(
    tooltip: HTMLElement,
    labelHandler: LabelHandler,
    difficulties: Promise<PrefabDifficulties>,
    addedVersions: Promise<PrefabAddedVersions>,
  ) {
    this.#view = new PrefabTooltip(tooltip);
    this.#labelHandler = labelHandler;
    this.#difficulties = difficulties;
    this.#addedVersions = addedVersions;
    this.#latestAddedVersion = addedVersions.then(latestAddedVersion);

    // WHY: track Shift globally so the hint highlight flips the moment the modifier is pressed or released, without needing pointer movement.
    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "Shift") this.#setShiftActive(true);
    });
    globalThis.addEventListener("keyup", (e) => {
      if (e.key === "Shift") this.#setShiftActive(false);
    });
    globalThis.addEventListener("blur", () => this.#setShiftActive(false));
  }

  /**
   * `anchor` is evaluated after the content lookup resolves so it
   * reflects the freshest pointer or camera state for the request that
   * wins the token race.
   */
  async showFor(
    prefab: Pick<Prefab, "name">,
    hints: TooltipHint[],
    anchor: () => { left: number; top: number },
  ): Promise<void> {
    const token = ++this.#token;
    const [labels, difficulties, addedVersions, latestVersion] = await Promise
      .all([
        this.#labelHandler.holder.get("prefabs"),
        this.#difficulties,
        this.#addedVersions,
        this.#latestAddedVersion,
      ]);
    if (token !== this.#token) return;
    const addedVersion = addedVersions[prefab.name];
    this.#view.render({
      prefab,
      label: labels.get(prefab.name) ?? "-",
      difficulty: difficulties[prefab.name] ?? 0,
      addedVersion,
      isAddedInLatestVersion: addedVersion === latestVersion,
      hints,
    });
    const { left, top } = anchor();
    this.#view.showAt(left, top);
  }

  hide(): void {
    this.#token++;
    this.#view.hide();
  }

  #setShiftActive(active: boolean): void {
    if (this.#shiftActive === active) return;
    this.#shiftActive = active;
    this.#view.setShiftActive(active);
  }
}
