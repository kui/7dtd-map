// Shared by the build-time glyph baker (tools/generate-glyph-markers.ts) and
// its runtime consumers, so a baked SVG and a canvas stamp of the same glyph
// always agree on scale.
export const GLYPH_MARKER_VIEWPORT = 256;
export const GLYPH_MARKER_FONT_SIZE = 220;
export const GLYPH_MARKER_STROKE_WIDTHS = { black: 26.4, white: 8.8 } as const;
