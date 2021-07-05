import { promises as fs } from "fs";
import * as path from "path";
import glob from "glob-promise";
import { BlockId, BlockIdNames, parseNim } from "./lib/nim-parser";
import { parseLabel } from "./lib/label-parser";
import { parseTts } from "./lib/tts-parser";
import { handleMain } from "./lib/utils";

const projectRoot = path.join(path.dirname(process.argv[1]), "..");
const localJsonFile = path.join(projectRoot, "local.json");
const blockPrefabIndexFile = "docs/block-prefab-index.json";
const prefabBlockIndexFile = "docs/prefab-block-index.json";
const blockLabelsFile = "docs/block-labels.json";
const excludedBlocks = new Set(["air", "terrainFiller"]);

async function main() {
  const { vanillaDir } = JSON.parse((await fs.readFile(localJsonFile)).toString());
  const fileGlob = path.join(vanillaDir, "Data", "Prefabs", "*.blocks.nim");
  const nimFiles = await glob(fileGlob);
  if (nimFiles.length === 0) {
    throw Error(`No nim file: ${fileGlob}`);
  }

  const prefabBlockIndex = await readIndex(nimFiles);
  console.log("Load %d prefabs", Object.keys(prefabBlockIndex).length);
  await writeJsonFile(prefabBlockIndexFile, prefabBlockIndex);

  const blockPrefabIndex = invertIndex(prefabBlockIndex);
  console.log("Load %d blocks", Object.keys(blockPrefabIndex).length);
  await writeJsonFile(blockPrefabIndexFile, blockPrefabIndex);

  const labels = await readLabels(vanillaDir, Object.keys(blockPrefabIndex));
  console.log("Load %d block labels", Object.keys(labels).length);
  await writeJsonFile(blockLabelsFile, labels);

  return 0;
}

async function writeJsonFile(file: string, json: unknown) {
  await fs.writeFile(path.join(projectRoot, file), JSON.stringify(json));
  console.log("Write %s", file);
}

interface Labels {
  [labelKey: string]: string;
}

async function readLabels(vanillaDir: string, blocks: string[]) {
  const fileName = path.join(vanillaDir, "Data", "Config", "Localization.txt");
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
        .filter(([, name]) => !excludedBlocks.has(name))
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

handleMain(main());
