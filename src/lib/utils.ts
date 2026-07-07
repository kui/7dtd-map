import type {
  Direction,
  GameCoords,
  GameMapSize,
  ThreePlaneSize,
} from "../types/7dtdmap.ts";

export type { Direction, GameCoords, GameMapSize, ThreePlaneSize };

export function requireNonnull<T>(
  t: T | undefined | null,
  errorMessage = () => `Unexpected state: ${String(t)}`,
): T {
  if (t === null || t === undefined) throw Error(errorMessage());
  return t;
}

export function strictParseInt(
  s: string | undefined | null,
  radix = 10,
  errorMessage = () => `Unexpected argument: ${String(s)}`,
): number {
  const n = parseInt(s ?? "", radix);
  if (isNaN(n)) throw Error(errorMessage());
  return n;
}

export function requireType<T>(
  o: unknown,
  t: new (...a: unknown[]) => T,
  errorMessage = () =>
    `Unexpected type: expected as ${String(t)}, but actual type ${String(o)}`,
): T {
  if (o instanceof t) return o;
  throw Error(errorMessage());
}

export function humanreadableDistance(
  [direction, distance]: [Direction | null, number],
): string {
  const dir = direction ?? "";
  if (distance < 1000) {
    return `${dir} ${distance.toString()}m`;
  }
  return `${dir} ${(distance / 1000).toFixed(2)}km`;
}

export function sleep(msec: number): Promise<void> {
  return new Promise((r) => setTimeout(r, msec));
}

export function gameMapSize(s: { width: number; height: number }): GameMapSize {
  return { type: "game", ...s };
}

export function gameCoords(c: { x: number; z: number }): GameCoords {
  return { type: "game", ...c };
}

export function threePlaneSize(width: number, height: number): ThreePlaneSize {
  return { type: "threePlane", width, height };
}

export function printError(e: unknown): void {
  console.error("%o", e);
}

export async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw Error(`Failed to fetch ${url}: ${r.statusText}`);
  return (await r.json()) as T;
}

// Reject empty/short bodies before they are persisted: dev/CI static servers
// occasionally return them under load. See github.com/kui/7dtd-map/issues/202.
export async function fetchCompleteBlob(url: string): Promise<Blob> {
  const r = await fetch(url);
  if (!r.ok) throw Error(`Failed to fetch ${url}: ${r.statusText}`);
  const blob = await r.blob();
  // Content-Encoding bodies decompress client-side, so blob.size legitimately
  // differs from Content-Length; only length-check uncompressed responses.
  const header = r.headers.get("content-length");
  const declared = header === null ? NaN : Number(header);
  const short = r.headers.get("content-encoding") === null &&
    Number.isFinite(declared) && blob.size !== declared;
  if (blob.size === 0 || short) {
    throw Error(
      `Incomplete download for ${url}: ${blob.size.toString()} bytes` +
        (Number.isFinite(declared)
          ? ` (content-length=${declared.toString()})`
          : "") +
        ". See https://github.com/kui/7dtd-map/issues/202",
    );
  }
  return blob;
}

export function basename(path: string) {
  const tail = path.substring(path.lastIndexOf("/") + 1);
  return tail.split(/[?#]/, 1)[0] ?? tail;
}

// Escape characters that have special meaning in HTML text content or in
// double-quoted attribute values. Inputs sourced from user-supplied XML files
// or worker output must be passed through this before being interpolated into
// innerHTML strings.
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

export async function readWholeStream(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
