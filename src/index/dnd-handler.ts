import * as events from "../lib/events.ts";
import { DialogHandler } from "./dialog-handler.ts";

export interface EventMessage {
  files: FileSystemEntry[];
}

interface Doms {
  dragovered: HTMLElement;
}

/**
 * Tracks nested dragenter/dragleave pairs so we only react to the
 * outermost boundary crossings. `dragenter` and `dragleave` fire for
 * every child element the cursor crosses, so a naive `close()` on
 * `dragleave` would fire while the cursor is still over the page.
 * Incrementing on enter and decrementing on leave returns the counter
 * to 0 only when the cursor truly leaves the target.
 */
export interface DragCounter {
  enter(): boolean;
  leave(): boolean;
  reset(): void;
}

export function createDragCounter(): DragCounter {
  let depth = 0;
  return {
    enter() {
      depth++;
      return depth === 1;
    },
    leave() {
      depth--;
      if (depth <= 0) {
        depth = 0;
        return true;
      }
      return false;
    },
    reset() {
      depth = 0;
    },
  };
}

export class DndHandler {
  #listeners = new events.ListenerManager<EventMessage>();

  constructor(dom: Doms, dialogHandler: DialogHandler) {
    const counter = createDragCounter();

    dom.dragovered.addEventListener("dragenter", (event) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      if (counter.enter()) {
        dialogHandler.state = "dragover";
        dialogHandler.open();
      }
    });
    dom.dragovered.addEventListener("dragover", (event) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });
    dom.dragovered.addEventListener("dragleave", (event) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      if (counter.leave()) {
        dialogHandler.close();
      }
    });
    dom.dragovered.addEventListener("drop", (event) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      // WHY: drop consumes the dragenter without firing a matching dragleave, so reset the counter to keep it consistent for the next drag.
      counter.reset();
      this.#listeners.dispatchNoAwait({
        files: Array.from(event.dataTransfer.items).flatMap((item) =>
          item.webkitGetAsEntry() ?? []
        ),
      });
    });
  }

  addListener(fn: (m: EventMessage) => unknown) {
    this.#listeners.addListener(fn);
  }
}
