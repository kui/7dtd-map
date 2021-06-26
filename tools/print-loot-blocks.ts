import { promises as fs } from "fs";
import * as path from "path";
import { loadBlocks } from "./lib/blocks-xml";
import { Loot, LootTable } from "./lib/loot";

const CMD = `npx ts-node ${path.basename(process.argv[1])}`;
const USAGE = `Usage: ${CMD} <item name regexp>

Search acid can:
    ${CMD} resourceAcid

Search shotguns: 
    ${CMD} '(?!.*Schematic$)^gunShotgun'`;

const projectRoot = path.join(path.dirname(process.argv[1]), "..");
const localInfo = fs.readFile(path.join(projectRoot, "local.json")).then((p) => JSON.parse(p.toString()));

async function main() {
  if (process.argv.length <= 2) {
    console.error(USAGE);
    return 1;
  }

  const pattern = new RegExp(process.argv[2]);
  const { vanillaDir } = await localInfo;
  const lootXml = new Loot(path.join(vanillaDir, "Data", "Config", "loot.xml"));
  const lootContainers = await lootXml.findLootContainer(pattern);
  const items = flattenItems(lootContainers);

  console.log("Container IDs");
  console.log(lootContainers.map((c) => c.id).join(", "));

  console.log();
  console.log("Items");
  for (const i of items) console.log(i);

  const blocks = await loadBlocks(path.join(vanillaDir, "Data", "Config", "blocks.xml"));
  const matchedBlocks = blocks.findByLootIds(new Set(lootContainers.map((c) => c.id)));
  console.log();
  console.log("Blocks");
  for (const b of matchedBlocks) console.log(b.name);

  return 0;
}

function flattenItems(lootContainers: LootTable[]): Set<string> {
  return new Set(lootContainers.flatMap((c) => c.items.concat(Array.from(flattenItems(c.groups)))));
}

main()
  .catch((e) => {
    console.error(e);
    return 1;
  })
  .then((exitCode) => {
    process.on("exit", () => process.exit(exitCode));
  });
