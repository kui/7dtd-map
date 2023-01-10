"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationInfoHandler = void 0;
const map_storage_1 = require("../lib/map-storage");
class GenerationInfoHandler {
  constructor(doms, storage) {
    this.doms = doms;
    this.storage = storage;
    map_storage_1.MapStorage.addListener(async () => {
      const i = await storage.getCurrent("generationInfo");
      doms.output.value = i?.data ?? "";
    });
  }
  async handle(generationInfoOrBlob) {
    let generationInfo;
    if (typeof generationInfoOrBlob === "string") {
      generationInfo = generationInfoOrBlob;
    } else {
      generationInfo = await generationInfoOrBlob.text();
    }
    const worldName = extractWorldName(generationInfo);
    if (worldName) {
      this.doms.mapName.value = worldName;
      this.doms.mapName.dispatchEvent(new Event("input"));
    }
    this.doms.output.value = generationInfo;
    this.doms.mapName.dispatchEvent(new Event("input"));
    this.storage.put("generationInfo", generationInfo);
  }
}
exports.GenerationInfoHandler = GenerationInfoHandler;
function extractWorldName(generationInfo) {
  return /^World Name:(.*)$/m.exec(generationInfo)?.[1].trim();
}
//# sourceMappingURL=generation-info-handler.js.map
