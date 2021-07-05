import * as path from "path";
import { parseNim } from "./nim-parser";
import { parseTts } from "./tts-parser";
import { parseXml } from "./xml-parser";

interface HtmlModel {
  name: string;
  xml: PrefabProperty[];
  dimensions: Dimensions;
  blocks: BlockCount[];
}

interface PrefabProperty {
  name: string;
  value: string;
}
interface Dimensions {
  x: number;
  y: number;
  z: number;
}
interface BlockCount {
  name: string;
  localizedName: string;
  count: number;
}

function html(model: HtmlModel): string {
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
    <table>${model.xml.map((p) => `<tr><th>${p.name}</th><td>${p.value}</td></tr>`).join("\n")}</table>
  </section>

  <section>
    <h2>Dimensions</h2>
    <table>${Object.entries(model.dimensions)
      .map(([axis, value]) => `<tr><th>${axis}</th><td>${value}</td></tr>`)
      .join("\n")}</table>
  </section>

  <section>
    <h2>Blocks</h2>
    <table>
      <tr><th>ID</th><th>Name</th><th>Count</th></tr>
      ${model.blocks.map((b) => `<tr><td>${b.name}</td><td>${escapeHtml(b.localizedName)}</td><td>${b.count}</td></tr>`).join("\n")}
    </table>
  </section>
</body>
</html>
`;
}

export async function prefabHtml(xml: string, nim: string, tts: string, labels: Map<string, string>): Promise<string> {
  const name = path.basename(xml, ".xml");
  const { maxx, maxy, maxz, blockNums } = await parseTts(tts);
  const blocksPromise = parseNim(nim).then((bs) =>
    Array.from(bs).map(([id, name]) => ({
      id,
      name,
      localizedName: labels.get(name) ?? "-",
      count: blockNums.get(id) ?? 0,
    }))
  );
  const propertiesPromise = parsePrefabXml(xml);
  const [blocks, properties] = await Promise.all([blocksPromise, propertiesPromise]);

  const blockIdSet = new Set(blocks.map((b) => b.id));
  if ([...blockNums.keys()].filter((i) => !blockIdSet.has(i)).length > 0) {
    console.warn(
      "Unexpected state: unused block num: file=%s, idList=%s",
      xml,
      [...blockNums.keys()].filter((i) => !blockIdSet.has(i))
    );
  }
  if (blocks.filter((b) => b.count === 0).length > 0) {
    console.warn(
      "Unexpected state: unused block was asigned a ID: file=%s, blocks=%s",
      xml,
      blocks.filter((b) => b.count === 0)
    );
  }

  sortByProperty(properties, "name");
  sortByProperty(blocks, "name");

  return html({
    name,
    xml: properties,
    blocks,
    dimensions: { x: maxx, y: maxy, z: maxz },
  });
}

interface PrefabXml {
  prefab: {
    property: PrefabXmlProperty[];
  };
}

type PrefabXmlProperty = PrefabXmlPropertyValue | PrefabXmlClassProperty;

interface PrefabXmlPropertyValue {
  $: PrefabProperty;
}

interface PrefabXmlClassProperty {
  $: {
    class: string;
  };
  property: PrefabProperty[];
}

async function parsePrefabXml(xmlFileName: string) {
  const xml = await parseXml<PrefabXml>(xmlFileName);
  return xml.prefab.property.flatMap((p) => {
    if ("name" in p.$) return p.$;
    else return [];
  });
}

function sortByProperty<T>(arr: T[], propName: keyof T) {
  arr.sort((a, b) => {
    if (a[propName] > b[propName]) return 1;
    if (a[propName] < b[propName]) return -1;
    return 0;
  });
}

const ESCAPE_HTML_PATTERNS: [RegExp, string][] = [
  [/</g, "&lt;"],
  [/>/g, "&gt;"],
  [/&/g, "&amp;"],
];

function escapeHtml(s: string) {
  if (!s) return s;
  return ESCAPE_HTML_PATTERNS.reduce((str, [regex, newStr]) => str.replace(regex, newStr), s);
}
