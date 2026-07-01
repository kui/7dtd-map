import { parsePrefabXml } from "../lib/xmls/prefab-xml.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

async function withTempXml<T>(
  body: string,
  fn: (file: string) => Promise<T>,
): Promise<T> {
  const file = await Deno.makeTempFile({ suffix: ".xml" });
  try {
    await Deno.writeTextFile(file, body);
    return await fn(file);
  } finally {
    await Deno.remove(file);
  }
}

describe("parsePrefabXml", () => {
  it("parses a prefab with exactly one <property> element", async () => {
    // Regression: @libs/xml represents a single repeated child as a bare
    // object, not a 1-element array. The parser must handle both shapes.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prefab>
  <property name="DifficultyTier" value="3" />
</prefab>`;
    const props = await withTempXml(xml, parsePrefabXml);
    expect(props).toEqual([{ name: "DifficultyTier", value: "3" }]);
  });

  it("parses a prefab with multiple <property> elements", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prefab>
  <property name="DifficultyTier" value="3" />
  <property name="Zoning" value="commercial" />
</prefab>`;
    const props = await withTempXml(xml, parsePrefabXml);
    expect(props).toEqual([
      { name: "DifficultyTier", value: "3" },
      { name: "Zoning", value: "commercial" },
    ]);
  });

  it("throws when a <property> is neither a value nor a class", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prefab>
  <property name="DifficultyTier" value="3" />
  <property foo="bar" />
</prefab>`;
    await expect(withTempXml(xml, parsePrefabXml)).rejects.toThrow(
      /Unexpected <property> entry/,
    );
  });

  it("parses nested <property class=…> containers recursively", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<prefab>
  <property name="DifficultyTier" value="3" />
  <property class="Stats">
    <property name="TotalVertices" value="280910" />
    <property class="BlockEntities">
      <property name="Vertices" value="231271" />
    </property>
  </property>
</prefab>`;
    const props = await withTempXml(xml, parsePrefabXml);
    expect(props).toEqual([
      { name: "DifficultyTier", value: "3" },
      {
        className: "Stats",
        properties: [
          { name: "TotalVertices", value: "280910" },
          {
            className: "BlockEntities",
            properties: [{ name: "Vertices", value: "231271" }],
          },
        ],
      },
    ]);
  });
});
