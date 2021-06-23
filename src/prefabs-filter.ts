import Prefabs from "./lib/prefabs";

const knownParamNames = new Set([
  "all",
  "prefabsFilterString",
  "blocksFilterString",
  "markCoords",
  "blockPrefabIndex",
  "blockLabels",
]);

const prefabs = new Prefabs(self);

onmessage = (event) => {
  Object.entries(event.data).forEach(([key, value]) => {
    if (knownParamNames.has(key)) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      prefabs[key] = value;
    } else {
      console.warn("Unknown prop: %s", key);
    }
  });
  prefabs.update();
};

// @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 1.
prefabs.addUpdateListener((d: any) => postMessage(d));
