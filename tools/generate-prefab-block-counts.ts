import { expandGlob } from "jsr:@std/fs@^1.0.8/expand-glob";
import * as path from "node:path";
import { parseNim } from "./lib/nim-parser.ts";
import { parseTts } from "./lib/tts-parser.ts";
import {
  handleMain,
  publishDir,
  vanillaDir,
  writeJsonFile,
} from "./lib/utils.ts";

const DOCS_DIR = publishDir();
const FILE = "prefab-block-counts.json";
const EXCLUD_BLOCKS = new Set(["air"]);

interface PrefabBlockCounts {
  [prefabName: string]: {
    [blockName: string]: number;
  };
}

async function main() {
  const nimFiles: string[] = [];
  for await (
    const entry of expandGlob(
      await vanillaDir("Data", "Prefabs", "*", "*.blocks.nim"),
    )
  ) {
    nimFiles.push(entry.path);
  }
  const prefabBlockCount = await readCounts(nimFiles);
  await writeJsonFile(path.join(DOCS_DIR, FILE), prefabBlockCount);
  return 0;
}

async function readCounts(nimFiles: string[]): Promise<PrefabBlockCounts> {
  const prefabBlockCounts: Promise<
    [string, { [blockName: string]: number }]
  >[] = [];

  let count = 0;
  for (const nimFile of nimFiles) {
    const prefabName = path.basename(nimFile, ".blocks.nim");
    const ttsFile = path.join(path.dirname(nimFile), `${prefabName}.tts`);
    prefabBlockCounts.push(
      (async () => {
        const counts = await countBlocks(nimFile, ttsFile);
        if (++count % 100 === 0 || count === nimFiles.length) {
          console.log(
            `Processing ${count.toString()}/${nimFiles.length.toString()}`,
          );
        }
        return [prefabName, counts];
      })(),
    );
  }

  return Object.fromEntries(
    (await Promise.all(prefabBlockCounts)).toSorted((a, b) =>
      a[0].localeCompare(b[0])
    ),
  );
}

async function countBlocks(
  nimFile: string,
  ttsFile: string,
): Promise<{ [blockName: string]: number }> {
  const [nim, tts] = await Promise.all([parseNim(nimFile), parseTts(ttsFile)]);
  return Object.fromEntries(
    Array.from(nim)
      .filter(([, name]) => !EXCLUD_BLOCKS.has(name))
      .toSorted((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => [name, tts.blockNums.get(id) ?? 0]),
  );
}

handleMain(main());
