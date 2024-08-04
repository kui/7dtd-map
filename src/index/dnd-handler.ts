import * as events from "../lib/events";

export interface EventMessage {
  type: "drop";
  files: FileSystemEntry[];
}

interface Doms {
  dragovered: HTMLElement;
  overlay: HTMLElement;
}

export class DndHandler extends events.Generator<"drop", EventMessage> {
  constructor(dom: Doms) {
    super();
    dom.dragovered.addEventListener("dragenter", (event) => {
      event.preventDefault();
      dom.overlay.showPopover();
    });
    dom.dragovered.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!event.dataTransfer) return;
      event.dataTransfer.dropEffect = "copy";
    });
    document.body.addEventListener("dragleave", (event) => {
      if (
        event.target !== dom.overlay &&
        // Sometime "dragleave" event from the overlay is not fired when the mouse cursor is moved out quickly from the browser window frame.
        // This condition is a workaround for that issue. Mouse cursor position are (0, 0) when it is out of the window frame.
        event.clientX !== 0 &&
        event.clientY !== 0
      )
        return;
      event.preventDefault();
      dom.overlay.hidePopover();
    });
    dom.dragovered.addEventListener("drop", (event) => {
      event.preventDefault();
      dom.overlay.hidePopover();
      if (!event.dataTransfer?.types.includes("Files")) return;
      this.emitNoAwait({
        type: "drop",
        files: Array.from(event.dataTransfer.items).flatMap((item) => item.webkitGetAsEntry() ?? []),
      });
    });
  }
}
