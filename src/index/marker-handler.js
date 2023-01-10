"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkerHandler = void 0;
const utils_1 = require("../lib/utils");
class MarkerHandler {
  constructor(doms, elevationFunction) {
    this.mapSize = (0, utils_1.gameMapSize)({ width: 0, height: 0 });
    this.listeners = [];
    this.elevationFunction = elevationFunction;
    this.doms = doms;
    doms.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      updateMarker(this, e);
      this.listeners.forEach((fn) => fn((0, utils_1.canvasEventToGameCoords)(e, this.mapSize, doms.canvas)));
    });
    doms.resetMarker.addEventListener("click", () => {
      updateMarker(this);
      this.listeners.forEach((fn) => fn(null));
    });
  }
}
exports.MarkerHandler = MarkerHandler;
function updateMarker(self, event = null) {
  self.doms.xOutput.textContent = (0, utils_1.sendCoords)(self.mapSize, self.doms.canvas, self.elevationFunction, event).x.toString();
  self.doms.zOutput.textContent = (0, utils_1.sendCoords)(self.mapSize, self.doms.canvas, self.elevationFunction, event).z.toString();
  self.doms.yOutput.textContent = (0, utils_1.sendCoords)(self.mapSize, self.doms.canvas, self.elevationFunction, event).y.toString();
}
//# sourceMappingURL=marker-handler.js.map
