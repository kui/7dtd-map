import { isFormValueElement } from "../dom-utils.ts";

type FormValueElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export function init() {
  for (const eventName of ["input", "change"]) {
    globalThis.addEventListener(eventName, ({ target }) => {
      if (!isFormValueElement(target)) return;
      const key = target.dataset["remember"];
      if (!key) return;
      const serialized = serialize(target);
      if (serialized !== null) localStorage.setItem(key, serialized);
    });
  }

  const restoredKeys = new Set<string>();
  for (const element of document.querySelectorAll("[data-remember]")) {
    if (!isFormValueElement(element)) continue;
    const key = element.dataset["remember"];
    if (key === undefined || restoredKeys.has(key)) continue;
    restoredKeys.add(key);
    const stored = localStorage.getItem(key);
    if (stored === null) continue;
    restore(key, stored);
  }
}

function serialize(el: FormValueElement): string | null {
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox") return el.checked ? "1" : "0";
    // WHY: a radio "change" only fires on the newly-checked element, so the unchecked sibling must not overwrite the group.
    if (el.type === "radio") return el.checked ? el.value : null;
  }
  return el.value;
}

function restore(key: string, stored: string): void {
  const selector = `[data-remember="${CSS.escape(key)}"]`;
  for (const el of document.querySelectorAll(selector)) {
    if (!isFormValueElement(el)) continue;
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox") {
        el.checked = stored === "1";
        continue;
      }
      if (el.type === "radio") {
        el.checked = el.value === stored;
        continue;
      }
    }
    el.value = stored;
  }
}
