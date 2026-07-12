/** Pixels offset from the cursor so the tooltip does not sit on top of it. */
const CURSOR_OFFSET = 16;

const HREF_PATTERN = /(?:^|\/)prefabs\/([^/]+)\.html(?:[?#]|$)/;

interface Doms {
  tooltip: HTMLElement;
  image: HTMLImageElement;
}

/**
 * Shows a preview image popover when the user hovers a link to an
 * individual prefab page. The popover element is placed in the top
 * layer so it overlays modal `<dialog>` content (e.g. the prefab
 * inspector).
 */
export function installPrefabLinkTooltip(doms: Doms): void {
  let currentLink: HTMLAnchorElement | null = null;
  let lastEvent: MouseEvent | null = null;

  const reposition = () => {
    if (!lastEvent) return;
    doms.tooltip.style.left = `${
      (lastEvent.clientX + CURSOR_OFFSET).toString()
    }px`;
    doms.tooltip.style.top = `${
      (lastEvent.clientY + CURSOR_OFFSET).toString()
    }px`;
  };

  const hide = () => {
    currentLink = null;
    lastEvent = null;
    if (doms.tooltip.matches(":popover-open")) doms.tooltip.hidePopover();
  };

  document.addEventListener("mouseover", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest("a");
    if (!link) {
      if (currentLink) hide();
      return;
    }
    const prefabName = extractPrefabName(link.getAttribute("href"));
    if (!prefabName) {
      if (currentLink) hide();
      return;
    }
    if (link === currentLink) return;
    currentLink = link;
    lastEvent = event;
    doms.image.src = `prefabs/${encodeURIComponent(prefabName)}.jpg`;
    reposition();
    doms.tooltip.showPopover();
  });

  document.addEventListener("mouseout", (event) => {
    if (!currentLink) return;
    const target = event.target;
    if (!(target instanceof Node) || !currentLink.contains(target)) return;
    const related = event.relatedTarget;
    if (related instanceof Node && currentLink.contains(related)) return;
    hide();
  });

  document.addEventListener("mousemove", (event) => {
    if (!currentLink) return;
    lastEvent = event;
    reposition();
  });
}

function extractPrefabName(href: string | null): string | null {
  if (!href) return null;
  const match = HREF_PATTERN.exec(href);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1] ?? "");
  } catch {
    return null;
  }
}
