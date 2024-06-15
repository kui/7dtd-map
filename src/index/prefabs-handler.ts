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
  listeners: ((prefabs: HighlightedPrefab[]) => unknown)[] = [];

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
      this.listeners.forEach((fn) => fn(prefabs));
      doms.status.textContent = status;
    });
    ["input", "focus"].forEach((eventName) => {
      doms.prefabFilter.addEventListener(eventName, () => {
        worker.postMessage({ prefabsFilterString: doms.prefabFilter.value });
        document.body.dataset["activeFilter"] = "prefab";
      });
      doms.blockFilter.addEventListener(eventName, () => {
        worker.postMessage({ blocksFilterString: doms.blockFilter.value });
        document.body.dataset["activeFilter"] = "block";
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
    const [x, , z] = position;
    if (!x || !z) return [];
    const name = e.getAttribute("name");
    if (!name) return [];
    return {
      name,
      x: parseInt(x),
      z: parseInt(z),
      difficulty: difficulties[name] ?? 0,
    };
  });
}
