/* eslint-env node */

const path = require('path');
const fsPromise = require('fs').promises;
const glob = require('glob-promise');

const prefabHtml = require('./lib/prefab-html');
const localInfo = require('../local.json');
const parseLabel = require('./lib/parse-label');

const projectRoot = path.join(path.dirname(process.argv[1]), '..');
const baseDist = 'docs/prefabs';

async function main() {
  await remove();
  const labels = await loadLabels();
  const prefabNames = await generateHtml(labels);
  await Promise.all([
    await generateIndex(prefabNames),
    await copyJpg(prefabNames),
  ]);
}

async function remove() {
  const globPath = path.join(projectRoot, baseDist, '*.{jpg,html}');
  await Promise.all((await glob(globPath)).map(fsPromise.unlink));
  console.log('Remove %s', globPath);
}

async function loadLabels() {
  const { vanillaDir } = localInfo;
  const fileName = path.join(vanillaDir, 'Data', 'Config', 'Localization.txt');
  const labels = await parseLabel(fileName);
  console.log('Load %s labels', Object.keys(labels).length);
  return labels;
}

async function generateHtml(labels) {
  const { vanillaDir } = localInfo;
  const xmlGlob = path.join(vanillaDir, 'Data', 'Prefabs', '*.xml');
  const xmlFiles = await glob(xmlGlob);
  if (xmlFiles.length === 0) {
    throw Error(`No xml file: ${xmlGlob}`);
  }

  const prefabNames = await Promise.all(xmlFiles.map(async (xmlFileName) => {
    const prefabName = path.basename(xmlFileName, '.xml');
    const nimFileName = path.join(vanillaDir, 'Data', 'Prefabs', `${prefabName}.blocks.nim`);
    const ttsFileName = path.join(vanillaDir, 'Data', 'Prefabs', `${prefabName}.tts`);
    const html = await prefabHtml({
      xml: xmlFileName, nim: nimFileName, tts: ttsFileName, labels,
    });
    const dist = path.join(projectRoot, baseDist, `${prefabName}.html`);
    await fsPromise.writeFile(dist, html);
    return prefabName;
  }));
  console.log('Write %d html files', xmlFiles.length);

  return prefabNames;
}

async function copyJpg(prefabNames) {
  const { vanillaDir } = localInfo;
  const jpgFiles = prefabNames
    .map(n => path.join(vanillaDir, 'Data', 'Prefabs', `${n}.jpg`));

  let failNum = 0;
  await Promise.all(jpgFiles.map(async (jpgFileName) => {
    const dist = path.join(projectRoot, baseDist, path.basename(jpgFileName));
    try {
      await fsPromise.copyFile(jpgFileName, dist);
    } catch (e) {
      console.warn(e.message);
      failNum += 1;
    }
  }));
  console.log('Copy %d jpg files', jpgFiles.length - failNum);
}

async function generateIndex(prefabNames) {
  const dist = path.join(projectRoot, baseDist, 'index.html');
  await fsPromise.writeFile(dist, `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="description" content="">
  <title>Prefab List</title>
</head>
<body>
  <h1>Prefab List</h1>
  <nav>
    <ul>
      <li><a href="..">7dtd-map</a></li>
      <li><a href="https://github.com/kui/7dtd-map">Github repository</a></li>
    </ul>
  </nav>
  <ul>
   ${prefabNames.map(p => `<li><a href="${p}.html">${p}</a></li>`).join('\n')}
  </ul>
</body>
</html>
`);
  console.log('Write index.html');
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
