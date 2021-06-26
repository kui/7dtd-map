import { promises as fs } from "fs";
import * as path from "path";
import { parseXml } from "./lib/xml-parser";

const usage = `${path.basename(process.argv[1])} <item name regexp>`;

// TODO cache recursive call result

const excludeBlocks = new Set([
  // test blocks
  "cntLootWeapons",
  "cntLootWeaponsInsecure",
  "cntQuestTestLoot",

  // quest blocks
  "cntQuestLootBox",
  "treasureChest",
]);

const projectRoot = path.join(path.dirname(process.argv[1]), "..");
const localInfo = fs.readFile(path.join(projectRoot, "local.json")).then((p) => JSON.parse(p.toString()));

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }

  const pattern = new RegExp(process.argv[2]);

  const { vanillaDir } = await localInfo;

  const blocks = await parseXml<BlockXml>(path.join(vanillaDir, "Data", "Config", "blocks.xml"));
  const loot = await parseXml<LootXml>(path.join(vanillaDir, "Data", "Config", "loot.xml"));

  const lootIndex = buildLootIndex(loot);
  const blockIndex = buildBlockIndex(blocks);

  const matchedItems = new Set();

  const results = blocks.blocks.block
    .map((block) => {
      if (excludeBlocks.has(block.$.name)) {
        return [];
      }
      const lootResults = matchLootItems(pattern, block, blockIndex, lootIndex);
      lootResults.forEach((r) => matchedItems.add(r.item));
      return lootResults;
    })
    .filter((r) => r.length > 0);

  console.log(
    JSON.stringify(
      results.flatMap((r) => r),
      null,
      2
    )
  );
  return 0;
}

function traverseDowngradeBlock(pattern: RegExp, block: BlockXmlBlock, blockIndex: BlockIndex, lootIndex: LootIndex, stack: string[] = []) {
  const downgradeBlockProp = block.property.find((p) => p.$.name === "DowngradeBlock");
  if (!downgradeBlockProp) {
    return [];
  }

  const name = downgradeBlockProp.$.value;
  if (stack.includes(downgradeBlockProp.$.value)) {
    return [];
  }

  return matchLootItems(pattern, blockIndex[name], blockIndex, lootIndex, stack.concat(name));
}

function matchLootItems(
  pattern: RegExp,
  block: BlockXmlBlock,
  blockIndex: BlockIndex,
  lootIndex: LootIndex,
  downgradeStack: string[] = []
): ItemMatchResult[] {
  const clazz = getProp(block, "Class", blockIndex) ?? "";
  if (!/(CarExplode|Secure)?Loot/.test(clazz)) return [];
  const lootId = getProp(block, "LootList", blockIndex);
  if (!lootId) return [];
  const lootList = lootIndex[lootId];
  const result = matchItems(lootList, pattern, [`LootID: ${lootId}`]).map((r) => {
    r.block = block.$.name;
    if (downgradeStack.length === 0) {
      return r;
    }
    r.downgrade = downgradeStack.join(" -> ");
    return r;
  });
  const downgradeBlockResult = traverseDowngradeBlock(pattern, block, blockIndex, lootIndex, downgradeStack);
  return result.concat(downgradeBlockResult);
}

function getProp(block: BlockXmlBlock, propName: string, blockIndex: BlockIndex): string | null {
  const prop = block.property.find((p) => p.$.name === propName);
  if (prop) {
    return prop.$.value;
  }

  const extendsProp = block.property.find((p) => p.$.name === "Extends");
  if (!extendsProp) {
    return null;
  }

  const { param1 } = extendsProp.$;
  const extendsExcludes = param1 ? param1.split(",").map((s) => s.trim()) : [];
  const isExcluded = extendsExcludes.includes(propName);
  if (isExcluded) {
    return null;
  }

  return getProp(blockIndex[extendsProp.$.value], propName, blockIndex);
}

interface BlockIndex {
  [name: string]: BlockXmlBlock;
}

function buildBlockIndex(blocks: BlockXml) {
  return blocks.blocks.block.reduce<BlockIndex>((obj, block) => {
    obj[block.$.name] = block;
    return obj;
  }, {});
}

interface ItemMatchResult {
  item: string;
  lootList: string;
  block?: string;
  downgrade?: string;
}

function matchItems(items: (LootItem | LootItemGroup)[], pattern: RegExp, stack: string[]): ItemMatchResult[] {
  return items.flatMap((item) => {
    if ("group" in item) {
      return matchItems(item.items, pattern, stack.concat(`LootGroup: ${item.group}`));
    }
    if (pattern.test(item.name)) {
      return { item: item.name, lootList: stack.join(" -> ") };
    }
    return [];
  });
}

interface LootGroups {
  [groupName: string]: LootXmlItem[];
}

interface LootIndex {
  [lootContainerId: string]: (LootItem | LootItemGroup)[];
}

function buildLootIndex(loot: LootXml) {
  const lootGroups = loot.lootcontainers.lootgroup.reduce<LootGroups>((idx, group) => {
    idx[group.$.name] = group.item || [];
    return idx;
  }, {});
  return loot.lootcontainers.lootcontainer.reduce<LootIndex>((idx, lc) => {
    idx[lc.$.id] = (lc.item || []).map((i) => expandLootGroup(lootGroups, i));
    return idx;
  }, {});
}

interface LootItem {
  name: string;
}

interface LootItemGroup {
  group: LootGroupName;
  items: (LootItem | LootItemGroup)[];
}

function expandLootGroup(groups: LootGroups, item: LootXmlItem): LootItem | LootItemGroup {
  if ("group" in item.$) {
    const g = groups[item.$.group];
    return {
      group: item.$.group,
      items: (g ?? []).map((i) => expandLootGroup(groups, i)),
    };
  }
  return { name: item.$.name };
}

main()
  .catch((e) => {
    console.error(e);
    return 1;
  })
  .then((exitCode) => {
    process.on("exit", () => process.exit(exitCode));
  });
