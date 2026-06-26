import * as path from "node:path";
import { expandGlob } from "@std/fs/expand-glob";
import { vanillaDir } from "./utils.ts";

// Known prefab sidecar suffixes. Order matters: longer suffixes (e.g.
// ".blocks.nim") must precede shorter ones (".nim") so stripping picks the
// most specific match.
const PREFAB_SUFFIXES = [".blocks.nim", ".tts", ".xml", ".jpg"] as const;

// Predicate for prefab XML files that should be ignored — currently the
// auto-generated `<name>_signs.xml` companion files. Consolidated here so that
// any future exclusions live in a single place.
function isIgnoredPrefabXml(p: string): boolean {
  return p.endsWith("_signs.xml");
}

export async function listPrefabXmlPaths(): Promise<string[]> {
  const globPath = vanillaDir("Data", "Prefabs", "*", "*.xml");
  const xmls = await Array.fromAsync(expandGlob(globPath), (e) => e.path);
  return xmls.filter((p) => !isIgnoredPrefabXml(p));
}

export interface PrefabSiblingFiles {
  name: string;
  dir: string;
  xml: string;
  nim: string;
  tts: string;
  jpg: string;
}

export function prefabSiblingFiles(anyPrefabFile: string): PrefabSiblingFiles {
  const dir = path.dirname(anyPrefabFile);
  const base = path.basename(anyPrefabFile);
  const suffix = PREFAB_SUFFIXES.find((s) => base.endsWith(s));
  if (suffix === undefined) {
    throw new Error(`Not a recognized prefab file: ${anyPrefabFile}`);
  }
  const name = base.slice(0, -suffix.length);
  return {
    name,
    dir,
    xml: path.join(dir, `${name}.xml`),
    nim: path.join(dir, `${name}.blocks.nim`),
    tts: path.join(dir, `${name}.tts`),
    jpg: path.join(dir, `${name}.jpg`),
  };
}
