import { MapStorage } from "../lib/map-storage";

interface Doms {
  mapName: HTMLInputElement;
  output: HTMLTextAreaElement;
}

type BlobLike = { text: () => Promise<string> };

export class GenerationInfoHandler {
  doms: Doms;
  storage: MapStorage;

  constructor(storage: MapStorage, doms: Doms) {
    this.doms = doms;
    this.storage = storage;

    MapStorage.addListener(async () => {
      const i = await storage.getCurrent("generationInfo");
      doms.output.value = i?.data ?? "";
    });
  }

  async handle(generationInfoOrBlob: string | BlobLike): Promise<void> {
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

function extractWorldName(generationInfo: string) {
  return /^World Name:(.*)$/m.exec(generationInfo)?.[1].trim();
}
