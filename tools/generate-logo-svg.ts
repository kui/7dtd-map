import * as fs from "node:fs/promises";
import opentype from "opentype.js";
import { handleMain, projectRoot, publishDir } from "./lib/utils.ts";

// U+2718 HEAVY MULTIPLICATION X, matching the Prefab Sign / Toggle Sign
// glyph already subset into NotoSansSymbols2.subset.woff2 for the .logo
// span and the canvas map marker.
const GLYPH = "✘";
const X = 52;
const Y = 180;
const FONT_SIZE = 220;
const VIEWPORT = 256;

async function main() {
  const fontBuffer = await fs.readFile(
    projectRoot("tools", "fonts", "NotoSansSymbols2-Regular.ttf"),
  );
  const font = opentype.parse(
    fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength,
    ),
  );
  const d = font.getPath(GLYPH, X, Y, FONT_SIZE).toPathData(2);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEWPORT}" height="${VIEWPORT}">
  <path d="${d}" fill="black" stroke="black" stroke-width="26.4" />
  <path d="${d}" fill="red" stroke="white" stroke-width="8.8" />
</svg>
`;

  const outputPath = publishDir("logo.svg");
  await fs.writeFile(outputPath, svg);
  console.log("Wrote %s", outputPath);
  return 0;
}

handleMain(main());
