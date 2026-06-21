import { assertDifficultyIndex, type DifficultyIndex } from "../lib/prefabs.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

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
