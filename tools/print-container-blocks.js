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

  blocks.blocks.block.forEach((block) => {
    const lootListProp = block.property.find(p => p.$.name === 'LootList');
    if (!lootListProp) {
      return;
    }

    const lootList = lootIndex[lootListProp.$.value];
    if (!lootList) {
      return;
    }
    if (lootList.some(i => findItem(i, pattern))) {
      console.log(block.$.name);
      // console.log(JSON.stringify(lootList, 0, 2));
    }
  });

  return 0;
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
