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

// Note: This logic can not be moved to a worker because DOM API like `DOMParser` is not available in workers.
export async function loadPrefabsXml(): Promise<Prefab[]> {
  const workspace = await storage.workspaceDir();
  const prefabsXml = await workspace.get("prefabs.xml");
  return prefabsXml ? parseXml(await prefabsXml.text()) : [];
}

function parseXml(xml: string): Prefab[] {
  const dom = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(dom.getElementsByTagName("decoration")).flatMap((e) => {
    const position = e.getAttribute("position")?.split(",");
    if (position?.length !== 3) return [];
    const [x, , z] = position;
    if (!x || !z) return [];
    const name = e.getAttribute("name");
    if (!name) return [];
    const rotationAttr = e.getAttribute("rotation");
    const rotation = rotationAttr === null ? 0 : parseInt(rotationAttr, 10);
    return {
      name,
      x: parseInt(x),
      z: parseInt(z),
      rotation: Number.isFinite(rotation) ? rotation & 3 : 0,
    };
  });
}
