import { component } from "./utils";

export function init(): void {
  for (const output of Array.from(document.querySelectorAll("output[data-sync-for]")) as HTMLOutputElement[]) {
    const input = component(output.dataset.syncFor, HTMLInputElement);
    output.value = input.value;
    input.addEventListener("input", () => (output.value = input.value));
  }
}
