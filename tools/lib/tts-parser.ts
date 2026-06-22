import * as fs from "node:fs";
import { ByteReader } from "./byte-reader.ts";
import { BlockId } from "./nim-parser.ts";

// TTS format: https://7daystodie.gamepedia.com/Prefabs#TTS
const KNOWN_VERSIONS = [13, 15, 16, 17, 18, 19];
const BLOCK_ID_BIT_MASK = 0b0111111111111111;

export async function parseTts(ttsFileName: string): Promise<Tts> {
  const stream = fs.createReadStream(ttsFileName);
  let fileFormat: string;
  let version: number;
  let dim: { x: number; y: number; z: number };
  let blockIds: Uint32Array;
  // try wraps only the I/O so the finally guarantees the FD is released if
  // ByteReader.read throws on a truncated/corrupt file. Header validation
  // and the Tts allocation run after close() and don't need the guard.
  try {
    const r = new ByteReader(stream);

    // Header
    fileFormat = (await r.read(4)).toString();
    version = (await r.read(4)).readUInt32LE();
    dim = {
      x: (await r.read(2)).readUInt16LE(),
      y: (await r.read(2)).readUInt16LE(),
      z: (await r.read(2)).readUInt16LE(),
    };

    // Block data
    const blocksNum = dim.x * dim.y * dim.z;
    blockIds = new Uint32Array(blocksNum);
    for (let i = 0; i < blocksNum; i++) {
      const blockData = (await r.read(4)).readInt32LE();
      blockIds[i] = blockData & BLOCK_ID_BIT_MASK;
    }
  } finally {
    stream.close();
  }

  // Header validation runs after the body read so the read(...) sequence
  // above mirrors the on-disk TTS layout and serves as a visual map of the
  // file format. Malformed TTS files are vanishingly rare in this toolchain
  // (inputs come from the game's own exporter), so the cost of parsing the
  // body before rejecting is negligible.
  if (fileFormat !== "tts\x00") {
    throw Error(
      `Unexpected file prefix: filename=${ttsFileName}, format=${fileFormat}`,
    );
  }
  if (!KNOWN_VERSIONS.includes(version)) {
    throw Error(
      `Unknown version: filename=${ttsFileName} version=${String(version)}`,
    );
  }
  return new Tts(version, dim, blockIds);
}

export class Tts {
  version: number;
  blockIds: Uint32Array;
  blockNums: Map<BlockId, number>;
  maxx: number;
  maxy: number;
  maxz: number;

  constructor(
    version: number,
    dim: { x: number; y: number; z: number },
    blockIds: Uint32Array,
  ) {
    this.version = version;
    this.maxx = dim.x;
    this.maxy = dim.y;
    this.maxz = dim.z;
    this.blockIds = blockIds;
    this.blockNums = countBlocks(blockIds);
  }
  getBlockId(x: number, y: number, z: number): BlockId | undefined {
    if (
      x < 0 || x >= this.maxx ||
      y < 0 || y >= this.maxy ||
      z < 0 || z >= this.maxz
    ) {
      throw Error(
        `Out of index range: x=${x}, y=${y}, z=${z}, maxValues=${this.maxx},${this.maxy},${this.maxz}`,
      );
    }
    return this.blockIds[x + this.maxx * y + this.maxx * this.maxy * z];
  }
}

function countBlocks(ids: Uint32Array) {
  return ids.reduce<Map<number, number>>((map, id) => {
    map.set(id, (map.get(id) ?? 0) + 1);
    return map;
  }, new Map());
}
