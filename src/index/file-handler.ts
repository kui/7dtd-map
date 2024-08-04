import type { LoadingHandler } from "./loading-handler";
import type { DndHandler } from "./dnd-handler";
import { BundledMapHandler } from "./bundled-map-hander";

import { basename, printError } from "../lib/utils";
import * as storage from "../lib/storage";
import * as fileProcessor from "../worker/file-processor";
import { getPreferWorldFileName, hasPreferWorldFileNameIn, isMapFileName, MAP_FILE_NAMES, MapFileName } from "../../lib/map-files";

type Listener = (updatedFileNames: MapFileName[]) => unknown;

/**
 * File names that cannot be decide whether or not be already processed by its name.
 * In other words, this names are intersected with `storage.MapFileName` and `fileProcessor.AcceptableFileName`.
 */
type StateRequiredMapFileName = Extract<MapFileName, fileProcessor.AcceptableFileName>;

/** map file names that are not required to be processed */
type NeverProcessRequiredMapFileName = Exclude<MapFileName, fileProcessor.AcceptableFileName>;

/** File names that are required to be processed and not included in world file names */
type AlwaysProcessRequiredFileName = Exclude<fileProcessor.AcceptableFileName, MapFileName>;

type ResourceLike =
  | { name: MapFileName; remove: true }
  | { name: StateRequiredMapFileName; blob: Blob; alreadyProcessed: boolean }
  | { name: StateRequiredMapFileName; url: string; alreadyProcessed: boolean }
  | { name: NeverProcessRequiredMapFileName; blob: Blob }
  | { name: NeverProcessRequiredMapFileName; url: string }
  | { name: AlwaysProcessRequiredFileName; blob: Blob }
  | { name: AlwaysProcessRequiredFileName; url: string };

export interface ImageProcessorWorker extends Worker {
  postMessage(message: fileProcessor.InMessage): void;
  onmessage: (event: MessageEvent<fileProcessor.OutMessage>) => unknown;
}

interface Doms {
  files: HTMLInputElement;
  clearMap: HTMLButtonElement;
  mapName: HTMLInputElement;
}

export class FileHandler {
  #listeners: Listener[] = [];
  #loadingHandler: LoadingHandler;
  #processorFactory: () => ImageProcessorWorker;
  #workspace = storage.workspaceDir();

  constructor(
    doms: Doms,
    loadingHandler: LoadingHandler,
    processorFactory: () => ImageProcessorWorker,
    dndHandler: DndHandler,
    bundledMapHandler: BundledMapHandler,
  ) {
    this.#loadingHandler = loadingHandler;
    this.#processorFactory = processorFactory;

    doms.files.addEventListener("change", () => {
      if (doms.files.files) this.#pushFiles(Array.from(doms.files.files)).catch(printError);
    });
    doms.clearMap.addEventListener("click", () => {
      this.#clear().catch(printError);
    });
    dndHandler.addListener(({ files }) => this.#pushFiles(files));
    bundledMapHandler.addListener(async ({ mapName, mapDir }) => {
      doms.mapName.value = mapName;
      doms.mapName.dispatchEvent(new Event("input", { bubbles: true }));
      await this.#pushUrls(
        Array.from(MAP_FILE_NAMES).map((name) => `${mapDir}/${name}`),
        // Bundled world files are preprocessed. See tools/copy-map-files.ts
        true,
      );
    });
  }

  async initialize() {
    await this.#invokeListeners(Array.from(MAP_FILE_NAMES));
  }

  addListener(listener: Listener): void {
    this.#listeners.push(listener);
  }

