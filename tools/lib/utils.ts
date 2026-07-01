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

// Must stay a static project-relative path: `deno task` input-based
// caching needs it expressible as a glob in `deno.jsonc:files`.
export function vanillaDir(...pathList: string[]): string {
  return projectRoot("tools", "vanilla", ...pathList);
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

export async function writeJsonFile(
  file: string,
  json: unknown,
  options: { collapseLeafArrays?: boolean } = {},
) {
  let body = JSON.stringify(json, null, "\t");
  if (options.collapseLeafArrays) body = collapseLeafArrays(body);
  await fs.promises.writeFile(file, body);
  console.log("Write %s", file);
}

// Folds tab-indented arrays of primitives onto a single line so callers like
// the mesh-sizes table render as `"name": [w, d]` instead of spanning four
// lines. Only matches JSON primitives (numbers / strings / booleans / null),
// so structured elements stay pretty-printed.
function collapseLeafArrays(body: string): string {
  const primitive =
    `(?:-?\\d+(?:\\.\\d+)?|"(?:[^"\\\\]|\\\\.)*"|true|false|null)`;
  const re = new RegExp(
    `\\[\\n\\s*(${primitive}(?:,\\n\\s*${primitive})*)\\n\\s*\\]`,
    "g",
  );
  return body.replace(
    re,
    (_, inner: string) => `[${inner.split(/,\s*\n\s*/).join(", ")}]`,
  );
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
 * Normalize a value that may be a single item, an array, or undefined into an
 * array. Used when parsing XML where a single child element is returned as an
 * object instead of an array.
 */
export function toArray<T>(value: T | T[] | undefined): T[] {
  return Array.isArray(value) ? value : value ? [value] : [];
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
      // deno-lint-ignore no-non-null-assertion
      results[currentIndex] = await tasks[currentIndex]!();
    }
  }

  await Promise.all(Array.from({ length: maxConcurrency }, () => worker()));
  return results;
}
