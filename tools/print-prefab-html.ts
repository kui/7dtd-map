import * as path from "path";
import { prefabHtml } from "./lib/prefab-html";
import { parseLabel } from "./lib/label-parser";
import { handleMain, program, vanillaDir } from "./lib/utils";

const usage = `${program()} <Prefab XML>`;

async function main() {
  const xml = process.argv[2];
  if (xml === undefined) {
    console.error(usage);
    return 1;
  }
  const labels = await loadLabels();
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
