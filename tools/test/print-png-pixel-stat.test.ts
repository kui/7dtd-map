import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import type { DecodedPng } from "fast-png";
import { formatPixelKey, statDecodedPixels } from "../print-png-pixel-stat.ts";

function fakeDecoded(
  data: Uint8Array,
  channels: number,
): DecodedPng {
  return {
    width: 0,
    height: 0,
    data,
    depth: 8,
    channels,
    text: {},
  };
}

describe("statDecodedPixels", () => {
  it("counts each unique RGBA pixel exactly once", () => {
    // Three pixels: red, red, blue (with distinct alphas to keep keys unique).
    const data = new Uint8Array([
      255,
      0,
      0,
      255,
      255,
      0,
      0,
      255,
      0,
      0,
      255,
      128,
    ]);
    const stat = statDecodedPixels(fakeDecoded(data, 4));
    expect(stat.size).toBe(2);

    const redKey = 255 * 0x1000000 + ((0 << 16) | (0 << 8) | 255);
    const blueKey = 0 * 0x1000000 + ((0 << 16) | (255 << 8) | 128);
    expect(stat.get(redKey)).toBe(2);
    expect(stat.get(blueKey)).toBe(1);
  });

  it("keeps the packed key non-negative even when red is 255", () => {
    const data = new Uint8Array([255, 255, 255, 255]);
    const stat = statDecodedPixels(fakeDecoded(data, 4));
    for (const key of stat.keys()) {
      expect(key).toBeGreaterThanOrEqual(0);
    }
  });

  it("throws when the PNG has fewer than 4 channels", () => {
    const data = new Uint8Array([255, 0, 0, 0, 255, 0]);
    expect(() => statDecodedPixels(fakeDecoded(data, 3))).toThrow(
      /4 channels/,
    );
  });

  it("throws when the PNG has 16-bit depth", () => {
    const decoded: DecodedPng = {
      width: 0,
      height: 0,
      data: new Uint16Array([0, 0, 0, 0]),
      depth: 16,
      channels: 4,
      text: {},
    };
    expect(() => statDecodedPixels(decoded)).toThrow(/16-bit/);
  });
});

describe("formatPixelKey", () => {
  it("renders RGBA components with 3-character right-aligned padding", () => {
    const key = 1 * 0x1000000 + ((2 << 16) | (3 << 8) | 4);
    expect(formatPixelKey(key)).toBe("  1,  2,  3,  4");
  });

  it("round-trips the maximum value", () => {
    const key = 255 * 0x1000000 + ((255 << 16) | (255 << 8) | 255);
    expect(formatPixelKey(key)).toBe("255,255,255,255");
  });
});
