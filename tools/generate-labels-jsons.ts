import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Label, Language, LANGUAGES, parseLabel } from "./lib/label-parser.ts";
import {
  buildArrayMapByEntries,
  handleMain,
  publishDir,
  throttleAll,
  vanillaDir,
  writeJsonFile,
} from "./lib/utils.ts";

const DEST_DIR = publishDir("labels");
const LANG_CONCURRENCY = 8;

async function main() {
  const labels = await parseLabel(
    vanillaDir("Data", "Config", "Localization.csv"),
  );

  // WHY: per-language extraction would otherwise re-scan the full label Map for every (lang, file) pair.
  const labelsByFile = buildArrayMapByEntries(
    Array.from(labels, ([id, label]) => [label.file, [id, label] as const]),
  );

  await throttleAll(
    LANGUAGES.map((lang) => () => processLang(labelsByFile, lang)),
    LANG_CONCURRENCY,
  );

  return 0;
}

async function processLang(
  labelsByFile: Map<string, (readonly [string, Label])[]>,
  lang: Language,
) {
  const dir = path.join(DEST_DIR, lang);
  await fs.mkdir(dir, { recursive: true });
  await Promise.all([
    extract(labelsByFile, "blocks", lang, path.join(dir, "blocks.json")),
    extract(labelsByFile, "POI", lang, path.join(dir, "prefabs.json")),
    extract(labelsByFile, "shapes", lang, path.join(dir, "shapes.json")),
  ]);
}

async function extract(
  labelsByFile: Map<string, (readonly [string, Label])[]>,
  file: string,
  lang: Language,
  outputFile: string,
) {
  const entries = labelsByFile.get(file) ?? [];
  const extracted = Object.fromEntries(
    entries
      .flatMap<[string, string]>(([id, label]) => {
        if (!label[lang]) return [];
        return [[id, label[lang]]];
      })
      .toSorted((a, b) => a[0].localeCompare(b[0])),
  );
  console.log(
    "Load %d labels for %s",
    Object.keys(extracted).length,
    path.basename(outputFile),
  );
  await writeJsonFile(outputFile, extracted);
}

handleMain(main());
