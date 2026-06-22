import process from "node:process";
import { promises as fs } from "node:fs";
import { handleMain, program } from "./lib/utils.ts";
import { decode, type DecodedPng } from "fast-png";

const usage = `${program()} <png>
Print the statistics of pixels in the PNG file.`;

async function main() {
  const pngFile = process.argv[2];
  if (pngFile === undefined) {
    console.error(usage);
    return 1;
  }
  const stat = await statPixels(pngFile);
  console.log("  red,gre,blu,alp: count");
  for (
    const [key, count] of Array.from(stat).toSorted((a, b) => b[1] - a[1])
  ) {
    console.log(`  ${formatPixelKey(key)}: ${count.toString()}`);
  }
  return 0;
}

export async function statPixels(
  pngFile: string,
): Promise<Map<number, number>> {
  const buf = await fs.readFile(pngFile);
  return statDecodedPixels(decode(buf));
}

export function statDecodedPixels(decoded: DecodedPng): Map<number, number> {
  assertPng8BitRgba(decoded);
  const data = decoded.data;
  const stat = new Map<number, number>();
  for (let i = 0; i < data.length; i += 4) {
    // Pack RGBA into a single non-negative 32-bit integer so the Map key
    // is a number rather than an allocated string per pixel.
    const key = data[i] * 0x1000000 +
      ((data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]);
    stat.set(key, (stat.get(key) ?? 0) + 1);
  }
  return stat;
}

export function formatPixelKey(key: number): string {
  const r = Math.floor(key / 0x1000000);
  const g = (key >>> 16) & 0xff;
  const b = (key >>> 8) & 0xff;
  const a = key & 0xff;
  return [r, g, b, a].map((n) => n.toString().padStart(3)).join(",");
}

function assertPng8BitRgba(
  decoded: DecodedPng,
): asserts decoded is
  & DecodedPng
  & { data: Uint8Array | Uint8ClampedArray; channels: 4 } {
  if (decoded.data instanceof Uint16Array) {
    throw new Error(
      "Unsupported PNG format: 16-bit depth is not expected for this tool.",
    );
  }
  if (decoded.channels !== 4) {
    throw new Error(
      `Unsupported PNG format: expected 4 channels (RGBA), got ${decoded.channels.toString()}.`,
    );
  }
}

if (import.meta.main) handleMain(main());
