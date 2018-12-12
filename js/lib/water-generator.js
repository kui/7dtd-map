import { parseXmlByUrl, parseXmlByFile } from './xml-parser';

export async function generateWaterByFile(window, dtm, file) {
  return generate(window, dtm, await parseXmlByFile(window, file));
}

export async function generateWaterByUrl(window, dtm, url) {
  return generate(window, dtm, await parseXmlByUrl(window, url));
}

function generate(window, dtm, dom) {
  // const canvas = new window.OffscreenCanvas(dtm.width, dtm.height);
  const canvas = window.document.createElement('canvas');
  canvas.width = dtm.width;
  canvas.height = dtm.height;
  window.document.body.appendChild(canvas);
  const context = canvas.getContext('2d');
  context.fillStyle = 'blue';
  Array.from(dom.getElementsByTagName('Water')).forEach((el) => {
    const attrs = el.attributes;
    const [x, y, z] = attrs.pos.value.split(/, +/).map(i => parseInt(i, 10));

    const minx = parseInt(attrs.minx.value, 10) + dtm.width / 2;
    const maxx = parseInt(attrs.maxx.value, 10) + dtm.width / 2;
    const minz = parseInt(attrs.maxz.value, 10) * -1 + dtm.height / 2;
    const maxz = parseInt(attrs.minz.value, 10) * -1 + dtm.height / 2;

    renderWater({
      context,
      dtm,
      elevationThreshold: y,
      minx,
      maxx,
      minz,
      maxz,
      basePoint: new Point(
        x + dtm.width / 2,
        -1 * z + dtm.height / 2,
        maxx,
      ),
    });
  });
  return window.createImageBitmap(canvas);
}

function renderWater({ context, dtm, elevationThreshold, minx, maxx, minz, maxz, basePoint }) {
  let points = [basePoint];
  const plotted = new Set();
  while (points.length !== 0) {
    const point = points.shift();
    const pointHash = point.hash;
    if (plotted.has(pointHash)) {
      continue;
    }

    if (point.x < minx || maxx < point.x || point.z < minz || maxz < point.z) {
      continue;
    }

    const elevation = dtm.value(point.x, point.z);
    if (elevation > elevationThreshold) {
      continue;
    }

    context.fillRect(point.x, point.z, 1, 1);
    plotted.add(pointHash);

    points = points.concat(point.nextPoints);
  }
}

class Point {
  constructor(x, z, maxx) {
    this.x = x;
    this.z = z;
    this.maxx = maxx;
  }

  get hash() {
    return this.maxx * this.z + this.x;
  }

  get nextPoints() {
    return [
      new Point(this.x - 1, this.z, this.maxx),
      new Point(this.x + 1, this.z, this.maxx),
      new Point(this.x, this.z - 1, this.maxx),
      new Point(this.x, this.z + 1, this.maxx),
    ];
  }
}
