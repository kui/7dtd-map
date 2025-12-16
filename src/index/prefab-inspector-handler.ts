import { LabelHandler } from "../lib/label-handler.ts";
import { loadPrefabsXml } from "../lib/prefabs.ts";
import { printError } from "../lib/utils.ts";

interface PrefabCountDoms {
  inMap: HTMLElement;
  defined: HTMLElement;
}

interface Doms {
  dialog: HTMLDialogElement;
  show: HTMLButtonElement;
  count: HTMLElement;
  detailCounts: {
    0: PrefabCountDoms;
    1: PrefabCountDoms;
    2: PrefabCountDoms;
    3: PrefabCountDoms;
    4: PrefabCountDoms;
    5: PrefabCountDoms;
    total: PrefabCountDoms;
  };
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
    const prefabIndex = (await this.#fetchPrefabIndex()).filter((name) => !isExcludedPrefabName(name));

    const difficulties = await this.#fetchDifficulties();
    const countsPerDifficulty: { inMap: number; defined: number }[] = Array.from(
      { length: 6 },
      () => ({ inMap: 0, defined: 0 }),
    );
    const totalCounts = { inMap: 0, defined: 0 };
    for (const name of prefabIndex) {
      const difficulty = difficulties[name] ?? 0;
      // Should rise an error if the difficulty is not in the range of 0-5
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const counts = countsPerDifficulty[difficulty]!;
      counts.defined++;
      totalCounts.defined++;
      if (uniquePrefabNames.has(name)) {
        counts.inMap++;
        totalCounts.inMap++;
      }
    }
    for (let i = 0; i < 6; i++) {
      const countDoms = this.#doms.detailCounts[i as 0 | 1 | 2 | 3 | 4 | 5];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const counts = countsPerDifficulty[i]!;
      countDoms.inMap.textContent = counts.inMap.toString();
      countDoms.defined.textContent = counts.defined.toString();
    }
    this.#doms.detailCounts.total.inMap.textContent = totalCounts.inMap.toString();
    this.#doms.detailCounts.total.defined.textContent = totalCounts.defined.toString();

    const labels = await this.#labelHandler.holder.get("prefabs");
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
