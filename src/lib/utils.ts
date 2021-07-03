export function requireNonnull<T>(t: T | undefined | null, message = () => `Unexpected state: ${t}`): T {
  if (t) return t;
  else throw Error(message());
}

export function requireType<T>(o: unknown, t: { new (...a: unknown[]): T }, message = () => `Unexpected type: ${o}`): T {
  if (o instanceof t) return o;
  throw Error(message());
}

export function component<T extends HTMLElement>(id: string, t: { new (...a: unknown[]): T }): T {
  return requireType(requireNonnull(document.getElementById(id)), t);
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
