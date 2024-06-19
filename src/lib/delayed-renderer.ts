import { printError, waitAnimationFrame } from "./utils";

export class DelayedRenderer<T> {
  _iterator: Iterator<T[]> = ([] as T[][])[Symbol.iterator]();
  appendee: HTMLElement;
  scrollableWrapper: HTMLElement;
  itemRenderer: (item: T) => Node;
  scrollCallback = (): void => {
    this.renderAll().catch(printError);
  };

  constructor(scrollableWrapper: HTMLElement, appendee: HTMLElement, itemRenderer: (item: T) => Node) {
    if (!scrollableWrapper.contains(appendee)) throw Error("Wrapper element should contain appendee element");
    appendee.innerHTML = "";
    this.appendee = appendee;
    this.scrollableWrapper = scrollableWrapper;
    this.itemRenderer = itemRenderer;
  }

  set iterator(iteratorOrIterable: Iterator<T> | Iterable<T>) {
    if ("next" in iteratorOrIterable) {
      this._iterator = chunkIterator(iteratorOrIterable);
    } else {
      this._iterator = chunkIterator(iteratorOrIterable[Symbol.iterator]());
    }
    this.appendee.innerHTML = "";
    this.scrollableWrapper.removeEventListener("scroll", this.scrollCallback);

    // Require a delay because flashing childlen like the above fires "scroll" events.
    requestAnimationFrame(() => {
      this.scrollableWrapper.removeEventListener("scroll", this.scrollCallback);
      this.scrollableWrapper.addEventListener("scroll", this.scrollCallback, { once: true });
      renderUntil(this, () => isFill(this.scrollableWrapper)).catch(printError);
    });
  }

  async renderAll(): Promise<void> {
    await renderUntil(this, () => false);
  }
}

async function renderUntil<T>(self: DelayedRenderer<T>, stopPredicate: () => boolean) {
  while (!stopPredicate()) {
    const result = self._iterator.next();
    if (isReturn(result)) break;
    const df = new DocumentFragment();
    result.value.forEach((i) => df.appendChild(self.itemRenderer(i)));
    self.appendee.appendChild(df);
    await waitAnimationFrame();
  }
}

function isFill(wrapper: HTMLElement) {
  return wrapper.offsetHeight + 100 < wrapper.scrollHeight;
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
