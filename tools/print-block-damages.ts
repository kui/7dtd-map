import process from "node:process";
import { loadBlocks } from "./lib/xmls/blocks-xml.ts";
import { loadMaterials } from "./lib/xmls/materials-xml.ts";
import { handleMain, program, vanillaDir } from "./lib/utils.ts";

const USAGE = `Usage: ${program()} <block name regexp>`;

async function main() {
  const patternString = process.argv[2];
  if (patternString === undefined) {
    console.error(USAGE);
    return 1;
  }

  const blocks = await loadBlocks();
  const materials = await loadMaterials(
    vanillaDir("Data", "Config", "materials.xml"),
  );
  const pattern = new RegExp(patternString);
  for (const block of blocks.find((b) => pattern.test(b.name))) {
    const damage = blocks.getMaxDamage(block, materials);
    console.log(block.name, ":", damage);
  }
  return 0;
}

handleMain(main());
