import MapRenderer from "../lib/map-renderer";
import { printError } from "../lib/utils";

export type InMessage = Partial<
  Pick<
    MapRenderer,
    | "canvas"
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
    | "invalidate"
  >
>;

export interface OutMessage {
  mapSize: GameMapSize;
}

declare function postMessage(message: OutMessage): void;

const FONT_FACE = new FontFace("Noto Sans", "url(../NotoEmoji-Regular.ttf)");

let map: MapRenderer | null = null;

FONT_FACE.load()
  .then(() => {
    fonts.add(FONT_FACE);
    return map?.update();
  })
  .catch(printError);

onmessage = async (event: MessageEvent<InMessage>) => {
  const message = event.data;
  console.log("map-renderer: recieved %o", message);
  if (!map) {
    if (message.canvas) {
      map = new MapRenderer(message.canvas, FONT_FACE);
    } else {
      throw Error("Unexpected state");
    }
  }
  await Object.assign(map, message).update();
  const out = { mapSize: map.size() };
  console.log("map-renderer: sending %o", out);
  postMessage(out);
};
