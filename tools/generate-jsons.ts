import { promises as fs } from "fs";
import * as path from "path";
import glob from "glob-promise";
import { BlockId, BlockIdNames, parseNim } from "./lib/nim-parser.js";
import { Label, LabelId, parseLabel } from "./lib/label-parser.js";
import { parseTts } from "./lib/tts-parser.js";
import * as utils from "./lib/utils.js";

const DOCS_DIR = utils.projectRoot("docs");
const EXCLUD_BLOCKS = new Set(["air", "terrainFiller"]);

async function main() {
  const vanillaDir = await utils.vanillaDir();
  const nimFileGlob = path.join(vanillaDir, "Data", "Prefabs", "*", "*.blocks.nim");
  const nimFiles = await glob(nimFileGlob);
  if (nimFiles.length === 0) {
    throw Error(`No nim file: ${nimFileGlob}`);
  }

  const prefabBlockIndexFile = path.join(DOCS_DIR, "prefab-block-index.json");
  const prefabBlockIndex = await readIndex(nimFiles);
  console.log("Load %d prefabs", Object.keys(prefabBlockIndex).length);
  await writeJsonFile(prefabBlockIndexFile, prefabBlockIndex);

  const blockPrefabIndexFile = path.join(DOCS_DIR, "block-prefab-index.json");
  const blockPrefabIndex = invertIndex(prefabBlockIndex);
  console.log("Load %d blocks", Object.keys(blockPrefabIndex).length);
  await writeJsonFile(blockPrefabIndexFile, blockPrefabIndex);

  const labels = await parseLabel(path.join(vanillaDir, "Data", "Config", "Localization.txt"));

  const blockLabelsFile = path.join(DOCS_DIR, "block-labels.json");
  const blockLabels = extractLabels(labels, ["blocks", "shapes"], Object.keys(blockPrefabIndex));
  console.log("Load %d block labels", Object.keys(blockLabels).length);
  await writeJsonFile(blockLabelsFile, blockLabels);

  const prefabLabelsFile = path.join(DOCS_DIR, "prefab-labels.json");
  const prefabLabels = extractLabels(labels, ["POI"], Object.keys(prefabBlockIndex));
  console.log("Load %d prefab labels", Object.keys(prefabLabels).length);
  await writeJsonFile(prefabLabelsFile, prefabLabels);

  return 0;
}

async function writeJsonFile(file: string, json: unknown) {
  await fs.writeFile(file, JSON.stringify(json, null, "\t"));
  console.log("Write %s", file);
}

interface Labels {
  [labelKey: string]: string;
}

function extractLabels(labels: Map<LabelId, Label>, labelFiles: string[], labelNames: string[]): Labels {
  return labelNames.reduce<Labels>((result, block) => {
    const label = labels.get(block);
    if (!label) return result;
    if (!labelFiles.includes(label.file)) {
      console.warn("Unexpected label.file: ", label);
      return result;
    }
    const labelEntry: Labels = { [block]: label.english };
    return Object.assign(result, labelEntry);
  }, {});
}

interface PrefabBlockIndex {
  [prefabName: string]: { name: string; count: number }[];
}
interface BlockPrefabIndex {
  [blockName: string]: { name: string; count: number }[];
}

async function readIndex(nimFiles: string[]) {
  let completed = 0;
  const readIndices = nimFiles.map(async (nimFileName): Promise<PrefabBlockIndex | null> => {
    const prefabName = path.basename(nimFileName, ".blocks.nim");
    const ttsFileName = path.join(path.dirname(nimFileName), `${prefabName}.tts`);
    let blocks: BlockIdNames;
    let blockNums: Map<BlockId, number>;
    try {
      [blocks, { blockNums }] = await Promise.all([parseNim(nimFileName), parseTts(ttsFileName)]);
    } catch (e) {
      console.warn("File load failure: %o", e);
      return null;
    }

    if (++completed % 50 === 0) {
      console.log("Read prefabs: %d / %d", completed, nimFiles.length);
    }

    return {
      [prefabName]: Array.from(blocks)
        .filter(([, name]) => !EXCLUD_BLOCKS.has(name))
        .map(([id, name]) => ({
          name: name,
          count: blockNums.get(id) ?? 0,
        })),
    };
  });

  console.log("Start to read %d prefabs", readIndices.length);
  return (await Promise.all(readIndices)).reduce<PrefabBlockIndex>((a, c) => Object.assign(a, c), {});
}

function invertIndex(prefabs: PrefabBlockIndex) {
  return Object.entries(prefabs).reduce<BlockPrefabIndex>((a, [prefabName, blocks]) => {
    for (const { name: blockName, count } of blocks) {
      a[blockName] = (a[blockName] ?? []).concat({ name: prefabName, count: count });
    }
    return a;
  }, {});
}

utils.handleMain(main());
