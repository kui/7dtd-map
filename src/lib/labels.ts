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

export class LabelHolder {
  static DEFAULT_LANGUAGE: Language = "english";

  private baseUrl: string;
  private defaultBlocks: Promise<Map<string, string>>;
  private defaultPrefabs: Promise<Map<string, string>>;

  #language: Language;
  #blocks: Promise<Labels>;
  #prefabs: Promise<Labels>;

  constructor(baseUrl: string, navigatorLanguages: readonly string[]) {
    this.baseUrl = baseUrl;
    this.#language = resolveLanguage(navigatorLanguages);
    this.defaultBlocks = this.fetchLabelMap(LabelHolder.DEFAULT_LANGUAGE, "blocks.json");
    this.defaultPrefabs = this.fetchLabelMap(LabelHolder.DEFAULT_LANGUAGE, "prefabs.json");
    this.#blocks = this.buildLabels(this.defaultBlocks, "blocks.json");
    this.#prefabs = this.buildLabels(this.defaultPrefabs, "prefabs.json");
  }

  get blocks(): Promise<Labels> {
    return this.#blocks;
  }

  get prefabs(): Promise<Labels> {
    return this.#prefabs;
  }

  set language(lang: Language) {
    if (lang === this.#language) return;
    console.log("LabelHolder set language: %s -> %s", this.#language, lang);
    this.#language = lang;
    this.#blocks = this.buildLabels(this.defaultBlocks, "blocks.json");
    this.#prefabs = this.buildLabels(this.defaultPrefabs, "prefabs.json");
  }

  async buildLabels(defaultLabels: Promise<Map<string, string>>, fileName: string): Promise<Labels> {
    return new Labels(await this.fetchLabelMap(this.#language, fileName), await defaultLabels);
  }

  async fetchLabelMap(language: Language, fileName: string): Promise<Map<string, string>> {
    return new Map(Object.entries(await fetchJson<Labels>(`${this.baseUrl}/${language}/${fileName}`)));
  }
}

export class Labels {
  labels: Map<string, string>;
  defaultLabels: Map<string, string>;

  constructor(labels: Map<string, string>, defaultLabels: Map<string, string>) {
    this.labels = labels;
    this.defaultLabels = defaultLabels;
  }

  get(key: string): string | undefined {
    return this.labels.get(key) ?? this.defaultLabels.get(key);
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

async function fetchJson<T>(path: string): Promise<T> {
  return (await fetch(path)).json();
}
