import Prefabs from "../lib/prefabs";
import { printError, fetchJson } from "../lib/utils";

export type InMessage = Partial<
  Pick<Prefabs, "all" | "difficulty" | "prefabFilterRegexp" | "blockFilterRegexp" | "markCoords" | "language">
>;

const prefabs = new Prefabs("../labels", navigator.languages);
(async () => {
  prefabs.blockPrefabCounts = invertCounts(await fetchJson("../prefab-block-counts.json"));
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

function invertCounts(counts: PrefabBlockCounts): BlockPrefabCounts {
  const blockPrefabCounts: BlockPrefabCounts = {};
  for (const [prefabName, blockCounts] of Object.entries(counts))
    for (const [blockName, count] of Object.entries(blockCounts))
      blockPrefabCounts[blockName] = Object.assign(blockPrefabCounts[blockName] ?? {}, { [prefabName]: count });
  return blockPrefabCounts;
}
