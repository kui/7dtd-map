import { parseXml } from "../xml-parser.ts";
import { vanillaDir } from "../utils.ts";

const LOOT_XML = await vanillaDir("Data", "Config", "loot.xml");

/* Raw XML types (encapsulated) */

type LootGroupName = string;

interface RawLootXml {
  lootcontainers: {
    lootgroup: RawLootGroup[];
    lootcontainer: RawLootContainer[];
  };
}

interface RawLootGroup {
  $: { name: LootGroupName };
  item?: RawLootItem[];
}

interface RawLootContainer {
  $: { name: string };
  item?: RawLootItem[];
}

type RawLootItem = RawLootItemGroup | RawLootLootItem;

interface RawLootItemGroup {
  $: { group: LootGroupName };
}

interface RawLootLootItem {
  $: { name: string };
}

/* Public types */

export interface LootTable {
  items: string[];
  groups: LootGroup[];
}

export interface LootContainer extends LootTable {
  name: string;
}

export interface LootGroup extends LootTable {
  name: string;
}

/* Public API */

export async function loadLoot(
  lootXmlFileName: string = LOOT_XML,
): Promise<Loot> {
  const xml = await parseXml(lootXmlFileName) as RawLootXml;
  const groups = new Map<string, { items: string[]; groups: string[] }>();
  for (const g of xml.lootcontainers.lootgroup) {
    groups.set(g.$.name, {
      items: extractItems(g.item ?? []),
      groups: extractGroups(g.item ?? []),
    });
  }
  const containers = xml.lootcontainers.lootcontainer.map((c) => ({
    name: c.$.name,
    items: extractItems(c.item ?? []),
    groups: extractGroups(c.item ?? []),
  }));
  return new Loot(containers, groups);
}

export class Loot {
  #containers: { name: string; items: string[]; groups: string[] }[];
  #groups: Map<string, { items: string[]; groups: string[] }>;

  constructor(
    containers: { name: string; items: string[]; groups: string[] }[],
    groups: Map<string, { items: string[]; groups: string[] }>,
  ) {
    this.#containers = containers;
    this.#groups = groups;
  }

  findLootContainer(pattern: RegExp | null = null): LootContainer[] {
    return this.#containers.flatMap((lootContainer) => {
      const m = matchLootTable(
        pattern,
        lootContainer.items,
        lootContainer.groups,
        this.#groups,
      );
      if (m) {
        return { name: lootContainer.name, ...m };
      } else {
        return [];
      }
    });
  }
}

function extractItems(items: RawLootItem[]): string[] {
  return items
    .filter((item): item is RawLootLootItem => "name" in item.$)
    .map((item) => item.$.name);
}

function extractGroups(items: RawLootItem[]): string[] {
  return items
    .filter((item): item is RawLootItemGroup => "group" in item.$)
    .map((item) => item.$.group);
}

function matchLootTable(
  pattern: RegExp | null,
  items: string[],
  groupRefs: string[],
  groupMap: Map<string, { items: string[]; groups: string[] }>,
): LootTable | null {
  const matchedItems: string[] = [];
  const matchedGroups: LootGroup[] = [];

  for (const item of items) {
    if (pattern === null || pattern.test(item)) {
      matchedItems.push(item);
    }
  }

  for (const groupName of groupRefs) {
    const group = groupMap.get(groupName);
    if (group) {
      const m = matchLootTable(pattern, group.items, group.groups, groupMap);
      if (m) {
        matchedGroups.push({ name: groupName, ...m });
      }
    }
  }

  if (matchedItems.length === 0 && matchedGroups.length === 0) {
    return null;
  }
  return { items: matchedItems, groups: matchedGroups };
}
