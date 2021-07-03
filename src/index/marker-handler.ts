import { formatCoords } from "../lib/utils";

interface Doms {
  canvas: HTMLCanvasElement;
  output: HTMLElement;
  resetMarker: HTMLButtonElement;
}

export class MarkerHandler {
  mapSize: RectSize = { width: 0, height: 0 };
  elevationFunction: (coods: Coords, width: number) => number | null;
  doms: Doms;
  listeners: ((c: Coords | null) => Promise<void>)[] = [];

  constructor(doms: Doms, elevationFunction: (coords: Coords, width: number) => number | null) {
    this.elevationFunction = elevationFunction;
    this.doms = doms;

    doms.canvas.addEventListener("click", (e) => {
      updateMarker(this, e);
      const markCoords = {
        x: Math.round((e.offsetX * this.mapSize.width) / doms.canvas.width - this.mapSize.width / 2),
        z: -Math.round((e.offsetY * this.mapSize.height) / doms.canvas.height - this.mapSize.height / 2),
      };
      this.listeners.forEach((fn) => fn(markCoords));
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
