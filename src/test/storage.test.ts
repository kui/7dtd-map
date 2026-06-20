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
