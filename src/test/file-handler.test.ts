import { FileHandler } from "../index/file-handler.ts";
import { MapDir } from "../lib/storage.ts";
import type { BundledMapHandler } from "../index/bundled-map-handler.ts";
import type { DialogHandler } from "../index/dialog-handler.ts";
import type { DndHandler } from "../index/dnd-handler.ts";
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";

class FakeDirHandle {
  kind = "directory" as const;
  name = "workspace";
  #names: Set<string>;
  constructor(names: Iterable<string>) {
    this.#names = new Set(names);
  }
  async *keys(): AsyncIterableIterator<string> {
    for (const n of this.#names) {
      yield n;
    }
  }
}

function fakeWorkspace(names: Iterable<string>): Promise<MapDir> {
  const handle = new FakeDirHandle(names);
  return Promise.resolve(
    new MapDir(handle as unknown as FileSystemDirectoryHandle),
  );
}

function stubInput(): HTMLInputElement {
  return {
    addEventListener: () => {},
    value: "",
  } as unknown as HTMLInputElement;
}
function stubButton(): HTMLButtonElement {
  return { addEventListener: () => {} } as unknown as HTMLButtonElement;
}

function stubFileHandler(workspace: Promise<MapDir>): FileHandler {
  const doms = {
    files: stubInput(),
    clearMap: stubButton(),
    mapName: stubInput(),
  };
  const dialogHandler = {} as DialogHandler;
  const dndHandler = { addListener: () => {} } as unknown as DndHandler;
  const bundledMapHandler = {
    addListener: () => {},
  } as unknown as BundledMapHandler;
  const processorFactory = (): Worker => {
    throw new Error("processor factory should not be called");
  };
  return new FileHandler(
    doms,
    dialogHandler,
    processorFactory,
    dndHandler,
    bundledMapHandler,
    workspace,
  );
}

describe("FileHandler.initialize", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: { getItem: () => null },
      configurable: true,
    });
  });
  afterAll(() => {
    Reflect.deleteProperty(globalThis, "localStorage");
  });

  it("does not dispatch update when workspace has no map files", async () => {
    const handler = stubFileHandler(fakeWorkspace([]));
    const listener = mock();
    handler.addListener(listener);

    await handler.initialize();

    expect(listener.mock.calls.length).toBe(0);
  });

  it("ignores unrelated files in the workspace", async () => {
    const handler = stubFileHandler(fakeWorkspace(["junk.bin", "notes.txt"]));
    const listener = mock();
    handler.addListener(listener);

    await handler.initialize();

    expect(listener.mock.calls.length).toBe(0);
  });

  it("dispatches only existing map file names", async () => {
    const handler = stubFileHandler(
      fakeWorkspace(["map_info.xml", "biomes.png", "junk.bin"]),
    );
    const listener = mock();
    handler.addListener(listener);

    await handler.initialize();

    expect(listener.mock.calls.length).toBe(1);
    const msg = listener.mock.calls[0]?.[0] as string[];
    expect(new Set(msg)).toEqual(new Set(["map_info.xml", "biomes.png"]));
  });
});
