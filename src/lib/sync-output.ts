import { component } from "./utils";

export function init(): void {
  for (const output of document.querySelectorAll<HTMLOutputElement>("output[data-sync-for]")) {
    const input = component(output.dataset.syncFor, HTMLInputElement);
    output.value = input.value;
    input.addEventListener("input", () => (output.value = input.value));
  }
}
