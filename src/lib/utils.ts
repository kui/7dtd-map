export function requireNonnull<T>(t: T | undefined | null, message = () => `Unexpected state: ${t}`): T {
  if (t != null) return t;
  else throw Error(message());
}

export function requireType<T>(o: unknown, t: { new (...a: unknown[]): T }, message = () => `Unexpected type: ${o}`): T {
  if (o instanceof t) return o;
  throw Error(message());
}

export function component<T extends HTMLElement = HTMLElement>(id: string | null | undefined, t?: { new (...a: unknown[]): T }): T {
  const e = requireNonnull(
    document.getElementById(requireNonnull(id, () => `Element ID must not null: ${id}`)),
    () => `Element not found: #${id}`
  );
  return t ? requireType(e, t) : (e as T);
}

export function removeAllChildren(e: HTMLElement): void {
  while (e.lastChild) e.removeChild(e.lastChild);
}

export function humanreadableDistance(d: number): string {
  if (d < 1000) {
    return `${d}m`;
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
  event: EventOffsets | null
): string {
  if (!event) return "E/W: -, N/S: -, Elev: -";

  const gameCoords = canvasEventToGameCoords(event, map, canvas);
  if (gameCoords === null) {
    return "E/W: -, N/S: -, Elev: -";
  }

  const y = elevation(gameCoords, map) ?? "-";
  return `E/W: ${gameCoords.x}, N/S: ${gameCoords.z}, Elev: ${y}`;
}
// export function formatCoords(
//   map: GameMapSize,
//   canvas: HTMLCanvasElement,
//   elevation: (coods: GameCoords, mapSize: GameMapSize) => number | null,
//   event: EventOffsets | null
// ): MapCoord {
//   if (!event) return {"-", "-", "-"};

//   const gameCoords = canvasEventToGameCoords(event, map, canvas);
//   // if (gameCoords === null) {
//   //   return "E/W: -, N/S: -, Elev: -";
//   // }

//   const y = elevation(gameCoords, map) ?? "-";
//   return {gameCoords.x, gameCoords.z, y};
// }

export function downloadCanvasPng(fileName: string, canvas: HTMLCanvasElement): void {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export async function imageBitmapToPngBlob(img: ImageBitmap): Promise<PngBlob> {
  const canvas = new OffscreenCanvas(img.height, img.width);
  const context = requireNonnull(canvas.getContext("2d"));
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  context.drawImage(img, 0, 0);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (await canvas.convertToBlob({ type: "image/png" })) as PngBlob;
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
