export interface Prefab {
  name: string;
  x: number;
  z: number;
  difficulty?: number;
}

export interface HighlightedPrefab extends Prefab {
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
