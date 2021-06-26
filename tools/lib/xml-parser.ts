import { promises as fs } from "fs";
import { parseString as parseXmlString } from "xml2js";

export async function parseXml<T>(xmlFileName: string): Promise<T> {
  const xml = await fs.readFile(xmlFileName);
  return new Promise((resolve, reject) => {
    parseXmlString(xml, (err, result) => {
      if (err) reject(err);
      if (result) resolve(result);
      reject(Error("Unexpected state"));
    });
  });
}

export interface BlockXml {
  blocks: {
    block: {
      $: { name: string };
    }[];
  };
}

type LootGroupName = string;

export interface LootXml {
  lootcontainers: {
    lootgroup: {
      $: { name: LootGroupName };
      item?: LootXmlItem[];
    }[];
    lootcontainer: {
      $: { id: string };
      item?: LootXmlItem[];
    }[];
  };
}

type LootXmlItem = LootXmlItemGroup | LootXmlLootItem;

export interface LootXmlItemGroup {
  $: { group: LootGroupName };
}

export interface LootXmlLootItem {
  $: { name: string };
}
