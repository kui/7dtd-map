import { handleMain } from "./lib/utils.ts";
import { loadBlocks } from "./lib/xmls/blocks-xml.ts";
import { loadMaterials } from "./lib/xmls/materials-xml.ts";

async function main() {
  const blocks = await loadBlocks();
  const materials = await loadMaterials();
  const harvests = blocks.getHarvestsWithMaxDamage(materials).filter((drop) =>
    /^resourceForgedSteel/.test(drop.itemName)
  );
  const gunSafeScore =
    harvests.find((h) => /^cntGunSafe/.test(h.blockName))?.countPerDamage ?? 0;
  if (gunSafeScore === 0) throw new Error("gunSafeScore is 0");
  const filtered = new Set<string>();
  for (const harvest of harvests) {
    // WHY: skip blocks harder than gunSafeScore so the effective steel yield is not overstated.
    if (harvest.countPerDamage <= gunSafeScore) continue;
    // WHY: skip working vending machines because their broken variants alone drop steel.
    if (/^cntVending.*(?<!Broken)$/.test(harvest.blockName)) continue;
    // WHY: skip blocks that require the PercMasterySteelHarvest perk since the filter targets the wrench path.
    if (harvest.tags.includes("PercMasterySteelHarvest")) continue;
    // WHY: skip infestation loot boxes because they are not always placed on the map.
    if (/^cntQuestInfestedT/.test(harvest.blockName)) continue;
    filtered.add(harvest.blockName);
  }

  const indexHtml = await Deno.readTextFile(
    new URL("../public/index.html", import.meta.url),
  );
  const m = indexHtml.match(
    /data-input-block-filter="([^"]+)"[^>]*>\s*\n?\s*Steel with Wrench/,
  );
  if (!m || m[1] === undefined) {
    throw new Error("Could not find Steel with Wrench filter in index.html");
  }
  const regexp = new RegExp(m[1]);

  const regexMatched = new Set(
    blocks.all().map((b) => b.name).filter((name) => regexp.test(name)),
  );

  const missing: string[] = [];
  const extra: string[] = [];
  for (const name of filtered) {
    if (!regexMatched.has(name)) missing.push(name);
  }
  for (const name of regexMatched) {
    if (!filtered.has(name)) extra.push(name);
  }

  if (missing.length === 0 && extra.length === 0) {
    console.log("OK: The regexp is necessary and sufficient.");
    for (const name of filtered) {
      console.log(`  ${name}`);
    }
    return 0;
  }

  if (missing.length > 0) {
    console.error("Missing from regexp (should be added):");
    for (const name of missing.sort()) {
      console.error(`  ${name}`);
    }
  }
  if (extra.length > 0) {
    console.error("Extra in regexp (should be removed):");
    for (const name of extra.sort()) {
      console.error(`  ${name}`);
    }
  }
  return 1;
}

handleMain(main());
