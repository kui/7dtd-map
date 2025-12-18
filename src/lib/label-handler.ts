import { LabelHolder, Language, LANGUAGES, resolveLanguage } from "./labels.ts";
import * as events from "./events.ts";

interface Doms {
  language: HTMLSelectElement;
}

interface EventMessage {
  update: { lang: Language };
}

export class LabelHandler {
  #doms: Doms;
  #listener = new events.ListenerManager<"update", EventMessage>();
  #holder: LabelHolder;

  constructor(
    doms: Doms,
    labelsBaseUrl: string,
    navigatorLanguages: readonly string[],
  ) {
    this.#doms = doms;
    this.#holder = new LabelHolder(labelsBaseUrl, navigatorLanguages);
    this.#buildSelectOptions(navigatorLanguages);
    this.#doms.language.addEventListener("change", () => {
      const lang = this.#doms.language.value as Language;
      if (lang === localStorage.getItem("language")) return;
      localStorage.setItem("language", lang);
      this.holder.language = lang;
      this.#listener.dispatchNoAwait({ update: { lang } });
    });
  }

  #buildSelectOptions(navigatorLanguages: readonly string[]) {
    const existingLangs = new Set(
      Array.from(this.#doms.language.options).map((o) => o.value),
    );
    for (const lang of LANGUAGES) {
      if (existingLangs.has(lang)) continue;
      const option = document.createElement("option");
      option.textContent = lang;
      this.#doms.language.appendChild(option);
    }

    const browserLang = localStorage.getItem("language") ??
      resolveLanguage(navigatorLanguages);
    if (this.#doms.language.value !== browserLang) {
      this.#doms.language.value = browserLang;
      requestAnimationFrame(() => this.#doms.language.dispatchEvent(new Event("change")));
    }
  }

  addListener(fn: (m: EventMessage) => void | Promise<void>) {
    this.#listener.addListener(fn);
  }

  get language(): Language {
    return this.#doms.language.value as Language;
  }

  get holder(): LabelHolder {
    return this.#holder;
  }
}
