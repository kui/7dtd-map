const LANGUAGES = [
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

type Languages = typeof LANGUAGES;

type LabelCore = {
  [lang in Languages[number]]: string;
};

type Label = {
  key: LabelId;
  file: string;
} & LabelCore;
