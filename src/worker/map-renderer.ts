import MapRenderer from "./lib/map-renderer.ts";
import { fetchJson, printError } from "../lib/utils.ts";
import type { MapRendererInputMessage } from "./types.ts";
import type {
  DistrictColors,
  PrefabDensityScores,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";

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
// Resolves once every font has either loaded or failed. Awaited at the top of
// the message handler so the first paint uses the intended fonts, avoiding a
// fallback render followed by a redundant re-render + postMessage once the
// fonts finish loading.
const fontsReady: Promise<unknown> = Promise.all(
  Object.values(fontFaces).map(async (fontFace) => {
    await fontFace.load();
    fonts.add(fontFace);
    console.log("map-renderer: loaded font", fontFace);
  }),
).catch(printError);

const mapFonts = {
  "✘": "Noto Sans Symbols 2",
  "🚩": "Noto Emoji Old",
};

// Apply incoming field updates immediately and fire-and-forget the render.
// throttledInvoker inside MapRenderer.update coalesces concurrent calls, so
// awaiting it here would just queue onmessage handlers behind the throttle and
// release them in bursts on every tick. Returning synchronously keeps the
// worker's message queue drained and the main thread free of reply bursts.
onmessage = async (
  event: MessageEvent<MapRendererInputMessage>,
) => {
  const message = event.data;
  await fontsReady;
  if (!map) {
    if (message.canvas) {
      map = new MapRenderer(
        message.canvas,
        mapFonts,
        () => fetchJson<PrefabMeshSizes>("../prefab-mesh-sizes.json"),
        () => fetchJson<PrefabDensityScores>("../prefab-density-scores.json"),
        () => fetchJson<DistrictColors>("../district-colors.json"),
      );
    } else {
      throw Error("Unexpected state");
    }
  } else if (message.canvas) {
    // The OffscreenCanvas is captured at construction time and must not be
    // replaced by later messages; drop any stray `canvas` field defensively.
    delete message.canvas;
  }
  Object.assign(map, message);
  map.update().catch(printError);
};
