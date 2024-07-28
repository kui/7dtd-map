export function requireNonnull<T>(t: T | undefined | null, errorMessage = () => `Unexpected state: ${String(t)}`): T {
  if (t == null) throw Error(errorMessage());
  return t;
}

export function strictParseInt(s: string | undefined | null, errorMessage = () => `Unexpected argument: ${String(s)}`): number {
  const n = parseInt(s ?? "");
  if (isNaN(n)) throw Error(errorMessage());
  return n;
}

export function requireType<T>(
  o: unknown,
  t: new (...a: unknown[]) => T,
  errorMessage = () => `Unexpected type: expected as ${String(t)}, but actual type ${String(o)}`,
): T {
  if (o instanceof t) return o;
  throw Error(errorMessage());
}

export function component<T extends HTMLElement = HTMLElement>(id: string | undefined | null, t?: new (...a: unknown[]) => T): T {
  const i = requireNonnull(id, () => "Unexpected argument: id is null");
  const e = requireNonnull(document.getElementById(i), () => `Element not found: #${i}`);
  return t ? requireType(e, t) : (e as T);
}

export function removeAllChildren(e: HTMLElement): void {
  while (e.lastChild) e.removeChild(e.lastChild);
}

export function humanreadableDistance(d: number): string {
  if (d < 1000) {
    return `${d.toString()}m`;
  }
  return `${(d / 1000).toFixed(2)}km`;
}

export function waitAnimationFrame(): Promise<number> {
  return new Promise((r) => requestAnimationFrame(r));
}

interface EventOffsets {
  offsetX: number;
  offsetY: number;
}

export function formatCoords(
  map: GameMapSize,
  canvas: HTMLCanvasElement,
  elevation: (coods: GameCoords, mapSize: GameMapSize) => number | null,
  event: EventOffsets | null,
): string {
  if (!event) return "E/W: -, N/S: -, Elev: -";

  const gameCoords = canvasEventToGameCoords(event, map, canvas);
  if (gameCoords === null) {
    return "E/W: -, N/S: -, Elev: -";
  }

  const y = elevation(gameCoords, map) ?? "-";
  return `E/W: ${gameCoords.x.toString()}, N/S: ${gameCoords.z.toString()}, Elev: ${y.toString()}`;
}

export function downloadCanvasPng(fileName: string, canvas: HTMLCanvasElement): void {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

let imageBitmapToPngBlobCount = 0;
export async function imageBitmapToPngBlob(img: ImageBitmap): Promise<PngBlob> {
  const count = imageBitmapToPngBlobCount++;
  console.time(`imageBitmapToPngBlob ${count.toString()}`);
  const canvas = new OffscreenCanvas(img.height, img.width);
  const context = requireNonnull(canvas.getContext("2d"));
  context.drawImage(img, 0, 0);
  const b = (await canvas.convertToBlob({ type: "image/png" })) as PngBlob;
  console.timeEnd(`imageBitmapToPngBlob ${count.toString()}`);
  console.debug("imageBitmapToPngBlob png %d KB", b.size / 1000);
  return b;
}

export async function sleep(msec: number): Promise<void> {
  return new Promise((r) => setTimeout(r, msec));
}

export function gameMapSize(s: { width: number; height: number }): GameMapSize {
  return { type: "game", ...s };
}

export function gameCoords(c: { x: number; z: number }): GameCoords {
  return { type: "game", ...c };
}

/** Returns null if the event was fired out of the canvas */
export function canvasEventToGameCoords(event: EventOffsets, mapSize: GameMapSize, canvasSize: HTMLCanvasElement): GameCoords | null {
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

export function threePlaneSize(width: number, height: number): ThreePlaneSize {
  return { type: "threePlane", width, height };
}

export function printError(e: unknown): void {
  console.error(e);
}

export async function fetchJson<T>(url: string): Promise<T> {
  return (await (await fetch(url)).json()) as T;
}

export async function invokeAll<T>(fns: ((t: T) => unknown)[], t: T): Promise<void> {
  await Promise.all(fns.map((fn) => fn(t)));
}

export function basename(path: string) {
  return path.substring(path.lastIndexOf("/") + 1);
}
