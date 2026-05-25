import process from "node:process";
import { readFileSync } from "node:fs";
import { handleMain, program } from "./lib/utils.ts";
import { decode } from "fast-png";

const usage = `${program()} <png>
Print the statistics of pixels in the PNG file.`;

function main() {
  const pngFile = process.argv[2];
  if (pngFile === undefined) {
    console.error(usage);
    return 1;
  }
  const stat = statPixels(pngFile);
  console.log("  red,gre,blu,alp: count");
  for (
    const [pixels, count] of Array.from(stat).toSorted((a, b) => b[1] - a[1])
  ) {
    console.log(`  ${pixels}: ${count.toString()}`);
  }
  return 0;
}

function statPixels(pngFile: string): Map<string, number> {
  const pixelStat = new Map<string, number>();
  const buf = readFileSync(pngFile);
  const decoded = decode(buf);
  assertPng8Bit(decoded.data);
  for (let i = 0; i < decoded.data.length; i += 4) {
    const pixels = [...decoded.data.subarray(i, i + 4)]
      .map((n) => n.toString().padStart(3))
      .join(",");
    const pixelCount = pixelStat.get(pixels) ?? 0;
    pixelStat.set(pixels, pixelCount + 1);
  }
  return pixelStat;
}

function assertPng8Bit(
  data: Uint8Array | Uint8ClampedArray | Uint16Array,
): asserts data is Uint8Array | Uint8ClampedArray {
  if (data instanceof Uint16Array) {
    throw new Error(
      "Unsupported PNG format: 16-bit depth is not expected for this tool.",
    );
  }
}

handleMain(Promise.resolve(main()));
