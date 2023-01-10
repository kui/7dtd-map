"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = void 0;
const throttled_invoker_1 = require("../lib/throttled-invoker");
const utils_1 = require("../lib/utils");
class FileHandler {
  constructor(doms, loadingHandler) {
    this.listeners = new Map();
    this.doms = doms;
    this.loadingHandler = loadingHandler;
    const throttledProcess = (0, throttled_invoker_1.throttledInvoker)(() => this.processFiles());
    doms.input.addEventListener("input", throttledProcess);
  }
  addListeners(arr) {
    arr.forEach(([n, ln]) => this.addListener(n, ln));
  }
  addListener(fileName, listener) {
    const old = this.listeners.get(fileName) ?? [];
    this.listeners.set(fileName, old.concat(listener));
  }
  pushFiles(files) {
    const filtered = files.filter((file) => this.getListeners(file.name).length !== 0);
    this.updateFiles([...Array.from(this.doms.input.files ?? []), ...filtered]);
    this.doms.input.dispatchEvent(new Event("input"));
  }
  async processFiles() {
    this.loadingHandler.add(Array.from(this.doms.input.files ?? []).map((f) => f.name));
    let file = this.popFile();
    while (file instanceof File) {
      const listeners = this.getListeners(file.name);
      if (listeners.length === 0) {
        console.log("No hundler: ", file);
      } else if (this.shouldSkip(file)) {
        console.log("Skip: ", file);
      } else {
        console.time(`Processed: ${file.name}`);
        await Promise.all(listeners.map(async (fn) => fn(file)));
        console.timeEnd(`Processed: ${file.name}`);
      }
      this.loadingHandler.delete(file.name);
      await (0, utils_1.waitAnimationFrame)();
      file = this.popFile();
    }
  }
  getListeners(fileName) {
    return Array.from(this.listeners.entries()).flatMap(([pattern, listeners]) => {
      if (pattern instanceof RegExp && pattern.test(fileName)) return listeners;
      if (typeof pattern === "string" && pattern === fileName) return listeners;
      return [];
    });
  }
  popFile() {
    if (!this.doms.input.files?.length) return null;
    const files = Array.from(this.doms.input.files);
    this.updateFiles(files.slice(1));
    return files[0];
  }
  shouldSkip(file) {
    if (file.name === "splat3.png") {
      return Array.from(this.doms.input.files ?? [])
        .map((f) => f.name)
        .includes("splat3_processed.png");
    }
    return false;
  }
  updateFiles(files) {
    this.doms.input.files = dataTransfer(files).files;
  }
}
exports.FileHandler = FileHandler;
function dataTransfer(files) {
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  return dt;
}
//# sourceMappingURL=file-handler.js.map
