import process from "node:process";
import { program } from "../lib/utils.ts";
import { describe, expect, it } from "vitest";

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
