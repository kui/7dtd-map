type Languages = [
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
  "tchinese"
];

type LabelId = string;

type LabelCore = {
  [lang in Languages[number]]: string;
};

type Label = {
  key: LabelId;
  file: string;
} & LabelCore;
