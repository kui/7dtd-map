import { MapStorage } from "../lib/map-storage";
import { MapRendererInMessage, MapRendererOutMessage } from "../map-renderer";

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
  private mapSizeListeners: ((mapSize: RectSize) => Promise<unknown> | unknown)[] = [];

  constructor(doms: Doms, worker: Worker, storage: MapStorage) {
    this.doms = doms;
    this.worker = worker;

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
      this.update({ biomesImg: (await storage.getCurrent("biomes"))?.data });
      this.update({ splat3Img: (await storage.getCurrent("splat3"))?.data });
      this.update({ splat4Img: (await storage.getCurrent("splat4"))?.data });
      this.update({ radImg: (await storage.getCurrent("rad"))?.data });
    });

    worker.addEventListener("message", (e: MessageEvent<MapRendererOutMessage>) => {
      const { mapSize: mapSizes } = e.data;
      this.mapSizeListeners.map((fn) => fn(mapSizes));
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

  update(msg: MapRendererInMessage): void {
    console.log(msg);
    const transferables = Object.values(msg).filter(isTransferable);
    this.worker.postMessage(msg, transferables);
  }

  addMapSizeListener(ln: (mapSize: RectSize) => Promise<unknown> | unknown): void {
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
