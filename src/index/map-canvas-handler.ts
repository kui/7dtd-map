import type { MapRendererInputMessage } from "../worker/types.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type { MarkerHandler } from "./marker-handler.ts";
import type { FileHandler } from "./file-handler.ts";
import type { Prefab } from "../types/7dtdmap.ts";

interface Doms {
  canvas: HTMLCanvasElement;
  // Off-DOM mirror of the sign/marker-free composite; its placeholder element
  // is sampled by the terrain viewer as a texture.
  compositeCanvas: HTMLCanvasElement;
  biomesAlpha: HTMLInputElement;
  splat3Alpha: HTMLInputElement;
  splat4Alpha: HTMLInputElement;
  radAlpha: HTMLInputElement;
  prefabSignSize: HTMLInputElement;
  prefabSignAlpha: HTMLInputElement;
  prefabFootprintAlpha: HTMLInputElement;
  brightness: HTMLInputElement;
  scale: HTMLInputElement;
}

interface MapRendererWorker extends Worker {
  postMessage(
    message: MapRendererInputMessage,
    transfer: Transferable[],
  ): void;
  postMessage(
    message: MapRendererInputMessage,
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
  constructor(
    doms: Doms,
    worker: MapRendererWorker,
    prefabsHandler: PrefabsHandler,
    markerHandler: MarkerHandler,
    fileHandler: FileHandler,
  ) {
    const canvas = doms.canvas.transferControlToOffscreen();
    const compositeCanvas = doms.compositeCanvas.transferControlToOffscreen();
    worker.postMessage(
      {
        canvas,
        compositeCanvas,
        biomesAlpha: doms.biomesAlpha.valueAsNumber,
        splat3Alpha: doms.splat3Alpha.valueAsNumber,
        splat4Alpha: doms.splat4Alpha.valueAsNumber,
        radAlpha: doms.radAlpha.valueAsNumber,
        brightness: `${doms.brightness.valueAsNumber.toString()}%`,
        prefabSignSize: doms.prefabSignSize.valueAsNumber,
        prefabSignAlpha: doms.prefabSignAlpha.valueAsNumber,
        prefabFootprintAlpha: doms.prefabFootprintAlpha.valueAsNumber,
        scale: doms.scale.valueAsNumber,
      },
      [canvas, compositeCanvas],
    );

    doms.prefabFootprintAlpha.addEventListener("input", () => {
      worker.postMessage({
        prefabFootprintAlpha: doms.prefabFootprintAlpha.valueAsNumber,
      });
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
    doms.prefabSignSize.addEventListener("input", () => {
      worker.postMessage({ prefabSignSize: doms.prefabSignSize.valueAsNumber });
    });
    doms.prefabSignAlpha.addEventListener("input", () => {
      worker.postMessage({
        prefabSignAlpha: doms.prefabSignAlpha.valueAsNumber,
      });
    });
    doms.brightness.addEventListener("input", () => {
      worker.postMessage({
        brightness: `${doms.brightness.valueAsNumber.toString()}%`,
      });
    });
    doms.scale.addEventListener("input", () => {
      worker.postMessage({ scale: doms.scale.valueAsNumber });
    });
    const filteredPrefabs: Prefab[] = [];
    prefabsHandler.addFilterHeaderListener(() => {
      filteredPrefabs.length = 0;
      worker.postMessage({ filteredPrefabs });
    });
    prefabsHandler.addFilterChunkListener(({ prefabs }) => {
      for (const p of prefabs) {
        filteredPrefabs.push({
          name: p.name,
          x: p.x,
          z: p.z,
          rotation: p.rotation,
        });
      }
      worker.postMessage({ filteredPrefabs });
    });
    prefabsHandler.addAllPrefabsListener(({ all }) => {
      worker.postMessage({ allPrefabs: all });
    });
    markerHandler.addListener(({ coords }) => {
      worker.postMessage({ markerCoords: coords });
    });
    fileHandler.addListener((fileNames) => {
      const invalidate: DependentFile[] = [];
      for (const n of fileNames) {
        if (DEPENDENT_FILES.includes(n as DependentFile)) {
          invalidate.push(n as DependentFile);
        }
      }
      if (invalidate.length === 0) return;
      worker.postMessage({ invalidate });
    });
  }
}
