import type * as fileProcessor from "../worker/file-processor";
import type { BundledMapHandler } from "./bundled-map-hander";
import type { DialogHandler } from "./dialog-handler";
import type { DndHandler } from "./dnd-handler";

import {
  getPreferWorldFileName,
  hasPreferWorldFileNameIn,
  isMapFileName,
  MAP_FILE_NAMES,
  MapFileName,
  PREFER_WORLD_FILE_NAMES,
} from "../../lib/map-files";
import * as storage from "../lib/storage";
import { basename, printError } from "../lib/utils";

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
  #dialogHandler: DialogHandler;
  #processorFactory: () => ImageProcessorWorker;
  #workspace = storage.workspaceDir();
  #depletedFileHandler = new DepletedFileHandler();

  constructor(
    doms: Doms,
    dialogHandler: DialogHandler,
    processorFactory: () => ImageProcessorWorker,
    dndHandler: DndHandler,
    bundledMapHandler: BundledMapHandler,
  ) {
    this.#doms = doms;
    this.#dialogHandler = dialogHandler;
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
    if (this.#dialogHandler.state === "processing") {
      throw new Error("Already processing");
    }
    this.#dialogHandler.state = "processing";
    const progression = this.#dialogHandler.createProgression(resourceList.map(({ name }) => name));
    this.#dialogHandler.open();
    const workspace = await this.#workspace;
    const resourceNames = resourceList.map(({ name }) => name);
    const processedNames: MapFileName[] = [];

    // TODO parallelize
    for (const resource of resourceList) {
      if (hasPreferWorldFileNameIn(resource.name, resourceNames)) {
        console.log("Skip ", resource.name, " because ", getPreferWorldFileName(resource.name), " is already in the list");
        progression.setState(resource.name, "skipped");
        continue;
      }

      if (this.#depletedFileHandler.isSupport(resource.name)) {
        this.#depletedFileHandler.handle(resource.name, "remove" in resource, "alreadyProcessed" in resource && resource.alreadyProcessed);
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
      progression.setState(resource.name, "completed");
    }

    if (processedNames.length > 0) await this.#invokeListeners(processedNames);

    this.#dialogHandler.close();
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

type DeplateOrPreferedFileName =
  | keyof typeof PREFER_WORLD_FILE_NAMES
  | (typeof PREFER_WORLD_FILE_NAMES)[keyof typeof PREFER_WORLD_FILE_NAMES];

/**
 * State whether or not to use the depleted version of the file.
 */
class DepletedFileHandler {
  constructor() {
    if (localStorage.getItem("useSplat3Png")) document.body.classList.add("use-splat3-png");
    if (localStorage.getItem("useSplat4Png")) document.body.classList.add("use-splat4-png");
  }

  isSupport(worldFileName: string): worldFileName is DeplateOrPreferedFileName {
    return Object.entries(PREFER_WORLD_FILE_NAMES).some((e) => e.includes(worldFileName));
  }

  handle(deplateOrPreferedFileName: DeplateOrPreferedFileName, removing: boolean, alreadyProcessed: boolean) {
    switch (deplateOrPreferedFileName) {
      case "splat3.png":
        this.useSplat3Png = !removing && !alreadyProcessed;
        break;
      case "splat3_processed.png":
        this.useSplat3Png = false;
        break;
      case "splat4.png":
        this.useSplat4Png = !removing && !alreadyProcessed;
        break;
      case "splat4_processed.png":
        this.useSplat4Png = false;
        break;
    }
  }

  set useSplat3Png(value: boolean) {
    if (value) {
      localStorage.setItem("useSplat3Png", "t");
      document.body.classList.add("use-splat3-png");
    } else {
      localStorage.removeItem("useSplat3Png");
      document.body.classList.remove("use-splat3-png");
    }
  }
  set useSplat4Png(value: boolean) {
    if (value) {
      localStorage.setItem("useSplat4Png", "t");
      document.body.classList.add("use-splat4-png");
    } else {
      localStorage.removeItem("useSplat4Png");
      document.body.classList.remove("use-splat4-png");
    }
  }
}
