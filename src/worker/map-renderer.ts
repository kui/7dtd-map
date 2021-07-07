import GameMap from "../lib/map";

export type InMessage = Partial<
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

export interface OutMessage {
  mapSize: RectSize;
}

declare function postMessage(message: OutMessage): void;

const FONT_FACE = new FontFace("Noto Sans", "url(../NotoEmoji-Regular.ttf)");

let map: GameMap | null = null;

FONT_FACE.load().then(() => map?.update());

onmessage = async (event: MessageEvent<InMessage>) => {
  const message = event.data;
  console.debug(message);
  if (!map) {
    if (message.canvas) {
      map = new GameMap(message.canvas, FONT_FACE);
    } else {
      throw Error("Unexpected state");
    }
  }

  await Object.assign(map, message).update();

  postMessage({
    mapSize: {
      width: map.width,
      height: map.height,
    },
  });
};
