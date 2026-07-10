import {
  basename,
  escapeHtml,
  fetchCompleteBlob,
  humanreadableDistance,
  requireNonnull,
  requireType,
  strictParseInt,
} from "../lib/utils.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";

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
    expect(() => strictParseInt("abc", 10, () => "bad input")).toThrow(
      "bad input",
    );
  });

  it("uses radix 10 by default and does not treat leading zeros as octal", () => {
    expect(strictParseInt("08")).toBe(8);
    expect(strictParseInt("010")).toBe(10);
  });

  it("supports an explicit radix argument", () => {
    expect(strictParseInt("ff", 16)).toBe(255);
    expect(strictParseInt("10", 2)).toBe(2);
  });

  it("stops at the first non-decimal character under radix 10", () => {
    // WHY: parseInt("0x10", 10) reads "0" then stops at the "x", so strictParseInt returns 0 rather than 16 under radix 10.
    expect(strictParseInt("0x10")).toBe(0);
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

  it("strips a query string", () => {
    expect(basename("foo/bar.png?v=1")).toBe("bar.png");
    expect(basename("bar.png?v=1")).toBe("bar.png");
  });

  it("strips a hash fragment", () => {
    expect(basename("foo/bar.png#section")).toBe("bar.png");
  });

  it("strips both query and hash", () => {
    expect(basename("foo/bar.png?v=1#section")).toBe("bar.png");
    expect(basename("foo/bar.png#section?v=1")).toBe("bar.png");
  });

  it("strips query and hash from a full URL", () => {
    expect(basename("https://example.com/path/to/a.png?q=1")).toBe("a.png");
    expect(basename("https://example.com/path/to/a.png#frag")).toBe("a.png");
  });
});

describe("fetchCompleteBlob", () => {
  function fakeResponse(
    body: string,
    headers: Record<string, string> = {},
    ok = true,
  ): Response {
    return {
      ok,
      statusText: ok ? "OK" : "Not Found",
      headers: new Headers(headers),
      blob: () => Promise.resolve(new Blob([body])),
    } as unknown as Response;
  }

  async function withFetch(
    response: Response,
    fn: () => Promise<void>,
  ): Promise<void> {
    const s = stub(globalThis, "fetch", () => Promise.resolve(response));
    try {
      await fn();
    } finally {
      s.restore();
    }
  }

  it("returns the body when content-length matches", async () => {
    await withFetch(
      fakeResponse("hello", { "content-length": "5" }),
      async () => {
        const blob = await fetchCompleteBlob("/x.png");
        expect(blob.size).toBe(5);
      },
    );
  });

  it("returns the body when no content-length header is present", async () => {
    await withFetch(fakeResponse("hello"), async () => {
      const blob = await fetchCompleteBlob("/x.png");
      expect(blob.size).toBe(5);
    });
  });

  it("throws on an empty body", async () => {
    await withFetch(fakeResponse("", { "content-length": "0" }), async () => {
      await expect(fetchCompleteBlob("/x.png")).rejects.toThrow(
        "Incomplete download",
      );
    });
  });

  it("throws when an uncompressed body is shorter than content-length", async () => {
    await withFetch(
      fakeResponse("hi", { "content-length": "10" }),
      async () => {
        await expect(fetchCompleteBlob("/x.png")).rejects.toThrow(
          "Incomplete download",
        );
      },
    );
  });

  it("does not length-check compressed bodies", async () => {
    await withFetch(
      fakeResponse("hi", {
        "content-length": "10",
        "content-encoding": "gzip",
      }),
      async () => {
        const blob = await fetchCompleteBlob("/x.json");
        expect(blob.size).toBe(2);
      },
    );
  });

  it("throws when the response is not ok", async () => {
    await withFetch(fakeResponse("", {}, false), async () => {
      await expect(fetchCompleteBlob("/x.png")).rejects.toThrow(
        "Failed to fetch",
      );
    });
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
