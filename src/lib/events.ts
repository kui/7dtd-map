import { printError } from "./utils";

interface Message<N extends string> {
  type: N;
}

export class Generator<N extends string, M extends Message<N>> {
  #listeners: ((m: M) => unknown)[] = [];

  addListener(listener: (m: M) => unknown) {
    this.#listeners.push(listener);
  }

  async emit(m: M) {
    await Promise.allSettled(this.#listeners.map((fn) => fn(m)));
  }

  emitNoAwait(m: M) {
    this.emit(m).catch(printError);
  }
}
