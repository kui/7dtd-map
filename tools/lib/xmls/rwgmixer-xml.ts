import { parse as parseXml } from "@libs/xml";

export interface District {
  name: string;
  // RGB triplet in 0–1 floats as written in rwgmixer.xml.
  previewColor: [number, number, number] | null;
}

interface RawProperty {
  "@name": string;
  "@value": string;
}

interface RawDistrict {
  "@name": string;
  property?: RawProperty | RawProperty[];
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function parsePreviewColor(raw: string): [number, number, number] | null {
  const parts = raw.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [r, g, b] = parts;
  return [r, g, b];
}

// rwgmixer.xml lists districts as `<district name="X">…<property name="preview_color"
// value="r,g,b"/>…</district>` siblings under the root `<rwgmixer>` element.
// Districts without a preview_color are still returned with previewColor=null
// so callers can decide whether to fall back to a default.
export async function parseRwgmixerXml(
  fileName: string,
): Promise<District[]> {
  const parsed = parseXml(await Deno.readTextFile(fileName)) as {
    rwgmixer?: { district?: RawDistrict | RawDistrict[] };
  };
  const rawDistricts = asArray(parsed.rwgmixer?.district);
  return rawDistricts.flatMap<District>((d) => {
    const name = d["@name"];
    if (!name) return [];
    const props = asArray(d.property);
    const colorProp = props.find((p) => p["@name"] === "preview_color");
    const previewColor = colorProp
      ? parsePreviewColor(colorProp["@value"])
      : null;
    return { name, previewColor };
  });
}
