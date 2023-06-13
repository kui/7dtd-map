import * as path from "path";
import { prefabHtml } from "./lib/prefab-html";
import { parseLabel } from "./lib/label-parser";
import { handleMain, vanillaDir } from "./lib/utils";

const usage = `${path.basename(process.argv[1])} <Prefab XML>`;

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }
  const labels = await loadLabels();
  const xml = process.argv[2];
  const pathBasename = path.join(path.dirname(xml), path.basename(xml, ".xml"));
  const nim = `${pathBasename}.blocks.nim`;
  const tts = `${pathBasename}.tts`;
  console.log(await prefabHtml(xml, nim, tts, labels));
  return 0;
}

async function loadLabels() {
  const fileName = await vanillaDir("Data", "Config", "Localization.txt");
  const labels = await parseLabel(fileName);
  console.log("Load %s labels", labels.size);
  return labels;
}

handleMain(main());
