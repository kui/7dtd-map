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

export class LabelHolder {
  private baseUrl: string;
  private defaultBlocks: Promise<Map<string, string>>;
  private defaultPrefabs: Promise<Map<string, string>>;

  #language: Language;
  #blocks: Promise<Labels>;
  #prefabs: Promise<Labels>;

  constructor(baseUrl: string, defaultLanguage: Language) {
    this.baseUrl = baseUrl;
    this.#language = defaultLanguage;
    this.defaultBlocks = this.fetchLabelMap(defaultLanguage, "blocks.json");
    this.defaultPrefabs = this.fetchLabelMap(defaultLanguage, "prefabs.json");
    this.#blocks = this.buildLabels(this.defaultBlocks, defaultLanguage, "blocks.json");
    this.#prefabs = this.buildLabels(this.defaultPrefabs, defaultLanguage, "prefabs.json");
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
    this.#blocks = this.buildLabels(this.defaultBlocks, this.#language, "blocks.json");
    this.#prefabs = this.buildLabels(this.defaultPrefabs, this.#language, "prefabs.json");
  }

  async buildLabels(defaultLabels: Promise<Map<string, string>>, language: Language, fileName: string): Promise<Labels> {
    const newMap = await this.fetchLabelMap(language, fileName);
    return new Labels(newMap, await defaultLabels);
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

async function fetchJson<T>(path: string): Promise<T> {
  return (await fetch(path)).json();
}
