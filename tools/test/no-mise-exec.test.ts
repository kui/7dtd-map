import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const selfPath = path
  .relative(repoRoot, import.meta.filename)
  .replaceAll("\\", "/");

const miseExecAliases = ["exec", "x"];
const miseExecInvocation = new RegExp(
  String.raw`\bmise\s+(?:${miseExecAliases.join("|")})\b`,
  "g",
);

const frozenOrGeneratedPaths = [
  ":!public/old",
  ":!public/prefabs",
  ":!public/maps",
  ":!public/labels",
  ":!package-lock.json",
  `:!${selfPath}`,
];

it("no tracked file calls mise exec", () => {
  const files = execFileSync(
    "git",
    ["ls-files", "-z", "--", ".", ...frozenOrGeneratedPaths],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  )
    .split("\0")
    .filter((f) => f !== "" && fs.existsSync(path.join(repoRoot, f)));
  expect(files.length).toBeGreaterThan(0);

  const offenders = files.flatMap((f) => {
    const text = fs.readFileSync(path.join(repoRoot, f), "latin1");
    if (text.includes("\0")) return [];
    return [...text.matchAll(miseExecInvocation)].map(
      (m) => `${f}:${text.slice(0, m.index).split("\n").length}`,
    );
  });
  expect(
    offenders,
    "call npm, npx, and node directly instead of via mise exec",
  ).toEqual([]);
});
