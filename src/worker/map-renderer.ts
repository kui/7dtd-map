import MapRenderer from "./lib/map-renderer.ts";
import { fetchJson, printError } from "../lib/utils.ts";
import type { MapRendererInputMessage } from "./types.ts";
import type {
  DistrictColors,
  GlyphMarker,
  PrefabDensityScores,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";

let map: MapRenderer | null = null;

// The prefab sign and flag markers stamp SVG path data baked at build time
// (see tools/generate-glyph-markers.ts) instead of rendering glyphs from a
// webfont, so it's fetched once here rather than per MapRenderer instance.
const signMarkerReady: Promise<GlyphMarker> = fetchJson<GlyphMarker>(
  "../heavy-ballot-x-path.json",
);
const markMarkerReady: Promise<GlyphMarker> = fetchJson<GlyphMarker>(
  "../triangular-flag-path.json",
);

async function handleMessage(message: MapRendererInputMessage): Promise<void> {
  if (!map) {
    if (message.canvas) {
      map = new MapRenderer(
        message.canvas,
        await signMarkerReady,
        await markMarkerReady,
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
  // Not awaited: awaiting would serialize the queue below behind each
  // throttled render instead of letting throttledInvoker coalesce them.
  map.update().catch(printError);
}

// Serialize handling so messages arriving while the MapRenderer construction
// awaits the glyph fetches are queued instead of dropped.
let queue: Promise<void> = Promise.resolve();
onmessage = (event: MessageEvent<MapRendererInputMessage>) => {
  queue = queue.then(() => handleMessage(event.data)).catch(printError);
};
