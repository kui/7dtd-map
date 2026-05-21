import type * as mapFiles from "../../lib/map-files.ts";
import type MapRendererClass from "../lib/map-renderer.ts";
import type { EventMessage, PrefabFilter } from "../lib/prefab-filter.ts";
import type { GameMapSize } from "../types/7dtdmap.ts";

export type DtmOutputMessage = null | Uint8Array;

export type FileProcessorInputMessage =
  | { name: mapFiles.WorldFileName; blob: Blob }
  | { name: mapFiles.WorldFileName; url: string };

export interface FileProcessorSuccessOutputMessage {
  name: mapFiles.MapFileName;
  size: number;
}

export interface FileProcessorErrorOutputMessage {
  error: string;
}

export type FileProcessorOutputMessage =
  | FileProcessorSuccessOutputMessage
  | FileProcessorErrorOutputMessage;

export type MapRendererInputMessage = Partial<
  Pick<
    InstanceType<typeof MapRendererClass>,
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

export interface MapRendererOutputMessage {
  mapSize: GameMapSize;
}

export type PrefabsFilterInputMessage = Partial<
  Pick<
    PrefabFilter,
    | "all"
    | "difficulty"
    | "prefabFilterRegexp"
    | "blockFilterRegexp"
    | "markCoords"
    | "language"
    | "preExcludes"
  >
>;

export type PrefabsFilterOutputMessage = EventMessage;
