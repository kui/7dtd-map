/* eslint-env node */

const path = require('path');
const fsPromise = require('fs').promises;
const glob = require('glob-promise');

const parseNim = require('./lib/nim-parser');
const parseLabel = require('./lib/label-parser');
const parseTts = require('./lib/tts-parser');
const localInfo = require('../local.json');

const projectRoot = path.join(path.dirname(process.argv[1]), '..');

const blockPrefabIndexFile = 'docs/block-prefab-index.json';
const prefabBlockIndexFile = 'docs/prefab-block-index.json';
const blockLabelsFile = 'docs/block-labels.json';

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
    }
    return result;
  }, {});
}

async function readNim(nimFiles) {
  const parsedNimFiles = await Promise.all(nimFiles.map(async (nimFileName) => {
    const prefabName = path.basename(nimFileName, '.blocks.nim');
    const ttsFileName = path.join(
      path.dirname(nimFileName),
      `${prefabName}.tts`,
    );

    let blocks;
    let blockNums;
    try {
      [blocks, { blockNums }] = await Promise.all([
        parseNim(nimFileName),
        parseTts(ttsFileName),
      ]);
    } catch (e) {
      console.warn(e);
      return {};
    }

    return {
      name: prefabName,
      blocks: blocks
        .filter((b) => !excludedBlocks.has(b.name))
        .map((b) => ({ name: b.name, count: blockNums.get(b.id) || 0 })),
    };
  }));
  return parsedNimFiles.reduce(
    (obj, prefab) => {
      if (prefab.name) {
        return Object.assign(obj, { [prefab.name]: prefab.blocks });
      }
      return obj;
    },
    {},
  );
}

function invertIndex(prefabs) {
  return Object
    .entries(prefabs)
    .reduce((arr, [name, blocks]) => {
      const flatten = blocks.map((block) => ({ prefab: name, block }));
      return arr.concat(flatten);
    }, [])
    .reduce((obj, { prefab, block }) => Object.assign(obj, {
      [block.name]: (obj[block.name] || []).concat({ name: prefab, count: block.count }),
    }), {});
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
