import * as three from "three";
import { Dtm } from "./dtm-handler";
import { throttledInvoker } from "../lib/throttled-invoker";

interface Doms {
  outputCanvas: HTMLCanvasElement;
  textureCanvas: HTMLCanvasElement;
  showButton: HTMLButtonElement;
}

export class TerrainViewer {
  private doms: Doms;
  private renderer: three.WebGLRenderer;
  camera: three.PerspectiveCamera;
  private scene: three.Scene;
  private terrain: three.Mesh | null = null;
  private terrainSize: ThreePlaneSize;
  private texture: three.Texture;
  private animationRequestId: number | null = null;
  private cameraMoveSpeed: { x: number; y: number };
  dtm: Dtm | null = null;
  mapSize: GameMapSize | null = null;
  updateElevations = throttledInvoker(() => this.updateElevationsImmediatly());

  constructor(doms: Doms, canvasWidth: number, terrainSize: ThreePlaneSize) {
    this.doms = doms;
    this.cameraMoveSpeed = { x: 0, y: 0 };
    this.terrainSize = terrainSize;
    this.texture = new three.CanvasTexture(doms.textureCanvas);
    this.renderer = new three.WebGLRenderer({ canvas: doms.outputCanvas, antialias: false });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(canvasWidth, canvasWidth);
    this.camera = new three.PerspectiveCamera();
    this.scene = new three.Scene();

    const light = new three.DirectionalLight(0xffffff, 1.2);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.scene.add(new three.AmbientLight(0xffffff, 0.1));

    this.startRender();
    doms.showButton.addEventListener("click", () => {
      doms.outputCanvas.style.display = "block";
      this.camera.updateProjectionMatrix();
      this.startRender();
    });
    doms.outputCanvas.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyA":
          this.startCameraMove(-1, 0);
          return;
        case "KeyD":
          this.startCameraMove(1, 0);
          return;
        case "KeyS":
          this.startCameraMove(0, -1);
          return;
        case "KeyW":
          this.startCameraMove(0, 1);
          return;
      }
    });
    doms.outputCanvas.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "KeyA":
          this.stopCameraMove(-1, 0);
          return;
        case "KeyD":
          this.stopCameraMove(1, 0);
          return;
        case "KeyS":
          this.stopCameraMove(0, -1);
          return;
        case "KeyW":
          this.stopCameraMove(0, 1);
          return;
      }
    });
    doms.outputCanvas.addEventListener("wheel", (event) => {
      if (doms.outputCanvas !== document.activeElement || event.deltaY === 0) return;
      event.preventDefault();
      this.moveCameraForward(event.deltaY);
    });
  }

  markCanvasUpdate(): void {
    this.texture.needsUpdate = true;
  }

  startRender(): void {
    if (this.animationRequestId) return;
    const r = (prevTime: number, currentTime: number) => {
      const delta = currentTime - prevTime;
      if (this.doms.outputCanvas.style.display === "none") {
        this.animationRequestId = null;
        return;
      }
      this.animationRequestId = requestAnimationFrame((t) => r(currentTime, t));
      this.moveCamera(delta);
      this.renderer.render(this.scene, this.camera);
    };
    r(0, 0);
  }

  updateElevationsImmediatly(): void {
    if (this.terrain) this.scene.remove(this.terrain);
    if (!this.dtm || !this.mapSize || this.mapSize.width === 0 || this.mapSize.height === 0) return;

    console.time("updateElevations");
    const geo = new three.PlaneBufferGeometry(
      this.terrainSize.width,
      this.terrainSize.height,
      this.terrainSize.width - 1,
      this.terrainSize.height - 1
    );
    const material = new three.MeshLambertMaterial({ map: this.texture });
    const pos = geo.attributes.position;
    const scaleFactor = this.mapSize.width / (this.terrainSize.width + 1);
    for (let i = 0; i < pos.count; i++) {
      // game axies -> webgl axies
      // x -> x
      // y -> z
      // z -> y
      const ingameX = Math.round((pos.getX(i) + this.terrainSize.width / 2) * scaleFactor);
      const ingameZ = Math.round((pos.getY(i) + this.terrainSize.height / 2) * scaleFactor);
      const elev = this.dtm.data[ingameX + ingameZ * this.mapSize.width] / scaleFactor;
      pos.setZ(i, elev);
    }
    geo.computeBoundingSphere();
    geo.computeVertexNormals();
    this.terrain = new three.Mesh(geo, material);
    this.scene.add(this.terrain);
    console.timeEnd("updateElevations");
  }

  private startCameraMove(xAxis: number, yAxis: number) {
    if (xAxis) this.cameraMoveSpeed.x = xAxis;
    if (yAxis) this.cameraMoveSpeed.y = yAxis;
  }
  private stopCameraMove(xAxis: number, yAxis: number) {
    if (xAxis) this.cameraMoveSpeed.x = 0;
    if (yAxis) this.cameraMoveSpeed.y = 0;
  }

  private moveCamera(deltaMsec: number) {
    if (!this.mapSize) return;
    if (this.cameraMoveSpeed.x === 0 && this.cameraMoveSpeed.y === 0) return;

    const scaleFactor = this.mapSize.width / (this.terrainSize.width + 1);

    // 120 km/h
    const deltaDist = (scaleFactor * 120 * 1000 * deltaMsec) / 1000 / 60 / 60;

    this.camera.position.x += deltaDist * this.cameraMoveSpeed.x;
    this.camera.position.y += deltaDist * this.cameraMoveSpeed.y;
  }

  private moveCameraForward(pixels: number) {
    if (!this.mapSize) return;
    const moveDelta = pixels / -10;
    const cameraDirection = this.camera.getWorldDirection(new three.Vector3());
    const moveVector = cameraDirection.normalize().multiplyScalar(moveDelta);
    this.camera.position.add(moveVector);
  }
}
