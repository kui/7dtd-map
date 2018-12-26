/* eslint-env node */

const path = require('path');
const flatMap = require('lodash/flatMap');
const parseXml = require('./lib/xml-parser');
const localInfo = require('../local.json');

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

  const results = blocks.blocks.block.map((block) => {
    if (excludeBlocks.has(block.$.name)) {
      return [];
    }
    const lootResults = matchLootItems(pattern, block, blockIndex, lootIndex);
    lootResults.forEach(r => matchedItems.add(r.item));
    return lootResults;
  }).filter(r => r.length > 0);

  console.log('matched items: ', Array.from(matchedItems));
  console.log('matched results: ', results);

  return 0;
}

function traverseDowngradeBlock(pattern, block, blockIndex, lootIndex, stack = []) {
  const downgradeBlockProp = block.property.find(p => p.$.name === 'DowngradeBlock');
  if (!downgradeBlockProp) {
    return [];
  }

  const name = downgradeBlockProp.$.value;
  if (stack.includes(downgradeBlockProp.$.value)) {
    return [];
  }

  return matchLootItems(pattern, blockIndex[name], blockIndex, lootIndex, stack.concat(name));
}

function matchLootItems(pattern, block, blockIndex, lootIndex, downgradeStack = []) {
  const clazz = getProp(block, 'Class', blockIndex);
  if (!(/(CarExplode)?Loot/).test(clazz)) {
    return [];
  }
  const lootId = getProp(block, 'LootList', blockIndex);
  const lootList = lootIndex[lootId];
  const result = matchItems(lootList, pattern, [`LootID: ${lootId}`]).map((r) => {
    r.block = block.$.name;
    if (downgradeStack.length === 0) {
      return r;
    }
    r.downgrade = downgradeStack.join(' -> ');
    return r;
  });
  const downgradeBlockResult = traverseDowngradeBlock(
    pattern, block, blockIndex, lootIndex, downgradeStack,
  );
  return result.concat(downgradeBlockResult);
}

function getProp(block, propName, blockIndex) {
  const prop = block.property.find(p => p.$.name === propName);
  if (prop) {
    return prop.$.value;
  }

  const extendsProp = block.property.find(p => p.$.name === 'Extends');
  if (!extendsProp) {
    return null;
  }

  const { param1 } = extendsProp.$;
  const extendsExcludes = param1 ? param1.split(',').map(s => s.trim()) : [];
  const isExcluded = extendsExcludes.includes(propName);
  if (isExcluded) {
    return null;
  }

  return getProp(blockIndex[extendsProp.$.value], propName, blockIndex);
}

function buildBlockIndex(blocks) {
  return blocks.blocks.block.reduce((obj, block) => {
    obj[block.$.name] = block;
    return obj;
  }, {});
}

function matchItems(items, pattern, stack) {
  return flatMap(items, (item) => {
    if (item.group) {
      return matchItems(item.items, pattern, stack.concat(`LootGroup: ${item.group}`));
    }
    if (pattern.test(item.name)) {
      return { item: item.name, lootList: stack.join(' -> ') };
    }
    return [];
  });
}

function buildLootIndex(loot) {
  const lootGroups = loot.lootcontainers.lootgroup.reduce((idx, group) => {
    idx[group.$.name] = group.item || [];
    return idx;
  }, {});
  return loot.lootcontainers.lootcontainer.reduce((idx, lc) => {
    idx[lc.$.id] = (lc.item || []).map(i => expandLootGroup(lootGroups, i));
    return idx;
  }, {});
}

function expandLootGroup(groups, item) {
  if (item.$.group) {
    const g = groups[item.$.group];
    return Object.assign(
      {},
      item.$,
      { items: (g || []).map(i => expandLootGroup(groups, i)) },
    );
  }
  return item.$;
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
