import { printError, waitAnimationFrame } from "./utils";

export class DelayedRenderer<T> {
  #iterator: Iterator<T[]> = ([] as T[][])[Symbol.iterator]();
  #appendee: HTMLElement;
  #scrollableWrapper: HTMLElement;
  #itemRenderer: (item: T) => Node;
  #renderImmediatly: boolean;
  #scrollCallback = (): void => {
    this.renderAll().catch(printError);
  };

  constructor(scrollableWrapper: HTMLElement, appendee: HTMLElement, itemRenderer: (item: T) => Node, renderImmediatly = false) {
    if (!scrollableWrapper.contains(appendee)) throw Error("Wrapper element should contain appendee element");
    appendee.innerHTML = "";
    this.#appendee = appendee;
    this.#scrollableWrapper = scrollableWrapper;
    this.#itemRenderer = itemRenderer;
    this.#renderImmediatly = renderImmediatly;
  }

  set iterator(iteratorOrIterable: Iterator<T> | Iterable<T>) {
    if ("next" in iteratorOrIterable) {
      this.#iterator = chunkIterator(iteratorOrIterable);
    } else {
      this.#iterator = chunkIterator(iteratorOrIterable[Symbol.iterator]());
    }
    this.#appendee.innerHTML = "";
    this.#scrollableWrapper.removeEventListener("scroll", this.#scrollCallback);

    // Require a delay because flashing childlen like the above fires "scroll" events.
    requestAnimationFrame(() => {
      this.#scrollableWrapper.removeEventListener("scroll", this.#scrollCallback);
      if (this.#renderImmediatly) {
        this.renderAll().catch(printError);
      } else {
        this.#scrollableWrapper.addEventListener("scroll", this.#scrollCallback, { once: true });
        // TODO Prevent double rendering iterations
        this.#renderUntil(() => isFill(this.#scrollableWrapper)).catch(printError);
      }
    });
  }

  async renderAll(): Promise<void> {
    await this.#renderUntil(() => false);
  }

  async #renderUntil(stopPredicate: () => boolean) {
    do {
      const result = this.#iterator.next();
      if (isReturn(result)) break;
      const df = new DocumentFragment();
      result.value.forEach((i) => df.appendChild(this.#itemRenderer(i)));
      this.#appendee.appendChild(df);
      await waitAnimationFrame();
    } while (!stopPredicate());
  }
}

function isFill(wrapper: HTMLElement) {
  return wrapper.clientHeight + 100 < wrapper.scrollHeight;
}

function chunkIterator<T, TReturn, TNext>(origin: Iterator<T, TReturn, TNext>, chunkSize = 10) {
  let returnResult: IteratorReturnResult<TReturn> | null = null;
  const chunkIter: Iterator<T[], TReturn, TNext> = {
    next(...args: [] | [TNext]): IteratorResult<T[], TReturn> {
      if (returnResult) return returnResult;
      const chunk = Array<T>(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        const result = origin.next(...args);
        if (isReturn(result)) {
          returnResult = result;
        } else {
          chunk[i] = result.value;
        }
      }
      return {
        done: false,
        value: chunk,
      };
    },
  };
  if ("throw" in origin) {
    chunkIter.throw = (e?: unknown): IteratorResult<T[], TReturn> => {
      const r = (origin.throw as (e?: unknown) => IteratorResult<T, TReturn>)(e);
      if (isReturn(r)) return r;
      else return { done: r.done ?? false, value: [r.value] };
    };
  }
  if ("return" in origin) {
    chunkIter.return = (treturn?: TReturn): IteratorResult<T[], TReturn> => {
      const r = (origin.return as (treturn?: TReturn | undefined) => IteratorResult<T, TReturn>)(treturn);
      if (isReturn(r)) return r;
      else return { done: r.done ?? false, value: [r.value] };
    };
  }
  return chunkIter;
}

function isReturn<T, TReturn>(r: IteratorResult<T, TReturn>): r is IteratorReturnResult<TReturn> {
  return Boolean(r.done);
}
