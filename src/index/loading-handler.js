"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingHandler = void 0;
const utils_1 = require("../lib/utils");
const ANIMATION_FRAMES = ["｜", "／", "―", "＼"];
const ANIMATION_INTERVAL_MSEC = 300;
// Loading progression maanger
class LoadingHandler {
  constructor(doms) {
    this._loadingList = [];
    this.doms = doms;
  }
  add(list) {
    this._loadingList = this._loadingList.concat(list);
    this.startAnimation();
  }
  delete(loading) {
    this._loadingList = this._loadingList.filter((s) => s !== loading);
  }
  disableAll(isDisable) {
    Object.values(this.doms.disablings).forEach((e) => (e.disabled = isDisable));
  }
  async startAnimation() {
    this.disableAll(true);
    while (this._loadingList.length !== 0) {
      this.doms.indicator.textContent = `${this.bar()} Loading: ${this._loadingList.join(", ")}`;
      await (0, utils_1.waitAnimationFrame)();
    }
    this.doms.indicator.textContent = "";
    this.disableAll(false);
  }
  bar() {
    return ANIMATION_FRAMES[Math.floor(Date.now() / ANIMATION_INTERVAL_MSEC) % ANIMATION_FRAMES.length];
  }
}
exports.LoadingHandler = LoadingHandler;
//# sourceMappingURL=loading-handler.js.map
