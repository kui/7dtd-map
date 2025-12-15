import { DtmBlockRawDecompressor } from "../../lib/map-files.ts";
import * as storage from "../lib/storage.ts";
import { printError, readWholeStream } from "../lib/utils.ts";

export type OutMessage = null | Uint8Array;

async function main() {
  const workspace = await storage.workspaceDir();
  let msg: OutMessage = null;
  try {
    msg = await readDtmBlockRaw(workspace);
  } catch (e) {
    printError(e);
  }
  postMessage(msg, msg ? [msg.buffer] : []);
  close();
}

async function readDtmBlockRaw(workspace: storage.MapDir): Promise<Uint8Array | null> {
  const file = await workspace.get("dtm_block.raw.gz");
  if (!file) return null;
  return readWholeStream(file.stream().pipeThrough(new DtmBlockRawDecompressor() as TransformStream<Uint8Array, Uint8Array>));
}

main().catch(printError);
