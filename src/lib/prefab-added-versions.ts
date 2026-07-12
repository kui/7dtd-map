import type { PrefabAddedVersions } from "../types/7dtdmap.ts";

/**
 * Parses each dot-separated version string (e.g. `"3.10"`) into a
 * numeric segment array and keeps the numerically greatest one, so
 * `"3.10"` is treated as newer than `"3.2"`. Plain lexicographic sort
 * would order them backwards.
 *
 * Kept separate from `lib/prefabs.ts` (which uses `DOMParser`) so it
 * is importable from the filter worker, where DOM types are
 * unavailable.
 */
export function latestAddedVersion(
  addedVersions: PrefabAddedVersions,
): string {
  const knownVersions = new Set<string>();
  let latest: number[] | null = null;
  for (const version of Object.values(addedVersions)) {
    if (knownVersions.has(version)) continue;
    knownVersions.add(version);
    const parsed = version.split(".").map(Number);
    if (latest === null || isLaterThan(parsed, latest)) {
      latest = parsed;
    }
  }
  if (latest === null) {
    throw new Error(
      "addedVersions is empty; cannot determine the latest version",
    );
  }
  return latest.join(".");
}

function isLaterThan(a: number[], b: number[]): boolean {
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return false;
}
