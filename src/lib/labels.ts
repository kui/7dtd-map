import { fetchJson } from "./utils";

export const LANGUAGES = [
  "english",
  "german",
  "spanish",
  "french",
  "italian",
  "japanese",
  "koreana",
  "polish",
  "brazilian",
  "russian",
  "turkish",
  "schinese",
  "tchinese",
] as const;
export type Language = (typeof LANGUAGES)[number];

const LANGUAGE_TAGS: { [tag: string]: Language } = {
  en: "english",
  de: "german",
  es: "spanish",
  fr: "french",
  it: "italian",
  ja: "japanese",
  ko: "koreana",
  pl: "polish",
  pt: "brazilian",
  ru: "russian",
  tr: "turkish",
  "zh-CN": "schinese",
  "zh-TW": "tchinese",
};

const FILE_BASE_NAMES = ["blocks", "prefabs", "shapes"] as const;
type FileBaseName = (typeof FILE_BASE_NAMES)[number];

export class LabelHolder {
  static DEFAULT_LANGUAGE: Language = "english";

  #baseUrl: string;
  #language: Language;
  #fallbacks: Map<FileBaseName, Promise<Map<string, string>>>;
  #labels: Map<FileBaseName, Promise<Labels>>;

  constructor(baseUrl: string, navigatorLanguages: readonly string[]) {
    this.#baseUrl = baseUrl;
    this.#language = resolveLanguage(navigatorLanguages);
    this.#fallbacks = new Map(FILE_BASE_NAMES.map((n) => [n, this.#fetchLabelMap(LabelHolder.DEFAULT_LANGUAGE, n)] as const));
    this.#labels = this.#buildAllLabels();
  }

  get(fileId: FileBaseName): Promise<Labels> {
    const labels = this.#labels.get(fileId);
    if (!labels) throw new Error(`No labels for ${this.#language}/${fileId}`);
    return labels;
  }

  set language(lang: Language) {
    if (lang === this.#language) return;
    console.log("LabelHolder set language: %s -> %s", this.#language, lang);
    this.#language = lang;
    this.#labels = this.#buildAllLabels();
  }

  #buildAllLabels(): Map<FileBaseName, Promise<Labels>> {
    return new Map(FILE_BASE_NAMES.map((n) => [n, this.#buildLabels(n)]));
  }

  async #buildLabels(fileBaseName: FileBaseName): Promise<Labels> {
    const fallback = this.#fallbacks.get(fileBaseName);
    if (!fallback) throw new Error(`No fallback for ${this.#language}/${fileBaseName}`);
    return new Labels(await this.#fetchLabelMap(this.#language, fileBaseName), await fallback);
  }

  async #fetchLabelMap(language: Language, fileId: FileBaseName): Promise<Map<string, string>> {
    return new Map(Object.entries(await fetchJson(`${this.#baseUrl}/${language}/${fileId}.json`)));
  }
}

export class Labels {
  #labels: Map<string, string>;
  #fallback: Map<string, string>;

  constructor(labels: Map<string, string>, defaultLabels: Map<string, string>) {
    this.#labels = labels;
    this.#fallback = defaultLabels;
  }

  get(key: string): string | undefined {
    return this.#labels.get(key) ?? this.#fallback.get(key);
  }
}

export function resolveLanguage(languages: readonly string[]): Language {
  for (const clientTag of languages) {
    for (const [tag, lang] of Object.entries(LANGUAGE_TAGS)) {
      if (clientTag.startsWith(tag)) return lang;
    }
  }
  return LabelHolder.DEFAULT_LANGUAGE;
}
