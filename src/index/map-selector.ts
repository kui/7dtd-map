import { MapObject, MapStorage } from "../lib/map-storage";
import { removeAllChildren, requireNonnull } from "../lib/utils";

type Doms = {
  select: HTMLSelectElement;
  create: HTMLButtonElement;
  delete: HTMLButtonElement;
  mapName: HTMLInputElement;
};

export class MapSelector {
  private storage: MapStorage;
  private doms: Doms;
  private initPromise: Promise<void>;

  constructor(doms: Doms, storage: MapStorage) {
    this.doms = doms;
    this.storage = storage;
    this.initPromise = this.init();
  }

  private get selectedOption() {
    return requireNonnull(this.doms.select.selectedOptions)[0];
  }

  private get selectedOptionMapId() {
    return parseInt(this.selectedOption.dataset.mapId as string);
  }

  private async init(): Promise<void> {
    MapStorage.addListener(async (mapId) => this.buildOptions(mapId));
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

  private async buildOptions(mapId: number) {
    const maps = await this.storage.listMaps();
    const df = new DocumentFragment();
    for (const m of maps) df.appendChild(buildOptionElement(m));
    removeAllChildren(this.doms.select);
    this.doms.select.appendChild(df);
    this.selectOptionByMapId(mapId);
  }

  private async create() {
    this.doms.create.disabled = true;
    console.log("Create Map");
    const map = await this.storage.createMap();
    this.doms.select.appendChild(buildOptionElement(map));
    await this.changeMap(map.id);
    this.doms.create.disabled = false;
  }

  private async deleteMap() {
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

  private async changeMap(mapId: number, isInit = false) {
    if (!isInit) await this.initPromise;
    console.time("Change map");
    await this.storage.changeMap(mapId);
    console.timeEnd("Change map");
    const map = requireNonnull(await this.storage.getCurrent("maps"));
    this.selectOptionByMapId(map.id);
    this.doms.mapName.value = map.name;
  }

  private selectOptionByMapId(mapId: number) {
    this.doms.select.selectedIndex = Array.from(this.doms.select.options).findIndex((o) => parseInt(o.dataset.mapId as string) === mapId);
  }

  private disableDoms(isDisabled: boolean) {
    Object.values(this.doms).forEach((d) => (d.disabled = isDisabled));
  }
}

function buildOptionElement(map: MapObject) {
  const e = document.createElement("option");
  e.dataset.mapId = requireNonnull(map.id).toString();
  e.textContent = `${map.id}. ${map.name}`;
  return e;
}
