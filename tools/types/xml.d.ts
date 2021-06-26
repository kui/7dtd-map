interface BlockXml {
  blocks: {
    block: BlockXmlBlock[];
  };
}

interface BlockXmlBlock {
  $: { name: string };
  property: BlockXmlBlockProperty[];
}

interface BlockXmlBlockProperty {
  $: {
    name: string;
    value: string;
    param1?: string;
  };
}

type LootGroupName = string;

interface LootXml {
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

interface LootXmlItemGroup {
  $: { group: LootGroupName };
}

interface LootXmlLootItem {
  $: { name: string };
}
