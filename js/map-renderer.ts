/* eslint-env worker */
/* eslint no-restricted-globals: 1 */

import Map from './lib/map';

const knownParamNames = new Set([
  'biomesImg',
  'splat3Img',
  'splat4Img',
  'radImg',
  'showBiomes',
  'showSplat3',
  'showSplat4',
  'showRad',
  'showPrefabs',
  'brightness',
  'scale',
  'signSize',
  'prefabs',
  'signChar',
  'markChar',
  'markCoords',
]);

let map;

onmessage = (event) => {
  const {
    canvas,
    ...restParams
  } = event.data;

  if (canvas) {
    if (map) {
      map.canvas = canvas;
    } else {
      map = new Map(self, canvas);
    }
  }

  Object.keys(restParams).forEach((paramName) => {
    if (!knownParamNames.has(paramName)) {
      return;
    }
    map[paramName] = restParams[paramName];
  });

  postMessage({
    mapSizes: {
      width: map.width,
      height: map.height,
    },
  });

  map.update();
};
