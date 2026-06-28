import * as path from "node:path";
import { parseNim } from "./nim-parser.ts";
import { parseTts } from "./tts-parser.ts";
import { isPrefabPropertyValue, parsePrefabXml } from "./xmls/prefab-xml.ts";
import { Label, LabelId } from "./label-parser.ts";
import { requireNonnull } from "./utils.ts";

interface HtmlModel {
  name: string;
  label: string;
  xml: PrefabProperty[];
  dimensions: { x: number; y: number; z: number };
  blocks: BlockCount[];
  sleeperVolumes: SleeperVolume[];
  difficulty: string;
}

export interface PrefabProperty {
  name: string;
  value: string;
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
  <script src="main.js" async></script>
  <link rel="stylesheet" type="text/css" href="main.css" />
</head>
<body>
  <h1>
    <span class="prefab-tier" title="Difficulty Tier">${model.difficulty}</span>
    <span class="prefab_label">${model.label}</span>
    /
    <span class="prefab_name">${model.name}</span>
  </h1>

  <nav>
    <ul>
      <li><a href="../prefabs.html">Prefab List</a></li>
      <li><a href="..">7dtd-map</a></li>
      <li><a href="https://github.com/kui/7dtd-map">Github repository</a></li>
      <li>
        Prefab/Block Language:
        <select id="label-lang">
          <option selected>english</option>
        </select>
      </li>
    </ul>
  </nav>

  <img src="${model.name}.jpg">

  <nav>
    <h2>Contents</h2>
    <ul>
      <li><a href="#xml">XML</a></li>
      <li><a href="#dimensions">Dimensions</a></li>
      <li><a href="#blocks">Blocks</a></li>
      <li><a href="#sleeper-volumes">SleeperVolumes</a></li>
    </ul>
  </nav>

  <section id="xml">
    <h2>XML</h2>
    <table>${
    model.xml.map((p) => `<tr><th>${p.name}</th><td>${p.value}</td></tr>`).join(
      "\n",
    )
  }</table>
  </section>

  <section id="dimensions">
    <h2>Dimensions</h2>
    <table>${
    Object.entries<number>(model.dimensions)
      .map(([axis, value]) =>
        `<tr><th>${axis}</th><td>${value.toString()}</td></tr>`
      )
      .join("\n")
  }</table>
  </section>

  <section id="blocks">
    <h2>Blocks</h2>
    <table id="blocks" class="long-table">
      <tr><th>ID</th><th>Name</th><th>Count</th></tr>
      ${
    model.blocks
      .map((b) =>
        [
          `<tr class="block">`,
          `<td class="block_name">${b.name}</td>`,
          `<td class="block_label">${escapeHtml(b.localizedName)}</td>`,
          `<td class="block_count">${b.count.toString()}</td>`,
          "</tr>",
        ].join("")
      )
      .join("\n")
  }
    </table>
  </section>

