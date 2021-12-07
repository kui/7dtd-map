import path from "path";
import { handleMain } from "./lib/utils";
import * as fs from "fs";
import { PNG } from "pngjs";

const CMD = `npx ts-node ${path.basename(process.argv[1])}`;
const USAGE = `${CMD} <input dtm raw> <width> <output dtn png>
`;

async function main() {
  if (process.argv.length !== 5) {
    console.error(USAGE);
    return 1;
  }

  const src = process.argv[2];
  const width = parseInt(process.argv[3]);
  const dst = process.argv[4];

  const raw = await fs.promises.readFile(src);
  if (raw.length % 2 !== 0) throw Error(`Invalid raw data format: dataLength=${raw.length}`);
  if ((raw.length / 2) % width !== 0) throw Error(`Invalid raw data or width: dataLength=${raw.length} width=${width}`);

  const height = raw.length / 2 / width;

  console.log({ width, height });

  const png = new PNG({
    width,
    height,
    colorType: 4, // grayscale & alpha
  });
  for (let i = 0; i < raw.length; i += 2) {
    // raw[i] Sub height
    // raw[i + 1] Height
    png.data[i * 2] = raw[i + 1];
    png.data[i * 2 + 1] = raw[i + 1];
    png.data[i * 2 + 2] = raw[i + 1];
    png.data[i * 2 + 3] = raw[i];
  }

  await new Promise((rs, rj) => {
    png.pack().pipe(fs.createWriteStream(dst)).on("finish", rs).on("error", rj);
  });

  const srcSize = (await fs.promises.stat(src)).size;
  const dstSize = (await fs.promises.stat(dst)).size;

  console.log("Compress: %d (%d / %d)", (dstSize / srcSize) * 100, dstSize, srcSize);

  return 0;
}

handleMain(main());
