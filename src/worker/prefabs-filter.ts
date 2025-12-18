import { EventMessage, PrefabFilter } from "../lib/prefab-filter.ts";
import { fetchJson, printError } from "../lib/utils.ts";

export type InMessage = Partial<
  Pick<PrefabFilter, "all" | "difficulty" | "prefabFilterRegexp" | "blockFilterRegexp" | "markCoords" | "language" | "preExcludes">
>;
export type OutMessage = EventMessage;

const prefabs = new PrefabFilter("../labels", navigator.languages, async () =>
  invertCounts(await fetchJson("../prefab-block-counts.json")),
);

onmessage = ({ data }: MessageEvent<InMessage>) => {
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
      blockPrefabCounts[blockName] = Object.assign(blockPrefabCounts[blockName] ?? {}, { [prefabName]: count });
    }
  }
  return blockPrefabCounts;
}
