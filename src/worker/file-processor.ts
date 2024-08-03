import * as storage from "../lib/storage";
import { setPNG, MapFileProcessor, MAP_FILE_NAME_MAP } from "../../lib/map-files.js";
import * as pngjs from "pngjs/browser";

//
// Process world fiels into map files and store it in the workspace
//

setPNG(pngjs.PNG);

export const ACCEPTABLE_FILE_NAMES = [
  "biomes.png",
  "splat3.png",
  "splat3_processed.png",
  "splat4.png",
  "splat4_processed.png",
  "radiation.png",
  "dtm.raw",
] as const;
export type AcceptableFileName = (typeof ACCEPTABLE_FILE_NAMES)[number];
export const PROCESSED_FILE_NAMES = ACCEPTABLE_FILE_NAMES.map((name) => {
  if (name in MAP_FILE_NAME_MAP) return MAP_FILE_NAME_MAP[name as keyof typeof MAP_FILE_NAME_MAP];
  return name as Exclude<AcceptableFileName, keyof typeof MAP_FILE_NAME_MAP>;
}) as (typeof MAP_FILE_NAME_MAP)[AcceptableFileName][];
export type ProcessedFileName = (typeof PROCESSED_FILE_NAMES)[number];
export type InMessage = { name: AcceptableFileName; blob: Blob } | { name: AcceptableFileName; url: string };
export interface SuccessOutMessage {
  name: ProcessedFileName;
  size: number;
}
export interface ErrorOutMessage {
  error: string;
}
export type OutMessage = SuccessOutMessage | ErrorOutMessage;

onmessage = async (event: MessageEvent<InMessage>) => {
  const out = await main(event.data).catch((e: unknown) => {
    if ("object" === typeof e && e !== null && "message" in e) return { error: e.message };
    else return { error: String(e) };
  });
  postMessage(out);
};

async function main(inMessage: InMessage): Promise<OutMessage> {
  let blob;
  if ("blob" in inMessage) {
    blob = inMessage.blob;
  } else {
    const response = await fetch(inMessage.url);
    if (!response.ok) throw Error(`Failed to fetch ${inMessage.url}: ${response.statusText}`);
    blob = await response.blob();
  }

  const processor = new MapFileProcessor(inMessage.name);
  const outName = processor.mapFileName;
  const workspace = await storage.workspaceDir();
  await processor.process(blob.stream(), await workspace.createWritable(outName));
  return { name: outName, size: await workspace.size(outName) };
}
