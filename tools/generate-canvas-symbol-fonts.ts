import * as fs from "node:fs/promises";
// deno-lint-ignore no-explicit-any
const fontTools = await import("@web-alchemy/fonttools") as any;
import { handleMain, projectRoot, publishDir } from "./lib/utils.ts";

// The symbols drawn on the map canvas (src/worker/map-renderer.ts) and the
// `.logo` DOM class (public/index.html, src/logo.ts) are deliberately
// monochrome so their fill color stays legible against map terrain, unlike
// the DOM color-emoji subset in tools/generate-emoji-font.ts. There is no
// scanner for these: add an entry by hand when a new marker glyph is needed.
const JOBS: readonly {
  sourceFont: string;
  text: string;
  outputFont: string;
}[] = [
  {
    // ✘ sign/flag marker (canvas) and Prefab Sign / Toggle Sign label (DOM).
    sourceFont: "NotoSansSymbols2-Regular.ttf",
    text: "✘",
    outputFont: "NotoSansSymbols2.subset.woff2",
  },
  {
    // 🚩 flag marker (canvas only). This "old" Noto Emoji release draws a
    // filled flag; the current release's 🚩 is hollow and hard to see
    // against map terrain.
    sourceFont: "NotoEmojiOld-Regular.ttf",
    text: "🚩",
    outputFont: "NotoEmojiOld.subset.woff2",
  },
];

async function main() {
  for (const job of JOBS) {
    const sourceFont = await fs.readFile(
      projectRoot("tools", "fonts", job.sourceFont),
    );
    const output = await fontTools.subset(sourceFont, {
      text: job.text,
      flavor: "woff2",
    });
    const outputPath = publishDir(job.outputFont);
    await fs.writeFile(outputPath, output);
    console.log("Wrote %s (%d bytes)", outputPath, output.length);
  }
  return 0;
}

handleMain(main());
