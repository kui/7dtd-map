import { DtmBlockRawDecompressor } from "../../lib/map-files";
import * as storage from "../lib/storage";
import { printError, readWholeStream } from "../lib/utils";

export type OutMessage = null | Uint8Array;

async function main() {
  const workspace = await storage.workspaceDir();
  let msg: OutMessage = null;
  try {
    msg = await readDtmBlockRaw(workspace);
  } catch (e) {
    console.error(e);
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
