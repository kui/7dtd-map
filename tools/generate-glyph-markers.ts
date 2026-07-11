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
  /** Hand-tuned placement of `glyph` within the shared `VIEWPORT` square. */
  x: number;
  y: number;
  /**
   * Point in the `VIEWPORT` square that render time should align with
   * the target coordinate (e.g. the flag's pole base, not its bbox
   * centre).
   */
  anchor: { x: number; y: number };
}

/**
 * Marker jobs baked at build time. Each job writes
 * `public/{name}.svg` and `public/{name}-path.json` for canvas/SVG
 * use without runtime font loading.
 */
const MARKERS: Readonly<Record<string, MarkerJob>> = {
  "heavy-ballot-x": {
    // WHY: U+2718 HEAVY BALLOT X drives the Prefab Sign / Toggle Sign marker.
    fontFile: "NotoSansSymbols2-Regular.ttf",
    glyph: "✘",
    x: 52,
    y: 180,
    anchor: { x: 125.8, y: 117 },
  },
  "triangular-flag": {
    // WHY: NotoEmojiOld draws a filled U+1F6A9 flag. The current release's 🚩 is hollow and hard to see against map terrain.
    fontFile: "NotoEmojiOld-Regular.ttf",
    glyph: "🚩",
    x: -18,
    y: 207,
    anchor: { x: 54, y: 234 },
  },
};

async function main() {
  for (const [name, job] of Object.entries(MARKERS)) {
    await generateMarker(name, job);
  }
  return 0;
}

async function generateMarker(name: string, job: MarkerJob) {
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
  const svgPath = publishDir(`${name}.svg`);
  await fs.writeFile(svgPath, svg);
  console.log("Wrote %s", svgPath);

  await writeJsonFile(publishDir(`${name}-path.json`), {
    d,
    anchor: job.anchor,
  });
}

handleMain(main());
