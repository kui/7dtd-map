// Restores display-preference inputs persisted by remember-value.ts to their
// HTML defaults. The whitelist is explicit (not "all [data-remember]") so that
// session/loaded-state keys like "mapName" stay untouched.

import { isFormValueElement } from "../lib/dom-utils.ts";

// Keys must match data-remember values in public/index.html.
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

export function resetDisplaySettings(): void {
  for (const key of RESET_KEYS) {
    const selector = `[data-remember="${CSS.escape(key)}"]`;
    for (const el of document.querySelectorAll(selector)) {
      if (!isFormValueElement(el)) continue;
      restoreDefault(el);
      // Listeners (sync-output, persistence handler) react via this event.
      // The persistence handler will re-save the default; removing the key
      // afterward fully forgets the customisation.
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    localStorage.removeItem(key);
  }
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
