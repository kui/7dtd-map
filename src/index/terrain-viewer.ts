import type { DtmHandler } from "./dtm-handler.ts";

import * as three from "three";
import { printError, threePlaneSize } from "../lib/utils.ts";
import { TerrainViewerCameraController } from "./terrain-viewer/camera-controller.ts";

interface Doms {
  output: HTMLCanvasElement;
  texture: HTMLCanvasElement;
  show: HTMLButtonElement;
  close: HTMLButtonElement;
  hud: HTMLElement;
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

    this.#renderer = new three.WebGLRenderer({ canvas: doms.output, antialias: false });
    this.#renderer.setPixelRatio(devicePixelRatio);
    this.#scene = new three.Scene();

    const light = new three.DirectionalLight(0xffffff, 5);
    light.position.set(1, 1, 1).normalize();
    this.#scene.add(light);
    this.#scene.add(new three.AmbientLight(0xffffff, 0.09));

    this.#cameraController = new TerrainViewerCameraController(doms.output, new three.PerspectiveCamera());

    doms.show.addEventListener("click", () => {
      this.#show().catch(printError);
    });
    doms.close.addEventListener("click", () => {
      this.#close();
    });
    doms.output.addEventListener("blur", () => {
      this.#close();
    });

    this.updateShowButton().catch(printError);
  }

  async updateShowButton() {
    this.#doms.show.disabled = (await this.#dtm.size()) === null;
  }

  async #show() {
    await this.#updateElevations();
    const { clientWidth, clientHeight } = document.documentElement;
    this.#renderer.setSize(clientWidth, clientHeight);
    this.#applyVisibleCss();
    this.#cameraController.onResizeCanvas(clientWidth / clientHeight);
    this.#doms.output.focus();
    this.#startRender();
  }

  async #updateElevations() {
    if (this.#terrain) this.#scene.remove(this.#terrain);
    const mapSize = await this.#dtm.size();
    if (mapSize === null) throw Error("Unexpected state");

    this.#terrainSize.width = TERRAIN_WIDTH;
    this.#terrainSize.height = Math.floor((TERRAIN_WIDTH / mapSize.width) * mapSize.height);

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

  #applyVisibleCss() {
    Object.assign(this.#doms.output.style, {
      display: "block",
      zIndex: "100",
      position: "fixed",
      top: "0",
      left: "0",
    });
    Object.assign(this.#doms.hud.style, {
      display: "block",
      zIndex: "101",
      position: "fixed",
      top: "0",
      left: "0",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      color: "#fff",
      padding: "0 16px",
    });
    Object.assign(this.#doms.close.style, {
      display: "block",
      zIndex: "101",
      position: "fixed",
      top: "0",
      right: "0",
    });
  }

  #startRender(): void {
    if (this.#animationRequestId) return;
    const r = (prevTime: number, currentTime: number) => {
      if (this.#doms.output.style.display === "none") {
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

  #close() {
    this.#doms.output.blur();
    this.#doms.output.style.display = "none";
    this.#doms.hud.style.display = "none";
    this.#doms.close.style.display = "none";
  }
}
