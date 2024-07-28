import { formatCoords, gameMapSize } from "../lib/utils";

interface Doms {
  canvas: HTMLCanvasElement;
  output: HTMLElement;
}

export class CursorCoodsHandler {
  mapSize: GameMapSize = gameMapSize({ width: 0, height: 0 });
  elevationFunction: (coods: GameCoords, mapSize: GameMapSize) => number | null;
  doms: Doms;

  constructor(doms: Doms, elevationFunction: (coords: GameCoords, mapSize: GameMapSize) => number | null) {
    this.elevationFunction = elevationFunction;
    this.doms = doms;

    doms.canvas.addEventListener(
      "mousemove",
      (e) => {
        this.#updateCursor(e);
      },
      { passive: true },
    );
    doms.canvas.addEventListener("mouseout", () => {
      this.#updateCursor(null);
    });
  }

  #updateCursor(event: MouseEvent | null) {
    this.doms.output.textContent = formatCoords(this.mapSize, this.doms.canvas, this.elevationFunction, event);
  }
}
