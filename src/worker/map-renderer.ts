import MapRenderer from "../lib/map-renderer.ts";
import { printError } from "../lib/utils.ts";

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

let map: MapRenderer | null = null;

const fontFaces = {
  "Noto Sans Symbols 2": new FontFace(
    "Noto Sans Symbols 2",
    "url('../NotoSansSymbols2.subset.woff2') format('woff2')",
  ),
  "Noto Emoji Old": new FontFace(
    "Noto Emoji Old",
    "url('../NotoEmojiOld.subset.woff2') format('woff2')",
  ),
  // See tools/fonts/subset.sh
  // "Noto Emoji": new FontFace("Noto Emoji", "url('../NotoEmoji.subset.woff2') format('woff2')"),
} as const;
Promise.all(
  Object.values(fontFaces).map(async (fontFace) => {
    await fontFace.load();
    // WorkerGlobalScope.fonts is part of the spec but missing from Deno's type definitions
    // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API
    // https://github.com/denoland/deno/blob/main/cli/tsc/dts/lib.deno.worker.d.ts
    (self as unknown as { fonts: FontFaceSet }).fonts.add(fontFace);
    if (map) {
      await map.update();
      postMessage({ mapSize: map.size() });
    }
    console.log("map-renderer: loaded font", fontFace);
  }),
).catch(printError);

const mapFonts = {
  "✘": fontFaces["Noto Sans Symbols 2"].family,
  "🚩": fontFaces["Noto Emoji Old"].family,
};

onmessage = async (event: MessageEvent<InMessage>) => {
  const message = event.data;
  console.log("map-renderer: recieved %o", message);
  if (!map) {
    if (message.canvas) {
      map = new MapRenderer(message.canvas, mapFonts);
    } else {
      throw Error("Unexpected state");
    }
  }
  await Object.assign(map, message).update();
  const out = { mapSize: map.size() };
  console.log("map-renderer: sending %o", out);
  postMessage(out);
};
