import { parseXml } from "./xml-parser.ts";

export interface PrefabProperty {
  name: string;
  value: string;
}

interface PrefabXml {
  prefab: {
    property: PrefabXmlProperty[];
  };
}

type PrefabXmlProperty = PrefabXmlPropertyValue | PrefabXmlClassProperty;

interface PrefabXmlPropertyValue {
  $: PrefabProperty;
}

interface PrefabXmlClassProperty {
  $: {
    class: string;
  };
  property: PrefabProperty[];
}

export async function parsePrefabXml(
  xmlFileName: string,
): Promise<PrefabProperty[]> {
  const xml = await parseXml<PrefabXml>(xmlFileName);
  return xml.prefab.property.flatMap((p) => {
    if ("name" in p.$) return p.$;
    else return [];
  });
}
