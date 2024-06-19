import { canvasEventToGameCoords, formatCoords, gameMapSize } from "../lib/utils";

interface Doms {
  canvas: HTMLCanvasElement;
  output: HTMLElement;
  resetMarker: HTMLButtonElement;
}

export class MarkerHandler {
  mapSize: GameMapSize = gameMapSize({ width: 0, height: 0 });
  elevationFunction: (coods: GameCoords, size: GameMapSize) => number | null;
  doms: Doms;
  listeners: ((c: GameCoords | null) => unknown)[] = [];

  constructor(doms: Doms, elevationFunction: (coords: GameCoords, width: GameMapSize) => number | null) {
    this.elevationFunction = elevationFunction;
    this.doms = doms;

    doms.canvas.addEventListener("click", (e) => {
      updateMarker(this, e);
      const coods = canvasEventToGameCoords(e, this.mapSize, doms.canvas);
      this.listeners.forEach((fn) => fn(coods));
    });
    doms.resetMarker.addEventListener("click", () => {
      updateMarker(this);
      this.listeners.forEach((fn) => fn(null));
    });
  }
}

function updateMarker(self: MarkerHandler, event: MouseEvent | null = null) {
  self.doms.output.textContent = formatCoords(self.mapSize, self.doms.canvas, self.elevationFunction, event);
}
