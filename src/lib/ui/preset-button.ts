import { component } from "../dom-utils.ts";
import { requireNonnull } from "../utils.ts";

export function init(): void {
  document.body.addEventListener("click", ({ target }) => {
    if (
      target instanceof HTMLButtonElement &&
      target.dataset["inputFor"] !== null &&
      target.dataset["inputFor"] !== undefined
    ) {
      const input = component(target.dataset["inputFor"], HTMLInputElement);
      input.value = requireNonnull(
        target.dataset["inputText"] ?? target.textContent,
      );
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}
