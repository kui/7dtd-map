import * as fs from "node:fs";
import { ByteReader } from "./byte-reader.ts";

export type BlockId = number;

export type BlockIdNames = Map<BlockId, string>;

// ".blocks.nim" format (Its just my guess, refered to no docs.)
// * Header part
// 1-4: (uint32) file format version?
// 5-8: (uint32) the number of block types `blockNum`
// * Body part: repeated each block ID-Name definisions
// 1-4: (uint32) block ID for a tts file
// 5:   (uint8) the number of chars of the block name
// 6-:  (string) block name
export async function parseNim(nimFileName: string): Promise<BlockIdNames> {
  const stream = fs.createReadStream(nimFileName);
  let version: number;
  const blocks: BlockIdNames = new Map();
  // try wraps only the I/O so the finally guarantees the FD is released if
  // ByteReader.read throws on a truncated/corrupt file. Version validation
  // runs after close() and does not need the guard.
  try {
    const r = new ByteReader(stream);

    version = (await r.read(4)).readUInt32LE();
    const idsNum = (await r.read(4)).readUInt32LE();
    for (let i = 0; i < idsNum; i++) {
      const id = (await r.read(4)).readUInt32LE();
      const nameLength = (await r.read(1)).readUInt8();
      const name = (await r.read(nameLength)).toString();
      blocks.set(id, name);
    }
  } finally {
    stream.close();
  }

  // Version validation runs after the body read so the read(...) sequence
  // above mirrors the on-disk .blocks.nim layout and serves as a visual map
  // of the file format. Malformed .nim files are vanishingly rare in this
  // toolchain (inputs come from the game's own exporter), so the cost of
  // parsing the body before rejecting is negligible.
  if (version !== 1) {
    throw Error(
      `Unexpected version: filename=${nimFileName} version=${String(version)}`,
    );
  }

  return blocks;
}
