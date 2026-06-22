import process from "node:process";
import { prefabHtml } from "./lib/prefab-html.ts";
import { parseLabel } from "./lib/label-parser.ts";
import { prefabSiblingFiles } from "./lib/prefab-files.ts";
import { handleMain, program, vanillaDir } from "./lib/utils.ts";

const usage = `${program()} <Prefab XML>`;

async function main() {
  const xml = process.argv[2];
  if (xml === undefined) {
    console.error(usage);
    return 1;
  }
  const labels = await loadLabels();
  const { nim, tts } = prefabSiblingFiles(xml);
  console.log(await prefabHtml(xml, nim, tts, labels));
  return 0;
}

async function loadLabels() {
  const fileName = await vanillaDir("Data", "Config", "Localization.csv");
  const labels = await parseLabel(fileName);
  console.log("Load %s labels", labels.size);
  return labels;
}

handleMain(main());
