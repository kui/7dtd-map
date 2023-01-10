"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
const delayed_renderer_1 = require("./lib/delayed-renderer");
const presetButton = __importStar(require("./lib/preset-button"));
const utils_1 = require("./lib/utils");
function main() {
  presetButton.init();
  const prefabsHandler = new PrefabsHandler(new Worker("worker/prefabs-filter.js"));
  (0, utils_1.component)("blocks_filter", HTMLInputElement).addEventListener("input", (e) => (prefabsHandler.blockFilter = e.target.value));
  fetch("prefab-block-index.json").then(async (response) => {
    const prefabs = Object.keys(await response.json()).map((n) => ({ name: n, x: 0, z: 0 }));
    prefabsHandler.prefabs = prefabs;
  });
  const prefabListRenderer = new delayed_renderer_1.DelayedRenderer(document.body, (0, utils_1.component)("prefabs_list"), (p) =>
    prefabLi(p)
  );
  prefabsHandler.listeners.push(async (update) => {
    prefabListRenderer.iterator = update.prefabs;
  });
}
function prefabLi(prefab) {
  const li = document.createElement("li");
  li.innerHTML = `<a href="prefabs/${prefab.name}.html" target="_blank">${prefab.highlightedName || prefab.name}</a>`;
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
class PrefabsHandler {
  constructor(worker) {
    this.listeners = [];
    this.worker = worker;
    this.worker.addEventListener("message", (event) => {
      this.listeners.map((fn) => fn(event.data));
    });
  }
  set prefabs(p) {
    this.worker.postMessage({ all: p });
  }
  set blockFilter(filter) {
    this.worker.postMessage({ blocksFilterString: filter });
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
//# sourceMappingURL=prefabs.js.map
