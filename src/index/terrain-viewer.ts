import type { DtmHandler } from "./dtm-handler.ts";
import type { ThreePlaneSize } from "../types/7dtdmap.ts";

import * as three from "three";
import { printError, threePlaneSize } from "../lib/utils.ts";
import { TerrainViewerCameraController } from "./terrain-viewer/camera-controller.ts";

interface Doms {
  dialog: HTMLDialogElement;
  output: HTMLCanvasElement;
  texture: HTMLCanvasElement;
  show: HTMLButtonElement;
  close: HTMLButtonElement;
  hud: HTMLElement;
  helpToggle: HTMLInputElement;
}

// Base width of the terrain plane in local geometry units.
const TERRAIN_WIDTH = 2048;
// Mesh subdivisions along the horizontal axis.  Reduced from 2047 to 1024
// to cut vertex count by ~4x; the overhead of writeZ +
// computeVertexNormals dominates more than the small visual loss for a
// top-down view where texture detail carries most of the perceived
// quality.
const TERRAIN_SEGMENTS = 1024;

export class TerrainViewer {
  #doms: Doms;
  #dtm: DtmHandler;

  #renderer: three.WebGLRenderer;
  #cameraController: TerrainViewerCameraController;
  #scene: three.Scene;
  #terrain: three.Mesh | null = null;
  #terrainSize: ThreePlaneSize = threePlaneSize(1, 1);
  #animationRequestId: number | null = null;

  constructor(doms: Doms, dtm: DtmHandler) {
    this.#doms = doms;
    this.#dtm = dtm;

    this.#renderer = new three.WebGLRenderer({
      canvas: doms.output,
      antialias: false,
    });
    this.#renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // cap DPR for performance
    this.#scene = new three.Scene();

    const light = new three.DirectionalLight(0xffffff, 5); // bright key light to balance the dim ambient
    light.position.set(1, 1, 1);
    this.#scene.add(light);
    this.#scene.add(new three.AmbientLight(0xffffff, 0.09)); // low fill to keep terrain contrast

    this.#cameraController = new TerrainViewerCameraController(
      doms.output,
      new three.PerspectiveCamera(),
      { onToggleHelp: () => this.#toggleHelp() },
    );

    doms.show.addEventListener("click", () => {
      this.#show().catch(printError);
    });
    // The native <dialog> close event fires for Esc key, programmatic close(),
    // or form submit. Use it as the single teardown point so the render loop
    // stops regardless of how the dialog was dismissed.
    doms.dialog.addEventListener("close", () => {
      this.#stopRender();
      this.#disposeTerrain();
    });
    // Clicking inside the HUD (e.g. the Show/Hide Help checkbox) would
    // otherwise move focus off the canvas and break keyboard camera
    // controls until the user clicks back. Suppress the default focus
    // shift on mousedown so the canvas keeps focus while the click event
    // still toggles the control.
    doms.hud.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });

    dtm.addListener(() => this.#updateShowButton());

    this.#updateShowButton().catch(printError);
  }

  async #updateShowButton() {
    this.#doms.show.disabled = (await this.#dtm.size()) === null;
  }

  async #show() {
    await this.#updateElevations();
    this.#doms.dialog.showModal();
    const { clientWidth, clientHeight } = document.documentElement;
    this.#renderer.setSize(clientWidth, clientHeight);
    this.#cameraController.onResizeCanvas(clientWidth / clientHeight);
    this.#doms.output.focus();
    this.#startRender();
  }

  async #updateElevations() {
    this.#disposeTerrain();
    const mapSize = await this.#dtm.size();
    if (mapSize === null) throw Error("Unexpected state");

    this.#terrainSize.width = TERRAIN_WIDTH;
    this.#terrainSize.height = Math.floor(
      (TERRAIN_WIDTH / mapSize.width) * mapSize.height,
    );

    console.time("updateElevations");
    // LOD is not implemented because it would require tiled meshes with
    // distance-based switching and seam stitching.  Halving subdivision
    // provides the majority of the performance benefit for this top-down
    // viewer with negligible visual loss.
    const segmentW = TERRAIN_SEGMENTS;
    const segmentH = Math.max(
      1,
      Math.floor(
        TERRAIN_SEGMENTS * this.#terrainSize.height / this.#terrainSize.width,
      ),
    );
    const geo = new three.PlaneGeometry(
      this.#terrainSize.width,
      this.#terrainSize.height,
      segmentW,
      segmentH,
    );
    geo.clearGroups();
    geo.addGroup(0, Infinity, 0);
    geo.addGroup(0, Infinity, 1);
    await this.#dtm.writeZ(geo);
    geo.computeBoundingSphere();
    geo.computeVertexNormals();
    const map = new three.CanvasTexture(this.#doms.texture);
    map.colorSpace = three.SRGBColorSpace;
    this.#terrain = new three.Mesh(geo, [
      new three.MeshLambertMaterial({ map, transparent: true }),
      // Opaque gray behind the same faces so transparent canvas pixels show
      // a neutral background instead of the scene clear color (black).
      new three.MeshLambertMaterial({ color: new three.Color("lightgray") }),
    ]);
    this.#scene.add(this.#terrain);
    this.#cameraController.onUpdateTerrain(mapSize.width, this.#terrainSize);
    console.timeEnd("updateElevations");
  }

  // three.js does not free GPU resources on GC; geometry, materials and
  // textures must be disposed explicitly or VRAM accumulates each time the
  // viewer is reopened with a different DTM.
  #disposeTerrain(): void {
    if (!this.#terrain) return;
    this.#scene.remove(this.#terrain);
    this.#terrain.geometry.dispose();
    const materials = Array.isArray(this.#terrain.material)
      ? this.#terrain.material
      : [this.#terrain.material];
    for (const m of materials) {
      (m as { map?: three.Texture | null }).map?.dispose();
      m.dispose();
    }
    this.#terrain = null;
  }

  #startRender(): void {
    if (this.#animationRequestId !== null) return;
    const r = (prevTime: number, currentTime: number) => {
      if (!this.#doms.dialog.open) {
        this.#animationRequestId = null;
        return;
      }
      this.#animationRequestId = requestAnimationFrame((t) => {
        r(currentTime, t);
      });
      this.#cameraController.update(currentTime - prevTime);
      this.#renderer.render(this.#scene, this.#cameraController.camera);
    };
    // Seed prev == current via rAF so the first frame's delta is 0.
    // Calling r(0, 0) directly would feed a zero prevTime into the next
    // rAF's high-res currentTime, producing a multi-second delta that
    // snaps the camera if a movement key is already held when the dialog
    // opens.
    this.#animationRequestId = requestAnimationFrame((t) => {
      r(t, t);
    });
  }

  #stopRender(): void {
    if (this.#animationRequestId !== null) {
      cancelAnimationFrame(this.#animationRequestId);
      this.#animationRequestId = null;
    }
  }

  // Drives the existing Show/Hide Help checkbox; its inline oninput
  // handles updating the op-desc visibility, so we just synthesise a
  // click. Bound to the "?" key by the camera controller.
  #toggleHelp() {
    this.#doms.helpToggle.click();
  }
}
