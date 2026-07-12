import { requireNonnull } from "./utils.ts";

/**
 * Hand-picked Unicode block ranges covering the emoji, pictograph,
 * dingbat, and symbol characters the app renders. Deliberately broader
 * than a "recognized emoji" list (e.g. `@twemoji/parser`'s) so
 * symbol-only characters such as ✘ (U+2718, Dingbats block) are matched
 * too even though no emoji font renders them with emoji presentation.
 *
 *   0x1f100-0x1f1ff: Enclosed alphanumeric supplement (e.g. 🆕), regional indicators
 *   0x1f300-0x1faff: Misc symbols and pictographs, emoticons, transport, supplemental symbols
 *   0x2100-0x214f:   Letterlike symbols (e.g. ℹ)
 *   0x2190-0x21ff:   Arrows
 *   0x2300-0x23ff:   Misc technical (e.g. ⌛, ⌖)
 *   0x25a0-0x25ff:   Geometric shapes (e.g. ▽)
 *   0x2600-0x27bf:   Misc symbols and Dingbats (e.g. ✘, ✅, ☢, ⚠, ❌)
 *   0x2b00-0x2bff:   Misc symbols and arrows (e.g. ⬇)
 */
const SYMBOL_RANGES: readonly (readonly [number, number])[] = [
  [0x1f100, 0x1f1ff],
  [0x1f300, 0x1faff],
  [0x2100, 0x214f],
  [0x2190, 0x21ff],
  [0x2300, 0x23ff],
  [0x25a0, 0x25ff],
  [0x2600, 0x27bf],
  [0x2b00, 0x2bff],
];

/**
 * Not symbols by themselves, but needed to render some glyphs' intended
 * form (e.g. U+FE0F selects emoji-style 🗺️ over the plain text 🗺).
 *
 *   0xfe0f: variation selector-16 (emoji presentation)
 *   0x200d: zero-width joiner (ZWJ sequences)
 *   0x20e3: combining enclosing keycap
 */
const EXTRA_CODE_POINTS = new Set([
  0xfe0f,
  0x200d,
  0x20e3,
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
