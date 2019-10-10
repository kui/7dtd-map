/* eslint-env worker */
/* eslint no-restricted-globals: 1 */

import Map from './lib/map';
// import renderWaterImg from './lib/water-renderer';

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
let dtm;
let waterInfo;

onmessage = (event) => {
  const {
    canvas,
    dtm: newDtm,
    waterInfo: newWaterInfo,
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

  if (newDtm) {
    dtm = newDtm;
  }

  if (newWaterInfo) {
    waterInfo = newWaterInfo;
  }

  if ((newDtm || newWaterInfo) && map && dtm && waterInfo) {
    // renderWaterImg(self, map, dtm, waterInfo).then((w) => {
    //   map.waterImg = w;
    //   map.update();
    // });
  }

  postMessage({
    mapSizes: {
      width: map.width,
      height: map.height,
    },
  });

  map.update();
};
