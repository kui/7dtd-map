/* eslint-env worker */
/* eslint no-restricted-globals: 1 */

import Map from './lib/map';

const knownParamNames = new Set([
  'biomesImg',
  'splat3Img',
  'radImg',
  'showBiomes',
  'showSplat3',
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
  console.log('event %o', event.data);
  const { canvas, ...restParams } = event.data;

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