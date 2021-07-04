import GameMap from "./lib/map";
import { MapStorage } from "./lib/map-storage";

export type MapRendererInMessage = Partial<
  Pick<
    GameMap,
    | "canvas"
    | "biomesImg"
    | "splat3Img"
    | "splat4Img"
    | "radImg"
    | "biomesAlpha"
    | "splat3Alpha"
    | "splat4Alpha"
    | "radAlpha"
    | "showPrefabs"
    | "brightness"
    | "scale"
    | "signSize"
    | "signAlpha"
    | "prefabs"
    | "markerCoords"
  >
>;

export interface MapRendererOutMessage {
  mapSize: RectSize;
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

onmessage = async (event) => {
  const inMessage = event.data as MapRendererInMessage;
  if (!map) {
    if (inMessage.canvas) {
      map = new GameMap(inMessage.canvas);
    } else {
      throw Error("Unexpected state");
    }
  }

  await Object.assign(map, inMessage).update();
  for (const entry of Object.entries(inMessage)) {
    if (isStoreTarget(entry)) {
      storage.put(FIELDNAME_STORAGENAME_MAP[entry[0]], entry[1]);
    }
  }
  postMessage({
    mapSize: {
      width: map.width,
      height: map.height,
    },
  });
};

function isStoreTarget(e: Entry<MapRendererInMessage>): e is [keyof typeof FIELDNAME_STORAGENAME_MAP, ImageBitmap] {
  return e[0] in FIELDNAME_STORAGENAME_MAP;
}
