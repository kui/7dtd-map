import { fetchJson } from "./utils.ts";

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

// Maps a BCP47 primary language subtag (lowercase) to a 7 Days to Die label set.
// Chinese is resolved separately so script/region subtags can disambiguate
// Simplified vs Traditional.
const PRIMARY_SUBTAG_LANGUAGES: { [primary: string]: Language } = {
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
};

// Regions that imply Simplified Chinese (mainland China, Singapore).
const SIMPLIFIED_CHINESE_REGIONS = new Set(["cn", "sg"]);
// Regions that imply Traditional Chinese (Taiwan, Hong Kong, Macao).
const TRADITIONAL_CHINESE_REGIONS = new Set(["tw", "hk", "mo"]);

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
    this.#fallbacks = new Map(
      FILE_BASE_NAMES.map((n) =>
        [n, this.#fetchLabelMap(LabelHolder.DEFAULT_LANGUAGE, n)] as const
      ),
    );
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
    if (!fallback) {
      throw new Error(`No fallback for ${this.#language}/${fileBaseName}`);
    }
    const [labels, fallbackLabels] = await Promise.all([
      this.#fetchLabelMap(this.#language, fileBaseName),
      fallback,
    ]);
    return new Labels(labels, fallbackLabels);
  }

  async #fetchLabelMap(
    language: Language,
    fileId: FileBaseName,
  ): Promise<Map<string, string>> {
    return new Map(
      Object.entries(
        await fetchJson(`${this.#baseUrl}/${language}/${fileId}.json`),
      ),
    );
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
    const match = matchLanguage(clientTag);
    if (match) return match;
  }
  return LabelHolder.DEFAULT_LANGUAGE;
}

function matchLanguage(clientTag: string): Language | undefined {
  const subtags = clientTag.toLowerCase().split("-").filter((s) =>
    s.length > 0
  );
  const primary = subtags[0];
  if (!primary) return undefined;
  if (primary === "zh") return resolveChinese(subtags.slice(1));
  return PRIMARY_SUBTAG_LANGUAGES[primary];
}

// Bare `zh` (no script/region) defaults to Simplified, matching the upstream
// 7 Days to Die / Steam convention where `schinese` is the canonical Chinese
// label set.
function resolveChinese(subtags: readonly string[]): Language {
  for (const subtag of subtags) {
    if (subtag === "hans") return "schinese";
    if (subtag === "hant") return "tchinese";
    if (SIMPLIFIED_CHINESE_REGIONS.has(subtag)) return "schinese";
    if (TRADITIONAL_CHINESE_REGIONS.has(subtag)) return "tchinese";
  }
  return "schinese";
}
