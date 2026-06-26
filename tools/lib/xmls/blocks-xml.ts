import { parse as parseXml } from "@libs/xml";
import {
  buildArrayMapByEntries,
  requireNonnull,
  vanillaDir,
} from "../utils.ts";
import type { Materials } from "./materials-xml.ts";

const LOOTABLE_CLASS_NAMES = new Set(["Loot", "CarExplodeLoot", "SecureLoot"]);

/* Raw XML types (encapsulated) */

interface RawBlocksXml {
  blocks: {
    block: RawBlock[];
  };
}

interface RawBlock {
  "@name": string;
  property: RawBlockProperty[];
  dropextendsoff?: object[];
  drop?: RawBlockDrop[];
}

interface RawBlockProperty {
  "@name": string;
  "@value": string;
  "@param1"?: string;
}

interface RawBlockDrop {
  "@event": string;
  "@name": string;
  "@count": string;
  "@tag"?: string;
  "@prob"?: string;
  "@stick_chance"?: string;
}

/* Public types */

export type BlockName = string;

export interface Block {
  name: BlockName;
  properties: BlockProperties;
  drops: BlockDrop[];
  disableDropExtends: boolean;
}

export type BlockProperties = Record<string, BlockPropertyValue | undefined>;

export interface BlockPropertyValue {
  value: string;
  param1?: string;
}

export type DowngradeGraph = Block[];

export type NumberRange = [number, number];

export interface BlockDrop {
  event: string;
  name: string | undefined;
  count: NumberRange;
  tag: string[];
  prob: number | undefined;
  stickChance: number | undefined;
}

export interface HarvestItems {
  [itenName: string]: {
    name: string;
    count: NumberRange;
    countExpected: number;
    prob: number;
  };
}

function isRawBlocksXml(value: unknown): value is RawBlocksXml {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const blocks = v["blocks"];
  if (typeof blocks !== "object" || blocks === null) return false;
  return Array.isArray((blocks as Record<string, unknown>)["block"]);
}

/* Public API */

export async function loadBlocks(
  blocksXmlFileName?: string,
): Promise<Blocks> {
  const fileName = blocksXmlFileName ??
    vanillaDir("Data", "Config", "blocks.xml");
  const parsed = parseXml(await Deno.readTextFile(fileName));
  if (!isRawBlocksXml(parsed)) {
    throw new Error(`Unexpected structure in ${fileName}`);
  }
  const blocks = parsed.blocks.block.reduce<Map<BlockName, Block>>(
    (map, blockElement) => {
      const name = blockElement["@name"];
      const properties = blockElement.property.reduce<BlockProperties>(
        (props, elem) => {
          props[elem["@name"]] = {
            value: elem["@value"],
            param1: elem["@param1"],
          };
          return props;
        },
        {},
      );
      const drops = blockElement.drop
        ? blockElement.drop.map<BlockDrop>((elem) => ({
          event: elem["@event"],
          name: elem["@name"],
          count: parseCount(elem["@count"]),
          tag: elem["@tag"]?.split(",") ?? [],
          prob: elem["@prob"] ? parseFloat(elem["@prob"]) : undefined,
          stickChance: elem["@stick_chance"]
            ? parseFloat(elem["@stick_chance"])
            : undefined,
        }))
        : [];
      const enableDropExtendsOff = blockElement.dropextendsoff !== undefined;
      map.set(name, {
        name,
        properties,
        drops,
        disableDropExtends: enableDropExtendsOff,
      });
      return map;
    },
    new Map(),
  );
  return new Blocks(blocks);
}

export class Blocks {
  #blocks: Map<BlockName, Block>;
  // The downgrading of the value block results in the key blocks
  // e.g. key=cntGunSafeInsecure, value=[cntGunCafe] if cntGunSafe can be downgraded to cntGunSafeInsecure
  #downgradeRelations: Map<Block, Block[]>;

