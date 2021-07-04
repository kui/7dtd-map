import { component, requireNonnull } from "./utils";

export function init(): void {
  for (const button of Array.from(document.querySelectorAll("[data-input-for]"))) {
    if (!(button instanceof HTMLElement)) continue;
    button.addEventListener("click", () => {
      const target = component(button.dataset.inputFor, HTMLInputElement);
      target.value = requireNonnull(button.dataset.inputText ?? button.textContent);
      target.dispatchEvent(new Event("input"));
    });
  }
}
