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

    const stored = localStorage.getItem("language");
    const browserLang = (stored as Language | null) ??
      resolveLanguage(navigatorLanguages);
    const needsAdjust = this.#doms.language.value !== browserLang;
    if (needsAdjust) {
      this.#doms.language.value = browserLang;
    }
    // Synchronize the holder with the resolved language so that callers can
    // pull the current language via `labelHandler.language` / `holder` right
    // after construction. Subscribers receive subsequent user changes via
    // `addListener`; the initial value is delivered by pull, not push.
    this.#holder.language = browserLang;
    if (needsAdjust && stored !== browserLang) {
      localStorage.setItem("language", browserLang);
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
