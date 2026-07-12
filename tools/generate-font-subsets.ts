import { expandGlob } from "@std/fs/expand-glob";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { extractSymbolChars } from "./lib/symbol-chars.ts";
import { handleMain, projectRoot, publishDir } from "./lib/utils.ts";
// deno-lint-ignore no-explicit-any
const fontTools = await import("@web-alchemy/fonttools") as any;

interface FontJob {
  target: readonly string[];
  exclude?: readonly string[];
  dist: string;
}

/**
 * Font subset jobs. Each entry scans its `target` files for symbol
 * and emoji characters and subsets only the glyphs its own font
 * actually contains. `pyftsubset` silently drops codepoints missing
 * from a font's cmap rather than erroring, so the same candidate
 * character set can be offered to multiple fonts without
 * cross-contamination.
 */
const JOBS: Readonly<Record<string, FontJob>> = {
  "NotoColorEmoji-COLRv1.ttf": {
    // WHY: exclude src/worker/. The ✘/🚩 map markers there stamp baked Path2D shapes (see tools/generate-glyph-markers.ts) in a solid marker color, so a layered color font would never apply to them.
    target: ["src/**/*.ts", "public/*.html", "tools/lib/prefab-html.ts"],
    exclude: [`${path.sep}worker${path.sep}`],
    dist: "NotoColorEmoji.subset.woff2",
  },
  "NotoSansSymbols2-Regular.ttf": {
    target: ["src/**/*.ts", "public/*.html", "tools/lib/prefab-html.ts"],
    exclude: [`${path.sep}worker${path.sep}`],
    dist: "NotoSansSymbols2.subset.woff2",
  },
};

async function main() {
  for (const [sourceFontFile, job] of Object.entries(JOBS)) {
    await runJob(sourceFontFile, job);
  }
  return 0;
}

async function runJob(sourceFontFile: string, job: FontJob) {
  const files = await collectFiles(job);
  const text = (await Promise.all(files.map((f) => fs.readFile(f, "utf-8"))))
    .join("\n");
  const chars = extractSymbolChars(text);
  if (chars.size === 0) {
    throw new Error(
      `No symbol characters found while scanning ${
        job.target.join(", ")
      } for ${sourceFontFile}; refusing to write an empty font`,
    );
  }
  const charText = [...chars].sort().join("");

  const sourceFont = await fs.readFile(
    projectRoot("tools", "fonts", sourceFontFile),
  );
  const [woff2, sfnt] = await Promise.all([
    fontTools.subset(sourceFont, { text: charText, flavor: "woff2" }),
    fontTools.subset(sourceFont, { text: charText }),
  ]);
  const glyphCount = countGlyphs(sfnt);
  if (glyphCount <= 1) {
    throw new Error(
      `${sourceFontFile} produced only ${glyphCount.toString()} glyph(s) ` +
        `(likely just .notdef) from ${chars.size.toString()} candidate ` +
        `character(s) found in ${job.target.join(", ")}; the font may not ` +
        `contain any of them`,
    );
  }

  const outputPath = publishDir(job.dist);
  await fs.writeFile(outputPath, woff2);
  console.log(
    "Wrote %s (%d candidate chars scanned, %d glyphs kept, %d bytes)",
    outputPath,
    chars.size,
    glyphCount - 1,
    woff2.length,
  );
}

async function collectFiles(job: FontJob): Promise<string[]> {
  const files = new Set<string>();
  for (const pattern of job.target) {
    for await (const entry of expandGlob(projectRoot(pattern))) {
      if (!entry.isFile) continue;
      if (job.exclude?.some((s) => entry.path.includes(s))) continue;
      files.add(entry.path);
    }
  }
  return [...files];
}

/**
 * Reads `maxp.numGlyphs` from a raw (non-woff2) sfnt buffer as a
 * sanity check that the subset job kept more than just the mandatory
 * `.notdef` glyph.
 */
function countGlyphs(sfnt: Uint8Array): number {
  const view = new DataView(sfnt.buffer, sfnt.byteOffset, sfnt.byteLength);
  const numTables = view.getUint16(4);
  for (let i = 0; i < numTables; i++) {
    const recordOffset = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(recordOffset),
      view.getUint8(recordOffset + 1),
      view.getUint8(recordOffset + 2),
      view.getUint8(recordOffset + 3),
    );
    if (tag === "maxp") {
      const tableOffset = view.getUint32(recordOffset + 8);
      return view.getUint16(tableOffset + 4);
    }
  }
  throw new Error("maxp table not found in generated font");
}

handleMain(main());
