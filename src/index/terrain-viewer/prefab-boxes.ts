import type { Prefab } from "../../types/7dtdmap.ts";

import * as three from "three";

// A footprint box in the terrain's local space; 90°/270° rotations fold into
// width/depth. groundY splits it into above-ground and buried highlight slabs.
export interface BoxPlacement {
  prefab: Prefab;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
  bottomY: number;
  topY: number;
  groundY: number;
  color: three.Color;
}

export interface PrefabBoxes {
  object: three.Object3D;
  // Exposed for the hover raycaster; instanceId indexes `placements`.
  mesh: three.InstancedMesh;
  placements: BoxPlacement[];
  dispose(): void;
}

// Amber buried-part highlight, distinct from the brightened above-ground tint.
const BURIED_HIGHLIGHT = new three.Color("#ffb300");

export function buildPrefabBoxes(
  placements: BoxPlacement[],
  opacity: number,
): PrefabBoxes {
  const geometry = new three.BoxGeometry(1, 1, 1);
  const material = new three.MeshLambertMaterial({
    transparent: true,
    opacity,
  });
  const mesh = new three.InstancedMesh(geometry, material, placements.length);
  const matrix = new three.Matrix4();
  const position = new three.Vector3();
  const scale = new three.Vector3();
  const quaternion = new three.Quaternion();
  for (let i = 0; i < placements.length; i++) {
    // deno-lint-ignore no-non-null-assertion
    const p = placements[i]!;
    position.set(p.centerX, (p.bottomY + p.topY) / 2, p.centerZ);
    scale.set(p.width, Math.max(p.topY - p.bottomY, 1e-6), p.depth);
    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, p.color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  return {
    object: mesh,
    mesh,
    placements,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

export interface BoxHighlight {
  object: three.Object3D;
  dispose(): void;
}

// Two depth-test-off slabs so the highlight reads through terrain: a brightened
// above-ground slab and, when the prefab is buried, an amber below-ground slab.
export function buildBoxHighlight(placement: BoxPlacement): BoxHighlight {
  const group = new three.Group();
  const disposables: { dispose(): void }[] = [];

  const aboveTint = placement.color.clone().lerp(new three.Color(1, 1, 1), 0.5);
  const slabs = [
    makeSlab(placement, placement.groundY, placement.topY, aboveTint),
    placement.bottomY < placement.groundY
      ? makeSlab(
        placement,
        placement.bottomY,
        placement.groundY,
        BURIED_HIGHLIGHT,
      )
      : null,
  ];
  for (const slab of slabs) {
    if (!slab) continue;
    group.add(slab.mesh);
    disposables.push(...slab.disposables);
  }

  return {
    object: group,
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}

function makeSlab(
  placement: BoxPlacement,
  y0: number,
  y1: number,
  color: three.Color,
):
  | { mesh: three.Mesh; disposables: [three.BufferGeometry, three.Material] }
  | null {
  const height = y1 - y0;
  if (height <= 0) return null;
  const geometry = new three.BoxGeometry(
    placement.width,
    height,
    placement.depth,
  );
  const material = new three.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new three.Mesh(geometry, material);
  mesh.position.set(placement.centerX, (y0 + y1) / 2, placement.centerZ);
  mesh.renderOrder = 1;
  return { mesh, disposables: [geometry, material] };
}
