/**
 * Closes the dialog when the user clicks the backdrop. A
 * bounding-rect check is used because `event.target === dialog` also
 * matches clicks on the dialog's own padding.
 */
export function closeOnBackdropClick(dialog: HTMLDialogElement) {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const inside = event.clientY >= r.top && event.clientY <= r.bottom &&
      event.clientX >= r.left && event.clientX <= r.right;
    if (!inside) dialog.close();
  });
}
