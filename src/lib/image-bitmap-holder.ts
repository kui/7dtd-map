import { imageBitmapToPngBlob, requireNonnull } from "./utils";

const IMG_AGE_MSEC = 10000;

export class ImageBitmapHolder {
  private label;
  _png: PngBlob | Promise<PngBlob>;
  private img?: ImageBitmap | null;
  private fallbackPromise: Promise<ImageBitmap> | null = null;
  private lastAccessAt = 0;
  private imgAge;

  constructor(label: string, original: PngBlob | ImageBitmap, imgAge = IMG_AGE_MSEC) {
    this.label = label;
    if (isPngBlob(original)) {
      this._png = original;
    } else {
      this._png = imageBitmapToPngBlob(original);
      this.setImg(original);
    }
    this.imgAge = imgAge;
  }

  async get(): Promise<ImageBitmap> {
    this.lastAccessAt = Date.now();
    return this.img ?? this.fallbackPromise ?? this.getFallback();
  }

  private async getFallback() {
    this.fallbackPromise = this.getImageBitmap();
    return this.fallbackPromise;
  }

  private async getImageBitmap() {
    console.debug("Fallback", this.label);
    const img = await createImageBitmap(await this._png);
    this.setImg(img);
    this.fallbackPromise = null;
    return img;
  }

  private setImg(img: ImageBitmap) {
    this.img = img;
    setTimeout(() => this.expireImage(), this.imgAge);
  }

  private expireImage() {
    if (Date.now() - this.lastAccessAt > this.imgAge) {
      console.debug("Expire", this.label);
      requireNonnull(this.img).close();
      this.img = null;
    } else {
      setTimeout(() => this.expireImage(), this.imgAge);
    }
  }
}

function isPngBlob(o: unknown): o is PngBlob {
  return o instanceof Blob && o.type.toLowerCase() === "image/png";
}
