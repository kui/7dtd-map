// `event.target === dialog` also matches clicks on the dialog's own padding,
// so the rect check is required to distinguish backdrop from padding.
export function closeOnBackdropClick(dialog: HTMLDialogElement) {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const inside = event.clientY >= r.top && event.clientY <= r.bottom &&
      event.clientX >= r.left && event.clientX <= r.right;
    if (!inside) dialog.close();
  });
}
