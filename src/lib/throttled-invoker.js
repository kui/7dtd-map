"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttledInvoker = void 0;
const utils_1 = require("./utils");
function throttledInvoker(asyncFunc) {
  const workerPromises = [];
  return () => {
    switch (workerPromises.length) {
      case 0: {
        workerPromises.push(
          (async () => {
            await asyncFunc();
            workerPromises.shift();
          })()
        );
        return workerPromises[0];
      }
      case 1: {
        const prev = workerPromises[0];
        workerPromises.push(
          (async () => {
            await prev;
            await (0, utils_1.waitAnimationFrame)();
            await asyncFunc();
            workerPromises.shift();
          })()
        );
        return workerPromises[1];
      }
      case 2:
        return workerPromises[1];
      default:
        throw Error(`Unexpected state: promiceses=${workerPromises.length}`);
    }
  };
}
exports.throttledInvoker = throttledInvoker;
//# sourceMappingURL=throttled-invoker.js.map
