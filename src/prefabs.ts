import { DelayedRenderer } from "./lib/delayed-renderer";
import * as presetButton from "./lib/preset-button";
import { component } from "./lib/utils";
import { PrefabUpdate } from "./lib/prefabs";
import * as prefabsFilter from "./worker/prefabs-filter";

interface HighlightedPrefab {
  name: string;
  label?: string;
  highlightedName?: string;
  highlightedLabel?: string;
  matchedBlocks?: HighlightedBlock[];
}

function main() {
  presetButton.init();

  const prefabsHandler = new PrefabsHandler(new Worker("worker/prefabs-filter.js"));
  component("blocks_filter", HTMLInputElement).addEventListener(
    "input",
    (e) => (prefabsHandler.blockFilter = (e.target as HTMLInputElement).value)
  );
  fetch("prefab-block-index.json").then(async (response) => {
    const prefabs = Object.keys(await response.json()).map((n) => ({ name: n, x: 0, z: 0 }));
    prefabsHandler.prefabs = prefabs;
  });
  const prefabListRenderer = new DelayedRenderer<HighlightedPrefab>(document.body, component("prefabs_list"), (p) => prefabLi(p));
  prefabsHandler.listeners.push(async (update) => {
    prefabListRenderer.iterator = update.prefabs;
  });
}

function prefabLi(prefab: HighlightedPrefab) {
  const li = document.createElement("li");
  li.innerHTML = [
    `<a href="prefabs/${prefab.name}.html" target="_blank">`,
    prefab.highlightedLabel || prefab.label || "-",
    `<small>${prefab.highlightedName || prefab.name}</small>`,
    "</a>",
  ].join(" ");
  if (prefab.matchedBlocks && prefab.matchedBlocks.length > 0) {
    const blocksUl = document.createElement("ul");
    prefab.matchedBlocks.forEach((block) => {
      const blockLi = document.createElement("li");
      blockLi.innerHTML = [
        `<button data-input-for="blocks_filter" data-input-text="${block.name}" title="Filter with this block name">▲</button>`,
        `${block.count}x`,
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
  listeners: ((prefabs: PrefabUpdate) => Promise<void>)[] = [];

  constructor(worker: PrefabsFilterWorker) {
    this.worker = worker;
    this.worker.addEventListener("message", (event: MessageEvent<PrefabUpdate>) => {
      this.listeners.map((fn) => fn(event.data));
    });
  }

  set prefabs(p: Prefab[]) {
    this.worker.postMessage({ all: p });
  }

  set blockFilter(filter: string) {
    this.worker.postMessage({ blocksFilterString: filter });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
