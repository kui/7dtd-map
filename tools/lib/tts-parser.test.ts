import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { parseTts, Tts } from "./tts-parser.ts";

describe("Tts.getBlockId bounds", () => {
  const dim = { x: 2, y: 3, z: 4 };
  const blockIds = new Uint32Array(dim.x * dim.y * dim.z);
  const tts = new Tts(19, dim, blockIds);

  it("accepts valid indices at the lower bound", () => {
    expect(tts.getBlockId(0, 0, 0)).toBe(0);
  });

  it("accepts valid indices at the upper bound (max - 1)", () => {
    expect(tts.getBlockId(dim.x - 1, dim.y - 1, dim.z - 1)).toBe(0);
  });

  it("throws when x equals maxx", () => {
    expect(() => tts.getBlockId(dim.x, 0, 0)).toThrow("Out of index range");
  });

  it("throws when y equals maxy", () => {
    expect(() => tts.getBlockId(0, dim.y, 0)).toThrow("Out of index range");
  });

  it("throws when z equals maxz", () => {
    expect(() => tts.getBlockId(0, 0, dim.z)).toThrow("Out of index range");
  });

  it("throws on negative indices", () => {
    expect(() => tts.getBlockId(-1, 0, 0)).toThrow("Out of index range");
    expect(() => tts.getBlockId(0, -1, 0)).toThrow("Out of index range");
    expect(() => tts.getBlockId(0, 0, -1)).toThrow("Out of index range");
  });
});

describe("parseTts error handling", () => {
  function writeTmp(name: string, bytes: Uint8Array): string {
    const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tts-")), name);
    fs.writeFileSync(p, bytes);
    return p;
  }

  it("rejects files with unexpected prefix without reading the body", async () => {
    // Header with bogus magic; if version/body were parsed first, this would
    // read garbage instead of throwing the prefix error.
    const buf = new Uint8Array(4);
    buf.set([0x00, 0x00, 0x00, 0x00]);
    const p = writeTmp("bad-prefix.tts", buf);
    await expect(parseTts(p)).rejects.toThrow("Unexpected file prefix");
  });

  it("rejects files with unknown version before allocating block buffer", async () => {
    // Magic "tts\0" + version = 9999 (unknown). No body bytes follow; if the
    // parser tried to read the body, ByteReader would throw a different error.
    const buf = new Uint8Array(8);
    buf.set([0x74, 0x74, 0x73, 0x00], 0); // "tts\0"
    new DataView(buf.buffer).setUint32(4, 9999, true);
    const p = writeTmp("bad-version.tts", buf);
    await expect(parseTts(p)).rejects.toThrow("Unknown version");
  });

  it("closes the file descriptor when parsing throws", async () => {
    // Truncated file: valid header but no block body. parseTts must reject and
    // release the FD via the finally block; if it leaks, repeated calls would
    // eventually exhaust the FD limit. We assert the rejection here and rely
    // on the try/finally to free the FD.
    const buf = new Uint8Array(10);
    buf.set([0x74, 0x74, 0x73, 0x00], 0); // "tts\0"
    new DataView(buf.buffer).setUint32(4, 19, true); // known version
    // dim x=1 (rest of header truncated)
    buf.set([0x01, 0x00], 8);
    const p = writeTmp("truncated.tts", buf);
    await expect(parseTts(p)).rejects.toThrow();
  });
});
