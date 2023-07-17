import * as path from "path";
import { parseNim } from "./nim-parser";
import { parseTts } from "./tts-parser";
import { parsePrefabXml } from "./prefab-xml-parser";
import { Label, LabelId } from "./label-parser";

interface HtmlModel {
  name: string;
  label: string;
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
  <meta name="description" content="7 Days to Die prefab information and block statistics for ${model.label} / ${model.name}">
  <title>${model.label} / ${model.name}</title>
  <style>
  tr:nth-child(odd) {
    background-color: lightcyan;
  }
  </style>
  <script src="main.js" async></script>
</head>
<body>
  <h1><span class="prefab_label">${model.label}</span> / <small class="prefab_name">${model.name}</small></h1>

  <nav>
    <ul>
      <li><a href="../prefabs.html">Prefab List</a></li>
      <li><a href="..">7dtd-map</a></li>
      <li><a href="https://github.com/kui/7dtd-map">Github repository</a></li>
      <li>
        Prefab/Block Language:
        <select id="label_lang">
          <option selected>english</option>
        </select>
      </li>
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
    <table id="blocks">
      <tr><th>ID</th><th>Name</th><th>Count</th></tr>
      ${model.blocks
        .map((b) =>
          [
            `<tr class="block">`,
            `<td class="block_name">${b.name}</td>`,
            `<td class="block_label">${escapeHtml(b.localizedName)}</td>`,
            `<td class="block_count">${b.count}</td>`,
            "</tr>",
          ].join("")
        )
        .join("\n")}
    </table>
  </section>
</body>
</html>
`;
}

export async function prefabHtml(xml: string, nim: string, tts: string, labels: Map<LabelId, Label>): Promise<string> {
  const name = path.basename(xml, ".xml");
  const label = labels.get(name)?.english ?? "-";
  const { maxx, maxy, maxz, blockNums } = await parseTts(tts);
  const blocksPromise = parseNim(nim).then((bs) =>
    Array.from(bs).map(([id, name]) => ({
      id,
      name,
      localizedName: labels.get(name)?.english ?? "-",
      count: blockNums.get(id) ?? 0,
    }))
  );
  const propertiesPromise = parsePrefabXml(xml);
  const [blocks, properties] = await Promise.all([blocksPromise, propertiesPromise]);

  // List of blocks used in .tts but not defined in .blocks.nim
  const blockIdSet = new Set(blocks.map((b) => b.id));
  const undefinedBlockIds = [...blockNums.keys()].filter((i) => !blockIdSet.has(i));
  if (undefinedBlockIds.length > 0) {
    console.warn(
      "Unexpected state: unknown block ID used: file=%s, idCount=%o",
      xml,
      undefinedBlockIds.map((i) => [i, blockNums.get(i)])
    );
  }

  // List of blocks defined in .blocks.nim but not placed in .tts
  const noPlacedBlocks = blocks.filter((b) => b.count === 0);
  if (noPlacedBlocks.length > 0) {
    console.warn("Unexpected state: unused block was asigned a ID: file=%s, blocks=%o", xml, noPlacedBlocks);
  }

  sortByProperty(properties, "name");
  sortByProperty(blocks, "name");

  return html({
    name,
    label,
    xml: properties,
    blocks,
    dimensions: { x: maxx, y: maxy, z: maxz },
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
