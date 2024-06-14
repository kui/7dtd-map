import { buildArrayMapByEntries, requireNonnull } from "./utils";
import { parseXml } from "./xml-parser";

export type BlockName = string;

export interface Block {
  name: BlockName;
  properties: BlockProperties;
}

export type BlockProperties = Record<string, BlockPropertyValue | undefined>;

export interface BlockPropertyValue {
  value: string;
  param1?: string;
}

export type DowngradeGraph = Block[];

const LOOT_CLASS_NAMES = new Set(["Loot", "CarExplodeLoot", "SecureLoot"]);

export async function loadBlocks(blocksXmlFileName: string): Promise<Blocks> {
  const xml = await parseXml<BlockXml>(blocksXmlFileName);
  const blocks = xml.blocks.block.reduce<Map<BlockName, Block>>((map, blockElement) => {
    const name = blockElement.$.name;
    const properties = buildProperties(blockElement.property);
    map.set(name, { name, properties });
    return map;
  }, new Map());
  return new Blocks(blocks);
}

export class Blocks {
  private blocks: Map<BlockName, Block>;
  // The downgrading of the value block results in the key blocks
  // e.g. key=cntGunSafeInsecure, value=[cntGunCafe] if cntGunSafe can be downgraded to cntGunSafeInsecure
  private downgradeRelations: Map<Block, Block[]>;

  constructor(blocks: Map<BlockName, Block>) {
    this.blocks = blocks;
    this.downgradeRelations = buildArrayMapByEntries(
      Array.from(this.blocks.values()).flatMap((b: Block) => {
        const downgradedBlockName = b.properties.DowngradeBlock?.value.trim();
        if (!downgradedBlockName) return [];
        const downgradedBlock = blocks.get(downgradedBlockName);
        if (!downgradedBlock) return [];
        return [[downgradedBlock, b]];
      })
    );
  }

  find(predicate: (block: Block) => boolean): Block[] {
    return Array.from(this.blocks.values())
      .filter((b) => {
        const creativeMode = this.getPropertyExtended(b, "CreativeMode")?.value;
        return !creativeMode || creativeMode !== "None";
      })
      .filter((b) => predicate(b));
  }

  findByLootIds(lootContainerIds: Set<string>): Block[] {
    return this.find((b) => {
      const blockClass = this.getPropertyExtended(b, "Class")?.value ?? "";
      if (!LOOT_CLASS_NAMES.has(blockClass)) return false;
      const lootId = this.getPropertyExtended(b, "LootList")?.value;
      if (!lootId) return false;
      return lootContainerIds.has(lootId);
    });
  }

  findByDowngradeBlocks(graphs: DowngradeGraph): DowngradeGraph[] {
    const upgradBlocks = this.downgradeRelations.get(requireNonnull(graphs[0], "DowngradeGraph must not be empty"));
    if (upgradBlocks) {
      return upgradBlocks.flatMap((b) => this.findByDowngradeBlocks([b, ...graphs]));
    } else {
      return [graphs];
    }
  }

  private getPropertyExtended(block: Block, propertyName: string): BlockPropertyValue | null {
    const p = block.properties[propertyName];
    if (p) return p;

    const extendsProp = block.properties.Extends;
    if (!extendsProp) return null;

    const excludedPropNames = extendsProp.param1?.split(",").map((p) => p.trim()) ?? [];
    if (excludedPropNames.includes(propertyName)) return null;

    const parent = this.blocks.get(extendsProp.value);
    if (!parent) {
      console.warn("Unknown parent block: %d", extendsProp.value);
      return null;
    }

    return this.getPropertyExtended(parent, propertyName);
  }
}

function buildProperties(propertyElements: BlockXmlBlockProperty[]): BlockProperties {
  return propertyElements.reduce<BlockProperties>((props, elem) => {
    props[elem.$.name] = elem.$;
    return props;
  }, {});
}
