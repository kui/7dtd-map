import type * as three from "three";
import type { DtmOutputMessage } from "../worker/types.ts";
import type { FileHandler } from "./file-handler.ts";
import type { GameCoords, GameMapSize } from "../types/7dtdmap.ts";

import { gameMapSize, requireNonnull } from "../lib/utils.ts";
import { CacheHolder } from "../lib/cache-holder.ts";
import { runOneshotWorker } from "../lib/oneshot-worker.ts";
import * as storage from "../lib/storage.ts";
import * as events from "../lib/events.ts";

type EventMessage = Record<string, never>;

export class DtmHandler {
  #dtmRaw: CacheHolder<Uint8Array | null>;
  #mapSize = new CacheHolder<GameMapSize | null>(
    () => getHightMapSize(),
    () => {
      // Do nothing
    },
  );
  #listeners = new events.ListenerManager<EventMessage>();

  constructor(workerFactory: () => Worker, fileHandler: FileHandler) {
    this.#dtmRaw = new CacheHolder<Uint8Array | null>(
      async () => {
        try {
          return await runOneshotWorker<void, DtmOutputMessage>(
            workerFactory(),
            undefined,
          );
        } catch (e) {
          console.warn("DTM worker failed:", e);
          return null;
        }
      },
      () => {
        // Do nothing
      },
    );

    fileHandler.addListener(async (fileNames) => {
      const dtmChanged = fileNames.includes("dtm_block.raw.gz");
      const mapSizeChanged = fileNames.includes("map_info.xml");
      if (dtmChanged) this.#dtmRaw.invalidate();
      if (mapSizeChanged) this.#mapSize.invalidate();
      if (dtmChanged || mapSizeChanged) {
        await this.#listeners.dispatch({});
      }
    });
  }

  addListener(fn: events.Listener<EventMessage>) {
    this.#listeners.addListener(fn);
  }

  size(): Promise<GameMapSize | null> {
    return this.#mapSize.get();
  }

  async getElevation(coords: GameCoords): Promise<number | null> {
    const size = await this.#mapSize.get();
    return size
      ? new Dtm(await this.#dtmRaw.get(), size).getElevation(coords)
      : null;
  }

  async writeY(geo: three.PlaneGeometry): Promise<void> {
    const size = await this.#mapSize.get();
    if (!size) return;
    new Dtm(await this.#dtmRaw.get(), size).writeY(geo);
  }
}

export class Dtm {
  #data: Uint8Array | null;
  #mapSize: GameMapSize;

  constructor(dtmBlockRaw: Uint8Array | null, mapSize: GameMapSize) {
    this.#data = dtmBlockRaw;
    this.#mapSize = mapSize;
  }

  get size(): GameMapSize {
    return this.#mapSize;
  }

  getElevation(coords: GameCoords): number | null {
    if (!this.#data) return null;

    const { width, height } = this.#mapSize;
    if (
      this.#data.byteLength % width !== 0 ||
      this.#data.byteLength / width !== height
    ) {
      console.warn(
        "Game map size does not match with DTM byte array length:",
        "mapSize=",
        this.#mapSize,
        "data.byteLength=",
        this.#data.byteLength,
      );
      return null;
    }

    // In-game coords with left-top offset
    const x = Math.floor(width / 2) + coords.x;
    const z = Math.floor(height / 2) + coords.z;
    const elev = this.#data[x + z * width];
    return elev ?? null;
  }

  // `geo` must already be rotated into the XZ ground plane (+Y normal),
  // i.e. `geo.rotateX(-Math.PI / 2)` has been applied to a fresh
  // PlaneGeometry before calling this.
  writeY(geo: three.PlaneGeometry) {
    if (!this.#data) return;

    const { width, height } = this.#mapSize;
    if (
      this.#data.byteLength % width !== 0 ||
      this.#data.byteLength / width !== height
    ) {
      console.warn(
        "Game map size does not match with DTM byte array length:",
        "mapSize=",
        this.#mapSize,
        "data.byteLength=",
        this.#data.byteLength,
      );
      return;
    }

    const pos = requireNonnull(
      geo.attributes["position"],
      () => "No position attribute",
    );
    if (pos.itemSize !== 3) {
      throw Error("Unexpected item size of position attribute");
    }

    const scaleFactor = (this.#mapSize.width - 1) / geo.parameters.width;
    const halfW = geo.parameters.width / 2;
    const halfH = geo.parameters.height / 2;
    const maxX = width - 1;
    const maxZ = height - 1;

    // pos.array layout is interleaved (x, y, z) per vertex. Bypassing
    // getX/getY/setZ avoids per-call overhead that is significant across
    // ~4M vertices.
    const arr = pos.array as Float32Array;
    for (let i = 0, j = 0; i < pos.count; i++, j += 3) {
      // game axis -> webgl axis: game x -> x, game z(row) -> -z, elevation -> y
      const px = arr[j] as number;
      const pz = arr[j + 2] as number;
      let dataX = Math.round((px + halfW) * scaleFactor);
      let dataZ = Math.round((halfH - pz) * scaleFactor);
      // Plane vertices on the +width/+height edge round to width/height,
      // one past the last valid DTM index. Clamp to keep sampling in range.
      if (dataX < 0) dataX = 0;
      else if (dataX > maxX) dataX = maxX;
      if (dataZ < 0) dataZ = 0;
      else if (dataZ > maxZ) dataZ = maxZ;
      // Elevation byte is in game meters; divide by scaleFactor to convert
      // to the geometry's local units (which are already shrunk by the same
      // ratio horizontally).
      // deno-lint-ignore no-non-null-assertion
      arr[j + 1] = this.#data[dataX + dataZ * width]! / scaleFactor;
    }
  }
}

async function getHightMapSize(): Promise<GameMapSize | null> {
  const workspace = await storage.workspaceDir();
  const file = await workspace.get("map_info.xml");
  if (!file) return null;
  const doc = new DOMParser().parseFromString(
    await file.text(),
    "application/xml",
  );
  const size = doc.querySelector("property[name=HeightMapSize]")?.getAttribute(
    "value",
  );
  if (!size) {
    console.warn("HeightMapSize not found in map_info.xml");
    return null;
  }
  const [width, height] = size.split(",").map((s) => parseInt(s));
  if (!width || isNaN(width) || !height || isNaN(height)) {
    console.warn(
      "Invalid HeightMapSize: size=",
      size,
      "width=",
      width,
      "height=",
      height,
    );
    return null;
  }
  return gameMapSize({ width, height });
}
