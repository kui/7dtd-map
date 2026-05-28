import { parse as parseXml } from "@libs/xml";

interface RawPrefabXml {
  prefab: {
    property: RawPrefabProperty[];
  };
}

type RawPrefabProperty = RawPrefabPropertyValue | RawPrefabClassProperty;

interface RawPrefabPropertyValue {
  "@name": string;
  "@value": string;
}

interface RawPrefabClassProperty {
  "@class": string;
  property: { "@name": string; "@value": string }[];
}

export interface ParsedPrefabProperty {
  name: string;
  value: string;
}

function isRawPrefabPropertyValue(
  p: RawPrefabProperty,
): p is RawPrefabPropertyValue {
  return "@name" in p;
}

function isRawPrefabXml(value: unknown): value is RawPrefabXml {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const prefab = v["prefab"];
  if (typeof prefab !== "object" || prefab === null) return false;
  return Array.isArray((prefab as Record<string, unknown>)["property"]);
}

export async function parsePrefabXml(
  fileName: string,
): Promise<ParsedPrefabProperty[]> {
  const parsed = parseXml(await Deno.readTextFile(fileName));
  if (!isRawPrefabXml(parsed)) {
    throw new Error(`Unexpected structure in ${fileName}`);
  }
  return parsed.prefab.property.flatMap((p) => {
    if (isRawPrefabPropertyValue(p)) {
      return { name: p["@name"], value: p["@value"] };
    } else {
      return [];
    }
  });
}
