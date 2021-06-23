import { promises as fs } from "fs";
import csvParse from "csv-parse";

const EN_INDEX = 5;

type labelId = string;

export async function parseLabel(
  localizationFileName: string
): Promise<Map<labelId, string>> {
  const localization = await fs.readFile(localizationFileName);
  const labelArr = await new Promise((resolve, reject) => {
    csvParse(localization, (err: any, out: any) => {
      if (err) reject(err);
      else resolve(out);
    });
  });
  return (labelArr as any).reduce((r: any, l: any) => {
    r.set(l[0], l[EN_INDEX]);
    return r;
  }, new Map());
}
