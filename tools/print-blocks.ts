/* eslint-env node */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parseNim'.
const parseNim = require('./lib/nim-parser');

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'usage'.
const usage = `${path.basename(process.argv[1])} <nim file>`;

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }
  (await parseNim(process.argv[2])).forEach((b: any) => {
    console.log('%d: %s', b.id, b.name);
  });
  return 0;
}

main().then((exitCode) => {
  process.on('exit', () => process.exit(exitCode));
});
