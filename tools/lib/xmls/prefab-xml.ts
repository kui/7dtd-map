import { parseXml } from "../xml-parser.ts";

interface RawPrefabXml {
  prefab: {
    property: RawPrefabProperty[];
  };
}

type RawPrefabProperty = RawPrefabPropertyValue | RawPrefabClassProperty;

interface RawPrefabPropertyValue {
  $: {
    name: string;
    value: string;
  };
}

interface RawPrefabClassProperty {
  $: {
    class: string;
  };
  property: { name: string; value: string }[];
}

export interface ParsedPrefabProperty {
  name: string;
  value: string;
}

export async function parsePrefabXml(
  fileName: string,
): Promise<ParsedPrefabProperty[]> {
  const xml = await parseXml(fileName) as RawPrefabXml;
  return xml.prefab.property.flatMap((p) => {
    if ("name" in p.$) return p.$;
    else return [];
  });
}
