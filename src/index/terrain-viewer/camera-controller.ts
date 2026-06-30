import * as three from "three";
import type { ThreePlaneSize } from "../../types/7dtdmap.ts";
import { threePlaneSize } from "../../lib/utils.ts";

const MOUSE_BUTTON_BITMASK = {
  left: 0b00000001,
  center: 0b00000100,
};

const XY_PLANE = new three.Plane(new three.Vector3(0, 0, 1), 0);
const TILT_AXIS = new three.Vector3(1, 0, 0);
const TILT_REFERENCE = new three.Vector3(0, -1, 0);
const TILT_MAX_RAD = Math.PI / 2; // 90°
const TILT_MIN_RAD = Math.PI / 6; // 30°
const MAX_ELEV = 255;

// Keyboard action set. Movement actions translate to a signed axis speed;
// "toggle-help" is one-shot. Extracted so the keymap can be unit-tested
// independently of the controller and the DOM.
export type CameraKeyAction =
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down"
  | "tilt-up"
  | "tilt-down"
  | "zoom-in"
  | "zoom-out"
  | "toggle-help"
  | null;

interface KeyEventLike {
  code: string;
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export function mapCameraKey(event: KeyEventLike): CameraKeyAction {
  // Defer to the browser when a modifier is held so we do not steal
  // shortcuts like Ctrl+R (reload) or Cmd+Left (history back).
  if (event.ctrlKey || event.altKey || event.metaKey) return null;
  switch (event.code) {
    case "KeyA":
    case "ArrowLeft":
      return "pan-left";
    case "KeyD":
    case "ArrowRight":
      return "pan-right";
    case "KeyW":
    case "ArrowUp":
      return "pan-up";
    case "KeyS":
    case "ArrowDown":
      return "pan-down";
    case "KeyR":
    case "PageUp":
      return "tilt-up";
    case "KeyF":
    case "PageDown":
      return "tilt-down";
    case "Equal":
    case "NumpadAdd":
      return "zoom-in";
    case "Minus":
    case "NumpadSubtract":
      return "zoom-out";
  }
  if (event.key === "?") return "toggle-help";
  return null;
}

interface CameraControllerOptions {
  onToggleHelp?: () => void;
}

export class TerrainViewerCameraController {
  camera: three.PerspectiveCamera;

  #terrainSize = threePlaneSize(1, 1);
  #mapWidth = 1;
  #minZ = 1;
  #maxZ = 1;

  #speeds = { x: 0, y: 0, tilt: 0, zoom: 0 };
  #mouseMove = {
    left: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
    wheel: 0,
  };

