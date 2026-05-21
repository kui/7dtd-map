import type * as mapRenderer from "../worker/map-renderer.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type { MarkerHandler } from "./marker-handler.ts";
import type { FileHandler } from "./file-handler.ts";
import * as events from "../lib/events.ts";

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

interface EventMessage {
  update: { mapSize: GameMapSize };
}

interface MapRendererWorker extends Worker {
  postMessage(message: mapRenderer.InMessage, transfer: Transferable[]): void;
  postMessage(
    message: mapRenderer.InMessage,
    options?: StructuredSerializeOptions,
  ): void;
}

const DEPENDENT_FILES = [
  "biomes.png",
  "splat3.png",
  "splat4.png",
  "radiation.png",
] as const;
type DependentFile = (typeof DEPENDENT_FILES)[number];

export class MapCanvasHandler {
  #listeners = new events.ListenerManager<"update", EventMessage>();

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

    worker.addEventListener(
      "message",
      ({ data: { mapSize } }: MessageEvent<mapRenderer.OutMessage>) => {
        this.#listeners.dispatchNoAwait({ update: { mapSize } });
      },
    );
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
      worker.postMessage({
        brightness: `${doms.brightness.valueAsNumber.toString()}%`,
      });
    });
    doms.scale.addEventListener("input", () => {
      worker.postMessage({ scale: doms.scale.valueAsNumber });
    });
    prefabsHandler.addListener(({ update: { prefabs } }) => {
      worker.postMessage({ prefabs });
    });
    markerHandler.addListener(({ update: { coords } }) => {
      worker.postMessage({ markerCoords: coords });
    });
    fileHandler.addListener(({ update: fileNames }) => {
      const invalidate: DependentFile[] = [];
      for (const n of fileNames) {
        if (DEPENDENT_FILES.includes(n as DependentFile)) {
          invalidate.push(n as DependentFile);
        }
      }
      worker.postMessage({ invalidate });
    });
  }

  addUpdateListener(ln: (m: EventMessage) => unknown) {
    this.#listeners.addListener(ln);
  }
}
