import { handleMain, program, requireNonnull } from "./lib/utils";
import * as fs from "fs";
import { PNG } from "pngjs";

const USAGE = `${program()} <input dtm raw> <width> <output dtn png>`;

async function main() {
  const src = process.argv[2];
  const width = parseInt(process.argv[3] ?? "");
  const dst = process.argv[4];

  if (src === undefined || isNaN(width) || width < 1 || dst === undefined) {
    console.error(USAGE);
    return 1;
  }

  const raw = await fs.promises.readFile(src);
  if (raw.length % 2 !== 0) throw Error(`Invalid raw data format: dataLength=${raw.length.toString()}`);
  if ((raw.length / 2) % width !== 0)
    throw Error(`Invalid raw data or width: dataLength=${raw.length.toString()} width=${width.toString()}`);

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
    png.data[i * 2] = requireNonnull(raw[i + 1]);
    png.data[i * 2 + 1] = requireNonnull(raw[i + 1]);
    png.data[i * 2 + 2] = requireNonnull(raw[i + 1]);
    png.data[i * 2 + 3] = requireNonnull(raw[i]);
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
