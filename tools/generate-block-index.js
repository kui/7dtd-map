/* eslint-env node */

const path = require('path');
const fsPromise = require('fs').promises;
const glob = require('glob-promise');

const parseNim = require('./lib/nim-parser');
const parseLabel = require('./lib/label-parser');
const localInfo = require('../local.json');

const projectRoot = path.join(path.dirname(process.argv[1]), '..');

const blockPrefabIndexFile = 'js/lib/block-prefab-index.json';
const prefabBlockIndexFile = 'js/lib/prefab-block-index.json';
const blockLabelsFile = 'js/lib/block-labels.json';

const excludedBlocks = new Set([
  'air',
  'terrainFiller',
]);

async function main() {
  const { vanillaDir } = localInfo;
  const fileGlob = path.join(vanillaDir, 'Data', 'Prefabs', '*.blocks.nim');
  const nimFiles = await glob(fileGlob);
  if (nimFiles.length === 0) {
    throw Error(`No nim file: ${fileGlob}`);
  }
  const waitTasks = [];

  const prefabs = await readNim(nimFiles);
  console.log('Load %d prefabs', Object.keys(prefabs).length);
  waitTasks.push(writeJsonFile(prefabBlockIndexFile, prefabs));

  const blocks = invertIndex(prefabs);
  console.log('Load %d blocks', Object.keys(blocks).length);
  waitTasks.push(writeJsonFile(blockPrefabIndexFile, blocks));

  waitTasks.push((async () => {
    const labels = await readLabels(vanillaDir, Object.keys(blocks));
    console.log('Load %d block labels', Object.keys(labels).length);
    writeJsonFile(blockLabelsFile, labels);
  })());

  await Promise.all(waitTasks);

  return 0;
}

async function writeJsonFile(file, json) {
  await fsPromise.writeFile(path.join(projectRoot, file), JSON.stringify(json));
  console.log('Write %s', file);
}

async function readLabels(vanillaDir, blocks) {
  const fileName = path.join(vanillaDir, 'Data', 'Config', 'Localization.txt');
  const labels = await parseLabel(fileName);
  return blocks.reduce((result, block) => {
    const label = labels[block];
    if (label) {
      return Object.assign(result, { [block]: labels[block] });
    } else {
      return result;
    }
  }, {});
}

async function readNim(nimFiles) {
  const parsedNimFiles = await Promise.all(nimFiles.map(async (nimFileName) => {
    const blocks = await parseNim(nimFileName);
    return {
      name: path.basename(nimFileName, '.blocks.nim'),
      blocks: blocks.map(b => b.name).filter(b => !excludedBlocks.has(b)),
    };
  }));
  return parsedNimFiles.reduce((obj, prefab) => {
    return Object.assign(obj, { [prefab.name]: prefab.blocks });
  }, {});
}

function invertIndex(prefabs) {
  return Object
    .entries(prefabs)
    .reduce((arr, [name, blocks]) => {
      const flatten = blocks.map(block => ({ prefab: name, block }));
      return arr.concat(flatten);
    }, [])
    .reduce((obj, { prefab, block }) => Object.assign(obj, {
      [block]: (obj[block] || []).concat(prefab),
    }), {});
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
