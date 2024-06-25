import { projectRoot, vanillaDir, writeJsonFile, handleMain } from "./lib/utils.js";
import * as path from "path";
import { glob } from "glob";
import { PrefabProperty, parsePrefabXml } from "./lib/prefab-xml-parser.js";

const DOCS_DIR = projectRoot("docs");
const FILE = "prefab-difficulties.json";

async function main() {
  const prefabXmlFiles = await glob(await vanillaDir("Data", "Prefabs", "*", "*.xml"));
  const prefabXmls = await parseXmls(prefabXmlFiles);
  console.log("Load %d prefab xmls", Object.keys(prefabXmls).length);
  await writeJsonFile(path.join(DOCS_DIR, FILE), extractDifficulties(prefabXmls));
  return 0;
}

function extractDifficulties(prefabXmls: PrefabXmls) {
  return Object.fromEntries(
    Object.entries(prefabXmls)
      .flatMap<[string, number]>(([prefabName, props]) => {
        const difficulty = parseInt(props.find((p) => p.name === "DifficultyTier")?.value ?? "0");
        if (difficulty > 0) return [[prefabName, difficulty]];
        else return [];
      })
      .toSorted((a, b) => a[0].localeCompare(b[0])),
  );
}

interface PrefabXmls {
  [prefabName: string]: PrefabProperty[];
}

async function parseXmls(xmlFiles: string[]): Promise<PrefabXmls> {
  let completed = 0;
  const xmlPromises = xmlFiles.map(async (prefabXmlFile) => {
    const prefabName = path.basename(prefabXmlFile, ".xml");
    const props = await parsePrefabXml(prefabXmlFile);
    if (++completed % 50 === 0) {
      console.log("Read xmls: %d / %d", completed, xmlFiles.length);
    }
    return { [prefabName]: props };
  });

  console.log("Start to read %d xmls", xmlFiles.length);
  return (await Promise.all(xmlPromises)).reduce((a, c) => Object.assign(a, c), {});
}

handleMain(main());
