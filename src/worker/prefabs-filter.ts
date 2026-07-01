import type {
  BlockPrefabCounts,
  PrefabAddedVersions,
  PrefabBlockCounts,
  PrefabDifficulties,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";
import { PrefabFilter } from "./lib/prefab-filter.ts";
import { fetchJson, printError } from "../lib/utils.ts";
import type { PrefabsFilterInputMessage } from "./types.ts";

const prefabs = new PrefabFilter(
  "../labels",
  navigator.languages,
  async () => invertCounts(await fetchJson("../prefab-block-counts.json")),
  () => fetchJson<PrefabMeshSizes>("../prefab-mesh-sizes.json"),
  () => fetchJson<PrefabDifficulties>("../prefab-difficulties.json"),
  () => fetchJson<PrefabAddedVersions>("../prefab-added-versions.json"),
);

onmessage = ({ data }: MessageEvent<PrefabsFilterInputMessage>) => {
  console.log("Prefab-filter received message: ", data);
  Object.assign(prefabs, data).update().catch(printError);
};

prefabs.addListener((m) => {
  console.log("Prefab-filter send message: ", m);
  postMessage(m);
});

function invertCounts(counts: PrefabBlockCounts): BlockPrefabCounts {
  const blockPrefabCounts: BlockPrefabCounts = {};
  for (const [prefabName, blockCounts] of Object.entries(counts)) {
    for (const [blockName, count] of Object.entries(blockCounts)) {
      blockPrefabCounts[blockName] = Object.assign(
        blockPrefabCounts[blockName] ?? {},
        { [prefabName]: count },
      );
    }
  }
  return blockPrefabCounts;
}
