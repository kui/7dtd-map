// Shared by tools/generate-glyph-markers.ts (which bakes the ✘ sign / 🚩 flag
// glyphs into SVGs + path-only JSONs at build time) and
// src/worker/lib/map-renderer.ts (which stamps those baked paths onto the
// map canvas), so both sides agree on scale without duplicating the numbers.
export const GLYPH_MARKER_VIEWPORT = 256;
export const GLYPH_MARKER_FONT_SIZE = 220;
export const GLYPH_MARKER_STROKE_WIDTHS = { black: 26.4, white: 8.8 } as const;
