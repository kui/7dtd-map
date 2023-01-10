"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threePlaneSize =
  exports.canvasEventToGameCoords =
  exports.gameCoords =
  exports.gameMapSize =
  exports.sleep =
  exports.imageBitmapToPngBlob =
  exports.downloadCanvasPng =
  exports.sendCoords =
  exports.waitAnimationFrame =
  exports.humanreadableDistance =
  exports.removeAllChildren =
  exports.component =
  exports.requireType =
  exports.requireNonnull =
    void 0;
function requireNonnull(t, message = () => `Unexpected state: ${t}`) {
  if (t != null) return t;
  else throw Error(message());
}
exports.requireNonnull = requireNonnull;
function requireType(o, t, message = () => `Unexpected type: ${o}`) {
  if (o instanceof t) return o;
  throw Error(message());
}
exports.requireType = requireType;
function component(id, t) {
  const e = requireNonnull(
    document.getElementById(requireNonnull(id, () => `Element ID must not null: ${id}`)),
    () => `Element not found: #${id}`
  );
  return t ? requireType(e, t) : e;
}
exports.component = component;
function removeAllChildren(e) {
  while (e.lastChild) e.removeChild(e.lastChild);
}
exports.removeAllChildren = removeAllChildren;
function humanreadableDistance(d) {
  if (d < 1000) {
    return `${d}m`;
  }
  return `${(d / 1000).toFixed(2)}km`;
}
exports.humanreadableDistance = humanreadableDistance;
function waitAnimationFrame() {
  return new Promise((r) => requestAnimationFrame(r));
}
exports.waitAnimationFrame = waitAnimationFrame;
function sendCoords(map, canvas, elevation, event) {
  if (!event) return { x: "-", z: "-", y: "-" };
  const gameCoords = canvasEventToGameCoords(event, map, canvas);
  if (gameCoords === null) {
    return { x: "-", z: "-", y: "-" };
  }
  const y = elevation(gameCoords, map) ?? "-";
  return { x: gameCoords.x, z: gameCoords.z, y };
}
exports.sendCoords = sendCoords;
function downloadCanvasPng(fileName, canvas) {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = canvas.toDataURL("image/png");
  a.click();
}
exports.downloadCanvasPng = downloadCanvasPng;
async function imageBitmapToPngBlob(img) {
  const canvas = new OffscreenCanvas(img.height, img.width);
  const context = requireNonnull(canvas.getContext("2d"));
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  context.drawImage(img, 0, 0);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return await canvas.convertToBlob({ type: "image/png" });
}
exports.imageBitmapToPngBlob = imageBitmapToPngBlob;
async function sleep(msec) {
  return new Promise((r) => setTimeout(r, msec));
}
exports.sleep = sleep;
function gameMapSize(s) {
  return { type: "game", ...s };
}
exports.gameMapSize = gameMapSize;
function gameCoords(c) {
  return { type: "game", ...c };
}
exports.gameCoords = gameCoords;
/** Returns null if the event was fired out of the canvas */
function canvasEventToGameCoords(event, mapSize, canvasSize) {
  // in-game scale coords with left-top offset
  const gx = (event.offsetX * mapSize.width) / canvasSize.width;
  const gz = (event.offsetY * mapSize.height) / canvasSize.height;
  if (gx < 0 || gx >= mapSize.width || gz < 0 || gz >= mapSize.height) {
    return null;
  }
  // in-game coords (center offset)
  const x = gx - Math.floor(mapSize.width / 2);
  const z = Math.floor(mapSize.height / 2) - gz;
  return gameCoords({ x: Math.round(x), z: Math.round(z) });
}
exports.canvasEventToGameCoords = canvasEventToGameCoords;
function threePlaneSize(width, height) {
  return { type: "threePlane", width, height };
}
exports.threePlaneSize = threePlaneSize;
//# sourceMappingURL=utils.js.map
