/* eslint-env worker */
/* eslint no-restricted-globals: 1 */

import Prefabs from './lib/prefabs';

const knownParamNames = new Set([
  'all',
  'prefabsFilterString',
  'blocksFilterString',
  'markCoords',
  'blockPrefabIndex',
  'blockLabels',
]);

const prefabs = new Prefabs(self);

onmessage = (event) => {
  Object.entries(event.data).forEach(([key, value]) => {
    if (knownParamNames.has(key)) {
      prefabs[key] = value;
    } else {
      console.warn('Unknown prop: %s', key);
    }
  });
  prefabs.update();
};

prefabs.addUpdateListener((d) => postMessage(d));
