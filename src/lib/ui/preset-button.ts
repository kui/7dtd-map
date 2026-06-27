import { component } from "../dom-utils.ts";
import { requireNonnull } from "../utils.ts";

export function init(): void {
  document.body.addEventListener("click", ({ target }) => {
    if (!(target instanceof HTMLButtonElement)) return;

    const specs: { id: string; text: string }[] = [];

    for (const [key, value] of Object.entries(target.dataset)) {
      const m = key.match(/^inputFor(.*)$/);
      if (m === null || value === undefined) continue;
      const suffix = m[1];
      const textKey: string = suffix ? `inputText${suffix}` : "inputText";
      specs.push({
        id: value,
        text: target.dataset[textKey] ?? target.textContent ?? "",
      });
    }

    if (specs.length === 0) return;

    for (const { id, text } of specs) {
      const input = component(id, HTMLInputElement);
      input.value = requireNonnull(text);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}
