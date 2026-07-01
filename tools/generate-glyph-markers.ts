import * as fs from "node:fs/promises";
import opentype from "opentype.js";
import {
  handleMain,
  projectRoot,
  publishDir,
  writeJsonFile,
} from "./lib/utils.ts";
import {
  GLYPH_MARKER_FONT_SIZE,
  GLYPH_MARKER_STROKE_WIDTHS,
  GLYPH_MARKER_VIEWPORT,
} from "../lib/glyph-marker.ts";

interface MarkerJob {
  fontFile: string;
  glyph: string;
  // Hand-tuned placement of `glyph` within the shared VIEWPORT square.
  x: number;
  y: number;
  svgName: string;
  jsonName: string;
}

// Baked at build time from font outlines instead of rendered from a webfont
// at runtime: the map canvas (src/worker/lib/map-renderer.ts) and each SVG
// stamp/render the identical static shape with zero font-loading cost.
const MARKERS: Readonly<Record<string, MarkerJob>> = {
  sign: {
    // U+2718 HEAVY MULTIPLICATION X — the Prefab Sign / Toggle Sign marker.
    fontFile: "NotoSansSymbols2-Regular.ttf",
    glyph: "✘",
    x: 52,
    y: 180,
    svgName: "logo.svg",
    jsonName: "sign-path.json",
  },
  flag: {
    // U+1F6A9 TRIANGULAR FLAG ON POST. Uses the "old" Noto Emoji release,
    // which draws a filled flag; the current release's 🚩 is hollow and
    // hard to see against map terrain.
    fontFile: "NotoEmojiOld-Regular.ttf",
    glyph: "🚩",
    x: -18,
    y: 207,
    svgName: "flag-mark.svg",
    jsonName: "flag-path.json",
  },
};

async function main() {
  for (const job of Object.values(MARKERS)) {
    await generateMarker(job);
  }
  return 0;
}

async function generateMarker(job: MarkerJob) {
  const fontBuffer = await fs.readFile(
    projectRoot("tools", "fonts", job.fontFile),
  );
  const font = opentype.parse(
    fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength,
    ),
  );
  const d = font.getPath(job.glyph, job.x, job.y, GLYPH_MARKER_FONT_SIZE)
    .toPathData(2);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${GLYPH_MARKER_VIEWPORT}" height="${GLYPH_MARKER_VIEWPORT}">
  <defs>
    <path id="glyph" d="${d}" />
  </defs>
  <use href="#glyph" fill="black" stroke="black" stroke-width="${GLYPH_MARKER_STROKE_WIDTHS.black}" />
  <use href="#glyph" fill="red" stroke="white" stroke-width="${GLYPH_MARKER_STROKE_WIDTHS.white}" />
</svg>
`;
  const svgPath = publishDir(job.svgName);
  await fs.writeFile(svgPath, svg);
  console.log("Wrote %s", svgPath);

  // Consumed by the canvas map-renderer, which stamps this same path
  // instead of rendering the glyph from a webfont. Only `d` varies between
  // markers; the rest of the sizing (lib/glyph-marker.ts) is shared.
  await writeJsonFile(publishDir(job.jsonName), d);
}

handleMain(main());
