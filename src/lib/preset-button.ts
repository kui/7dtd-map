import { component, requireNonnull } from "./utils";

export function init(): void {
  document.body.addEventListener("click", ({ target }) => {
    if (target instanceof HTMLButtonElement && target.dataset["inputFor"] != null) {
      const input = component(target.dataset["inputFor"], HTMLInputElement);
      input.value = requireNonnull(target.dataset["inputText"] ?? target.textContent);
      input.dispatchEvent(new Event("input"));
    }
  });
}
