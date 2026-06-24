import * as path from "node:path";
import {
  type ParsedPrefabProperty,
  parsePrefabXml,
} from "./lib/xmls/prefab-xml.ts";
import { type District, parseRwgmixerXml } from "./lib/xmls/rwgmixer-xml.ts";
import { listPrefabXmlPaths, prefabSiblingFiles } from "./lib/prefab-files.ts";
import {
  handleMain,
  publishDir,
  throttleAll,
  vanillaDir,
  writeJsonFile,
} from "./lib/utils.ts";

const DOCS_DIR = publishDir();
const DIFFICULTY_FILE = "prefab-difficulties.json";
const MESH_SIZE_FILE = "prefab-mesh-sizes.json";
const FOOTPRINT_COLOR_FILE = "prefab-footprint-colors.json";

async function main() {
  const prefabXmlFiles = await listPrefabXmlPaths();
  console.log("Found %d prefab xml", prefabXmlFiles.length);
  const [prefabXmls, districts] = await Promise.all([
    parseXmls(prefabXmlFiles),
    parseRwgmixerXml(await vanillaDir("Data", "Config", "rwgmixer.xml")),
  ]);
  console.log("Load %d prefab xmls", Object.keys(prefabXmls).length);
  console.log("Load %d districts from rwgmixer.xml", districts.length);
  await Promise.all([
    writeJsonFile(
      path.join(DOCS_DIR, DIFFICULTY_FILE),
      extractDifficulties(prefabXmls),
    ),
    writeJsonFile(
      path.join(DOCS_DIR, MESH_SIZE_FILE),
      extractMeshSizes(prefabXmls),
    ),
    writeJsonFile(
      path.join(DOCS_DIR, FOOTPRINT_COLOR_FILE),
      extractFootprintColors(prefabXmls, districts),
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

// `Tags` is a comma-separated list. Some entries are district selectors
// (matching <district name=…> in rwgmixer.xml), others are placement hints
// (`diagonal`, `streettile`, …). Splitting trims whitespace and drops empties.
function extractTags(props: ParsedPrefabProperty[]): string[] {
  const raw = props.find((p) => p.name === "Tags")?.value;
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
}

function rgbFloatToHex([r, g, b]: [number, number, number]): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n * 255)));
  const hex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// Maps each prefab to its district's preview_color by matching the prefab's
// Tags against district names declared in rwgmixer.xml. The first tag that
// resolves to a known district wins; prefabs with no matching tag are omitted
// so the renderer can fall back to its default colour.
function extractFootprintColors(
  prefabXmls: PrefabXmls,
  districts: District[],
) {
  const colorByDistrict = new Map<string, [number, number, number]>();
  for (const d of districts) {
    if (d.previewColor) colorByDistrict.set(d.name, d.previewColor);
  }
  return Object.fromEntries(
    Object.entries(prefabXmls)
      .flatMap<[string, string]>(([prefabName, props]) => {
        const tags = extractTags(props);
        for (const tag of tags) {
          const color = colorByDistrict.get(tag);
          if (color) return [[prefabName, rgbFloatToHex(color)]];
        }
        return [];
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
