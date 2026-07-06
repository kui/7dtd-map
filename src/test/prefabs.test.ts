import {
  assertDifficultyIndex,
  decorationToPrefab,
  type DifficultyIndex,
} from "../lib/prefabs.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

// Stand-in for a <decoration> element: decorationToPrefab only reads
// getAttribute, so a plain attribute map is enough to exercise both the
// v2.x (y_is_groundlevel) and legacy attribute systems without a DOM.
function decoration(attrs: Record<string, string>) {
  return { getAttribute: (name: string) => attrs[name] ?? null };
}

describe("decorationToPrefab", () => {
  it("reads x/z/rotation from a decoration", () => {
    expect(
      decorationToPrefab(decoration({
        name: "house_01",
        position: "10,44,-20",
        rotation: "2",
      })),
    ).toEqual({ name: "house_01", x: 10, z: -20, rotation: 2, y: 44 });
  });

  it("keeps y as ground level and flags v2.x groundlevel decorations", () => {
    expect(
      decorationToPrefab(decoration({
        name: "quarry_02",
        position: "-650,44,-206",
        rotation: "0",
        y_is_groundlevel: "true",
      })),
    ).toEqual({
      name: "quarry_02",
      x: -650,
      z: -206,
      rotation: 0,
      y: 44,
      yIsGroundLevel: true,
    });
  });

  it("omits yIsGroundLevel for legacy decorations without the attribute", () => {
    const prefab = decorationToPrefab(decoration({
      name: "old_poi",
      position: "5,30,7",
    }));
    expect(prefab).toEqual({ name: "old_poi", x: 5, z: 7, rotation: 0, y: 30 });
    expect(prefab && "yIsGroundLevel" in prefab).toBe(false);
  });

  it("wraps rotation into 0..3", () => {
    expect(
      decorationToPrefab(
        decoration({ name: "p", position: "0,0,0", rotation: "5" }),
      )
        ?.rotation,
    ).toBe(1);
  });

  it("skips decorations that are not placed prefabs (no name or position)", () => {
    expect(decorationToPrefab(decoration({ position: "1,2,3" }))).toBeNull();
    expect(decorationToPrefab(decoration({ name: "p" }))).toBeNull();
  });

  it("throws on a position that is not three finite numbers", () => {
    for (const position of ["1,2", "1,2,3,4", "10,,20", "10,x,20"]) {
      expect(() => decorationToPrefab(decoration({ name: "p", position })))
        .toThrow(/Invalid decoration position/);
    }
  });
});

describe("assertDifficultyIndex", () => {
  it("accepts the inclusive lower bound 0", () => {
    expect(() => {
      assertDifficultyIndex(0);
    }).not.toThrow();
  });

  it("accepts the inclusive upper bound 5", () => {
    expect(() => {
      assertDifficultyIndex(5);
    }).not.toThrow();
  });

  it("accepts every value in 0..5", () => {
    for (let i = 0; i <= 5; i++) {
      expect(() => {
        assertDifficultyIndex(i);
      }).not.toThrow();
    }
  });

  it("rejects negative values", () => {
    expect(() => {
      assertDifficultyIndex(-1);
    }).toThrow(RangeError);
  });

  it("rejects values above 5", () => {
    expect(() => {
      assertDifficultyIndex(6);
    }).toThrow(RangeError);
  });

  it("rejects NaN", () => {
    expect(() => {
      assertDifficultyIndex(Number.NaN);
    }).toThrow(RangeError);
  });

  it("rejects non-integers", () => {
    expect(() => {
      assertDifficultyIndex(1.5);
    }).toThrow(RangeError);
  });

  it("narrows the input type when it returns", () => {
    const i: number = 3;
    assertDifficultyIndex(i);
    const narrowed: DifficultyIndex = i;
    expect(narrowed).toBe(3);
  });
});
