import { canvasEventToGameCoords, sendCoords, gameMapSize } from "../lib/utils";

interface Doms {
  canvas: HTMLCanvasElement;
  xOutput: HTMLElement;
  zOutput: HTMLElement;
  yOutput: HTMLElement;
  resetMarker: HTMLButtonElement;
}

export class MarkerHandler {
  mapSize: GameMapSize = gameMapSize({ width: 0, height: 0 });
  elevationFunction: (coods: GameCoords, size: GameMapSize) => number | null;
  doms: Doms;
  listeners: ((c: GameCoords | null) => Promise<void>)[] = [];

  constructor(doms: Doms, elevationFunction: (coords: GameCoords, width: GameMapSize) => number | null) {
    this.elevationFunction = elevationFunction;
    this.doms = doms;

    doms.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      updateMarker(this, e);
      this.listeners.forEach((fn) => fn(canvasEventToGameCoords(e, this.mapSize, doms.canvas)));
    });
    doms.resetMarker.addEventListener("click", () => {
      updateMarker(this);
      this.listeners.forEach((fn) => fn(null));
    });
  }
}

function updateMarker(self: MarkerHandler, event: MouseEvent | null = null) {
  self.doms.xOutput.textContent = sendCoords(self.mapSize, self.doms.canvas, self.elevationFunction, event).x.toString();
  self.doms.zOutput.textContent = sendCoords(self.mapSize, self.doms.canvas, self.elevationFunction, event).z.toString();
  self.doms.yOutput.textContent = sendCoords(self.mapSize, self.doms.canvas, self.elevationFunction, event).y.toString();
}
