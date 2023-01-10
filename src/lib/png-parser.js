"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PngParser = void 0;
class PngParser {
  constructor(workerFactory) {
    this.workerFactory = workerFactory;
  }
  async parse(blob) {
    const worker = this.workerFactory();
    const data = await blob.arrayBuffer();
    worker.postMessage(data, [data]);
    const event = await new Promise((resolve, reject) => {
      worker.onmessage = resolve;
      worker.onerror = reject;
      worker.onmessageerror = reject;
    });
    worker.terminate();
    return event.data;
  }
}
exports.PngParser = PngParser;
//# sourceMappingURL=png-parser.js.map
