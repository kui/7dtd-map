import * as events from "../lib/events";
import { DialogHandler } from "./dialog-handler";

export interface EventMessage {
  drop: {
    files: FileSystemEntry[];
  };
}

interface Doms {
  dragovered: HTMLElement;
}

export class DndHandler {
  #listeners = new events.ListenerManager<"drop", EventMessage>();

  constructor(dom: Doms, dialogHandler: DialogHandler) {
    dom.dragovered.addEventListener("dragenter", (event) => {
      event.preventDefault();
      dialogHandler.state = "dragover";
      dialogHandler.open();
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
      dialogHandler.close();
    });
    dom.dragovered.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!event.dataTransfer?.types.includes("Files")) return;
      this.#listeners.dispatchNoAwait({
        drop: {
          files: Array.from(event.dataTransfer.items).flatMap((item) => item.webkitGetAsEntry() ?? []),
        },
      });
    });
  }

  addListener(fn: (m: EventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }
}
