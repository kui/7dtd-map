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
    this.signChar = '✗';
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
    this.updateRequest = null;
    console.log('update');
  }
}

function drawPrefabs(map, ctx) {
  ctx.font = `${map.signSize}px sans-serif`;
  ctx.lineWidth = Math.round(map.signSize * 0.08);
  ctx.strokeStyle = 'white';
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
    ctx.shadowBlur = 20;
    ctx.strokeText(map.signChar, x, y);
    ctx.shadowBlur = 0;
    ctx.fillText(map.signChar, x, y);
    // console.log('Prot %o: %f, %f', prefab, x, y);
  });
}
