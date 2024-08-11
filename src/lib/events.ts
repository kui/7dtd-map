import { printError } from "./utils";
import { MultipleErrors } from "./errors";

export type MessageMap<N extends string> = { [K in N]?: object };
export type Listener<N extends string, M extends MessageMap<N>> = (m: M) => unknown;

export class ListenerManager<N extends string, M extends MessageMap<N>> {
  #listeners: Listener<N, M>[] = [];

  addListener(listener: Listener<N, M>) {
    this.#listeners.push(listener);
  }

  removeListener(listener: Listener<N, M>) {
    const index = this.#listeners.indexOf(listener);
    if (index >= 0) this.#listeners.splice(index, 1);
  }

  async dispatch(m: M) {
    const results = await Promise.allSettled(this.#listeners.map((fn) => fn(m)));
    const errors = results.flatMap((r) => (r.status === "rejected" ? [r.reason as unknown] : []));
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) throw new MultipleErrors(errors);
  }

  dispatchNoAwait(m: M) {
    this.dispatch(m).catch(printError);
  }
}
