export const HIGHLIGHT_CLASS = "reset-target-highlight";

/**
 * Marks each target's closest `<tr>` or `<li>` ancestor plus any
 * collapsed `<details>` ancestor so the cue stays visible when the
 * section is folded. Targets without any of these ancestors (e.g.
 * inside a dialog) are skipped.
 */
export function setHighlightFor(
  targets: Iterable<Element>,
  on: boolean,
): void {
  for (const el of targets) {
    const row = el.closest("tr, li");
    if (row) row.classList.toggle(HIGHLIGHT_CLASS, on);
    for (
      let d = el.closest("details");
      d;
      d = d.parentElement?.closest("details") ?? null
    ) {
      if (!d.open) d.classList.toggle(HIGHLIGHT_CLASS, on);
    }
  }
}

export function bindHoverHighlight(
  button: HTMLElement,
  targets: () => Iterable<Element>,
): void {
  const on = () => setHighlightFor(targets(), true);
  const off = () => setHighlightFor(targets(), false);
  button.addEventListener("mouseenter", on);
  button.addEventListener("mouseleave", off);
  button.addEventListener("focus", on);
  button.addEventListener("blur", off);
}
