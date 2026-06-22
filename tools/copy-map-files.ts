import * as fs from "node:fs";
import * as path from "node:path";
import * as stream from "node:stream";
import * as mapFiles from "../lib/map-files.ts";
import {
  handleMain,
  publishDir,
  throttleAll,
  vanillaDir,
  writeJsonFile,
} from "./lib/utils.ts";

const WORLDS_DIR = await vanillaDir("Data", "Worlds");
const DST_DIR = publishDir("maps");

// Concurrency for top-level world processing. Each world fans out into
// parallel per-file copies internally, so this value is intentionally small
// to avoid thrashing disk I/O across many large PNG/raw streams.
const WORLD_CONCURRENCY = 8;

async function main() {
  const worldDirs = await fs.promises.readdir(WORLDS_DIR).then(
    filterValidWorldDirs,
  );
  await writeJsonFile(path.join(DST_DIR, "index.json"), worldDirs);
  await throttleAll(
    worldDirs.map((worldDir) => () => processWorld(worldDir)),
    WORLD_CONCURRENCY,
  );
  return 0;
}

async function processWorld(worldDir: string) {
  console.log(`Process ${worldDir}`);
  const src = path.join(WORLDS_DIR, worldDir);
  const dst = path.join(DST_DIR, worldDir);
  await fs.promises.mkdir(dst, { recursive: true });
  await pruneUnkownMapFiles(dst);
  await processFiles(src, dst);
}

async function filterValidWorldDirs(dirs: string[]): Promise<string[]> {
  const checks = await Promise.all(
    dirs.map(async (dir) => ({
      dir,
      valid: await isValidWorldDir(path.join(WORLDS_DIR, dir)),
    })),
  );
  const filtered: string[] = [];
  for (const { dir, valid } of checks) {
    if (valid) {
      filtered.push(dir);
    } else {
      console.log("Ignore invalid world dir: ", dir);
    }
  }
  return filtered;
}

async function isValidWorldDir(dir: string) {
  return (await fs.promises.stat(dir)).isDirectory() &&
    (await fs.promises.readdir(dir)).includes("map_info.xml");
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
  await Promise.all(
    srcFiles.map((srcFileName) =>
      processOneFile(srcDir, dstDir, srcFileName, srcFiles)
    ),
  );
  return 0;
}

async function processOneFile(
  srcDir: string,
  dstDir: string,
  srcFileName: string,
  srcFiles: string[],
) {
  if (!mapFiles.isWorldFileName(srcFileName)) {
    console.log("Ignore unknown file: ", srcFileName);
    return;
  }
  if (mapFiles.hasPreferWorldFileNameIn(srcFileName, srcFiles)) {
    console.log(
      "Skip ",
      srcFileName,
      " because ",
      mapFiles.getPreferWorldFileName(srcFileName),
      " is already in the list",
    );
    return;
  }
  const src = path.join(srcDir, srcFileName);
  const processor = new mapFiles.Processor(srcFileName);
  const dst = path.join(dstDir, processor.mapFileName);
  console.log(`Process ${src}`);
  console.time(`-> ${dst}`);
  await processor.process(
    stream.Readable.toWeb(fs.createReadStream(src)) as ReadableStream<
      Uint8Array
    >,
    stream.Writable.toWeb(fs.createWriteStream(dst)),
  );
  console.timeEnd(`-> ${dst}`);
}

handleMain(main());
