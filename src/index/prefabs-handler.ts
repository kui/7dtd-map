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

interface Doms extends PrefabsFilterControlsDoms {
  status: HTMLElement;
}

interface FilteredPrefabsEventMessage {
  update: { prefabs: HighlightedPrefab[] };
}

interface AllPrefabsEventMessage {
  update: { all: Prefab[] };
}

interface PrefabHitIndexEventMessage {
  update: { index: PrefabHitIndex };
}

export class PrefabsHandler {
  #filteredPrefabsListeners = new events.ListenerManager<
    "update",
    FilteredPrefabsEventMessage
  >();
  #allPrefabsListeners = new events.ListenerManager<
    "update",
    AllPrefabsEventMessage
  >();
  #hitIndexListeners = new events.ListenerManager<
    "update",
    PrefabHitIndexEventMessage
  >();

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
        const {
          update: { prefabs, status },
        } = event.data;
        doms.status.textContent = status;
        this.#filteredPrefabsListeners.dispatchNoAwait({
          update: { prefabs },
        });
      },
    );

    bindPrefabsFilterControls(doms, worker, labelHandler);
    worker.postMessage({ preExcludes: readPreExcludes(doms) });

    markerHandler.addListener((m) => {
      worker.postMessage({ markCoords: m.update.coords });
    });
    fileHandler.addListener(async ({ update: fileNames }) => {
      if (!fileNames.includes("prefabs.xml")) return;
      const all = await loadPrefabsXml();
      // Send to the filter worker and notify "all" subscribers without
      // waiting on meshSizes: neither path needs the hit index.
      worker.postMessage({ all });
      this.#allPrefabsListeners.dispatchNoAwait({ update: { all } });
      // Hit index requires mesh sizes; emit on its own channel after the
      // await so that subscribers who only want raw `all` are not delayed.
      const sizes = await meshSizes;
      const index = new PrefabHitIndex(all, sizes);
      this.#hitIndexListeners.dispatchNoAwait({ update: { index } });
    });
  }

  // Filter pipeline output: emitted whenever the user-facing filter
  // (search box, difficulty range, …) re-evaluates, carrying the highlighted
  // subset that should appear in the prefab list and as ✘ map markers.
  addFilteredPrefabsListener(fn: (m: FilteredPrefabsEventMessage) => unknown) {
    this.#filteredPrefabsListeners.addListener(fn);
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
