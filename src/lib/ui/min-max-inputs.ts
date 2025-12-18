// Sync values between two inputs, one for max and one for min.

export function init() {
  for (const eventName of ["input", "change"]) {
    globalThis.addEventListener(eventName, ({ target }) => {
      if (!(target instanceof HTMLInputElement)) return;
      updateMinMax(target);
    });
  }

  for (const input of [
    ...document.querySelectorAll<HTMLInputElement>("input[data-max]"),
    ...document.querySelectorAll<HTMLInputElement>("input[data-min]"),
  ]) {
    updateMinMax(input);
  }
}

function updateMinMax(target: HTMLInputElement) {
  if (target.dataset["min"]) updateMaxValues(target, target.dataset["min"]);
  if (target.dataset["max"]) updateMinValues(target, target.dataset["max"]);
}

function updateMaxValues(target: HTMLInputElement, minMaxId: string) {
  const maxInputs = document.querySelectorAll<HTMLInputElement>(`input[data-max="${minMaxId}"]`);
  for (const maxInput of maxInputs) {
    if (maxInput.valueAsNumber < target.valueAsNumber) {
      const oldValue = maxInput.value;
      maxInput.value = target.value;
      if (oldValue !== maxInput.value) dispatchInputEvent(maxInput);
    }
  }
}

function updateMinValues(target: HTMLInputElement, minMaxId: string) {
  const minInputs = document.querySelectorAll<HTMLInputElement>(`input[data-min="${minMaxId}"]`);
  for (const minInput of minInputs) {
    if (minInput.valueAsNumber > target.valueAsNumber) {
      const oldValue = minInput.value;
      minInput.value = target.value;
      if (oldValue !== minInput.value) dispatchInputEvent(minInput);
    }
  }
}

function dispatchInputEvent(input: HTMLInputElement) {
  for (const eventName of ["input", "change"]) {
    input.dispatchEvent(new Event(eventName, { bubbles: true }));
  }
}
