"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const prefabs_1 = __importDefault(require("../lib/prefabs"));
const prefabs = new prefabs_1.default();
fetch("../block-prefab-index.json").then(async (r) => (prefabs.blockPrefabIndex = await r.json()));
fetch("../block-labels.json").then(async (r) => (prefabs.blockLabels = await r.json()));
onmessage = ({ data }) => {
  Object.assign(prefabs, data).update();
};
prefabs.addUpdateListener((u) => postMessage(u));
//# sourceMappingURL=prefabs-filter.js.map
