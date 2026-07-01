import { parseCount } from "../lib/xmls/blocks-xml.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("parseCount", () => {
  it("parses a single number as [n, n]", () => {
    expect(parseCount("5")).toEqual([5, 5]);
  });

  it("parses a min-max range", () => {
    expect(parseCount("3-5")).toEqual([3, 5]);
  });

  it("preserves max=0 instead of collapsing to [min, min]", () => {
    expect(parseCount("3-0")).toEqual([3, 0]);
  });

  it("parses 0-0 as [0, 0]", () => {
    expect(parseCount("0-0")).toEqual([0, 0]);
  });

  it("throws for non-numeric input", () => {
    expect(() => parseCount("abc")).toThrow();
  });
});
