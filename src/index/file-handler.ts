import type * as fileProcessor from "../worker/file-processor";
import type { LoadingHandler } from "./loading-handler";
import type { DndHandler } from "./dnd-handler";
import type { BundledMapHandler } from "./bundled-map-hander";

import { basename, printError } from "../lib/utils";
import * as storage from "../lib/storage";
import { getPreferWorldFileName, hasPreferWorldFileNameIn, isMapFileName, MAP_FILE_NAMES, MapFileName } from "../../lib/map-files";

type Listener = (updatedFileNames: MapFileName[]) => unknown;

const PROCESS_REQUIRED_NAMES = [
  "biomes.png",
  "splat3.png",
  "splat3_processed.png",
  "splat4.png",
  "splat4_processed.png",
  "radiation.png",
  "dtm.raw",
] as const;
export type ProcessRequiredFileName = (typeof PROCESS_REQUIRED_NAMES)[number];

/**
 * File names that cannot be decide whether or not be already processed by its name.
 * In other words, this names are intersected with `storage.MapFileName` and `fileProcessor.AcceptableFileName`.
 */
type StateRequiredMapFileName = Extract<MapFileName, ProcessRequiredFileName>;

/** map file names that are not required to be processed */
type NeverProcessRequiredMapFileName = Exclude<MapFileName, ProcessRequiredFileName>;

/** File names that are required to be processed and not included in world file names */
type AlwaysProcessRequiredFileName = Exclude<ProcessRequiredFileName, MapFileName>;

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
  #doms: Doms;
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
    this.#doms = doms;
    this.#loadingHandler = loadingHandler;
    this.#processorFactory = processorFactory;

    doms.files.addEventListener("change", () => {
      if (doms.files.files) this.#pushFiles(Array.from(doms.files.files)).catch(printError);
    });
    doms.clearMap.addEventListener("click", () => {
      this.#setMapName("");
      this.#clear().catch(printError);
    });
    dndHandler.addListener(({ files }) => this.#pushEntries(files));
    bundledMapHandler.addListener(async ({ mapName, mapDir }) => {
      this.#setMapName(mapName);
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

  async #pushFiles(files: File[]) {
    await this.#process(
      files.flatMap((file) => {
        const name = file.name;
        if (isStateRequiredMapFile(name)) {
          return { name, blob: file, alreadyProcessed: false };
        } else if (isNeverProcessRequiredMapFile(name)) {
          return { name, blob: file };
        } else if (isAlwaysProcessRequiredFile(name)) {
          return { name, blob: file };
        } else {
          console.warn("Ignore file: name=", name);
          return [];
        }
      }),
    );
  }

  async #pushEntries(entries: FileSystemEntry[]) {
    const [entry] = entries;
    if (!entry) return;
    if (entries.length === 1 && isDirectory(entry)) {
      this.#setMapName(entry.name);
      const files = await Promise.all((await listEntries(entry)).flatMap((e) => (isFile(e) ? [toFile(e)] : [])));
      await this.#pushFiles(files);
      return;
    }
    const files = await Promise.all(entries.flatMap((e) => (isFile(e) ? [toFile(e)] : [])));
    await this.#pushFiles(files);
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

  #setMapName(name: string) {
    this.#doms.mapName.value = name;
    this.#doms.mapName.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function isProcessRequired(name: string): name is ProcessRequiredFileName {
  return PROCESS_REQUIRED_NAMES.includes(name as ProcessRequiredFileName);
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

function isFile(entry: FileSystemEntry): entry is FileSystemFileEntry {
  return entry.isFile;
}

function isDirectory(entry: FileSystemEntry): entry is FileSystemDirectoryEntry {
  return entry.isDirectory;
}

function toFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

function listEntries(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = entry.createReader();
    reader.readEntries(resolve, reject);
  });
}
