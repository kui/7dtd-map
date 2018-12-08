const fs = require('fs');

module.exports = async function parseNim(nimFileName) {
  const blocks = [];
  let buffer;
  let bufferIndex;
  let firstDigit = null;
  let blockNum = null;
  let prevDigits = [];
  let skipBytes = 4;
  function handleByte(byte) {
    // console.log('16: %s, 10: %s, c: %s', Number(byte).toString(16),
    // byte, String.fromCharCode(byte));
    if (skipBytes !== 0) {
      skipBytes -= 1;
    } else if (blockNum === null) {
      blockNum = byte;
      skipBytes = 6;
    } else if (buffer) {
      // console.log('pick as a char of block name: %s', String.fromCharCode(byte));
      // read block name chars
      buffer[bufferIndex] = byte;
      if (bufferIndex + 1 < buffer.length) {
        bufferIndex += 1;
      } else {
        // console.log('add block name: %s', buffer.toString());
        const blockName = buffer.toString();
        if (!blocks.includes(blockName)) {
          blocks.push(blockName);
        }
        buffer = null;
        if (blocks.length === blockNum) {
          // console.log('parse all %d block', blockNum);
          skipBytes = Infinity;
        } else {
          skipBytes = 2;
        }
      }
    } else if (firstDigit === null) {
      // console.log('register first digit');
      firstDigit = byte;
      prevDigits.unshift(byte);
    } else if (firstDigit === 0 && byte === 0) {
      prevDigits.unshift(byte);
      // noop
    } else if (firstDigit === 0 && byte > 1) {
      // console.log('pick name length: %d', byte);
      // read block name length
      buffer = Buffer.allocUnsafe(byte);
      bufferIndex = 0;
      firstDigit = null;
      prevDigits = [];
    } else {
      firstDigit = null;
      prevDigits.unshift(byte);
    }
    if (prevDigits.length !== 0 && prevDigits.length % 30 === 0) {
      console.log(
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
        console.error('Unexpected state: Unflushed buffer exists: %s', nimFileName);
      }
      if (blocks.length !== blockNum) {
        console.error('Unexpected state: Unreach defined blocks num: %s', nimFileName);
      }
      resolve(blocks);
    });
    stream.on('error', reject);
  });
};
