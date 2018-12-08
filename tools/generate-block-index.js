/* eslint-env node */

const path = require('path');
const fsPromise = require('fs').promises;
const glob = require('glob-promise');
const parseNim = require('./lib/nim_parser');
const localInfo = require('../local.json');

const blockPrefabIndex = 'js/lib/block-prefab-index.json';
const prefabBlockIndex = 'js/lib/prefab-block-index.json';

async function main() {
  const { vanillaDir } = localInfo;
  const fileGlob = path.join(vanillaDir, 'Data', 'Prefabs', '*.blocks.nim');
  const nimFiles = await glob(fileGlob);
  if (nimFiles.length === 0) {
    throw Error(`No nim file: ${fileGlob}`);
  }
  const prefabs = await Promise.all(nimFiles.map(readNim));
  console.log('Load %d prefabs', prefabs.length);
  const waitTasks = [];
  waitTasks.push(fsPromise
    .writeFile(prefabBlockIndex, JSON.stringify(prefabs))
    .then(() => console.log('Write %s', prefabBlockIndex)));
  const blocks = invertIndex(prefabs);
  console.log('Load %d blocks', blocks.length);
  waitTasks.push(fsPromise
    .writeFile(blockPrefabIndex, JSON.stringify(blocks))
    .then(() => console.log('Write %s', blockPrefabIndex)));
  await Promise.all(waitTasks);
  return 0;
}

async function readNim(nimFileName) {
  const blocks = await parseNim(nimFileName);
  return {
    name: path.basename(nimFileName, '.blocks.nim'),
    blocks,
  };
}

function invertIndex(prefabs) {
  const blockIndex = prefabs
    .reduce((arr, prefab) => {
      const flatten = prefab.blocks.map(block => ({ prefab: prefab.name, block }));
      return arr.concat(flatten);
    }, [])
    .reduce((obj, { prefab, block }) => Object.assign(obj, {
      [block]: (obj[block] || []).concat(prefab),
    }), {});
  return Object
    .keys(blockIndex)
    .map(block => ({
      name: block,
      prefabs: blockIndex[block],
    }));
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
