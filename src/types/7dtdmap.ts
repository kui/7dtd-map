export interface Prefab {
  name: string;
  x: number;
  z: number;
  // Placed rotation from prefabs.xml `decoration.rotation`, 0..3 = 0/90/180/270
  // degrees clockwise applied at placement time.
  rotation?: number;
}

export interface PrefabMeshSizes {
  // [width (X), depth (Z)] in game blocks
  [prefabName: string]: [number, number];
}

export interface DistrictColors {
  // CSS hex (`#rrggbb`) from rwgmixer.xml `<district>` preview_color.
  [districtName: string]: string;
}

export interface PrefabDensityScores {
  // Integer score from PrefabData.Init: floor((TotalVertices + 50000) / 100000).
  [prefabName: string]: number;
}

export interface HighlightedPrefab extends Prefab {
  // Looked up from prefab-difficulties.json inside the filter worker — kept on
  // the highlighted variant (not Prefab itself) so the type stays a pure
  // representation of the prefabs.xml entry.
  difficulty?: number;
  highlightedName?: string;
  highlightedLabel?: string;
  matchedBlocks?: HighlightedBlock[];
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
