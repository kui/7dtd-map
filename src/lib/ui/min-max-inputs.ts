export function init() {
  for (const eventName of ["input", "change"]) {
    globalThis.addEventListener(eventName, ({ target }) => {
      if (!(target instanceof HTMLInputElement)) return;
      updateMinMax(target);
    });
  }

  for (
    const input of [
      ...document.querySelectorAll<HTMLInputElement>("input[data-max]"),
      ...document.querySelectorAll<HTMLInputElement>("input[data-min]"),
    ]
  ) {
    updateMinMax(input);
  }
}

/**
 * A value carrying `data-min` is a lower bound for the `data-max`
 * inputs it references, and vice versa.
 */
function updateMinMax(target: HTMLInputElement) {
  if (target.dataset["min"]) {
    updateBounded(target, "max", target.dataset["min"]);
  }
  if (target.dataset["max"]) {
    updateBounded(target, "min", target.dataset["max"]);
  }
}

function updateBounded(
  target: HTMLInputElement,
  bound: "min" | "max",
  minMaxId: string,
) {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    `input[data-${bound}="${minMaxId}"]`,
  );
  for (const input of inputs) {
    const violatesBound = bound === "max"
      ? input.valueAsNumber < target.valueAsNumber
      : input.valueAsNumber > target.valueAsNumber;
    if (violatesBound) {
      const oldValue = input.value;
      input.value = target.value;
      if (oldValue !== input.value) dispatchInputEvent(input);
    }
  }
}

function dispatchInputEvent(input: HTMLInputElement) {
  for (const eventName of ["input", "change"]) {
    input.dispatchEvent(new Event(eventName, { bubbles: true }));
  }
}
