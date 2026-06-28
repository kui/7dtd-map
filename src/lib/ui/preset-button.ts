import { component } from "../dom-utils.ts";

export function init(): void {
  document.body.addEventListener("click", ({ target }) => {
    if (!(target instanceof HTMLButtonElement)) return;

    for (const attr of target.attributes) {
      if (!attr.name.startsWith("data-input-")) continue;
      const id = attr.name.slice("data-input-".length);
      if (id === "") continue;
      const input = component(id, HTMLInputElement);
      input.value = attr.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}
