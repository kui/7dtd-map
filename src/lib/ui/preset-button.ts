import { component } from "../dom-utils.ts";
import { requireNonnull } from "../utils.ts";

export function init(): void {
  document.body.addEventListener("click", ({ target }) => {
    if (!(target instanceof HTMLButtonElement)) return;

    const specs: { id: string; value: string }[] = [];

    for (const [key, value] of Object.entries(target.dataset)) {
      const m = key.match(/^inputFor(.*)$/);
      if (m === null || value === undefined) continue;
      const suffix = m[1];
      const valueKey: string = suffix ? `inputValue${suffix}` : "inputValue";
      specs.push({
        id: value,
        value: target.dataset[valueKey] ?? target.textContent ?? "",
      });
    }

    if (specs.length === 0) return;

    for (const { id, value } of specs) {
      const input = component(id, HTMLInputElement);
      input.value = requireNonnull(value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}
