import { LANGUAGES, Language } from "./labels";

interface Doms {
  language: HTMLSelectElement;
}

export class LabelHandler {
  private doms: Doms;
  private listener: ((lang: Language) => void)[] = [];

  constructor(doms: Doms) {
    this.doms = doms;
    this.buildSelectOptions();
    this.doms.language.addEventListener("change", () => {
      this.listener.map((fn) => fn(this.doms.language.value as Language));
    });
  }

  private buildSelectOptions() {
    const existingLangs = new Set(Array.from(this.doms.language.options).map((o) => o.value));
    for (const lang of LANGUAGES) {
      if (existingLangs.has(lang)) {
        continue;
      }
      const option = document.createElement("option");
      option.textContent = lang;
      this.doms.language.appendChild(option);
    }
  }

  addListener(fn: (lang: Language) => void) {
    this.listener.push(fn);
  }
}