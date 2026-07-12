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

// WHY: fetch the baked glyph path once at module load. Every MapRenderer instance stamps the same SVG path data from tools/generate-glyph-markers.ts and would otherwise re-fetch.
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
  } else if (message.canvas || message.compositeCanvas) {
    // INVARIANT: OffscreenCanvases captured by the first message must not be replaced by later messages. Drop any stray canvas fields defensively.
    delete message.canvas;
    delete message.compositeCanvas;
  }
  Object.assign(map, message);
  // WHY: not awaited. Awaiting would serialize the queue below behind each throttled render instead of letting throttledInvoker coalesce them.
  map.update().catch(printError);
}

// WHY: serialize message handling so messages arriving while the MapRenderer construction awaits the glyph fetches are queued instead of dropped.
let queue: Promise<void> = Promise.resolve();
onmessage = (event: MessageEvent<MapRendererInputMessage>) => {
  queue = queue.then(() => handleMessage(event.data)).catch(printError);
};
