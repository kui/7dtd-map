export default class Map {
  constructor(window, canvas) {
    this.window = window;
    this.canvas = canvas;
    this.showBiomes = true;
    this.showSplat3 = true;
    this.showRad = true;
    this.showPrefabs = true;
    this.biomesImg = null;
    this.splat3Img = null;
    this.radImg = null;
    this.brightness = '100%';
    this.scale = '0.1';
    this.signSize = 200;
    this.prefabs = [];
    this.signChar = '✘';

    // flag
    this.markChar = '🚩️';
    this.markCoords = {};

    this.updateRequest = null;
  }

  get width() {
    return Math.max(
      this.biomesImg ? this.biomesImg.width : 0,
      this.splat3Img ? this.splat3Img.width : 0,
    );
  }

  get height() {
    return Math.max(
      this.biomesImg ? this.biomesImg.height : 0,
      this.splat3Img ? this.splat3Img.height : 0,
    );
  }

  update() {
    if (this.updateRequest) {
      return;
    }
    this.updateRequest = this.window.requestAnimationFrame(() => this.updateImmediately());
  }

  updateImmediately() {
    this.canvas.width = this.width * this.scale;
    this.canvas.height = this.height * this.scale;
    const context = this.canvas.getContext('2d');
    context.scale(this.scale, this.scale);
    context.filter = `brightness(${this.brightness})`;
    if (this.biomesImg && this.showBiomes) {
      context.drawImage(this.biomesImg, 0, 0, this.width, this.height);
    }
    if (this.splat3Img && this.showSplat3) {
      context.drawImage(this.splat3Img, 0, 0, this.width, this.height);
    }
    context.filter = 'none';
    if (this.radImg && this.showRad) {
      context.imageSmoothingEnabled = false;
      context.drawImage(this.radImg, 0, 0, this.width, this.height);
      context.imageSmoothingEnabled = true;
    }
    if (this.showPrefabs) {
      drawPrefabs(this, context);
    }
    if (this.markCoords && this.markCoords.x && this.markCoords.y) {
      drawMark(this, context);
    }
    this.updateRequest = null;
    console.log('update');
  }
}

function drawPrefabs(map, ctx) {
  ctx.font = `${map.signSize}px sans-serif`;
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'black';

  const offsetX = map.width / 2;
  const offsetY = map.height / 2;
  map.prefabs.forEach((prefab) => {
    const x = offsetX + prefab.x;
    // prefab vertical positions are inverted for canvas coodinates
    const y = offsetY - prefab.y;

    ctx.lineWidth = Math.round(map.signSize * 0.1);
    ctx.strokeStyle = 'white';
    ctx.strokeText(map.signChar, x, y);

    ctx.lineWidth = Math.round(map.signSize * 0.03);
    ctx.strokeStyle = 'black';
    ctx.strokeText(map.signChar, x, y);

    ctx.fillText(map.signChar, x, y);
  });
}

function drawMark(map, ctx) {
  ctx.font = `${map.signSize}px sans-serif`;
  ctx.lineWidth = Math.round(map.signSize * 0.1);
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'black';

  const offsetX = map.width / 2;
  const offsetY = map.height / 2;

  const x = offsetX + map.markCoords.x - Math.round(map.signSize * 0.2);
  // prefab vertical positions are inverted for canvas coodinates
  const y = offsetY - map.markCoords.y - Math.round(map.signSize * 0.2);

  ctx.strokeText(map.markChar, x, y);
  ctx.fillText(map.markChar, x, y);
}
