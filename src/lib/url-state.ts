interface StateElement {
  defaultValue: string;
  element: HTMLInputElement;
}

// Store values of input elements in the URL query string.
export class UrlState {
  private url: URL;
  private inputs: Map<HTMLInputElement, StateElement>;
  private udpateListeners: ((url: URL) => void)[] = [];

  private constructor(browserUrl: URL, elements: ArrayLike<StateElement>) {
    this.url = browserUrl;
    this.inputs = new Map(Array.from(elements).map((e) => [e.element, e]));
    this.init();
  }

  private init() {
    for (const [input, { defaultValue }] of this.inputs.entries()) {
      if (this.url.searchParams.has(input.id)) {
        setValue(input, this.url.searchParams.get(input.id) ?? defaultValue);
        input.dispatchEvent(new Event("input"));
      }

      input.addEventListener("input", () => {
        this.updateUrl(input, defaultValue);
        this.udpateListeners.forEach((fn) => {
          fn(this.url);
        });
      });
    }
  }

  static create(location: Location, elements: ArrayLike<HTMLInputElement>): UrlState {
    return new UrlState(
      new URL(location.href),
      Array.from(elements).map((e) => ({ defaultValue: getValue(e), element: e }))
    );
  }

  private updateUrl(input: HTMLInputElement, defaultValue: string) {
    const value = getValue(input);
    if (value === defaultValue) {
      this.url.searchParams.delete(input.id);
    } else {
      this.url.searchParams.set(input.id, value);
    }
  }

  addUpdateListener(listener: (url: URL) => void) {
    this.udpateListeners.push(listener);
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
