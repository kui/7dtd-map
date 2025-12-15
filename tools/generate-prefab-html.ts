import { glob } from "glob";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Label, LabelId, parseLabel } from "./lib/label-parser.ts";
import { prefabHtml } from "./lib/prefab-html.ts";
import { handleMain, publishDir, vanillaDir, writeJsonFile } from "./lib/utils.ts";

const BASE_DEST = publishDir("prefabs");

async function main() {
  await remove();
  const labels = await loadLabels();
  await buildHtmls(labels);
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

async function buildHtmls(labels: Map<LabelId, Label>) {
  const xmlGlob = await vanillaDir("Data", "Prefabs", "*", "*.xml");
  const xmlFiles = await glob(xmlGlob);
  if (xmlFiles.length === 0) {
    throw Error(`No xml file: ${xmlGlob}`);
  }

  let successCount = 0;
  const index: string[] = [];
  await Promise.all(
    xmlFiles.map(async (xmlFileName) => {
      try {
        await Promise.all([generateHtml(xmlFileName, labels), copyJpg(xmlFileName)]);
      } catch (e) {
        if (isErrnoException(e) && e.code === "ENOENT") {
          console.warn("Abort a prefab HTML: ", e.message);
          return;
        }
        console.warn("Abort a prefab HTML: ", e);
        return;
      }
      if (++successCount % 50 === 0) {
        console.log("Build HTML files: %d/%d", successCount, xmlFiles.length);
      }
      const prefabName = path.basename(xmlFileName, ".xml");
      index.push(prefabName);
    }),
  );
  console.log("Build HTML files: %d/%d", successCount, xmlFiles.length);

  await writeJsonFile(path.join(BASE_DEST, "index.json"), index.toSorted());
}

async function generateHtml(xmlFileName: string, labels: Map<LabelId, Label>) {
  const prefabName = path.basename(xmlFileName, ".xml");
  const prefabDir = path.dirname(xmlFileName);
  const nimFileName = path.join(prefabDir, `${prefabName}.blocks.nim`);
  const ttsFileName = path.join(prefabDir, `${prefabName}.tts`);
  const html = await prefabHtml(xmlFileName, nimFileName, ttsFileName, labels);
  const dist = path.join(BASE_DEST, `${prefabName}.html`);
  await fs.writeFile(dist, html);
}

async function copyJpg(xmlFileName: string) {
  const prefabName = path.basename(xmlFileName, ".xml");
  const prefabDir = path.dirname(xmlFileName);
  const jpgFileName = path.join(prefabDir, `${prefabName}.jpg`);
  const dist = path.join(BASE_DEST, path.basename(jpgFileName));
  try {
    await fs.copyFile(jpgFileName, dist);
  } catch (e) {
    if (isErrnoException(e) && e.code === "ENOENT") {
      // No jpg
      return;
    }
    throw e;
  }
}

function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
  return typeof (e as NodeJS.ErrnoException).code === "string";
}

handleMain(main());
