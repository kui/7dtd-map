import * as fs from "fs";
import * as path from "path";
import bunyan from "bunyan";
import bformat from "bunyan-format";
import { requireNonnull } from "./utils";

const log = bunyan.createLogger({
  name: path.basename(__filename, ".js"),
  stream: bformat({}),
  level: "info",
  // level: 'debug',
});

// TTS format: https://7daystodie.gamepedia.com/Prefabs#TTS
// But the current version is "13". (The version is "10" in wiki)
// There maight bee some defferences but I didn't know.
// I think there are some changes around block data,
// because block ID limit seems to increase to 32k from 2048

// Bytes should be ignored in head part.
const PREFIX_BYTES = 8;

declare interface Dimensions {
  xSecondDigit?: number;
  x?: number;
  ySecondDigit?: number;
  y?: number;
  zSecondDigit?: number;
  z?: number;
}

export async function parseTts(ttsFileName: string): Promise<Tts> {
  const blocks: number[] = [];
  const dimensions: Dimensions = {};
  let blockData: number[] = [];
  let blockIdsNum: number;
  let skipBytes = PREFIX_BYTES;
  function handleByte(byte: number) {
    log.debug("16: %s, 10: %s, c: %s", Number(byte).toString(16), byte, String.fromCharCode(byte));
    if (skipBytes !== 0) {
      skipBytes -= 1;
    } else if (dimensions.xSecondDigit === undefined) {
      log.debug("pick as a second digit of dimension x: %d", byte);
      dimensions.xSecondDigit = byte;
    } else if (dimensions.x === undefined) {
      log.debug("pick as a first digit of dimension x: %d", byte);
      dimensions.x = Buffer.from([dimensions.xSecondDigit, byte]).readInt16LE();
    } else if (dimensions.ySecondDigit === undefined) {
      log.debug("pick as a second digit of dimension y: %d", byte);
      dimensions.ySecondDigit = byte;
    } else if (dimensions.y === undefined) {
      log.debug("pick as a first digit of dimension y: %d", byte);
      dimensions.y = Buffer.from([dimensions.ySecondDigit, byte]).readInt16LE();
    } else if (dimensions.zSecondDigit === undefined) {
      log.debug("pick as a second digit of dimension z: %d", byte);
      dimensions.zSecondDigit = byte;
    } else if (dimensions.z === undefined) {
      log.debug("pick as a first digit of dimension z: %d", byte);
      dimensions.z = Buffer.from([dimensions.zSecondDigit, byte]).readInt16LE();
      blockIdsNum = dimensions.x * dimensions.y * dimensions.z;
    } else if (blockData.length < 3) {
      blockData.push(byte);
    } else {
      blockData.push(byte);
      // Strip the higher bits because it is unneccesary for the current usage
      const bid = Buffer.from(blockData.slice(0, 2)).readInt16LE() & 0b0011111111111111;
      log.debug("pick block ID: %d", bid);
      blocks.push(bid);
      blockData = [];
      if (blocks.length === blockIdsNum) {
        log.debug("pick all %d block IDs", blockIdsNum);
        skipBytes = Infinity;
      }
    }
  }
  const stream = fs.createReadStream(ttsFileName);
  return new Promise((resolve, reject) => {
    stream.on("data", (data) => (data as Buffer).forEach(handleByte));
    stream.on("close", () => {
      resolve(new Tts(requireNonnull(dimensions.x), requireNonnull(dimensions.y), requireNonnull(dimensions.z), blocks));
    });
    stream.on("error", reject);
  });
}

export type BlockId = number;

export class Tts {
  blockIds: number[];
  blockNums: Map<BlockId, number>;
  maxx: number;
  maxy: number;
  maxz: number;

  constructor(maxx: number, maxy: number, maxz: number, blockIds: number[]) {
    this.maxx = maxx;
    this.maxy = maxy;
    this.maxz = maxz;
    this.blockIds = blockIds;
    this.blockNums = countBlocks(blockIds);
  }
  getBlockId(x: number, y: number, z: number): BlockId {
    if (x < 0 || this.maxx < x || y < 0 || this.maxy < y || z < 0 || this.maxz < z) {
      throw Error(`Out of index range: x=${x}, y=${y}, z=${z}, maxValues=${this.maxx},${this.maxy},${this.maxz}`);
    }
    return this.blockIds[x + this.maxx * y + this.maxx * this.maxy * z];
  }
}
function countBlocks(ids: number[]) {
  return ids.reduce<Map<number, number>>((map, id) => {
    map.set(id, (map.get(id) ?? 0) + 1);
    return map;
  }, new Map());
}
