import { component } from "../utils.ts";

export function init(): void {
  for (const eventName of ["input", "change"]) {
    globalThis.addEventListener(eventName, ({ target }) => {
      if (!(target instanceof HTMLInputElement) || !(target instanceof HTMLTextAreaElement || !(target instanceof HTMLSelectElement))) {
        return;
      }
      const outputElements = document.querySelectorAll<HTMLOutputElement>(`output[data-sync-for="${target.id}"]`);
      for (const output of outputElements) {
        output.value = target.value;
      }
    });
  }

  for (const output of document.querySelectorAll<HTMLOutputElement>("output[data-sync-for]")) {
    const input = component(output.dataset["syncFor"], HTMLInputElement);
    output.value = input.value;
  }
}
