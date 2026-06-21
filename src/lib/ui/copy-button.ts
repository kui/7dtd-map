import { printError } from "../utils.ts";

// Shared visually-hidden live region used to announce copy results to
// screen readers. The CSS ::after pseudo-element used for sighted users
// is not reliably surfaced by assistive tech.
let liveRegion: HTMLElement | null = null;
function ensureLiveRegion(): HTMLElement {
  if (liveRegion) return liveRegion;
  const el = document.createElement("div");
  el.id = "copy-button-live-region";
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-atomic", "true");
  Object.assign(el.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: "0",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
    border: "0",
  });
  document.body.appendChild(el);
  liveRegion = el;
  return el;
}

function announce(message: string) {
  const region = ensureLiveRegion();
  // Re-assignment forces SR to re-announce when the same message repeats.
  region.textContent = "";
  region.textContent = message;
}

export function init(): void {
  for (
    const button of Array.from(document.querySelectorAll("[data-copy-for]"))
  ) {
    if (!(button instanceof HTMLButtonElement)) continue;

    const targetId = button.dataset["copyFor"];
    if (!targetId) continue;
    const target = document.getElementById(targetId);
    if (!target) continue;

    if (!button.hasAttribute("aria-label") && !button.hasAttribute("title")) {
      button.setAttribute("aria-label", "Copy");
    }

    button.addEventListener("click", () => {
      copy(target, button).catch(printError);
    });
    // Native <button> fires click on Enter/Space already; we additionally
    // select the target text on focus so keyboard users see the same
    // affordance that mouse-over provides.
    button.addEventListener("focus", () => {
      selectNode(target);
    });
    button.addEventListener("blur", () => {
      clearSelection();
    });
    button.addEventListener("mouseover", () => {
      selectNode(target);
    });
    button.addEventListener(
      "mousemove",
      () => {
        selectNode(target);
      },
      { passive: true },
    );
    button.addEventListener("mouseout", () => {
      clearSelection();
    });
  }
}

const DEFAULT_SUCCESS_MESSAGE = "Copied!";
const DEFAULT_FAILURE_MESSAGE = "⚠Failure";

async function copy(target: HTMLElement, button: HTMLButtonElement) {
  selectNode(target);

  let textToCopy = "";
  if (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  ) {
    textToCopy = target.value;
  } else {
    textToCopy = target.textContent;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    console.log("Copy Success", target);
    const msg = button.dataset["successMessage"] ?? DEFAULT_SUCCESS_MESSAGE;
    button.dataset["message"] = msg;
    announce(msg);
  } catch (e) {
    console.log("Copy Failure", target, e);
    const msg = button.dataset["failureMessage"] ?? DEFAULT_FAILURE_MESSAGE;
    button.dataset["message"] = msg;
    announce(msg);
  }
}

function selectNode(target: HTMLElement) {
  const selection = getSelection();
  selection?.removeAllRanges();

  const range = document.createRange();
  range.selectNodeContents(target);
  selection?.addRange(range);
}

function clearSelection() {
  getSelection()?.removeAllRanges();
}
