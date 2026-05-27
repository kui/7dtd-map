import { parseXml } from "../xml-parser.ts";
import { vanillaDir } from "../utils.ts";

const MATERIALS_XML = await vanillaDir("Data", "Config", "materials.xml");

/* Raw XML types (encapsulated) */

interface RawMaterialsXml {
  materials: {
    material: RawMaterial[];
  };
}

interface RawMaterial {
  $: { id: string };
  property: RawMaterialProperty[];
}

interface RawMaterialProperty {
  $: { name: string; value: string };
}

/* Public types */

export interface Material {
  id: string;
  properties: Record<string, string>;
}

/* Public API */

export async function loadMaterials(
  materialsXmlFileName: string = MATERIALS_XML,
): Promise<Materials> {
  const xml = await parseXml(materialsXmlFileName) as RawMaterialsXml;
  const materials = xml.materials.material.map((materialElement) => {
    const id = materialElement.$.id;
    const properties = materialElement.property.reduce<Record<string, string>>(
      (map, property) => {
        map[property.$.name] = property.$.value;
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
