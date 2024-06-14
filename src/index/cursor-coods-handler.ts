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
        updateCursor(this, e);
      },
      { passive: true }
    );
    doms.canvas.addEventListener("mouseout", () => {
      updateCursor(this);
    });
  }
}

function updateCursor(self: CursorCoodsHandler, event: MouseEvent | null = null) {
  self.doms.output.textContent = formatCoords(self.mapSize, self.doms.canvas, self.elevationFunction, event);
}
