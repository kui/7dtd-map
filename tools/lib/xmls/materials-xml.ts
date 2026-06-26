import { parse as parseXml } from "@libs/xml";
import { vanillaDir } from "../utils.ts";

const MATERIALS_XML = vanillaDir("Data", "Config", "materials.xml");

/* Raw XML types (encapsulated) */

interface RawMaterialsXml {
  materials: {
    material: RawMaterial[];
  };
}

interface RawMaterial {
  "@id": string;
  property: RawMaterialProperty[];
}

interface RawMaterialProperty {
  "@name": string;
  "@value": string;
}

/* Public types */

export interface Material {
  id: string;
  properties: Record<string, string>;
}

function isRawMaterialsXml(value: unknown): value is RawMaterialsXml {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const materials = v["materials"];
  if (typeof materials !== "object" || materials === null) return false;
  return Array.isArray((materials as Record<string, unknown>)["material"]);
}

/* Public API */

export async function loadMaterials(
  materialsXmlFileName: string = MATERIALS_XML,
): Promise<Materials> {
  const parsed = parseXml(await Deno.readTextFile(materialsXmlFileName));
  if (!isRawMaterialsXml(parsed)) {
    throw new Error(`Unexpected structure in ${materialsXmlFileName}`);
  }
  const materials = parsed.materials.material.map((materialElement) => {
    const id = materialElement["@id"];
    const properties = materialElement.property.reduce<Record<string, string>>(
      (map, property) => {
        map[property["@name"]] = property["@value"];
        return map;
      },
      {},
    );
    return { id, properties };
  });
  return new Materials(materials);
}

export class Materials {
  #materials: Material[];

  constructor(materials: Material[]) {
    this.#materials = materials;
  }

  findAll(predicate: (material: Material) => boolean): Material[] {
    return this.#materials.filter(predicate);
  }

  findById(id: string): Material | undefined {
    return this.#materials.find((m) => m.id === id);
  }
}
