import * as events from "../lib/events";

export interface EventMessage {
  type: "drop";
  files: FileSystemEntry[];
}

interface Doms {
  dragovered: HTMLElement;
  dialog: HTMLDialogElement;
}

export class DndHandler extends events.Generator<"drop", EventMessage> {
  constructor(dom: Doms) {
    super();
    dom.dragovered.addEventListener("dragenter", (event) => {
      event.preventDefault();
      dom.dialog.showModal();
    });
    dom.dragovered.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!event.dataTransfer) return;
      event.dataTransfer.dropEffect = "copy";
    });
    document.body.addEventListener("dragleave", (event) => {
      // clientX and clientY are 0 when the mouse cursor is out of the window frame.
      if (dom.dragovered === event.target || !(event.clientX === 0 && event.clientY === 0)) return;
      event.preventDefault();
      dom.dialog.close();
    });
    dom.dragovered.addEventListener("drop", (event) => {
      event.preventDefault();
      dom.dialog.close();
      if (!event.dataTransfer?.types.includes("Files")) return;
      this.emitNoAwait({
        type: "drop",
        files: Array.from(event.dataTransfer.items).flatMap((item) => item.webkitGetAsEntry() ?? []),
      });
    });
  }
}
