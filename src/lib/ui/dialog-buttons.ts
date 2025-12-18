export function init() {
  for (
    const button of document.querySelectorAll<HTMLButtonElement>(
      "button[data-show-dialog-for]",
    )
  ) {
    button.addEventListener("click", () => {
      const dialogId = button.dataset["showDialogFor"];
      if (!dialogId) return;
      const dialog = document.getElementById(dialogId);
      if (!dialog) throw Error(`Dialog not found: ${dialogId}`);
      if (!(dialog instanceof HTMLDialogElement)) {
        throw Error(`Unexpected element: ${dialogId}`);
      }
      dialog.showModal();
    });
  }
  for (
    const button of document.querySelectorAll<HTMLButtonElement>(
      "button[data-close-dialog-for]",
    )
  ) {
    button.addEventListener("click", () => {
      const dialogId = button.dataset["closeDialogFor"];
      if (dialogId == null) return;
      const dialog = dialogId === ""
        ? button.closest("dialog")
        : document.getElementById(dialogId);
      if (!dialog) throw Error(`Dialog not found: ${dialogId}`);
      if (!(dialog instanceof HTMLDialogElement)) {
        throw Error(`Unexpected element: ${dialogId}`);
      }
      dialog.close("");
    });
  }
}
