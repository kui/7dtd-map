"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const map_renderer_1 = __importDefault(require("../lib/map-renderer"));
const FONT_FACE = new FontFace("Noto Emoji", "url(../NotoEmoji-Regular.ttf)");
const TOOLTIP_FONT_FACE = new FontFace("Heebo Medium", "url(../Heebo-Medium.ttf)");
let map = null;
FONT_FACE.load()
  .then(() => {
    fonts.add(FONT_FACE);
  })
  .then(() => {
    TOOLTIP_FONT_FACE.load();
  })
  .then(() => {
    fonts.add(TOOLTIP_FONT_FACE);
    map?.update();
  });
onmessage = async (event) => {
  const message = event.data;
  console.debug(message);
  if (!map) {
    if (message.canvas) {
      map = new map_renderer_1.default(message.canvas, FONT_FACE, TOOLTIP_FONT_FACE);
    } else {
      throw Error("Unexpected state");
    }
  }
  await Object.assign(map, message).update();
  postMessage({ mapSize: await map.size() });
};
//# sourceMappingURL=map-renderer.js.map
