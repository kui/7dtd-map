import { extractMeshSizes } from "../generate-prefab-properties-jsons.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

function prefab(props: Record<string, string>) {
  return Object.entries(props).map(([name, value]) => ({ name, value }));
}

describe("extractMeshSizes", () => {
  it("emits [x, z, y, yOffset] from PrefabSize and YOffset", () => {
    expect(
      extractMeshSizes({
        waterworks: prefab({ PrefabSize: "25, 22, 25", YOffset: "-13" }),
      }),
    ).toEqual({ waterworks: [25, 25, 22, -13] });
  });

  it("defaults yOffset to 0 when the property is absent", () => {
    expect(
      extractMeshSizes({ house: prefab({ PrefabSize: "10, 8, 12" }) }),
    ).toEqual({ house: [10, 12, 8, 0] });
  });

  it("throws on a non-integer YOffset", () => {
    expect(() =>
      extractMeshSizes({
        broken: prefab({ PrefabSize: "10, 8, 12", YOffset: "-1.5" }),
      })
    ).toThrow(/YOffset/);
  });

  it("skips prefabs without a PrefabSize", () => {
    expect(extractMeshSizes({ p: prefab({ DifficultyTier: "3" }) })).toEqual(
      {},
    );
  });

  it("skips prefabs with fewer than 3 size components", () => {
    expect(extractMeshSizes({ p: prefab({ PrefabSize: "10, 8" }) })).toEqual(
      {},
    );
  });

  it("skips prefabs with a non-positive footprint", () => {
    expect(extractMeshSizes({ p: prefab({ PrefabSize: "0, 8, 12" }) }))
      .toEqual({});
    expect(extractMeshSizes({ p: prefab({ PrefabSize: "10, 8, 0" }) }))
      .toEqual({});
  });

  it("sorts entries by prefab name", () => {
    const out = extractMeshSizes({
      zebra: prefab({ PrefabSize: "1, 1, 1" }),
      apple: prefab({ PrefabSize: "2, 2, 2" }),
    });
    expect(Object.keys(out)).toEqual(["apple", "zebra"]);
  });
});
