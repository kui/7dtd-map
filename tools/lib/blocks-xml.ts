import { parseXml } from "./xml-parser";

export interface Block {
  name: string;
  properties: BlockProperties;
}

export interface BlockProperties {
  [name: string]: BlockPropertyValue;
}

export interface BlockPropertyValue {
  value: string;
  param1?: string;
}

const LOOT_CLASS_NAMES = new Set(["Loot", "CarExplodeLoot", "SecureLoot"]);

export async function loadBlocks(blocksXmlFileName: string): Promise<Blocks> {
  const xml = await parseXml<BlockXml>(blocksXmlFileName);
  const blocks = xml.blocks.block.reduce<Map<string, Block>>((map, blockElement) => {
    map.set(blockElement.$.name, {
      name: blockElement.$.name,
      properties: buildProperties(blockElement.property),
    });
    return map;
  }, new Map());
  return new Blocks(blocks);
}

export class Blocks {
  blocks: Map<string, Block>;

  constructor(blocks: Map<string, Block>) {
    this.blocks = blocks;
  }

  find(predicate: (block: Block) => boolean): Block[] {
    return Array.from(this.blocks.values()).filter((b) => predicate(b));
  }

  findByLootIds(lootContainerIds: Set<string>): Block[] {
    return this.find((b) => {
      const blockClass = getPropertyExtended(this, b, "Class")?.value ?? "";
      if (!LOOT_CLASS_NAMES.has(blockClass)) return false;
      const lootId = getPropertyExtended(this, b, "LootList")?.value;
      if (!lootId) return false;
      //console.log(b.name, lootId);
      return lootContainerIds.has(lootId);
    });
  }
}

function buildProperties(propertyElements: BlockXmlBlockProperty[]): BlockProperties {
  return propertyElements.reduce<BlockProperties>((props, elem) => {
    props[elem.$.name] = elem.$;
    return props;
  }, {});
}

function getPropertyExtended(self: Blocks, block: Block, propertyName: string): BlockPropertyValue | null {
  const p = block.properties[propertyName];
  if (p) return p;

  const extendsProp = block.properties["Extends"];
  if (!extendsProp) return null;

  const excludedPropNames = extendsProp.param1?.split(",").map((p) => p.trim()) ?? [];
  if (excludedPropNames.includes(propertyName)) return null;

  const parent = self.blocks.get(extendsProp.value);
  if (!parent) {
    console.warn("Unknown parent block: %d", extendsProp.value);
    return null;
  }

  return getPropertyExtended(self, parent, propertyName);
}
