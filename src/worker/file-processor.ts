import * as pngjs from "npm:pngjs@^7.0.0";
import * as mapFiles from "../../lib/map-files.ts";
import * as storage from "../lib/storage.ts";

//
// Process world fiels into map files and store it in the workspace
//

mapFiles.setPNG(pngjs.PNG);

export type InMessage = { name: mapFiles.WorldFileName; blob: Blob } | {
  name: mapFiles.WorldFileName;
  url: string;
};
export interface SuccessOutMessage {
  name: mapFiles.MapFileName;
  size: number;
}
export interface ErrorOutMessage {
  error: string;
}
export type OutMessage = SuccessOutMessage | ErrorOutMessage;

onmessage = async (event: MessageEvent<InMessage>) => {
  const out = await main(event.data).catch((e: unknown) => ({
    error: String(e),
  }));
  postMessage(out);
};

async function main(inMessage: InMessage): Promise<OutMessage> {
  let blob;
  if ("blob" in inMessage) {
    blob = inMessage.blob;
  } else if ("url" in inMessage) {
    const response = await fetch(inMessage.url);
    if (!response.ok) {
      throw Error(`Failed to fetch ${inMessage.url}: ${response.statusText}`);
    }
    blob = await response.blob();
  } else {
    throw Error(`Unexpected message: ${JSON.stringify(inMessage)}`);
  }

  const processor = new mapFiles.Processor(inMessage.name);
  const outName = processor.mapFileName;
  const workspace = await storage.workspaceDir();
  await processor.process(
    blob.stream(),
    await workspace.createWritable(outName),
  );
  return { name: outName, size: await workspace.size(outName) };
}
