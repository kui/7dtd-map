const fs = require('fs');

const nimInitOffset = 12;
const nimUnknownPadding = 4;

module.exports = async function parseNim(nimFileName) {
  const blocks = [];
  let currentIndex = 0;
  let buffer;
  let bufferIndex;
  let nextIndex = nimInitOffset;
  function handleByte(byte) {
    if (buffer) {
      // read block name chars
      buffer[bufferIndex] = byte;
      if (bufferIndex + 1 < buffer.length) {
        bufferIndex += 1;
        nextIndex += 1;
      } else {
        blocks.push(buffer.toString());
        buffer = null;
        nextIndex += nimUnknownPadding + 1;
      }
    } else if (currentIndex === nextIndex) {
      // read block name length
      buffer = Buffer.allocUnsafe(byte);
      bufferIndex = 0;
      nextIndex += 1;
    }
    currentIndex += 1;
  }
  const stream = fs.createReadStream(nimFileName);
  return new Promise((resolve, reject) => {
    stream.on('data', data => data.forEach(handleByte));
    stream.on('close', () => resolve(blocks));
    stream.on('error', reject);
  });
};
