import { MapFileName } from "../../lib/map-files.ts";

/**
 * Expected directory structure within the Origin Private File System (OPFS).
 *
 * ```
 * (OPFS root)
 * ├── maps/
 * │   └── <map-name>/       # One directory per map/world
 * │       └── <map-files>   # Files defined by MapFileName (e.g., biomes.png, prefabs.xml, ...)
 * └── workspace/            # Temporary working directory
 *     └── <map-files>       # Files defined by MapFileName
 * ```
 */

const MAPS_DIR = "maps";
const WORKSPACE_DIR = "workspace";

export async function* listMapDirs(): AsyncIterable<MapDir> {
  const worlds = await mapsDir();
  for await (const entry of worlds.values()) {
    if (isDirectory(entry)) yield new MapDir(entry);
  }
}

function isDirectory(
  entry: FileSystemHandle,
): entry is FileSystemDirectoryHandle {
  return entry.kind === "directory";
}

export async function mapDir(name: string): Promise<MapDir> {
  const worlds = await mapsDir();
  return new MapDir(await worlds.getDirectoryHandle(name, { create: true }));
}

export async function workspaceDir(): Promise<MapDir> {
  const root = await navigator.storage.getDirectory();
  return new MapDir(
    await root.getDirectoryHandle(WORKSPACE_DIR, { create: true }),
  );
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

  async put(
    name: MapFileName,
    data: ArrayBuffer | Blob | ReadableStream<Uint8Array>,
  ) {
    console.debug("put", name);
    const file = await this.#dir.getFileHandle(name, { create: true });
    const writable = await file.createWritable();
    if (data instanceof ArrayBuffer || data instanceof Blob) {
      try {
        await writable.write(data);
      } finally {
        await writable.close();
      }
    } else {
      // pipeTo closes the writable on its own (preventClose defaults to false),
      // so we must not call close() again here.
      await data.pipeTo(writable);
    }
  }

  async createWritable(
    name: MapFileName,
  ): Promise<FileSystemWritableFileStream> {
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

  async list(): Promise<Set<string>> {
    const names = new Set<string>();
    for await (const name of this.#dir.keys()) {
      names.add(name);
    }
    return names;
  }

  async remove(name: MapFileName) {
    try {
      await this.#dir.removeEntry(name);
    } catch (e: unknown) {
      // Treat removal as idempotent: ignore missing entries so that bulk
      // clears (e.g. FileHandler#clear) don't abort halfway through.
      if (e instanceof DOMException && e.name === "NotFoundError") {
        return;
      }
      throw e;
    }
  }
}
