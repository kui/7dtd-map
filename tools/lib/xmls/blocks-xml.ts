import { parse as parseXml } from "@libs/xml";
import {
  buildArrayMapByEntries,
  requireNonnull,
  toArray,
  vanillaDir,
} from "../utils.ts";
import type { Materials } from "./materials-xml.ts";

const LOOTABLE_CLASS_NAMES = new Set([
  "Loot",
  "CarExplodeLoot",
  "SecureLoot",
  "CompositeTileEntity",
]);

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
  "@tool_category"?: string;
}

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
  tags: string[];
  prob: number | undefined;
  stickChance: number | undefined;
  toolCategory: string | undefined;
}

export type Harvest = {
  itemName: string;
  count: NumberRange;
  countExpected: number;
  prob: number;
  tags: string[];
  toolCategory: string | undefined;
};

function isRawBlocksXml(value: unknown): value is RawBlocksXml {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const blocks = v["blocks"];
  if (typeof blocks !== "object" || blocks === null) return false;
  return Array.isArray((blocks as Record<string, unknown>)["block"]);
}

/**
 * Nested `<property>` elements can wrap further `<property>` children
 * (e.g. a class container), so this shape recurses rather than being
 * modeled as a flat `RawBlockProperty[]`.
 */
interface RawNestedProperty {
  "@name"?: string;
  "@value"?: string;
  "@param1"?: string;
  property?: RawNestedProperty | RawNestedProperty[];
}

function extractProperties(raw: unknown[]): BlockProperties {
  const props: BlockProperties = {};

  function visit(elem: unknown) {
    if (typeof elem !== "object" || elem === null) return;
    const e = elem as RawNestedProperty;
    if (e["@name"] !== undefined) {
      props[e["@name"]] = {
        value: e["@value"] ?? "",
        param1: e["@param1"],
      };
    }
    for (const child of toArray(e.property)) {
      visit(child);
    }
  }

  for (const elem of raw) {
    visit(elem);
  }
  return props;
}

export async function loadBlocks(
  fileName = vanillaDir("Data", "Config", "blocks.xml"),
): Promise<Blocks> {
  const parsed = parseXml(await Deno.readTextFile(fileName));
  if (!isRawBlocksXml(parsed)) {
    throw new Error(`Unexpected structure in ${fileName}`);
  }
  const blocks = parsed.blocks.block.reduce<Map<BlockName, Block>>(
    (map, blockElement) => {
      const name = blockElement["@name"];
      const properties = extractProperties(toArray(blockElement.property));
      const drops = toArray(blockElement.drop).map<BlockDrop>((elem) => ({
        event: elem["@event"],
        name: elem["@name"],
        count: parseCount(elem["@count"]),
        tags: elem["@tag"]?.split(",").map((t) => t.trim()) ?? [],
        prob: elem["@prob"] ? parseFloat(elem["@prob"]) : undefined,
        stickChance: elem["@stick_chance"]
          ? parseFloat(elem["@stick_chance"])
          : undefined,
        toolCategory: elem["@tool_category"] ?? "",
      }));
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
  /**
   * Inverse index of the `DowngradeBlock` relation: for a given block,
   * lists the blocks that downgrade into it. For example, if `cntGunSafe`
   * downgrades to `cntGunSafeInsecure`, the map holds
   * `cntGunSafeInsecure -> [cntGunSafe]`.
   */
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

  all(): Block[] {
    return Array.from(this.#blocks.values());
  }

  find(predicate: (block: Block) => boolean): Block[] {
    return this.all()
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

  getHarvestsByBlock(block: Block, untilDestroy = true): Harvest[] {
    return this.getDropsExtended(block).filter((drop) =>
      (drop.event === "Harvest" ||
        (untilDestroy && drop.event === "Destroy")) &&
      drop.count[1] !== 0 && drop.prob !== 0
    ).map((harvest) => {
      if (harvest.name === undefined) {
        throw new Error(`Harvest drop without name: ${block.name}`);
      }
      const prob = harvest.prob ?? 1;
      const countExpected = ((harvest.count[0] + harvest.count[1]) / 2) * prob;
      return {
        itemName: harvest.name,
        count: harvest.count,
        countExpected,
        prob,
        tags: harvest.tags,
        toolCategory: harvest.toolCategory,
      };
    });
  }

  getHarvests(untilDestroy = true): Map<Block, Harvest[]> {
    return this.all().reduce((acc, block) => {
      acc.set(block, this.getHarvestsByBlock(block, untilDestroy));
      return acc;
    }, new Map<Block, Harvest[]>());
  }

  getHarvestsWithMaxDamage(
    materials: Materials,
  ): (Harvest & {
    blockName: string;
    damage: number;
    countPerDamage: number;
  })[] {
    return this.all().flatMap((block) => {
      const damage = this.getMaxDamage(block, materials);
      if (damage === null) return [];
      return this.getHarvestsByBlock(block).map((drop) => ({
        ...drop,
        blockName: block.name,
        damage,
        countPerDamage: drop.countExpected / damage,
      }));
    }).toSorted((a, b) => b.countPerDamage - a.countPerDamage);
  }
}

export function parseCount(count: string): NumberRange {
  const [min, max] = count.split("-").map((s) => parseInt(s, 10));
  if (min === undefined || isNaN(min) || (max !== undefined && isNaN(max))) {
    throw new Error(`Invalid count: ${count}`);
  }
  return max === undefined ? [min, min] : [min, max];
}
