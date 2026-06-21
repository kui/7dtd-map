import process from "node:process";
import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

export function projectRoot(...pathList: string[]): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(dirname, "..", "..", ...pathList);
}

export function publishDir(...pathList: string[]): string {
  return projectRoot("public", ...pathList);
}

export interface LocalJson {
  vanillaDir: string;
}

let localJsonCache: LocalJson | undefined;

export async function localJson(): Promise<LocalJson> {
  if (localJsonCache === undefined) {
    const buffer = await fs.promises.readFile(projectRoot("local.json"));
    localJsonCache = JSON.parse(buffer.toString()) as LocalJson;
  }
  return localJsonCache;
}

export async function vanillaDir(...pathList: string[]): Promise<string> {
  return path.join((await localJson()).vanillaDir, ...pathList);
}

export function requireNonnull<T>(
  a: T | null | undefined,
  message = () => "Unexpected error",
): T {
  if (a === null || a === undefined) throw Error(message());
  return a;
}

export function handleMain(main: Promise<number>): void {
  void main
    .catch((e: unknown) => {
      console.error(e);
      return 1;
    })
    .then((exitCode) => {
      process.exit(exitCode);
    });
}

export async function writeJsonFile(file: string, json: unknown) {
  await fs.promises.writeFile(file, JSON.stringify(json, null, "\t"));
  console.log("Write %s", file);
}

export function program() {
  return path.basename(
    requireNonnull(
      process.argv[1],
      () => `Unexpected process.argv: ${process.argv.join(" ")}`,
    ),
  );
}

export function buildSetMapByEntries<K, V>(
  entries: Iterable<[K, V]>,
): Map<K, Set<V>> {
  const map = new Map<K, Set<V>>();
  for (const [k, v] of entries) {
    const set = map.get(k) ?? new Set<V>();
    set.add(v);
    map.set(k, set);
  }
  return map;
}

export function buildArrayMapByEntries<K, V>(
  entries: Iterable<[K, V]>,
): Map<K, V[]> {
  const map = new Map<K, V[]>();
  for (const [k, v] of entries) {
    const array = map.get(k) ?? [];
    array.push(v);
    map.set(k, array);
  }
  return map;
}

/**
 * Run async tasks with a limit on the number of concurrently running tasks.
 */
export async function throttleAll<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (true) {
      const currentIndex = index++;
      if (currentIndex >= tasks.length) break;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  await Promise.all(Array.from({ length: maxConcurrency }, () => worker()));
  return results;
}
