import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Label, Language, LANGUAGES, parseLabel } from "./lib/label-parser.ts";
import { handleMain, publishDir, vanillaDir } from "./lib/utils.ts";

const DEST_DIR = publishDir("labels");

async function main() {
  const labels = await parseLabel(await vanillaDir("Data", "Config", "Localization.txt"));

  for (const lang of LANGUAGES) {
    const dir = path.join(DEST_DIR, lang);
    await fs.mkdir(dir, { recursive: true });
    await extract(labels, "blocks", lang, path.join(dir, "blocks.json"));
    await extract(labels, "POI", lang, path.join(dir, "prefabs.json"));
    await extract(labels, "shapes", lang, path.join(dir, "shapes.json"));
  }

  return 0;
}

async function extract(labels: Map<string, Label>, file: string, lang: Language, outputFile: string) {
  const extracted = Object.fromEntries(
    Array.from(labels)
      .flatMap<[string, string]>(([id, label]) => {
        if (file !== label.file) return [];
        if (!label[lang]) return [];
        return [[id, label[lang]]];
      })
      .toSorted((a, b) => a[0].localeCompare(b[0])),
  );
  console.log("Load %d labels for %s", Object.keys(extracted).length, path.basename(outputFile));
  await writeJsonFile(outputFile, extracted);
}

async function writeJsonFile(file: string, json: unknown) {
  await fs.writeFile(file, JSON.stringify(json, null, "\t"));
  console.log("Write %s", file);
}

handleMain(main());
