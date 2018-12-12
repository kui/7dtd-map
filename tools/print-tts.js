/* eslint-env node */

const path = require('path');
const parseTts = require('./lib/tts-parser');

const usage = `${path.basename(process.argv[1])} <tts file>`;

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }
  const tts = await parseTts(process.argv[2]);
  console.log({ x: tts.maxx, y: tts.maxy, z: tts.maxz });

  // print block IDs slicing horizontally.
  for (let y = 0; y < tts.maxy; y += 1) {
    console.log('height = %d', y);
    for (let z = 0; z < tts.maxz; z += 1) {
      const row = [];
      for (let x = 0; x < tts.maxx; x += 1) {
        row.push(tts.getBlockId(x, y, z).toString().padStart(5, '0'));
      }
      console.log(row.toString());
    }
  }
  return 0;
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
