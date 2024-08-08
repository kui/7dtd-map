import { printError } from "./utils";

export type MessageMap<N extends string> = { [K in N]?: object };

export class Generator<N extends string, M extends MessageMap<N>> {
  #listeners: ((m: M) => unknown)[] = [];

  addListener(listener: (m: M) => unknown) {
    this.#listeners.push(listener);
  }

  removeListener(listener: (m: M) => unknown) {
    const index = this.#listeners.indexOf(listener);
    if (index >= 0) this.#listeners.splice(index, 1);
  }

  async emit(m: M) {
    await Promise.allSettled(this.#listeners.map((fn) => fn(m)));
  }

  emitNoAwait(m: M) {
    this.emit(m).catch(printError);
  }
}
