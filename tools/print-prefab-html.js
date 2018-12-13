/* eslint-env node */

const path = require('path');
const prefabHtml = require('./lib/prefab-html');
const localInfo = require('../local.json');
const parseLabel = require('./lib/label-parser');

const usage = `${path.basename(process.argv[1])} <Prefab XML> <Prefab Nim> <Prefab Tts>`;

async function main() {
  if (process.argv.length <= 4) {
    console.error(usage);
    return 1;
  }
  const labels = await loadLabels();
  console.log(await prefabHtml({ xml: process.argv[2], nim: process.argv[3], tts: process.argv[4], labels }));
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
