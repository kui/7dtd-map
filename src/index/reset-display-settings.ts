import { isFormValueElement } from "../lib/dom-utils.ts";

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

const HIGHLIGHT_CLASS = "reset-target-highlight";

export function bindResetButton(button: HTMLButtonElement): void {
  button.addEventListener("click", resetDisplaySettings);
  button.addEventListener("mouseenter", () => setHighlight(true));
  button.addEventListener("mouseleave", () => setHighlight(false));
  button.addEventListener("focus", () => setHighlight(true));
  button.addEventListener("blur", () => setHighlight(false));
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

function setHighlight(on: boolean): void {
  for (const key of RESET_KEYS) {
    for (const el of querySelectorAllByKey(key)) {
      // tr for controller rows, li for Excludes checkboxes. Targets without
      // either ancestor (e.g. inside a dialog) are still reset but unmarked.
      const row = el.closest("tr, li");
      if (row) row.classList.toggle(HIGHLIGHT_CLASS, on);
      // Closed <details> hide their rows, so mark the collapsed section
      // itself to give the user a visible cue.
      for (
        let d = el.closest("details");
        d;
        d = d.parentElement?.closest("details") ?? null
      ) {
        if (!d.open) d.classList.toggle(HIGHLIGHT_CLASS, on);
      }
    }
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
