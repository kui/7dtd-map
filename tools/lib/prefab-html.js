/* eslint-env node */

const path = require('path');
const fsPromise = require('fs').promises;
const parseXmlString = require('xml2js').parseString;
const parseNim = require('./nim-parser');
const parseTts = require('./tts-parser');

function html(model) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="description" content="">
  <style>
  tr:nth-child(odd) {
    background-color: lightcyan;
  }
  </style>
  <title>${model.name}</title>
</head>
<body>
  <h1>${model.name}</h1>

  <nav>
    <ul>
      <li><a href="index.html">Prefab List</a></li>
      <li><a href="..">7dtd-map</a></li>
      <li><a href="https://github.com/kui/7dtd-map">Github repository</a></li>
    </ul>
  </nav>

  <img src="${model.name}.jpg">

  <section>
    <h2>XML</h2>
    <table>${model.xml.map(p => `<tr><th>${p.name}</th><td>${p.value}</td></tr>`).join('\n')}</table>
  </section>

  <section>
    <h2>Dimensions</h2>
    <table>${['x', 'y', 'z'].map(d => `<tr><th>${d}</th><td>${model.dimensions[d]}</td></tr>`).join('\n')}</table>
  </section>

  <section>
    <h2>Blocks</h2>
    <table>
      <tr><th>ID</th><th>Name</th><th>Count</th></tr>
      ${model.blocks.map(b => `<tr><td>${b.name}</td><td>${b.localizedName}</td><td>${b.num}</td></tr>`).join('\n')}
    </table>
  </section>
</body>
</html>
`;
}

module.exports = async ({
  xml, nim, tts, labels,
}) => {
  const name = path.basename(xml, '.xml');
  const {
    maxx, maxy, maxz, blockNums,
  } = await parseTts(tts);
  const blocksPromise = parseNim(nim)
    .then(bs => bs.map(b => ({
      id: b.id,
      name: b.name,
      localizedName: labels[b.name],
      num: blockNums.get(b.id) || 0,
    })));
  const xmlPromise = parsePrefabXml(xml);
  const [blocks, dom] = await Promise.all([blocksPromise, xmlPromise]);

  const blockIdSet = new Set(blocks.map(b => b.id));
  if ([...blockNums.keys()].filter(i => !blockIdSet.has(i)).length > 0) {
    console.warn('Unexpected state: unused block num: file=%s, idList=%s', xml, [...blockNums.keys()].filter(i => !blockIdSet.has(i)));
  }
  if (blocks.filter(b => b.num === 0).length > 0) {
    console.warn('Unexpected state: unused block was asigned a ID: file=%s, blocks=%s', xml, blocks.filter(b => b.num === 0));
  }

  sortByProperty(dom, 'name');
  sortByProperty(blocks, 'name');

  return html({
    name, xml: dom, blocks, dimensions: { x: maxx, y: maxy, z: maxz },
  });
};

async function parsePrefabXml(xmlFileName) {
  const xml = await parseXml(xmlFileName);
  return xml.prefab.property.map(p => p.$);
}

async function parseXml(xmlFileName) {
  const xml = await fsPromise.readFile(xmlFileName);
  return new Promise((resolve, reject) => {
    parseXmlString(xml, (err, result) => {
      if (err) reject(err);
      if (result) resolve(result);
      reject(Error('Unexpected state'));
    });
  });
}

function sortByProperty(arr, propName) {
  arr.sort((a, b) => {
    if (a[propName] > b[propName]) return 1;
    if (a[propName] < b[propName]) return -1;
    return 0;
  });
}
