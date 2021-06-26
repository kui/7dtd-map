/* eslint-env node */
import { promises as fs } from "fs";
import * as path from "path";
import glob from "glob-promise";
import { BlockIdName, parseNim } from "./lib/nim-parser";
import { parseLabel } from "./lib/label-parser";
import { parseTts, BlockId } from "./lib/tts-parser";

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
  const waitTasks = [];
  const prefabs = await readNim(nimFiles);
  console.log("Load %d prefabs", Object.keys(prefabs).length);
  waitTasks.push(writeJsonFile(prefabBlockIndexFile, prefabs));
  const blocks = invertIndex(prefabs);
  console.log("Load %d blocks", Object.keys(blocks).length);
  waitTasks.push(writeJsonFile(blockPrefabIndexFile, blocks));
  waitTasks.push(
    (async () => {
      const labels = await readLabels(vanillaDir, Object.keys(blocks));
      console.log("Load %d block labels", Object.keys(labels).length);
      writeJsonFile(blockLabelsFile, labels);
    })()
  );
  await Promise.all(waitTasks);
  return 0;
}
async function writeJsonFile(file: string, json: unknown) {
  await fs.writeFile(path.join(projectRoot, file), JSON.stringify(json));
  console.log("Write %s", file);
}
async function readLabels(vanillaDir: string, blocks: string[]) {
  const fileName = path.join(vanillaDir, "Data", "Config", "Localization.txt");
  const labels = await parseLabel(fileName);
  return blocks.reduce((result, block) => {
    const label = labels.get(block);
    if (label) {
      return Object.assign(result, { [block]: label });
    }
    return result;
  }, {});
}

interface PrefabBlocks {
  name: string;
  blocks: { name: string; count: number }[];
}

interface PrefabBlockIndex {
  [prefabName: string]: { name: string; count: number }[];
}
interface BlockPrefabIndex {
  [blockName: string]: { name: string; count: number }[];
}

async function readNim(nimFiles: string[]): Promise<PrefabBlockIndex> {
  const parsedNimFiles: (PrefabBlocks | null)[] = await Promise.all(
    nimFiles.map(async (nimFileName) => {
      const prefabName = path.basename(nimFileName, ".blocks.nim");
      const ttsFileName = path.join(path.dirname(nimFileName), `${prefabName}.tts`);
      let blocks: BlockIdName[];
      let blockNums: Map<BlockId, number>;
      try {
        [blocks, { blockNums }] = await Promise.all([parseNim(nimFileName), parseTts(ttsFileName)]);
      } catch (e) {
        console.warn("File load failure: %o", e);
        return null;
      }
      return {
        name: prefabName,
        blocks: blocks
          .filter((b) => !excludedBlocks.has(b.name))
          .map((b) => ({
            name: b.name,
            count: blockNums.get(b.id) ?? 0,
          })),
      };
    })
  );
  return parsedNimFiles.reduce<PrefabBlockIndex>((obj, prefab) => {
    if (prefab?.name) {
      obj[prefab.name] = prefab.blocks;
    }
    return obj;
  }, {});
}
function invertIndex(prefabs: PrefabBlockIndex) {
  return Object.entries(prefabs)
    .reduce<{ prefab: string; block: { name: string; count: number } }[]>((arr, [name, blocks]) => {
      const flatten = blocks.map((block) => ({
        prefab: name,
        block,
      }));
      return arr.concat(flatten);
    }, [])
    .reduce<BlockPrefabIndex>(
      (obj, { prefab, block }) =>
        Object.assign(obj, {
          [block.name]: (obj[block.name] || []).concat({
            name: prefab,
            count: block.count,
          }),
        }),
      {}
    );
}
main()
  .catch((e) => {
    console.error(e);
    return 1;
  })
  .then((exitCode) => {
    process.on("exit", () => process.exit(exitCode));
  });
