export interface Prefab {
  name: string;
  x: number;
  y: number;
  z: number;
  /**
   * Placed rotation from `prefabs.xml decoration.rotation`. Values 0..3
   * correspond to 0/90/180/270 degrees clockwise applied at placement
   * time.
   */
  rotation?: number;
  /**
   * From `y_is_groundlevel="true"`. A missing attribute is `false`.
   * When `true`, `y` is the terrain surface rather than the prefab's
   * bottom.
   */
  yIsGroundLevel: boolean;
}

export interface PrefabMeshSizes {
  /**
   * `[width (X), depth (Z), height (Y), yOffset]` in game blocks.
   * `yOffset` is the number of blocks the prefab sits below ground
   * (0 or negative).
   */
  [prefabName: string]: [number, number, number, number];
}

export interface DistrictColors {
  /** CSS hex (`#rrggbb`) from `rwgmixer.xml <district> preview_color`. */
  [districtName: string]: string;
}

export interface PrefabDensityScores {
  /** Integer score from `PrefabData.Init`: `floor((TotalVertices + 50000) / 100000)`. */
  [prefabName: string]: number;
}

/** Written by `tools/generate-glyph-markers.ts`. */
export interface GlyphMarker {
  d: string;
  /**
   * Point in the shared `VIEWPORT` square (`lib/glyph-marker.ts`) that
   * should land on the target coordinate when this marker is placed.
   */
  anchor: { x: number; y: number };
}

export interface HighlightedPrefab extends Prefab {
  /**
   * Looked up from `prefab-difficulties.json` inside the filter worker.
   * Kept on the highlighted variant (not `Prefab` itself) so the base
   * type stays a pure representation of the `prefabs.xml` entry.
   */
  difficulty?: number;
  /**
   * Looked up from `prefab-added-versions.json`. Absent for prefabs
   * that predate that tracking (e.g. everything before 3.0).
   */
  addedVersion?: string;
  isAddedInLatestVersion?: boolean;
  highlightedName?: string;
  highlightedLabel?: string;
  matchedBlocks?: HighlightedBlock[];
  matchedBlockCount?: number;
  /**
   * Number of matched block types before `matchedBlocks` was capped
   * for display. Larger than `matchedBlocks.length` when the list was
   * truncated.
   */
  matchedBlockTypeCount?: number;
  distance?: [Direction | null, number] | null;
}

export interface HighlightedBlock {
  name: string;
  highlightedName: string;
  highlightedLabel: string;
  count?: number;
}

export interface PrefabDifficulties {
  [prefabName: string]: number;
}

export interface PrefabAddedVersions {
  [prefabName: string]: string;
}

export interface GameMapSize {
  type: "game";
  width: number;
  height: number;
}

export interface ThreePlaneSize {
  type: "threePlane";
  width: number;
  height: number;
}

export type Direction = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export type GameCoords =
  | {
    type: "game";
    x: number;
    z: number;
  }
  | Prefab;

export interface PrefabBlockCounts {
  [prefabName: string]: {
    [blockName: string]: number;
  };
}

export interface BlockPrefabCounts {
  [blockName: string]: {
    [prefabName: string]: number;
  };
}
