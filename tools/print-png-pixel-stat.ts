import process from "node:process";
import { createReadStream } from "node:fs";
import { program, handleMain } from "./lib/utils.ts";
import { PNG } from "pngjs";

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
  for (const [pixels, count] of Array.from(stat).toSorted((a, b) => b[1] - a[1])) {
    console.log(`  ${pixels}: ${count.toString()}`);
  }
  return 0;
}

function statPixels(pngFile: string): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    const pixelStat = new Map<string, number>();
    createReadStream(pngFile)
      .pipe(new PNG())
      .on("parsed", function () {
        for (let i = 0; i < this.data.length; i += 4) {
          const pixels = Array.from(this.data.subarray(i, i + 4))
            .map((n) => n.toString().padStart(3))
            .join(",");
          const pixelCount = pixelStat.get(pixels) ?? 0;
          pixelStat.set(pixels, pixelCount + 1);
        }
        resolve(pixelStat);
      })
      .on("error", reject);
  });
}

handleMain(main());
