import {
  basename,
  escapeHtml,
  humanreadableDistance,
  requireNonnull,
  requireType,
  strictParseInt,
} from "../lib/utils.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("requireNonnull", () => {
  it("returns non-null values unchanged", () => {
    expect(requireNonnull("hello")).toBe("hello");
    expect(requireNonnull(0)).toBe(0);
    expect(requireNonnull("")).toBe("");
    expect(requireNonnull(false)).toBe(false);
  });

  it("throws for null", () => {
    expect(() => requireNonnull(null)).toThrow();
  });

  it("throws for undefined", () => {
    expect(() => requireNonnull(undefined)).toThrow();
  });

  it("uses custom error message", () => {
    expect(() => requireNonnull(null, () => "custom error")).toThrow(
      "custom error",
    );
  });
});

describe("strictParseInt", () => {
  it("parses valid integer strings", () => {
    expect(strictParseInt("42")).toBe(42);
    expect(strictParseInt("-10")).toBe(-10);
    expect(strictParseInt("0")).toBe(0);
  });

  it("throws for non-numeric strings", () => {
    expect(() => strictParseInt("abc")).toThrow();
    expect(() => strictParseInt("")).toThrow();
    expect(() => strictParseInt(" ")).toThrow();
  });

  it("throws for null or undefined", () => {
    expect(() => strictParseInt(null)).toThrow();
    expect(() => strictParseInt(undefined)).toThrow();
  });

  it("uses custom error message", () => {
    expect(() => strictParseInt("abc", () => "bad input")).toThrow("bad input");
  });
});

class Cls {
  constructor(..._: unknown[]) {}
}

describe("requireType", () => {
  it("returns value when instanceof matches", () => {
    const instance = new Cls();
    expect(requireType(instance, Cls)).toBe(instance);
  });

  it("throws when instanceof does not match", () => {
    expect(() => requireType("string", Cls)).toThrow();
    expect(() => requireType(42, Cls)).toThrow();
    expect(() => requireType(null, Cls)).toThrow();
  });

  it("uses custom error message", () => {
    expect(() => requireType("x", Cls, () => "not an instance")).toThrow(
      "not an instance",
    );
  });
});

describe("humanreadableDistance", () => {
  it("formats distance under 1000m with direction", () => {
    expect(humanreadableDistance(["N", 500])).toBe("N 500m");
    expect(humanreadableDistance(["SW", 999])).toBe("SW 999m");
  });

  it("formats distance of 1000m or more in km", () => {
    expect(humanreadableDistance(["N", 1000])).toBe("N 1.00km");
    expect(humanreadableDistance(["E", 1500])).toBe("E 1.50km");
  });

  it("handles null direction", () => {
    expect(humanreadableDistance([null, 500])).toBe(" 500m");
    expect(humanreadableDistance([null, 2000])).toBe(" 2.00km");
  });

  it("formats zero distance", () => {
    expect(humanreadableDistance(["N", 0])).toBe("N 0m");
  });
});

describe("basename", () => {
  it("returns the filename from a path", () => {
    expect(basename("/foo/bar/baz.txt")).toBe("baz.txt");
    expect(basename("foo/bar")).toBe("bar");
  });

  it("returns the whole string when no slash", () => {
    expect(basename("baz.txt")).toBe("baz.txt");
  });

  it("returns empty string for trailing slash", () => {
    expect(basename("/foo/bar/")).toBe("");
  });
});

describe("escapeHtml", () => {
  it("escapes the five HTML special characters", () => {
    expect(escapeHtml(`<script>alert("x&y")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&amp;y&quot;)&lt;/script&gt;",
    );
  });

  it("escapes single quotes for safe single-quoted attribute use", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes ampersand first so existing entity text is preserved literally", () => {
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
  });

  it("returns plain ASCII unchanged", () => {
    expect(escapeHtml("plain text 123")).toBe("plain text 123");
    expect(escapeHtml("")).toBe("");
  });
});
