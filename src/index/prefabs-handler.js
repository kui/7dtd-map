"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabsHandler = void 0;
const map_storage_1 = require("../lib/map-storage");
class PrefabsHandler {
  constructor(doms, worker, storage) {
    this.listeners = [];
    this.doms = doms;
    this.worker = worker;
    this.storage = storage;
    map_storage_1.MapStorage.addListener(async () => {
      const o = await storage.getCurrent("prefabs");
      worker.postMessage({ all: o?.data ?? [] });
    });
    worker.addEventListener("message", (event) => {
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
  async handle(blob) {
    const prefabs = parse(await blob.text());
    await this.storage.put("prefabs", prefabs);
    this.worker.postMessage({ all: prefabs });
  }
  set marker(markCoords) {
    this.worker.postMessage({ markCoords });
  }
}
exports.PrefabsHandler = PrefabsHandler;
function parse(xml) {
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
//# sourceMappingURL=prefabs-handler.js.map
