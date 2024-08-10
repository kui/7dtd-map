// blocks.xml

interface BlockXml {
  blocks: {
    block: BlockXmlBlock[];
  };
}

interface BlockXmlBlock {
  $: { name: string };
  property: BlockXmlBlockProperty[];
  dropextendsoff?: object[];
  drop?: BlockXmlBlockDrop[];
}

interface BlockXmlBlockProperty {
  $: {
    name: string;
    value: string;
    param1?: string;
  };
}

interface BlockXmlBlockDrop {
  $: {
    event: string;
    name: string;
    count: string;
    tag?: string;
    prob?: string;
    stick_chance?: string;
  };
}

// loot.xml

interface LootXml {
  lootcontainers: {
    lootgroup: {
      $: { name: LootGroupName };
      item?: LootXmlItem[];
    }[];
    lootcontainer: {
      $: { name: string };
      item?: LootXmlItem[];
    }[];
  };
}

type LootGroupName = string;
type LootXmlItem = LootXmlItemGroup | LootXmlLootItem;

interface LootXmlItemGroup {
  $: { group: LootGroupName };
}

interface LootXmlLootItem {
  $: { name: string };
}

// materials.xml

interface MaterialsXml {
  materials: {
    material: MaterialsXmlMaterial[];
  };
}

interface MaterialsXmlMaterial {
  $: { id: string };
  property: MaterialsXmlMaterialProperty[];
}

interface MaterialsXmlMaterialProperty {
  $: { name: string; value: string };
}
