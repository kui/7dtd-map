import * as mapFiles from "../../lib/map-files.ts";
import * as storage from "../lib/storage.ts";
import { handleOneshotWorker } from "./lib/oneshot-worker.ts";
import type {
  FileProcessorInputMessage,
  FileProcessorOutputMessage,
} from "./types.ts";

handleOneshotWorker<FileProcessorInputMessage, FileProcessorOutputMessage>(
  main,
);

async function main(
  inMessage: FileProcessorInputMessage,
): Promise<FileProcessorOutputMessage> {
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
  try {
    await processor.process(
      blob.stream(),
      await workspace.createWritable(outName),
    );
  } catch (e) {
    // WHY: the output file is created before processing starts, so a failure would otherwise strand a partial (often zero-byte) file in OPFS that breaks every later page load until the user clears site data (#246).
    await workspace.remove(outName).catch(() => {});
    throw e;
  }
  return { name: outName, size: await workspace.size(outName) };
}
