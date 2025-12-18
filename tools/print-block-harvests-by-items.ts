import process from "node:process";
import { loadBlocks } from "./lib/blocks-xml.ts";
import { loadMaterials } from "./lib/materials-xml.ts";
import { handleMain, program, vanillaDir } from "./lib/utils.ts";

const USAGE = `Usage: ${program()} <item name regexp>`;

async function main() {
  const itemPatternString = process.argv[2];
  if (itemPatternString === undefined) {
    console.error(USAGE);
    return 1;
  }

  const blocks = await loadBlocks(await vanillaDir("Data", "Config", "blocks.xml"));
  const materials = await loadMaterials(await vanillaDir("Data", "Config", "materials.xml"));
  const itemPattern = new RegExp(itemPatternString);
  const matchingBlocks = blocks.find((b) => Object.keys(blocks.getHarvests(b)).some((drop) => itemPattern.test(drop)));

  const harvests: {
    blockName: string;
    itemName: string;
    count: [number, number];
    prob: number;
    countExpected: number;
    damage: number;
    countPerDamage: number;
  }[] = [];
  for (const block of matchingBlocks) {
    const drops = Object.values(blocks.getHarvests(block)).filter((drop) => itemPattern.test(drop.name));
    const damage = blocks.getMaxDamage(block, materials);
    if (damage === null) throw new Error(`No damage for ${block.name}`);
    for (const drop of drops) {
      harvests.push({
        blockName: block.name,
        itemName: drop.name,
        count: drop.count,
        prob: drop.prob,
        countExpected: ((drop.count[0] + drop.count[1]) / 2) * drop.prob,
        damage: damage,
        countPerDamage: (drop.count[0] + drop.count[1]) / 2 / damage,
      });
    }
  }
  // Sort by countPerDamage descending
  harvests.sort((a, b) => b.countPerDamage - a.countPerDamage);
  for (const h of harvests) {
    console.log(
      h.countPerDamage.toPrecision(3).padStart(10),
      h.blockName,
      "\t",
      h.itemName,
      `count=${h.count[0].toString()}-${h.count[1].toString()}`,
      `prob=${h.prob.toString()}`,
      `countExpected=${h.countExpected.toPrecision(3)}`,
      `damage=${h.damage.toString()}`,
    );
  }
  return 0;
}

handleMain(main());
