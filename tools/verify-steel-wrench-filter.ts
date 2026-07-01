import { handleMain } from "./lib/utils.ts";
import { loadBlocks } from "./lib/xmls/blocks-xml.ts";
import { loadMaterials } from "./lib/xmls/materials-xml.ts";

async function main() {
  // Collect blocks that pass the programmatic filter
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
    // Avoid high durability blocks harder than gunSafeScore
    if (harvest.countPerDamage <= gunSafeScore) continue;
    // Avoid working vending machines
    if (/^cntVending.*(?<!Broken)$/.test(harvest.blockName)) continue;
    // Avoid blocks that require the PercMasterySteelHarvest perk
    if (harvest.tags.includes("PercMasterySteelHarvest")) continue;
    // Avoid infestation loot boxes that are not always placed.
    if (/^cntQuestInfestedT/.test(harvest.blockName)) continue;
    filtered.add(harvest.blockName);
  }

  // Parse the regexp from index.html
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

  // Compare
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
