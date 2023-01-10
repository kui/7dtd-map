"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapSelector = void 0;
const map_storage_1 = require("../lib/map-storage");
const utils_1 = require("../lib/utils");
class MapSelector {
  constructor(doms, storage) {
    this.doms = doms;
    this.storage = storage;
    this.initPromise = this.init();
  }
  get selectedOption() {
    return (0, utils_1.requireNonnull)(this.doms.select.selectedOptions)[0];
  }
  get selectedOptionMapId() {
    return parseInt(this.selectedOption.dataset.mapId);
  }
  async init() {
    map_storage_1.MapStorage.addListener(async (mapId) => this.buildOptions(mapId));
    await this.changeMap(await this.storage.currentId(), true);
    this.doms.mapName.addEventListener("input", () => {
      const mapId = this.selectedOptionMapId;
      const name = this.doms.mapName.value;
      this.doms.select.selectedOptions[0].textContent = `${mapId}. ${name}`;
      this.storage.put("maps", name);
    });
    this.doms.select.addEventListener("input", () => this.changeMap(this.selectedOptionMapId));
    this.doms.create.addEventListener("click", () => this.create());
    this.doms.delete.addEventListener("click", () => this.deleteMap());
  }
  async buildOptions(mapId) {
    const maps = await this.storage.listMaps();
    const df = new DocumentFragment();
    for (const m of maps) df.appendChild(buildOptionElement(m));
    (0, utils_1.removeAllChildren)(this.doms.select);
    this.doms.select.appendChild(df);
    this.selectOptionByMapId(mapId);
  }
  async create() {
    this.doms.create.disabled = true;
    console.log("Create Map");
    const map = await this.storage.createMap();
    this.doms.select.appendChild(buildOptionElement(map));
    await this.changeMap(map.id);
    this.doms.create.disabled = false;
  }
  async deleteMap() {
    this.doms.delete.disabled = true;
    const mapId = this.selectedOptionMapId;
    console.log("Delete Map", mapId);
    if (this.doms.select.options.length <= 1) {
      console.log("Reject delete");
      return;
    }
    this.doms.select.removeChild(this.selectedOption);
    await this.storage.deleteMap(mapId);
    await this.changeMap(this.selectedOptionMapId);
    this.doms.delete.disabled = this.doms.select.options.length <= 1;
  }
  async changeMap(mapId, isInit = false) {
    if (!isInit) await this.initPromise;
    console.time("Change map");
    await this.storage.changeMap(mapId);
    console.timeEnd("Change map");
    const map = (0, utils_1.requireNonnull)(await this.storage.getCurrent("maps"));
    this.selectOptionByMapId(map.id);
    this.doms.mapName.value = map.name;
  }
  selectOptionByMapId(mapId) {
    this.doms.select.selectedIndex = Array.from(this.doms.select.options).findIndex((o) => parseInt(o.dataset.mapId) === mapId);
  }
  disableDoms(isDisabled) {
    Object.values(this.doms).forEach((d) => (d.disabled = isDisabled));
  }
}
exports.MapSelector = MapSelector;
function buildOptionElement(map) {
  const e = document.createElement("option");
  e.dataset.mapId = (0, utils_1.requireNonnull)(map.id).toString();
  e.textContent = map.name;
  return e;
}
//# sourceMappingURL=map-selector.js.map
