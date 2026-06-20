import { DtmBlockRawDecompressor } from "../../lib/map-files.ts";
import * as storage from "../lib/storage.ts";
import { readWholeStream } from "../lib/utils.ts";
import { handleOneshotWorker } from "./lib/oneshot-worker.ts";
import type { DtmOutputMessage } from "./types.ts";

handleOneshotWorker<void, DtmOutputMessage>(
  () => readDtmBlockRaw(),
  (buf) => (buf ? [buf.buffer as ArrayBuffer] : []),
);

async function readDtmBlockRaw(): Promise<Uint8Array | null> {
  const workspace = await storage.workspaceDir();
  const file = await workspace.get("dtm_block.raw.gz");
  if (!file) return null;
  return readWholeStream(
    file.stream().pipeThrough(
      new DtmBlockRawDecompressor() as TransformStream<Uint8Array, Uint8Array>,
    ),
  );
}
