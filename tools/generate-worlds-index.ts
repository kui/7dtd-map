import path from "node:path";
import { handleMain, projectRoot, writeJsonFile,  } from "./lib/utils.js";
import * as fs from "node:fs";

const DEST_DIR = projectRoot("docs", "worlds");

async function main() {
  await writeJsonFile(path.join(DEST_DIR, "index.json"), await generateIndex());
  return 0;
}

async function generateIndex() {
  const worlds: string[] = [];
  for await (const dirent of await fs.promises.opendir(DEST_DIR)) {
    if (dirent.isDirectory()) {
      worlds.push(dirent.name);
    }
  }
  return worlds.toSorted();
}

handleMain(main());
