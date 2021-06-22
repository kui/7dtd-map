/* eslint-env node */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parseXml'.
const parseXml = require('./lib/xml-parser');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'localInfo'... Remove this comment to see the full error message
const localInfo = require('../local.json');

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'usage'.
const usage = `${path.basename(process.argv[1])} <item name regexp>`;

// TODO cache recursive call result

const excludeBlocks = new Set([
  // test blocks
  'cntLootWeapons', 'cntLootWeaponsInsecure',
  'cntQuestTestLoot',

  // quest blocks
  'cntQuestLootBox', 'treasureChest',
]);

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }

  const pattern = new RegExp(process.argv[2]);

  const { vanillaDir } = localInfo;

  const blocks = await parseXml(path.join(vanillaDir, 'Data', 'Config', 'blocks.xml'));
  const loot = await parseXml(path.join(vanillaDir, 'Data', 'Config', 'loot.xml'));

  const lootIndex = buildLootIndex(loot);
  const blockIndex = buildBlockIndex(blocks);

  const matchedItems = new Set();

  const results = blocks.blocks.block.map((block: any) => {
    if (excludeBlocks.has(block.$.name)) {
      return [];
    }
    const lootResults = matchLootItems(pattern, block, blockIndex, lootIndex);
    lootResults.forEach((r: any) => matchedItems.add(r.item));
    return lootResults;
  }).filter((r: any) => r.length > 0);

  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
  console.log(JSON.stringify(results.flatMap((r: any) => r), 0, 2));
  return 0;
}

// @ts-expect-error ts-migrate(7023) FIXME: 'traverseDowngradeBlock' implicitly has return typ... Remove this comment to see the full error message
function traverseDowngradeBlock(pattern: any, block: any, blockIndex: any, lootIndex: any, stack = []) {
  const downgradeBlockProp = block.property.find((p: any) => p.$.name === 'DowngradeBlock');
  if (!downgradeBlockProp) {
    return [];
  }

  const name = downgradeBlockProp.$.value;
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
  if (stack.includes(downgradeBlockProp.$.value)) {
    return [];
  }

  return matchLootItems(pattern, blockIndex[name], blockIndex, lootIndex, stack.concat(name));
}

// @ts-expect-error ts-migrate(7023) FIXME: 'matchLootItems' implicitly has return type 'any' ... Remove this comment to see the full error message
function matchLootItems(pattern: any, block: any, blockIndex: any, lootIndex: any, downgradeStack = []) {
  const clazz = getProp(block, 'Class', blockIndex);
  if (!(((/(CarExplode)?Loot/))).test(clazz)) {
    return [];
  }
  const lootId = getProp(block, 'LootList', blockIndex);
  const lootList = lootIndex[lootId];
  const result = matchItems(lootList, pattern, [`LootID: ${lootId}`]).map((r: any) => {
    r.block = block.$.name;
    if (downgradeStack.length === 0) {
      return r;
    }
    r.downgrade = downgradeStack.join(' -> ');
    return r;
  });
  // @ts-expect-error ts-migrate(7022) FIXME: 'downgradeBlockResult' implicitly has type 'any' b... Remove this comment to see the full error message
  const downgradeBlockResult = traverseDowngradeBlock(
    pattern, block, blockIndex, lootIndex, downgradeStack,
  );
  return result.concat(downgradeBlockResult);
}

// @ts-expect-error ts-migrate(7023) FIXME: 'getProp' implicitly has return type 'any' because... Remove this comment to see the full error message
function getProp(block: any, propName: any, blockIndex: any) {
  const prop = block.property.find((p: any) => p.$.name === propName);
  if (prop) {
    return prop.$.value;
  }

  const extendsProp = block.property.find((p: any) => p.$.name === 'Extends');
  if (!extendsProp) {
    return null;
  }

  const { param1 } = extendsProp.$;
  const extendsExcludes = param1 ? param1.split(',').map((s: any) => s.trim()) : [];
  const isExcluded = extendsExcludes.includes(propName);
  if (isExcluded) {
    return null;
  }

  return getProp(blockIndex[extendsProp.$.value], propName, blockIndex);
}

function buildBlockIndex(blocks: any) {
  return blocks.blocks.block.reduce((obj: any, block: any) => {
    obj[block.$.name] = block;
    return obj;
  }, {});
}

function matchItems(items: any, pattern: any, stack: any) {
  return items.flatMap((item: any) => {
    if (item.group) {
      return matchItems(item.items, pattern, stack.concat(`LootGroup: ${item.group}`));
    }
    if (pattern.test(item.name)) {
      return { item: item.name, lootList: stack.join(' -> ') };
    }
    return [];
  });
}

function buildLootIndex(loot: any) {
  const lootGroups = loot.lootcontainers.lootgroup.reduce((idx: any, group: any) => {
    idx[group.$.name] = group.item || [];
    return idx;
  }, {});
  return loot.lootcontainers.lootcontainer.reduce((idx: any, lc: any) => {
    idx[lc.$.id] = (lc.item || []).map((i: any) => expandLootGroup(lootGroups, i));
    return idx;
  }, {});
}

function expandLootGroup(groups: any, item: any) {
  if (item.$.group) {
    const g = groups[item.$.group];
    return {

      ...item.$,
      items: (g || []).map((i: any) => expandLootGroup(groups, i)),
    };
  }
  return item.$;
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
