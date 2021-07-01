import GameMap from "./lib/map";

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

let map: GameMap;

onmessage = (event: { data: MapRendererInMessage }) => {
  const inMessage = event.data;
  if (!map && inMessage.canvas) {
    map = new GameMap(inMessage.canvas);
  }

  Object.assign(map, inMessage).update();

  postMessage({
    mapSizes: {
      width: map.width,
      height: map.height,
    },
  });
};
