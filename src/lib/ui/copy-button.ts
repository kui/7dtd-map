import { printError } from "../utils.js";

export function init(): void {
  for (const button of Array.from(document.querySelectorAll("[data-copy-for]"))) {
    if (!(button instanceof HTMLButtonElement)) continue;

    const targetId = button.dataset["copyFor"];
    if (!targetId) continue;
    const target = document.getElementById(targetId);
    if (!target) continue;

    button.addEventListener("click", () => {
      copy(target, button).catch(printError);
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
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    textToCopy = target.value;
  } else {
    textToCopy = target.textContent || "";
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    console.log("Copy Success", target);
    button.dataset["message"] = button.dataset["successMessage"] ?? DEFAULT_SUCCESS_MESSAGE;
  } catch (e) {
    console.log("Copy Failure", target, e);
    button.dataset["message"] = button.dataset["failureMessage"] ?? DEFAULT_FAILURE_MESSAGE;
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
