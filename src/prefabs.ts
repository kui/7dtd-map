import { DelayedRenderer } from "./lib/delayed-renderer";
import * as presetButton from "./lib/preset-button";
import { component, fetchJson, printError } from "./lib/utils";
import { PrefabUpdate } from "./lib/prefabs";
import * as prefabsFilter from "./worker/prefabs-filter";
import { Language } from "./lib/labels";
import { LabelHandler } from "./lib/label-handler";
import { UrlState } from "./lib/url-state";

interface HighlightedPrefab {
  name: string;
  difficulty?: number;
  highlightedName?: string;
  highlightedLabel?: string;
  matchedBlocks?: HighlightedBlock[];
}

function main() {
  presetButton.init();

  const urlState = UrlState.create(location, document.querySelectorAll("input"));
  urlState.addUpdateListener((url) => {
    window.history.replaceState(null, "", url.toString());
  });

  const prefabsHandler = new PrefabsHandler(new Worker("worker/prefabs-filter.js"));
  (async () => {
    const [index, difficulties] = await Promise.all([
      fetchJson<PrefabBlockIndex>("prefab-block-index.json"),
      fetchJson<PrefabDifficulties>("prefab-difficulties.json"),
    ]);
    const prefabs = Object.keys(index).map((n) => ({ name: n, x: 0, z: 0, difficulty: difficulties[n] ?? 0 }));
    prefabsHandler.prefabs = prefabs;
  })().catch(printError);

  const blocksFilter = component("blocks_filter", HTMLInputElement);
  prefabsHandler.blockFilter = blocksFilter.value;
  blocksFilter.addEventListener("input", () => {
    prefabsHandler.blockFilter = blocksFilter.value;
  });

  const labelHandler = new LabelHandler({ language: component("label_lang", HTMLSelectElement) }, navigator.languages);
  labelHandler.addListener((lang) => {
    prefabsHandler.language = lang;
  });

  const prefabFilterHandler = new PrefabFilterHandler({ devPrefabs: component("dev_prefabs", HTMLInputElement) });
  prefabFilterHandler.addUpdateListener(() => {
    prefabsHandler.refresh();
  });

  const prefabListRenderer = new DelayedRenderer<HighlightedPrefab>(document.body, component("prefabs_list"), (p) => prefabLi(p));
  prefabsHandler.listeners.push((update) => {
    prefabListRenderer.iterator = update.prefabs.filter(prefabFilterHandler.filter());
  });
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    ...(prefab.difficulty
      ? [
          `<span title="Difficulty Tier ${prefab.difficulty.toString()}" class="prefab_difficulty_${prefab.difficulty.toString()}">`,
          `  <span class="prefab_difficulty_icon">💀</span>${prefab.difficulty.toString()}`,
          `</span>`,
        ]
      : []),
    `<a href="prefabs/${prefab.name}.html" target="_blank">`,
    prefab.highlightedLabel ?? "-",
    "/",
    `<small>${prefab.highlightedName ?? prefab.name}</small>`,
    "</a>",
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

declare class PrefabsFilterWorker extends Worker {
  postMessage(message: prefabsFilter.InMessage): void;
}

class PrefabsHandler {
  worker: PrefabsFilterWorker;
  listeners: ((prefabs: PrefabUpdate) => void | Promise<void>)[] = [];

  constructor(worker: PrefabsFilterWorker) {
    this.worker = worker;
    this.worker.addEventListener("message", (event: MessageEvent<PrefabUpdate>) => {
      for (const fn of this.listeners) {
        fn(event.data)?.catch(printError);
      }
    });
  }

  set prefabs(p: Prefab[]) {
    this.worker.postMessage({ all: p });
  }

  set blockFilter(filter: string) {
    this.worker.postMessage({ blocksFilterString: filter });
  }

  set language(language: Language) {
    this.worker.postMessage({ language });
  }

  refresh() {
    this.worker.postMessage({});
  }
}

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
        return !/^aaa_/i.test(prefab.name);
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
