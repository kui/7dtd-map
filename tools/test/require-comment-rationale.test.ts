/// <reference lib="deno.unstable" />
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import plugin from "../lint-plugins/require-comment-rationale.ts";

function run(source: string, filename = "main.ts") {
  return Deno.lint.runPlugin(plugin, filename, source);
}

describe("require-comment-rationale", () => {
  it("flags a bare line comment", () => {
    const d = run("// this restates the code\nconst x = 1;\n");
    expect(d.length).toBe(1);
    expect(d[0].id).toBe("local/require-comment-rationale");
  });

  it("flags a bare block comment", () => {
    const d = run("/* explains nothing */\nconst x = 1;\n");
    expect(d.length).toBe(1);
  });

  it("passes a WHY: marker", () => {
    const d = run("// WHY: upstream schema drift, see #123\nconst x = 1;\n");
    expect(d).toEqual([]);
  });

  it("passes a SAFETY: marker", () => {
    const d = run("// SAFETY: caller guarantees non-null\nconst x = 1;\n");
    expect(d).toEqual([]);
  });

  it("passes an INVARIANT: marker", () => {
    const d = run(
      "// INVARIANT: array stays sorted by id, do not push out of order\nconst xs = [];\n",
    );
    expect(d).toEqual([]);
  });

  it("passes a HACK: marker", () => {
    const d = run("// HACK: workaround for upstream bug 1234\nconst x = 1;\n");
    expect(d).toEqual([]);
  });

  it("flags a NOTE: marker (severity label, intentionally not preserved)", () => {
    const d = run("// NOTE: nothing to see here\nconst x = 1;\n");
    expect(d.length).toBe(1);
  });

  it("flags an IMPORTANT: marker (severity label, intentionally not preserved)", () => {
    const d = run("// IMPORTANT: read this\nconst x = 1;\n");
    expect(d.length).toBe(1);
  });

  it("passes a TODO comment", () => {
    const d = run("// TODO: refactor later\nconst x = 1;\n");
    expect(d).toEqual([]);
  });

  it("passes a deno-lint-ignore directive", () => {
    const d = run(
      "// deno-lint-ignore no-explicit-any -- external boundary\nconst x: any = 1;\n",
    );
    expect(d).toEqual([]);
  });

  it("passes a JSDoc block", () => {
    const d = run("/** JSDoc-style summary */\nexport function f() {}\n");
    expect(d).toEqual([]);
  });

  it("passes a triple-slash reference", () => {
    const d = run('/// <reference lib="deno.ns" />\nconst x = 1;\n');
    expect(d).toEqual([]);
  });

  it("passes @ts-expect-error", () => {
    const d = run(
      "// @ts-expect-error external types are wrong\nconst x = 1;\n",
    );
    expect(d).toEqual([]);
  });

  it("flags a KEEP: marker (contentless, intentionally not preserved)", () => {
    const d = run("// KEEP: no reason\nconst x = 1;\n");
    expect(d.length).toBe(1);
  });

  it("flags multiple bare comments in one file", () => {
    const d = run(
      "// first\n// second\n// WHY: keep me\n// fourth\nconst x = 1;\n",
    );
    expect(d.length).toBe(3);
  });
});
