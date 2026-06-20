interface StateElement {
  defaultValue: string;
  element: HTMLInputElement;
}

// Store values of input elements in the URL query string.
export class UrlState {
  #url: URL;
  #inputs: Map<HTMLInputElement, StateElement>;
  #lastValues: Map<HTMLInputElement, string> = new Map();
  #updateListeners: ((url: URL) => void)[] = [];

  private constructor(browserUrl: URL, elements: ArrayLike<StateElement>) {
    this.#url = browserUrl;
    this.#inputs = new Map(Array.from(elements).map((e) => [e.element, e]));
    this.#init();
  }

  #init() {
    for (const [input, { defaultValue }] of this.#inputs.entries()) {
      if (this.#url.searchParams.has(input.id)) {
        setValue(input, this.#url.searchParams.get(input.id) ?? defaultValue);
        // Dispatch both events so listeners that subscribe to either one
        // observe the restored value. Both are bubbling to match how
        // browsers fire native user-driven events.
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      this.#lastValues.set(input, getValue(input));

      const handler = () => {
        const value = getValue(input);
        if (this.#lastValues.get(input) === value) return;
        this.#lastValues.set(input, value);
        this.#updateUrl(input, defaultValue);
        this.#updateListeners.forEach((fn) => {
          fn(this.#url);
        });
      };
      // Subscribe to both events so we catch text-style typing (input) and
      // checkbox/radio/select toggles (change). The value-equality guard
      // above prevents the duplicate dispatch from causing double updates.
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    }
  }

  static create(
    location: Location,
    elements: ArrayLike<HTMLInputElement>,
  ): UrlState {
    return new UrlState(
      new URL(location.href),
      Array.from(elements).map((e) => ({
        defaultValue: getValue(e),
        element: e,
      })),
    );
  }

  #updateUrl(input: HTMLInputElement, defaultValue: string) {
    const value = getValue(input);
    if (value === defaultValue) {
      this.#url.searchParams.delete(input.id);
    } else {
      this.#url.searchParams.set(input.id, value);
    }
  }

  addUpdateListener(listener: (url: URL) => void) {
    this.#updateListeners.push(listener);
  }
}

function getValue(input: HTMLInputElement): string {
  switch (input.type) {
    case "checkbox":
      return input.checked ? "t" : "";
    default:
      return input.value;
  }
}

function setValue(input: HTMLInputElement, value: string) {
  switch (input.type) {
    case "checkbox":
      input.checked = value === "t";
      break;
    default:
      input.value = value;
  }
}
