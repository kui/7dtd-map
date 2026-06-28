import process from "node:process";
import { loadBlocks } from "./lib/xmls/blocks-xml.ts";
import { loadMaterials } from "./lib/xmls/materials-xml.ts";
import { handleMain, program } from "./lib/utils.ts";

const USAGE = `Usage: ${program()} <item name regexp>`;

async function main() {
  const itemPatternString = process.argv[2];
  if (itemPatternString === undefined) {
    console.error(USAGE);
    return 1;
  }

  const blocks = await loadBlocks();
  const materials = await loadMaterials();
  const itemPattern = new RegExp(itemPatternString);  
  const harvests = blocks.getHarvestsWithMaxDamage(materials).filter((drop) =>
    itemPattern.test(drop.itemName)
  );
  for (const h of harvests) console.log(JSON.stringify(h));
  return 0;
}

handleMain(main());
