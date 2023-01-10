"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayedRenderer = void 0;
const utils_1 = require("./utils");
class DelayedRenderer {
  constructor(scrollableWrapper, appendee, itemRenderer) {
    this._iterator = [][Symbol.iterator]();
    this.scrollCallback = () => {
      this.renderAll();
    };
    if (!scrollableWrapper.contains(appendee)) throw Error("Wrapper element should contain appendee element");
    appendee.innerHTML = "";
    this.appendee = appendee;
    this.scrollableWrapper = scrollableWrapper;
    this.itemRenderer = itemRenderer;
  }
  set iterator(iteratorOrIterable) {
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
      renderUntil(this, () => isFill(this.scrollableWrapper));
    });
  }
  async renderAll() {
    await renderUntil(this, () => false);
  }
}
exports.DelayedRenderer = DelayedRenderer;
async function renderUntil(self, stopPredicate) {
  while (!stopPredicate()) {
    const result = self._iterator.next();
    if (isReturn(result)) break;
    const df = new DocumentFragment();
    result.value.forEach((i) => df.appendChild(self.itemRenderer(i)));
    self.appendee.appendChild(df);
    await (0, utils_1.waitAnimationFrame)();
  }
}
function isFill(wrapper) {
  return wrapper.offsetHeight + 100 < wrapper.scrollHeight;
}
function chunkIterator(origin, chunkSize = 10) {
  let returnResult = null;
  const chunkIter = {
    next(...args) {
      if (returnResult) return returnResult;
      const chunk = Array(chunkSize);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chunkIter.throw = (e) => {
      const r = (0, utils_1.requireNonnull)(origin.throw)(e);
      if (isReturn(r)) return r;
      else return { done: r.done, value: [r.value] };
    };
  }
  if ("return" in origin) {
    chunkIter.return = (treturn) => {
      const r = (0, utils_1.requireNonnull)(origin.return)(treturn);
      if (isReturn(r)) return r;
      else return { done: r.done, value: [r.value] };
    };
  }
  return chunkIter;
}
function isReturn(r) {
  return Boolean(r.done);
}
//# sourceMappingURL=delayed-renderer.js.map
