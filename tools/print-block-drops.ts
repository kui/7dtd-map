import process from "node:process";
import { loadBlocks } from "./lib/blocks-xml.ts";
import { handleMain, program, vanillaDir } from "./lib/utils.ts";

const USAGE = `Usage: ${program()} <block name regexp>`;

async function main() {
  const patternString = process.argv[2];
  if (patternString === undefined) {
    console.error(USAGE);
    return 1;
  }

  const blocks = await loadBlocks(await vanillaDir("Data", "Config", "blocks.xml"));
  const pattern = new RegExp(patternString);
  for (const block of blocks.find((b) => pattern.test(b.name))) {
    console.log(block.name, ":", blocks.getDropsExtended(block));
  }
  return 0;
}

handleMain(main());
