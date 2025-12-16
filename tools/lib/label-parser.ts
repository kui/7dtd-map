import * as fs from "node:fs";
import { parse as csvParse, Parser } from "csv-parse";

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

export type LabelId = string;

type LabelCore = {
  [lang in Language]: string;
};

export type Label = {
  key: LabelId;
  file: string;
} & LabelCore;

type LocalizationLine = {
  Key: LabelId;
  File: string;
} & LabelCore;

export function parseLabel(localizationFileName: string): Promise<Map<LabelId, Label>> {
  const parser = fs.createReadStream(localizationFileName).pipe(csvParse({ columns: true }));
  return reduceToLabelMap(parser);
}

async function reduceToLabelMap(parser: Parser): Promise<Map<string, Label>> {
  const labels = new Map<string, Label>();
  for await (const line of parser) {
    if (!isLocalizationLine(line)) throw Error("Unexpected line: empty label key");
    if (labels.has(line.Key)) console.warn("Unexpected line: duplicated label key: ", line.Key);
    labels.set(line.Key, { key: line.Key, file: line.File, ...line });
  }
  return labels;
}

function isLocalizationLine(line: unknown): line is LocalizationLine {
  const n = (line as Partial<LocalizationLine>).Key?.length;
  return n !== undefined && n > 0;
}
