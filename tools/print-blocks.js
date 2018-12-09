/* eslint-env node */

const path = require('path');
const parseNim = require('./lib/nim-parser');

const usage = `${path.basename(process.argv[1])} <nim file>`;

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }
  (await parseNim(process.argv[2])).forEach((b) => {
    console.log(b);
  });
  return 0;
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
