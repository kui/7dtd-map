import * as path from "path";
import { parseNim } from "./lib/nim-parser";

const usage = `${path.basename(process.argv[1])} <nim file>`;

async function main() {
  if (process.argv.length <= 2) {
    console.error(usage);
    return 1;
  }
  (await parseNim(process.argv[2])).forEach((b: any) => {
    console.log("%d: %s", b.id, b.name);
  });
  return 0;
}

main()
  .catch((e) => {
    console.error(e);
    return 1;
  })
  .then((exitCode) => {
    process.on("exit", () => process.exit(exitCode));
  });
