import { FileProgressionIndicator } from "../index/dialog-handler.ts";
import { expect } from "@std/expect";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";

/**
 * Minimal fakes for FileProgressionIndicator. The class only touches
 * `textContent` and `classList.{add,contains,replace}`, so this thin
 * stand-in is enough to exercise the map-based lookup without pulling
 * in a DOM.
 */
class FakeClassList {
  #set = new Set<string>();
  add(c: string) {
    this.#set.add(c);
  }
  contains(c: string) {
    return this.#set.has(c);
  }
  replace(from: string, to: string) {
    if (!this.#set.has(from)) return false;
    this.#set.delete(from);
    this.#set.add(to);
    return true;
  }
}
class FakeLi {
  textContent = "";
  classList = new FakeClassList();
}

let savedDocument: PropertyDescriptor | undefined;

describe("FileProgressionIndicator", () => {
  beforeEach(() => {
    savedDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
    Object.defineProperty(globalThis, "document", {
      value: { createElement: (_tag: string) => new FakeLi() },
      configurable: true,
      writable: true,
    });
  });
  afterEach(() => {
    if (savedDocument) {
      Object.defineProperty(globalThis, "document", savedDocument);
    } else delete (globalThis as { document?: unknown }).document;
  });

  it("creates one <li> per task name in order", () => {
    const ind = new FileProgressionIndicator(["a", "b", "c"]);
    expect(ind.liList.length).toBe(3);
    expect(ind.liList.every((li) => li.classList.contains("processing"))).toBe(
      true,
    );
  });

  it("setState flips the matching <li> from processing to the new state", () => {
    const ind = new FileProgressionIndicator(["a", "b"]);
    ind.setState("a", "completed");
    expect(ind.liList[0].classList.contains("completed")).toBe(true);
    expect(ind.liList[0].classList.contains("processing")).toBe(false);
    expect(ind.liList[1].classList.contains("processing")).toBe(true);
  });

  it("isAllCompleted is true only once every <li> reaches a terminated state", () => {
    const ind = new FileProgressionIndicator(["a", "b"]);
    expect(ind.isAllCompleted).toBe(false);
    ind.setState("a", "completed");
    expect(ind.isAllCompleted).toBe(false);
    ind.setState("b", "skipped");
    expect(ind.isAllCompleted).toBe(true);
  });

  it("duplicate task names still render both <li>s without colliding in the lookup", () => {
    const ind = new FileProgressionIndicator(["dup", "dup", "unique"]);
    expect(ind.liList.length).toBe(3);
    ind.setState("dup", "completed");
    expect(ind.liList[0].classList.contains("completed")).toBe(true);
    expect(ind.liList[1].classList.contains("processing")).toBe(true);
    ind.setState("unique", "completed");
    expect(ind.liList[2].classList.contains("completed")).toBe(true);
  });

  it("setState on an unknown name is a no-op", () => {
    const ind = new FileProgressionIndicator(["a"]);
    ind.setState("missing", "completed");
    expect(ind.liList[0].classList.contains("processing")).toBe(true);
  });
});
