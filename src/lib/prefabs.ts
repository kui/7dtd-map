import { throttledInvoker } from "./throttled-invoker";
import { LabelHolder, Language } from "./labels";
import { printError } from "./utils";

export interface PrefabUpdate {
  status: string;
  prefabs: HighlightedPrefab[];
}

export default class Prefabs {
  #labelHolder: LabelHolder;

  #filtered: HighlightedPrefab[] = [];
  #status = "";

  all: Prefab[] = [];
  markCoords: GameCoords | null = null;
  difficulty: NumberRange = { start: 0, end: 5 };
  prefabFilterRegexp = "";
  blockFilterRegexp = "";
  blockPrefabCounts: BlockPrefabCounts = {};

  private throttledUpdater = throttledInvoker(() => this.updateImmediately());
  private updateListeners: ((u: PrefabUpdate) => void)[] = [];

  constructor(labelsBaseUrl: string, navigatorLanguages: readonly string[]) {
    this.#labelHolder = new LabelHolder(labelsBaseUrl, navigatorLanguages);
  }

  set language(lang: Language) {
    this.#labelHolder.language = lang;
  }

  update(): void {
    this.throttledUpdater().catch(printError);
  }
  async updateImmediately(): Promise<void> {
    await this.#applyFilter();
    this.#updateStatus();
    this.#updateDist();
    this.#sort();
    const update: PrefabUpdate = { status: this.#status, prefabs: this.#filtered };
    this.updateListeners.forEach((f) => {
      f(update);
    });
  }

  #updateStatus() {
    if (
      this.prefabFilterRegexp.length === 0 &&
      this.blockFilterRegexp.length === 0 &&
      this.difficulty.start === 0 &&
      this.difficulty.end === 5
    ) {
      this.#status = "All prefabs";
    } else if (this.#filtered.length === 0) {
      this.#status = "No prefabs matched";
    } else {
      this.#status = `${this.#filtered.length.toString()} prefabs matched`;
    }
  }

  addUpdateListener(func: (update: PrefabUpdate) => void): void {
    this.updateListeners.push(func);
  }

  async #applyFilter() {
    let result = this.#matchByDifficulty(this.all);
    result = await this.#matchByPrefabName(result);
    result = await this.#matchByBlockName(result);
    this.#filtered = result;
  }

  #matchByDifficulty(prefabs: Prefab[]): Prefab[] {
    return prefabs.filter((p) => {
      const d = p.difficulty ?? 0;
      return d >= this.difficulty.start && d <= this.difficulty.end;
    });
  }

  async #matchByPrefabName(prefabs: Prefab[]): Promise<HighlightedPrefab[]> {
    const labels = await this.#labelHolder.get("prefabs");
    return prefabs.flatMap<HighlightedPrefab>((prefab) => {
      const label = labels.get(prefab.name);
      if (this.prefabFilterRegexp.length === 0) {
        return {
          ...prefab,
          highlightedName: prefab.name,
          highlightedLabel: label ?? "-",
        };
      }

      const highlightedName = matchAndHighlight(prefab.name, new RegExp(this.prefabFilterRegexp, "i"));
      const highlightedLabel = label && matchAndHighlight(label, new RegExp(this.prefabFilterRegexp, "i"));
      if (highlightedName != null || highlightedLabel != null) {
        return {
          ...prefab,
          highlightedName: highlightedName ?? prefab.name,
          highlightedLabel: highlightedLabel ?? label ?? "-",
        };
      }

      return [];
    });
  }

  async #matchByBlockName(prefabs: Prefab[]): Promise<HighlightedPrefab[]> {
    if (this.blockFilterRegexp.length === 0) {
      return prefabs;
    }
    const matchedPrefabNames = await this.#matchPrefabTypesByBlockName(prefabs);
    return prefabs.flatMap((prefab) => {
      const matchedBlocks = matchedPrefabNames[prefab.name];
      return matchedBlocks ? { ...prefab, matchedBlocks } : [];
    });
  }

  async #matchPrefabTypesByBlockName(prefabs: Prefab[]) {
    const blockLabels = await this.#labelHolder.get("blocks");
    const shapeLabels = await this.#labelHolder.get("shapes");
    const prefabNames = new Set(prefabs.map((p) => p.name));
    const matchedPrefabNames: { [prefabName: string]: HighlightedBlock[] } = {};
    for (const [blockName, prefabs] of Object.entries(this.blockPrefabCounts)) {
      const highlightedName = matchAndHighlight(blockName, new RegExp(this.blockFilterRegexp, "i"));
      const label = blockLabels.get(blockName) ?? shapeLabels.get(blockName) ?? "-";
      const highlightedLabel = label && matchAndHighlight(label, new RegExp(this.blockFilterRegexp, "i"));
      if (highlightedName == null && highlightedLabel == null) continue;
      for (const [prefabName, count] of Object.entries(prefabs)) {
        if (!prefabNames.has(prefabName)) continue;
        matchedPrefabNames[prefabName] = (matchedPrefabNames[prefabName] ?? []).concat({
          name: blockName,
          highlightedName: highlightedName ?? blockName,
          highlightedLabel: highlightedLabel ?? label,
          count,
        });
      }
    }
    return matchedPrefabNames;
  }

  #updateDist() {
    if (this.markCoords) {
      const { markCoords } = this;
      this.#filtered.forEach((p) => (p.dist = calcDist(p, markCoords)));
    } else {
      this.#filtered.forEach((p) => (p.dist = null));
    }
  }

  #sort() {
    if (this.markCoords) {
      this.#status += ", order by distances from the flag";
      this.#filtered.sort(distSorter);
    } else if (this.blockFilterRegexp.length > 0) {
      this.#status += ", order by counts of matched blocks";
      this.#filtered.sort(blockCountSorter);
    } else {
      this.#filtered.sort(nameSorter);
    }
  }
}

function nameSorter(a: { name: string }, b: { name: string }) {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
}

function blockCountSorter(a: HighlightedPrefab, b: HighlightedPrefab) {
  if (!a.matchedBlocks || !b.matchedBlocks) return nameSorter(a, b);
  const aCount = a.matchedBlocks.reduce((acc, b) => acc + (b.count ?? 0), 0);
  const bCount = b.matchedBlocks.reduce((acc, b) => acc + (b.count ?? 0), 0);
  if (aCount < bCount) return 1;
  if (aCount > bCount) return -1;
  return nameSorter(a, b);
}

function distSorter(a: HighlightedPrefab, b: HighlightedPrefab) {
  if (!a.dist || !b.dist) return nameSorter(a, b);
  if (a.dist > b.dist) return 1;
  if (a.dist < b.dist) return -1;
  return nameSorter(a, b);
}

function calcDist(targetCoords: GameCoords, baseCoords: GameCoords) {
  return Math.round(Math.sqrt((targetCoords.x - baseCoords.x) ** 2 + (targetCoords.z - baseCoords.z) ** 2));
}

function matchAndHighlight(str: string, regex: RegExp) {
  let isMatched = false;
  const highlighted = str.replace(regex, (m) => {
    isMatched = m.length > 0;
    return `<mark>${m}</mark>`;
  });
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return isMatched ? highlighted : null;
}
