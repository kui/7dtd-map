import * as path from "path";
import { promises as fs } from "fs";
import glob from "glob-promise";
import { prefabHtml } from "./lib/prefab-html";
import { parseLabel } from "./lib/label-parser";
import { handleMain, projectRoot, vanillaDir } from "./lib/utils";

const BASE_DEST = projectRoot("docs", "prefabs");

// If in windows environment the '/' must be switched on any path.joins : add -> .replace(/\\/g, '/');

async function main() {
  await remove();
  const labels = await loadLabels();
  await buildHtmls(labels);
  return 0;
}

async function remove() {
  const globPath = path.join(BASE_DEST, "*.{jpg,html}").replace(/\\/g, "/");
  await Promise.all((await glob(globPath)).map(fs.unlink));
  console.log("Remove %s", globPath);
}

async function loadLabels() {
  const fileName = await vanillaDir("Data", "Config", "Localization.txt");
  const labels = await parseLabel(fileName);
  console.log("Load %s labels", labels.size);
  return labels;
}

async function buildHtmls(labels: Map<string, string>) {
  const prefabsDir = await vanillaDir("Data", "Prefabs");
  const xmlGlob = path.join(prefabsDir, "*", "*.xml").replace(/\\/g, "/");
  const xmlFiles = await glob(xmlGlob);
  if (xmlFiles.length === 0) {
    throw Error(`No xml file: ${xmlGlob}`);
  }

  let successCount = 0;
  await Promise.all(
    xmlFiles.map(async (xmlFileName) => {
      try {
        await Promise.all([generateHtml(xmlFileName, labels), copyJpg(xmlFileName)]);
      } catch (e) {
        console.warn("build HTML failure: %o", e);
        return;
      }
      if (++successCount % 50 === 0) {
        console.log("Build HTML files: %d/%d", successCount, xmlFiles.length);
      }
    })
  );
  console.log("Build HTML files: %d/%d", successCount, xmlFiles.length);
}

async function generateHtml(xmlFileName: string, labels: Map<string, string>) {
  const prefabName = path.basename(xmlFileName, ".xml").replace(/\\/g, "/");
  const prefabDir = path.dirname(xmlFileName).replace(/\\/g, "/");
  const nimFileName = path.join(prefabDir, `${prefabName}.blocks.nim`).replace(/\\/g, "/");
  const ttsFileName = path.join(prefabDir, `${prefabName}.tts`).replace(/\\/g, "/");
  const html = await prefabHtml(xmlFileName, nimFileName, ttsFileName, labels);
  const dist = path.join(BASE_DEST, `${prefabName}.html`).replace(/\\/g, "/");
  await fs.writeFile(dist, html);
}

async function copyJpg(xmlFileName: string) {
  const prefabName = path.basename(xmlFileName, ".xml").replace(/\\/g, "/");
  const prefabDir = path.dirname(xmlFileName).replace(/\\/g, "/");
  const jpgFileName = path.join(prefabDir, `${prefabName}.jpg`).replace(/\\/g, "/");
  const dist = path.join(BASE_DEST, path.basename(jpgFileName)).replace(/\\/g, "/");
  await fs.copyFile(jpgFileName, dist);
}

handleMain(main());
