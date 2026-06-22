import * as fs from "node:fs";
import { ByteReader } from "./byte-reader.ts";
import { BlockId } from "./nim-parser.ts";

// TTS format: https://7daystodie.gamepedia.com/Prefabs#TTS
const KNOWN_VERSIONS = [13, 15, 16, 17, 18, 19];
const BLOCK_ID_BIT_MASK = 0b0111111111111111;

export async function parseTts(ttsFileName: string): Promise<Tts> {
  const stream = fs.createReadStream(ttsFileName);
  try {
    const r = new ByteReader(stream);

    // Header
    const fileFormat = (await r.read(4)).toString();
    const version = (await r.read(4)).readUInt32LE();
    const dim = {
      x: (await r.read(2)).readUInt16LE(),
      y: (await r.read(2)).readUInt16LE(),
      z: (await r.read(2)).readUInt16LE(),
    };

    // Block data
    const blocksNum = dim.x * dim.y * dim.z;
    const blockIds = new Uint32Array(blocksNum);
    for (let i = 0; i < blocksNum; i++) {
      const blockData = (await r.read(4)).readInt32LE();
      blockIds[i] = blockData & BLOCK_ID_BIT_MASK;
    }

    // Header validation is intentionally done after the body read so the
    // sequence of read(...) calls above mirrors the on-disk TTS layout and
    // serves as a visual map of the file format. Moving these checks earlier
    // would fail faster on malformed input, but malformed TTS files are
    // vanishingly rare in this toolchain (inputs come from the game's own
    // exporter), and a bad file still fails fast inside ByteReader.read.
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
  } finally {
    stream.close();
  }
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
