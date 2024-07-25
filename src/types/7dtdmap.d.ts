interface Prefab {
  name: string;
  x: number;
  z: number;
  difficulty?: number;
}
interface HighlightedPrefab extends Prefab {
  highlightedName?: string;
  highlightedLabel?: string;
  matchedBlocks?: HighlightedBlock[];
  dist?: number | null;
}
interface HighlightedBlock {
  name: string;
  highlightedName: string;
  highlightedLabel: string;
  count?: number;
}

interface PrefabDifficulties {
  [prefabName: string]: number;
}

interface GameMapSize {
  type: "game";
  width: number;
  height: number;
}

interface ThreePlaneSize {
  type: "threePlane";
  width: number;
  height: number;
}

type GameCoords =
  | {
      type: "game";
      x: number;
      z: number;
    }
  | Prefab;

interface PrefabBlockCounts {
  [prefabName: string]: {
    [blockName: string]: number;
  };
}
interface BlockPrefabCounts {
  [blockName: string]: {
    [prefabName: string]: number;
  };
}
