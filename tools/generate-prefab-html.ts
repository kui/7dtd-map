import * as path from "path";
import { promises as fs } from "fs";
import glob from "glob-promise";
import { prefabHtml } from "./lib/prefab-html";
import { parseLabel } from "./lib/label-parser";
import { handleMain } from "./lib/utils";

const projectRoot = path.join(path.dirname(process.argv[1]), "..");
const baseDist = path.join(projectRoot, "docs/prefabs");
const localInfo = fs.readFile(path.join(projectRoot, "local.json")).then((j) => JSON.parse(j.toString()));

async function main() {
  await remove();
  const labels = await loadLabels();
  const prefabNames = await generateHtml(labels);
  await Promise.all([await generateIndex(prefabNames), await copyJpg(prefabNames)]);
  return 0;
}

async function remove() {
  const globPath = path.join(baseDist, "*.{jpg,html}");
  await Promise.all((await glob(globPath)).map(fs.unlink));
  console.log("Remove %s", globPath);
}

async function loadLabels() {
  const { vanillaDir } = await localInfo;
  const fileName = path.join(vanillaDir, "Data", "Config", "Localization.txt");
  const labels = await parseLabel(fileName);
  console.log("Load %s labels", labels.size);
  return labels;
}

async function generateHtml(labels: Map<string, string>) {
  const { vanillaDir } = await localInfo;
  const xmlGlob = path.join(vanillaDir, "Data", "Prefabs", "*.xml");
  const xmlFiles = await glob(xmlGlob);
  if (xmlFiles.length === 0) {
    throw Error(`No xml file: ${xmlGlob}`);
  }

  const prefabNames = await Promise.all(
    xmlFiles.map(async (xmlFileName) => {
      const prefabName = path.basename(xmlFileName, ".xml");
      const nimFileName = path.join(vanillaDir, "Data", "Prefabs", `${prefabName}.blocks.nim`);
      const ttsFileName = path.join(vanillaDir, "Data", "Prefabs", `${prefabName}.tts`);
      let html;
      try {
        html = await prefabHtml(xmlFileName, nimFileName, ttsFileName, labels);
      } catch (e) {
        console.warn("Ignore Prefab %s, %s", prefabName, e);
        return null;
      }
      const dist = path.join(baseDist, `${prefabName}.html`);
      await fs.writeFile(dist, html);
      return prefabName;
    })
  ).then((ns) => ns.filter((n): n is string => n != null));
  console.log("Write html files: %d/%d", prefabNames.length, xmlFiles.length);

  return prefabNames;
}

async function copyJpg(prefabNames: string[]) {
  const { vanillaDir } = await localInfo;
  const jpgFiles = prefabNames.map((n) => path.join(vanillaDir, "Data", "Prefabs", `${n}.jpg`));

  const failedFiles: string[] = [];
  await Promise.all(
    jpgFiles.map(async (jpgFileName) => {
      const dist = path.join(baseDist, path.basename(jpgFileName));
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

async function generateIndex(prefabNames: string[]) {
  const dist = path.join(baseDist, "index.html");
  await fs.writeFile(
    dist,
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="description" content="">
  <title>Prefab List</title>
</head>
<body>
  <h1>Prefab List</h1>
  <nav>
    <ul>
      <li><a href="..">7dtd-map</a></li>
      <li><a href="https://github.com/kui/7dtd-map">Github repository</a></li>
    </ul>
  </nav>
  <ul>
   ${prefabNames.map((p) => `<li><a href="${p}.html">${p}</a></li>`).join("\n")}
  </ul>
</body>
</html>
`
  );
  console.log("Write index.html");
}

handleMain(main());
