import { printError } from "./utils";

type MessageMap<N extends string> = {
  [K in N]: { name: K };
};

export class Generator<N extends string, M extends MessageMap<N>> {
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
