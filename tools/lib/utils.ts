import * as path from "path";
import * as fs from "fs";

export function projectRoot(...pathList: string[]): string {
  return path.join(__dirname, "..", "..", ...pathList);
}

export interface LocalJson {
  vanillaDir: string;
}

export async function localJson(): Promise<LocalJson> {
  const buffer = await fs.promises.readFile(projectRoot("local.json"));
  return JSON.parse(buffer.toString()) as LocalJson;
}

export async function vanillaDir(...pathList: string[]): Promise<string> {
  return path.join((await localJson()).vanillaDir, ...pathList);
}

export function requireNonnull<T>(a: T | null | undefined, message = "Unexpected error"): T {
  if (a) return a;
  else throw Error(message);
}

export function handleMain(main: Promise<number>): void {
  main
    .catch((e) => {
      console.error(e);
      return 1;
    })
    .then((exitCode) => {
      process.on("exit", () => process.exit(exitCode));
    });
}

export async function writeJsonFile(file: string, json: unknown) {
  await fs.promises.writeFile(file, JSON.stringify(json, null, "\t"));
  console.log("Write %s", file);
}
