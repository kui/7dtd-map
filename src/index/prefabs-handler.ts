import * as prefabsFilter from "../worker/prefabs-filter";
import { MapStorage } from "../lib/map-storage";
import { PrefabUpdate } from "../lib/prefabs";
import { Language } from "../lib/labels";

interface Doms {
  status: HTMLElement;
  prefabFilter: HTMLInputElement;
  blockFilter: HTMLInputElement;
}

declare class PrefabsFilterWorker extends Worker {
  postMessage(message: prefabsFilter.InMessage): void;
}

export class PrefabsHandler {
  doms: Doms;
  worker: PrefabsFilterWorker;
  storage: MapStorage;
  difficultyPromise: Promise<PrefabDifficulties>;
  listeners: ((prefabs: HighlightedPrefab[]) => Promise<void>)[] = [];

  constructor(doms: Doms, worker: PrefabsFilterWorker, storage: MapStorage, difficulty: Promise<PrefabDifficulties>) {
    this.doms = doms;
    this.worker = worker;
    this.storage = storage;
    this.difficultyPromise = difficulty;

    MapStorage.addListener(async () => {
      const o = await storage.getCurrent("prefabs");
      worker.postMessage({ all: o?.data ?? [] });
    });
    worker.addEventListener("message", (event: MessageEvent<PrefabUpdate>) => {
      const { prefabs, status } = event.data;
      this.listeners.map((fn) => fn(prefabs));
      doms.status.textContent = status;
    });
    ["input", "focus"].forEach((eventName) => {
      doms.prefabFilter.addEventListener(eventName, async () => {
        worker.postMessage({ prefabsFilterString: doms.prefabFilter.value });
        document.body.dataset.activeFilter = "prefab";
      });
      doms.blockFilter.addEventListener(eventName, async () => {
        worker.postMessage({ blocksFilterString: doms.blockFilter.value });
        document.body.dataset.activeFilter = "block";
      });
    });
  }

  async handle(blob: { text(): Promise<string> }): Promise<void> {
    const prefabs = parse(await blob.text(), await this.difficultyPromise);
    await this.storage.put("prefabs", prefabs);
    this.worker.postMessage({ all: prefabs });
  }

  set marker(markCoords: GameCoords | null) {
    this.worker.postMessage({ markCoords });
  }

  set language(language: Language) {
    this.worker.postMessage({ language });
  }
}

function parse(xml: string, difficulties: PrefabDifficulties): Prefab[] {
  const dom = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(dom.getElementsByTagName("decoration")).flatMap((e) => {
    const position = e.getAttribute("position")?.split(",");
    if (!position || position.length !== 3) return [];
    const name = e.getAttribute("name");
    if (!name) return [];
    return {
      name,
      x: parseInt(position[0]),
      z: parseInt(position[2]),
      difficulty: difficulties[name] ?? 0,
    };
  });
}
