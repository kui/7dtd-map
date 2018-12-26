import { Dtm } from './dtm-loader';

export default async function renderWaterImg(window, map, dtmRaw, waterInfo) {
  const { height, width } = map;

  const canvas = new window.OffscreenCanvas(width, height);

  // canvas.width = width * map.scale;
  // canvas.height = height * map.scale;

  const dtm = new Dtm(dtmRaw, width);

  const context = canvas.getContext('2d');
  context.fillStyle = 'blue';
  // context.scale(map.scale, map.scale);

  for (let i = 0, len = waterInfo.length; i < len; i += 1) {
    const water = waterInfo[i];
    const { x, y, z } = water;

    const minx = parseInt(water.minx, 10) + width / 2;
    const maxx = parseInt(water.maxx, 10) + width / 2;
    const minz = parseInt(water.maxz, 10) * -1 + height / 2;
    const maxz = parseInt(water.minz, 10) * -1 + height / 2;

    console.log('Start water render: ', water);
    const result = renderWater({
      context,
      dtm,
      elevationThreshold: y,
      minx,
      maxx,
      minz,
      maxz,
      basePoint: new Point(
        x + width / 2,
        -1 * z + height / 2,
        width,
      ),
    });
    console.log('End water render:', result);

    // await new Promise(window.requestAnimationFrame);
  }

  const blob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: 0.95,
  });
  console.log(URL.createObjectURL(blob));

  return window.createImageBitmap(canvas);
}

function renderWater({
  context, dtm, elevationThreshold, minx, maxx, minz, maxz, basePoint,
}) {
  if (isPlotted(context, basePoint)) {
    console.log('Abort water render: already water exists');
    return 0;
  }

  let points = [basePoint];
  let num = 0;
  const plotted = new Set();

  /* eslint-disable no-continue */
  while (points.length !== 0) {
    const point = points.shift();
    const pointHash = point.hash;
    if (plotted.has(pointHash)) {
      continue;
    }

    if (point.x < minx || maxx < point.x || point.z < minz || maxz < point.z) {
      continue;
    }

    const elevation = dtm.getElevation(point.x, point.z);
    console.log(elevation, elevationThreshold);
    if (elevation > elevationThreshold) {
      continue;
    }

    context.fillRect(point.x, point.z, 1, 1);
    plotted.add(pointHash);
    num += 1;

    points = points.concat(point.nextPoints);
  }
  /* eslint-enable no-continue */

  return num;
}

class Point {
  constructor(x, z, width) {
    Object.assign(this, { x, z, width });
  }

  get hash() {
    return this.x + this.width * this.z;
  }

  get nextPoints() {
    return [
      new Point(this.x - 1, this.z, this.width),
      new Point(this.x + 1, this.z, this.width),
      new Point(this.x, this.z - 1, this.width),
      new Point(this.x, this.z + 1, this.width),
    ];
  }
}

function isPlotted(context, { x, z }) {
  const { data } = context.getImageData(x, z, 1, 1);
  // is blue?
  return data[2] === 255;
}
