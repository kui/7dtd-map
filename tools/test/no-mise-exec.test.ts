import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");

// Contributors run commands in a mise-activated shell, so docs and scripts
// must call npm/npx/node directly instead of wrapping them in `mise exec`.
// Built from parts so this file never matches itself.
const forbidden = ["mise", "exec"].join(" ");

const scanned = [
  "*.md",
  "package.json",
  "mise.toml",
  ".githooks/*",
  ".github/workflows/*",
];

it("no tracked doc or script calls mise exec", () => {
  const files = execFileSync("git", ["ls-files", "-z", "--", ...scanned], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\0")
    .filter((f) => f !== "" && !f.startsWith("public/old/"));
  expect(files.length).toBeGreaterThan(0);

  const offenders = files.filter((f) =>
    fs.readFileSync(path.join(repoRoot, f), "utf8").includes(forbidden),
  );
  expect(offenders).toEqual([]);
});
