import type { PrefabsFilterOutputMessage } from "../worker/types.ts";
import type { MarkerHandler } from "./marker-handler.ts";
import type { LabelHandler } from "../lib/label-handler.ts";
import type { FileHandler } from "./file-handler.ts";
import type {
  HighlightedPrefab,
  PrefabDifficulties,
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

export class PrefabsHandler {
  #listeners = new events.ListenerManager<"update", EventMessage>();

  constructor(
    doms: Doms,
    worker: PrefabsFilterWorker,
    markerHandler: MarkerHandler,
    labelHandler: LabelHandler,
    fileHandler: FileHandler,
    fetchDifficulties: () => Promise<PrefabDifficulties>,
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

    markerHandler.addListener((m) => {
      worker.postMessage({ markCoords: m.update.coords });
    });
    fileHandler.addListener(async ({ update: fileNames }) => {
      if (fileNames.includes("prefabs.xml")) {
        worker.postMessage({ all: await loadPrefabsXml(fetchDifficulties) });
      }
    });
  }

  addListener(fn: (m: EventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }
}
