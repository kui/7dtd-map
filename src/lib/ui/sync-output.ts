import { component, isFormValueElement } from "../dom-utils.ts";

export function init(): void {
  for (const eventName of ["input", "change"]) {
    globalThis.addEventListener(eventName, ({ target }) => {
      if (!isFormValueElement(target)) return;
      const outputElements = document.querySelectorAll<HTMLOutputElement>(
        `output[data-sync-for="${target.id}"]`,
      );
      for (const output of outputElements) {
        output.value = target.value;
      }
    });
  }

  for (
    const output of document.querySelectorAll<HTMLOutputElement>(
      "output[data-sync-for]",
    )
  ) {
    const input = component(output.dataset["syncFor"], HTMLInputElement);
    output.value = input.value;
  }
}
