import type { PrefabsFilterOutputMessage } from "../worker/types.ts";
import type { MarkerHandler } from "./marker-handler.ts";
import type { LabelHandler } from "../lib/label-handler.ts";
import type { FileHandler } from "./file-handler.ts";
import type {
  HighlightedPrefab,
  Prefab,
  PrefabDifficulties,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";

import * as events from "../lib/events.ts";
import { loadPrefabsXml } from "../lib/prefabs.ts";
import {
  bindPrefabsFilterControls,
  type PrefabsFilterControlsDoms,
  type PrefabsFilterWorker,
  readPreExcludes,
} from "../lib/prefabs-filter-controls.ts";

interface Doms extends PrefabsFilterControlsDoms {
  status: HTMLElement;
}

interface EventMessage {
  update: { prefabs: HighlightedPrefab[] };
}

interface AllEventMessage {
  update: { all: Prefab[] };
}

export class PrefabsHandler {
  #listeners = new events.ListenerManager<"update", EventMessage>();
  #allListeners = new events.ListenerManager<"update", AllEventMessage>();

  constructor(
    doms: Doms,
    worker: PrefabsFilterWorker,
    markerHandler: MarkerHandler,
    labelHandler: LabelHandler,
    fileHandler: FileHandler,
    fetchDifficulties: () => Promise<PrefabDifficulties>,
    fetchPrefabMeshSizes: () => Promise<PrefabMeshSizes>,
  ) {
    worker.addEventListener(
      "message",
      (event: MessageEvent<PrefabsFilterOutputMessage>) => {
        const {
          update: { prefabs, status },
        } = event.data;
        doms.status.textContent = status;
        this.#listeners.dispatchNoAwait({ update: { prefabs } });
      },
    );

    bindPrefabsFilterControls(doms, worker, labelHandler);
    worker.postMessage({ preExcludes: readPreExcludes(doms) });

    // Mesh sizes are needed so distance/direction are measured from the
    // prefab centre rather than `decoration.position` (its SW corner).
    fetchPrefabMeshSizes().then(
      (prefabMeshSizes) => worker.postMessage({ prefabMeshSizes }),
      (e: unknown) => console.warn("Failed to load prefab mesh sizes", e),
    );

    markerHandler.addListener((m) => {
      worker.postMessage({ markCoords: m.update.coords });
    });
    fileHandler.addListener(async ({ update: fileNames }) => {
      if (fileNames.includes("prefabs.xml")) {
        const all = await loadPrefabsXml(fetchDifficulties);
        worker.postMessage({ all });
        this.#allListeners.dispatchNoAwait({ update: { all } });
      }
    });
  }

  addListener(fn: (m: EventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }

  // Emits the full, unfiltered prefab list (with rotation) loaded from
  // prefabs.xml. Used by the map renderer to draw prefab footprints
  // independently of the active filter.
  addAllListener(fn: (m: AllEventMessage) => unknown) {
    this.#allListeners.addListener(fn);
  }
}
