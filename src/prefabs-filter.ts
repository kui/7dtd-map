import Prefabs from "./lib/prefabs";

export declare interface PrefabsFilterInMessage {
  all?: Prefab[];
  prefabsFilterString?: string;
  blocksFilterString?: string;
  markCoords?: Coords | null;
  blockPrefabIndex?: BlockPrefabIndex;
  blockLabels?: BlockLabels;
}

const prefabs = new Prefabs();

onmessage = ({ data }) => {
  Object.assign(prefabs, data as PrefabsFilterInMessage);
  prefabs.update();
};

prefabs.addUpdateListener((u) => postMessage(u));
