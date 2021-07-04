import GameMap from "./lib/map";

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

let map: GameMap | null = null;
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

  postMessage({
    mapSize: {
      width: map.width,
      height: map.height,
    },
  });
};
