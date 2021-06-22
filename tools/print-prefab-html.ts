/* eslint-env node */

import { promises as fs } from 'fs';
import * as path from 'path';
import { prefabHtml } from './lib/prefab-html';
import { parseLabel } from './lib/label-parser';

const usage = `${path.basename(process.argv[1])} <Prefab XML>`;

const projectRoot = path.join(path.dirname(process.argv[1]), '..');
const localInfo = fs.readFile(path.join(projectRoot, 'local.json')).then(j => JSON.parse(j.toString()));

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }
  const labels = await loadLabels();
  const xml = process.argv[2];
  const pathBasename = path.join(path.dirname(xml), path.basename(xml, '.xml'));
  const nim = `${pathBasename}.blocks.nim`;
  const tts = `${pathBasename}.tts`;
  console.log(await prefabHtml({
    xml, nim, tts, labels,
  }));
  return 0;
}

async function loadLabels() {
  const { vanillaDir } = await localInfo;
  const fileName = path.join(vanillaDir, 'Data', 'Config', 'Localization.txt');
  const labels = await parseLabel(fileName);
  console.log('Load %s labels', Object.keys(labels).length);
  return labels;
}

main()
.catch((e) => {
  console.error(e);
  return 1;
}).then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
