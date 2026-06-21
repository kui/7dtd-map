import process from "node:process";
import { program } from "./utils.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("program", () => {
  it("returns the basename of process.argv[1]", () => {
    const saved = process.argv;
    try {
      process.argv = [saved[0] ?? "deno", "/tmp/foo.ts"];
      expect(program()).toBe("foo.ts");
    } finally {
      process.argv = saved;
    }
  });

  it("throws a diagnostic error when process.argv[1] is missing", () => {
    const saved = process.argv;
    try {
      process.argv = [saved[0] ?? "deno"];
      expect(() => program()).toThrow("Unexpected process.argv:");
    } finally {
      process.argv = saved;
    }
  });
});
