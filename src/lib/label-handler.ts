import { LabelHolder, Language, LANGUAGES, resolveLanguage } from "./labels.ts";
import * as events from "./events.ts";

interface Doms {
  language: HTMLSelectElement;
}

interface EventMessage {
  lang: Language;
}

export class LabelHandler {
  #doms: Doms;
  #listener = new events.ListenerManager<EventMessage>();
  #holder: LabelHolder;

  constructor(
    doms: Doms,
    labelsBaseUrl: string,
    navigatorLanguages: readonly string[],
  ) {
    this.#doms = doms;
    this.#holder = new LabelHolder(labelsBaseUrl, navigatorLanguages);
    this.#buildSelectOptions();
    // Resolve and apply the initial language synchronously so that callers
    // can pull it via `labelHandler.language` / `holder` right after
    // construction. The initial value is delivered by pull, not push;
    // subscribers only receive subsequent user changes via `addListener`.
    this.#commitLanguage(
      (localStorage.getItem("language") as Language | null) ??
        resolveLanguage(navigatorLanguages),
    );
    this.#doms.language.addEventListener("change", () => {
      const lang = this.language;
      if (lang === localStorage.getItem("language")) return;
      this.#commitLanguage(lang);
      this.#listener.dispatchNoAwait({ lang });
    });
  }

  #buildSelectOptions() {
    const existingLangs = new Set(
      Array.from(this.#doms.language.options).map((o) => o.value),
    );
    for (const lang of LANGUAGES) {
      if (existingLangs.has(lang)) continue;
      const option = document.createElement("option");
      option.textContent = lang;
      this.#doms.language.appendChild(option);
    }
  }

  #commitLanguage(lang: Language) {
    this.#doms.language.value = lang;
    this.#holder.language = lang;
    localStorage.setItem("language", lang);
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
