import { DelayedRenderer } from "../lib/delayed-renderer.ts";
import { expect } from "@std/expect";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";

// DelayedRenderer expects DOM-shaped objects. Deno's test runtime has no DOM
// so we provide just the surface that DelayedRenderer touches: clientHeight,
// scrollHeight, innerHTML, appendChild, removeEventListener,
// addEventListener, contains. The actual layout numbers are controlled by
// each test so we can drive the "is the wrapper full?" predicate.

interface FakeNode {
  __id?: string;
}

class FakeElement {
  children: FakeNode[] = [];
  innerHTML = "";
  clientHeight = 100;
  scrollHeight = 100;
  appendChild(node: FakeNode | FakeFragment): FakeNode | FakeFragment {
    if (node instanceof FakeFragment) {
      this.children.push(...node.children);
      node.children = [];
    } else {
      this.children.push(node);
    }
    return node;
  }
  contains(_other: FakeElement): boolean {
    return true;
  }
  addEventListener() {/* no-op */}
  removeEventListener() {/* no-op */}
}
class FakeFragment {
  children: FakeNode[] = [];
  appendChild(n: FakeNode) {
    this.children.push(n);
    return n;
  }
}

const G = globalThis as unknown as Record<string, unknown>;
let saved: Record<string, PropertyDescriptor | null> = {};
function setGlobal(key: string, value: unknown) {
  const desc = Object.getOwnPropertyDescriptor(G, key);
  saved[key] = desc ?? null;
  Object.defineProperty(G, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}
function restoreAll() {
  for (const [k, v] of Object.entries(saved)) {
    if (v === null) delete G[k];
    else Object.defineProperty(G, k, v);
  }
  saved = {};
}

describe("DelayedRenderer", () => {
  beforeEach(() => {
    saved = {};
    // requestAnimationFrame runs callbacks on a microtask so tests can `await`
    // a turn to flush rendering.
    setGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      queueMicrotask(() => cb(0));
      return 0;
    });
    setGlobal(
      "DocumentFragment",
      FakeFragment as unknown as typeof DocumentFragment,
    );
  });
  afterEach(() => {
    restoreAll();
  });

  async function flush() {
    // Two turns: one for the initial RAF, more for any in-progress
    // renderUntil iterations.
    for (let i = 0; i < 100; i++) {
      await new Promise((r) => queueMicrotask(() => r(null)));
    }
  }

  it("renders all items when renderImmediatly is true", async () => {
    const wrapper = new FakeElement();
    const appendee = new FakeElement();
    const items = Array.from({ length: 25 }, (_, i) => i);
    const renderer = new DelayedRenderer<number>(
      wrapper as unknown as HTMLElement,
      appendee as unknown as HTMLElement,
      (i) => ({ __id: String(i) }) as unknown as Node,
      true,
    );
    renderer.iterator = items[Symbol.iterator]();
    await flush();
    expect(appendee.children.length).toBe(items.length);
  });

  it("handles an empty iterator without error", async () => {
    const wrapper = new FakeElement();
    const appendee = new FakeElement();
    const renderer = new DelayedRenderer<number>(
      wrapper as unknown as HTMLElement,
      appendee as unknown as HTMLElement,
      (i) => ({ __id: String(i) }) as unknown as Node,
      true,
    );
    renderer.iterator = ([] as number[])[Symbol.iterator]();
    await flush();
    expect(appendee.children.length).toBe(0);
  });

  it("stops at chunk boundary when the wrapper is already filled", async () => {
    const wrapper = new FakeElement();
    // isFill(wrapper) = clientHeight + 100 < scrollHeight. Set up so it's
    // ALWAYS full — renderUntil should stop after the first chunk (size 10).
    wrapper.clientHeight = 50;
    wrapper.scrollHeight = 1000;
    const appendee = new FakeElement();
    const items = Array.from({ length: 100 }, (_, i) => i);
    const renderer = new DelayedRenderer<number>(
      wrapper as unknown as HTMLElement,
      appendee as unknown as HTMLElement,
      (i) => ({ __id: String(i) }) as unknown as Node,
      false,
    );
    renderer.iterator = items[Symbol.iterator]();
    await flush();
    // Default chunk size is 10. The first chunk is rendered before the
    // predicate is checked, so we expect exactly one chunk.
    expect(appendee.children.length).toBe(10);
  });

  it("renderAll() completes a partially rendered list", async () => {
    const wrapper = new FakeElement();
    wrapper.clientHeight = 50;
    wrapper.scrollHeight = 1000;
    const appendee = new FakeElement();
    const items = Array.from({ length: 25 }, (_, i) => i);
    const renderer = new DelayedRenderer<number>(
      wrapper as unknown as HTMLElement,
      appendee as unknown as HTMLElement,
      (i) => ({ __id: String(i) }) as unknown as Node,
      false,
    );
    renderer.iterator = items[Symbol.iterator]();
    await flush();
    expect(appendee.children.length).toBe(10);
    await renderer.renderAll();
    expect(appendee.children.length).toBe(items.length);
  });
});
