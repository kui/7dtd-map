import { LabelHandler } from "../lib/label-handler";
import { loadPrefabsXml } from "../lib/prefabs";
import { printError } from "../lib/utils";

interface Doms {
  dialog: HTMLDialogElement;
  show: HTMLButtonElement;
  count: HTMLElement;
  uniqueCount: HTMLElement;
  definedCount: HTMLElement;
  missings: HTMLUListElement | HTMLOListElement;
}

const EXCLUDE_PREFAB_REGEXPS = [
  // Test prefabs
  /^(?:aaa_|AAA_|spacercise_|terrain_smoothing_bug)/,
  // Tile
  /^rwg_tile_/,
  // Parts
  /^part_/,
  // Located by the other generation methods (e.g. biome, spawn point) or may not be used
  /^(?:deco_|desert_|departure_bridge_|departure_city_sign|player_start|rock_form|roadblock_|rwg_bridge|sign_|streets?_)/,
];

export class PrefabInspectorHandler {
  #doms: Doms;
  #labelHandler: LabelHandler;
  #fetchDifficulties: () => Promise<PrefabDifficulties>;
  #fetchPrefabIndex: () => Promise<string[]>;

  constructor(
    doms: Doms,
    labelHandler: LabelHandler,
    fetchDifficulties: () => Promise<PrefabDifficulties>,
    fetchPrefabIndex: () => Promise<string[]>,
  ) {
    this.#doms = doms;
    this.#labelHandler = labelHandler;
    this.#fetchDifficulties = fetchDifficulties;
    this.#fetchPrefabIndex = fetchPrefabIndex;

    document.addEventListener("click", (event) => {
      if (event.target === this.#doms.dialog) this.#doms.dialog.close();
    });
    doms.show.addEventListener("click", () => {
      this.inspect().catch(printError);
    });
  }

  async inspect() {
    const prefabNames = (await loadPrefabsXml()).flatMap(({ name }) => (isExcludedPrefabName(name) ? [] : [name]));
    this.#doms.count.textContent = prefabNames.length.toString();

    const uniquePrefabNames = new Set(prefabNames);
    this.#doms.uniqueCount.textContent = uniquePrefabNames.size.toString();

    const prefabIndex = (await this.#fetchPrefabIndex()).filter((name) => !isExcludedPrefabName(name));
    this.#doms.definedCount.textContent = prefabIndex.length.toString();

    const labels = await this.#labelHandler.holder.get("prefabs");
    const difficulties = await this.#fetchDifficulties();
    const missingPrefabNames = new Set(prefabIndex.filter((name) => !uniquePrefabNames.has(name)));
    this.#doms.missings.innerHTML = [...missingPrefabNames]
      .map((name) => {
        const difficulty = difficulties[name] ?? 0;
        const label = labels.get(name) ?? "-";
        return { name, label, difficulty };
      })
      .toSorted((a, b) => (a.difficulty === b.difficulty ? a.name.localeCompare(b.name) : b.difficulty - a.difficulty))
      .map(({ name, label, difficulty }) => {
        const tierStr = difficulty === 0 ? "" : `<span title="Difficulty Tier">💀${difficulty.toString()}</span> `;
        return `<li>${tierStr}<a href="prefabs/${name}.html">${label} / ${name}</a></li>`;
      })
      .join("");
  }
}

function isExcludedPrefabName(prefabName: string): boolean {
  return EXCLUDE_PREFAB_REGEXPS.some((re) => re.test(prefabName));
}
