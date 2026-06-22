import { Buffer } from "node:buffer";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { parseNim } from "./nim-parser.ts";

async function writeTempNim(bytes: Buffer): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "nim-parser-test-"));
  const file = path.join(dir, "test.blocks.nim");
  await fs.writeFile(file, bytes);
  return file;
}

function header(version: number, idsNum: number): Buffer {
  const b = Buffer.alloc(8);
  b.writeUInt32LE(version, 0);
  b.writeUInt32LE(idsNum, 4);
  return b;
}

describe("parseNim", () => {
  it("parses a valid v1 file", async () => {
    const name = "stone";
    const body = Buffer.alloc(4 + 1 + name.length);
    body.writeUInt32LE(42, 0);
    body.writeUInt8(name.length, 4);
    body.write(name, 5, "ascii");
    const file = await writeTempNim(Buffer.concat([header(1, 1), body]));

    const map = await parseNim(file);
    expect(map.size).toBe(1);
    expect(map.get(42)).toBe(name);
  });

  it("throws Unexpected version BEFORE attempting to read any block entry", async () => {
    // idsNum claims a huge number of entries, but the body is empty.
    // The old implementation looped first and threw the byte-reader's
    // "Unexpected byte length" error. The fixed implementation must
    // throw "Unexpected version" without ever entering the loop.
    const file = await writeTempNim(header(2, 0xffffffff));

    await expect(parseNim(file)).rejects.toThrow(/Unexpected version/);
  });

  it("rejects when the body is truncated", async () => {
    // version=1, claims 1 entry, but no body bytes follow.
    const file = await writeTempNim(header(1, 1));
    await expect(parseNim(file)).rejects.toThrow();
  });

  it("does not leak file descriptors on repeated parse failures", async () => {
    // Force many failures; if the stream were not closed on the throw path,
    // this would eventually exhaust the FD limit. We keep the count modest
    // so the test stays fast while still exercising the finally branch.
    const file = await writeTempNim(header(2, 0));
    for (let i = 0; i < 200; i++) {
      await expect(parseNim(file)).rejects.toThrow(/Unexpected version/);
    }
  });
});
