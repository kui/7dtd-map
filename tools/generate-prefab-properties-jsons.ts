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
const DIFFICULTY_FILE = "prefab-difficulties.json";
const MESH_SIZE_FILE = "prefab-mesh-sizes.json";

async function main() {
  const prefabXmlFiles = await listPrefabXmlPaths();
  console.log("Found %d prefab xml", prefabXmlFiles.length);
  const prefabXmls = await parseXmls(prefabXmlFiles);
  console.log("Load %d prefab xmls", Object.keys(prefabXmls).length);
  await Promise.all([
    writeJsonFile(
      path.join(DOCS_DIR, DIFFICULTY_FILE),
      extractDifficulties(prefabXmls),
    ),
    writeJsonFile(
      path.join(DOCS_DIR, MESH_SIZE_FILE),
      extractMeshSizes(prefabXmls),
    ),
  ]);
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

// PrefabSize is "X, Y, Z"; the map is top-down so only X (width) and Z
// (depth) are emitted. Entries with a non-positive footprint are skipped so
// the renderer can fall back to the legacy point marker for those prefabs.
function extractMeshSizes(prefabXmls: PrefabXmls) {
  return Object.fromEntries(
    Object.entries(prefabXmls)
      .flatMap<[string, [number, number]]>(([prefabName, props]) => {
        const raw = props.find((p) => p.name === "PrefabSize")?.value;
        if (!raw) return [];
        const parts = raw.split(",").map((s) => parseInt(s.trim(), 10));
        if (parts.length < 3) return [];
        const [x, , z] = parts;
        if (!Number.isFinite(x) || !Number.isFinite(z)) return [];
        if (x <= 0 || z <= 0) return [];
        return [[prefabName, [x, z]]];
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
