import { LabelHandler } from "../lib/label-handler.ts";
import { LANGUAGES } from "../lib/labels.ts";
import { expect } from "@std/expect";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";

// Minimal <option> + <select> fake for LabelHandler#buildSelectOptions and
// the change event flow. Only the members that LabelHandler reads/writes are
// implemented.
class FakeOption {
  // Mirrors HTMLOptionElement: when `value` is not set explicitly, it
  // defaults to textContent.
  #explicitValue: string | null = null;
  textContent: string = "";
  get value(): string {
    return this.#explicitValue ?? this.textContent;
  }
  set value(v: string) {
    this.#explicitValue = v;
  }
}
class FakeSelect extends EventTarget {
  options: FakeOption[] = [];
  #value: string = "";
  appendChild(option: FakeOption) {
    this.options.push(option);
    if (this.#value === "") this.#value = option.value;
    return option;
  }
  get value() {
    return this.#value;
  }
  set value(v: string) {
    this.#value = v;
  }
}

class FakeLocalStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  clear() {
    this.data.clear();
  }
  key() {
    return null;
  }
  get length() {
    return this.data.size;
  }
}

const G = globalThis as unknown as Record<string, unknown>;
let saved: Record<string, unknown> = {};
let storage: FakeLocalStorage;

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
function restoreGlobal(key: string, value: unknown) {
  if (value === null) {
    delete G[key];
  } else {
    Object.defineProperty(G, key, value as PropertyDescriptor);
  }
}

describe("LabelHandler", () => {
  beforeEach(() => {
    saved = {};
    storage = new FakeLocalStorage();
    setGlobal("localStorage", storage);
    // No DOM at runtime in deno test, so define a tiny document.createElement
    // that returns FakeOption for "option" — the only element LabelHandler
    // creates.
    setGlobal("document", {
      createElement: (tag: string) => {
        if (tag === "option") return new FakeOption();
        throw new Error(`Unexpected createElement: ${tag}`);
      },
    });
    // LabelHolder eagerly kicks off background fetches in its constructor.
    setGlobal("fetch", () =>
      Promise.resolve(
        new Response("{}", {
          headers: { "content-type": "application/json" },
        }),
      ));
  });
  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) restoreGlobal(k, v);
    saved = {};
  });

  it("populates the <select> with all supported languages", () => {
    const sel = new FakeSelect();
    new LabelHandler(
      { language: sel as unknown as HTMLSelectElement },
      "/labels",
      ["en"],
    );
    const values = sel.options.map((o) => o.value);
    for (const lang of LANGUAGES) {
      expect(values).toContain(lang);
    }
  });

  it("seeds the select value from navigator language when no localStorage entry", () => {
    const sel = new FakeSelect();
    const h = new LabelHandler(
      { language: sel as unknown as HTMLSelectElement },
      "/labels",
      ["ja"],
    );
    expect(h.language).toBe("japanese");
  });

  it("seeds the select value from localStorage when set", () => {
    storage.setItem("language", "french");
    const sel = new FakeSelect();
    const h = new LabelHandler(
      { language: sel as unknown as HTMLSelectElement },
      "/labels",
      ["en"],
    );
    expect(h.language).toBe("french");
  });

  it("does not fire the listener during construction", async () => {
    const sel = new FakeSelect();
    const h = new LabelHandler(
      { language: sel as unknown as HTMLSelectElement },
      "/labels",
      ["ja"],
    );
    const received: string[] = [];
    h.addListener((m) => {
      received.push(m.lang);
    });
    // Give any deferred work (microtasks, timers) a chance to run.
    await new Promise((r) => setTimeout(r, 0));
    expect(received).toEqual([]);
    // Initial value is still available via the pull-style getter.
    expect(h.language).toBe("japanese");
  });

  it("change event persists to localStorage and dispatches to listeners", async () => {
    const sel = new FakeSelect();
    const h = new LabelHandler(
      { language: sel as unknown as HTMLSelectElement },
      "/labels",
      ["en"],
    );
    const received: string[] = [];
    h.addListener((m) => {
      received.push(m.lang);
    });

    sel.value = "german";
    sel.dispatchEvent(new Event("change"));
    // The dispatchNoAwait path eventually runs the listeners; allow a turn.
    await new Promise((r) => setTimeout(r, 0));

    expect(storage.getItem("language")).toBe("german");
    expect(received).toContain("german");
  });
});
