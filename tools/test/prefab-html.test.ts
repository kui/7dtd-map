import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import {
  buildSleeperVolumes,
  escapeHtml,
  PrefabProperty,
} from "../lib/prefab-html.ts";

describe("escapeHtml", () => {
  it("escapes <, >, and & without double-escaping the ampersand", () => {
    // WHY: previous implementation replaced `&` last, turning the `&` from `&lt;`/`&gt;` into `&amp;` and producing `&amp;lt;small&amp;gt;`.
    expect(escapeHtml("<small>&")).toBe("&lt;small&gt;&amp;");
  });

  it("returns falsy input unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("leaves plain text alone", () => {
    expect(escapeHtml("plain text")).toBe("plain text");
  });
});

describe("buildSleeperVolumes", () => {
  function baseProps(): PrefabProperty[] {
    return [
      { name: "SleeperVolumeGroup", value: "groupA,1,2,groupB,3,4" },
      { name: "SleeperVolumeGroupId", value: "0,1" },
      { name: "SleeperVolumeFlags", value: "0,0" },
      { name: "SleeperVolumeSize", value: "1,2,3#4,5,6" },
      { name: "SleeperVolumeStart", value: "0,0,0#1,1,1" },
    ];
  }

  it("defaults isLoot/isQuestExclude/isBoss to false when the property is shorter than groups", () => {
    // WHY: previously requireNonnull(arr[i]) threw when the boolean array had fewer entries than the group list, silently dropping the prefab in generate-prefab-html.ts.
    const props: PrefabProperty[] = [
      ...baseProps(),
      { name: "SleeperIsBossVolume", value: "True" },
      { name: "SleeperIsLootVolume", value: "True" },
      { name: "SleeperIsQuestExclude", value: "True" },
    ];
    const volumes = buildSleeperVolumes(props);
    expect(volumes.length).toBe(2);
    expect(volumes[0].isBoss).toBe(true);
    expect(volumes[0].isLoot).toBe(true);
    expect(volumes[0].isQuestExclude).toBe(true);
    expect(volumes[1].isBoss).toBe(false);
    expect(volumes[1].isLoot).toBe(false);
    expect(volumes[1].isQuestExclude).toBe(false);
  });

  it("defaults all booleans to false when the properties are absent", () => {
    const volumes = buildSleeperVolumes(baseProps());
    expect(volumes.length).toBe(2);
    for (const v of volumes) {
      expect(v.isBoss).toBe(false);
      expect(v.isLoot).toBe(false);
      expect(v.isQuestExclude).toBe(false);
    }
  });

  it("returns [] when SleeperVolumeGroup is absent", () => {
    expect(buildSleeperVolumes([])).toEqual([]);
  });

  it("throws the original message when SleeperVolumeFlags is missing", () => {
    // INVARIANT: error message texts are part of the contract and must not regress.
    const props = baseProps().filter((p) => p.name !== "SleeperVolumeFlags");
    expect(() => buildSleeperVolumes(props)).toThrow(
      "SleeperVolumeFlags is not found",
    );
  });
});
