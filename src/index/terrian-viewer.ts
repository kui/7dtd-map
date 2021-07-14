import * as three from "three";
import { Dtm } from "./dtm-handler";
import { throttledInvoker } from "../lib/throttled-invoker";
import { requireNonnull } from "../lib/utils";

interface Doms {
  outputCanvas: HTMLCanvasElement;
  textureCanvas: HTMLCanvasElement;
  showButton: HTMLButtonElement;
}

const MOUSE_BUTTON_BITMASK = {
  left: 0b00000001,
  center: 0b00000100,
};

const XY_PLANE = new three.Plane(new three.Vector3(0, 0, 1), 0);
const TILT_AXIS = new three.Vector3(1, 0, 0);
const TILT_RADIAN_BASE = new three.Vector3(0, -1, 0);
const TILT_MAX_RAD = Math.PI / 2; // 90°
const TILT_MIN_RAD = Math.PI / 6; // 30°
const MIN_Z = 255;
const MAX_Z = 1500;

export class TerrainViewer {
  private doms: Doms;
  private renderer: three.WebGLRenderer;
  camera: three.PerspectiveCamera;
  private scene: three.Scene;
  private terrain: three.Mesh | null = null;
  private terrainSize: ThreePlaneSize;
  private texture: three.Texture;
  private animationRequestId: number | null = null;
  private mouseDeltaPixels = {
    left: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
  };
  dtm: Dtm | null = null;
  mapSize: GameMapSize | null = null;
  updateElevations = throttledInvoker(() => this.updateElevationsImmediatly());

  private cameraXYMoveSpeed = { x: 0, y: 0 };
  private cameraTiltSpeed = 0;

  constructor(doms: Doms, canvasWidth: number, terrainSize: ThreePlaneSize) {
    this.doms = doms;
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
          this.cameraXYMoveSpeed.x = -1;
          return;
        case "KeyD":
          this.cameraXYMoveSpeed.x = 1;
          return;
        case "KeyS":
          this.cameraXYMoveSpeed.y = -1;
          return;
        case "KeyW":
          this.cameraXYMoveSpeed.y = 1;
          return;
        case "KeyR":
          this.cameraTiltSpeed = 1;
          return;
        case "KeyF":
          this.cameraTiltSpeed = -1;
          return;
      }
    });
    doms.outputCanvas.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "KeyA":
        case "KeyD":
          this.cameraXYMoveSpeed.x = 0;
          return;
        case "KeyS":
        case "KeyW":
          this.cameraXYMoveSpeed.y = 0;
          return;
        case "KeyR":
        case "KeyF":
          this.cameraTiltSpeed = 0;
          return;
      }
    });
    doms.outputCanvas.addEventListener("wheel", (event) => {
      if (doms.outputCanvas !== document.activeElement || event.deltaY === 0) return;
      event.preventDefault();
      this.moveCameraForward(event.deltaY);
    });

    doms.outputCanvas.addEventListener("mousemove", (event) => {
      if (doms.outputCanvas !== document.activeElement) return;

      if ((event.buttons & MOUSE_BUTTON_BITMASK.left) > 0) {
        event.preventDefault();
        this.mouseDeltaPixels.left.x += event.movementX;
        this.mouseDeltaPixels.left.y += event.movementY;
      }

      if ((event.buttons & MOUSE_BUTTON_BITMASK.center) > 0) {
        event.preventDefault();
        this.mouseDeltaPixels.center.x += event.movementX;
        this.mouseDeltaPixels.center.y += event.movementY;
      }
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
      this.moveCameraXY(delta);
      this.tiltCamera(delta);
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

  private moveCameraXY(deltaMsec: number) {
    if (!this.mapSize || !this.terrain) return;
    if (
      this.cameraXYMoveSpeed.x === 0 &&
      this.cameraXYMoveSpeed.y === 0 &&
      this.mouseDeltaPixels.left.x === 0 &&
      this.mouseDeltaPixels.left.y === 0
    )
      return;

    const scaleFactor = this.mapSize.width / (this.terrainSize.width + 1);

    // 120 km/h by key press
    const deltaDistKey = (scaleFactor * 120 * 1000 * deltaMsec) / 1000 / 60 / 60;

    const deltaMouse = this.mouseDeltaPixels.left;

    const oldPosition = new three.Vector3().copy(this.camera.position);
    this.camera.position.x += deltaDistKey * this.cameraXYMoveSpeed.x - deltaMouse.x;
    this.camera.position.y += deltaDistKey * this.cameraXYMoveSpeed.y + deltaMouse.y;

    this.mouseDeltaPixels.left.x = 0;
    this.mouseDeltaPixels.left.y = 0;

    const lookAt = requireNonnull(this.pointLookAtXYPlane());
    if (lookAt.x < -this.terrainSize.width / 2 || this.terrainSize.width / 2 < lookAt.x) {
      this.camera.position.x = oldPosition.x;
    }
    if (lookAt.y < -this.terrainSize.height / 2 || this.terrainSize.height / 2 < lookAt.y) {
      this.camera.position.y = oldPosition.y;
    }
  }

  private moveCameraForward(pixels: number) {
    if (!this.mapSize || pixels === 0) return;
    const moveDelta = pixels / -5;
    const cameraDirection = this.camera.getWorldDirection(new three.Vector3());
    const moveVector = cameraDirection.normalize().multiplyScalar(moveDelta);
    this.camera.position.add(moveVector);
    if (this.camera.position.z < MIN_Z || MAX_Z < this.camera.position.z) {
      this.camera.position.sub(moveVector);
    }
  }

  private tiltCamera(deltaMsec: number) {
    if (this.mouseDeltaPixels.center.y === 0 && this.cameraTiltSpeed === 0) return;

    // PI rad = 180°
    // -(PI/2) rad / 1000 pixels by mouse
    const deltaRadMouse = this.mouseDeltaPixels.center.y * (-(Math.PI / 2) / 1000);

    // PI/4 rad/sec by keypress
    const deltaRadKey = (((this.cameraTiltSpeed * Math.PI) / 4) * deltaMsec) / 1000;

    const deltaRad = deltaRadMouse + deltaRadKey;
    this.mouseDeltaPixels.center.y = 0;

    const center = requireNonnull(this.pointLookAtXYPlane());
    this.camera.position.sub(center);
    this.camera.position.applyAxisAngle(TILT_AXIS, deltaRad);

    const totalRad = TILT_RADIAN_BASE.angleTo(this.camera.position);
    if (totalRad < TILT_MIN_RAD || TILT_MAX_RAD < totalRad || this.camera.position.z < MIN_Z || MAX_Z < this.camera.position.z) {
      this.camera.position.applyAxisAngle(TILT_AXIS, -deltaRad);
    }

    this.camera.position.add(center);
    this.camera.lookAt(center);
  }

  private pointLookAtXYPlane() {
    const cameraDirection = this.camera.getWorldDirection(new three.Vector3());
    const cameraRay = new three.Ray(this.camera.position, cameraDirection);
    return cameraRay.intersectPlane(XY_PLANE, new three.Vector3());
  }
}
