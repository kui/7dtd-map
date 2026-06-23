import { Labels, resolveLanguage } from "../lib/labels.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("resolveLanguage", () => {
  it("returns english for empty list", () => {
    expect(resolveLanguage([])).toBe("english");
  });

  it("returns english for unknown language tags", () => {
    expect(resolveLanguage(["xx", "yy"])).toBe("english");
  });

  it("matches exact language tags", () => {
    expect(resolveLanguage(["en"])).toBe("english");
    expect(resolveLanguage(["ja"])).toBe("japanese");
    expect(resolveLanguage(["de"])).toBe("german");
    expect(resolveLanguage(["ko"])).toBe("koreana");
  });

  it("matches language tags with region subtags via prefix", () => {
    expect(resolveLanguage(["en-US"])).toBe("english");
    expect(resolveLanguage(["ja-JP"])).toBe("japanese");
    expect(resolveLanguage(["pt-BR"])).toBe("brazilian");
  });

  it("distinguishes zh-CN and zh-TW", () => {
    expect(resolveLanguage(["zh-CN"])).toBe("schinese");
    expect(resolveLanguage(["zh-TW"])).toBe("tchinese");
  });

  it("resolves Chinese script subtags (Hans/Hant)", () => {
    expect(resolveLanguage(["zh-Hans"])).toBe("schinese");
    expect(resolveLanguage(["zh-Hans-CN"])).toBe("schinese");
    expect(resolveLanguage(["zh-Hant"])).toBe("tchinese");
    expect(resolveLanguage(["zh-Hant-TW"])).toBe("tchinese");
  });

  it("defaults bare zh to Simplified Chinese", () => {
    expect(resolveLanguage(["zh"])).toBe("schinese");
  });

  it("matches Chinese tags case-insensitively", () => {
    expect(resolveLanguage(["zh-cn"])).toBe("schinese");
    expect(resolveLanguage(["zh-tw"])).toBe("tchinese");
    expect(resolveLanguage(["zh-hans"])).toBe("schinese");
  });

  it("resolves additional Chinese regions", () => {
    expect(resolveLanguage(["zh-SG"])).toBe("schinese");
    expect(resolveLanguage(["zh-HK"])).toBe("tchinese");
    expect(resolveLanguage(["zh-MO"])).toBe("tchinese");
  });

  it("matches other languages case-insensitively", () => {
    expect(resolveLanguage(["DE-DE"])).toBe("german");
    expect(resolveLanguage(["EN-us"])).toBe("english");
  });

  it("returns the first matching language when multiple are given", () => {
    expect(resolveLanguage(["unknown", "ja"])).toBe("japanese");
    expect(resolveLanguage(["de", "ja"])).toBe("german");
  });
});

describe("Labels", () => {
  it("returns the primary label when the key exists in primary", () => {
    const primary = new Map([["key1", "primary_value"]]);
    const fallback = new Map([["key1", "fallback_value"]]);
    expect(new Labels(primary, fallback).get("key1")).toBe("primary_value");
  });

  it("falls back to the default labels when key is absent from primary", () => {
    const primary = new Map<string, string>();
    const fallback = new Map([["key1", "fallback_value"]]);
    expect(new Labels(primary, fallback).get("key1")).toBe("fallback_value");
  });

  it("returns undefined when key is absent from both primary and fallback", () => {
    const primary = new Map<string, string>();
    const fallback = new Map<string, string>();
    expect(new Labels(primary, fallback).get("missing")).toBeUndefined();
  });
});
