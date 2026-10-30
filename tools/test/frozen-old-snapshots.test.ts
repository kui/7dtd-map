import { execFileSync } from "node:child_process";
import * as path from "node:path";
import { expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const base = process.env["FROZEN_OLD_BASE"] ?? "origin/master";

it("no existing file under public/old/ is modified, deleted, or renamed", () => {
  const changed = execFileSync(
    "git",
    [
      "diff",
      "--cached",
      "--name-status",
      "--diff-filter=MDR",
      base,
      "--",
      "public/old",
    ],
    { cwd: repoRoot, encoding: "utf8" },
  )
    .split("\n")
    .filter((l) => l !== "");
  expect(
    changed,
    `public/old/<version>/ are frozen snapshots; compared with ${base}, only new files may be added. In a major version upgrade, copy the current system into a new public/old/<version>/ and edit only the nav / version banner in its top-level HTML.`,
  ).toEqual([]);
});
