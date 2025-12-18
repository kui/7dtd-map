import { parseXml } from "./xml-parser.ts";

export interface Material {
  id: string;
  properties: Record<string, string>;
}

export async function loadMaterials(materialsXmlFileName: string): Promise<Materials> {
  const xml = await parseXml<MaterialsXml>(materialsXmlFileName);
  const materials = xml.materials.material.map((materialElement) => {
    const id = materialElement.$.id;
    const properties = buildProperties(materialElement.property);
    return { id, properties };
  });
  return new Materials(materials);
}

export class Materials {
  #materials: Material[];

  constructor(materials: Material[]) {
    this.#materials = materials;
  }

  find(predicate: (material: Material) => boolean): Material[] {
    return this.#materials.filter(predicate);
  }

  findById(id: string): Material | undefined {
    return this.#materials.find((m) => m.id === id);
  }
}

function buildProperties(properties: MaterialsXmlMaterialProperty[]): Record<string, string> {
  return properties.reduce<Record<string, string>>((map, property) => {
    map[property.$.name] = property.$.value;
    return map;
  }, {});
}
