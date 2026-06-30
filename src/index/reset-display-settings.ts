import { isFormValueElement } from "../lib/dom-utils.ts";
import { bindHoverHighlight } from "./controller-highlight.ts";

// Explicit whitelist (not "all [data-remember]") so keys representing loaded
// state, like "mapName", are not erased by the reset button. Must stay in
// sync with data-remember values in public/index.html.
const RESET_KEYS: readonly string[] = [
  "biomesAlpha",
  "splat3Alpha",
  "splat4Alpha",
  "radAlpha",
  "prefabFootprintAlpha",
  "brightness",
  "scale",
  "prefabSignSize",
  "prefabSignAlpha",
  "prefabFilterExcludeTest",
  "prefabFilterExcludeTiles",
  "prefabFilterExcludeDrivewayParts",
  "terrainViewerHelpToggle",
];

export function bindResetButton(button: HTMLButtonElement): void {
  button.addEventListener("click", resetDisplaySettings);
  bindHoverHighlight(button, allTargets);
}

function* allTargets(): Iterable<Element> {
  for (const key of RESET_KEYS) yield* querySelectorAllByKey(key);
}

function resetDisplaySettings(): void {
  for (const key of RESET_KEYS) {
    for (const el of querySelectorAllByKey(key)) {
      if (!isFormValueElement(el)) continue;
      restoreDefault(el);
      // Dispatch before removeItem: the persistence handler re-saves on
      // input, so removing first would leave the just-restored default in
      // localStorage.
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    localStorage.removeItem(key);
  }
}

function querySelectorAllByKey(key: string): NodeListOf<Element> {
  return document.querySelectorAll(`[data-remember="${CSS.escape(key)}"]`);
}

function restoreDefault(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): void {
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox" || el.type === "radio") {
      el.checked = el.defaultChecked;
      return;
    }
  }
  if (el instanceof HTMLSelectElement) {
    for (const opt of el.options) opt.selected = opt.defaultSelected;
    return;
  }
  el.value = el.defaultValue;
}
