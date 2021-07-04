import { MapStorage } from "../lib/map-storage";
import { MapRendererInMessage, MapRendererOutMessage } from "../map-renderer";

interface Doms {
  canvas: HTMLCanvasElement;
  signSize: HTMLInputElement;
  brightness: HTMLInputElement;
  scale: HTMLInputElement;
}

export class MapCanvasHandler {
  private doms: Doms;
  private worker: Worker;
  private storage: MapStorage;
  private mapSizeListeners: ((mapSize: RectSize) => Promise<unknown> | unknown)[] = [];

  constructor(doms: Doms, worker: Worker, storage: MapStorage) {
    this.doms = doms;
    this.worker = worker;
    this.storage = storage;

    this.update({
      canvas: doms.canvas.transferControlToOffscreen(),
      ...this.brightness(),
      ...this.signSize(),
      ...this.scale(),
    });

    worker.addEventListener("message", (e: MessageEvent<MapRendererOutMessage>) => {
      this.mapSizeListeners.map((fn) => fn(e.data.mapSizes));
    });
    doms.signSize.addEventListener("input", () => this.update(this.signSize()));
    doms.brightness.addEventListener("input", () => this.update(this.brightness()));
    doms.scale.addEventListener("input", () => this.update(this.scale()));
  }

  update(msg: MapRendererInMessage): void {
    const transferables = Object.values(msg).filter(isTransferable);
    this.worker.postMessage(msg, transferables);
  }

  addMapSizeListener(ln: (mapSize: RectSize) => Promise<unknown> | unknown): void {
    this.mapSizeListeners.push(ln);
  }

  private signSize() {
    return { signSize: parseInt(this.doms.signSize.value) };
  }
  private brightness() {
    return { brightness: `${this.doms.brightness.value}%` };
  }
  private scale() {
    return { scale: parseFloat(this.doms.scale.value) };
  }
}

function isTransferable(v: unknown): v is ImageBitmap | OffscreenCanvas {
  return v instanceof ImageBitmap || v instanceof OffscreenCanvas;
}
