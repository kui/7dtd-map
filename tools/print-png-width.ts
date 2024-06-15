import { createReadStream } from "fs";
import { handleMain, program } from "./lib/utils.js";
import { PNG } from "pngjs";

const usage = `${program()} <png>
Print the width of the PNG file.`;

async function main() {
  const pngFile = process.argv[2];
  if (pngFile === undefined) {
    console.error(usage);
    return 1;
  }
  const png = await parsePng(pngFile);
  console.log(png.width);
  return 0;
}

async function parsePng(pngFile: string): Promise<PNG> {
  return new Promise((resolve, reject) => {
    createReadStream(pngFile)
      .pipe(new PNG())
      .on("parsed", function () {
        resolve(this);
      })
      .on("error", reject);
  });
}

handleMain(main());
