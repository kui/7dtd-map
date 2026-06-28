import { parse as parseXml } from "@libs/xml";
import { toArray, vanillaDir } from "../utils.ts";

const LOOT_XML = vanillaDir("Data", "Config", "loot.xml");

/* Raw XML types (encapsulated) */

type LootGroupName = string;

interface RawLootXml {
  lootcontainers: {
    lootgroup: RawLootGroup[];
    lootcontainer: RawLootContainer[];
  };
}

interface RawLootGroup {
  "@name": LootGroupName;
  item?: RawLootItem[];
}

interface RawLootContainer {
  "@name": string;
  item?: RawLootItem[];
}

type RawLootItem = RawLootItemGroup | RawLootLootItem;

interface RawLootItemGroup {
  "@group": LootGroupName;
}

interface RawLootLootItem {
  "@name": string;
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

function isRawLootXml(value: unknown): value is RawLootXml {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const containers = v["lootcontainers"];
  if (typeof containers !== "object" || containers === null) return false;
  const c = containers as Record<string, unknown>;
  return Array.isArray(c["lootgroup"]) && Array.isArray(c["lootcontainer"]);
}

/* Public API */

export async function loadLoot(
  lootXmlFileName: string = LOOT_XML,
): Promise<Loot> {
  const parsed = parseXml(await Deno.readTextFile(lootXmlFileName));
  if (!isRawLootXml(parsed)) {
    throw new Error(`Unexpected structure in ${lootXmlFileName}`);
  }
  const groups = new Map<string, { items: string[]; groups: string[] }>();
  for (const g of parsed.lootcontainers.lootgroup) {
    groups.set(g["@name"], {
      items: extractItems(toArray(g.item)),
      groups: extractGroups(toArray(g.item)),
    });
  }
  const containers = parsed.lootcontainers.lootcontainer.map((c) => ({
    name: c["@name"],
    items: extractItems(toArray(c.item)),
    groups: extractGroups(toArray(c.item)),
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
    .filter((item): item is RawLootLootItem => "@name" in item)
    .map((item) => item["@name"]);
}

function extractGroups(items: RawLootItem[]): string[] {
  return items
    .filter((item): item is RawLootItemGroup => "@group" in item)
    .map((item) => item["@group"]);
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
