import { printError } from "./utils.ts";

const DEFAULT_INITIAL_CHUNK_SIZE = 50;
const DEFAULT_CHUNK_SIZE = 50;

export interface DelayedRendererOptions {
  /** Items rendered synchronously when the iterator is assigned. */
  initialChunkSize?: number;
  /** Items rendered per deferred chunk after the initial chunk. */
  chunkSize?: number;
}

/**
 * Renders an iterable into an element while keeping the main thread responsive.
 *
 * The first chunk is rendered synchronously so the visible portion of the list
 * appears immediately. Remaining items are appended in chunks scheduled via
 * `setTimeout`, which yields to user input between chunks. Assigning a new
 * iterator aborts any in-flight deferred render and starts over, so bursty
 * updates (e.g. a filter input firing on every keystroke) only ever pay for
 * the first chunk plus the final completed render.
 */
export class DelayedRenderer<T> {
  #appendee: HTMLElement;
  #itemRenderer: (item: T) => Node;
  #initialChunkSize: number;
  #chunkSize: number;
  #abort: AbortController | null = null;

  constructor(
    appendee: HTMLElement,
    itemRenderer: (item: T) => Node,
    options: DelayedRendererOptions = {},
  ) {
    appendee.innerHTML = "";
    this.#appendee = appendee;
    this.#itemRenderer = itemRenderer;
    this.#initialChunkSize = options.initialChunkSize ??
      DEFAULT_INITIAL_CHUNK_SIZE;
    this.#chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  }

  set iterator(iteratorOrIterable: Iterator<T> | Iterable<T>) {
    this.#abort?.abort();
    const abort = new AbortController();
    this.#abort = abort;

    const iter: Iterator<T> = "next" in iteratorOrIterable
      ? iteratorOrIterable
      : iteratorOrIterable[Symbol.iterator]();

    this.#appendee.innerHTML = "";

    if (this.#renderChunk(iter, this.#initialChunkSize)) return;
    this.#renderRest(iter, abort.signal).catch(printError);
  }

  /** @returns true if the iterator was exhausted in this chunk. */
  #renderChunk(iter: Iterator<T>, size: number): boolean {
    const df = new DocumentFragment();
    for (let i = 0; i < size; i++) {
      const r = iter.next();
      if (r.done) {
        this.#appendee.appendChild(df);
        return true;
      }
      df.appendChild(this.#itemRenderer(r.value));
    }
    this.#appendee.appendChild(df);
    return false;
  }

  async #renderRest(iter: Iterator<T>, signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      await waitMacrotask();
      if (signal.aborted) return;
      if (this.#renderChunk(iter, this.#chunkSize)) return;
    }
  }
}

function waitMacrotask(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}
