import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { parseTts, Tts } from "../lib/tts-parser.ts";

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

  // WHY: dim 0,0,0 makes the block loop iterate zero times so we can exercise the post-loop header checks without a real prefab body.
  function emptyBodyHeader(magic: number[], version: number): Uint8Array {
    const buf = new Uint8Array(14);
    buf.set(magic, 0);
    const view = new DataView(buf.buffer);
    view.setUint32(4, version, true);
    return buf;
  }

  it("rejects files with unexpected prefix", async () => {
    const p = writeTmp(
      "bad-prefix.tts",
      emptyBodyHeader([0x00, 0x00, 0x00, 0x00], 19),
    );
    await expect(parseTts(p)).rejects.toThrow("Unexpected file prefix");
  });

  it("rejects files with unknown version", async () => {
    const p = writeTmp(
      "bad-version.tts",
      emptyBodyHeader([0x74, 0x74, 0x73, 0x00], 9999),
    );
    await expect(parseTts(p)).rejects.toThrow("Unknown version");
  });

  it("rejects truncated files (FD must still be released via finally)", async () => {
    // WHY: header claims a 1×1×1 body but no bytes follow, forcing ByteReader.read to throw; the try/finally in parseTts must release the ReadStream FD to survive throttleAll concurrency.
    const buf = new Uint8Array(14);
    buf.set([0x74, 0x74, 0x73, 0x00], 0);
    const view = new DataView(buf.buffer);
    view.setUint32(4, 19, true);
    view.setUint16(8, 1, true);
    view.setUint16(10, 1, true);
    view.setUint16(12, 1, true);
    const p = writeTmp("truncated.tts", buf);
    await expect(parseTts(p)).rejects.toThrow();
  });
});
