"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleWorldLoader = void 0;
const utils_1 = require("../lib/utils");
const SAMPLE_WORLD_FILES = [
  "biomes.png",
  "splat3_processed.png",
  "splat4_processed.png",
  "radiation.png",
  "prefabs.xml",
  "dtm.png",
  "GenerationInfo.txt",
];
class SampleWorldLoader {
  constructor() {
    this.listeners = [];
    for (const button of Array.from(document.querySelectorAll("button[data-sample-dir]"))) {
      console.log("Sample world button: ", button);
      if (button instanceof HTMLButtonElement) button.addEventListener("click", async () => this.loadSampleWorld(button));
    }
  }
  addListenr(fn) {
    this.listeners.push(fn);
  }
  async loadSampleWorld(button) {
    button.disabled = true;
    const dir = (0, utils_1.requireNonnull)(button.dataset.sampleDir);
    await Promise.all(
      SAMPLE_WORLD_FILES.flatMap(async (name) => {
        const file = await fetchAsFile(`${dir}/${name}`);
        return this.listeners.map((fn) => fn(file));
      })
    );
    button.disabled = false;
  }
}
exports.SampleWorldLoader = SampleWorldLoader;
async function fetchAsFile(uri) {
  console.time(`fetchAsFile: ${uri}`);
  const res = await fetch(uri);
  const blob = await res.blob();
  const file = new File([blob], basename(uri), { type: blob.type });
  console.timeEnd(`fetchAsFile: ${uri}`);
  return file;
}
function basename(path) {
  return path.substring(path.lastIndexOf("/") + 1);
}
//# sourceMappingURL=sample-world-loader.js.map