  async #pushFiles(files: File[], alreadyProcessed = false) {
    await this.#process(
      files.flatMap((file) => {
        const name = file.name;
        if (isStateRequiredMapFile(name)) {
          return { name, blob: file, alreadyProcessed };
        } else if (isNeverProcessRequiredMapFile(name)) {
          return { name, blob: file };
        } else if (isAlwaysProcessRequiredFile(name)) {
          if (alreadyProcessed) throw new Error(`This file must be processed in advance: ${name}`);
          return { name, blob: file };
        } else {
          console.warn("Ignore file: name=", name, "alreadyProcessed=", alreadyProcessed);
          return [];
        }
      }),
    );
  }

  async #pushUrls(urls: string[], alreadyProcessed = false) {
    await this.#process(
      urls.flatMap((url) => {
        const name = basename(url);
        if (isStateRequiredMapFile(name)) {
          return { name, url, alreadyProcessed };
        } else if (isNeverProcessRequiredMapFile(name)) {
          return { name, url };
        } else if (isAlwaysProcessRequiredFile(name)) {
          if (alreadyProcessed) throw new Error(`This file must be processed in advance: ${name}`);
          return { name, url };
        } else {
          console.log("Ignore file: name=", name, "alreadyProcessed=", alreadyProcessed);
          return [];
        }
      }),
    );
  }

  async #clear() {
    await this.#process(Array.from(MAP_FILE_NAMES).map((name) => ({ name, remove: true })));
  }

  async #process(resourceList: ResourceLike[]) {
    if (this.#loadingHandler.isLoading()) {
      throw new Error("Loading is in progress");
    }
    this.#loadingHandler.add(resourceList.map(({ name }) => name));

    const workspace = await this.#workspace;
    const resourceNames = resourceList.map(({ name }) => name);
    const processedNames: MapFileName[] = [];

    // TODO parallelize
    for (const resource of resourceList) {
      if (hasPreferWorldFileNameIn(resource.name, resourceNames)) {
        console.log("Skip ", resource.name, " because ", getPreferWorldFileName(resource.name), " is already in the list");
        this.#loadingHandler.delete(resource.name);
        continue;
      }

      if ("remove" in resource) {
        console.log("Remove", resource.name);
        processedNames.push(resource.name);
        await workspace.remove(resource.name);
      } else if (isNeverProcessRequiredResource(resource) || (isStateRequiredResource(resource) && resource.alreadyProcessed)) {
        console.log("Copy", resource.name);
        processedNames.push(resource.name);
        if ("blob" in resource) {
          await workspace.put(resource.name, resource.blob);
        } else {
          const response = await fetch(resource.url);
          if (!response.ok) throw new Error(`Failed to fetch ${resource.url}: ${response.statusText}`);
          await workspace.put(resource.name, await response.blob());
        }
      } else if (isAlwaysProcessRequiredResource(resource) || (isStateRequiredResource(resource) && !resource.alreadyProcessed)) {
        console.log("Process", resource.name);
        console.time(`Process ${resource.name}`);
        const result = await this.#processInWorker(resource);
        console.timeEnd(`Process ${resource.name}`);
        console.log("Processed", result.name, "size=", result.size);
        processedNames.push(result.name);
      } else {
        throw new Error(`Unexpected resource: ${resource.name}`);
      }
      this.#loadingHandler.delete(resource.name);
    }

    if (processedNames.length > 0) await this.#invokeListeners(processedNames);
  }

  async #processInWorker(message: fileProcessor.InMessage): Promise<fileProcessor.SuccessOutMessage> {
    const worker = this.#processorFactory();
    return new Promise((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        worker.terminate();
        if ("error" in data) {
          reject(new Error(data.error));
        } else {
          resolve(data);
        }
      };
      worker.postMessage(message);
    });
  }

  async #invokeListeners(updatedFileNames: MapFileName[]) {
    await Promise.allSettled(this.#listeners.map((fn) => fn(updatedFileNames)));
  }
}

function isProcessRequired(name: string): name is fileProcessor.AcceptableFileName {
  return fileProcessor.ACCEPTABLE_FILE_NAMES.includes(name as fileProcessor.AcceptableFileName);
}

function isStateRequiredMapFile(name: string): name is StateRequiredMapFileName {
  return isMapFileName(name) && isProcessRequired(name);
}

function isNeverProcessRequiredMapFile(name: string): name is NeverProcessRequiredMapFileName {
  return isMapFileName(name) && !isProcessRequired(name);
}

function isAlwaysProcessRequiredFile(name: string): name is AlwaysProcessRequiredFileName {
  return !isMapFileName(name) && isProcessRequired(name);
}

function isStateRequiredResource(
  resource: ResourceLike,
): resource is
  | { name: StateRequiredMapFileName; blob: Blob; alreadyProcessed: boolean }
  | { name: StateRequiredMapFileName; url: string; alreadyProcessed: boolean } {
  return isStateRequiredMapFile(resource.name);
}

function isNeverProcessRequiredResource(
  resource: ResourceLike,
): resource is { name: NeverProcessRequiredMapFileName; blob: Blob } | { name: NeverProcessRequiredMapFileName; url: string } {
  return isNeverProcessRequiredMapFile(resource.name);
}

function isAlwaysProcessRequiredResource(
  resource: ResourceLike,
): resource is { name: AlwaysProcessRequiredFileName; blob: Blob } | { name: AlwaysProcessRequiredFileName; url: string } {
  return isAlwaysProcessRequiredFile(resource.name);
}
