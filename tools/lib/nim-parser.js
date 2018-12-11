const fs = require('fs');
const path = require('path');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');

const log = bunyan.createLogger({
  name: path.basename(__filename, '.js'),
  stream: bformat(),
  // level: 'info',
  level: 'debug',
});

module.exports = async function parseNim(nimFileName) {
  const blocks = [];
  let blockId = null;
  let blockIdSecondDigit = null;
  let buffer;
  let bufferIndex;

  let blockNum = null;
  let blockNumSecondDigit = null;
  let skipBytes = 4;
  function handleByte(byte) {
    log.debug(
      '16: %s, 10: %s, c: %s',
      Number(byte).toString(16),
      byte,
      String.fromCharCode(byte),
    );
    if (skipBytes !== 0) {
      skipBytes -= 1;
    } else if (blockNumSecondDigit === null) {
      log.debug('pick as a second digit of block num: %d', byte);
      blockNumSecondDigit = byte;
    } else if (blockNum === null) {
      log.debug('pick as a first digit of block num: %d', byte);
      blockNum = Buffer.from([blockNumSecondDigit, byte]).readInt16LE();
      skipBytes = 2;
    } else if (blockIdSecondDigit === null) {
      log.debug('pick as a second digit of block ID: %d', byte);
      blockIdSecondDigit = byte;
    } else if (blockId === null) {
      log.debug('pick as a first digit of block ID: %d', byte);
      blockId = Buffer.from([blockIdSecondDigit, byte]).readInt16LE();
      skipBytes = 2;
    } else if (buffer) {
      log.debug('pick as a char of block name: %s', String.fromCharCode(byte));
      buffer[bufferIndex] = byte;
      if (bufferIndex + 1 < buffer.length) {
        bufferIndex += 1;
      } else {
        const blockName = buffer.toString();
        log.debug('add block name: %s (id=%s)', blockName, blockId);
        if (!blocks.includes(blockName)) {
          blocks.push(blockName);
        }

        blockId = null;
        blockIdSecondDigit = null;
        buffer = null;

        if (blocks.length === blockNum) {
          log.debug('parse all %d block', blockNum);
          skipBytes = Infinity;
        }
      }
    } else {
      log.debug('pick as a block name length: %d', byte);
      buffer = Buffer.allocUnsafe(byte);
      bufferIndex = 0;
    }
  }
  const stream = fs.createReadStream(nimFileName);
  return new Promise((resolve, reject) => {
    stream.on('data', data => data.forEach(handleByte));
    stream.on('close', () => {
      if (buffer) {
        log.warn('Unexpected state: Unflushed buffer exists: %s', nimFileName);
      }
      if (blocks.length !== blockNum) {
        log.warn('Unexpected state: Unreach defined blocks num: %s', nimFileName);
      }
      resolve(blocks);
    });
    stream.on('error', reject);
  });
};
