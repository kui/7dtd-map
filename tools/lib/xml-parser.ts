import * as fs from "node:fs/promises";
import { parseString as parseXmlString } from "xml2js";

export async function parseXml(xmlFileName: string): Promise<unknown> {
  const xml = await fs.readFile(xmlFileName);
  return new Promise((resolve, reject) => {
    parseXmlString(xml, (err: unknown, result: unknown) => {
      if (err) reject(err);
      if (result) resolve(result);

      reject(Error("Unexpected state"));
    });
  });
}
