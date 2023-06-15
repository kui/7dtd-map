import fs from "fs";
import { Parser, parse as csvParse } from "csv-parse";

export type LabelId = string;

const LANGUAGES: Languages = [
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
];

type LocalizationLine = {
  Key: LabelId;
  File: string;
} & LabelCore;

export async function parseLabel(localizationFileName: string): Promise<Map<LabelId, Label>> {
  const parser = fs.createReadStream(localizationFileName).pipe(csvParse({ columns: true }));
  return reduceToLabelMap(parser);
}

async function reduceToLabelMap(parser: Parser): Promise<Map<string, Label>> {
  const labels = new Map<string, Label>();
  for await (const line of parser) {
    if (isLocalizationLine(line)) {
      labels.set(line.Key, {
        key: line.Key,
        file: line.File,
        ...LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: line[lang] }), {} as LabelCore),
      });
    } else {
      throw Error("Unexpected line in Localization file");
    }
  }
  return labels;
}

function isLocalizationLine(line: unknown): line is LocalizationLine {
  return ((line as LocalizationLine).Key?.length ?? 0) > 0;
}
