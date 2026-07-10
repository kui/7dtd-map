// INVARIANT: values are consumed by both tools/generate-glyph-markers.ts (baked SVG) and runtime canvas stamps; both must use identical scale.
export const GLYPH_MARKER_VIEWPORT = 256;
export const GLYPH_MARKER_FONT_SIZE = 220;
export const GLYPH_MARKER_STROKE_WIDTHS = { black: 26.4, white: 8.8 } as const;
