export function requireNonnull<T>(t: T | undefined | null, message = () => `Unexpected state: ${t}`): T {
  if (t) return t;
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
  map: RectSize,
  canvas: RectSize,
  elevation: (coods: Coords, width: number) => number | null,
  event: EventOffsets | null
): string {
  if (!event) return "E/W: -, N/S: -, Elev: -";

  // in-game scale coords with left-top offset
  const gx = (event.offsetX * map.width) / canvas.width;
  const gz = (event.offsetY * map.height) / canvas.height;
  if (gx < 0 || gx >= map.width || gz < 0 || gz >= map.height) {
    return "E/W: -, N/S: -, Elev: -";
  }

  // in-game coords (center offset)
  const x = Math.round(gx - map.width / 2);
  const z = Math.round(map.height / 2 - gz);
  const e = elevation({ x: Math.round(gx), z: Math.round(gz) }, map.width) ?? "-";
  return `E/W: ${x}, N/S: ${z}, Elev: ${e}`;
}

export function downloadCanvasPng(fileName: string, canvas: HTMLCanvasElement): void {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export async function imageBitmapToPngBlob(img: ImageBitmap): Promise<PngBlob> {
  const canvas = new OffscreenCanvas(img.height, img.width);
  const context = requireNonnull(canvas.getContext("2d"));
  context.drawImage(img, 0, 0);
  return (await canvas.convertToBlob({ type: "image/png" })) as PngBlob;
}

export async function sleep(msec: number): Promise<void> {
  return new Promise((r) => setTimeout(r, msec));
}
