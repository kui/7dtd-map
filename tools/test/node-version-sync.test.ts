import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../..");

function nodeMajor(source: string, spec: unknown): number {
  const match =
    typeof spec === "string"
      ? /^(?:\^|~|>=)?(\d+)(?:\.\d+){0,2}$/.exec(spec)
      : null;
  if (!match?.[1]) {
    throw new Error(
      `Unexpected Node version spec in ${source}: ${JSON.stringify(spec)}`,
    );
  }
  return Number(match[1]);
}

it("package.json pins the same Node major as mise.toml", () => {
  // WHY: -f reads the tracked mise.toml, not a mise.local.toml override.
  const miseNode = execFileSync(
    "mise",
    ["config", "get", "-f", "mise.toml", "tools.node"],
    { cwd: repoRoot, encoding: "utf8" },
  ).trim();
  const miseMajor = nodeMajor("mise.toml [tools] node", miseNode);

  const pkg = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  );
  const specs = {
    "devDependencies.@types/node": pkg.devDependencies?.["@types/node"],
    "engines.node": pkg.engines?.node,
    "devEngines.runtime.version": pkg.devEngines?.runtime?.version,
  };
  const majors = Object.fromEntries(
    Object.entries(specs).map(([key, spec]) => [
      key,
      nodeMajor(`package.json ${key}`, spec),
    ]),
  );

  expect(
    majors,
    `update package.json to Node ${String(miseMajor)} to match mise.toml`,
  ).toEqual(
    Object.fromEntries(Object.keys(specs).map((key) => [key, miseMajor])),
  );
});
