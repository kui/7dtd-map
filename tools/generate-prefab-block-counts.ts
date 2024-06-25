import { glob } from "glob";
import { handleMain, projectRoot, vanillaDir, writeJsonFile } from "./lib/utils.js";
import path from "path";
import { parseNim } from "./lib/nim-parser.js";
import { parseTts } from "./lib/tts-parser.js";

const DOCS_DIR = projectRoot("docs");
const FILE = "prefab-block-counts.json";
const EXCLUD_BLOCKS = new Set(["air"]);

interface PrefabBlockCounts {
  [prefabName: string]: {
    [blockName: string]: number;
  };
}

async function main() {
  const nimFiles = glob.iterate(await vanillaDir("Data", "Prefabs", "*", "*.blocks.nim"));
  const prefabBlockCount = await readCounts(nimFiles);
  await writeJsonFile(path.join(DOCS_DIR, FILE), prefabBlockCount);
  return 0;
}

async function readCounts(nimFiles: AsyncIterable<string>): Promise<PrefabBlockCounts> {
  const prefabBlockCounts: Promise<[string, { [blockName: string]: number }]>[] = [];

  for await (const nimFile of nimFiles) {
    const prefabName = path.basename(nimFile, ".blocks.nim");
    const ttsFile = path.join(path.dirname(nimFile), `${prefabName}.tts`);
    prefabBlockCounts.push(
      (async () => {
        return [prefabName, await countBlocks(nimFile, ttsFile)];
      })(),
    );
  }

  return Object.fromEntries((await Promise.all(prefabBlockCounts)).toSorted((a, b) => a[0].localeCompare(b[0])));
}

async function countBlocks(nimFile: string, ttsFile: string): Promise<{ [blockName: string]: number }> {
  const [nim, tts] = await Promise.all([parseNim(nimFile), parseTts(ttsFile)]);
  return Object.fromEntries(
    Array.from(nim)
      .filter(([, name]) => !EXCLUD_BLOCKS.has(name))
      .toSorted((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => [name, tts.blockNums.get(id) ?? 0]),
  );
}

handleMain(main());
