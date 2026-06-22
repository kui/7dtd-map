import { expandGlob } from "@std/fs/expand-glob";
import * as path from "node:path";
import { parseNim } from "./lib/nim-parser.ts";
import { parseTts } from "./lib/tts-parser.ts";
import { prefabSiblingFiles } from "./lib/prefab-files.ts";
import {
  handleMain,
  publishDir,
  throttleAll,
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
  console.log("Load nim files");
  const globPath = await vanillaDir("Data", "Prefabs", "*", "*.blocks.nim");
  const nimFiles = await Array.fromAsync(
    expandGlob(globPath),
    (e) => e.path,
  );
  console.log("Found %d nim files from %s", nimFiles.length, globPath);

  console.log("Read counts");
  const prefabBlockCount = await readCounts(nimFiles);
  console.log("Write json");
  await writeJsonFile(path.join(DOCS_DIR, FILE), prefabBlockCount);
  console.log("Done");
  return 0;
}

async function readCounts(nimFiles: string[]): Promise<PrefabBlockCounts> {
  let count = 0;
  const tasks = nimFiles.map((nimFile) => async () => {
    const { name: prefabName, tts: ttsFile } = prefabSiblingFiles(nimFile);
    const counts = await countBlocks(nimFile, ttsFile);
    if (++count % 100 === 0 || count === nimFiles.length) {
      console.log(
        `Processing ${count.toString()}/${nimFiles.length.toString()}`,
      );
    }
    return [prefabName, counts] as [string, { [blockName: string]: number }];
  });

  return Object.fromEntries(
    (await throttleAll(tasks, 100)).toSorted((a, b) =>
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
