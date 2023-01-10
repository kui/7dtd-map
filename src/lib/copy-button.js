"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
function init() {
  for (const button of Array.from(document.querySelectorAll("[data-copy-for]"))) {
    if (!(button instanceof HTMLButtonElement)) continue;
    const target = document.getElementById(button.dataset.copyFor);
    if (!target) continue;
    button.addEventListener("click", () => copy(target, button));
    button.addEventListener("mouseover", () => selectNode(target));
    button.addEventListener("mousemove", () => selectNode(target), { passive: true });
    button.addEventListener("mouseout", () => clearSelection());
  }
}
exports.init = init;
const DEFAULT_SUCCESS_MESSAGE = "Copied!";
const DEFAULT_FAILURE_MESSAGE = "⚠Failure";
function copy(target, button) {
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
function selectNode(target) {
  const selection = getSelection();
  selection?.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(target);
  selection?.addRange(range);
}
function clearSelection() {
  getSelection()?.removeAllRanges();
}
//# sourceMappingURL=copy-button.js.map
