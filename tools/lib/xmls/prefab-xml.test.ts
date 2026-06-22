import { parsePrefabXml } from "./prefab-xml.ts";
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
});
