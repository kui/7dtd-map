import Prefabs from "../lib/prefabs";
import { printError, fetchJson } from "../lib/utils";

export type InMessage = Partial<Pick<Prefabs, "all" | "prefabsFilterString" | "blocksFilterString" | "markCoords" | "language">>;

const prefabs = new Prefabs("../labels", navigator.languages);
(async () => {
  prefabs.blockPrefabIndex = await fetchJson("../block-prefab-index.json");
  prefabs.update();
})().catch(printError);

onmessage = ({ data }: MessageEvent<InMessage>) => {
  console.log("Prefab-filter received message: ", data);
  Object.assign(prefabs, data).update();
};

prefabs.addUpdateListener((u) => {
  console.log("Prefab-filter send message: ", u);
  postMessage(u);
});
