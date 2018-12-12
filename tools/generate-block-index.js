/* eslint-env node */

const path = require('path');
const fsPromise = require('fs').promises;
const glob = require('glob-promise');

const parseNim = require('./lib/nim-parser');
const parseLabel = require('./lib/parse-label');
const localInfo = require('../local.json');

const projectRoot = path.join(path.dirname(process.argv[1]), '..');

const blockPrefabIndexFile = 'js/lib/block-prefab-index.json';
const prefabBlockIndexFile = 'js/lib/prefab-block-index.json';
const blockLabelsFile = 'js/lib/block-labels.json';

async function main() {
  const { vanillaDir } = localInfo;
  const fileGlob = path.join(vanillaDir, 'Data', 'Prefabs', '*.blocks.nim');
  const nimFiles = await glob(fileGlob);
  if (nimFiles.length === 0) {
    throw Error(`No nim file: ${fileGlob}`);
  }
  const waitTasks = [];

  const prefabs = await Promise.all(nimFiles.map(readNim));
  console.log('Load %d prefabs', prefabs.length);
  waitTasks.push(writeBlockPrefabIndex(prefabs));

  const blocks = invertIndex(prefabs);
  console.log('Load %d blocks', blocks.length);
  waitTasks.push(writePrefabBlockIndex(blocks));

  waitTasks.push(writeBlockLabels(vanillaDir, blocks.map(b => b.name)));

  await Promise.all(waitTasks);

  return 0;
}

async function writeBlockPrefabIndex(prefabs) {
  fsPromise.writeFile(
    path.join(projectRoot, prefabBlockIndexFile),
    JSON.stringify(prefabs),
  );
  console.log('Write %s', prefabBlockIndexFile);
}

async function writePrefabBlockIndex(blocks) {
  await fsPromise.writeFile(
    path.join(projectRoot, blockPrefabIndexFile),
    JSON.stringify(blocks),
  );
  console.log('Write %s', blockPrefabIndexFile);
}

async function writeBlockLabels(vanillaDir, blocks) {
  const fileName = path.join(vanillaDir, 'Data', 'Config', 'Localization.txt');
  const labels = await parseLabel(fileName);
  const blockLabels = blocks.reduce((result, block) => {
    const obj = { [block]: labels[block] };
    return Object.assign(result, obj);
  }, {});
  await fsPromise.writeFile(
    path.join(projectRoot, blockLabelsFile),
    JSON.stringify(blockLabels),
  );
  console.log('Write %s', blockLabelsFile);
}

async function readNim(nimFileName) {
  const blocks = await parseNim(nimFileName);
  return {
    name: path.basename(nimFileName, '.blocks.nim'),
    blocks: blocks.map(b => b.name),
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
