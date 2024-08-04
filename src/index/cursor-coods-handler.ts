import { throttledInvoker } from "../lib/throttled-invoker";
import { formatCoords, printError } from "../lib/utils";
import { DtmHandler } from "./dtm-handler";

interface Doms {
  canvas: HTMLCanvasElement;
  output: HTMLElement;
}

export class CursorCoodsHandler {
  #doms: Doms;
  #dtmHandler: DtmHandler;
  #lastEvent: MouseEvent | null = null;

  constructor(doms: Doms, dtmHandler: DtmHandler) {
    this.#doms = doms;
    this.#dtmHandler = dtmHandler;

    doms.canvas.addEventListener(
      "mousemove",
      (e) => {
        this.#lastEvent = e;
        this.#update().catch(printError);
      },
      { passive: true },
    );
    doms.canvas.addEventListener("mouseout", () => {
      this.#lastEvent = null;
      this.#update().catch(printError);
    });
  }

  #update = throttledInvoker(() => this.#updateImediately().catch(printError), 100);
  async #updateImediately() {
    this.#doms.output.textContent = await formatCoords(
      await this.#dtmHandler.size(),
      this.#doms.canvas,
      (c) => this.#dtmHandler.getElevation(c),
      this.#lastEvent,
    );
  }
}
