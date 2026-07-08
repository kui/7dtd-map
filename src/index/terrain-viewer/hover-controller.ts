import * as three from "three";
import type { BoxPlacement, PrefabBoxes } from "./prefab-boxes.ts";
import {
  CURSOR_OFFSET,
  type PrefabTooltipController,
} from "../../lib/prefab-tooltip.ts";
import { printError } from "../../lib/utils.ts";

// TerrainViewer's hover sub-controller (peer of TerrainViewerCameraController):
// raycasts the pointer against the footprint boxes and projects a hovered box
// to an anchor, feeding the shared PrefabTooltipController. The viewer ticks
// update() each frame and reads hoveredPlacement to drive its box highlight.
export class TerrainViewerHoverController {
  #controller: PrefabTooltipController;
  #camera: three.Camera;
  #canvas: HTMLCanvasElement;
  #raycaster = new three.Raycaster();
  #pointerNdc = new three.Vector2();
  #pointerInside = false;
  #pointerDown = false;
  #pointerClientX = 0;
  #pointerClientY = 0;
  #boxes: PrefabBoxes | null = null;
  #hoverInstanceId: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    camera: three.Camera,
    controller: PrefabTooltipController,
  ) {
    this.#canvas = canvas;
    this.#camera = camera;
    this.#controller = controller;

    // The raycast runs once per frame via update(); these listeners only track
    // pointer state so a held button (camera drag) can suppress it.
    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      this.#pointerNdc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      this.#pointerClientX = event.clientX;
      this.#pointerClientY = event.clientY;
      this.#pointerInside = true;
    });
    canvas.addEventListener("pointerdown", () => {
      this.#pointerDown = true;
    });
    globalThis.addEventListener("pointerup", () => {
      this.#pointerDown = false;
    });
    canvas.addEventListener("pointerleave", () => {
      this.#pointerInside = false;
      this.#setHover(null);
    });
  }

  get hoveredPlacement(): BoxPlacement | null {
    if (this.#hoverInstanceId === null || !this.#boxes) return null;
    return this.#boxes.placements[this.#hoverInstanceId] ?? null;
  }

  // Called on each box rebuild (and with null on teardown); resets the hover.
  setBoxes(boxes: PrefabBoxes | null): void {
    this.#boxes = boxes;
    this.#setHover(null);
  }

  update(): void {
    if (!this.#pointerInside || this.#pointerDown || !this.#boxes) return;
    this.#raycaster.setFromCamera(this.#pointerNdc, this.#camera);
    const hit = this.#raycaster.intersectObject(this.#boxes.mesh)[0];
    this.#setHover(hit?.instanceId ?? null);
  }

  #setHover(instanceId: number | null): void {
    if (instanceId === this.#hoverInstanceId) return;
    this.#hoverInstanceId = instanceId;
    const placement = this.hoveredPlacement;
    if (!placement) {
      this.#controller.hide();
      return;
    }
    // The controller's token guard drops this if the hover changes (or hides)
    // before the content lookup resolves, so no per-instance recheck is needed.
    this.#controller.showFor(
      placement.prefab,
      ["click", "dblclick", "shift-click"],
      () => this.#anchor(placement),
    ).catch(printError);
  }

  // Anchor to the right of the hovered box by projecting its 8 corners; falls
  // back to the cursor when every corner is behind the camera (off-screen).
  #anchor(p: BoxPlacement): { left: number; top: number } {
    const rect = this.#canvas.getBoundingClientRect();
    const v = new three.Vector3();
    let minY = Infinity;
    let maxX = -Infinity;
    let visible = false;
    for (const hx of [-p.width / 2, p.width / 2]) {
      for (const hy of [p.bottomY, p.topY]) {
        for (const hz of [-p.depth / 2, p.depth / 2]) {
          v.set(p.centerX + hx, hy, p.centerZ + hz);
          v.project(this.#camera);
          if (v.z > 1) continue;
          visible = true;
          const sx = rect.left + ((v.x + 1) / 2) * rect.width;
          const sy = rect.top + ((1 - v.y) / 2) * rect.height;
          if (sx > maxX) maxX = sx;
          if (sy < minY) minY = sy;
        }
      }
    }
    if (!visible) {
      return {
        left: this.#pointerClientX + CURSOR_OFFSET,
        top: this.#pointerClientY + CURSOR_OFFSET,
      };
    }
    return { left: maxX + CURSOR_OFFSET, top: minY };
  }
}
