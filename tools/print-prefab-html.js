/* eslint-env node */

const path = require('path');
const prefabHtml = require('./lib/prefab-html');
const localInfo = require('../local.json');
const parseLabel = require('./lib/label-parser');

const usage = `${path.basename(process.argv[1])} <Prefab XML>`;

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }
  const labels = await loadLabels();
  const xml = process.argv[2];
  const pathBasename = path.join(path.dirname(xml), path.basename(xml, '.xml'))
  const nim = `${pathBasename}.blocks.nim`;
  const tts = `${pathBasename}.tts`;
  console.log(await prefabHtml({ xml, nim, tts, labels }));
  return 0;
}

async function loadLabels() {
  const { vanillaDir } = localInfo;
  const fileName = path.join(vanillaDir, 'Data', 'Config', 'Localization.txt');
  const labels = await parseLabel(fileName);
  console.log('Load %s labels', Object.keys(labels).length);
  return labels;
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
