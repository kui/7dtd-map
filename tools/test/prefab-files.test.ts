import * as path from "node:path";
import { prefabSiblingFiles } from "../lib/prefab-files.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe("prefabSiblingFiles", () => {
  const dir = path.join("Data", "Prefabs", "Some_Dir");

  it("derives sibling paths from an xml path", () => {
    const r = prefabSiblingFiles(path.join(dir, "my_house.xml"));
    expect(r.name).toBe("my_house");
    expect(r.dir).toBe(dir);
    expect(r.xml).toBe(path.join(dir, "my_house.xml"));
    expect(r.nim).toBe(path.join(dir, "my_house.blocks.nim"));
    expect(r.tts).toBe(path.join(dir, "my_house.tts"));
    expect(r.jpg).toBe(path.join(dir, "my_house.jpg"));
  });

  it("derives sibling paths from a .blocks.nim path", () => {
    const r = prefabSiblingFiles(path.join(dir, "my_house.blocks.nim"));
    expect(r.name).toBe("my_house");
    expect(r.tts).toBe(path.join(dir, "my_house.tts"));
    expect(r.xml).toBe(path.join(dir, "my_house.xml"));
  });

  it("throws for unrecognized files", () => {
    expect(() => prefabSiblingFiles("foo.txt")).toThrow();
  });
});
