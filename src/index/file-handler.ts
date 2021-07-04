import throttledInvoker from "../lib/throttled-invoker";
import { waitAnimationFrame } from "../lib/utils";

interface Doms {
  indicator: HTMLElement;
  input: HTMLInputElement;
}

type Listener = (file: File) => Promise<unknown> | unknown;

export class FileHandler {
  private doms: Doms;
  private listeners: Map<RegExp | string, Listener[]> = new Map();

  constructor(doms: Doms) {
    this.doms = doms;

    const throttledProcess = throttledInvoker(() => this.processFiles());
    doms.input.addEventListener("input", throttledProcess);
  }

  addListeners(arr: [RegExp | string, Listener | Listener[]][]): void {
    arr.forEach(([n, ln]) => this.addListener(n, ln));
  }

  addListener(fileName: RegExp | string, listener: Listener | Listener[]): void {
    const old = this.listeners.get(fileName) ?? [];
    this.listeners.set(fileName, old.concat(listener));
  }

  pushFiles(files: File[]): void {
    const filtered = files.filter((file) => this.getListeners(file.name).length !== 0);
    this.updateFiles([...Array.from(this.doms.input.files ?? []), ...filtered]);
    this.doms.input.dispatchEvent(new Event("input"));
  }

  private async processFiles() {
    let file = this.popFile();
    while (file instanceof File) {
      const listeners = this.getListeners(file.name);
      if (listeners.length === 0) {
        console.log("No hundler: ", file);
      } else if (this.shouldSkip(file)) {
        console.log("Skip: ", file);
      } else {
        console.time(`Processed: ${file.name}`);
        await Promise.all(listeners.map(async (fn) => fn(file as File)));
        console.timeEnd(`Processed: ${file.name}`);
      }
      await waitAnimationFrame();
      file = this.popFile();
    }
  }

  private getListeners(fileName: string) {
    return Array.from(this.listeners.entries()).flatMap(([pattern, listeners]) => {
      if (pattern instanceof RegExp && pattern.test(fileName)) return listeners;
      if (typeof pattern === "string" && pattern === fileName) return listeners;
      return [];
    });
  }

  private updateIndicator() {
    const names = Array.from(this.doms.input.files ?? []).map((f) => f.name);
    console.log("Update indicator", names);
    if (names.length === 0) {
      this.doms.indicator.textContent = `-`;
    } else {
      this.doms.indicator.textContent = `Loading: ${names.join(", ")}`;
    }
  }

  private popFile(): File | null {
    this.updateIndicator();
    if (!this.doms.input.files?.length) return null;
    const files = Array.from(this.doms.input.files);
    this.updateFiles(files.slice(1));
    return files[0];
  }

  private shouldSkip(file: File): boolean {
    if (file.name === "splat3.png") {
      return Array.from(this.doms.input.files ?? [])
        .map((f) => f.name)
        .includes("splat3_processed.png");
    }
    return false;
  }

  private updateFiles(files: File[]) {
    this.doms.input.files = dataTransfer(files).files;
  }
}

function dataTransfer(files: File[]): DataTransfer {
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  return dt;
}
