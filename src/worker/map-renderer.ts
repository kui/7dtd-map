import { FontFaceSet } from "css-font-loading-module";
import MapRenderer from "../lib/map-renderer";

declare const fonts: FontFaceSet;

export type InMessage = Partial<
  Pick<
    MapRenderer,
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
  mapSize: GameMapSize;
}

declare function postMessage(message: OutMessage): void;

const FONT_FACE = new FontFace("Heebo", "url(../NotoEmoji-Regular.ttf)");

let map: MapRenderer | null = null;

FONT_FACE.load().then(() => {
  fonts.add(FONT_FACE);
  map?.update();
});

onmessage = async (event: MessageEvent<InMessage>) => {
  const message = event.data;
  console.debug(message);
  if (!map) {
    if (message.canvas) {
      map = new MapRenderer(message.canvas, FONT_FACE);
    } else {
      throw Error("Unexpected state");
    }
  }
  await Object.assign(map, message).update();
  postMessage({ mapSize: await map.size() });
};
