import {
  GLYPH_MARKER_FONT_SIZE,
  GLYPH_MARKER_STROKE_WIDTHS,
  GLYPH_MARKER_VIEWPORT,
} from "../../lib/glyph-marker.ts";

/**
 * Stamps a glyph path baked by `tools/generate-glyph-markers.ts` into
 * a square sprite twice the target pixel size, matching the baked
 * SVGs' layered look.
 */
export function buildGlyphSprite(
  path2D: Path2D,
  pixelSize: number,
): OffscreenCanvas {
  const spriteSize = pixelSize * 2;
  const sprite = new OffscreenCanvas(spriteSize, spriteSize);
  const sc = sprite.getContext("2d");
  if (sc) {
    // WHY: scale the baked path's viewport to pixelSize, then centre it on the sprite. The path itself is built centred on VIEWPORT/2 at build time.
    const k = pixelSize / GLYPH_MARKER_FONT_SIZE;
    sc.lineJoin = "round";
    sc.lineCap = "round";
    sc.translate(spriteSize / 2, spriteSize / 2);
    sc.scale(k, k);
    sc.translate(-GLYPH_MARKER_VIEWPORT / 2, -GLYPH_MARKER_VIEWPORT / 2);
    sc.lineWidth = GLYPH_MARKER_STROKE_WIDTHS.black;
    sc.strokeStyle = "black";
    sc.fillStyle = "black";
    sc.stroke(path2D);
    sc.fill(path2D);
    sc.fillStyle = "red";
    sc.fill(path2D);
    sc.lineWidth = GLYPH_MARKER_STROKE_WIDTHS.white;
    sc.strokeStyle = "white";
    sc.stroke(path2D);
  }
  return sprite;
}
