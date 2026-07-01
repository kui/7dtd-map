import { expandGlob } from "@std/fs/expand-glob";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { parse as parseEmoji } from "@twemoji/parser";
// deno-lint-ignore no-explicit-any
const fontTools = await import("@web-alchemy/fonttools") as any;
import { handleMain, projectRoot, publishDir } from "./lib/utils.ts";

const SOURCE_FONT = projectRoot("tools", "fonts", "NotoColorEmoji-COLRv1.ttf");
const OUTPUT_FONT = publishDir("emoji-color.subset.woff2");

// Only DOM-facing source is scanned. The ✘/🚩 map markers under src/worker/
// are drawn with ctx.fillText onto a canvas using their own dedicated
// monochrome font subsets (see tools/fonts/subset.bash) chosen for a
// specific solid marker color, so this DOM color-emoji font would never
// apply to them anyway.
const SCAN_GLOBS = [
  "src/**/*.ts",
  "public/*.html",
  "tools/lib/prefab-html.ts",
];
const EXCLUDED_DIR = `${path.sep}worker${path.sep}`;

async function main() {
  const files = await collectFiles();
  const text = (await Promise.all(files.map((f) => fs.readFile(f, "utf-8"))))
    .join("\n");
  const emojiText = extractEmojiText(text);

  const sourceFont = await fs.readFile(SOURCE_FONT);
  const output = await fontTools.subset(sourceFont, {
    text: emojiText,
    flavor: "woff2",
  });
  await fs.writeFile(OUTPUT_FONT, output);
  console.log(
    "Wrote %s (%d emoji, %d bytes)",
    OUTPUT_FONT,
    [...emojiText].length,
    output.length,
  );
  return 0;
}

async function collectFiles(): Promise<string[]> {
  const files: string[] = [];
  for (const pattern of SCAN_GLOBS) {
    for await (const entry of expandGlob(projectRoot(pattern))) {
      if (entry.isFile && !entry.path.includes(EXCLUDED_DIR)) {
        files.push(entry.path);
      }
    }
  }
  return files;
}

function extractEmojiText(text: string): string {
  const found = new Set<string>();
  for (const entity of parseEmoji(text)) {
    found.add(entity.text);
  }
  if (found.size === 0) {
    throw new Error(
      "No emoji found while scanning the configured source files; " +
        "refusing to write an empty font",
    );
  }
  return [...found].sort().join("");
}

handleMain(main());
