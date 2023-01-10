"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("pngjs/browser");
onmessage = async (event) => {
  const png = await parse(event.data);
  const m = {
    width: png.width,
    height: png.height,
    data: png.data.buffer,
  };
  postMessage(m, [m.data]);
};
function parse(data) {
  return new Promise((resolve, reject) => {
    new browser_1.PNG().parse(data, (e, p) => {
      if (e) reject(e);
      else resolve(p);
    });
  });
}
//# sourceMappingURL=pngjs.js.map
