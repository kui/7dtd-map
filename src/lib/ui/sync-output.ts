import { component, isFormValueElement } from "../dom-utils.ts";

export function init(): void {
  for (const eventName of ["input", "change"]) {
    globalThis.addEventListener(eventName, ({ target }) => {
      if (!isFormValueElement(target)) return;
      const outputElements = document.querySelectorAll<HTMLOutputElement>(
        `output[data-sync-for="${target.id}"]`,
      );
      for (const output of outputElements) {
        output.value = formatValue(output, target.value);
      }
    });
  }

  for (
    const output of document.querySelectorAll<HTMLOutputElement>(
      "output[data-sync-for]",
    )
  ) {
    const input = component(output.dataset["syncFor"], HTMLInputElement);
    output.value = formatValue(output, input.value);
  }
}

function formatValue(output: HTMLOutputElement, value: string): string {
  if (output.classList.contains("alpha-output")) {
    const n = Number(value);
    if (Number.isFinite(n)) return n.toFixed(1);
  }
  if (output.classList.contains("scale-output")) {
    const n = Number(value);
    if (Number.isFinite(n)) return n.toFixed(2);
  }
  return value;
}
