"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageBitmapHolder = void 0;
const utils_1 = require("./utils");
const IMG_AGE_MSEC = 10000;
class ImageBitmapHolder {
  constructor(label, original, imgAge = IMG_AGE_MSEC) {
    this.fallbackPromise = null;
    this.lastAccessAt = 0;
    this.label = label;
    if (isPngBlob(original)) {
      this._png = original;
    } else {
      this._png = (0, utils_1.imageBitmapToPngBlob)(original);
      this.setImg(original);
    }
    this.imgAge = imgAge;
  }
  async get() {
    this.lastAccessAt = Date.now();
    return this.img ?? this.fallbackPromise ?? this.getFallback();
  }
  async getFallback() {
    this.fallbackPromise = this.getImageBitmap();
    return this.fallbackPromise;
  }
  async getImageBitmap() {
    console.debug("Fallback", this.label);
    const img = await createImageBitmap(await this._png);
    this.setImg(img);
    this.fallbackPromise = null;
    return img;
  }
  setImg(img) {
    this.img = img;
    setTimeout(() => this.expireImage(), this.imgAge);
  }
  expireImage() {
    if (Date.now() - this.lastAccessAt > this.imgAge) {
      console.debug("Expire", this.label);
      (0, utils_1.requireNonnull)(this.img).close();
      this.img = null;
    } else {
      setTimeout(() => this.expireImage(), this.imgAge);
    }
  }
}
exports.ImageBitmapHolder = ImageBitmapHolder;
function isPngBlob(o) {
  return o instanceof Blob;
}
//# sourceMappingURL=image-bitmap-holder.js.map
