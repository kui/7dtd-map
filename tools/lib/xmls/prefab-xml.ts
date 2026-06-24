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

export interface ParsedPrefabClass {
  className: string;
  properties: ParsedPrefabProperty[];
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

// Variant that also returns nested `<property class="X">…</property>` blocks
// so callers can read e.g. the Stats class for DensityScore calculation.
export async function parsePrefabXmlWithClasses(
  fileName: string,
): Promise<{ values: ParsedPrefabProperty[]; classes: ParsedPrefabClass[] }> {
  const parsed = parseXml(await Deno.readTextFile(fileName));
  if (!isRawPrefabXml(parsed)) {
    throw new Error(`Unexpected structure in ${fileName}`);
  }
  const rawProps = parsed.prefab.property;
  const properties = Array.isArray(rawProps) ? rawProps : [rawProps];
  const values: ParsedPrefabProperty[] = [];
  const classes: ParsedPrefabClass[] = [];
  for (const p of properties) {
    if (isRawPrefabPropertyValue(p)) {
      values.push({ name: p["@name"], value: p["@value"] });
    } else {
      const inner = Array.isArray(p.property) ? p.property : [p.property];
      classes.push({
        className: p["@class"],
        properties: inner.flatMap((c) =>
          c && "@name" in c ? [{ name: c["@name"], value: c["@value"] }] : []
        ),
      });
    }
  }
  return { values, classes };
}
