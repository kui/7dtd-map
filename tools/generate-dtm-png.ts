import { handleMain, program } from "./lib/utils.js";
import * as fs from "node:fs";
import * as stream from "node:stream/promises";
import * as zlib from "node:zlib";
import { PNG } from "pngjs";

const USAGE = `${program()} <0 or 6> dtm.raw <width> dtm.png
Convert raw data to PNG.

The first argument is the raw data format:
  * 0: grayscale. only block height data.
  * 6: grayscale & alpha. the color is block height data and the alpha is sub-block height data.
`;

async function main() {
  const colorType = parseInt(process.argv[2] ?? "");
  const src = process.argv[3];
  const width = parseInt(process.argv[4] ?? "");
  const dst = process.argv[5];

  if ((colorType !== 0 && colorType !== 6) || src === undefined || isNaN(width) || width < 1 || dst === undefined) {
    console.error(USAGE);
    return 1;
  }

  const raw = await fs.promises.readFile(src);
  if (raw.length % 2 !== 0) throw Error(`Invalid raw data format: dataLength=${raw.length.toString()}`);
  if ((raw.length / 2) % width !== 0)
    throw Error(`Invalid raw data or width: dataLength=${raw.length.toString()} width=${width.toString()}`);

  const height = raw.length / 2 / width;

  console.log({ width, height });

  const deflateLevel = zlib.constants.Z_BEST_COMPRESSION;
  const deflateStrategy = zlib.constants.Z_DEFAULT_STRATEGY;
  console.log({ deflateLevel, deflateStrategy });
  const png = new PNG({ width, height, colorType, deflateLevel, deflateStrategy });
  for (let i = 0; i < raw.length; i += 2) {
    // raw[i] Sub height
    // raw[i + 1] Height
    png.data[i * 2] = raw[i + 1] as unknown as number;
    png.data[i * 2 + 1] = raw[i + 1] as unknown as number;
    png.data[i * 2 + 2] = raw[i + 1] as unknown as number;
    png.data[i * 2 + 3] = colorType === 6 ? (raw[i] as unknown as number) : 255;
  }

  await stream.pipeline(png.pack(), fs.createWriteStream(dst));

  const srcSize = (await fs.promises.stat(src)).size;
  const dstSize = (await fs.promises.stat(dst)).size;

  console.log("Compress: %d% (%d / %d)", ((dstSize / srcSize) * 100).toPrecision(4), dstSize, srcSize);

  return 0;
}

handleMain(main());
