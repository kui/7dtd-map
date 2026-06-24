import * as path from "node:path";
import {
  isPrefabPropertyClass,
  isPrefabPropertyValue,
  type ParsedPrefabProperty,
  type ParsedPrefabPropertyValue,
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
const DENSITY_FILE = "prefab-density-scores.json";
const DISTRICT_COLOR_FILE = "district-colors.json";

interface PrefabXmls {
  [prefabName: string]: ParsedPrefabProperty[];
}

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
      { collapseLeafArrays: true },
    ),
    writeJsonFile(
      path.join(DOCS_DIR, DENSITY_FILE),
      extractDensityScores(prefabXmls),
    ),
    writeJsonFile(
      path.join(DOCS_DIR, DISTRICT_COLOR_FILE),
      extractDistrictColors(districts),
    ),
  ]);
  return 0;
}

function findValueEntry(
  entries: ParsedPrefabProperty[],
  name: string,
): ParsedPrefabPropertyValue | undefined {
  for (const e of entries) {
    if (isPrefabPropertyValue(e) && e.name === name) return e;
  }
  return undefined;
}

function findClassEntries(
  entries: ParsedPrefabProperty[],
  className: string,
): ParsedPrefabProperty[] | undefined {
  for (const e of entries) {
    if (isPrefabPropertyClass(e) && e.className === className) {
      return e.properties;
    }
  }
  return undefined;
}

function extractDifficulties(prefabXmls: PrefabXmls) {
  return Object.fromEntries(
    Object.entries(prefabXmls)
      .flatMap<[string, number]>(([prefabName, entries]) => {
        const difficulty = parseInt(
          findValueEntry(entries, "DifficultyTier")?.value ?? "0",
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
      .flatMap<[string, [number, number]]>(([prefabName, entries]) => {
        const raw = findValueEntry(entries, "PrefabSize")?.value;
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

// Mirrors PrefabData.Init: DensityScore = (TotalVertices + 50000) / 100000
// using C# integer division, so the result is always an int. Prefabs without
// a Stats block (or TotalVertices=0) get 0 and become "low density" which the
// renderer treats as ×0.4 brightness, matching the game preview.
function extractDensityScores(prefabXmls: PrefabXmls) {
  return Object.fromEntries(
    Object.entries(prefabXmls)
      .flatMap<[string, number]>(([prefabName, entries]) => {
        const stats = findClassEntries(entries, "Stats");
        const totalVertices = parseInt(
          (stats && findValueEntry(stats, "TotalVertices")?.value) ?? "0",
          10,
        );
        const score = Math.trunc(
          ((Number.isFinite(totalVertices) ? totalVertices : 0) + 50000) /
            100000,
        );
        return [[prefabName, score]];
      })
      .toSorted((a, b) => a[0].localeCompare(b[0])),
  );
}

function rgbFloatToHex([r, g, b]: [number, number, number]): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n * 255)));
  const hex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// District preview_color lookup table consumed by the renderer at draw time.
// Districts without a preview_color are dropped so the renderer can fall back
// to the wilderness default.
function extractDistrictColors(districts: District[]) {
  return Object.fromEntries(
    districts
      .flatMap<[string, string]>((d) =>
        d.previewColor ? [[d.name, rgbFloatToHex(d.previewColor)]] : []
      )
      .toSorted((a, b) => a[0].localeCompare(b[0])),
  );
}

async function parseXmls(xmlFiles: string[]): Promise<PrefabXmls> {
  let completed = 0;
  const xmlTasks = xmlFiles.map(
    (prefabXmlFile) => async (): Promise<[string, ParsedPrefabProperty[]]> => {
      const { name } = prefabSiblingFiles(prefabXmlFile);
      const entries = await parsePrefabXml(prefabXmlFile);
      if (++completed % 50 === 0) {
        console.log("Read xmls: %d / %d", completed, xmlFiles.length);
      }
      return [name, entries];
    },
  );

  console.log("Start to read %d xmls", xmlFiles.length);
  return Object.fromEntries(await throttleAll(xmlTasks, 100));
}

handleMain(main());
