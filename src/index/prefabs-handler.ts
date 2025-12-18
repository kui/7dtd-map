import type * as prefabsFilter from "../worker/prefabs-filter.ts";
import type { MarkerHandler } from "./marker-handler.ts";
import type { LabelHandler } from "../lib/label-handler.ts";
import type { FileHandler } from "./file-handler.ts";

import * as events from "../lib/events.ts";
import { loadPrefabsXml } from "../lib/prefabs.ts";

interface Doms {
  status: HTMLElement;
  minTier: HTMLInputElement;
  maxTier: HTMLInputElement;
  prefabFilter: HTMLInputElement;
  blockFilter: HTMLInputElement;
  preExcludes: HTMLInputElement[];
}

interface EventMessage {
  update: { prefabs: HighlightedPrefab[] };
}

declare class PrefabsFilterWorker extends Worker {
  postMessage(message: prefabsFilter.InMessage): void;
}

export class PrefabsHandler {
  #doms: Doms;
  #listeners = new events.ListenerManager<"update", EventMessage>();
  #tierRange: NumberRange;

  constructor(
    doms: Doms,
    worker: PrefabsFilterWorker,
    markerHandler: MarkerHandler,
    labelHandler: LabelHandler,
    fileHandler: FileHandler,
    fetchDifficulties: () => Promise<PrefabDifficulties>,
  ) {
    this.#doms = doms;
    this.#tierRange = {
      start: doms.minTier.valueAsNumber,
      end: doms.maxTier.valueAsNumber,
    };

    worker.addEventListener("message", (event: MessageEvent<prefabsFilter.OutMessage>) => {
      const {
        update: { prefabs, status },
      } = event.data;
      doms.status.textContent = status;
      this.#listeners.dispatchNoAwait({ update: { prefabs } });
    });
    doms.minTier.addEventListener("input", () => {
      const newMinTier = doms.minTier.valueAsNumber;
      if (newMinTier === this.#tierRange.start) return;
      this.#tierRange.start = newMinTier;
      worker.postMessage({ difficulty: this.#tierRange });
    });
    doms.maxTier.addEventListener("input", () => {
      const newMaxTier = doms.maxTier.valueAsNumber;
      if (newMaxTier === this.#tierRange.end) return;
      this.#tierRange.end = newMaxTier;
      worker.postMessage({ difficulty: this.#tierRange });
    });
    doms.prefabFilter.addEventListener("input", () => {
      worker.postMessage({ prefabFilterRegexp: doms.prefabFilter.value });
    });
    doms.blockFilter.addEventListener("input", () => {
      worker.postMessage({ blockFilterRegexp: doms.blockFilter.value });
    });
    worker.postMessage({ preExcludes: this.#preExcludes });
    doms.preExcludes.forEach((input) => {
      input.addEventListener("change", () => {
        worker.postMessage({ preExcludes: this.#preExcludes });
      });
    });
    markerHandler.addListener((m) => {
      worker.postMessage({ markCoords: m.update.coords });
    });
    labelHandler.addListener(({ update: { lang } }) => {
      worker.postMessage({ language: lang });
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

  get #preExcludes(): string[] {
    return this.#doms.preExcludes.flatMap((i) => (i.checked ? i.value : []));
  }
}
