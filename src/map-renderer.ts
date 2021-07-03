import GameMap from "./lib/map";
import { MapStorage } from "./lib/map-storage";
import { assignAll, requireNonnull } from "./lib/utils";

export interface MapRendererInMessage {
  canvas?: OffscreenCanvas;

  biomesImg?: ImageBitmap;
  splat3Img?: ImageBitmap;
  splat4Img?: ImageBitmap;
  radImg?: ImageBitmap;

  showBiomes?: boolean;
  showSplat3?: boolean;
  showSplat4?: boolean;
  showRad?: boolean;
  showPrefabs?: boolean;

  brightness?: string;
  scale?: number;
  signSize?: number;
  prefabs?: Prefab[];
  signChar?: string;
  markChar?: string;
  markCoords?: Coords | null;
}

export interface MapRendererOutMessage {
  mapSizes: { width: number; height: number };
}

declare function postMessage(message: MapRendererOutMessage): void;

const FIELDNAME_STORAGENAME_MAP = {
  biomesImg: "biomes",
  splat3Img: "splat3",
  splat4Img: "splat4",
  radImg: "rad",
} as const;

let map: GameMap | null = null;
const storage = new MapStorage();

storage.listeners.push(async () => {
  init();
});

onmessage = async (event) => {
  const inMessage = event.data as MapRendererInMessage;
  if (!map) {
    if (inMessage.canvas) {
      map = new GameMap(inMessage.canvas);
      await init();
    } else {
      return;
    }
  }

  await assignAll(map, inMessage).update();
  for (const entry of Object.entries(inMessage)) {
    if (isStoreTarget(entry)) {
      storage.put(FIELDNAME_STORAGENAME_MAP[entry[0]], {
        width: map.width,
        height: map.height,
        bitmap: entry[1],
      });
    }
  }
  postMessage({
    mapSizes: {
      width: map.width,
      height: map.height,
    },
  });
};

function isStoreTarget(e: Entry<MapRendererInMessage>): e is [keyof typeof FIELDNAME_STORAGENAME_MAP, ImageBitmap] {
  return e[0] in FIELDNAME_STORAGENAME_MAP;
}

async function init() {
  console.log("init: Start");
  for (const [fieldName, type] of Object.entries(FIELDNAME_STORAGENAME_MAP)) {
    console.time(`init: Load ${fieldName}`);
    const obj = await storage.getCurrent(type);
    requireNonnull(map)[fieldName] = obj?.data.bitmap ?? null;
    console.timeEnd(`init: Load ${fieldName}`);
  }
  await requireNonnull(map).update();
  console.log("init: Done");
}
