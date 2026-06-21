import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import {
  type CameraKeyAction,
  mapCameraKey,
} from "../index/terrain-viewer/camera-controller.ts";

function ev(
  code: string,
  key = "",
  mods: Partial<{ ctrlKey: boolean; altKey: boolean; metaKey: boolean }> = {},
) {
  return {
    code,
    key,
    ctrlKey: mods.ctrlKey ?? false,
    altKey: mods.altKey ?? false,
    metaKey: mods.metaKey ?? false,
  };
}

describe("mapCameraKey", () => {
  const cases: [string, ReturnType<typeof ev>, CameraKeyAction][] = [
    ["KeyA -> pan-left", ev("KeyA"), "pan-left"],
    ["ArrowLeft -> pan-left", ev("ArrowLeft"), "pan-left"],
    ["KeyD -> pan-right", ev("KeyD"), "pan-right"],
    ["ArrowRight -> pan-right", ev("ArrowRight"), "pan-right"],
    ["KeyW -> pan-up", ev("KeyW"), "pan-up"],
    ["ArrowUp -> pan-up", ev("ArrowUp"), "pan-up"],
    ["KeyS -> pan-down", ev("KeyS"), "pan-down"],
    ["ArrowDown -> pan-down", ev("ArrowDown"), "pan-down"],
    ["KeyR -> tilt-up", ev("KeyR"), "tilt-up"],
    ["PageUp -> tilt-up", ev("PageUp"), "tilt-up"],
    ["KeyF -> tilt-down", ev("KeyF"), "tilt-down"],
    ["PageDown -> tilt-down", ev("PageDown"), "tilt-down"],
    ["Equal -> zoom-in", ev("Equal"), "zoom-in"],
    ["NumpadAdd -> zoom-in", ev("NumpadAdd"), "zoom-in"],
    ["Minus -> zoom-out", ev("Minus"), "zoom-out"],
    ["NumpadSubtract -> zoom-out", ev("NumpadSubtract"), "zoom-out"],
    ["? key -> toggle-help", ev("Slash", "?"), "toggle-help"],
    ["unrelated key -> null", ev("KeyZ", "z"), null],
  ];
  for (const [label, e, expected] of cases) {
    it(label, () => {
      expect(mapCameraKey(e)).toBe(expected);
    });
  }

  it("ignores movement keys with Ctrl/Alt/Meta to preserve browser shortcuts", () => {
    expect(mapCameraKey(ev("KeyA", "a", { ctrlKey: true }))).toBe(null);
    expect(mapCameraKey(ev("ArrowLeft", "", { altKey: true }))).toBe(null);
    expect(mapCameraKey(ev("Equal", "=", { metaKey: true }))).toBe(null);
  });
});
