// deno-lint-ignore-file no-non-null-assertion
import { MapDir } from "../lib/storage.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { spy } from "@std/testing/mock";

// A minimal in-memory FileSystemDirectoryHandle that satisfies the parts of
// the API used by MapDir. Anything MapDir doesn't touch is left as a stub.
class FakeWritable {
  parts: (ArrayBuffer | Blob)[] = [];
  closed = false;
  write(data: ArrayBuffer | Blob) {
    this.parts.push(data);
    return Promise.resolve();
  }
  close() {
    this.closed = true;
    return Promise.resolve();
  }
}

class FakeFileHandle {
  kind = "file" as const;
  name: string;
  data: ArrayBuffer | null = null;
  constructor(name: string) {
    this.name = name;
  }
  getFile(): Promise<File> {
    return Promise.resolve(
      new File([this.data ?? new ArrayBuffer(0)], this.name),
    );
  }
  createWritable(): Promise<FakeWritable> {
    const w = new FakeWritable();
    // Capture writes back into `this.data` on close.
    const origWrite = w.write.bind(w);
    w.write = async (d: ArrayBuffer | Blob) => {
      await origWrite(d);
      if (d instanceof ArrayBuffer) {
        this.data = d;
      } else if (d instanceof Blob) {
        this.data = await d.arrayBuffer();
      }
    };
    return Promise.resolve(w);
  }
}

class FakeDirHandle {
  kind = "directory" as const;
  name = "workspace";
  files = new Map<string, FakeFileHandle>();

  getFileHandle(name: string, opts?: { create?: boolean }) {
    const existing = this.files.get(name);
    if (existing) return Promise.resolve(existing);
    if (opts?.create) {
      const h = new FakeFileHandle(name);
      this.files.set(name, h);
      return Promise.resolve(h);
    }
    return Promise.reject(new DOMException(`No file ${name}`, "NotFoundError"));
  }
  removeEntry(name: string) {
    if (!this.files.has(name)) {
      return Promise.reject(
        new DOMException(`No file ${name}`, "NotFoundError"),
      );
    }
    this.files.delete(name);
    return Promise.resolve();
  }
}

function buildMapDir() {
  const fake = new FakeDirHandle();
  const dir = new MapDir(fake as unknown as FileSystemDirectoryHandle);
  return { dir, fake };
}

describe("MapDir", () => {
  it("returns null from get() when the file does not exist", async () => {
    const { dir } = buildMapDir();
    expect(await dir.get("biomes.png")).toBeNull();
  });

  it("put() persists data that can be read back via get()", async () => {
    const { dir } = buildMapDir();
    const payload = new TextEncoder().encode("hello").buffer;
    await dir.put("map_info.xml", payload);
    const file = await dir.get("map_info.xml");
    expect(file).not.toBeNull();
    expect(await file!.text()).toBe("hello");
  });

  it("size() reports the byte length of a stored file", async () => {
    const { dir } = buildMapDir();
    const payload = new TextEncoder().encode("hi!").buffer;
    await dir.put("map_info.xml", payload);
    expect(await dir.size("map_info.xml")).toBe(3);
  });

  it("remove() deletes the entry from the underlying directory", async () => {
    const { dir, fake } = buildMapDir();
    const payload = new TextEncoder().encode("bye").buffer;
    await dir.put("map_info.xml", payload);
    expect(fake.files.has("map_info.xml")).toBe(true);
    await dir.remove("map_info.xml");
    expect(fake.files.has("map_info.xml")).toBe(false);
    // After removal a subsequent get() resolves to null again.
    expect(await dir.get("map_info.xml")).toBeNull();
  });

  it("name proxies to the underlying handle", () => {
    const { dir, fake } = buildMapDir();
    expect(dir.name).toBe(fake.name);
  });

  it("createWritable() returns the same stream object that the handle gave us", async () => {
    const { dir, fake } = buildMapDir();
    const handle = await fake.getFileHandle("map_info.xml", { create: true });
    const createSpy = spy(handle, "createWritable");
    const w = await dir.createWritable("map_info.xml");
    expect(w).toBeDefined();
    expect(createSpy.calls.length).toBe(1);
  });
});

describe("MapDir.remove() idempotency", () => {
  it("swallows NotFoundError so bulk clears stay idempotent", async () => {
    const { dir } = buildMapDir();
    // No file has been put — the underlying handle would throw NotFoundError.
    await dir.remove("biomes.png");
  });

  it("rethrows other DOMExceptions", async () => {
    const fake = {
      removeEntry: () =>
        Promise.reject(
          new DOMException("denied", "NoModificationAllowedError"),
        ),
    } as unknown as FileSystemDirectoryHandle;
    const dir = new MapDir(fake);
    await expect(dir.remove("biomes.png")).rejects.toThrow(DOMException);
  });

  it("rethrows non-DOMException errors", async () => {
    const fake = {
      removeEntry: () => Promise.reject(new TypeError("boom")),
    } as unknown as FileSystemDirectoryHandle;
    const dir = new MapDir(fake);
    await expect(dir.remove("biomes.png")).rejects.toThrow(TypeError);
  });
});

describe("MapDir.put() resource handling", () => {
  it("closes the writable even when write() throws (Blob path)", async () => {
    let closed = false;
    const writable = {
      write: () => Promise.reject(new Error("disk full")),
      close: () => {
        closed = true;
        return Promise.resolve();
      },
    } as unknown as FileSystemWritableFileStream;
    const fileHandle = {
      createWritable: () => Promise.resolve(writable),
    } as unknown as FileSystemFileHandle;
    const dirHandle = {
      getFileHandle: () => Promise.resolve(fileHandle),
    } as unknown as FileSystemDirectoryHandle;
    const dir = new MapDir(dirHandle);

    await expect(dir.put("biomes.png", new Blob(["x"]))).rejects.toThrow(
      "disk full",
    );
    expect(closed).toBe(true);
  });

  it("does not double-close on the ReadableStream path", async () => {
    let closeCount = 0;
    const writable = new WritableStream<Uint8Array>({
      write() {},
      close() {
        closeCount += 1;
      },
    });
    const fileHandle = {
      createWritable: () => Promise.resolve(writable),
    } as unknown as FileSystemFileHandle;
    const dirHandle = {
      getFileHandle: () => Promise.resolve(fileHandle),
    } as unknown as FileSystemDirectoryHandle;
    const dir = new MapDir(dirHandle);

    const source = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
      },
    });

    await dir.put("biomes.png", source);
    // pipeTo is responsible for closing exactly once.
    expect(closeCount).toBe(1);
  });
});
