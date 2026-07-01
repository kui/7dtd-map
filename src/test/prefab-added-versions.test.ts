import { latestAddedVersion } from "../lib/prefab-added-versions.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("latestAddedVersion", () => {
  it("throws for an empty map", () => {
    expect(() => latestAddedVersion({})).toThrow();
  });

  it("returns the numerically largest value", () => {
    expect(
      latestAddedVersion({ house_01: "2.6", house_02: "3.0" }),
    ).toBe("3.0");
  });

  it("is semver-aware, e.g. '3.10' sorts after '3.2'", () => {
    expect(
      latestAddedVersion({ house_01: "3.10", house_02: "3.2" }),
    ).toBe("3.10");
  });

  it("compares segment counts correctly, e.g. '3.0.1' sorts after '3.0'", () => {
    expect(
      latestAddedVersion({ house_01: "3.0.1", house_02: "3.0" }),
    ).toBe("3.0.1");
  });
});
