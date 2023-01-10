"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorCoodsHandler = void 0;
const utils_1 = require("../lib/utils");
class CursorCoodsHandler {
  constructor(doms, elevationFunction) {
    this.mapSize = (0, utils_1.gameMapSize)({ width: 0, height: 0 });
    this.elevationFunction = elevationFunction;
    this.doms = doms;
    doms.canvas.addEventListener("mousemove", (e) => updateCursor(this, e), { passive: true });
    doms.canvas.addEventListener("mouseout", () => updateCursor(this));
  }
}
exports.CursorCoodsHandler = CursorCoodsHandler;
function updateCursor(self, event = null) {
  self.doms.xOutput.textContent = (0, utils_1.sendCoords)(self.mapSize, self.doms.canvas, self.elevationFunction, event).x.toString();
  self.doms.zOutput.textContent = (0, utils_1.sendCoords)(self.mapSize, self.doms.canvas, self.elevationFunction, event).z.toString();
  self.doms.yOutput.textContent = (0, utils_1.sendCoords)(self.mapSize, self.doms.canvas, self.elevationFunction, event).y.toString();
}
//# sourceMappingURL=cursor-coods-handler.js.map
