import type * as prefabsFilter from "./worker/prefabs-filter";

import { DelayedRenderer } from "./lib/delayed-renderer";
import * as events from "./lib/events";
import { LabelHandler } from "./lib/label-handler";
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

  const prefabsHandler = new PrefabsHandler(
    {
      prefabFilter: component("prefab-filter", HTMLInputElement),
      blockFilter: component("block-filter", HTMLInputElement),
      minTier: component("min-tier", HTMLInputElement),
      maxTier: component("max-tier", HTMLInputElement),
      excludes: Array.from(component("prefab-excludes").querySelectorAll("input[type=checkbox]")),
    },
    new Worker("worker/prefabs-filter.js"),
    new LabelHandler({ language: component("label-lang", HTMLSelectElement) }, navigator.languages),
    async () => {
      const [prefabBlockCounts, difficulties] = await Promise.all([
        fetchJson<PrefabBlockCounts>("prefab-block-counts.json"),
        fetchJson<PrefabDifficulties>("prefab-difficulties.json"),
      ]);
      return Object.keys(prefabBlockCounts).map((n) => ({
        name: n,
        x: 0,
        z: 0,
        difficulty: difficulties[n] ?? 0,
      }));
    },
  );

  const minTier = component("min-tier", HTMLInputElement);
  const maxTier = component("max-tier", HTMLInputElement);
  const tierClear = component("tier-clear", HTMLButtonElement);
  tierClear.addEventListener("click", () => {
    minTier.value = minTier.defaultValue;
    maxTier.value = maxTier.defaultValue;
    minTier.dispatchEvent(new Event("input"));
    maxTier.dispatchEvent(new Event("input"));
  });

  const status = component("prefabs-status");
  const prefabListRenderer = new DelayedRenderer<HighlightedPrefab>(document.documentElement, component("prefabs-list"), (p) =>
    prefabLi(p),
  );
  prefabsHandler.addListener(({ update }) => {
    status.textContent = update.status;
    prefabListRenderer.iterator = update.prefabs;
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
          `<span title="Difficulty Tier ${prefab.difficulty.toString()}" class="prefab-difficulty-${prefab.difficulty.toString()}">`,
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
        `<button data-input-for="blocks-filter" data-input-text="${block.name}" title="Filter with this block name">▲</button>`,
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

interface PrefabsHandlerDoms {
  prefabFilter: HTMLInputElement;
  blockFilter: HTMLInputElement;
  minTier: HTMLInputElement;
  maxTier: HTMLInputElement;
  excludes: HTMLInputElement[];
}

class PrefabsHandler {
  #doms: PrefabsHandlerDoms;
  #worker: PrefabsFilterWorker;
  #listeners = new events.ListenerManager<"update", PrefabsHandlerEventMessage>();

  constructor(doms: PrefabsHandlerDoms, worker: PrefabsFilterWorker, labelHandler: LabelHandler, fetchPrefabs: () => Promise<Prefab[]>) {
    this.#doms = doms;
    this.#worker = worker;

    doms.prefabFilter.addEventListener("input", () => {
      worker.postMessage({ prefabFilterRegexp: doms.prefabFilter.value });
    });
    doms.blockFilter.addEventListener("input", () => {
      worker.postMessage({ blockFilterRegexp: doms.blockFilter.value });
    });
    const tierRange = { start: doms.minTier.valueAsNumber, end: doms.maxTier.valueAsNumber };
    this.#tierRange = tierRange;
    doms.minTier.addEventListener("input", () => {
      const newMinTier = doms.minTier.valueAsNumber;
      if (newMinTier === tierRange.start) return;
      tierRange.start = newMinTier;
      this.#tierRange = tierRange;
    });
    doms.maxTier.addEventListener("input", () => {
      const newMaxTier = doms.maxTier.valueAsNumber;
      if (newMaxTier === tierRange.end) return;
      tierRange.end = newMaxTier;
      this.#tierRange = tierRange;
    });
    worker.postMessage({ preExcludes: this.#excludes });
    doms.excludes.forEach((e) => {
      e.addEventListener("change", () => {
        worker.postMessage({ preExcludes: this.#excludes });
      });
    });

    worker.addEventListener("message", (event: MessageEvent<prefabsFilter.OutMessage>) => {
      this.#listeners.dispatchNoAwait(event.data);
    });
    labelHandler.addListener(({ update: { lang } }) => {
      worker.postMessage({ language: lang });
    });
    fetchPrefabs()
      .then((p) => {
        worker.postMessage({ all: p });
      })
      .catch(printError);
  }

  get #excludes(): string[] {
    return this.#doms.excludes.flatMap((e) => (e.checked ? [e.value] : []));
  }

  set #tierRange(range: NumberRange) {
    this.#worker.postMessage({ difficulty: range });
  }

  addListener(fn: (m: PrefabsHandlerEventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
