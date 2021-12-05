import * as path from "path";
import { promises as fs } from "fs";
import glob from "glob-promise";
import { prefabHtml } from "./lib/prefab-html";
import { parseLabel } from "./lib/label-parser";
import { handleMain, projectRoot, vanillaDir } from "./lib/utils";

const BASE_DEST = projectRoot("docs", "prefabs");

async function main() {
  await remove();
  const labels = await loadLabels();
  const prefabNames = await generateHtml(labels);
  await copyJpg(prefabNames);
  return 0;
}

async function remove() {
  const globPath = path.join(BASE_DEST, "*.{jpg,html}");
  await Promise.all((await glob(globPath)).map(fs.unlink));
  console.log("Remove %s", globPath);
}

async function loadLabels() {
  const fileName = await vanillaDir("Data", "Config", "Localization.txt");
  const labels = await parseLabel(fileName);
  console.log("Load %s labels", labels.size);
  return labels;
}

async function generateHtml(labels: Map<string, string>) {
  const prefabsDir = await vanillaDir("Data", "Prefabs");
  const xmlGlob = path.join(prefabsDir, "*.xml");
  const xmlFiles = await glob(xmlGlob);
  if (xmlFiles.length === 0) {
    throw Error(`No xml file: ${xmlGlob}`);
  }

  const prefabNames = await Promise.all(
    xmlFiles.flatMap(async (xmlFileName) => {
      const prefabName = path.basename(xmlFileName, ".xml");
      const nimFileName = path.join(prefabsDir, `${prefabName}.blocks.nim`);
      const ttsFileName = path.join(prefabsDir, `${prefabName}.tts`);
      let html;
      try {
        html = await prefabHtml(xmlFileName, nimFileName, ttsFileName, labels);
      } catch (e) {
        console.warn("Ignore Prefab %s, %s", prefabName, e);
        return null;
      }
      const dist = path.join(BASE_DEST, `${prefabName}.html`);
      await fs.writeFile(dist, html);
      return prefabName;
    })
  ).then((ns) => ns.filter((n): n is string => n != null));
  console.log("Write html files: %d/%d", prefabNames.length, xmlFiles.length);

  return prefabNames;
}

async function copyJpg(prefabNames: string[]) {
  const prefabsDir = await vanillaDir("Data", "Prefabs");
  const jpgFiles = prefabNames.map((n) => path.join(prefabsDir, `${n}.jpg`));

  const failedFiles: string[] = [];
  await Promise.all(
    jpgFiles.map(async (jpgFileName) => {
      const dist = path.join(BASE_DEST, path.basename(jpgFileName));
      try {
        await fs.copyFile(jpgFileName, dist);
      } catch (e) {
        //console.warn("JPG Copy fail: ", e.message);
        failedFiles.push(path.basename(jpgFileName));
      }
    })
  );
  console.log("Copy %d jpg files", jpgFiles.length - failedFiles.length);
  console.log("Copy failure %d files", failedFiles.length, failedFiles);
}

handleMain(main());
