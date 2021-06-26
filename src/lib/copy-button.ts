export function init(): void {
  for (const button of Array.from(document.querySelectorAll("[data-copy-for]"))) {
    if (!(button instanceof HTMLButtonElement)) continue;

    const target = document.getElementById(button.dataset.copyFor as string);
    if (!target) continue;

    button.addEventListener("click", () => copy(target, button));
  }
}

const DEFAULT_SUCCESS_MESSAGE = "Copied!";
const DEFAULT_FAILURE_MESSAGE = "⚠Failure";

function copy(target: HTMLElement, button: HTMLButtonElement) {
  selectNode(target);

  const commandResult = document.execCommand("copy");
  if (commandResult) {
    console.log("Copy Success", target);
    button.dataset.message = button.dataset.successMessage ?? DEFAULT_SUCCESS_MESSAGE;
  } else {
    console.log("Copy Failure", target);
    button.dataset.message = button.dataset.failureMessage ?? DEFAULT_FAILURE_MESSAGE;
  }

  console.log(commandResult);
}

function selectNode(target: HTMLElement) {
  const selection = getSelection();
  selection?.removeAllRanges();

  const range = document.createRange();
  range.selectNodeContents(target);
  selection?.addRange(range);
}
