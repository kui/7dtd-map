import type * as three from "three";
import type * as dtmWorker from "../worker/dtm";
import type { FileHandler } from "./file-handler";

import { gameMapSize, requireNonnull } from "../lib/utils";
import { CacheHolder } from "../lib/cache-holder";
import * as storage from "../lib/storage";

export class DtmHandler {
  #dtmRaw: CacheHolder<Uint8Array | null>;
  #mapSize = new CacheHolder<GameMapSize | null>(
    () => getHightMapSize(),
    () => {
      // Do nothing
    },
  );

  constructor(workerFactory: () => Worker, fileHandler: FileHandler) {
    this.#dtmRaw = new CacheHolder<Uint8Array | null>(
      async () => {
        const worker = workerFactory();
        return new Promise((resolve) => {
          worker.addEventListener("message", ({ data }: MessageEvent<dtmWorker.OutMessage>) => {
            worker.terminate();
            resolve(data);
          });
        });
      },
      () => {
        // Do nothing
      },
    );

    fileHandler.addListener(({ update: fileNames }) => {
      if (fileNames.includes("dtm_block.raw.gz")) this.#dtmRaw.invalidate();
      if (fileNames.includes("map_info.xml")) this.#mapSize.invalidate();
    });
  }

  async size(): Promise<GameMapSize | null> {
    return this.#mapSize.get();
  }

  async getElevation(coords: GameCoords): Promise<number | null> {
    const size = await this.#mapSize.get();
    return size ? new Dtm(await this.#dtmRaw.get(), size).getElevation(coords) : null;
  }

  async writeZ(geo: three.PlaneGeometry): Promise<void> {
    const size = await this.#mapSize.get();
    if (!size) return;
    new Dtm(await this.#dtmRaw.get(), size).writeZ(geo);
  }
}

class Dtm {
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
    if (this.#data.byteLength % width !== 0 || this.#data.byteLength / width !== height) {
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

  writeZ(geo: three.PlaneGeometry) {
    if (!this.#data) return;

    const pos = requireNonnull(geo.attributes["position"], () => "No position attribute");
    if (pos.itemSize !== 3) throw Error("Unexpected item size of position attribute");

    const scaleFactor = (this.#mapSize.width - 1) / geo.parameters.width;

    // TODO Try pos.array instead of pos.getX(i) and pos.getY(i) for performance
    for (let i = 0; i < pos.count; i++) {
      // game axis -> webgl axis
      // x -> x
      // y -> z
      // z -> y
      const dataX = Math.round((pos.getX(i) + geo.parameters.width / 2) * scaleFactor);
      const dataZ = Math.round((pos.getY(i) + geo.parameters.height / 2) * scaleFactor);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const elev = this.#data[dataX + dataZ * this.#mapSize.width]! / scaleFactor;
      pos.setZ(i, elev);
    }
  }
}

async function getHightMapSize(): Promise<GameMapSize | null> {
  const workspace = await storage.workspaceDir();
  const file = await workspace.get("map_info.xml");
  if (!file) return null;
  const doc = new DOMParser().parseFromString(await file.text(), "application/xml");
  const size = doc.querySelector("property[name=HeightMapSize]")?.getAttribute("value");
  if (!size) {
    console.warn("HeightMapSize not found in map_info.xml");
    return null;
  }
  const [width, height] = size.split(",").map((s) => parseInt(s));
  if (!width || isNaN(width) || !height || isNaN(height)) {
    console.warn("Invalid HeightMapSize: size=", size, "width=", width, "height=", height);
    return null;
  }
  return gameMapSize({ width, height });
}