  constructor(blocks: Map<BlockName, Block>) {
    this.#blocks = blocks;
    this.#downgradeRelations = buildArrayMapByEntries(
      Array.from(this.#blocks.values()).flatMap((b: Block) => {
        const downgradedBlockName = b.properties["DowngradeBlock"]?.value
          .trim();
        if (!downgradedBlockName) return [];
        const downgradedBlock = blocks.get(downgradedBlockName);
        if (!downgradedBlock) return [];
        return [[downgradedBlock, b]];
      }),
    );
  }

  find(predicate: (block: Block) => boolean): Block[] {
    return Array.from(this.#blocks.values())
      .filter((b) => {
        const creativeMode = this.getPropertyExtended(b, "CreativeMode")?.value;
        return !creativeMode || creativeMode !== "None";
      })
      .filter((b) => predicate(b));
  }

  findByLootIds(lootContainerIds: Set<string>): Block[] {
    return this.find((b) => {
      const blockClass = this.getPropertyExtended(b, "Class")?.value ?? "";
      if (!LOOTABLE_CLASS_NAMES.has(blockClass)) return false;
      const lootId = this.getPropertyExtended(b, "LootList")?.value;
      if (!lootId) return false;
      return lootContainerIds.has(lootId);
    });
  }

  findByDowngradeBlocks(graphs: DowngradeGraph): DowngradeGraph[] {
    const upgradBlocks = this.#downgradeRelations.get(
      requireNonnull(graphs[0], () => "DowngradeGraph must not be empty"),
    );
    if (upgradBlocks) {
      return upgradBlocks.flatMap((b) =>
        this.findByDowngradeBlocks([b, ...graphs])
      );
    } else {
      return [graphs];
    }
  }

  getPropertyExtended(
    block: Block,
    propertyName: string,
  ): BlockPropertyValue | null {
    const p = block.properties[propertyName];
    if (p) return p;

    const extendsProp = block.properties["Extends"];
    if (!extendsProp) return null;

    const excludedPropNames =
      extendsProp.param1?.split(",").map((p) => p.trim()) ?? [];
    if (excludedPropNames.includes(propertyName)) return null;

    const parent = this.#blocks.get(extendsProp.value);
    if (!parent) {
      throw new Error(
        `Unknown parent block ${extendsProp.value} for ${block.name}`,
      );
    }

    return this.getPropertyExtended(parent, propertyName);
  }

  getMaxDamage(block: Block, materials: Materials): number | null {
    const damage = this.getPropertyExtended(block, "MaxDamage")?.value;
    if (damage) return parseInt(damage, 10);

    const materialId = this.getPropertyExtended(block, "Material")?.value;
    if (!materialId) return null;

    const material = materials.findById(materialId);
    const materialDamage = material?.properties["MaxDamage"];
    return materialDamage ? parseInt(materialDamage, 10) : null;
  }

  getDropsExtended(block: Block): BlockDrop[] {
    const drops = block.drops;
    if (drops.length > 0) return drops;
    if (block.disableDropExtends) return [];
    const extendsProp = block.properties["Extends"];
    if (!extendsProp) return [];
    const parent = this.#blocks.get(extendsProp.value);
    if (!parent) {
      throw new Error(
        `Unknown parent block ${extendsProp.value} for ${block.name}`,
      );
    }
    return this.getDropsExtended(parent);
  }

  getHarvests(block: Block, untilDestroy = true): HarvestItems {
    const drops = this.getDropsExtended(block);
    const harvests = drops.filter((drop) =>
      drop.event === "Harvest" || (untilDestroy && drop.event === "Destroy")
    );
    const items: HarvestItems = {};
    for (const harvest of harvests) {
      if (harvest.count[1] === 0) continue;
      if (harvest.prob === 0) continue;
      if (harvest.name === undefined) {
        throw new Error(`Harvest drop without name: ${block.name}`);
      }
      const prob = harvest.prob ?? 1;
      const countExpected = ((harvest.count[0] + harvest.count[1]) / 2) * prob;
      const oldCount = items[harvest.name]?.count;
      const oldCountExpected = items[harvest.name]?.countExpected;
      items[harvest.name] = {
        name: harvest.name,
        count: oldCount
          ? [
            Math.min(oldCount[0], harvest.count[0]),
            oldCount[1] + harvest.count[1],
          ]
          : harvest.count,
        countExpected: oldCountExpected
          ? oldCountExpected + countExpected
          : countExpected,
        prob,
      };
    }
    return items;
  }
}

export function parseCount(count: string): NumberRange {
  const [min, max] = count.split("-").map((s) => parseInt(s, 10));
  if (min === undefined || isNaN(min) || (max !== undefined && isNaN(max))) {
    throw new Error(`Invalid count: ${count}`);
  }
  return max === undefined ? [min, min] : [min, max];
}
