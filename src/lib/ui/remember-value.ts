// Store the value in the local storage
// And restore it when the page is reloaded

import { isFormValueElement } from "../dom-utils.ts";

export function init() {
  for (const eventName of ["input", "change"]) {
    globalThis.addEventListener(eventName, ({ target }) => {
      if (!isFormValueElement(target)) return;
      const key = target.dataset["remember"];
      if (key) localStorage.setItem(key, target.value);
    });
  }

  for (const element of document.querySelectorAll("[data-remember]")) {
    if (!isFormValueElement(element)) continue;
    const key = element.dataset["remember"];
    if (key === undefined) continue;
    const value = localStorage.getItem(key);
    if (value !== null) element.value = value;
  }
}
