import { decode, encode } from "fast-png";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { Processor, type WorldFileName } from "../../lib/map-files.ts";

async function processBytes(
  name: WorldFileName,
  bytes: Uint8Array,
): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  await new Processor(name).process(
    new Blob([bytes as Uint8Array<ArrayBuffer>]).stream(),
    new WritableStream({
      write(c) {
        chunks.push(c);
      },
    }),
  );
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

function png(channels: 1 | 2 | 3 | 4, pixels: number[][]): Uint8Array {
  return encode({
    width: pixels.length,
    height: 1,
    data: new Uint8Array(pixels.flat()),
    channels,
    depth: 8,
  });
}

describe("PngEditingTransformer channel handling", () => {
  it("repacks an RGB (3-channel) PNG without throwing (#246)", async () => {
    // WHY: dedicated-server worlds (SavesLocal) contain RGB PNGs; this used to throw `RangeError: wrong data size` on encode.
    const out = await processBytes(
      "biomes.png",
      png(3, [[0, 64, 0], [255, 168, 0]]),
    );
    const decoded = decode(out);
    expect(decoded.channels).toBe(4);
    expect(Array.from(decoded.data)).toEqual([
      0,
      64,
      0,
      255,
      255,
      168,
      0,
      255,
    ]);
  });

  it("expands a grayscale (1-channel) PNG to RGBA", async () => {
    const out = await processBytes("biomes.png", png(1, [[7], [200]]));
    const decoded = decode(out);
    expect(decoded.channels).toBe(4);
    expect(Array.from(decoded.data)).toEqual([
      7,
      7,
      7,
      255,
      200,
      200,
      200,
      255,
    ]);
  });

  it("keeps splat3 semantics for RGB input: black transparent, road opaque", async () => {
    const out = await processBytes(
      "splat3_processed.png",
      png(3, [[0, 0, 0], [255, 0, 0]]),
    );
    const decoded = decode(out);
    expect(decoded.channels).toBe(4);
    expect(Array.from(decoded.data)).toEqual([
      0,
      0,
      0,
      0,
      255,
      0,
      0,
      255,
    ]);
  });

  it("keeps RGBA input unchanged apart from the documented edits", async () => {
    const out = await processBytes(
      "biomes.png",
      png(4, [[1, 2, 3, 255], [4, 5, 6, 255]]),
    );
    const decoded = decode(out);
    expect(decoded.channels).toBe(4);
    expect(Array.from(decoded.data)).toEqual([
      1,
      2,
      3,
      255,
      4,
      5,
      6,
      255,
    ]);
  });
});
