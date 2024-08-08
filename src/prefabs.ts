import type * as prefabsFilter from "./worker/prefabs-filter";

import { DelayedRenderer } from "./lib/delayed-renderer";
import * as events from "./lib/events";
import { LabelHandler } from "./lib/label-handler";
import { Language } from "./lib/labels";
import * as minMaxInputs from "./lib/ui/min-max-inputs";
import * as presetButton from "./lib/ui/preset-button";
import * as syncOutput from "./lib/ui/sync-output";
import { UrlState } from "./lib/url-state";
import { component, fetchJson, printError } from "./lib/utils";

interface HighlightedPrefab {
  name: string;
  difficulty?: number;
  highlightedName?: string;
  highlightedLabel?: string;
  matchedBlocks?: HighlightedBlock[];
}

function main() {
  presetButton.init();
  syncOutput.init();
  minMaxInputs.init();

  const urlState = UrlState.create(location, document.querySelectorAll("input"));
  urlState.addUpdateListener((url) => {
    window.history.replaceState(null, "", url.toString());
  });

  const prefabsHandler = new PrefabsHandler(new Worker("worker/prefabs-filter.js"));
  (async () => {
    const [prefabBlockCounts, difficulties] = await Promise.all([
      fetchJson<PrefabBlockCounts>("prefab-block-counts.json"),
      fetchJson<PrefabDifficulties>("prefab-difficulties.json"),
    ]);
    prefabsHandler.prefabs = Object.keys(prefabBlockCounts).map((n) => ({
      name: n,
      x: 0,
      z: 0,
      difficulty: difficulties[n] ?? 0,
    }));
  })().catch(printError);

  const minTier = component("min_tier", HTMLInputElement);
  const maxTier = component("max_tier", HTMLInputElement);
  const tierRange = { start: minTier.valueAsNumber, end: maxTier.valueAsNumber };
  prefabsHandler.tierRange = tierRange;
  minTier.addEventListener("input", () => {
    const newMinTier = minTier.valueAsNumber;
    if (newMinTier === tierRange.start) return;
    tierRange.start = newMinTier;
    if (newMinTier > maxTier.valueAsNumber) {
      maxTier.value = minTier.value;
      tierRange.end = newMinTier;
      maxTier.dispatchEvent(new Event("input"));
    }
    prefabsHandler.tierRange = tierRange;
  });
  maxTier.addEventListener("input", () => {
    const newMaxTier = maxTier.valueAsNumber;
    if (newMaxTier === tierRange.end) return;
    tierRange.end = newMaxTier;
    if (newMaxTier < minTier.valueAsNumber) {
      minTier.value = maxTier.value;
      tierRange.start = newMaxTier;
      minTier.dispatchEvent(new Event("input"));
    }
    prefabsHandler.tierRange = tierRange;
  });
  const tierClear = component("tier_clear", HTMLButtonElement);
  tierClear.addEventListener("click", () => {
    minTier.value = minTier.defaultValue;
    maxTier.value = maxTier.defaultValue;
    minTier.dispatchEvent(new Event("input"));
    maxTier.dispatchEvent(new Event("input"));
  });

  const prefabFilter = component("prefab_filter", HTMLInputElement);
  prefabsHandler.prefabFilter = prefabFilter.value;
  prefabFilter.addEventListener("input", () => {
    prefabsHandler.prefabFilter = prefabFilter.value;
  });

  const blockFilter = component("block_filter", HTMLInputElement);
  prefabsHandler.blockFilter = blockFilter.value;
  blockFilter.addEventListener("input", () => {
    prefabsHandler.blockFilter = blockFilter.value;
  });

  const labelHandler = new LabelHandler({ language: component("label_lang", HTMLSelectElement) }, navigator.languages);
  labelHandler.addListener(({ update: { lang } }) => {
    prefabsHandler.language = lang;
  });

  const prefabFilterHandler = new PrefabFilterHandler({ devPrefabs: component("dev_prefabs", HTMLInputElement) });
  prefabFilterHandler.addUpdateListener(() => {
    prefabsHandler.refresh();
  });

  const prefabListRenderer = new DelayedRenderer<HighlightedPrefab>(document.documentElement, component("prefabs_list"), (p) =>
    prefabLi(p),
  );
  prefabsHandler.addListener(({ update }) => {
    prefabListRenderer.iterator = update.prefabs.filter(prefabFilterHandler.filter());
  });

  // Workaround that document.documentElement never fires "scroll" event
  document.addEventListener("scroll", () => {
    document.documentElement.dispatchEvent(new Event("scroll"));
  });
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    ...(prefab.difficulty
      ? [
          `<span title="Difficulty Tier ${prefab.difficulty.toString()}" class="prefab_difficulty_${prefab.difficulty.toString()}">`,
          `  💀${prefab.difficulty.toString()}`,
          `</span>`,
        ]
      : []),
    `<a href="prefabs/${prefab.name}.html" target="_blank">`,
    prefab.highlightedLabel ?? "-",
    "/",
    `<small>${prefab.highlightedName ?? prefab.name}</small></a>`,
    ...(prefab.matchedBlocks && prefab.matchedBlocks.length > 0 ? ["has", countHighlightedBlocks(prefab.matchedBlocks), "blocks"] : []),
  ].join(" ");
  if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
    const blocksUl = document.createElement("ul");
    prefab.matchedBlocks.forEach((block) => {
      if (block.count === undefined) return;
      const blockLi = document.createElement("li");
      blockLi.innerHTML = [
        `<button data-input-for="blocks_filter" data-input-text="${block.name}" title="Filter with this block name">▲</button>`,
        `${block.count.toString()}x`,
        block.highlightedLabel,
        `<small>${block.highlightedName}</small>`,
      ].join(" ");
      blocksUl.appendChild(blockLi);
    });
    li.appendChild(blocksUl);
  }
  return li;
}

