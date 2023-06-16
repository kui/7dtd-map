import Prefabs from "../lib/prefabs";

export type InMessage = Partial<Pick<Prefabs, "all" | "prefabsFilterString" | "blocksFilterString" | "markCoords">>;

const prefabs = new Prefabs();

Promise.all([
  (async () => (prefabs.prefabLabels = await fetchJson("../prefab-labels.json")))(),
  (async () => (prefabs.blockPrefabIndex = await fetchJson("../block-prefab-index.json")))(),
  (async () => (prefabs.blockLabels = await fetchJson("../block-labels.json")))(),
]).then(() => prefabs.update());

onmessage = ({ data }: MessageEvent<InMessage>) => {
  Object.assign(prefabs, data).update();
};

prefabs.addUpdateListener((u) => postMessage(u));

async function fetchJson<T>(path: string): Promise<T> {
  return (await fetch(path)).json();
}
