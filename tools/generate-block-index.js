/* eslint-env node */

const path = require('path');
const fsPromise = require('fs').promises;
const glob = require('glob-promise');
const csvParse = require('csv-parse');

const parseNim = require('./lib/nim_parser');
const localInfo = require('../local.json');

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
  fsPromise.writeFile(prefabBlockIndexFile, JSON.stringify(prefabs));
  console.log('Write %s', prefabBlockIndexFile);
}

async function writePrefabBlockIndex(blocks) {
  await fsPromise.writeFile(blockPrefabIndexFile, JSON.stringify(blocks));
  console.log('Write %s', blockPrefabIndexFile);
}

async function writeBlockLabels(vanillaDir, blocks) {
  const blockSet = new Set(blocks);
  const localization = await fsPromise
    .readFile(path.join(vanillaDir, 'Data', 'Config', 'Localization.txt'));
  const labelArr = await new Promise((resolve, reject) => {
    csvParse(localization, (err, out) => { resolve(out); reject(err); });
  });
  const blockLabels = labelArr.reduce((result, label) => {
    if (blockSet.has(label[0])) {
      return Object.assign(result, { [label[0]]: label[4] });
    }
    return result;
  }, {});
  await fsPromise.writeFile(blockLabelsFile, JSON.stringify(blockLabels));
  console.log('Write %s', blockLabelsFile);
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
