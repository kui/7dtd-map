import type { PrefabsFilterOutputMessage } from "../worker/types.ts";
import type { MarkerHandler } from "./marker-handler.ts";
import type { LabelHandler } from "../lib/label-handler.ts";
import type { FileHandler } from "./file-handler.ts";
import type {
  HighlightedPrefab,
  Prefab,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";

import * as events from "../lib/events.ts";
import { loadPrefabsXml } from "../lib/prefabs.ts";
import { PrefabHitIndex } from "../lib/prefab-hit-index.ts";
import {
  bindPrefabsFilterControls,
  type PrefabsFilterControlsDoms,
  type PrefabsFilterWorker,
  readPreExcludes,
} from "../lib/prefabs-filter-controls.ts";

interface FilterHeaderEventMessage {
  status: string;
  total: number;
}

interface FilterChunkEventMessage {
  prefabs: HighlightedPrefab[];
}

interface AllPrefabsEventMessage {
  all: Prefab[];
}

interface PrefabHitIndexEventMessage {
  index: PrefabHitIndex;
}

interface Doms extends PrefabsFilterControlsDoms {
  status: HTMLElement;
}

export class PrefabsHandler {
  #filterHeaderListeners = new events.ListenerManager<
    FilterHeaderEventMessage
  >();
  #filterChunkListeners = new events.ListenerManager<
    FilterChunkEventMessage
  >();
  #allPrefabsListeners = new events.ListenerManager<AllPrefabsEventMessage>();
  #hitIndexListeners = new events.ListenerManager<PrefabHitIndexEventMessage>();

  constructor(
    doms: Doms,
    worker: PrefabsFilterWorker,
    markerHandler: MarkerHandler,
    labelHandler: LabelHandler,
    fileHandler: FileHandler,
    meshSizes: Promise<PrefabMeshSizes>,
  ) {
    worker.addEventListener(
      "message",
      (event: MessageEvent<PrefabsFilterOutputMessage>) => {
        const data = event.data;
        if (data.type === "header") {
          doms.status.textContent = data.status;
          this.#filterHeaderListeners.dispatchNoAwait({
            status: data.status,
            total: data.total,
          });
        } else {
          this.#filterChunkListeners.dispatchNoAwait({ prefabs: data.prefabs });
        }
      },
    );

    bindPrefabsFilterControls(doms, worker, labelHandler);
    worker.postMessage({
      preExcludes: readPreExcludes(doms),
      onlyNew: doms.onlyNew.checked,
    });

    markerHandler.addListener((m) => {
      worker.postMessage({ markCoords: m.coords });
    });
    fileHandler.addListener(async (fileNames) => {
      if (!fileNames.includes("prefabs.xml")) return;
      const all = await loadPrefabsXml();
      // Send to the filter worker and notify "all" subscribers without
      // waiting on meshSizes: neither path needs the hit index.
      worker.postMessage({ all });
      this.#allPrefabsListeners.dispatchNoAwait({ all });
      // Hit index requires mesh sizes; emit on its own channel after the
      // await so that subscribers who only want raw `all` are not delayed.
      const sizes = await meshSizes;
      const index = new PrefabHitIndex(all, sizes);
      this.#hitIndexListeners.dispatchNoAwait({ index });
    });
  }

  addFilterHeaderListener(fn: (m: FilterHeaderEventMessage) => unknown) {
    this.#filterHeaderListeners.addListener(fn);
  }

  addFilterChunkListener(fn: (m: FilterChunkEventMessage) => unknown) {
    this.#filterChunkListeners.addListener(fn);
  }

  // Raw load output: emitted once per prefabs.xml load with the full,
  // unfiltered prefab list (with rotation). Used by the map renderer to
  // draw prefab footprints independently of the active filter.
  addAllPrefabsListener(fn: (m: AllPrefabsEventMessage) => unknown) {
    this.#allPrefabsListeners.addListener(fn);
  }

  addPrefabHitIndexListener(fn: (m: PrefabHitIndexEventMessage) => unknown) {
    this.#hitIndexListeners.addListener(fn);
  }
}
