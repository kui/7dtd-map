import * as fs from "node:fs";
import path from "node:path";
import * as stream from "node:stream";
import * as pngjs from "pngjs";
import * as mapFiles from "../lib/map-files.js";
import { handleMain, projectRoot, vanillaDir, writeJsonFile } from "./lib/utils.js";

mapFiles.setPNG(pngjs.PNG);

const WORLDS_DIR = await vanillaDir("Data", "Worlds");
const DST_DIR = projectRoot("docs", "maps");

async function main() {
  const worldDirs = await fs.promises.readdir(WORLDS_DIR).then(filterValidWorldDirs);
  await writeJsonFile(path.join(DST_DIR, "index.json"), worldDirs);
  // TODO Make it parallel
  for (const worldDir of worldDirs) {
    console.log(`Process ${worldDir}`);
    const src = path.join(WORLDS_DIR, worldDir);
    const dst = path.join(DST_DIR, worldDir);
    await fs.promises.mkdir(dst, { recursive: true });
    await pruneUnkownMapFiles(dst);
    await processFiles(src, dst);
  }
  return 0;
}

async function filterValidWorldDirs(dirs: string[]): Promise<string[]> {
  const filtered = [];
  for (const dir of dirs) {
    if (await isValidWorldDir(path.join(WORLDS_DIR, dir))) {
      filtered.push(dir);
    } else {
      console.log("Ignore invalid world dir: ", dir);
    }
  }
  return filtered;
}

async function isValidWorldDir(dir: string) {
  return (await fs.promises.stat(dir)).isDirectory() && (await fs.promises.readdir(dir)).includes("map_info.xml");
}

async function pruneUnkownMapFiles(dir: string) {
  for (const file of await fs.promises.readdir(dir)) {
    if (mapFiles.isMapFileName(file)) continue;
    const p = path.join(dir, file);
    console.log(`Remove ${p} because it is not a map file`);
    await fs.promises.unlink(p);
  }
}

async function processFiles(srcDir: string, dstDir: string) {
  const srcFiles = await fs.promises.readdir(srcDir);
  for (const srcFileName of srcFiles) {
    if (!mapFiles.isWorldFileName(srcFileName)) {
      console.log("Ignore unknown file: ", srcFileName);
      continue;
    }
    if (mapFiles.hasPreferWorldFileNameIn(srcFileName, srcFiles)) {
      console.log("Skip ", srcFileName, " because ", mapFiles.getPreferWorldFileName(srcFileName), " is already in the list");
      continue;
    }
    const src = path.join(srcDir, srcFileName);
    const processor = new mapFiles.Processor(srcFileName);
    const dst = path.join(dstDir, processor.mapFileName);
    console.log(`Process ${src}`);
    console.time(`-> ${dst}`);
    await processor.process(
      stream.Readable.toWeb(fs.createReadStream(src)) as ReadableStream<Uint8Array>,
      stream.Writable.toWeb(fs.createWriteStream(dst)),
    );
    console.timeEnd(`-> ${dst}`);
  }
  return 0;
}

handleMain(main());
