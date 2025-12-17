import process from "node:process";
import { parseTts } from "./lib/tts-parser.ts";
import { handleMain, program } from "./lib/utils.ts";

const usage = `${program()} <tts file>`;

async function main() {
  const ttsFile = process.argv[2];
  if (ttsFile === undefined) {
    console.error(usage);
    return 1;
  }
  const tts = await parseTts(ttsFile);
  console.log("Prefab dimension:");
  console.log({ x: tts.maxx, y: tts.maxy, z: tts.maxz });

  console.log("Each number of blocks:");
  console.log(tts.blockNums);

  // print block IDs slicing horizontally.
  for (let y = 0; y < tts.maxy; y += 1) {
    console.log("height = %d", y);
    for (let z = 0; z < tts.maxz; z += 1) {
      const row = [];
      for (let x = 0; x < tts.maxx; x += 1) {
        const blockId = tts.getBlockId(x, y, z);
        if (blockId === undefined) {
          throw Error(`Block ID not found: ${JSON.stringify({ x, y, z })}`);
        }
        row.push(blockId.toString().padStart(5, "0"));
      }
      console.log(row.toString());
    }
  }
  return 0;
}

handleMain(main());
