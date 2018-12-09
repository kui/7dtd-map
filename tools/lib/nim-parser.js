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

module.exports = async function parseNim(nimFileName) {
  const blocks = [];
  let buffer;
  let bufferIndex;
  let blockNum = null;
  let prevDigits = [];
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
    } else if (blockNum === null && prevDigits.length === 0) {
      prevDigits.unshift(byte);
    } else if (blockNum === null) {
      blockNum = Buffer.from([prevDigits[0], byte]).readInt16LE();
      prevDigits = [];
      skipBytes = 5;
    } else if (buffer) {
      log.debug('pick as a char of block name: %s', String.fromCharCode(byte));
      buffer[bufferIndex] = byte;
      if (bufferIndex + 1 < buffer.length) {
        bufferIndex += 1;
      } else {
        log.debug('add block name: %s', buffer.toString());
        const blockName = buffer.toString();
        if (!blocks.includes(blockName)) {
          blocks.push(blockName);
        }
        buffer = null;
        if (blocks.length === blockNum) {
          log.debug('parse all %d block', blockNum);
          skipBytes = Infinity;
        } else {
          skipBytes = 2;
        }
      }
    } else if (prevDigits[0] === 0 && byte > 0) {
      log.debug('pick as a block name length: %d', byte);
      buffer = Buffer.allocUnsafe(byte);
      bufferIndex = 0;
      prevDigits = [];
    } else {
      prevDigits.unshift(byte);
    }
    if (prevDigits.length !== 0 && prevDigits.length % 30 === 0) {
      log.warn(
        'Unexpected state: Too long prevDigits: file=%s, length=%d',
        nimFileName, prevDigits.length,
      );
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
