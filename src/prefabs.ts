import type { PrefabsFilterOutputMessage } from "./worker/types.ts";
import type {
  HighlightedPrefab,
  Prefab,
  PrefabBlockCounts,
  PrefabDifficulties,
} from "./types/7dtdmap.ts";

import { DelayedRenderer } from "./lib/delayed-renderer.ts";
import * as events from "./lib/events.ts";
import { LabelHandler } from "./lib/label-handler.ts";
import {
  bindPrefabsFilterControls,
  type PrefabsFilterControlsDoms,
  type PrefabsFilterWorker,
  readPreExcludes,
  readTierRange,
} from "./lib/prefabs-filter-controls.ts";
import * as minMaxInputs from "./lib/ui/min-max-inputs.ts";
import * as presetButton from "./lib/ui/preset-button.ts";
import * as syncOutput from "./lib/ui/sync-output.ts";
import { UrlState } from "./lib/url-state.ts";
import { component } from "./lib/dom-utils.ts";
import { escapeHtml, fetchJson, printError } from "./lib/utils.ts";
import { installPrefabLinkTooltip } from "./lib/prefab-link-tooltip.ts";

function main() {
  presetButton.init();
  syncOutput.init();
  minMaxInputs.init();

  const urlState = UrlState.create(
    location,
    document.querySelectorAll("input"),
  );
  urlState.addUpdateListener((url) => {
    globalThis.history.replaceState(null, "", url.toString());
  });

  const prefabsHandler = new PrefabsHandler(
    {
      prefabFilter: component("prefab-filter", HTMLInputElement),
      blockFilter: component("block-filter", HTMLInputElement),
      minMatchedBlockCount: component(
        "min-matched-block-count",
        HTMLInputElement,
      ),
      minTier: component("min-tier", HTMLInputElement),
      maxTier: component("max-tier", HTMLInputElement),
      preExcludes: Array.from(
        component("prefab-excludes").querySelectorAll("input[type=checkbox]"),
      ),
    },
    new Worker("worker/prefabs-filter.js"),
    new LabelHandler(
      { language: component("label-lang", HTMLSelectElement) },
      "labels",
      navigator.languages,
    ),
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
  const prefabListRenderer = new DelayedRenderer<HighlightedPrefab>(
    component("prefabs-list"),
    (p) => prefabLi(p),
  );
  prefabsHandler.addListener(({ status: text, prefabs }) => {
    status.textContent = text;
    prefabListRenderer.iterator = prefabs;
  });

  installPrefabLinkTooltip({
    tooltip: component("prefab_link_tooltip", HTMLElement),
    image: component("prefab_link_tooltip_image", HTMLImageElement),
  });

  // init

  prefabsHandler.init().catch(printError);
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  const safeName = escapeHtml(prefab.name);
  li.innerHTML = [
    ...(prefab.difficulty
      ? [
        `<span title="Difficulty Tier ${prefab.difficulty.toString()}" class="prefab-difficulty-${prefab.difficulty.toString()}">`,
        `  💀${prefab.difficulty.toString()}`,
        `</span>`,
      ]
      : []),
    `<a href="prefabs/${safeName}.html" target="_blank">`,
    prefab.highlightedLabel ?? "-",
    "/",
    `<small>${prefab.highlightedName ?? safeName}</small></a>`,
    ...(prefab.matchedBlockCount !== undefined && prefab.matchedBlockCount > 0
      ? ["has", prefab.matchedBlockCount, "blocks"]
      : []),
  ].join(" ");
  if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
    const blocksUl = document.createElement("ul");
    prefab.matchedBlocks.forEach((block) => {
      if (block.count === undefined) return;
      const blockLi = document.createElement("li");
      const safeBlockName = escapeHtml(block.name);
      blockLi.innerHTML = [
        `<button data-input-for="blocks-filter" data-input-text="${safeBlockName}" title="Filter with this block name">▲</button>`,
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

type PrefabsHandlerEventMessage = PrefabsFilterOutputMessage;

class PrefabsHandler {
  #doms: PrefabsFilterControlsDoms;
  #worker: PrefabsFilterWorker;
  #labelHandler: LabelHandler;
  #fetchPrefabs: () => Promise<Prefab[]>;
  #listeners = new events.ListenerManager<PrefabsHandlerEventMessage>();

  constructor(
    doms: PrefabsFilterControlsDoms,
    worker: PrefabsFilterWorker,
    labelHandler: LabelHandler,
    fetchPrefabs: () => Promise<Prefab[]>,
  ) {
    this.#doms = doms;
    this.#worker = worker;
    this.#labelHandler = labelHandler;
    this.#fetchPrefabs = fetchPrefabs;

    bindPrefabsFilterControls(doms, worker, labelHandler);

    worker.addEventListener(
      "message",
      (event: MessageEvent<PrefabsFilterOutputMessage>) => {
        this.#listeners.dispatchNoAwait(event.data);
      },
    );
  }

  addListener(fn: (m: PrefabsHandlerEventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }

  async init() {
    this.#worker.postMessage({
      prefabFilterRegexp: this.#doms.prefabFilter.value,
      blockFilterRegexp: this.#doms.blockFilter.value,
      minMatchedBlockCount: this.#doms.minMatchedBlockCount.valueAsNumber || 0,
      difficulty: readTierRange(this.#doms),
      preExcludes: readPreExcludes(this.#doms),
      language: this.#labelHandler.language,
      all: await this.#fetchPrefabs(),
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
