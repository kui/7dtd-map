import * as fs from "node:fs";
import { ByteReader } from "./byte-reader.ts";
import { BlockId } from "./nim-parser.ts";

const KNOWN_VERSIONS = [13, 15, 16, 17, 18, 19];
const BLOCK_ID_BIT_MASK = 0b0111111111111111;

/**
 * Parses a `.tts` prefab file. TTS format reference:
 * https://7daystodie.gamepedia.com/Prefabs#TTS
 */
export async function parseTts(ttsFileName: string): Promise<Tts> {
  const stream = fs.createReadStream(ttsFileName);
  let fileFormat: string;
  let version: number;
  let dim: { x: number; y: number; z: number };
  let blockIds: Uint32Array;
  // INVARIANT: the try scope must contain only ByteReader reads so the finally releases the FD when reads throw.
  try {
    const r = new ByteReader(stream);

    fileFormat = (await r.read(4)).toString();
    version = (await r.read(4)).readUInt32LE();
    dim = {
      x: (await r.read(2)).readUInt16LE(),
      y: (await r.read(2)).readUInt16LE(),
      z: (await r.read(2)).readUInt16LE(),
    };

    const blocksNum = dim.x * dim.y * dim.z;
    blockIds = new Uint32Array(blocksNum);
    for (let i = 0; i < blocksNum; i++) {
      const blockData = (await r.read(4)).readInt32LE();
      blockIds[i] = blockData & BLOCK_ID_BIT_MASK;
    }
  } finally {
    stream.close();
  }

  // WHY: header is validated after the body read to keep the code sequence mirroring the on-disk layout. Malformed TTS files are rare because inputs come from the game's own exporter.
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
