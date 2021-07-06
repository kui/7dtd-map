import GameMap from "../lib/map";

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

const FONT_FACE = new FontFace("Noto Sans", "url(../NotoEmoji-Regular.ttf)").load();

let map: GameMap | null = null;
async function handleMessage(message: MapRendererInMessage) {
  console.debug(message);
  if (!map) {
    if (message.canvas) {
      map = new GameMap(message.canvas, await FONT_FACE);
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
}

async function* messageQeue(): AsyncGenerator<void, void, MapRendererInMessage> {
  while (true) {
    try {
      await handleMessage(yield);
    } catch (e) {
      console.error(e);
    }
  }
}

const queue = messageQeue();
queue.next();
onmessage = async (event) => await queue.next(event.data);
