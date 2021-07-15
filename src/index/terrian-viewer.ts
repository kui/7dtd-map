import * as three from "three";
import { Dtm } from "./dtm-handler";
import { throttledInvoker } from "../lib/throttled-invoker";
import { requireNonnull, threePlaneSize } from "../lib/utils";

interface Doms {
  output: HTMLCanvasElement;
  texture: HTMLCanvasElement;
  show: HTMLButtonElement;
  close: HTMLButtonElement;
  hud: HTMLElement;
}

const MOUSE_BUTTON_BITMASK = {
  left: 0b00000001,
  center: 0b00000100,
};

const TERRAIN_WIDTH = 2048;
const XY_PLANE = new three.Plane(new three.Vector3(0, 0, 1), 0);
const TILT_AXIS = new three.Vector3(1, 0, 0);
const TILT_RADIAN_BASE = new three.Vector3(0, -1, 0);
const TILT_MAX_RAD = Math.PI / 2; // 90°
const TILT_MIN_RAD = Math.PI / 6; // 30°
const MIN_Z = 255;
const MAX_Z = TERRAIN_WIDTH;

export class TerrainViewer {
  private doms: Doms;
  private renderer: three.WebGLRenderer;
  camera: three.PerspectiveCamera;
  private scene: three.Scene;
  private terrain: three.Mesh | null = null;
  private terrainSize: ThreePlaneSize = threePlaneSize(1, 1);
  private texture: three.Texture;
  private animationRequestId: number | null = null;
  private mouseDeltaPixels = {
    left: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
    wheel: 0,
  };
  dtm: Dtm | null = null;
  mapSize: GameMapSize | null = null;
  updateElevations = throttledInvoker(() => this.updateElevationsImmediatly());

  private cameraXYMoveSpeed = { x: 0, y: 0 };
  private cameraTiltSpeed = 0;

  constructor(doms: Doms) {
    this.doms = doms;
    this.texture = new three.CanvasTexture(doms.texture);
    this.renderer = new three.WebGLRenderer({ canvas: doms.output, antialias: false });
    this.renderer.setPixelRatio(devicePixelRatio);
    //this.renderer.setSize(canvasWidth, canvasWidth);
    this.camera = new three.PerspectiveCamera();
    this.scene = new three.Scene();

    const light = new three.DirectionalLight(0xffffff, 1.2);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.scene.add(new three.AmbientLight(0xffffff, 0.1));

    this.startRender();
    doms.show.addEventListener("click", () => {
      const { clientWidth, clientHeight } = document.documentElement;
      this.renderer.setSize(clientWidth, clientHeight);
      this.show();
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
      this.doms.output.focus();
      this.startRender();
    });
    doms.close.addEventListener("click", () => {
      this.close();
    });
    doms.output.addEventListener("keydown", (event) => {
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
        case "Escape":
          this.close();
          return;
      }
    });
    doms.output.addEventListener("keyup", (event) => {
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
    doms.output.addEventListener("wheel", (event) => {
      if (doms.output !== document.activeElement || event.deltaY === 0) return;
      event.preventDefault();
      this.mouseDeltaPixels.wheel += event.deltaY;
    });
    doms.output.addEventListener("mousedown", (event) => {
      if (doms.output !== document.activeElement) return;
      if (event.button === 0 || event.button === 1) {
        event.preventDefault();
      }
    });
    doms.output.addEventListener("mousemove", (event) => {
      if (doms.output !== document.activeElement) return;

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
      if (this.doms.output.style.display === "none") {
        this.animationRequestId = null;
        return;
      }
      this.animationRequestId = requestAnimationFrame((t) => r(currentTime, t));
      const delta = currentTime - prevTime;
      this.moveCameraXY(delta);
      this.tiltCamera(delta);
      this.moveCameraForward();
      this.renderer.render(this.scene, this.camera);
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

    this.camera.far = this.terrainSize.height * 2;
    this.camera.position.x = 0;
    this.camera.position.y = -this.terrainSize.height;
    this.camera.position.z = this.terrainSize.height;
    this.camera.lookAt(0, 0, 0);

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

  private moveCameraForward() {
    if (this.mouseDeltaPixels.wheel === 0) return;
    const moveDelta = this.mouseDeltaPixels.wheel / -5;
    this.mouseDeltaPixels.wheel = 0;
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

  private show() {
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
      backgroundColor: "rgba(100, 100, 100, 0.5)",
      color: "#fff",
      padding: "10px",
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
