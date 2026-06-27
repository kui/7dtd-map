import { printError } from "./utils.ts";
import { MultipleErrors } from "./errors.ts";

export type Listener<T> = (payload: T) => unknown;

export class ListenerManager<T> {
  #listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.#listeners.push(listener);
  }

  removeListener(listener: Listener<T>) {
    const index = this.#listeners.indexOf(listener);
    if (index >= 0) this.#listeners.splice(index, 1);
  }

  async dispatch(payload: T) {
    const results = await Promise.allSettled(
      this.#listeners.map((fn) =>
        new Promise<unknown>((resolve) => resolve(fn(payload)))
      ),
    );
    const errors = results.flatMap((
      r,
    ) => (r.status === "rejected" ? [r.reason as unknown] : []));
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) throw new MultipleErrors(errors);
  }

  dispatchNoAwait(payload: T) {
    this.dispatch(payload).catch(printError);
  }
}
