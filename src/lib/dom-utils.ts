import type {
  GameCoords,
  GameMapSize,
  Prefab,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";
import { gameCoords, requireNonnull, requireType } from "./utils.ts";

export function component<T extends HTMLElement = HTMLElement>(
  id: string | undefined | null,
  t?: new (...a: unknown[]) => T,
): T {
  const i = requireNonnull(id, () => "Unexpected argument: id is null");
  const e = requireNonnull(
    document.getElementById(i),
    () => `Element not found: #${i}`,
  );
  return t ? requireType(e, t) : (e as T);
}

export function removeAllChildren(e: HTMLElement): void {
  while (e.lastChild) e.removeChild(e.lastChild);
}

/** Form elements that expose a `value` and `id` we sync on. */
export function isFormValueElement(
  target: EventTarget | null,
): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement;
}

export function waitAnimationFrame(): Promise<number> {
  return new Promise((r) => requestAnimationFrame(r));
}

interface EventOffsets {
  offsetX: number;
  offsetY: number;
}

export async function formatCoords(
  map: GameMapSize | null,
  canvas: HTMLCanvasElement,
  elevation: (coods: GameCoords) => Promise<number | null>,
  event: EventOffsets | null,
): Promise<string> {
  if (!event || !map) return "E/W: -, N/S: -, Elev: -";

  const coords = canvasEventToGameCoords(event, map, canvas);
  if (coords === null) return "E/W: -, N/S: -, Elev: -";

  const y = (await elevation(coords)) ?? "-";
  return `E/W: ${coords.x.toString()}, N/S: ${coords.z.toString()}, Elev: ${y.toString()}`;
}

export function downloadCanvasPng(
  fileName: string,
  canvas: HTMLCanvasElement,
): void {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export interface CssRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * On-canvas CSS rect of a prefab's footprint AABB, computed as the inverse
 * of canvasEventToGameCoords. Boxes smaller than minSizePx grow around their
 * centre so they stay noticeable on a zoomed-out map; when the mesh size is
 * unknown the fixed-size box keeps its left/bottom anchored at the prefab
 * coords instead (decoration.position is the SW corner of the AABB).
 */
export function prefabFootprintCssRect(
  prefab: Pick<Prefab, "name" | "x" | "z" | "rotation">,
  mapSize: GameMapSize,
  canvasSize: { width: number; height: number },
  meshSizes: PrefabMeshSizes,
  minSizePx = 24,
): CssRect {
  const scaleX = canvasSize.width / mapSize.width;
  const scaleY = canvasSize.height / mapSize.height;
  const left = (prefab.x + Math.floor(mapSize.width / 2)) * scaleX;
  const bottom = (Math.floor(mapSize.height / 2) - prefab.z) * scaleY;

  const size = meshSizes[prefab.name];
  if (!size) {
    return {
      left,
      top: bottom - minSizePx,
      width: minSizePx,
      height: minSizePx,
    };
  }

  // WHY: rotations by 90° or 270° swap the world-aligned width and depth.
  const odd = ((prefab.rotation ?? 0) & 1) === 1;
  let width = (odd ? size[1] : size[0]) * scaleX;
  let height = (odd ? size[0] : size[1]) * scaleY;
  let clampedLeft = left;
  let clampedBottom = bottom;
  if (width < minSizePx) {
    clampedLeft -= (minSizePx - width) / 2;
    width = minSizePx;
  }
  if (height < minSizePx) {
    clampedBottom += (minSizePx - height) / 2;
    height = minSizePx;
  }
  return { left: clampedLeft, top: clampedBottom - height, width, height };
}

/** Returns null if the event was fired out of the canvas */
export function canvasEventToGameCoords(
  event: EventOffsets,
  mapSize: GameMapSize,
  canvasSize: HTMLCanvasElement,
): GameCoords | null {
  const gx = (event.offsetX * mapSize.width) / canvasSize.width;
  const gz = (event.offsetY * mapSize.height) / canvasSize.height;
  if (gx < 0 || gx >= mapSize.width || gz < 0 || gz >= mapSize.height) {
    return null;
  }

  const x = gx - Math.floor(mapSize.width / 2);
  const z = Math.floor(mapSize.height / 2) - gz;
  return gameCoords({ x: Math.round(x), z: Math.round(z) });
}
