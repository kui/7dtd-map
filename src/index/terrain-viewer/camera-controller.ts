import * as three from "three";
import type { ThreePlaneSize } from "../../types/7dtdmap.ts";
import { threePlaneSize } from "../../lib/utils.ts";

const MOUSE_BUTTON_BITMASK = {
  left: 0b00000001,
  center: 0b00000100,
};

const GROUND_PLANE = new three.Plane(new three.Vector3(0, 1, 0), 0);
const TILT_AXIS = new three.Vector3(1, 0, 0);
const TILT_REFERENCE = new three.Vector3(0, 0, 1);
/** 90° in radians. */
const TILT_MAX_RAD = Math.PI / 2;
/** 30° in radians. */
const TILT_MIN_RAD = Math.PI / 6;
const MAX_ELEV = 255;

/** Speed multiplier applied to horizontal pan while Shift is held. */
const PAN_BOOST_MULTIPLIER = 4;

/**
 * Approximate pixel-equivalent multipliers for the non-pixel wheel
 * delta modes. Browsers report line and page units when a discrete
 * wheel is used, so converting to a pixel-like scale keeps zoom speed
 * consistent across input devices.
 */
const WHEEL_LINE_HEIGHT_PX = 16;
const WHEEL_PAGE_HEIGHT_PX = 800;

function normalizeWheelDelta(event: WheelEvent): number {
  switch (event.deltaMode) {
    case WheelEvent.DOM_DELTA_LINE:
      return event.deltaY * WHEEL_LINE_HEIGHT_PX;
    case WheelEvent.DOM_DELTA_PAGE:
      return event.deltaY * WHEEL_PAGE_HEIGHT_PX;
    default:
      return event.deltaY;
  }
}

