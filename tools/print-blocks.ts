import * as path from "path";
import { parseNim } from "./lib/nim-parser";
import { handleMain } from "./lib/utils";

const usage = `${path.basename(process.argv[1])} <nim file>`;

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }
  Array.from(await parseNim(process.argv[2])).forEach(([id, name]) => {
    console.log("%d: %s", id, name);
  });
  return 0;
}

handleMain(main());
