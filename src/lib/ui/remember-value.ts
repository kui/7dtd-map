// Store the value in the local storage
// And restore it when the page is reloaded

export function init() {
  for (const eventName of ["input", "change"]) {
    globalThis.addEventListener(eventName, ({ target }) => {
      if (!(target instanceof HTMLInputElement) || !(target instanceof HTMLTextAreaElement || !(target instanceof HTMLSelectElement))) {
        return;
      }
      const key = target.dataset["remember"];
      if (key) localStorage.setItem(key, target.value);
    });
  }

  for (const input of document.querySelectorAll<HTMLInputElement>("input[data-remember]")) {
    const key = input.dataset["remember"];
    if (key === undefined) continue;
    const value = localStorage.getItem(key);
    if (value !== null) input.value = value;
  }
}
