import { printError, waitAnimationFrame } from "../lib/utils";
import { LoadingHandler } from "./loading-handler";

interface Doms {
  input: HTMLInputElement;
}

type Listener = (file: File) => unknown;

type ResourceLike = File | { name: string; url: string };

export class FileHandler {
  #listeners = new Map<RegExp | string, Listener[]>();
  #loadingHandler: LoadingHandler;

  constructor(doms: Doms, loadingHandler: LoadingHandler) {
    this.#loadingHandler = loadingHandler;
    doms.input.addEventListener("input", () => {
      if (doms.input.files) this.pushFiles(Array.from(doms.input.files));
    });
  }

  addListeners(arr: [RegExp | string, Listener | Listener[]][]): void {
    for (const [name, listener] of arr) this.addListener(name, listener);
  }

  addListener(fileName: RegExp | string, listener: Listener | Listener[]): void {
    const old = this.#listeners.get(fileName) ?? [];
    this.#listeners.set(fileName, old.concat(listener));
  }

  pushFiles(files: File[]): void {
    this.#process(files).catch(printError);
  }

  pushUrls(urls: string[]): void {
    this.#process(urls.map((url) => ({ name: basename(url), url }))).catch(printError);
  }

  async #process(resourceList: ResourceLike[]) {
    if (this.#loadingHandler.isLoading()) {
      throw new Error("Loading is in progress");
    }

    this.#loadingHandler.add(resourceList.map((f) => f.name));
    for (const resource of resourceList) {
      const listeners = this.#getListeners(resource.name);
      if (listeners.length === 0) {
        console.log("No hundler: ", resource.name);
      } else if (shouldSkip(resourceList, resource.name)) {
        console.log("Skip: ", resource.name);
      } else {
        console.time(`Processe: ${resource.name}`);
        const f = await resolveResource(resource);
        await Promise.all(listeners.map((fn) => fn(f)));
        console.timeEnd(`Processe: ${resource.name}`);
      }
      this.#loadingHandler.delete(resource.name);
      await waitAnimationFrame();
    }
  }

  #getListeners(fileName: string) {
    return Array.from(this.#listeners.entries()).flatMap(([pattern, listeners]) => {
      if (pattern instanceof RegExp && pattern.test(fileName)) return listeners;
      if (typeof pattern === "string" && pattern === fileName) return listeners;
      return [];
    });
  }
}

async function resolveResource(resource: ResourceLike): Promise<File> {
  if (resource instanceof File) return resource;
  const blob = await fetch(resource.url).then((res) => res.blob());
  return new File([blob], resource.name, { type: blob.type });
}

function basename(path: string) {
  return path.substring(path.lastIndexOf("/") + 1);
}

function shouldSkip(resources: ResourceLike[], targetName: string): boolean {
  if (targetName === "splat3.png") {
    return resources.some(({ name }) => name === "splat3_processed.png");
  }
  return false;
}
