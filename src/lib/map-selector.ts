import { MapObject, MapStorage } from "./map-storage";
import { removeAllChildren, requireNonnull } from "./utils";

type Doms = {
  select: HTMLSelectElement;
  create: HTMLButtonElement;
  delete: HTMLButtonElement;
  mapName: HTMLInputElement;
};

export class MapSelector {
  static readonly DEFAULT_MAP_NAME = "New-World";

  storage: MapStorage;
  listeners: ((m: MapObject) => Promise<void>)[];

  constructor(storage: MapStorage) {
    this.storage = storage;
    this.listeners = [async (m) => console.log("Change Map", m)];
  }

  async init(doms: Doms): Promise<void> {
    const maps = await this.storage.listMaps();
    const df = new DocumentFragment();
    for (const map of maps) {
      df.appendChild(buildOptionElement(map));
    }
    removeAllChildren(doms.select);
    doms.select.appendChild(df);

    if (maps.length === 0) {
      await create(this, doms);
    } else {
      await changeMapId(this, doms, maps[0].id);
    }

    // set hooks
    doms.mapName.addEventListener("input", () => {
      const mapId = selectedMapId(doms.select);
      const name = doms.mapName.value;
      doms.select.selectedOptions[0].textContent = `${mapId}. ${name}`;
      this.storage.put("maps", { id: mapId, name: doms.mapName.value });
    });
    doms.select.addEventListener("input", () => {
      if (!doms.select.selectedOptions) {
        doms.select.selectedIndex = 0;
      }
      changeMapId(this, doms, selectedMapId(doms.select));
    });
    doms.create.addEventListener("click", () => create(this, doms));
    doms.delete.addEventListener("click", () => deleteMap(this, doms));
  }

  addListener(fn: (m: MapObject) => Promise<void>): void {
    this.listeners.push(fn);
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
  const map = await self.storage.createMap(MapSelector.DEFAULT_MAP_NAME);
  doms.select.appendChild(buildOptionElement(map));
  await changeMap(self, doms, map);
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
  await changeMapId(self, doms, selectedMapId(doms.select));
}

async function changeMapId(self: MapSelector, doms: Doms, mapId: number) {
  await changeMap(self, doms, requireNonnull(await self.storage.get("maps", mapId)));
}
async function changeMap(self: MapSelector, doms: Doms, map: MapObject) {
  doms.select.selectedIndex = Array.from(doms.select.options).findIndex((o) => parseInt(o.dataset.mapId as string) === map.id);
  doms.mapName.value = map.name;
  await Promise.allSettled(self.listeners.map((f) => f(map)));
}
