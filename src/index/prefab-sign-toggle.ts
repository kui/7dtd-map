import { bindHoverHighlight } from "./controller-highlight.ts";

const ALPHA_ID = "prefab-sign-alpha";
const SIZE_ID = "prefab-sign-size";

export function bindPrefabSignToggleButton(button: HTMLButtonElement): void {
  const alpha = document.getElementById(ALPHA_ID) as HTMLInputElement;
  button.addEventListener("click", () => {
    alpha.value = parseFloat(alpha.value) > 0 ? "0" : "1";
    alpha.dispatchEvent(new Event("input", { bubbles: true }));
  });
  bindHoverHighlight(button, function* () {
    for (const id of [ALPHA_ID, SIZE_ID]) {
      const el = document.getElementById(id);
      if (el) yield el;
    }
  });
}
