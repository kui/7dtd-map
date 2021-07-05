import * as fs from "fs";
import { ByteReader } from "./byte-reader";

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
  const r = new ByteReader(stream);

  const version = (await r.read(4)).readUInt32LE();
  const idsNum = (await r.read(4)).readUInt32LE();
  const blocks: BlockIdNames = new Map();
  for (let i = 0; i < idsNum; i++) {
    const id = (await r.read(4)).readUInt32LE();
    const nameLength = (await r.read(1)).readUInt8();
    const name = (await r.read(nameLength)).toString();
    blocks.set(id, name);
  }

  if (version !== 1) throw Error(`Unexpected version: filename=${nimFileName} version=${version}`);

  return blocks;
}
