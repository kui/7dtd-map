import process from "node:process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { globFiles, isErrnoException, program } from "../lib/utils.ts";
import { describe, expect, it } from "vitest";

describe("globFiles", () => {
  it("returns sorted absolute paths of files only", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "globfiles-"));
    try {
      await fs.mkdir(path.join(root, "b", "dir.xml"), { recursive: true });
      await fs.mkdir(path.join(root, "a"));
      await fs.writeFile(path.join(root, "b", "y.xml"), "");
      await fs.writeFile(path.join(root, "a", "x.xml"), "");
      await fs.writeFile(path.join(root, "a", "x.txt"), "");

      expect(await globFiles(root, "*/*.xml")).toEqual([
        path.join(root, "a", "x.xml"),
        path.join(root, "b", "y.xml"),
      ]);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});

describe("isErrnoException", () => {
  it("accepts errors carrying a string code", async () => {
    const e: unknown = await fs
      .readFile(path.join(os.tmpdir(), "no-such-file-for-test"))
      .catch((err: unknown) => err);
    expect(isErrnoException(e)).toBe(true);
  });

  it("rejects values without a string code", () => {
    expect(isErrnoException(new Error("x"))).toBe(false);
    expect(isErrnoException(null)).toBe(false);
    expect(isErrnoException("ENOENT")).toBe(false);
  });
});

describe("program", () => {
  it("returns the basename of process.argv[1]", () => {
    const saved = process.argv;
    try {
      process.argv = [saved[0] ?? "node", "/tmp/foo.ts"];
      expect(program()).toBe("foo.ts");
    } finally {
      process.argv = saved;
    }
  });

  it("throws a diagnostic error when process.argv[1] is missing", () => {
    const saved = process.argv;
    try {
      process.argv = [saved[0] ?? "node"];
      expect(() => program()).toThrow("Unexpected process.argv:");
    } finally {
      process.argv = saved;
    }
  });
});
