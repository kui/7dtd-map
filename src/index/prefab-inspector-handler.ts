import type {
  PrefabAddedVersions,
  PrefabDifficulties,
} from "../types/7dtdmap.ts";
import { LabelHandler } from "../lib/label-handler.ts";
import { assertDifficultyIndex, loadPrefabsXml } from "../lib/prefabs.ts";
import { latestAddedVersion } from "../lib/prefab-added-versions.ts";
import { closeOnBackdropClick } from "../lib/ui/dialog-backdrop-close.ts";
import { escapeHtml, printError } from "../lib/utils.ts";

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
  newVersion: HTMLElement;
  newCounts: PrefabCountDoms;
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
  #difficulties: Promise<PrefabDifficulties>;
  #addedVersions: Promise<PrefabAddedVersions>;
  #fetchPrefabIndex: () => Promise<string[]>;

  constructor(
    doms: Doms,
    labelHandler: LabelHandler,
    difficulties: Promise<PrefabDifficulties>,
    addedVersions: Promise<PrefabAddedVersions>,
    fetchPrefabIndex: () => Promise<string[]>,
  ) {
    this.#doms = doms;
    this.#labelHandler = labelHandler;
    this.#difficulties = difficulties;
    this.#addedVersions = addedVersions;
    this.#fetchPrefabIndex = fetchPrefabIndex;

    closeOnBackdropClick(this.#doms.dialog);
    doms.show.addEventListener("click", () => {
      this.inspect().catch(printError);
    });
  }

  async inspect() {
    const [prefabs, difficulties, addedVersions, rawPrefabIndex] = await Promise
      .all([
        loadPrefabsXml(),
        this.#difficulties,
        this.#addedVersions,
        this.#fetchPrefabIndex(),
      ]);
    const latestVersion = latestAddedVersion(addedVersions);
    const prefabNames = prefabs.flatMap((
      { name },
    ) => (isExcludedPrefabName(name) ? [] : [name]));
    this.#doms.count.textContent = prefabNames.length.toString();

    const uniquePrefabNames = new Set(prefabNames);
    const prefabIndex = rawPrefabIndex.filter((name) =>
      !isExcludedPrefabName(name)
    );

    const countsPerDifficulty: { inMap: number; defined: number }[] = Array
      .from({ length: 6 }, () => ({ inMap: 0, defined: 0 }));
    const totalCounts = { inMap: 0, defined: 0 };
    const newCounts = { inMap: 0, defined: 0 };
    for (const name of prefabIndex) {
      const difficulty = difficulties[name] ?? 0;
      // Should rise an error if the difficulty is not in the range of 0-5
      // deno-lint-ignore no-non-null-assertion
      const counts = countsPerDifficulty[difficulty]!;
      counts.defined++;
      totalCounts.defined++;
      const isInMap = uniquePrefabNames.has(name);
      if (isInMap) {
        counts.inMap++;
        totalCounts.inMap++;
      }
      if (addedVersions[name] === latestVersion) {
        newCounts.defined++;
        if (isInMap) newCounts.inMap++;
      }
    }
    for (let i = 0; i < 6; i++) {
      assertDifficultyIndex(i);
      const countDoms = this.#doms.detailCounts[i];
      // deno-lint-ignore no-non-null-assertion
      const counts = countsPerDifficulty[i]!;
      countDoms.inMap.textContent = counts.inMap.toString();
      countDoms.defined.textContent = counts.defined.toString();
    }
    this.#doms.newVersion.textContent = latestVersion;
    this.#doms.newCounts.inMap.textContent = newCounts.inMap.toString();
    this.#doms.newCounts.defined.textContent = newCounts.defined.toString();
    this.#doms.detailCounts.total.inMap.textContent = totalCounts.inMap
      .toString();
    this.#doms.detailCounts.total.defined.textContent = totalCounts.defined
      .toString();

    const labels = await this.#labelHandler.holder.get("prefabs");
    const missingPrefabNames = new Set(
      prefabIndex.filter((name) => !uniquePrefabNames.has(name)),
    );
    this.#doms.missings.innerHTML = [...missingPrefabNames]
      .map((name) => {
        const difficulty = difficulties[name] ?? 0;
        const label = labels.get(name) ?? "-";
        const addedVersion = addedVersions[name];
        return { name, label, difficulty, addedVersion };
      })
      .toSorted((
        a,
        b,
      ) => (a.difficulty === b.difficulty
        ? a.name.localeCompare(b.name)
        : b.difficulty - a.difficulty)
      )
      .map(({ name, label, difficulty, addedVersion }) => {
        const tierStr = difficulty === 0
          ? ""
          : `<span title="Difficulty Tier">💀${difficulty.toString()}</span> `;
        const newStr = addedVersion === latestVersion
          ? `<span class="new-badge" title="Added in v${
            escapeHtml(addedVersion)
          }">🆕</span> `
          : "";
        const safeName = escapeHtml(name);
        const safeLabel = escapeHtml(label);
        return `<li>${tierStr}${newStr}<a href="prefabs/${safeName}.html">${safeLabel} / ${safeName}</a></li>`;
      })
      .join("");
  }
}

function isExcludedPrefabName(prefabName: string): boolean {
  return EXCLUDE_PREFAB_REGEXPS.some((re) => re.test(prefabName));
}
