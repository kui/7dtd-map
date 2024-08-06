import { printError } from "./utils";

export type Message<N extends string> = { [K in N]: { type: K } }[N];

export class Generator<N extends string, M extends Message<N>> {
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
