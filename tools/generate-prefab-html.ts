import { expandGlob } from "@std/fs/expand-glob";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Label, LabelId, parseLabel } from "./lib/label-parser.ts";
import { prefabHtml } from "./lib/prefab-html.ts";
import { listPrefabXmlPaths, prefabSiblingFiles } from "./lib/prefab-files.ts";
import {
  handleMain,
  publishDir,
  throttleAll,
  vanillaDir,
  writeJsonFile,
} from "./lib/utils.ts";

const BASE_DEST = publishDir("prefabs");

async function main() {
  await remove();
  const labels = await loadLabels();
  await buildHtmls(labels);
  return 0;
}

async function remove() {
  const globPath = path.join(BASE_DEST, "*.{jpg,html}");
  const files = await Array.fromAsync(
    expandGlob(globPath),
    (e) => e.path,
  );
  await Promise.all(files.map((f) => fs.unlink(f)));
  console.log("Remove %s", globPath);
}

async function loadLabels() {
  console.log("Load labels");
  const fileName = vanillaDir("Data", "Config", "Localization.csv");
  const labels = await parseLabel(fileName);
  console.log("Loaded %s labels", labels.size);
  return labels;
}

async function buildHtmls(labels: Map<LabelId, Label>) {
  console.log("Build HTML files");

  const xmlFiles = await listPrefabXmlPaths();
  if (xmlFiles.length === 0) {
    throw Error("No prefab xml file found");
  }
  console.log("Found %d prefab xml", xmlFiles.length);

  let successCount = 0;
  const index: string[] = [];
  const tasks = xmlFiles.map((xmlFileName) => async () => {
    try {
      await Promise.all([
        generateHtml(xmlFileName, labels),
        copyJpg(xmlFileName),
      ]);
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
    index.push(prefabSiblingFiles(xmlFileName).name);
  });
  await throttleAll(tasks, 100);
  console.log("Build HTML files: %d/%d", successCount, xmlFiles.length);

  await writeJsonFile(path.join(BASE_DEST, "index.json"), index.toSorted());
}

async function generateHtml(xmlFileName: string, labels: Map<LabelId, Label>) {
  const { name, nim, tts } = prefabSiblingFiles(xmlFileName);
  const html = await prefabHtml(xmlFileName, nim, tts, labels);
  const dist = path.join(BASE_DEST, `${name}.html`);
  await fs.writeFile(dist, html);
}

async function copyJpg(xmlFileName: string) {
  const { jpg } = prefabSiblingFiles(xmlFileName);
  const dist = path.join(BASE_DEST, path.basename(jpg));
  try {
    await fs.copyFile(jpg, dist);
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
