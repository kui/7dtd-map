import * as fs from "node:fs";
import { ByteReader } from "./byte-reader.ts";

export type BlockId = number;

export type BlockIdNames = Map<BlockId, string>;

/**
 * Parses a `.blocks.nim` file. The layout below is reverse-engineered
 * from observed files, not from a spec.
 *
 * Header:
 *   1-4: (uint32) file format version
 *   5-8: (uint32) the number of block types `blockNum`
 *
 * Body (repeated per block ID-name definition):
 *   1-4: (uint32) block ID for a TTS file
 *   5:   (uint8)  length of the block name
 *   6-:  (string) block name
 */
export async function parseNim(nimFileName: string): Promise<BlockIdNames> {
  const stream = fs.createReadStream(nimFileName);
  let version: number;
  const blocks: BlockIdNames = new Map();
  // INVARIANT: the try scope must contain only ByteReader reads so the finally releases the FD when reads throw.
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

  // WHY: version is validated after the body read to keep the code sequence mirroring the on-disk layout. Malformed .nim files are rare because inputs come from the game's own exporter.
  if (version !== 1) {
    throw Error(
      `Unexpected version: filename=${nimFileName} version=${String(version)}`,
    );
  }

  return blocks;
}
