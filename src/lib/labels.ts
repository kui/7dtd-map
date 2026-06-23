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

// Maps a BCP47 primary language subtag to a 7 Days to Die label set.
// Chinese is resolved separately because its label set depends on the script
// subtag (Hans vs Hant), which we derive via Intl.Locale's CLDR-backed
// Likely Subtags expansion.
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
  let locale: Intl.Locale;
  try {
    locale = new Intl.Locale(clientTag);
  } catch {
    return undefined;
  }
  if (locale.language === "zh") return resolveChinese(locale);
  return PRIMARY_SUBTAG_LANGUAGES[locale.language];
}

// Use Intl.Locale's `maximize()` (backed by CLDR Likely Subtags) to fill in the
// script subtag from language/region — so `zh-CN`, `zh-SG` expand to Hans and
// `zh-TW`, `zh-HK`, `zh-MO` expand to Hant without us hand-maintaining the
// region list. Bare `zh` expands to `zh-Hans-CN`, matching the upstream
// 7 Days to Die / Steam convention where `schinese` is the canonical Chinese
// label set.
function resolveChinese(locale: Intl.Locale): Language {
  return locale.maximize().script === "Hant" ? "tchinese" : "schinese";
}
