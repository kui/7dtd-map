"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const image_bitmap_holder_1 = require("./image-bitmap-holder");
const throttled_invoker_1 = require("./throttled-invoker");
const utils_1 = require("./utils");
const MARK_CHAR = "🚩️";
class MapRenderer {
  constructor(canvas, fontFace, toolTipFontFace) {
    this.brightness = "100%";
    this.markerCoords = null;
    this.scale = 0.1;
    this.showPrefabs = true;
    this.showToolTips = false;
    this.prefabs = [];
    this.signSize = 200;
    this.markerSize = 100;
    this.toolTipSize = 300;
    this.signAlpha = 1;
    this.biomesAlpha = 1;
    this.splat3Alpha = 1;
    this.splat4Alpha = 1;
    this.radAlpha = 1;
    this.update = (0, throttled_invoker_1.throttledInvoker)(async () => {
      console.time("MapUpdate");
      await this.updateImmediately();
      console.timeEnd("MapUpdate");
    });
    this._biomesImg = null;
    this._splat3Img = null;
    this._splat4Img = null;
    this._radImg = null;
    this.canvas = canvas;
    this.fontFace = fontFace;
    this.toolTipFontFace = toolTipFontFace;
  }
  set biomesImg(img) {
    this._biomesImg = img ? new image_bitmap_holder_1.ImageBitmapHolder("biomes", img) : null;
  }
  set splat3Img(img) {
    this._splat3Img = img ? new image_bitmap_holder_1.ImageBitmapHolder("splat3", img) : null;
  }
  set splat4Img(img) {
    this._splat4Img = img ? new image_bitmap_holder_1.ImageBitmapHolder("splat4", img) : null;
  }
  set radImg(img) {
    this._radImg = img ? new image_bitmap_holder_1.ImageBitmapHolder("rad", img) : null;
  }
  async size() {
    const rects = await Promise.all([this._biomesImg?.get(), this._splat3Img?.get(), this._splat4Img?.get()]);
    return (0, utils_1.gameMapSize)({
      width: Math.max(...rects.map((r) => r?.width ?? 0)),
      height: Math.max(...rects.map((r) => r?.height ?? 0)),
    });
  }
  isBlank() {
    return !this._biomesImg && !this._splat3Img && !this._splat4Img;
  }
  async updateImmediately() {
    if (this.isBlank()) {
      this.canvas.width = 1;
      this.canvas.height = 1;
      return;
    }
    const { width, height } = await this.size();
    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;
    const context = this.canvas.getContext("2d");
    if (!context) return;
    context.scale(this.scale, this.scale);
    context.filter = `brightness(${this.brightness})`;
    if (this._biomesImg && this.biomesAlpha !== 0) {
      context.globalAlpha = this.biomesAlpha;
      context.drawImage(await this._biomesImg.get(), 0, 0, width, height);
    }
    if (this._splat3Img && this.splat3Alpha !== 0) {
      context.globalAlpha = this.splat3Alpha;
      context.drawImage(await this._splat3Img.get(), 0, 0, width, height);
    }
    if (this._splat4Img && this.splat4Alpha !== 0) {
      context.globalAlpha = this.splat4Alpha;
      context.drawImage(await this._splat4Img.get(), 0, 0, width, height);
    }
    context.filter = "none";
    if (this._radImg && this.radAlpha !== 0) {
      context.globalAlpha = this.radAlpha;
      context.imageSmoothingEnabled = false;
      context.drawImage(await this._radImg.get(), 0, 0, width, height);
      context.imageSmoothingEnabled = true;
    }
    context.globalAlpha = this.signAlpha;
    if (this.showPrefabs) {
      this.drawPrefabs(context, width, height);
    }
    if (this.markerCoords) {
      this.drawMark(context, width, height);
    }
  }
  customizeSignByPrefabCategory(prefab) {
    const pfName = prefab.name.toLocaleLowerCase();
    let prefabInfo = { text: "❌", ctx: { fillStyle: "white", strokeStyle: "#000" } };
    if (pfName.includes("filler")) {
      prefabInfo = { text: "🔶", ctx: { fillStyle: "gray", strokeStyle: "#1C2F51" } };
      return prefabInfo;
    } else if (pfName.includes("part") && !pfName.includes("apartment")) {
      prefabInfo = { text: "", ctx: { fillStyle: "#576D98", strokeStyle: "#374869" } };
      return prefabInfo;
    } else if (pfName.includes("gas")) {
      prefabInfo = { text: "⛽", ctx: { fillStyle: "red", strokeStyle: "#5E1616" } };
      return prefabInfo;
    } else if (pfName.includes("trader") && !pfName.includes("filler")) {
      prefabInfo = { text: "💰", ctx: { fillStyle: "yellow", strokeStyle: "#A47D00" } };
      return prefabInfo;
    } else if (pfName.includes("sham")) {
      prefabInfo = { text: "🥫", ctx: { fillStyle: "yellow", strokeStyle: "white" } };
      return prefabInfo;
    } else if (pfName.includes("farm") || pfName.includes("barn")) {
      prefabInfo = { text: "🚜", ctx: { fillStyle: "orange", strokeStyle: "#704D17" } };
      return prefabInfo;
    } else if (pfName.includes("survivor")) {
      prefabInfo = { text: "👤", ctx: { fillStyle: "purple", strokeStyle: "#17072C" } };
      return prefabInfo;
    } else if (pfName.includes("skyscraper") && !pfName.includes("filler")) {
      prefabInfo = { text: "🏢", ctx: { fillStyle: "#8FA5CF", strokeStyle: "#1C2F51" } };
      return prefabInfo;
    } else if (pfName.includes("hospital") || pfName.includes("clinic") || pfName.includes("pharmacy")) {
      prefabInfo = { text: "💊", ctx: { fillStyle: "#2671FF", strokeStyle: "white" } };
      return prefabInfo;
    } else if (pfName.includes("book")) {
      prefabInfo = { text: "📖", ctx: { fillStyle: "#44F3FF", strokeStyle: "#147178" } };
      return prefabInfo;
    } else {
      return prefabInfo;
    }
  }
  drawPrefabs(ctx, width, height) {
    const offsetX = width / 2;
    const offsetY = height / 2;
    const charOffsetX = Math.round(this.signSize * 0.01);
    const charOffsetY = Math.round(this.signSize * 0.05);
    const toolOffsetX = Math.round(this.signSize * 0.05);
    const toolOffsetY = Math.round(this.signSize * 0.05);
    // Inverted iteration to overwrite signs by higher order prefabs
    for (let i = this.prefabs.length - 1; i >= 0; i -= 1) {
      const prefab = this.prefabs[i];
      const x = offsetX + prefab.x + charOffsetX;
      const xT = offsetX + prefab.x + toolOffsetX;
      // prefab vertical positions are inverted for canvas coodinates
      const z = offsetY - prefab.z + charOffsetY;
      const zT = offsetY - prefab.z + toolOffsetY - 80;
      const prefabInfo = this.customizeSignByPrefabCategory(prefab);
      ctx.font = `${this.signSize}px ${this.fontFace?.family ?? ""}`;
      ctx.fillStyle = prefabInfo.ctx.fillStyle;
      ctx.strokeStyle = prefabInfo.ctx.strokeStyle;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      putText(ctx, { text: prefabInfo.text, x, z, size: this.signSize });
      if (this.showToolTips) {
        ctx.font = `${this.signSize}px ${this.toolTipFontFace?.family ?? ""}`;
        putToolTipText(ctx, { text: prefab.name, xT, zT, sizeT: this.toolTipSize });
      }
    }
  }
  drawMark(ctx, width, height) {
    if (!this.markerCoords) return;
    ctx.font = `${this.markerSize}px ${this.fontFace?.family ?? ""}`;
    ctx.fillStyle = "red";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = -2;
    ctx.shadowBlur = 5;
    ctx.strokeStyle = "#830000";
    ctx.shadowColor = "rgba(75,75,75,0.75)";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const offsetX = width / 2;
    const offsetY = height / 2;
    const charOffsetX = -1 * Math.round(this.markerSize * 0.32);
    const charOffsetY = -1 * Math.round(this.markerSize * 0.1);
    const x = offsetX + this.markerCoords.x + charOffsetX;
    const z = offsetY - this.markerCoords.z + charOffsetY;
    putText(ctx, { text: MARK_CHAR, x, z, size: this.markerSize });
    ctx.fillText(MARK_CHAR, x, z);
  }
}
exports.default = MapRenderer;
function putText(ctx, { text, x, z, size }) {
  ctx.lineWidth = Math.round(size * 0.2);
  ctx.strokeText(text, x, z);
  ctx.lineWidth = Math.round(size * 0.1);
  ctx.strokeText(text, x, z);
  ctx.fillText(text, x, z);
}
function putToolTipText(ctx, { text, xT, zT, sizeT }) {
  ctx.lineWidth = Math.round(sizeT * 0.2);
  ctx.lineWidth = Math.round(sizeT * 0.05);
  ctx.strokeText(text, xT, zT);
  ctx.fillText(text, xT, zT);
}
//# sourceMappingURL=map-renderer.js.map
