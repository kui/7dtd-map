import { handleMain } from "./lib/utils.ts";
import { loadBlocks } from "./lib/xmls/blocks-xml.ts";
import { loadMaterials } from "./lib/xmls/materials-xml.ts";

async function main() {
  const blocks = await loadBlocks();
  const materials = await loadMaterials();
  const harvests = blocks.getHarvestsWithMaxDamage(materials).filter((drop) =>
    /^resourceForgedSteel/.test(drop.itemName)
  );
  const gunSafeScore = harvests.find(h => /^cntGunSafe/.test(h.blockName))?.countPerDamage ?? 0;
  if (gunSafeScore === 0) throw new Error("gunSafeScore is 0");
  for (const harvest of harvests) {
    // Avoid high durability blocks harder than gunSafeScore
    if (harvest.countPerDamage <= gunSafeScore) continue;
    // Avoid working vending machines
    if (/^cntVending.*(?<!Broken)$/.test(harvest.blockName)) continue;
    // Avoid blocks that require the PercMasterySteelHarvest perk
    if (harvest.tags.includes("PercMasterySteelHarvest")) continue;
    console.log(harvest.blockName);
  }
  return 0;
}

handleMain(main());
