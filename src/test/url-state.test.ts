// deno-lint-ignore-file no-non-null-assertion
import { UrlState } from "../lib/url-state.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

// Minimal stand-in for an HTMLInputElement; only implements the surface that
// UrlState touches: id, type, value/checked, addEventListener,
// dispatchEvent.
class FakeInput extends EventTarget {
  id: string;
  type: "text" | "checkbox" | "select-one";
  value: string;
  checked: boolean;
  constructor(
    id: string,
    type: "text" | "checkbox" | "select-one" = "text",
    initial: string | boolean = "",
  ) {
    super();
    this.id = id;
    this.type = type;
    if (type === "checkbox") {
      this.value = "on";
      this.checked = Boolean(initial);
    } else {
      this.value = String(initial);
      this.checked = false;
    }
  }
}

function fakeLocation(href: string): Location {
  return { href } as unknown as Location;
}

function build(href: string, inputs: FakeInput[]) {
  return UrlState.create(
    fakeLocation(href),
    inputs as unknown as HTMLInputElement[],
  );
}

describe("UrlState", () => {
  it("restores text input value from the initial query string", () => {
    const input = new FakeInput("filter", "text", "");
    build("http://x/p?filter=hello", [input]);
    expect(input.value).toBe("hello");
  });

  it("restores checkbox state from the initial query string", () => {
    const cb = new FakeInput("opt", "checkbox", false);
    build("http://x/p?opt=t", [cb]);
    expect(cb.checked).toBe(true);
  });

  it("dispatches both input and change events on text restore", () => {
    const input = new FakeInput("filter", "text", "");
    const seen: string[] = [];
    input.addEventListener("input", () => seen.push("input"));
    input.addEventListener("change", () => seen.push("change"));
    build("http://x/p?filter=hello", [input]);
    expect(seen).toEqual(["input", "change"]);
  });

  it("dispatches a change event on checkbox restore", () => {
    const cb = new FakeInput("opt", "checkbox", false);
    let changes = 0;
    cb.addEventListener("change", () => changes++);
    build("http://x/p?opt=t", [cb]);
    expect(changes).toBe(1);
  });

  it("dispatches a change event on select restore", () => {
    const sel = new FakeInput("mode", "select-one", "");
    let changes = 0;
    sel.addEventListener("change", () => changes++);
    build("http://x/p?mode=hard", [sel]);
    expect(sel.value).toBe("hard");
    expect(changes).toBe(1);
  });

  it("updates the URL when an input event fires", () => {
    const input = new FakeInput("filter", "text", "");
    const state = build("http://x/p", [input]);
    const seen: URL[] = [];
    state.addUpdateListener((u) => seen.push(new URL(u.toString())));

    input.value = "hello";
    input.dispatchEvent(new Event("input"));

    expect(seen.length).toBe(1);
    expect(seen[0].searchParams.get("filter")).toBe("hello");
  });

  it("updates the URL when a change event fires (checkbox)", () => {
    const cb = new FakeInput("opt", "checkbox", false);
    const state = build("http://x/p", [cb]);
    const seen: URL[] = [];
    state.addUpdateListener((u) => seen.push(new URL(u.toString())));

    cb.checked = true;
    cb.dispatchEvent(new Event("change"));

    expect(seen.length).toBe(1);
    expect(seen[0].searchParams.get("opt")).toBe("t");
  });

  it("removes the query param when the value returns to its default", () => {
    const input = new FakeInput("filter", "text", "");
    const state = build("http://x/p", [input]);
    const seen: URL[] = [];
    state.addUpdateListener((u) => seen.push(new URL(u.toString())));

    input.value = "hello";
    input.dispatchEvent(new Event("input"));
    expect(seen.at(-1)!.searchParams.has("filter")).toBe(true);

    input.value = "";
    input.dispatchEvent(new Event("input"));
    expect(seen.at(-1)!.searchParams.has("filter")).toBe(false);
  });

  it("does not re-notify listeners when the value did not change", () => {
    const input = new FakeInput("filter", "text", "");
    const state = build("http://x/p", [input]);
    let called = 0;
    state.addUpdateListener(() => {
      called++;
    });

    input.value = "hello";
    // Browsers fire input + change for the same edit; we should only notify
    // listeners once per distinct value.
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("change"));
    expect(called).toBe(1);

    // Same value again should not notify.
    input.dispatchEvent(new Event("input"));
    expect(called).toBe(1);
  });
});