  // Reusable temporary vectors / ray to avoid per-frame heap allocation.
  #cameraWork = {
    direction: new three.Vector3(),
    move: new three.Vector3(),
    groundPoint: new three.Vector3(),
    ray: new three.Ray(),
    tiltOffset: new three.Vector3(),
  };

  #syncCameraWork(): void {
    this.camera.getWorldDirection(this.#cameraWork.direction);
    this.#cameraWork.ray.set(this.camera.position, this.#cameraWork.direction);
    const groundPoint = this.#cameraWork.ray.intersectPlane(
      XY_PLANE,
      this.#cameraWork.groundPoint,
    );
    if (groundPoint === null) {
      throw new Error("Camera ray is parallel to the XY plane");
    }
  }

  constructor(
    canvas: HTMLCanvasElement,
    camera: three.PerspectiveCamera,
    options: CameraControllerOptions = {},
  ) {
    this.camera = camera;

    canvas.addEventListener("keydown", (event) => {
      const action = mapCameraKey(event);
      if (action === null) return;
      if (action === "toggle-help") {
        event.preventDefault();
        options.onToggleHelp?.();
        return;
      }
      this.#applyKeyAction(action, true);
      event.preventDefault();
    });
    canvas.addEventListener("keyup", (event) => {
      const action = mapCameraKey(event);
      if (action === null || action === "toggle-help") return;
      this.#applyKeyAction(action, false);
    });
    canvas.addEventListener("wheel", (event) => {
      if (canvas !== document.activeElement || event.deltaY === 0) return;
      event.preventDefault();
      this.#mouseMove.wheel += event.deltaY;
    });
    canvas.addEventListener("mousedown", (event) => {
      if (canvas !== document.activeElement) return;
      if (event.button === 0 || event.button === 1) {
        event.preventDefault();
        // Pointer Lock lets drag-pan and drag-tilt keep delivering
        // movementX/Y once the cursor would otherwise hit the window edge.
        // requestPointerLock must be called from a trusted event such as
        // mousedown; the returned promise is ignored because failures
        // (e.g. user gesture lost) simply fall back to ordinary mousemove.
        if (document.pointerLockElement !== canvas) {
          void canvas.requestPointerLock().catch(() => {});
        }
      }
    });
    const releasePointerLockIfIdle = (event: MouseEvent) => {
      if (
        document.pointerLockElement === canvas &&
        (event.buttons &
            (MOUSE_BUTTON_BITMASK.left | MOUSE_BUTTON_BITMASK.center)) ===
          0
      ) {
        document.exitPointerLock();
      }
    };
    // If the browser drops Pointer Lock (e.g. user presses Escape) the
    // canvas may not receive the subsequent mouseup, so listen on document
    // as well to guarantee cleanup.
    canvas.addEventListener("mouseup", releasePointerLockIfIdle);
    document.addEventListener("mouseup", releasePointerLockIfIdle);
    canvas.addEventListener("mousemove", (event) => {
      const locked = document.pointerLockElement === canvas;
      if (!locked && canvas !== document.activeElement) return;

      if ((event.buttons & MOUSE_BUTTON_BITMASK.left) > 0) {
        event.preventDefault();
        this.#mouseMove.left.x += event.movementX;
        this.#mouseMove.left.y += event.movementY;
      }

      if ((event.buttons & MOUSE_BUTTON_BITMASK.center) > 0) {
        event.preventDefault();
        this.#mouseMove.center.x += event.movementX;
        this.#mouseMove.center.y += event.movementY;
      }
    });
  }

  onResizeCanvas(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  onUpdateTerrain(mapWidth: number, terrainSize: ThreePlaneSize): void {
    this.#mapWidth = mapWidth;
    this.#terrainSize = terrainSize;
    this.#minZ = (MAX_ELEV * terrainSize.width) / mapWidth;
    this.#maxZ = terrainSize.height * 1.2;

    this.camera.far = this.#terrainSize.height * 2;
    this.camera.position.x = 0;
    this.camera.position.y = -this.#terrainSize.height;
    this.camera.position.z = this.#terrainSize.height;
    this.camera.lookAt(0, 0, 0);
    this.#syncCameraWork();
  }

  update(deltaMsec: number): void {
    this.#moveCameraXY(deltaMsec);
    this.#tiltCamera(deltaMsec);
    this.#moveCameraForward(deltaMsec);
  }

  #applyKeyAction(
    action: Exclude<CameraKeyAction, null | "toggle-help">,
    pressed: boolean,
  ) {
    const value = pressed ? 1 : 0;
    switch (action) {
      case "pan-left":
        this.#speeds.x = pressed ? -1 : 0;
        return;
      case "pan-right":
        this.#speeds.x = value;
        return;
      case "pan-down":
        this.#speeds.y = pressed ? -1 : 0;
        return;
      case "pan-up":
        this.#speeds.y = value;
        return;
      case "tilt-down":
        this.#speeds.tilt = pressed ? -1 : 0;
        return;
      case "tilt-up":
        this.#speeds.tilt = value;
        return;
      case "zoom-out":
        this.#speeds.zoom = pressed ? -1 : 0;
        return;
      case "zoom-in":
        this.#speeds.zoom = value;
        return;
    }
  }

  #moveCameraXY(deltaMsec: number) {
    if (
      this.#speeds.x === 0 && this.#speeds.y === 0 &&
      this.#mouseMove.left.x === 0 && this.#mouseMove.left.y === 0
    ) return;

    const scaleFactor = this.#mapWidth / (this.#terrainSize.width + 1);

    const deltaDistKey = (scaleFactor * 120 * 1000 * deltaMsec) / 1000 / 60 /
      60;
    const deltaMouse = this.#mouseMove.left;

    const deltaX = deltaDistKey * this.#speeds.x - deltaMouse.x;
    const deltaY = deltaDistKey * this.#speeds.y + deltaMouse.y;

    this.#mouseMove.left.x = 0;
    this.#mouseMove.left.y = 0;

    if (deltaX !== 0) this.camera.position.x += deltaX;
    if (deltaY !== 0) this.camera.position.y += deltaY;

    this.#syncCameraWork();

    let needResync = false;
    const gx = this.#cameraWork.groundPoint.x;
    const halfW = this.#terrainSize.width / 2;
    if (gx < -halfW || halfW < gx) {
      this.camera.position.x -= deltaX;
      needResync = true;
    }
    const gy = this.#cameraWork.groundPoint.y;
    const halfH = this.#terrainSize.height / 2;
    if (gy < -halfH || halfH < gy) {
      this.camera.position.y -= deltaY;
      needResync = true;
    }
    if (needResync) this.#syncCameraWork();
  }

  #moveCameraForward(deltaMsec: number) {
    if (this.#mouseMove.wheel === 0 && this.#speeds.zoom === 0) return;
    const wheelDelta = (this.#mouseMove.wheel * this.#terrainSize.width) /
      -5000;
    this.#mouseMove.wheel = 0;
    // Keyboard zoom advances roughly 30% of the terrain width per second at
    // speed 1; matches the perceived feel of the mouse wheel at moderate use.
    const keyDelta = (this.#speeds.zoom * this.#terrainSize.width * 0.3 *
      deltaMsec) / 1000;
    const moveDelta = wheelDelta + keyDelta;
    const moveVector = this.#cameraWork.move.copy(this.#cameraWork.direction)
      .multiplyScalar(moveDelta);
    this.camera.position.add(moveVector);
    if (
      this.camera.position.z < this.#minZ || this.#maxZ < this.camera.position.z
    ) {
      this.camera.position.sub(moveVector);
    }
    this.#syncCameraWork();
  }

  #tiltCamera(deltaMsec: number) {
    if (this.#mouseMove.center.y === 0 && this.#speeds.tilt === 0) return;

    // PI rad = 180°
    // -(PI/2) rad / 1000 pixels by mouse
    const deltaRadMouse = this.#mouseMove.center.y * (-(Math.PI / 2) / 1000);

    // PI/4 rad/sec by keypress
    const deltaRadKey = (((this.#speeds.tilt * Math.PI) / 4) * deltaMsec) /
      1000;

    const deltaRad = deltaRadMouse + deltaRadKey;
    this.#mouseMove.center.y = 0;

    const pivot = this.#cameraWork.groundPoint;
    const offset = this.#cameraWork.tiltOffset.copy(this.camera.position)
      .sub(pivot);
    offset.applyAxisAngle(TILT_AXIS, deltaRad);

    const totalRad = TILT_REFERENCE.angleTo(offset);
    const newZ = pivot.z + offset.z;
    const hitsAngleLimit = totalRad < TILT_MIN_RAD || TILT_MAX_RAD < totalRad;
    const hitsZLimit = newZ < this.#minZ || this.#maxZ < newZ;
    if (hitsAngleLimit) {
      offset.applyAxisAngle(TILT_AXIS, -deltaRad);
    } else if (hitsZLimit) {
      offset.z = Math.max(
        this.#minZ - pivot.z,
        Math.min(this.#maxZ - pivot.z, offset.z),
      );
    }

    this.camera.position.copy(pivot).add(offset);
    this.camera.lookAt(pivot);
    this.#syncCameraWork();
  }
}
