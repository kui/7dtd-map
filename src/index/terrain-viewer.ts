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

const TERRAIN_WIDTH = 2048;

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
    this.#renderer.setPixelRatio(devicePixelRatio);
    this.#scene = new three.Scene();

    const light = new three.DirectionalLight(0xffffff, 5);
    light.position.set(1, 1, 1).normalize();
    this.#scene.add(light);
    this.#scene.add(new three.AmbientLight(0xffffff, 0.09));

    this.#cameraController = new TerrainViewerCameraController(
      doms.output,
      new three.PerspectiveCamera(),
      { onToggleHelp: () => this.#toggleHelp() },
    );

    doms.show.addEventListener("click", () => {
      this.#show().catch(printError);
    });
    doms.close.addEventListener("click", () => {
      doms.dialog.close();
    });
    // The native <dialog> close event fires for Esc key, programmatic close(),
    // or form submit. Use it as the single teardown point so the render loop
    // stops regardless of how the dialog was dismissed.
    doms.dialog.addEventListener("close", () => {
      this.#stopRender();
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
    if (this.#terrain) this.#scene.remove(this.#terrain);
    const mapSize = await this.#dtm.size();
    if (mapSize === null) throw Error("Unexpected state");

    this.#terrainSize.width = TERRAIN_WIDTH;
    this.#terrainSize.height = Math.floor(
      (TERRAIN_WIDTH / mapSize.width) * mapSize.height,
    );

    console.log("terrainSize=", this.#terrain, "mapSize=", mapSize);
    console.time("updateElevations");
    const geo = new three.PlaneGeometry(
      this.#terrainSize.width,
      this.#terrainSize.height,
      this.#terrainSize.width - 1,
      this.#terrainSize.height - 1,
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
      // Require a fallback mesh because the canvas of 7dtd-map can contain transparent pixels
      new three.MeshLambertMaterial({ color: new three.Color("lightgray") }),
    ]);
    this.#scene.add(this.#terrain);
    this.#cameraController.onUpdateTerrain(mapSize.width, this.#terrainSize);
    console.timeEnd("updateElevations");
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
    r(0, 0);
  }

  #stopRender(): void {
    if (this.#animationRequestId !== null) {
      cancelAnimationFrame(this.#animationRequestId);
      this.#animationRequestId = null;
    }
  }

  // Drives the existing Show/Hide Help checkbox; its inline oninput
  // handles updating the op_desc visibility, so we just synthesise a
  // click. Bound to the "?" key by the camera controller.
  #toggleHelp() {
    this.#doms.helpToggle.click();
  }
}
