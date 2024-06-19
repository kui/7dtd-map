import { parseNim } from "./lib/nim-parser.js";
import { handleMain, program } from "./lib/utils.js";

const usage = `${program()} <nim file>`;

async function main() {
  const nimFile = process.argv[2];
  if (nimFile === undefined) {
    console.error(usage);
    return 1;
  }
  for (const [id, name] of await parseNim(nimFile)) {
    console.log("%d: %s", id, name);
  }
  return 0;
}

handleMain(main());
