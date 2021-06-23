import { promises as fs } from "fs";
import { parseString as parseXmlString } from "xml2js";

export async function parseXml(xmlFileName: string): Promise<any> {
  const xml = await fs.readFile(xmlFileName);
  return new Promise((resolve, reject) => {
    parseXmlString(xml, (err: any, result: any) => {
      if (err) reject(err);
      if (result) resolve(result);
      reject(Error("Unexpected state"));
    });
  });
}
