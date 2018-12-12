const fs = require('fs');
const path = require('path');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');

const log = bunyan.createLogger({
  name: path.basename(__filename, '.js'),
  stream: bformat(),
  level: 'info',
  // level: 'debug',
});

module.exports = async function parseTts(ttsFileName) {
  const blocks = [];
  const dimensions = {};
  let digits = [];
  let blockIdsNum;
  let skipBytes = 8;
  function handleByte(byte) {
    log.debug(
      '16: %s, 10: %s, c: %s',
      Number(byte).toString(16),
      byte,
      String.fromCharCode(byte),
    );
    if (skipBytes !== 0) {
      skipBytes -= 1;
    } else if (dimensions.xSecondDigit === undefined) {
      log.debug('pick as a second digit of dimension x: %d', byte);
      dimensions.xSecondDigit = byte;
    } else if (dimensions.x === undefined) {
      log.debug('pick as a first digit of dimension x: %d', byte);
      dimensions.x = Buffer.from([dimensions.xSecondDigit, byte]).readInt16LE();
    } else if (dimensions.ySecondDigit === undefined) {
      log.debug('pick as a second digit of dimension y: %d', byte);
      dimensions.ySecondDigit = byte;
    } else if (dimensions.y === undefined) {
      log.debug('pick as a first digit of dimension y: %d', byte);
      dimensions.y = Buffer.from([dimensions.ySecondDigit, byte]).readInt16LE();
    } else if (dimensions.zSecondDigit === undefined) {
      log.debug('pick as a second digit of dimension z: %d', byte);
      dimensions.zSecondDigit = byte;
    } else if (dimensions.z === undefined) {
      log.debug('pick as a first digit of dimension z: %d', byte);
      dimensions.z = Buffer.from([dimensions.zSecondDigit, byte]).readInt16LE();
      blockIdsNum = dimensions.x * dimensions.y * dimensions.z;
    } else if (digits.length < 3) {
      digits.push(byte);
    } else {
      digits.push(byte);
      // Strip the significant bits because it is unneccesary for the current app
      // eslint-disable-next-line no-bitwise
      const bid = Buffer.from(digits.slice(0, 2)).readInt16LE() & 0b0011111111111111;
      log.debug('pick block ID: %d', bid);
      blocks.push(bid);
      digits = [];
      if (blocks.length === blockIdsNum) {
        log.debug('pick all %d block IDs', blockIdsNum);
        skipBytes = Infinity;
      }
    }
  }
  const stream = fs.createReadStream(ttsFileName);
  return new Promise((resolve, reject) => {
    stream.on('data', data => data.forEach(handleByte));
    stream.on('close', () => {
      resolve(new Tts({
        maxx: dimensions.x,
        maxy: dimensions.y,
        maxz: dimensions.z,
        blockIds: blocks,
      }));
    });
    stream.on('error', reject);
  });
};

class Tts {
  constructor({
    maxx, maxy, maxz, blockIds,
  }) {
    this.maxx = maxx;
    this.maxy = maxy;
    this.maxz = maxz;
    this.blockIds = blockIds;
  }

  getBlockId(x, y, z) {
    if (x < 0 || this.maxx < x
        || y < 0 || this.maxy < y
        || z < 0 || this.maxz < z) {
      throw Error(`Out of index range: x=${x}, y=${y}, z=${z}, maxValues=${this.maxx},${this.maxy},${this.maxz}`);
    }
    return this.blockIds[x + this.maxx * y + this.maxx * this.maxy * z];
  }
}
