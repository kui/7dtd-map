/* eslint-env node */

const path = require('path');
const parseXml = require('./lib/xml-parser');
const localInfo = require('../local.json');

const usage = `${path.basename(process.argv[1])} <item name regexp>`;

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

  blocks.blocks.block.forEach((block) => {
    const lootId = getLootId(block, blockIndex);
    if (!lootId) {
      return;
    }

    const lootList = lootIndex[lootId];
    if (!lootList) {
      return;
    }
    if (lootList.some(i => findItem(i, pattern))) {
      console.log(block.$.name);
    }
  });

  return 0;
}

function getLootId(block, blockIndex, stack = []) {
  const lootListProp = block.property.find(p => p.$.name === 'LootList');
  if (lootListProp) {
    return lootListProp.$.value;
  }

  const downgradeBlockProp = block.property.find(p => p.$.name === 'DowngradeBlock');
  if (downgradeBlockProp
      && !stack.includes(downgradeBlockProp.$.value)
      && blockIndex[downgradeBlockProp.$.value]) {
    return getLootId(
      blockIndex[downgradeBlockProp.$.value],
      stack.concat(downgradeBlockProp.$.value),
    );
  }

  const extendsProp = block.property.find(p => p.$.name === 'Extends');
  if (extendsProp
      && !stack.includes(extendsProp.$.value)
      && blockIndex[extendsProp.$.value]) {
    return getLootId(
      blockIndex[extendsProp.$.value],
      stack.concat(extendsProp.$.value),
    );
  }

  return null;
}

function buildBlockIndex(blocks) {
  return blocks.blocks.block.reduce((obj, block) => {
    obj[block.$.name] = block;
    return obj;
  }, {});
}

function findItem(item, pattern) {
  if (item.group) {
    return item.groupItems.some(i => findItem(i, pattern));
  }
  return pattern.test(item.name);
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
      { groupItems: (g || []).map(i => expandLootGroup(groups, i)) },
    );
  }
  return item.$;
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
