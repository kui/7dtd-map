import { PrefabsFilterInMessage } from "../worker/prefabs-filter";
import { MapStorage } from "../lib/map-storage";
import { PrefabUpdate } from "../lib/prefabs";

interface Doms {
  status: HTMLElement;
  prefabFilter: HTMLInputElement;
  blockFilter: HTMLInputElement;
}

declare class PrefabsFilterWorker extends Worker {
  postMessage(message: PrefabsFilterInMessage): void;
}

export class PrefabsHandler {
  doms: Doms;
  worker: PrefabsFilterWorker;
  storage: MapStorage;
  listeners: ((prefabs: HighlightedPrefab[]) => Promise<void>)[] = [];

  constructor(doms: Doms, worker: PrefabsFilterWorker, storage: MapStorage) {
    this.doms = doms;
    this.worker = worker;
    this.storage = storage;

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
    const prefabs = parse(await blob.text());
    await this.storage.put("prefabs", prefabs);
    this.worker.postMessage({ all: prefabs });
  }

  set marker(markCoords: Coords | null) {
    this.worker.postMessage({ markCoords });
  }
}

function parse(xml: string): Prefab[] {
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
    };
  });
}
