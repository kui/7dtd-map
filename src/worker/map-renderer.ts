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

// Apply incoming field updates immediately and fire-and-forget the render.
// throttledInvoker inside MapRenderer.update coalesces concurrent calls, so
// awaiting it here would just queue onmessage handlers behind the throttle and
// release them in bursts on every tick. Returning synchronously keeps the
// worker's message queue drained and the main thread free of reply bursts.
onmessage = async (
  event: MessageEvent<MapRendererInputMessage>,
) => {
  const message = event.data;
  const [signMarker, markMarker] = await Promise.all([
    signMarkerReady,
    markMarkerReady,
  ]);
  if (!map) {
    if (message.canvas) {
      map = new MapRenderer(
        message.canvas,
        signMarker,
        markMarker,
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
