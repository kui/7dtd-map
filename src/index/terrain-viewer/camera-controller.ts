import * as three from "three";
import { requireNonnull, threePlaneSize } from "../../lib/utils";

const MOUSE_BUTTON_BITMASK = {
  left: 0b00000001,
  center: 0b00000100,
  right: 0b00000010,
};

const XY_PLANE = new three.Plane(new three.Vector3(0, 0, 1), 0);
const TILT_AXIS = new three.Vector3(1, 0, 0);
const TILT_RADIAN_BASE = new three.Vector3(0, -1, 0);
const TILT_MAX_RAD = Math.PI / 2; // 90°
const TILT_MIN_RAD = Math.PI / 6; // 30°
const MAX_ELEV = 255;

export class TerrainViewerCameraController {
  camera: three.PerspectiveCamera;

  private terrainSize = threePlaneSize(1, 1);
  private mapWidth = 1;
  private minZ = 1;
  private maxZ = 1;

  private speeds = { x: 0, y: 0, tilt: 0 };
  private mouseMove = {
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
    wheel: 0,
  };

  constructor(canvas: HTMLCanvasElement, camera: three.PerspectiveCamera) {
    this.camera = camera;

    canvas.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyA":
          this.speeds.x = -1;
          return;
        case "KeyD":
          this.speeds.x = 1;
          return;
        case "KeyS":
          this.speeds.y = -1;
          return;
        case "KeyW":
          this.speeds.y = 1;
          return;
        case "KeyR":
          this.speeds.tilt = 1;
          return;
        case "KeyF":
          this.speeds.tilt = -1;
          return;
      }
    });
    canvas.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "KeyA":
        case "KeyD":
          this.speeds.x = 0;
          return;
        case "KeyS":
        case "KeyW":
          this.speeds.y = 0;
          return;
        case "KeyR":
        case "KeyF":
          this.speeds.tilt = 0;
          return;
      }
    });
    canvas.addEventListener("wheel", (event) => {
      if (canvas !== document.activeElement || event.deltaY === 0) return;
      event.preventDefault();
      this.mouseMove.wheel += event.deltaY;
    });
    canvas.addEventListener("mousemove", (event) => {
      if (canvas !== document.activeElement) return;

      if ((event.buttons & MOUSE_BUTTON_BITMASK.left) > 0) {
        event.preventDefault();
        this.mouseMove.left.x += event.movementX;
        this.mouseMove.left.y += event.movementY;
      }

      if ((event.buttons & MOUSE_BUTTON_BITMASK.center) > 0) {
        event.preventDefault();
        this.mouseMove.center.x += event.movementX;
        this.mouseMove.center.y += event.movementY;
      }
    });
  }

  onResizeCanvas(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  onUpdateTerrain(mapWidth: number, terrainSize: ThreePlaneSize): void {
    this.mapWidth = mapWidth;
    this.terrainSize = terrainSize;
    this.minZ = (MAX_ELEV * terrainSize.width) / mapWidth;
    this.maxZ = terrainSize.height * 1.2;

    this.camera.far = this.terrainSize.height * 2;
    this.camera.position.x = 0;
    this.camera.position.y = -this.terrainSize.height;
    this.camera.position.z = this.terrainSize.height;
    this.camera.lookAt(0, 0, 0);
  }

  update(deltaMsec: number): void {
    this.moveCameraXY(deltaMsec);
    this.tiltCamera(deltaMsec);
    this.moveCameraForward();
  }

  public moveCameraXY(deltaMsec: number) {
    if (this.speeds.x === 0 && this.speeds.y === 0 && this.mouseMove.left.x === 0 && this.mouseMove.left.y === 0) return;

    const scaleFactor = this.mapWidth / (this.terrainSize.width + 1);

    const deltaDistKey = (scaleFactor * 120 * 1000 * deltaMsec) / 1000 / 60 / 60;
    const deltaMouse = this.mouseMove.left;

    const oldPosition = new three.Vector3().copy(this.camera.position);
    this.camera.position.x += deltaDistKey * this.speeds.x - deltaMouse.x;
    this.camera.position.y += deltaDistKey * this.speeds.y + deltaMouse.y;

    this.mouseMove.left.x = 0;
    this.mouseMove.left.y = 0;

    const lookAt = requireNonnull(this.pointLookAtXYPlane());
    if (lookAt.x < -this.terrainSize.width / 2 || this.terrainSize.width / 2 < lookAt.x) {
      this.camera.position.x = oldPosition.x;
    }
    if (lookAt.y < -this.terrainSize.height / 2 || this.terrainSize.height / 2 < lookAt.y) {
      this.camera.position.y = oldPosition.y;
    }
  }

  private moveCameraForward() {
    if (this.mouseMove.wheel === 0) return;
    const moveDelta = (this.mouseMove.wheel * this.terrainSize.width) / -5000;
    this.mouseMove.wheel = 0;
    const cameraDirection = this.camera.getWorldDirection(new three.Vector3());
    const moveVector = cameraDirection.normalize().multiplyScalar(moveDelta);
    this.camera.position.add(moveVector);
    if (this.camera.position.z < this.minZ || this.maxZ < this.camera.position.z) {
      this.camera.position.sub(moveVector);
    }
  }

  private tiltCamera(deltaMsec: number) {
    if (this.mouseMove.center.y === 0 && this.speeds.tilt === 0) return;

    // PI rad = 180°
    // -(PI/2) rad / 1000 pixels by mouse
    const deltaRadMouseY = this.mouseMove.center.y * (-(Math.PI / 2) / 1000);

    // PI/4 rad/sec by keypress
    const deltaRadKey = (((this.speeds.tilt * Math.PI) / 4) * deltaMsec) / 1000;

    const deltaRadY = deltaRadMouseY + deltaRadKey;
    this.mouseMove.center.y = 0;

    const center = requireNonnull(this.pointLookAtXYPlane());
    this.camera.position.sub(center);
    this.camera.position.applyAxisAngle(TILT_AXIS, deltaRadY);

    const totalRad = TILT_RADIAN_BASE.angleTo(this.camera.position);
    if (totalRad < TILT_MIN_RAD || TILT_MAX_RAD < totalRad || this.camera.position.z < this.minZ || this.maxZ < this.camera.position.z) {
      this.camera.position.applyAxisAngle(TILT_AXIS, -deltaRadY);
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
