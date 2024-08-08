import { LANGUAGES, Language, resolveLanguage } from "./labels";
import * as events from "./events";

interface Doms {
  language: HTMLSelectElement;
}

interface EventMessage {
  update: { lang: Language };
}

export class LabelHandler {
  #doms: Doms;
  #listener = new events.ListenerManager<"update", EventMessage>();

  constructor(doms: Doms, navigatorLanguages: readonly string[]) {
    this.#doms = doms;
    this.buildSelectOptions(navigatorLanguages);
    this.#doms.language.addEventListener("change", () => {
      this.#listener.dispatchNoAwait({ update: { lang: this.#doms.language.value as Language } });
    });
  }

  private buildSelectOptions(navigatorLanguages: readonly string[]) {
    const existingLangs = new Set(Array.from(this.#doms.language.options).map((o) => o.value));
    for (const lang of LANGUAGES) {
      if (existingLangs.has(lang)) {
        continue;
      }
      const option = document.createElement("option");
      option.textContent = lang;
      this.#doms.language.appendChild(option);
    }

    const browserLang = resolveLanguage(navigatorLanguages);
    if (this.#doms.language.value !== browserLang) {
      this.#doms.language.value = resolveLanguage(navigatorLanguages);
      requestAnimationFrame(() => this.#doms.language.dispatchEvent(new Event("change")));
    }
  }

  addListener(fn: (m: EventMessage) => void | Promise<void>) {
    this.#listener.addListener(fn);
  }
}
