import { DtmHandler } from "../index/dtm-handler.ts";
import type { FileHandler } from "../index/file-handler.ts";
import type { MapFileName } from "../../lib/map-files.ts";
import * as events from "../lib/events.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { spy as fn } from "@std/testing/mock";

type FileHandlerEventMessage = MapFileName[];

function createStubFileHandler() {
  const listeners = new events.ListenerManager<FileHandlerEventMessage>();
  const stub: Pick<FileHandler, "addListener"> = {
    addListener: (fn) => {
      listeners.addListener(fn);
    },
  };
  return {
    fileHandler: stub as FileHandler,
    emit: (msg: FileHandlerEventMessage) => listeners.dispatch(msg),
  };
}

const dummyWorkerFactory = (): Worker => {
  throw new Error("worker factory should not be called in this test");
};

describe("DtmHandler listeners", () => {
  it("fires update when map_info.xml is in the update list", async () => {
    const { fileHandler, emit } = createStubFileHandler();
    const dtm = new DtmHandler(dummyWorkerFactory, fileHandler);
    const listener = fn();
    dtm.addListener(listener);

    await emit(["map_info.xml"]);

    expect(listener.calls.length).toBe(1);
  });

  it("fires update when dtm_block.raw.gz is in the update list", async () => {
    const { fileHandler, emit } = createStubFileHandler();
    const dtm = new DtmHandler(dummyWorkerFactory, fileHandler);
    const listener = fn();
    dtm.addListener(listener);

    await emit(["dtm_block.raw.gz"]);

    expect(listener.calls.length).toBe(1);
  });

  it("does not fire update for unrelated file changes", async () => {
    const { fileHandler, emit } = createStubFileHandler();
    const dtm = new DtmHandler(dummyWorkerFactory, fileHandler);
    const listener = fn();
    dtm.addListener(listener);

    await emit(["biomes.png", "prefabs.xml"]);

    expect(listener.calls.length).toBe(0);
  });
});
