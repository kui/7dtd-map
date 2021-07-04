export class DndHandler {
  private dropFilesListeners: ((files: File[]) => Promise<unknown> | unknown)[] = [];

  constructor(doc: Document) {
    doc.addEventListener("drop", async (event) => {
      if (!event.dataTransfer?.types.includes("Files")) {
        return;
      }
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      this.dropFilesListeners.forEach((fn) => fn(files));
    });

    doc.addEventListener("dragenter", (event) => {
      if (!event.dataTransfer?.types.includes("Files")) {
        return;
      }
      event.preventDefault();
      doc.body.classList.add("dragovered");
    });
    doc.addEventListener("dragover", (event) => {
      if (!event.dataTransfer?.types.includes("Files")) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      doc.body.classList.add("dragovered");
    });
    doc.addEventListener("dragleave", (event) => {
      // "dragleave" events raise even if the cursor moved on child nodes.
      // To avoid this case, we should check cursor positions.
      // Those are zero if the cursor moved out from the browser window.
      if (event.clientX !== 0 || event.clientY !== 0) {
        return;
      }
      event.preventDefault();
      doc.body.classList.remove("dragovered");
    });
    doc.addEventListener("drop", async (event) => {
      if (!event.dataTransfer?.types.includes("Files")) {
        return;
      }
      event.preventDefault();
      doc.body.classList.remove("dragovered");
    });
  }

  addDropFilesListener(ln: (files: File[]) => Promise<unknown> | unknown): void {
    this.dropFilesListeners.push(ln);
  }
}
