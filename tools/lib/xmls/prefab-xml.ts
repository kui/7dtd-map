import { parse as parseXml } from "@libs/xml";

interface RawPrefabXml {
  prefab: {
    // @libs/xml collapses a single repeated element into the bare object
    // instead of a one-element array, so accept either shape here.
    property: RawPrefabProperty | RawPrefabProperty[];
  };
}

type RawPrefabProperty = RawPrefabPropertyValue | RawPrefabPropertyClass;

interface RawPrefabPropertyValue {
  "@name": string;
  "@value": string;
}

// Class containers may nest other classes (e.g. `Stats > BlockEntities`), so
// the child `property` field carries the same recursive shape.
interface RawPrefabPropertyClass {
  "@class": string;
  property?: RawPrefabProperty | RawPrefabProperty[];
}

export interface ParsedPrefabPropertyValue {
  name: string;
  value: string;
}

export interface ParsedPrefabPropertyClass {
  className: string;
  properties: ParsedPrefabProperty[];
}

// A single `<property>` element from a prefab xml — either a `name`/`value`
// pair or a class container whose body holds more entries of the same shape.
export type ParsedPrefabProperty =
  | ParsedPrefabPropertyValue
  | ParsedPrefabPropertyClass;

function isRawValue(p: RawPrefabProperty): p is RawPrefabPropertyValue {
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

function toEntry(raw: RawPrefabProperty): ParsedPrefabProperty {
  if (isRawValue(raw)) return { name: raw["@name"], value: raw["@value"] };
  const inner = raw.property;
  const list = inner === undefined
    ? []
    : Array.isArray(inner)
    ? inner
    : [inner];
  return {
    className: raw["@class"],
    properties: list.filter(looksLikeRawPrefabProperty).map(toEntry),
  };
}

export async function parsePrefabXml(
  fileName: string,
): Promise<ParsedPrefabProperty[]> {
  const parsed = parseXml(await Deno.readTextFile(fileName));
  if (!isRawPrefabXml(parsed)) {
    throw new Error(`Unexpected structure in ${fileName}`);
  }
  const raw = parsed.prefab.property;
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(toEntry);
}

// Narrowing helpers — exported so call sites can drop into the value variant
// without spelling the type guard each time.
export function isPrefabPropertyValue(
  p: ParsedPrefabProperty,
): p is ParsedPrefabPropertyValue {
  return "name" in p;
}

export function isPrefabPropertyClass(
  p: ParsedPrefabProperty,
): p is ParsedPrefabPropertyClass {
  return "className" in p;
}
