interface Prefab {
  name: string;
  x: number;
  z: number;
}
interface HighlightedPrefab extends Prefab {
  highlightedName?: string;
  matchedBlocks?: HighlightedBlock[];
  dist?: number | null;
}
interface HighlightedBlock {
  name: string;
  highlightedName: string;
  highlightedLabel: string;
  count?: number;
  prefabs?: { name: string; count: number }[];
}

interface RectSize {
  width: number;
  height: number;
}

interface Coords {
  x: number;
  z: number;
}

// key: prefab name
// value: block name and # of block
interface PrefabBlockIndex {
  [prefab: string]: { name: string; count: number }[];
}

// key: block name
// value: prefab name and # of block
interface BlockPrefabIndex {
  [block: string]: { name: string; count: number }[];
}

interface BlockLabels {
  [block: string]: string;
}
