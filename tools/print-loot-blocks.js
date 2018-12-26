/* eslint-env node */

const path = require('path');
const flatMap = require('lodash/flatMap');
const parseXml = require('./lib/xml-parser');
const localInfo = require('../local.json');

const usage = `${path.basename(process.argv[1])} <item name regexp>`;

// TODO cache recursive call result

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

  const matchedBlocks = flatMap(blocks.blocks.block, (block) => {
    const lootIds = getLootIds(block, blockIndex);
    const lootList = flatMap(lootIds, i => lootIndex[i]);
    const items = matchItems(lootList, pattern);
    if (items.length > 0) {
      items.forEach(i => matchedItems.add(i));
      return block.$.name;
    }
    return [];
  });

  console.log('matched items: ', Array.from(matchedItems));
  console.log('matched loot containers: ', matchedBlocks);

  return 0;
}

function getLootIds(block, blockIndex, stack = []) {
  let lootIds = [];

  const classProp = block.property.find(p => p.$.name === 'Class');
  const lootListProp = block.property.find(p => p.$.name === 'LootList');
  if (classProp && classProp.$.value === 'Loot') {
    if (lootListProp) {
      lootIds.push(lootListProp.$.value);
    }
  }

  if (!lootListProp) {
    const parentBlock = getParentBlock(block, blockIndex);
    if (parentBlock && !stack.includes(parentBlock.$.name)) {
      lootIds = lootIds.concat(getLootIds(
        parentBlock,
        stack.concat(parentBlock.$.name),
      ));
    }
  }

  const downgradeBlockProp = block.property.find(p => p.$.name === 'DowngradeBlock');
  if (downgradeBlockProp
      && !stack.includes(downgradeBlockProp.$.value)
      && blockIndex[downgradeBlockProp.$.value]) {
    lootIds = lootIds.concat(getLootIds(
      blockIndex[downgradeBlockProp.$.value],
      stack.concat(downgradeBlockProp.$.value),
    ));
  }

  return lootIds;
}

function getParentBlock(block, blockIndex) {
  const extendsProp = block.property.find(p => p.$.name === 'Extends');
  if (!extendsProp) {
    return null;
  }

  const { param1 } = extendsProp.$;
  const extendsExcludes = param1 ? param1.split(',').map(s => s.trim()) : [];
  const isExcluded = extendsExcludes.includes('LootList');
  if (isExcluded) {
    return null;
  }

  return blockIndex[extendsProp.$.value];
}

function buildBlockIndex(blocks) {
  return blocks.blocks.block.reduce((obj, block) => {
    obj[block.$.name] = block;
    return obj;
  }, {});
}

function matchItems(items, pattern) {
  return flatMap(items, (item) => {
    if (item.group) {
      return matchItems(item.items, pattern);
    }
    if (pattern.test(item.name)) {
      return item.name;
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
