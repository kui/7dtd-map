import { requireNonnull } from "./utils.ts";

// Hand-picked Unicode block ranges covering emoji/pictograph/dingbat/symbol
// characters used across the app, both as literal DOM text and as canvas
// marker glyphs. Deliberately broader than a "recognized emoji" list (e.g.
// @twemoji/parser's), so symbol-only characters such as ✘ (U+2718, in the
// Dingbats block) are matched too even though no emoji font renders them
// with emoji presentation.
const SYMBOL_RANGES: readonly (readonly [number, number])[] = [
  [0x1f100, 0x1f1ff], // Enclosed alphanumeric supplement (e.g. 🆕) + regional indicators
  [0x1f300, 0x1faff], // Misc symbols/pictographs, emoticons, transport, supplemental symbols
  [0x2100, 0x214f], // Letterlike symbols (e.g. ℹ)
  [0x2190, 0x21ff], // Arrows
  [0x2300, 0x23ff], // Misc technical (e.g. ⌛, ⌖)
  [0x25a0, 0x25ff], // Geometric shapes (e.g. ▽)
  [0x2600, 0x27bf], // Misc symbols + Dingbats (e.g. ✘, ✅, ☢, ⚠, ❌)
  [0x2b00, 0x2bff], // Misc symbols and arrows (e.g. ⬇)
];

// Not symbols by themselves, but needed to render some glyphs' intended form
// (e.g. U+FE0F selects the emoji-style 🗺️ over the plain 🗺 text glyph).
const EXTRA_CODE_POINTS = new Set([
  0xfe0f, // variation selector-16 (emoji presentation)
  0x200d, // zero-width joiner (ZWJ sequences)
  0x20e3, // combining enclosing keycap
]);

export function extractSymbolChars(text: string): Set<string> {
  const found = new Set<string>();
  for (const ch of text) {
    const codePoint = requireNonnull(
      ch.codePointAt(0),
      () => "unreachable: empty grapheme from string iteration",
    );
    if (
      EXTRA_CODE_POINTS.has(codePoint) ||
      SYMBOL_RANGES.some(([lo, hi]) => codePoint >= lo && codePoint <= hi)
    ) {
      found.add(ch);
    }
  }
  return found;
}
