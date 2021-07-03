import Prefabs from "./lib/prefabs";

export type PrefabsFilterInMessage = Partial<Pick<Prefabs, "all" | "prefabsFilterString" | "blocksFilterString" | "markCoords">>;

const prefabs = new Prefabs();
fetch("block-prefab-index.json").then(async (r) => (prefabs.blockPrefabIndex = await r.json()));
fetch("block-labels.json").then(async (r) => (prefabs.blockLabels = await r.json()));

onmessage = ({ data }) => {
  Object.assign(prefabs, data as PrefabsFilterInMessage).update();
};

prefabs.addUpdateListener((u) => postMessage(u));
