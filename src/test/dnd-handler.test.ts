import { createDragCounter } from "../index/dnd-handler.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("createDragCounter", () => {
  it("returns true on the first enter and matching final leave", () => {
    const c = createDragCounter();
    expect(c.enter()).toBe(true);
    expect(c.leave()).toBe(true);
  });

  it("does not signal open/close on nested boundary crossings", () => {
    const c = createDragCounter();
    expect(c.enter()).toBe(true);
    expect(c.enter()).toBe(false);
    expect(c.enter()).toBe(false);
    expect(c.leave()).toBe(false);
    expect(c.leave()).toBe(false);
    expect(c.leave()).toBe(true);
  });

  it("clamps to zero so spurious extra leaves do not go negative", () => {
    const c = createDragCounter();
    c.enter();
    expect(c.leave()).toBe(true);
    // WHY: browsers can fire an extra dragleave after drop; the counter must stay clamped at zero and still report "out".
    expect(c.leave()).toBe(true);
    expect(c.enter()).toBe(true);
  });

  it("reset() returns the counter to the idle state", () => {
    const c = createDragCounter();
    c.enter();
    c.enter();
    c.reset();
    expect(c.enter()).toBe(true);
  });
});
