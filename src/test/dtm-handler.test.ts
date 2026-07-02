import { Dtm, DtmHandler } from "../index/dtm-handler.ts";
import type { FileHandler } from "../index/file-handler.ts";
import type { MapFileName } from "../../lib/map-files.ts";
import * as events from "../lib/events.ts";
import { gameMapSize } from "../lib/utils.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { spy as fn } from "@std/testing/mock";
import * as three from "three";

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

describe("Dtm.writeY", () => {
  it("fills y from DTM data for each vertex", () => {
    const geo = new three.PlaneGeometry(3, 3, 3, 3);
    geo.rotateX(-Math.PI / 2);
    const mapSize = gameMapSize({ width: 4, height: 4 });
    const data = new Uint8Array(16);
    for (let i = 0; i < 16; i++) data[i] = i;
    const dtm = new Dtm(data, mapSize);

    dtm.writeY(geo);

    const pos = geo.attributes["position"] as three.BufferAttribute;
    const arr = pos.array as Float32Array;
    // scaleFactor = (4 - 1) / 3 = 1
    // PlaneGeometry vertices start at the top (iy=0) and move downward,
    // so dataZ decreases as i increases row-by-row.
    for (let i = 0, j = 0; i < pos.count; i++, j += 3) {
      const ix = i % 4;
      const iy = 3 - Math.floor(i / 4);
      const expected = data[ix + iy * 4] / 1;
      expect(arr[j + 1]).toBe(expected);
      expect(pos.getY(i)).toBe(expected);
    }
  });

  it("clamps out-of-range coordinates to the DTM boundary", () => {
    const geo = new three.PlaneGeometry(4, 4, 4, 4);
    geo.rotateX(-Math.PI / 2);
    const mapSize = gameMapSize({ width: 4, height: 4 });
    const data = new Uint8Array(16);
    for (let i = 0; i < 16; i++) data[i] = i + 10;
    const dtm = new Dtm(data, mapSize);

    // Push one vertex far outside the map to force clamping.
    const pos = geo.attributes["position"] as three.BufferAttribute;
    const arr = pos.array as Float32Array;
    arr[0] = 100; // x -> game coords far beyond +halfW
    arr[2] = -100; // z -> game coords far beyond +halfH

    dtm.writeY(geo);

    // scaleFactor = (4 - 1) / 4 = 0.75
    // dataX/dataZ would be ~76 without clamp, clamped to maxX/maxZ = 3.
    const expected = data[3 + 3 * 4] / 0.75;
    expect(arr[1]).toBeCloseTo(expected, 5);
  });

  it("throws when position attribute itemSize is not 3", () => {
    const geo = new three.PlaneGeometry(1, 1);
    const pos = geo.attributes["position"] as three.BufferAttribute;
    pos.itemSize = 2;
    const dtm = new Dtm(
      new Uint8Array(1),
      gameMapSize({ width: 1, height: 1 }),
    );
    expect(() => dtm.writeY(geo)).toThrow("Unexpected item size");
  });
});
