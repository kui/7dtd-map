import { promises as fs } from "fs";
import { parse as csvParse } from "csv-parse";

const EN_INDEX = 5;

type LabelId = string;

export async function parseLabel(localizationFileName: string): Promise<Map<LabelId, string>> {
  const rows = await parseCsv(localizationFileName);
  return rows.reduce<Map<LabelId, string>>((r, l) => {
    r.set(l[0], l[EN_INDEX]);
    return r;
  }, new Map());
}
async function parseCsv(localizationFileName: string): Promise<string[][]> {
  const localization = await fs.readFile(localizationFileName);
  return new Promise((resolve, reject) => {
    csvParse(localization, (err, out) => {
      if (err) reject(err);
      else resolve(out);
    });
  });
}
