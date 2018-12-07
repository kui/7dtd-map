const fs = require('fs');

const nimInitOffset = 11;

module.exports = async function parseNim(nimFileName) {
  const blocks = [];
  let buffer;
  let bufferIndex;
  let firstDigit = null;
  let skipBytes = nimInitOffset;
  function handleByte(byte) {
    // console.log('16: %s, 10: %s, c: %s', Number(byte).toString(16), byte, String.fromCharCode(byte));
    if (skipBytes !== 0) {
      skipBytes -= 1;
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
        skipBytes = 2;
      }
    } else if (firstDigit === null) {
      // console.log('register first digit');
      firstDigit = byte;
    } else if (firstDigit === 0 && byte === 0) {
      // noop
    } else if (firstDigit === 0 && byte > 1) {
      // console.log('pick name length: %d', byte);
      // read block name length
      buffer = Buffer.allocUnsafe(byte);
      bufferIndex = 0;
      firstDigit = null;
    } else {
      firstDigit = null;
    }
  }
  const stream = fs.createReadStream(nimFileName);
  return new Promise((resolve, reject) => {
    stream.on('data', data => data.forEach(handleByte));
    stream.on('close', () => {
      if (buffer) console.error('Unexpected state: %s', nimFileName);
      resolve(blocks);
    });
    stream.on('error', reject);
  });
};
