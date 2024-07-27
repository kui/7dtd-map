import { handleMain, program } from "./lib/utils.js";
import { parseXml, MapInfoXml } from "./lib/xml-parser.js";

const usage = `${program()} map_info.xml
Print the width of the map.`;

async function main() {
  const xmlFile = process.argv[2];
  if (xmlFile === undefined) {
    console.error(usage);
    return 1;
  }
  const xml = await parseXml<MapInfoXml>(xmlFile);
  const size = xml.MapInfo.property.find((p) => p.$.name === "HeightMapSize")?.$.value;
  if (size === undefined) {
    console.error("HeightMapSize not found");
    return 1;
  }
  console.log(size.split(",")[0]?.trim());
  return 0;
}

handleMain(main());
