import type * as mapRenderer from "../worker/map-renderer";
import type { PrefabsHandler } from "./prefabs-handler";
import type { MarkerHandler } from "./marker-handler";
import type { FileHandler } from "./file-handler";
import { printError } from "../lib/utils";

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

interface MapRendererWorker extends Worker {
  postMessage(message: mapRenderer.InMessage, transfer: Transferable[]): void;
  postMessage(message: mapRenderer.InMessage, options?: StructuredSerializeOptions): void;
}

const DEPENDENT_FILES = ["biomes.png", "splat3.png", "splat4.png", "radiation.png"] as const;
type DependentFile = (typeof DEPENDENT_FILES)[number];

export class MapCanvasHandler {
  #updateListeners: ((mapSize: GameMapSize) => unknown)[] = [];

  constructor(
    doms: Doms,
    worker: MapRendererWorker,
    prefabsHandler: PrefabsHandler,
    markerHandler: MarkerHandler,
    fileHandler: FileHandler,
  ) {
    const canvas = doms.canvas.transferControlToOffscreen();
    worker.postMessage(
      {
        canvas,
        biomesAlpha: doms.biomesAlpha.valueAsNumber,
        splat3Alpha: doms.splat3Alpha.valueAsNumber,
        splat4Alpha: doms.splat4Alpha.valueAsNumber,
        radAlpha: doms.radAlpha.valueAsNumber,
        brightness: `${doms.brightness.valueAsNumber.toString()}%`,
        signSize: doms.signSize.valueAsNumber,
        signAlpha: doms.signAlpha.valueAsNumber,
        scale: doms.scale.valueAsNumber,
      },
      [canvas],
    );

    worker.addEventListener("message", (e: MessageEvent<mapRenderer.OutMessage>) => {
      const { mapSize } = e.data;
      Promise.allSettled(this.#updateListeners.map((fn) => fn(mapSize))).catch(printError);
    });
    doms.biomesAlpha.addEventListener("input", () => {
      worker.postMessage({ biomesAlpha: doms.biomesAlpha.valueAsNumber });
    });
    doms.splat3Alpha.addEventListener("input", () => {
      worker.postMessage({ splat3Alpha: doms.splat3Alpha.valueAsNumber });
    });
    doms.splat4Alpha.addEventListener("input", () => {
      worker.postMessage({ splat4Alpha: doms.splat4Alpha.valueAsNumber });
    });
    doms.radAlpha.addEventListener("input", () => {
      worker.postMessage({ radAlpha: doms.radAlpha.valueAsNumber });
    });
    doms.signSize.addEventListener("input", () => {
      worker.postMessage({ signSize: doms.signSize.valueAsNumber });
    });
    doms.signAlpha.addEventListener("input", () => {
      worker.postMessage({ signAlpha: doms.signAlpha.valueAsNumber });
    });
    doms.brightness.addEventListener("input", () => {
      worker.postMessage({ brightness: `${doms.brightness.valueAsNumber.toString()}%` });
    });
    doms.scale.addEventListener("input", () => {
      worker.postMessage({ scale: doms.scale.valueAsNumber });
    });
    prefabsHandler.addListener((prefabs) => {
      worker.postMessage({ prefabs });
    });
    markerHandler.addListener((markerCoords) => {
      worker.postMessage({ markerCoords });
    });
    fileHandler.addListener((fileNames) => {
      const invalidate: DependentFile[] = [];
      for (const n of fileNames) {
        if (DEPENDENT_FILES.includes(n as DependentFile)) invalidate.push(n as DependentFile);
      }
      worker.postMessage({ invalidate });
    });
  }

  addUpdateListener(ln: (mapSize: GameMapSize) => unknown) {
    this.#updateListeners.push(ln);
  }
}
