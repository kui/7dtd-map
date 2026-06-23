import { DelayedRenderer } from "../lib/delayed-renderer.ts";
import { expect } from "@std/expect";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { FakeTime } from "@std/testing/time";

// DelayedRenderer touches only a small slice of the DOM surface: innerHTML
// (used to clear the container), appendChild for both elements and
// DocumentFragment, and the DocumentFragment constructor.

interface FakeNode {
  __id?: string;
}

class FakeFragment {
  children: FakeNode[] = [];
  appendChild(n: FakeNode) {
    this.children.push(n);
    return n;
  }
}

class FakeElement {
  children: FakeNode[] = [];
  #innerHTML = "";
  get innerHTML(): string {
    return this.#innerHTML;
  }
  set innerHTML(v: string) {
    this.#innerHTML = v;
    if (v === "") this.children = [];
  }
  appendChild(node: FakeNode | FakeFragment): FakeNode | FakeFragment {
    if (node instanceof FakeFragment) {
      this.children.push(...node.children);
      node.children = [];
    } else {
      this.children.push(node);
    }
    return node;
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
  let time: FakeTime;
  // Run scheduled timers until none remain, letting each chunk's microtask
  // continuation schedule the next chunk before we look for more timers.
  async function drain() {
    await time.runAllAsync();
  }

  beforeEach(() => {
    saved = {};
    setGlobal(
      "DocumentFragment",
      FakeFragment as unknown as typeof DocumentFragment,
    );
    time = new FakeTime();
  });
  afterEach(() => {
    time.restore();
    restoreAll();
  });

  const render = (i: number): Node => ({ __id: String(i) }) as unknown as Node;

  it("renders the initial chunk synchronously", () => {
    const appendee = new FakeElement();
    const renderer = new DelayedRenderer<number>(
      appendee as unknown as HTMLElement,
      render,
      { initialChunkSize: 5, chunkSize: 5 },
    );
    renderer.iterator = Array.from({ length: 20 }, (_, i) => i)
      [Symbol.iterator]();
    // No `await` — the first chunk must already be in the DOM.
    expect(appendee.children.length).toBe(5);
  });

  it("renders all items eventually", async () => {
    const appendee = new FakeElement();
    const items = Array.from({ length: 23 }, (_, i) => i);
    const renderer = new DelayedRenderer<number>(
      appendee as unknown as HTMLElement,
      render,
      { initialChunkSize: 5, chunkSize: 5 },
    );
    renderer.iterator = items[Symbol.iterator]();
    await drain();
    expect(appendee.children.length).toBe(items.length);
  });

  it("handles an empty iterator without error", async () => {
    const appendee = new FakeElement();
    const renderer = new DelayedRenderer<number>(
      appendee as unknown as HTMLElement,
      render,
    );
    renderer.iterator = ([] as number[])[Symbol.iterator]();
    await drain();
    expect(appendee.children.length).toBe(0);
  });

  it("accepts an iterable in addition to an iterator", async () => {
    const appendee = new FakeElement();
    const renderer = new DelayedRenderer<number>(
      appendee as unknown as HTMLElement,
      render,
      { initialChunkSize: 3, chunkSize: 3 },
    );
    renderer.iterator = [0, 1, 2, 3, 4, 5, 6];
    await drain();
    expect(appendee.children.length).toBe(7);
  });

  it("does not call iterator.next() again after it returns done", async () => {
    const appendee = new FakeElement();
    const items = [0, 1, 2, 3, 4];
    const origin = items[Symbol.iterator]();
    let calls = 0;
    const spy: Iterator<number> = {
      next() {
        calls++;
        return origin.next();
      },
    };
    const renderer = new DelayedRenderer<number>(
      appendee as unknown as HTMLElement,
      render,
      { initialChunkSize: 10, chunkSize: 10 },
    );
    renderer.iterator = spy;
    await drain();
    expect(appendee.children.length).toBe(items.length);
    // items.length successful pulls plus a single terminating done pull.
    expect(calls).toBe(items.length + 1);
  });

  it("aborts the deferred render when a new iterator is assigned", async () => {
    const appendee = new FakeElement();
    const items1 = Array.from({ length: 100 }, (_, i) => i);
    let pulls1 = 0;
    const origin1 = items1[Symbol.iterator]();
    const iter1: Iterator<number> = {
      next() {
        pulls1++;
        return origin1.next();
      },
    };
    const renderer = new DelayedRenderer<number>(
      appendee as unknown as HTMLElement,
      render,
      { initialChunkSize: 5, chunkSize: 5 },
    );
    renderer.iterator = iter1;
    // First chunk drained synchronously; deferred loop is parked on setTimeout.
    const pullsAfterFirstChunk = pulls1;
    expect(appendee.children.length).toBe(5);

    // Swap before the deferred loop resumes.
    renderer.iterator = [100, 101, 102][Symbol.iterator]();
    await drain();

    // The old iterator must not be pulled past what the initial chunk consumed.
    expect(pulls1).toBe(pullsAfterFirstChunk);
    // Final state reflects the new iterator only.
    expect(appendee.children.length).toBe(3);
    expect((appendee.children[0] as { __id: string }).__id).toBe("100");
  });
});
