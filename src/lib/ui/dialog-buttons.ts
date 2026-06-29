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
}
