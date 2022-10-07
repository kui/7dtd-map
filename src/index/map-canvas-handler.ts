import { MapStorage } from "../lib/map-storage";
import { imageBitmapToPngBlob } from "../lib/utils";
import * as mapRenderer from "../worker/map-renderer";
import { LoadingHandler } from "./loading-handler";

const FIELDNAME_STORAGENAME_MAP = {
  biomesImg: "biomes",
  splat3Img: "splat3",
  splat4Img: "splat4",
  radImg: "rad",
} as const;

interface Doms {
  canvas: HTMLCanvasElement;
  biomesAlpha: HTMLInputElement;
  splat3Alpha: HTMLInputElement;
  splat4Alpha: HTMLInputElement;
  radAlpha: HTMLInputElement;
  signSize: HTMLInputElement;
  signAlpha: HTMLInputElement;
  brightness: HTMLInputElement;
  scale: HTMLInputElement;
}

export class MapCanvasHandler {
  private doms: Doms;
  private worker: Worker;
  private storage: MapStorage;
  private mapSizeListeners: ((mapSize: GameMapSize) => Promise<unknown> | unknown)[] = [];

  constructor(doms: Doms, worker: Worker, storage: MapStorage, loadingHandler: LoadingHandler) {
    this.doms = doms;
    this.worker = worker;
    this.storage = storage;

    this.update({
      canvas: doms.canvas.transferControlToOffscreen(),
      ...this.biomesAlpha(),
      ...this.splat3Alpha(),
      ...this.splat4Alpha(),
      ...this.radAlpha(),
      ...this.brightness(),
      ...this.signSize(),
      ...this.signAlpha(),
      ...this.scale(),
    });

    MapStorage.addListener(async () => {
      console.log("Change map: ", await storage.currentId());
      this.update({ biomesImg: null, splat3Img: null, splat4Img: null, radImg: null }, false);
      loadingHandler.add(["bioms", "splat3", "splat4", "radiation"]);
      this.update({ biomesImg: (await storage.getCurrent("biomes"))?.data }, false);
      loadingHandler.delete("bioms");
      this.update({ splat3Img: (await storage.getCurrent("splat3"))?.data }, false);
      loadingHandler.delete("splat3");
      this.update({ splat4Img: (await storage.getCurrent("splat4"))?.data }, false);
      loadingHandler.delete("splat4");
      this.update({ radImg: (await storage.getCurrent("rad"))?.data }, false);
      loadingHandler.delete("radiation");
    });

    worker.addEventListener("message", (e: MessageEvent<mapRenderer.OutMessage>) => {
      const { mapSize } = e.data;
      this.mapSizeListeners.map((fn) => fn(mapSize));
    });
    doms.biomesAlpha.addEventListener("input", () => this.update(this.biomesAlpha()));
    doms.splat3Alpha.addEventListener("input", () => this.update(this.splat3Alpha()));
    doms.splat4Alpha.addEventListener("input", () => this.update(this.splat4Alpha()));
    doms.radAlpha.addEventListener("input", () => this.update(this.radAlpha()));
    doms.signSize.addEventListener("input", () => this.update(this.signSize()));
    doms.signAlpha.addEventListener("input", () => this.update(this.signAlpha()));
    doms.brightness.addEventListener("input", () => this.update(this.brightness()));
    doms.scale.addEventListener("input", () => this.update(this.scale()));
  }

  async update(msg: mapRenderer.InMessage, shouldStore = true): Promise<void> {
    if (shouldStore) {
      for (const entry of Object.entries(msg)) {
        if (isStoreTarget(entry)) {
          this.storage.put(FIELDNAME_STORAGENAME_MAP[entry[0]], await imageBitmapToPngBlob(entry[1]));
        }
      }
    }
    const transferables = Object.values(msg).filter(isTransferable);
    this.worker.postMessage(msg, transferables);
  }

  addMapSizeListener(ln: (mapSize: GameMapSize) => Promise<unknown> | unknown): void {
    this.mapSizeListeners.push(ln);
  }

  private biomesAlpha() {
    return { biomesAlpha: this.doms.biomesAlpha.valueAsNumber };
  }
  private splat3Alpha() {
    return { splat3Alpha: this.doms.splat3Alpha.valueAsNumber };
  }
  private splat4Alpha() {
    return { splat4Alpha: this.doms.splat4Alpha.valueAsNumber };
  }
  private radAlpha() {
    return { radAlpha: this.doms.radAlpha.valueAsNumber };
  }
  private signSize() {
    return { signSize: this.doms.signSize.valueAsNumber };
  }
  private signAlpha() {
    return { signAlpha: this.doms.signAlpha.valueAsNumber };
  }
  private brightness() {
    return { brightness: `${this.doms.brightness.valueAsNumber}%` };
  }
  private scale() {
    return { scale: this.doms.scale.valueAsNumber };
  }
}

function isTransferable(v: unknown): v is ImageBitmap | OffscreenCanvas {
  return v instanceof ImageBitmap || v instanceof OffscreenCanvas;
}

function isStoreTarget(e: [string, unknown]): e is [keyof typeof FIELDNAME_STORAGENAME_MAP, ImageBitmap] {
  return e[0] in FIELDNAME_STORAGENAME_MAP;
}
