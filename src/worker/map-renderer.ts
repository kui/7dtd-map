import MapRenderer from "./lib/map-renderer.ts";
import { fetchJson, printError } from "../lib/utils.ts";
import type { MapRendererInputMessage } from "./types.ts";
import type {
  DistrictColors,
  PrefabDensityScores,
  PrefabMeshSizes,
} from "../types/7dtdmap.ts";

let map: MapRenderer | null = null;

// The ✘ sign and 🚩 flag markers stamp SVG path data baked at build time
// (see tools/generate-glyph-markers.ts) instead of rendering glyphs from a
// webfont, so it's fetched once here rather than per MapRenderer instance.
const signPathDReady: Promise<string> = fetchJson<string>(
  "../sign-path.json",
);
const markPathDReady: Promise<string> = fetchJson<string>(
  "../flag-path.json",
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
  const [signPathD, markPathD] = await Promise.all([
    signPathDReady,
    markPathDReady,
  ]);
  if (!map) {
    if (message.canvas) {
      map = new MapRenderer(
        message.canvas,
        signPathD,
        markPathD,
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
