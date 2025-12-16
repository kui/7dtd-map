import { parseXml } from "./xml-parser.ts";

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

export class Loot {
  lootXmlReading: Promise<LootXml>;

  constructor(lootXmlFileName: string) {
    this.lootXmlReading = parseXml<LootXml>(lootXmlFileName);
  }

  async findLootContainer(pattern: RegExp | null = null): Promise<LootContainer[]> {
    const lootXml = await this.lootXmlReading;
    const groups = lootXml.lootcontainers.lootgroup.reduce<Map<string, LootXmlItem[]>>((map, g) => {
      if (g.item) map.set(g.$.name, g.item);
      return map;
    }, new Map());

    return lootXml.lootcontainers.lootcontainer.flatMap((lootContainer) => {
      const m = matchLootTable(pattern, lootContainer.item ?? [], groups);
      if (m) {
        return { name: lootContainer.$.name, ...m };
      } else {
        return [];
      }
    });
  }
}

function matchLootTable(
  pattern: RegExp | null,
  items: LootXmlItem[],
  groups: Map<string, LootXmlItem[]>,
): LootTable | null {
  const matchedItems: string[] = [];
  const matchedGroups: LootGroup[] = [];

  for (const item of items) {
    if ("name" in item.$) {
      const itemName = item.$.name;
      if (pattern === null || pattern.test(itemName)) {
        matchedItems.push(itemName);
      }
    } else {
      const groupName = item.$.group;
      const group = groups.get(groupName);
      if (group) {
        const m = matchLootTable(pattern, group, groups);
        if (m) {
          matchedGroups.push({ name: groupName, ...m });
        }
      }
    }
  }

  if (matchedItems.length === 0 && matchedGroups.length === 0) {
    return null;
  }
  return { items: matchedItems, groups: matchedGroups };
}
