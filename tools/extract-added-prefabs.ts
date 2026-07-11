import * as path from "node:path";
import {
  handleMain,
  projectRoot,
  publishDir,
  writeJsonFile,
} from "./lib/utils.ts";

/**
 * `index.json` only tracks prefabs of the latest game version. There is
 * no tag-per-release history, and experimental versions add or remove
 * prefabs across many commits without ever bumping the version tag. So
 * each version's added set is computed as (names at its `ref`) minus
 * (names at the previous version's `ref`), not from a single tagged
 * snapshot.
 *
 * The last entry is the in-progress version. Its `ref` stays `"HEAD"`
 * until that version is tagged. On release, change it to the new tag
 * and append a new in-progress entry for the version after it.
 */
const VERSIONS: readonly { version: string; ref: string }[] = [
  { version: "2.6", ref: "v2.6" },
  { version: "3.0", ref: "v3.0" },
  { version: "3.1", ref: "HEAD" },
];

const OUTPUT_FILE = "prefab-added-versions.json";
const INDEX_JSON_PATH = "public/prefabs/index.json";

async function main() {
  const outputPath = path.join(publishDir(), OUTPUT_FILE);
  const recorded = await readExistingOutput(outputPath);

  let totalAdded = 0;
  for (let i = 1; i < VERSIONS.length; i++) {
    // deno-lint-ignore no-non-null-assertion
    const { version, ref } = VERSIONS[i]!;
    // deno-lint-ignore no-non-null-assertion
    const previousRef = VERSIONS[i - 1]!.ref;

    const previousNames = await readIndexJsonAt(previousRef);
    const currentNames = await readIndexJsonAt(ref);
    const addedNames = [...currentNames].filter((name) =>
      !previousNames.has(name)
    );

    for (const name of addedNames) {
      const existingVersion = recorded[name];
      if (existingVersion === version) continue;
      if (existingVersion !== undefined) {
        throw new Error(
          `${name} is already recorded as added in version ${existingVersion}; ` +
            `refusing to also record it for version ${version}`,
        );
      }
      recorded[name] = version;
      totalAdded++;
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(recorded).sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeJsonFile(outputPath, sorted, { compact: true });
  console.log(
    "Recorded %d newly added prefab(s) (%d total)",
    totalAdded,
    Object.keys(sorted).length,
  );
  return 0;
}

async function readIndexJsonAt(ref: string): Promise<Set<string>> {
  const command = new Deno.Command("git", {
    args: ["show", `${ref}:${INDEX_JSON_PATH}`],
    cwd: projectRoot(),
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await command.output();
  if (code !== 0) {
    throw new Error(
      `git show ${ref}:${INDEX_JSON_PATH} failed: ${
        new TextDecoder().decode(stderr)
      }`,
    );
  }

  const json: unknown = JSON.parse(new TextDecoder().decode(stdout));
  if (!Array.isArray(json) || !json.every((v) => typeof v === "string")) {
    throw new Error(
      `${INDEX_JSON_PATH} at ${ref} is not an array of strings`,
    );
  }
  return new Set(json);
}

async function readExistingOutput(
  outputPath: string,
): Promise<{ [prefabName: string]: string }> {
  let text: string;
  try {
    text = await Deno.readTextFile(outputPath);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return {};
    throw e;
  }

  const json: unknown = JSON.parse(text);
  if (
    json === null || typeof json !== "object" || Array.isArray(json) ||
    !Object.values(json).every((v) => typeof v === "string")
  ) {
    throw new Error(`${outputPath} is not a flat string-to-string map`);
  }
  return json as { [prefabName: string]: string };
}

handleMain(main());
