import type * as mapRenderer from "../worker/map-renderer";

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
  private updateListeners: ((mapSize: GameMapSize) => unknown)[] = [];

  constructor(doms: Doms, worker: Worker) {
    this.doms = doms;
    this.worker = worker;

    const canvas =doms.canvas.transferControlToOffscreen()
    worker.postMessage({
      canvas,
      ...this.biomesAlpha(),
      ...this.splat3Alpha(),
      ...this.splat4Alpha(),
      ...this.radAlpha(),
      ...this.brightness(),
      ...this.signSize(),
      ...this.signAlpha(),
      ...this.scale(),
    }, [canvas]);

    worker.addEventListener("message", (e: MessageEvent<mapRenderer.OutMessage>) => {
      const { mapSize } = e.data;
      this.updateListeners.forEach((fn) => fn(mapSize));
    });
    doms.biomesAlpha.addEventListener("input", () => {
      this.update(this.biomesAlpha());
    });
    doms.splat3Alpha.addEventListener("input", () => {
      this.update(this.splat3Alpha());
    });
    doms.splat4Alpha.addEventListener("input", () => {
      this.update(this.splat4Alpha());
    });
    doms.radAlpha.addEventListener("input", () => {
      this.update(this.radAlpha());
    });
    doms.signSize.addEventListener("input", () => {
      this.update(this.signSize());
    });
    doms.signAlpha.addEventListener("input", () => {
      this.update(this.signAlpha());
    });
    doms.brightness.addEventListener("input", () => {
      this.update(this.brightness());
    });
    doms.scale.addEventListener("input", () => {
      this.update(this.scale());
    });
  }

  update(msg: mapRenderer.InMessage) {
    const transferables = Object.values(msg).filter(isTransferable);
    this.worker.postMessage(msg, transferables);
  }

  addMapSizeListener(ln: (mapSize: GameMapSize) => unknown) {
    this.updateListeners.push(ln);
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
    return { brightness: `${this.doms.brightness.valueAsNumber.toString()}%` };
  }
  private scale() {
    return { scale: this.doms.scale.valueAsNumber };
  }
}

type InMessageValue = mapRenderer.InMessage[keyof mapRenderer.InMessage];

function isTransferable(v: InMessageValue): v is ImageBitmap | OffscreenCanvas  {
  return v instanceof ImageBitmap || v instanceof OffscreenCanvas ;
}
