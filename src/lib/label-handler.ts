import { LANGUAGES, Language, resolveLanguage } from "./labels";

interface Doms {
  language: HTMLSelectElement;
}

export class LabelHandler {
  private doms: Doms;
  private listener: ((lang: Language) => void)[] = [];

  constructor(doms: Doms, navigatorLanguages: readonly string[]) {
    this.doms = doms;
    this.buildSelectOptions(navigatorLanguages);
    this.doms.language.addEventListener("change", () => {
      this.listener.map((fn) => fn(this.doms.language.value as Language));
    });
  }

  private buildSelectOptions(navigatorLanguages: readonly string[]) {
    const existingLangs = new Set(Array.from(this.doms.language.options).map((o) => o.value));
    for (const lang of LANGUAGES) {
      if (existingLangs.has(lang)) {
        continue;
      }
      const option = document.createElement("option");
      option.textContent = lang;
      this.doms.language.appendChild(option);
    }

    const browserLang = resolveLanguage(navigatorLanguages);
    if (this.doms.language.value !== browserLang) {
      this.doms.language.value = resolveLanguage(navigatorLanguages);
      requestAnimationFrame(() => this.doms.language.dispatchEvent(new Event("change")));
    }
  }

  addListener(fn: (lang: Language) => void) {
    this.listener.push(fn);
  }
}
