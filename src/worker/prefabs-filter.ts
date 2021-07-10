import Prefabs from "../lib/prefabs";

export type InMessage = Partial<Pick<Prefabs, "all" | "prefabsFilterString" | "blocksFilterString" | "markCoords">>;

const prefabs = new Prefabs();
fetch("../block-prefab-index.json").then(async (r) => (prefabs.blockPrefabIndex = await r.json()));
fetch("../block-labels.json").then(async (r) => (prefabs.blockLabels = await r.json()));

onmessage = ({ data }: MessageEvent<InMessage>) => {
  Object.assign(prefabs, data).update();
};

prefabs.addUpdateListener((u) => postMessage(u));
