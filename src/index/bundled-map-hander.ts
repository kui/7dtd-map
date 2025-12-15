import { fetchJson, printError } from "../lib/utils.ts";
import * as events from "../lib/events.ts";

interface Doms {
  select: HTMLSelectElement;
}

export interface EventMessage {
  select: {
    mapName: string;
    mapDir: string;
  };
}

export class BundledMapHandler {
  #doms: Doms;
  #listeners = new events.ListenerManager<"select", EventMessage>();

  constructor(doms: Doms) {
    this.#doms = doms;

    this.#renderOptions().catch(printError);
    this.#doms.select.addEventListener("change", () => {
      if (this.#doms.select.value === "") return;
      const mapName = this.#doms.select.value;
      this.#listeners.dispatchNoAwait({ select: { mapName, mapDir: `maps/${mapName}` } });
    });
  }

  async #renderOptions() {
    const maps = await fetchJson<string[]>("maps/index.json");
    for (const map of maps) {
      const option = document.createElement("option");
      option.value = map;
      option.text = map;
      this.#doms.select.appendChild(option);
    }
  }

  addListener(fn: (m: EventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }
}
