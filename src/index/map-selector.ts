import { MapObject, MapStorage } from "../lib/map-storage";
import { printError, removeAllChildren, requireNonnull, strictParseInt } from "../lib/utils";

interface Doms {
  select: HTMLSelectElement;
  create: HTMLButtonElement;
  delete: HTMLButtonElement;
  mapName: HTMLInputElement;
}

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
    return requireNonnull(this.doms.select.selectedOptions[0]);
  }

  private get selectedOptionMapId() {
    return strictParseInt(this.selectedOption.dataset["mapId"]);
  }

  private async init(): Promise<void> {
    MapStorage.addListener(async (mapId) => this.buildOptions(mapId));
    await this.changeMap(await this.storage.currentId(), true);

    this.doms.mapName.addEventListener("input", () => {
      const id = this.selectedOptionMapId;
      const name = this.doms.mapName.value;
      this.selectedOption.textContent = optionTextContent({ id, name });
      this.storage.put("maps", name).catch(printError);
    });
    this.doms.select.addEventListener("input", () => void this.changeMap(this.selectedOptionMapId).catch(printError));
    this.doms.create.addEventListener("click", () => void this.create().catch(printError));
    this.doms.delete.addEventListener("click", () => void this.deleteMap().catch(printError));
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
    for (const option of this.doms.select.options) option.selected = parseInt(option.dataset["mapId"] ?? "") === mapId;
  }
}

function buildOptionElement(map: MapObject) {
  const e = document.createElement("option");
  e.dataset["mapId"] = requireNonnull(map.id).toString();
  e.textContent = optionTextContent(map);
  return e;
}

function optionTextContent(map: { id: number; name: string }) {
  return `${map.id.toString()}. ${map.name}`;
}
