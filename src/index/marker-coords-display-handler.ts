import type { DtmHandler } from "./dtm-handler.ts";
import type { MarkerStore } from "./marker-store.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type { LabelHandler } from "../lib/label-handler.ts";
import type { GameCoords, PrefabDifficulties } from "../types/7dtdmap.ts";
import type { PrefabHitIndex } from "../lib/prefab-hit-index.ts";

import { escapeHtml, printError } from "../lib/utils.ts";

interface Doms {
  output: HTMLElement;
  prefab: HTMLElement;
}

const EMPTY = "E/W: -, N/S: -, Elev: -";

// Hit index is sourced from PrefabsHandler so cursor hover and flag drop
// agree on "which prefab is here" without each consumer doing its own
// bookkeeping over PrefabMeshSizes.
export class MarkerCoordsDisplayHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #labelHandler: LabelHandler;
  #difficulties: Promise<PrefabDifficulties>;
  #index: PrefabHitIndex | null = null;
  #lastCoords: GameCoords | null = null;
  #renderToken = 0;

  constructor(
    doms: Doms,
    markerStore: MarkerStore,
    dtmHandler: DtmHandler,
    prefabsHandler: PrefabsHandler,
    labelHandler: LabelHandler,
    difficulties: Promise<PrefabDifficulties>,
  ) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;
    this.#labelHandler = labelHandler;
    this.#difficulties = difficulties;

    prefabsHandler.addPrefabHitIndexListener(({ index }) => {
      this.#index = index;
      if (this.#lastCoords) this.#update().catch(printError);
    });

    markerStore.addListener(({ coords }) => {
      this.#lastCoords = coords;
      this.#update().catch(printError);
    });
  }

  async #update() {
    const token = ++this.#renderToken;
    const coords = this.#lastCoords;
    if (!coords) {
      this.#doms.output.textContent = EMPTY;
      this.#doms.prefab.textContent = "";
      return;
    }

    const elev = (await this.#dtmHandler.getElevation(coords)) ?? "-";
    if (token !== this.#renderToken) return;
    this.#doms.output.textContent =
      `E/W: ${coords.x.toString()}, N/S: ${coords.z.toString()}, Elev: ${elev.toString()}`;

    const hit = this.#index?.find(coords) ?? null;
    if (!hit) {
      this.#doms.prefab.textContent = "";
      return;
    }

    const [labels, difficulties] = await Promise.all([
      this.#labelHandler.holder.get("prefabs"),
      this.#difficulties,
    ]);
    if (token !== this.#renderToken) return;
    const label = labels.get(hit.name) ?? "-";
    const difficulty = difficulties[hit.name] ?? 0;
    const safeName = escapeHtml(hit.name);
    const safeLabel = escapeHtml(label);
    const tier = difficulty > 0
      ? `<span class="tier prefab-difficulty-${difficulty.toString()}" title="Difficulty Tier ${difficulty.toString()}">💀${difficulty.toString()}</span> `
      : "";
    this.#doms.prefab.innerHTML =
      `${tier}<a href="prefabs/${safeName}.html" target="_blank">${safeLabel} / <small>${safeName}</small></a>`;
  }
}
