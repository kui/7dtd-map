import type { GlyphMarker } from "../../types/7dtdmap.ts";

import * as three from "three";
import { buildGlyphSprite } from "../../lib/glyph-sprite.ts";
import {
  GLYPH_MARKER_FONT_SIZE,
  GLYPH_MARKER_VIEWPORT,
} from "../../../lib/glyph-marker.ts";

// Baked glyph resolution, independent of the on-screen size (the largest
// reachable screen size is 60px, so this stays oversampled).
const GLYPH_TEXTURE_PX = 128;

// Position in the terrain mesh's local (three.js) coordinate space.
export interface MarkerPlacement {
  x: number;
  y: number;
  z: number;
}

export interface MarkerSprites {
  object: three.Object3D;
  dispose(): void;
}

// `spriteScale` is the world scale that yields the desired constant
// on-screen size with `sizeAttenuation: false`.
export function buildSignSprites(opts: {
  marker: GlyphMarker;
  placements: MarkerPlacement[];
  spriteScale: number;
  opacity: number;
}): MarkerSprites | null {
  if (opts.placements.length === 0 || opts.opacity <= 0) return null;
  const { material, center, disposables } = glyphMaterial(
    opts.marker,
    opts.opacity,
  );
  const group = new three.Group();
  for (const p of opts.placements) {
    group.add(makeSprite(material, center, p, opts.spriteScale, 2));
  }
  return {
    object: group,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

export function buildFlagSprite(opts: {
  marker: GlyphMarker;
  placement: MarkerPlacement;
  spriteScale: number;
}): MarkerSprites {
  const { material, center, disposables } = glyphMaterial(opts.marker, 1);
  // Higher renderOrder than signs (2) so the flag paints last regardless of
  // the transparent pass's distance sort (all sprites share depthTest: false).
  const sprite = makeSprite(
    material,
    center,
    opts.placement,
    opts.spriteScale,
    3,
  );
  return {
    object: sprite,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function glyphMaterial(
  marker: GlyphMarker,
  opacity: number,
): {
  material: three.SpriteMaterial;
  center: three.Vector2;
  disposables: [three.Texture, three.Material];
} {
  const texture = new three.CanvasTexture(
    buildGlyphSprite(new Path2D(marker.d), GLYPH_TEXTURE_PX),
  );
  texture.colorSpace = three.SRGBColorSpace;
  const material = new three.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity,
    sizeAttenuation: false,
    // Markers show through terrain by design: with depth testing, glyph
    // pixels away from the anchor row get culled by nearer terrain.
    depthTest: false,
    depthWrite: false,
  });
  return {
    material,
    center: anchorCenter(marker.anchor),
    disposables: [texture, material],
  };
}

// Convert a glyph anchor (a point in the shared VIEWPORT square) into
// Sprite.center units: [0, 1] with (0, 0) at the sprite's bottom-left.
function anchorCenter(anchor: GlyphMarker["anchor"]): three.Vector2 {
  return new three.Vector2(
    0.5 + (anchor.x - GLYPH_MARKER_VIEWPORT / 2) / (2 * GLYPH_MARKER_FONT_SIZE),
    0.5 - (anchor.y - GLYPH_MARKER_VIEWPORT / 2) / (2 * GLYPH_MARKER_FONT_SIZE),
  );
}

function makeSprite(
  material: three.SpriteMaterial,
  center: three.Vector2,
  placement: MarkerPlacement,
  scale: number,
  renderOrder: number,
): three.Sprite {
  const sprite = new three.Sprite(material);
  sprite.center.copy(center);
  sprite.scale.set(scale, scale, 1);
  sprite.position.set(placement.x, placement.y, placement.z);
  // Above terrain, boxes (0) and highlight (1); the transparent pass's distance
  // sort could otherwise paint those over these non-depth-writing sprites.
  sprite.renderOrder = renderOrder;
  return sprite;
}
