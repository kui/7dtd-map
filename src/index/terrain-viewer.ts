import * as three from "three";
import { Dtm } from "./dtm-handler";
import { throttledInvoker } from "../lib/throttled-invoker";
import { requireNonnull, threePlaneSize } from "../lib/utils";
import { TerrainViewerCameraController } from "./terrain-viewer/camera-controller";

interface Doms {
  output: HTMLCanvasElement;
  texture: HTMLCanvasElement;
  show: HTMLButtonElement;
  close: HTMLButtonElement;
  hud: HTMLElement;
}

const TERRAIN_WIDTH = 2048;

export class TerrainViewer {
  private doms: Doms;
  private renderer: three.WebGLRenderer;
  private cameraController: TerrainViewerCameraController;
  private scene: three.Scene;
  private terrain: three.Mesh | null = null;
  private terrainSize: ThreePlaneSize = threePlaneSize(1, 1);
  private texture: three.Texture;
  private animationRequestId: number | null = null;

  private _dtm: Dtm | null = null;
  private _mapSize: GameMapSize | null = null;

  updateElevations = throttledInvoker(() => {
    this.updateElevationsImmediatly();
  }, 1000);

  constructor(doms: Doms) {
    this.doms = doms;
    this.texture = new three.CanvasTexture(doms.texture);
    this.texture.colorSpace = three.SRGBColorSpace;
    this.renderer = new three.WebGLRenderer({ canvas: doms.output, antialias: false });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.scene = new three.Scene();

    const light = new three.DirectionalLight(0xffffff, 5);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);
    this.scene.add(new three.AmbientLight(0xffffff, 0.09));

    this.cameraController = new TerrainViewerCameraController(doms.output, new three.PerspectiveCamera());

    doms.show.addEventListener("click", () => {
      this.show();
    });
    doms.close.addEventListener("click", () => {
      this.close();
    });
    doms.output.addEventListener("keydown", (event) => {
      if (event.code === "Escape") this.close();
    });

    this.updateShowButton();
  }

  get dtm(): Dtm | null {
    return this._dtm;
  }

  set dtm(d: Dtm | null) {
    this._dtm = d;
    this.updateShowButton();
  }

  get mapSize(): GameMapSize | null {
    return this._mapSize;
  }

  set mapSize(s: GameMapSize | null) {
    this._mapSize = s;
    this.updateShowButton();
  }

  updateShowButton(): void {
    this.doms.show.disabled = !this.mapSize || this.mapSize.width === 0 || this.mapSize.height === 0 || !this.dtm;
  }

  markCanvasUpdate(): void {
    this.texture.needsUpdate = true;
  }

  startRender(): void {
    if (this.animationRequestId) return;
    this.markCanvasUpdate();
    const r = (prevTime: number, currentTime: number) => {
      if (this.doms.output.style.display === "none") {
        this.animationRequestId = null;
        return;
      }
      this.animationRequestId = requestAnimationFrame((t) => {
        r(currentTime, t);
      });
      this.cameraController.update(currentTime - prevTime);
      this.renderer.render(this.scene, this.cameraController.camera);
    };
    r(0, 0);
  }

  updateElevationsImmediatly(): void {
    if (this.terrain) this.scene.remove(this.terrain);
    if (!this.dtm || !this.mapSize || this.mapSize.width === 0 || this.mapSize.height === 0) return;

    this.terrainSize.width = TERRAIN_WIDTH;
    this.terrainSize.height = Math.floor((TERRAIN_WIDTH / this.mapSize.width) * this.mapSize.height);

    console.log("terrainSize=", this.terrain, "mapSize=", this.mapSize);
    console.time("updateElevations");
    const geo = new three.PlaneGeometry(
      this.terrainSize.width,
      this.terrainSize.height,
      this.terrainSize.width - 1,
      this.terrainSize.height - 1,
    );
    geo.clearGroups();
    geo.addGroup(0, Infinity, 0);
    geo.addGroup(0, Infinity, 1);
    const materials = [
      new three.MeshLambertMaterial({ map: this.texture, transparent: true }),
      // Require a fallback mesh because the canvas of 7dtd-map can contain transparent pixels
      new three.MeshLambertMaterial({ color: new three.Color("lightgray") }),
    ];
    const pos = requireNonnull(geo.attributes["position"]);
    const scaleFactor = this.mapSize.width / (this.terrainSize.width + 1);
    for (let i = 0; i < pos.count; i++) {
      // game axis -> webgl axis
      // x -> x
      // y -> z
      // z -> y
      const ingameX = Math.round((pos.getX(i) + this.terrainSize.width / 2) * scaleFactor);
      const ingameZ = Math.round((pos.getY(i) + this.terrainSize.height / 2) * scaleFactor);
      const elev =
        requireNonnull(
          this.dtm.data[ingameX + ingameZ * this.mapSize.width],
          () => `Unexpected coords: ${ingameX.toString()}, ${ingameZ.toString()}`,
        ) / scaleFactor;
      pos.setZ(i, elev);
    }
    geo.computeBoundingSphere();
    geo.computeVertexNormals();
    this.terrain = new three.Mesh(geo, materials);
    this.scene.add(this.terrain);
    this.cameraController.onUpdateTerrain(this.mapSize.width, this.terrainSize);
    console.timeEnd("updateElevations");
  }

  private show() {
    const { clientWidth, clientHeight } = document.documentElement;
    this.renderer.setSize(clientWidth, clientHeight);
    this.applyVisibleCss();
    this.cameraController.onResizeCanvas(clientWidth / clientHeight);
    this.doms.output.focus();
    this.startRender();
  }

  private applyVisibleCss() {
    Object.assign(this.doms.output.style, {
      display: "block",
      zIndex: "100",
      position: "fixed",
      top: "0",
      left: "0",
    });
    Object.assign(this.doms.hud.style, {
      display: "block",
      zIndex: "101",
      position: "fixed",
      top: "0",
      left: "0",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      color: "#fff",
      padding: "0 16px",
    });
    Object.assign(this.doms.close.style, {
      display: "block",
      zIndex: "101",
      position: "fixed",
      top: "0",
      right: "0",
    });
  }

  private close() {
    this.doms.output.blur();
    this.doms.output.style.display = "none";
    this.doms.hud.style.display = "none";
    this.doms.close.style.display = "none";
  }
}
