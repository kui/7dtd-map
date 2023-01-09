import { promises as fs } from "fs";
import * as path from "path";
import glob from "glob-promise";
import { BlockId, BlockIdNames, parseNim } from "./lib/nim-parser";
import { parseLabel } from "./lib/label-parser";
import { parseTts } from "./lib/tts-parser";
import * as utils from "./lib/utils";

const DOCS_DIR = utils.projectRoot("docs");
const EXCLUD_BLOCKS = new Set(["air", "terrainFiller"]);

// If in windows environment the '/' must be switched on any path.joins : add -> .replace(/\\/g, '/');

async function main() {
  const vanillaDir = await utils.vanillaDir();
  const fileGlob = path.join(vanillaDir, "Data", "Prefabs", "*", "*.blocks.nim").replace(/\\/g, "/");
  const nimFiles = await glob(fileGlob);
  console.log(nimFiles);
  if (nimFiles.length === 0) {
    throw Error(`No nim file: ${fileGlob}`);
  }

  const prefabBlockIndexFile = path.join(DOCS_DIR, "prefab-block-index.json").replace(/\\/g, "/");
  const prefabBlockIndex = await readIndex(nimFiles);
  console.log("Load %d prefabs", Object.keys(prefabBlockIndex).length);
  await writeJsonFile(prefabBlockIndexFile, prefabBlockIndex);

  const blockPrefabIndexFile = path.join(DOCS_DIR, "block-prefab-index.json").replace(/\\/g, "/");
  const blockPrefabIndex = invertIndex(prefabBlockIndex);
  console.log("Load %d blocks", Object.keys(blockPrefabIndex).length);
  await writeJsonFile(blockPrefabIndexFile, blockPrefabIndex);

  const blockLabelsFile = path.join(DOCS_DIR, "block-labels.json").replace(/\\/g, "/");
  const labels = await readLabels(vanillaDir, Object.keys(blockPrefabIndex));
  console.log("Load %d block labels", Object.keys(labels).length);
  await writeJsonFile(blockLabelsFile, labels);

  return 0;
}

async function writeJsonFile(file: string, json: unknown) {
  await fs.writeFile(file, JSON.stringify(json));
  console.log("Write %s", file);
}

interface Labels {
  [labelKey: string]: string;
}

async function readLabels(vanillaDir: string, blocks: string[]) {
  const fileName = path.join(vanillaDir, "Data", "Config", "Localization.txt").replace(/\\/g, "/");
  const labels = await parseLabel(fileName);
  return blocks.reduce<Labels>((result, block) => {
    const label = labels.get(block);
    if (label) {
      const labelEntry: Labels = { [block]: label };
      return Object.assign(result, labelEntry);
    }
    return result;
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
      console.log("Read prefabs: %d / %d", completed, readIndices.length);
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
  return Object.entries(prefabs)
    .flatMap<BlockPrefabIndex>(([prefabName, blocks]) => {
      return blocks.map((b) => ({ [b.name]: [{ name: prefabName, count: b.count }] }));
    })
    .reduce<BlockPrefabIndex>((a, c) => {
      const [blockName, prefabs] = Object.entries(c)[0];
      a[blockName] = (a[blockName] ?? []).concat(prefabs);
      return a;
    }, {});
}

utils.handleMain(main());
