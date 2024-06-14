import * as utils from "./lib/utils";
import { parseLabel, LANGUAGES, Language, Label } from "./lib/label-parser";
import * as path from "path";
import { promises as fs } from "fs";

const DEST_DIR = utils.projectRoot("docs", "labels");

async function main() {
  const vanillaDir = await utils.vanillaDir();
  const labels = await parseLabel(path.join(vanillaDir, "Data", "Config", "Localization.txt"));

  for (const lang of LANGUAGES) {
    const dir = path.join(DEST_DIR, lang);
    await fs.mkdir(dir, { recursive: true });
    await extract(labels, ["blocks"], lang, path.join(dir, "blocks.json"));
    await extract(labels, ["POI"], lang, path.join(dir, "prefabs.json"));
  }

  return 0;
}

async function extract(labels: Map<string, Label>, files: string[], lang: Language, outputFile: string) {
  const extracted = Object.fromEntries(
    (function* () {
      for (const [id, label] of labels.entries()) {
        if (!files.includes(label.file)) continue;
        if (!label[lang]) continue;
        yield [id, label[lang]];
      }
    })(),
  );
  console.log("Load %d labels for %s", Object.keys(extracted).length, path.basename(outputFile));
  await writeJsonFile(outputFile, extracted);
}

async function writeJsonFile(file: string, json: unknown) {
  await fs.writeFile(file, JSON.stringify(json, null, "\t"));
  console.log("Write %s", file);
}

utils.handleMain(main());
