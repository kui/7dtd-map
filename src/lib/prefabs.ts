import { throttledInvoker } from "./throttled-invoker";
import { LabelHolder, Language } from "./labels";
import { printError } from "./utils";

export interface PrefabUpdate {
  status: string;
  prefabs: HighlightedPrefab[];
}

interface PrefabHighlightedBlocks {
  [prefabName: string]: HighlightedBlock[];
}

export default class Prefabs {
  all: Prefab[] = [];
  filtered: HighlightedPrefab[] = [];
  markCoords: GameCoords | null = null;
  status = "";

  #blockPrefabCounts: BlockPrefabCounts = {};
  #labelHolder: LabelHolder;
  filter: PrefabMatcher;

  private throttledUpdater = throttledInvoker(() => this.updateImmediately());
  private updateListeners: ((u: PrefabUpdate) => void)[] = [];

  constructor(baseUrl: string, navigatorLanguages: readonly string[]) {
    this.#labelHolder = new LabelHolder(baseUrl, navigatorLanguages);
    this.filter = this.defaultMatcher();
  }

  set language(lang: Language) {
    this.#labelHolder.language = lang;
  }

  /**
   * Filter by prefab names.
   *
   * filter string is used as a regular expression or some special strings:
   *
   * - `💀1`, `💀2`, ... , `💀5`: filter by it's difficulty tiers
   *
   * @param filter - A string to filter prefabs.
   */
  set prefabsFilterString(filter: string) {
    const s = filter.trim();
    if (s.length === 0) {
      this.filter = this.defaultMatcher();
    } else if (/^💀\d+$/.test(s)) {
      this.filter = new DifficultyMatcher(parseInt(s.slice(2), 10), this.#labelHolder);
    } else {
      this.filter = new PrefabNameMatcher(new RegExp(s, "i"), this.#labelHolder);
    }
  }
  set blocksFilterString(filter: string) {
    const s = filter.trim();
    if (s.length === 0) {
      this.filter = this.defaultMatcher();
    } else {
      this.filter = new BlockNameMatcher(new RegExp(s, "i"), this.#blockPrefabCounts, this.#labelHolder);
    }
  }

  set blockPrefabCounts(counts: BlockPrefabCounts) {
    this.#blockPrefabCounts = counts;
    if (this.filter instanceof BlockNameMatcher) {
      this.filter = new BlockNameMatcher(this.filter.regexp, counts, this.#labelHolder);
    }
  }

  update(): void {
    this.throttledUpdater().catch(printError);
  }
  async updateImmediately(): Promise<void> {
    await this.applyFilter();
    this.updateDist();
    this.sort();
    const update: PrefabUpdate = { status: this.status, prefabs: this.filtered };
    this.updateListeners.forEach((f) => {
      f(update);
    });
  }

  addUpdateListener(func: (update: PrefabUpdate) => void): void {
    this.updateListeners.push(func);
  }

  private defaultMatcher() {
    return new AllMatcher(this.#labelHolder);
  }

  private async applyFilter() {
    const result = await this.filter.match(this.all);
    this.status = result.status;
    this.filtered = result.matched;
  }

  private updateDist() {
    if (this.markCoords) {
      const { markCoords } = this;
      this.filtered.forEach((p) => (p.dist = calcDist(p, markCoords)));
    } else {
      this.filtered.forEach((p) => (p.dist = null));
    }
  }

  private sort() {
    if (this.markCoords) {
      this.status = `${this.status}, order by distances from the flag`;
      this.filtered.sort(distSorter);
    } else if (this.filter instanceof BlockNameMatcher) {
      this.status = `${this.status}, order by counts of matched blocks`;
      this.filtered.sort(blockCountSorter);
    } else {
      this.filtered.sort(nameSorter);
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

interface PrefabMatcher {
  match(prefabs: Prefab[]): Promise<PrefabMatcherResult>;
}
interface PrefabMatcherResult {
  status: string;
  matched: HighlightedPrefab[];
}

class AllMatcher implements PrefabMatcher {
  labels: LabelHolder;

  constructor(labels: LabelHolder) {
    this.labels = labels;
  }

  async match(prefabs: Prefab[]) {
    const labels = await this.labels.get("prefabs");
    return {
      status: prefabs.length === 0 ? "No prefabs" : "All prefabs",
      matched: prefabs.map((p) => {
        const label = labels.get(p.name) ?? "-";
        return {
          ...p,
          highlightedName: p.name,
          highlightedLabel: label,
        };
      }),
    };
  }
}

class PrefabNameMatcher implements PrefabMatcher {
  regexp: RegExp;
  labels: LabelHolder;

  constructor(regexp: RegExp, labels: LabelHolder) {
    this.regexp = regexp;
    this.labels = labels;
  }

  async match(prefabs: Prefab[]) {
    const labels = await this.labels.get("prefabs");
    const results = prefabs.flatMap<HighlightedPrefab>((prefab) => {
      const highlightedName = matchAndHighlight(prefab.name, this.regexp);
      const label = labels.get(prefab.name) ?? "-";
      const highlightedLabel = label && matchAndHighlight(label, this.regexp);
      if (highlightedName ?? highlightedLabel) {
        return {
          ...prefab,
          highlightedName: highlightedName ?? prefab.name,
          highlightedLabel: highlightedLabel ?? label,
        };
      }
      return [];
    });
    return {
      status: `${results.length.toString()} matched prefabs`,
      matched: results,
    };
  }
}

class BlockNameMatcher implements PrefabMatcher {
  regexp: RegExp;
  #blockPrefabCounts: BlockPrefabCounts;
  labels: LabelHolder;

  constructor(regexp: RegExp, counts: BlockPrefabCounts, labels: LabelHolder) {
    this.regexp = regexp;
    this.#blockPrefabCounts = counts;
    this.labels = labels;
  }

  async match(prefabs: Prefab[]) {
    const matchedBlocks = await this.matchBlocks();
    if (matchedBlocks.length === 0) {
      return { status: "No matched blocks", matched: [] };
    }

    const matchedPrefabBlocks = this.matchPrefabTypes(matchedBlocks);
    if (Object.keys(matchedPrefabBlocks).length === 0) {
      return { status: `No prefabs, but ${matchedBlocks.length.toString()} matched blocks`, matched: [] };
    }

    const labels = await this.labels.get("prefabs");
    const results = prefabs.flatMap((prefab: Prefab) => {
      const blocks = matchedPrefabBlocks[prefab.name];
      if (!blocks) {
        return [];
      }
      return {
        ...prefab,
        highlightedName: prefab.name,
        highlightedLabel: labels.get(prefab.name) ?? "-",
        matchedBlocks: blocks,
      };
    });
    return {
      status: `${results.length.toString()} prefabs, ${matchedBlocks.length.toString()} matched blocks`,
      matched: results,
    };
  }

  private async matchBlocks() {
    const blockLabels = await this.labels.get("blocks");
    const shapeLabels = await this.labels.get("shapes");
    return Object.entries(this.#blockPrefabCounts).flatMap<HighlightedBlock>(([blockName, prefabs]) => {
      const highlightedName = matchAndHighlight(blockName, this.regexp);
      const label = blockLabels.get(blockName) ?? shapeLabels.get(blockName) ?? "-";
      const highlightedLabel = label && matchAndHighlight(label, this.regexp);
      if (highlightedName ?? highlightedLabel) {
        return {
          name: blockName,
          highlightedName: highlightedName ?? blockName,
          highlightedLabel: highlightedLabel ?? label,
          prefabs,
        };
      }
      return [];
    });
  }

  private matchPrefabTypes(matchedBlocks: HighlightedBlock[]): PrefabHighlightedBlocks {
    return matchedBlocks.reduce<PrefabHighlightedBlocks>((acc, block) => {
      if (!block.prefabs) return acc;
      for (const [prefabName, count] of Object.entries(block.prefabs)) {
        acc[prefabName] = (acc[prefabName] ?? []).concat({ ...block, count });
      }
      return acc;
    }, {});
  }
}

class DifficultyMatcher implements PrefabMatcher {
  constructor(
    private difficulty: number,
    private labels: LabelHolder,
  ) {
    this.difficulty = difficulty;
  }

  async match(prefabs: Prefab[]) {
    if (isNaN(this.difficulty) || this.difficulty < 1 || this.difficulty > 5) {
      return Promise.resolve({ status: `Invalid difficulty tier: ${this.difficulty.toString()}`, matched: [] });
    }
    const labels = await this.labels.get("prefabs");
    const matched = prefabs.flatMap<HighlightedPrefab>((prefab) => {
      if (prefab.difficulty !== this.difficulty) return [];
      const label = labels.get(prefab.name) ?? "-";
      return {
        ...prefab,
        highlightedName: prefab.name,
        highlightedLabel: label,
      };
    });
    return {
      status: `${matched.length.toString()} prefabs with difficulty tier ${this.difficulty.toString()}`,
      matched,
    };
  }
}
