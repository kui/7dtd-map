// Builds a multi-resolution .ico file from PNG-encoded images, using the
// ICONDIR/ICONDIRENTRY layout from the ICO format spec. Modern ICO readers
// (Windows Vista+, browsers) accept PNG-compressed entries directly, so no
// BMP conversion is needed.
const ICONDIR_BYTES = 6;
const ICONDIRENTRY_BYTES = 16;

export interface IcoImage {
  size: number;
  png: Uint8Array;
}

export function buildIco(images: readonly IcoImage[]): Uint8Array {
  if (images.length === 0) {
    throw new Error("buildIco: at least one image is required");
  }
  for (const { size } of images) {
    if (size < 1 || size > 256 || !Number.isInteger(size)) {
      throw new Error(
        `buildIco: size must be an integer in 1..256, got ${size}`,
      );
    }
  }

  const dirSize = ICONDIR_BYTES + ICONDIRENTRY_BYTES * images.length;
  const totalSize = dirSize +
    images.reduce((sum, { png }) => sum + png.length, 0);
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: 1 = icon
  view.setUint16(4, images.length, true);

  let dataOffset = dirSize;
  images.forEach(({ size, png }, i) => {
    const entryOffset = ICONDIR_BYTES + ICONDIRENTRY_BYTES * i;
    out[entryOffset] = size === 256 ? 0 : size; // width, 0 means 256
    out[entryOffset + 1] = size === 256 ? 0 : size; // height, 0 means 256
    out[entryOffset + 2] = 0; // color count: 0 = no palette
    out[entryOffset + 3] = 0; // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, png.length, true);
    view.setUint32(entryOffset + 12, dataOffset, true);

    out.set(png, dataOffset);
    dataOffset += png.length;
  });

  return out;
}
