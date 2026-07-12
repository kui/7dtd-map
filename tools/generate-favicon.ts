import * as fs from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { handleMain, publishDir } from "./lib/utils.ts";
import { buildIco } from "./lib/ico.ts";

/** Standard Windows/browser favicon resolutions. */
const SIZES = [16, 32, 48];

async function main() {
  const svg = await fs.readFile(publishDir("heavy-ballot-x.svg"), "utf-8");

  const images = SIZES.map((size) => {
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
    return { size, png: resvg.render().asPng() };
  });

  const outputPath = publishDir("favicon.ico");
  await fs.writeFile(outputPath, buildIco(images));
  console.log("Wrote %s", outputPath);
  return 0;
}

handleMain(main());
