import { MapFileName } from "../../lib/map-files.ts";

const MAPS_DIR = "maps";
const WORKSPACE_DIR = "workspace";

export async function* listMapDirs(): AsyncIterable<MapDir> {
  const worlds = await mapsDir();
  for await (const entry of worlds.values()) {
    if (entry.kind === "directory") {
      yield new MapDir(entry as FileSystemDirectoryHandle);
    }
  }
}

export async function mapDir(name: string): Promise<MapDir> {
  const worlds = await mapsDir();
  return new MapDir(await worlds.getDirectoryHandle(name, { create: true }));
}

export async function workspaceDir(): Promise<MapDir> {
  const root = await navigator.storage.getDirectory();
  return new MapDir(await root.getDirectoryHandle(WORKSPACE_DIR, { create: true }));
}

async function mapsDir() {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(MAPS_DIR, { create: true });
}

export class MapDir {
  #dir: FileSystemDirectoryHandle;

  constructor(dir: FileSystemDirectoryHandle) {
    this.#dir = dir;
  }

  get name(): string {
    return this.#dir.name;
  }

  async put(name: MapFileName, data: ArrayBuffer | Blob | ReadableStream<Uint8Array>) {
    console.debug("put", name);
    const file = await this.#dir.getFileHandle(name, { create: true });
    const writable = await file.createWritable();
    if (data instanceof ArrayBuffer || data instanceof Blob) {
      await writable.write(data);
    } else {
      await data.pipeTo(writable);
    }
    await writable.close();
  }

  async createWritable(name: MapFileName): Promise<FileSystemWritableFileStream> {
    const file = await this.#dir.getFileHandle(name, { create: true });
    return await file.createWritable();
  }

  async get(name: MapFileName): Promise<File | null> {
    console.debug("get", name);
    try {
      const file = await this.#dir.getFileHandle(name);
      return await file.getFile();
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "NotFoundError") {
        return null;
      }
      throw e;
    }
  }

  async size(name: MapFileName): Promise<number> {
    const file = await this.#dir.getFileHandle(name);
    return (await file.getFile()).size;
  }

  async remove(name: MapFileName) {
    await this.#dir.removeEntry(name);
  }
}