function countHighlightedBlocks(blocks: HighlightedBlock[]): number {
  return blocks.reduce((acc, b) => acc + (b.count ?? 0), 0);
}

declare class PrefabsFilterWorker extends Worker {
  postMessage(message: prefabsFilter.InMessage): void;
}

type PrefabsHandlerEventMessage = prefabsFilter.OutMessage;

class PrefabsHandler {
  #worker: PrefabsFilterWorker;
  #listeners = new events.ListenerManager<"update", PrefabsHandlerEventMessage>();

  constructor(worker: PrefabsFilterWorker) {
    this.#worker = worker;
    this.#worker.addEventListener("message", (event: MessageEvent<prefabsFilter.OutMessage>) => {
      this.#listeners.dispatchNoAwait(event.data);
    });
  }

  set prefabs(p: Prefab[]) {
    this.#worker.postMessage({ all: p });
  }

  set tierRange(range: NumberRange) {
    this.#worker.postMessage({ difficulty: range });
  }

  set prefabFilter(filter: string) {
    this.#worker.postMessage({ prefabFilterRegexp: filter });
  }

  set blockFilter(filter: string) {
    this.#worker.postMessage({ blockFilterRegexp: filter });
  }

  set language(language: Language) {
    this.#worker.postMessage({ language });
  }

  refresh() {
    this.#worker.postMessage({});
  }

  addListener(fn: (m: PrefabsHandlerEventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }
}

const DEV_PREFAB_REGEXP = /^(aaa_|AAA_|spacercise_|terrain_smoothing_bug)/;

class PrefabFilterHandler {
  displayDevPrefab = false;
  updateListener: (() => void)[] = [];

  constructor(doms: { devPrefabs: HTMLInputElement }) {
    this.displayDevPrefab = doms.devPrefabs.checked;
    doms.devPrefabs.addEventListener("input", () => {
      this.displayDevPrefab = doms.devPrefabs.checked;
      this.updateListener.forEach((fn) => {
        fn();
      });
    });
  }

  filter(): (prefab: HighlightedPrefab) => boolean {
    return (prefab) => {
      if (!this.displayDevPrefab) {
        return !DEV_PREFAB_REGEXP.test(prefab.name);
      }
      return true;
    };
  }

  addUpdateListener(fn: () => void) {
    this.updateListener.push(fn);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