/**
 * Keyboard action set. Movement actions translate to a signed axis
 * speed. `"toggle-help"` is one-shot. Extracted so the keymap can be
 * unit-tested independently of the controller and the DOM.
 */
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
  // WHY: defer to the browser when a modifier is held so we do not steal shortcuts like Ctrl+R (reload) or Cmd+Left (history back).
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
  #minY = 1;
  #maxY = 1;

  #speeds = { x: 0, y: 0, tilt: 0, zoom: 0 };
  #panBoost = 1;
  #mouseMove = {
    left: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
    wheel: 0,
  };

  /** Reusable temporary vectors and ray to avoid per-frame heap allocation. */
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
      GROUND_PLANE,
      this.#cameraWork.groundPoint,
    );
    if (groundPoint === null) {
      throw new Error("Camera ray is parallel to the XZ plane");
    }
  }

  constructor(
    canvas: HTMLCanvasElement,
    camera: three.PerspectiveCamera,
    options: CameraControllerOptions = {},
  ) {
    this.camera = camera;

    canvas.addEventListener("keydown", (event) => {
      this.#panBoost = event.shiftKey ? PAN_BOOST_MULTIPLIER : 1;
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
      this.#panBoost = event.shiftKey ? PAN_BOOST_MULTIPLIER : 1;
      const action = mapCameraKey(event);
      if (action === null || action === "toggle-help") return;
      this.#applyKeyAction(action, false);
    });
    canvas.addEventListener("wheel", (event) => {
      if (canvas !== document.activeElement || event.deltaY === 0) return;
      event.preventDefault();
      this.#mouseMove.wheel += normalizeWheelDelta(event);
    });
    canvas.addEventListener("mousedown", (event) => {
      if (canvas !== document.activeElement) return;
      if (event.button === 0 || event.button === 1) {
        event.preventDefault();
      }
    });
    canvas.addEventListener("mousemove", (event) => {
      if (canvas !== document.activeElement) return;

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
    this.#minY = (MAX_ELEV * terrainSize.width) / mapWidth;
    this.#maxY = terrainSize.height * 1.2;

    // WHY: keep the far/near ratio bounded so the depth buffer retains precision at the terrain's far edge. The default near of 0.1 paired with a far proportional to terrain size produces a ratio around 40000, which causes Z-fighting on distant geometry.
    this.camera.near = 1;
    this.camera.far = this.#terrainSize.height * 2;
    this.camera.updateProjectionMatrix();
    this.camera.position.x = 0;
    this.camera.position.z = this.#terrainSize.height;
    this.camera.position.y = this.#terrainSize.height;
    this.camera.lookAt(0, 0, 0);
    this.#syncCameraWork();
  }

  update(deltaMsec: number): void {
    this.#moveCameraXZ(deltaMsec);
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

  #moveCameraXZ(deltaMsec: number) {
    if (
      this.#speeds.x === 0 && this.#speeds.y === 0 &&
      this.#mouseMove.left.x === 0 && this.#mouseMove.left.y === 0
    ) return;

    const scaleFactor = this.#mapWidth / (this.#terrainSize.width + 1);

    const deltaDistKey =
      (scaleFactor * 120 * 1000 * deltaMsec * this.#panBoost) / 1000 / 60 / 60;
    const deltaMouse = this.#mouseMove.left;

    const deltaX = deltaDistKey * this.#speeds.x - deltaMouse.x;
    const deltaZ = deltaDistKey * this.#speeds.y + deltaMouse.y;

    this.#mouseMove.left.x = 0;
    this.#mouseMove.left.y = 0;

    if (deltaX !== 0) this.camera.position.x += deltaX;
    // WHY: Z is the negated counterpart of the pre-migration ground Y axis. The -90° X rotation that put the plane in Y-up maps old +Y to new -Z, so panning subtracts here where it used to add.
    if (deltaZ !== 0) this.camera.position.z -= deltaZ;

    this.#syncCameraWork();

    let needResync = false;
    const gx = this.#cameraWork.groundPoint.x;
    const halfW = this.#terrainSize.width / 2;
    if (gx < -halfW || halfW < gx) {
      this.camera.position.x -= deltaX;
      needResync = true;
    }
    const gz = this.#cameraWork.groundPoint.z;
    const halfH = this.#terrainSize.height / 2;
    if (gz < -halfH || halfH < gz) {
      this.camera.position.z += deltaZ;
      needResync = true;
    }
    if (needResync) this.#syncCameraWork();
  }

  #moveCameraForward(deltaMsec: number) {
    if (this.#mouseMove.wheel === 0 && this.#speeds.zoom === 0) return;
    const wheelDelta = (this.#mouseMove.wheel * this.#terrainSize.width) /
      -5000;
    this.#mouseMove.wheel = 0;
    // WHY: keyboard zoom advances roughly 30% of the terrain width per second at speed 1 to match the perceived feel of the mouse wheel at moderate use.
    const keyDelta = (this.#speeds.zoom * this.#terrainSize.width * 0.3 *
      deltaMsec) / 1000;
    const moveDelta = wheelDelta + keyDelta;
    const moveVector = this.#cameraWork.move.copy(this.#cameraWork.direction)
      .multiplyScalar(moveDelta);
    this.camera.position.add(moveVector);
    if (
      this.camera.position.y < this.#minY || this.#maxY < this.camera.position.y
    ) {
      this.camera.position.sub(moveVector);
    }
    this.#syncCameraWork();
  }

  #tiltCamera(deltaMsec: number) {
    if (this.#mouseMove.center.y === 0 && this.#speeds.tilt === 0) return;

    // WHY: mouse tilt uses -(PI/2) rad per 1000 pixels of vertical movement (about 90° per drag height).
    const deltaRadMouse = this.#mouseMove.center.y * (-(Math.PI / 2) / 1000);

    // WHY: keypress tilt uses PI/4 rad per second (about 45°/s at speed 1).
    const deltaRadKey = (((this.#speeds.tilt * Math.PI) / 4) * deltaMsec) /
      1000;

    const deltaRad = deltaRadMouse + deltaRadKey;
    this.#mouseMove.center.y = 0;

    const pivot = this.#cameraWork.groundPoint;
    const offset = this.#cameraWork.tiltOffset.copy(this.camera.position)
      .sub(pivot);
    offset.applyAxisAngle(TILT_AXIS, deltaRad);

    const totalRad = TILT_REFERENCE.angleTo(offset);
    const newY = pivot.y + offset.y;
    const hitsAngleLimit = totalRad < TILT_MIN_RAD || TILT_MAX_RAD < totalRad;
    const hitsYLimit = newY < this.#minY || this.#maxY < newY;
    if (hitsAngleLimit) {
      offset.applyAxisAngle(TILT_AXIS, -deltaRad);
    } else if (hitsYLimit) {
      offset.y = Math.max(
        this.#minY - pivot.y,
        Math.min(this.#maxY - pivot.y, offset.y),
      );
    }

    this.camera.position.copy(pivot).add(offset);
    this.camera.lookAt(pivot);
    this.#syncCameraWork();
  }
}
