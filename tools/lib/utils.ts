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

export async function localJson(): Promise<LocalJson> {
  const buffer = await fs.promises.readFile(projectRoot("local.json"));
  return JSON.parse(buffer.toString()) as LocalJson;
}

export async function vanillaDir(...pathList: string[]): Promise<string> {
  return path.join((await localJson()).vanillaDir, ...pathList);
}

export function requireNonnull<T>(a: T | null | undefined, message = () => "Unexpected error"): T {
  if (a == null) throw Error(message());
  return a;
}

export function handleMain(main: Promise<number>): void {
  void main
    .catch((e: unknown) => {
      console.error(e);
      return 1;
    })
    .then((exitCode) => {
      if (typeof Deno !== "undefined") {
        Deno.exit(exitCode);
      } else {
        process.exit(exitCode);
      }
    });
}

export async function writeJsonFile(file: string, json: unknown) {
  await fs.promises.writeFile(file, JSON.stringify(json, null, "\t"));
  console.log("Write %s", file);
}

export function program() {
  if (typeof Deno !== "undefined") {
    return path.basename(fileURLToPath(Deno.mainModule));
  }
  return path.basename(requireNonnull(process.argv[1]), `Unexpected process.argv: ${process.argv.join(" ")}`);
}

export function buildSetMapByEntries<K, V>(entries: Iterable<[K, V]>): Map<K, Set<V>> {
  const map = new Map<K, Set<V>>();
  for (const [k, v] of entries) {
    const set = map.get(k) ?? new Set<V>();
    set.add(v);
    map.set(k, set);
  }
  return map;
}

export function buildArrayMapByEntries<K, V>(entries: Iterable<[K, V]>): Map<K, V[]> {
  const map = new Map<K, V[]>();
  for (const [k, v] of entries) {
    const array = map.get(k) ?? [];
    array.push(v);
    map.set(k, array);
  }
  return map;
}
