export default async function renderWaterImg(window, canvas, map, dtm, waterInfo) {
  const { height, width } = map;

  canvas.width = width * map.scale;
  canvas.height = height * map.scale;

  const context = canvas.getContext('2d');
  context.fillStyle = 'blue';
  context.scale(map.scale, map.scale);

  waterInfo.forEach((water) => {
    const { x, y, z } = water;

    const minx = parseInt(water.minx, 10) + width / 2;
    const maxx = parseInt(water.maxx, 10) + width / 2;
    const minz = parseInt(water.maxz, 10) * -1 + height / 2;
    const maxz = parseInt(water.minz, 10) * -1 + height / 2;

    console.log('Start water render: %o', water);
    const result = renderWater({
      context,
      dtm: new Dtm(dtm, width),
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
    console.log('End water render: %o', result);
  });
  return window.createImageBitmap(canvas);
}

function renderWater({
  context, dtm, elevationThreshold, minx, maxx, minz, maxz, basePoint,
}) {
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
    return this.width * this.z + this.x;
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

class Dtm {
  constructor(dtm, width) {
    Object.assign(this, { dtm: Buffer.from(dtm), width });
  }

  getElevation(x, z) {
    return this.dtm.readInt16BE((x + this.width * z) * 2);
  }
}
