import { matchAndHighlight } from "../worker/lib/prefab-filter.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("matchAndHighlight", () => {
  it("returns null when nothing matches", () => {
    expect(matchAndHighlight("hello", /world/gi)).toBeNull();
  });

  it("wraps matched substrings in <mark> and escapes the rest", () => {
    expect(matchAndHighlight("foo bar foo", /foo/gi)).toBe(
      "<mark>foo</mark> bar <mark>foo</mark>",
    );
  });

  it("escapes HTML metacharacters in non-matched segments", () => {
    expect(matchAndHighlight(`<img src=x onerror="alert(1)">house`, /house/gi))
      .toBe(
        "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;<mark>house</mark>",
      );
  });

  it("escapes HTML metacharacters inside matched segments too", () => {
    expect(matchAndHighlight("a<b>c", /<b>/g)).toBe(
      "a<mark>&lt;b&gt;</mark>c",
    );
  });

  it("works with non-global regexes", () => {
    expect(matchAndHighlight("foo bar foo", /foo/i)).toBe(
      "<mark>foo</mark> bar <mark>foo</mark>",
    );
  });
});
