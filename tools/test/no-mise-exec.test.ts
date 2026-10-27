import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const selfPath = path
  .relative(repoRoot, import.meta.filename)
  .replaceAll("\\", "/");

// WHY: `x` is mise's alias for `exec`, and `\s+` also catches the name wrapped across lines in hard-wrapped prose.
const forbidden = /\bmise\s+(?:exec|x)\b/g;

// WHY: public/old is a frozen snapshot, the other public dirs and the lockfile are generated data, and this file names the forbidden command itself.
const excluded = [
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
    ["ls-files", "-z", "--", ".", ...excluded],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  )
    .split("\0")
    // WHY: git ls-files lists index entries, so a file deleted but not yet staged would make the read below throw ENOENT.
    .filter((f) => f !== "" && fs.existsSync(path.join(repoRoot, f)));
  expect(files.length).toBeGreaterThan(0);

  const offenders = files.flatMap((f) => {
    const text = fs.readFileSync(path.join(repoRoot, f), "latin1");
    if (text.includes("\0")) return [];
    return [...text.matchAll(forbidden)].map(
      (m) => `${f}:${text.slice(0, m.index).split("\n").length}`,
    );
  });
  expect(
    offenders,
    "call npm, npx, and node directly instead of via mise exec",
  ).toEqual([]);
});
