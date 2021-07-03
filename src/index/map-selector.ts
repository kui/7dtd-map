import { MapObject, MapStorage } from "../lib/map-storage";
import { removeAllChildren, requireNonnull } from "../lib/utils";

type Doms = {
  select: HTMLSelectElement;
  create: HTMLButtonElement;
  delete: HTMLButtonElement;
  mapName: HTMLInputElement;
};

export class MapSelector {
  storage: MapStorage;

  constructor(storage: MapStorage) {
    this.storage = storage;
  }

  async init(doms: Doms): Promise<void> {
    const maps = await this.storage.listMaps();
    const df = new DocumentFragment();
    for (const m of maps) df.appendChild(buildOptionElement(m));
    removeAllChildren(doms.select);
    doms.select.appendChild(df);

    const currentMapObject = await this.storage.getCurrent("maps");
    await changeMap(this, doms, requireNonnull(currentMapObject?.id));

    // set hooks
    doms.mapName.addEventListener("input", () => {
      const mapId = selectedMapId(doms.select);
      const name = doms.mapName.value;
      doms.select.selectedOptions[0].textContent = `${mapId}. ${name}`;
      this.storage.put("maps", name);
    });
    doms.select.addEventListener("input", () => {
      changeMap(this, doms, selectedMapId(doms.select));
    });
    doms.create.addEventListener("click", () => create(this, doms));
    doms.delete.addEventListener("click", () => deleteMap(this, doms));
  }
}

function buildOptionElement(map: MapObject) {
  const e = document.createElement("option");
  e.dataset.mapId = requireNonnull(map.id).toString();
  e.textContent = `${map.id}. ${map.name}`;
  return e;
}

function selectedOption(select: HTMLSelectElement) {
  return requireNonnull(select.selectedOptions)[0];
}
function selectedMapId(select: HTMLSelectElement) {
  return parseInt(selectedOption(select).dataset.mapId as string);
}

async function create(self: MapSelector, doms: Doms) {
  console.log("Create Map");
  const map = await self.storage.createMap();
  doms.select.appendChild(buildOptionElement(map));
  await changeMap(self, doms, map.id);
}

async function deleteMap(self: MapSelector, doms: Doms) {
  const optionElement = selectedOption(doms.select);
  const mapId = parseInt(optionElement.dataset.mapId as string);

  console.log("Delete Map", mapId);
  if (doms.select.getElementsByTagName("option").length <= 1) {
    console.log("Reject delete");
    return;
  }

  doms.select.removeChild(optionElement);
  await self.storage.deleteMap(mapId);
  await changeMap(self, doms, selectedMapId(doms.select));
}

async function changeMap(self: MapSelector, doms: Doms, mapId: number) {
  await self.storage.changeMap(mapId);
  const map = requireNonnull(await self.storage.getCurrent("maps"));
  doms.select.selectedIndex = Array.from(doms.select.options).findIndex((o) => parseInt(o.dataset.mapId as string) === map.id);
  doms.mapName.value = map.name;
  doms.delete.disabled = (await self.storage.listMaps()).length <= 1;
}
