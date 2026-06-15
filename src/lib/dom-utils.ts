import type { GameCoords, GameMapSize } from "../types/7dtdmap.ts";
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

/** Returns null if the event was fired out of the canvas */
export function canvasEventToGameCoords(
  event: EventOffsets,
  mapSize: GameMapSize,
  canvasSize: HTMLCanvasElement,
): GameCoords | null {
  // in-game scale coords with left-top offset
  const gx = (event.offsetX * mapSize.width) / canvasSize.width;
  const gz = (event.offsetY * mapSize.height) / canvasSize.height;
  if (gx < 0 || gx >= mapSize.width || gz < 0 || gz >= mapSize.height) {
    return null;
  }

  // in-game coords (center offset)
  const x = gx - Math.floor(mapSize.width / 2);
  const z = Math.floor(mapSize.height / 2) - gz;
  return gameCoords({ x: Math.round(x), z: Math.round(z) });
}
