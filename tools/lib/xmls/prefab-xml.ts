import { parse as parseXml } from "@libs/xml";

interface RawPrefabXml {
  prefab: {
    // @libs/xml collapses a single repeated element into the bare object
    // instead of a one-element array, so accept either shape here.
    property: RawPrefabProperty | RawPrefabProperty[];
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

function looksLikeRawPrefabProperty(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  return "@name" in value || "@class" in value;
}

function isRawPrefabXml(value: unknown): value is RawPrefabXml {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const prefab = v["prefab"];
  if (typeof prefab !== "object" || prefab === null) return false;
  const property = (prefab as Record<string, unknown>)["property"];
  if (Array.isArray(property)) return true;
  return looksLikeRawPrefabProperty(property);
}

export async function parsePrefabXml(
  fileName: string,
): Promise<ParsedPrefabProperty[]> {
  const parsed = parseXml(await Deno.readTextFile(fileName));
  if (!isRawPrefabXml(parsed)) {
    throw new Error(`Unexpected structure in ${fileName}`);
  }
  const rawProps = parsed.prefab.property;
  const properties = Array.isArray(rawProps) ? rawProps : [rawProps];
  return properties.flatMap((p) => {
    if (isRawPrefabPropertyValue(p)) {
      return { name: p["@name"], value: p["@value"] };
    } else {
      return [];
    }
  });
}
