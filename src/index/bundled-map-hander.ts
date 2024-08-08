import { fetchJson, printError } from "../lib/utils";
import * as events from "../lib/events";

interface Doms {
  select: HTMLSelectElement;
}

export interface EventMessage {
  select: {
    mapName: string;
    mapDir: string;
  };
}

export class BundledMapHandler extends events.Generator<"select", EventMessage> {
  #doms: Doms;

  constructor(doms: Doms) {
    super();
    this.#doms = doms;

    this.#renderOptions().catch(printError);
    this.#doms.select.addEventListener("change", () => {
      if (this.#doms.select.value === "") return;
      const mapName = this.#doms.select.value;
      this.emitNoAwait({ select: { mapName, mapDir: `maps/${mapName}` } });
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
}
