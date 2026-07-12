import type { Prefab } from "../types/7dtdmap.ts";
import * as storage from "./storage.ts";

export type DifficultyIndex = 0 | 1 | 2 | 3 | 4 | 5;

const MAX_DIFFICULTY: DifficultyIndex = 5;

export function assertDifficultyIndex(
  i: number,
): asserts i is DifficultyIndex {
  if (!Number.isInteger(i) || i < 0 || i > MAX_DIFFICULTY) {
    throw new RangeError(
      `Difficulty index out of range (0-5): ${i.toString()}`,
    );
  }
}

/**
 * Runs on the main thread because it uses `DOMParser`, which is not
 * available in workers.
 */
export async function loadPrefabsXml(): Promise<Prefab[]> {
  const workspace = await storage.workspaceDir();
  const prefabsXml = await workspace.get("prefabs.xml");
  return prefabsXml ? parseXml(await prefabsXml.text()) : [];
}

function parseXml(xml: string): Prefab[] {
  const dom = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(dom.getElementsByTagName("decoration")).flatMap((e) => {
    const prefab = decorationToPrefab(e);
    return prefab ? [prefab] : [];
  });
}

/** Exported for testing without a DOM. Accepts anything with `getAttribute`. */
export function decorationToPrefab(
  e: { getAttribute(name: string): string | null },
): Prefab | null {
  const positionAttr = e.getAttribute("position");
  const name = e.getAttribute("name");
  // WHY: a decoration without a name or position is not a placed prefab, so skip it.
  if (name === null || positionAttr === null) return null;
  const nums = positionAttr.split(",").map((s) => parseInt(s, 10));
  // WHY: a malformed position is a corrupt World File. Fail loudly instead of coercing to NaN or silently dropping the prefab.
  if (nums.length !== 3 || !nums.every((n) => Number.isFinite(n))) {
    throw new Error(
      `Invalid decoration position "${positionAttr}" for prefab "${name}"`,
    );
  }
  const [x, y, z] = nums as [number, number, number];
  const rotationAttr = e.getAttribute("rotation");
  const rotation = rotationAttr === null ? 0 : parseInt(rotationAttr, 10);
  const yIsGroundLevel = e.getAttribute("y_is_groundlevel") === "true";
  return {
    name,
    x,
    y,
    z,
    rotation: Number.isFinite(rotation) ? rotation & 3 : 0,
    yIsGroundLevel,
  };
}