  <section id="sleeper-volumes">
    <h2>SleeperVolumes</h2>
    ${
    model.sleeperVolumes.length === 0 ? "<p>No SleeperVolumes</p>" : `
    <table class="long-table">
      <tr><th>#</th><th>Group</th><th>Count</th><th>GroupId</th><th>GameStageAdjust</th><th>Flags</th><th>IsBoss</th><th>IsLoot</th><th>IsQuestExclude</th><th>Size</th><th>Start</th></tr>
      ${
      model.sleeperVolumes
        .map((s, i) =>
          [
            "<tr>",
            `<td>${i.toString()}</td>`,
            `<td>${s.group}</td>`,
            `<td>${
              s.count[0] === s.count[1]
                ? s.count[0].toString()
                : `${s.count[0].toString()}-${s.count[1].toString()}`
            }</td>`,
            `<td>${s.groupId.toString()}</td>`,
            `<td>${s.gameStageAdjust || "-"}</td>`,
            `<td>${s.flags.toString()}</td>`,
            `<td>${s.isBoss ? "✓" : "-"}</td>`,
            `<td>${s.isLoot ? "✓" : "-"}</td>`,
            `<td>${s.isQuestExclude ? "✓" : "-"}</td>`,
            `<td>${s.size.join("x")}</td>`,
            `<td>${s.start.join("x")}</td>`,
            "</tr>",
          ].join("")
        )
        .join("\n")
    }
    </table>
    <p>Total Count: ${renderSleeperVolumeTotalCount(model.sleeperVolumes)}</p>
    `
  }
  </section>
</body>
</html>
`;
}

export async function prefabHtml(
  xml: string,
  nim: string,
  tts: string,
  labels: Map<LabelId, Label>,
): Promise<string> {
  const name = path.basename(xml, ".xml");
  const label = labels.get(name)?.english ?? "-";
  // Launch all three I/O operations in parallel; previously parseTts was
  // awaited before the other two were even constructed, doubling per-prefab
  // latency across the throttled fan-out in generate-prefab-html.ts.
  const [ttsData, blockNimEntries, rawProperties] = await Promise.all([
    parseTts(tts),
    parseNim(nim),
    parsePrefabXml(xml),
  ]);
  const { maxx, maxy, maxz, blockNums } = ttsData;
  const blocks = Array.from(blockNimEntries)
    .map(([id, blockName]) => ({
      id,
      name: blockName,
      localizedName: labels.get(blockName)?.english ?? "-",
      count: blockNums.get(id) ?? 0,
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
  // The HTML page only renders flat name/value properties; nested class
  // containers (e.g. Stats) are intentionally dropped to keep the existing
  // output stable.
  const properties = rawProperties
    .filter(isPrefabPropertyValue)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  // List of blocks used in .tts but not defined in .blocks.nim
  const blockIdSet = new Set(blocks.map((b) => b.id));
  const undefinedBlockIds = [...blockNums.keys()].filter((i) =>
    !blockIdSet.has(i)
  );
  if (undefinedBlockIds.length > 0) {
    console.warn(
      "Unexpected state: unknown block ID used: file=%s, idCount=%o",
      xml,
      undefinedBlockIds.map((i) => [i, blockNums.get(i)]),
    );
  }

  // List of blocks defined in .blocks.nim but not placed in .tts
  const noPlacedBlocks = blocks.filter((b) => b.count === 0);
  if (noPlacedBlocks.length > 0) {
    console.warn(
      "Unexpected state: unused block was asigned a ID: file=%s, blocks=%o",
      xml,
      noPlacedBlocks,
    );
  }

  const sleeperVolumes = buildSleeperVolumes(properties);
  const difficultyRaw =
    properties.find((p) => p.name === "DifficultyTier")?.value ?? "0";
  const difficulty = difficultyRaw === "0" ? "" : `💀${difficultyRaw}`;

  return html({
    name,
    label,
    xml: properties,
    blocks,
    dimensions: { x: maxx, y: maxy, z: maxz },
    sleeperVolumes,
    difficulty,
  });
}

// `&` must be replaced first; otherwise the `&` introduced by `&lt;`/`&gt;`
// would be re-escaped into `&amp;lt;` / `&amp;gt;`.
const ESCAPE_HTML_PATTERNS: [RegExp, string][] = [
  [/&/g, "&amp;"],
  [/</g, "&lt;"],
  [/>/g, "&gt;"],
];

export function escapeHtml(s: string) {
  if (!s) return s;
  return ESCAPE_HTML_PATTERNS.reduce(
    (str, [regex, newStr]) => str.replace(regex, newStr),
    s,
  );
}

export interface SleeperVolume {
  group: string;
  count: [number, number];
  groupId: number;
  gameStageAdjust: string;
  flags: number;
  isBoss: boolean;
  isLoot: boolean;
  isQuestExclude: boolean;
  size: [number, number, number];
  start: [number, number, number];
}

// Apply `parser` to each `separator`-split token of the property identified
// by `key`, or return undefined if the property is absent. Replaces ~7
// repetitions of `properties.find(p => p.name === key)?.value.split(...).map(...)`.
function parseCsvField<T>(
  propMap: Map<string, string>,
  key: string,
  parser: (s: string) => T,
  separator: string | RegExp = ",",
): T[] | undefined {
  return propMap.get(key)?.split(separator).map(parser);
}

function parseTriple(raw: string, kind: string): [number, number, number] {
  const t = raw.split(",").map((s) => parseInt(s, 10));
  if (t.length !== 3) throw new Error(`Invalid sleeper volume ${kind}: ${raw}`);
  return t as [number, number, number];
}

export function buildSleeperVolumes(
  properties: PrefabProperty[],
): SleeperVolume[] {
  // Single O(N) scan up front; subsequent lookups are O(1) instead of O(N)
  // per field (previously ~10 full scans of `properties`).
  const propMap = new Map(properties.map((p) => [p.name, p.value]));

  const groupsRaw = parseCsvField(
    propMap,
    "SleeperVolumeGroup",
    (s) => s.trim(),
  );
  if (groupsRaw === undefined) return [];
  const groups = [];
  for (let i = 0; i < groupsRaw.length; i += 3) {
    // NOTE: This implementation for SleeperVolumeGroup could be wrong.
    // The 2nd and 3rd elements are treated as the number of sleepers in this implementation.
    // However, I don't know the exact meaning of these values.
    const countMin = parseInt(groupsRaw[i + 1] ?? "", 10);
    const countMax = parseInt(groupsRaw[i + 2] ?? "", 10);
    if (isNaN(countMin) || isNaN(countMax)) {
      throw new Error(
        `Invalid sleeper volume count: ${String(groupsRaw[i + 1])}, ${
          String(groupsRaw[i + 2])
        }`,
      );
    }
    groups.push({
      // Skip ith element checking because i+1 is alraedy checked
      // deno-lint-ignore no-non-null-assertion
      group: groupsRaw[i]!,
      count: [countMin, countMax] as [number, number],
    });
  }
  const groupIds = parseCsvField(
    propMap,
    "SleeperVolumeGroupId",
    (s) => parseInt(s, 10),
  );
  if (groupIds === undefined) {
    throw new Error("SleeperVolumeGroupId is not found");
  }
  // NOTE: This implementation for SleeperVolumeGameStageAdjust could be wrong.
  // Some prefabs have no SleeperVolumeGameStageAdjust or shorter than SleeperVolumeGroup
  // This implementation assumes that padding empty string to the length of SleeperVolumeGroup.
  const gameStageAdjusts =
    parseCsvField(propMap, "SleeperVolumeGameStageAdjust", (s) => s.trim()) ??
      Array.from(groups, () => "");
  const flags = parseCsvField(
    propMap,
    "SleeperVolumeFlags",
    (s) => parseInt(s, 10),
  );
  if (flags === undefined) throw new Error("SleeperVolumeFlags is not found");
  // NOTE: This implementation for SleeperIsBossVolume could be wrong.
  // See the comment for SleeperVolumeGameStageAdjust.
  const parseBool = (s: string) => s === "True";
  const isBosses = parseCsvField(propMap, "SleeperIsBossVolume", parseBool) ??
    Array.from(groups, () => false);
  const isLoots = parseCsvField(propMap, "SleeperIsLootVolume", parseBool) ??
    Array.from(groups, () => false);
  const isQuestExcludes =
    parseCsvField(propMap, "SleeperIsQuestExclude", parseBool) ??
      Array.from(groups, () => false);
  const sizes = parseCsvField(
    propMap,
    "SleeperVolumeSize",
    (s) => parseTriple(s, "size"),
    "#",
  );
  if (sizes === undefined) throw new Error("SleeperVolumeSize is not found");
  const starts = parseCsvField(
    propMap,
    "SleeperVolumeStart",
    (s) => parseTriple(s, "start"),
    "#",
  );
  if (starts === undefined) throw new Error("SleeperVolumeStart is not found");
  return groups.map<SleeperVolume>((group, i) => {
    return {
      group: group.group,
      count: group.count,
      groupId: requireNonnull(
        groupIds[i],
        () => `Unexpected state: groupId is not found: index=${String(i)}`,
      ),
      gameStageAdjust: gameStageAdjusts[i] ?? "", // See the above comment for SleeperVolumeGameStageAdjust.
      flags: requireNonnull(
        flags[i],
        () => `Unexpected state: flags is not found: index=${String(i)}`,
      ),
      // See the above comment for SleeperVolumeGameStageAdjust: the property
      // may be absent or shorter than `groups`, so default missing entries to
      // false instead of throwing (which would drop the whole prefab).
      isBoss: isBosses[i] ?? false,
      isLoot: isLoots[i] ?? false,
      isQuestExclude: isQuestExcludes[i] ?? false,
      size: requireNonnull(
        sizes[i],
        () => `Unexpected state: size is not found: index=${String(i)}`,
      ),
      start: requireNonnull(
        starts[i],
        () => `Unexpected state: start is not found: index=${String(i)}`,
      ),
    };
  });
}

function renderSleeperVolumeTotalCount(
  sleeperVolumes: SleeperVolume[],
): string {
  const min = sleeperVolumes.reduce((sum, s) => sum + s.count[0], 0);
  const max = sleeperVolumes.reduce((sum, s) => sum + s.count[1], 0);
  return min === max ? min.toString() : `${min.toString()}-${max.toString()}`;
}
