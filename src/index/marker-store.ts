import type { GameCoords } from "../types/7dtdmap.ts";
import * as events from "../lib/events.ts";

interface EventMessage {
  coords: GameCoords | null;
}

// Domain state for the map's flag marker. Kept DOM-free so both the 2D canvas
// input adapter (MarkerHandler) and other input sources (e.g. the terrain
// viewer's raycast) can drive the same broadcast.
export class MarkerStore {
  #coords: GameCoords | null = null;
  #listeners = new events.ListenerManager<EventMessage>();

  get coords(): GameCoords | null {
    return this.#coords;
  }

  async set(coords: GameCoords | null): Promise<void> {
    this.#coords = coords;
    await this.#listeners.dispatch({ coords });
  }

  addListener(fn: (m: EventMessage) => unknown): void {
    this.#listeners.addListener(fn);
  }
}
