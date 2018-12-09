/* eslint-env node */

const path = require('path');
const prefabHtml = require('./lib/prefab-html');

const usage = `${path.basename(process.argv[1])} <Prefab XML> <Prefab Nim>`;

async function main() {
  if (process.argv.length <= 3) {
    console.error(usage);
    return 1;
  }
  console.log(await prefabHtml({ xml: process.argv[2], nim: process.argv[3] }));
  return 0;
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
