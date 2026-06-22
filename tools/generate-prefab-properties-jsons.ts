import * as path from "node:path";
import {
  type ParsedPrefabProperty,
  parsePrefabXml,
} from "./lib/xmls/prefab-xml.ts";
import { listPrefabXmlPaths, prefabSiblingFiles } from "./lib/prefab-files.ts";
import {
  handleMain,
  publishDir,
  throttleAll,
  writeJsonFile,
} from "./lib/utils.ts";

const DOCS_DIR = publishDir();
const FILE = "prefab-difficulties.json";

async function main() {
  const prefabXmlFiles = await listPrefabXmlPaths();
  console.log("Found %d prefab xml", prefabXmlFiles.length);
  const prefabXmls = await parseXmls(prefabXmlFiles);
  console.log("Load %d prefab xmls", Object.keys(prefabXmls).length);
  await writeJsonFile(
    path.join(DOCS_DIR, FILE),
    extractDifficulties(prefabXmls),
  );
  return 0;
}

function extractDifficulties(prefabXmls: PrefabXmls) {
  return Object.fromEntries(
    Object.entries(prefabXmls)
      .flatMap<[string, number]>(([prefabName, props]) => {
        const difficulty = parseInt(
          props.find((p) => p.name === "DifficultyTier")?.value ?? "0",
          10,
        );
        if (difficulty > 0) return [[prefabName, difficulty]];
        else return [];
      })
      .toSorted((a, b) => a[0].localeCompare(b[0])),
  );
}

interface PrefabXmls {
  [prefabName: string]: ParsedPrefabProperty[];
}

async function parseXmls(xmlFiles: string[]): Promise<PrefabXmls> {
  let completed = 0;
  const xmlTasks = xmlFiles.map(
    (prefabXmlFile) => async (): Promise<[string, ParsedPrefabProperty[]]> => {
      const { name } = prefabSiblingFiles(prefabXmlFile);
      const props = await parsePrefabXml(prefabXmlFile);
      if (++completed % 50 === 0) {
        console.log("Read xmls: %d / %d", completed, xmlFiles.length);
      }
      return [name, props];
    },
  );

  console.log("Start to read %d xmls", xmlFiles.length);
  return Object.fromEntries(await throttleAll(xmlTasks, 100));
}

handleMain(main());
