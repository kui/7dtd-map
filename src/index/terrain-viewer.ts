import type { DtmHandler } from "./dtm-handler.ts";
import type { PrefabsHandler } from "./prefabs-handler.ts";
import type { MarkerHandler } from "./marker-handler.ts";
import type { PrefabTooltipController } from "../lib/prefab-tooltip.ts";
import type {
  DistrictColors,
  GameCoords,
  GameMapSize,
  GlyphMarker,
  Prefab,
  PrefabDensityScores,
  PrefabMeshSizes,
  ThreePlaneSize,
} from "../types/7dtdmap.ts";

import * as three from "three";
import { gameCoords, printError, threePlaneSize } from "../lib/utils.ts";
import { TerrainViewerCameraController } from "./terrain-viewer/camera-controller.ts";
import {
  buildMarkerSprites,
  type MarkerPlacement,
  type MarkerSprites,
} from "./terrain-viewer/marker-sprites.ts";
import {
  type BoxHighlight,
  type BoxPlacement,
  buildBoxHighlight,
  buildPrefabBoxes,
  type PrefabBoxes,
} from "./terrain-viewer/prefab-boxes.ts";
import { buildTileIndex, footprintColorRgb } from "../lib/footprint-color.ts";
import { EXCLUDED_NAME_FRAGMENTS } from "../lib/prefab-hit-index.ts";
import { TerrainViewerHoverController } from "./terrain-viewer/hover-controller.ts";

interface Doms {
  dialog: HTMLDialogElement;
  output: HTMLCanvasElement;
  texture: HTMLCanvasElement;
  show: HTMLButtonElement;
  close: HTMLButtonElement;
  hud: HTMLElement;
  helpToggle: HTMLInputElement;
  signSize: HTMLInputElement;
  signAlpha: HTMLInputElement;
  footprintAlpha: HTMLInputElement;
}

// Base width of the terrain plane in local geometry units.
const TERRAIN_WIDTH = 2048;
// Mesh subdivisions along the horizontal axis.  Reduced from 2047 to 1024
// to cut vertex count by ~4x; the overhead of writeY +
// computeVertexNormals dominates more than the small visual loss for a
// top-down view where texture detail carries most of the perceived
// quality.
const TERRAIN_SEGMENTS = 1024;
// Measured on Pregen06k01: a decoration's y sits ~1 block above the DTM
// surface (signed mean +1.01 over 1590 POIs), so drop it one block to sit flush.
const DECORATION_Y_TO_DTM = -1;

export class TerrainViewer {
  #doms: Doms;
  #dtm: DtmHandler;
  #meshSizes: Promise<PrefabMeshSizes>;
  #signMarker: Promise<GlyphMarker>;
  #flagMarker: Promise<GlyphMarker>;

  #renderer: three.WebGLRenderer;
  #cameraController: TerrainViewerCameraController;
  #scene: three.Scene;
  #terrain: three.Mesh | null = null;
  #terrainSize: ThreePlaneSize = threePlaneSize(1, 1);
  #animationRequestId: number | null = null;
  #markers: MarkerSprites | null = null;
  #boxes: PrefabBoxes | null = null;
  #hover: TerrainViewerHoverController;
  #highlight: BoxHighlight | null = null;
  // Placement currently drawn as the hover highlight, synced each frame from
  // the tooltip handler's raycast result.
  #highlightedPlacement: BoxPlacement | null = null;
  #filteredPrefabs: Prefab[] = [];
  #allPrefabs: Prefab[] = [];
  #districtColors: Promise<DistrictColors>;
  #densityScores: Promise<PrefabDensityScores>;
  #markerCoords: GameCoords | null = null;
  // Cached so that each terrain-build phase does not re-await the same value.
  #mapSize: GameMapSize | null = null;

  constructor(
    doms: Doms,
    dtm: DtmHandler,
    prefabsHandler: PrefabsHandler,
    markerHandler: MarkerHandler,
    meshSizes: Promise<PrefabMeshSizes>,
    signMarker: Promise<GlyphMarker>,
    flagMarker: Promise<GlyphMarker>,
    districtColors: Promise<DistrictColors>,
    densityScores: Promise<PrefabDensityScores>,
    tooltipController: PrefabTooltipController,
  ) {
    this.#doms = doms;
    this.#dtm = dtm;
    this.#meshSizes = meshSizes;
    this.#signMarker = signMarker;
    this.#flagMarker = flagMarker;
    this.#districtColors = districtColors;
    this.#densityScores = densityScores;

    prefabsHandler.addFilterHeaderListener(() => {
      this.#filteredPrefabs.length = 0;
    });
    prefabsHandler.addFilterChunkListener(({ prefabs }) => {
      for (const p of prefabs) {
        this.#filteredPrefabs.push({
          name: p.name,
          x: p.x,
          y: p.y,
          z: p.z,
          rotation: p.rotation,
        });
      }
    });
    prefabsHandler.addAllPrefabsListener(({ all }) => {
      this.#allPrefabs = all;
    });
    markerHandler.addListener(({ coords }) => {
      this.#markerCoords = coords;
    });

    this.#renderer = new three.WebGLRenderer({
      canvas: doms.output,
      antialias: false,
    });
    this.#renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // cap DPR for performance
    this.#scene = new three.Scene();
    // Neutral background shows through transparent texture pixels instead of
    // the renderer's default black clear color.
    this.#scene.background = new three.Color("#111111");

    const light = new three.DirectionalLight(0xffffff, 5); // bright key light to balance the dim ambient
    // Only the terrain mesh is rotated -90° around X (see #updateElevations)
    // to become Y-up; rotate this fixed light position the same way so it
    // keeps the same angle relative to the terrain surface as before.
    light.position.set(1, 1, -1);
    this.#scene.add(light);
    this.#scene.add(new three.AmbientLight(0xffffff, 0.09)); // low fill to keep terrain contrast

    this.#cameraController = new TerrainViewerCameraController(
      doms.output,
      new three.PerspectiveCamera(),
      { onToggleHelp: () => this.#toggleHelp() },
    );
    this.#hover = new TerrainViewerHoverController(
      doms.output,
      this.#cameraController.camera,
      tooltipController,
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
      this.#disposeMarkers();
      this.#disposeBoxes();
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
    this.#mapSize = await this.#dtm.size();
    this.#doms.show.disabled = this.#mapSize === null;
  }

  async #show() {
    await this.#updateShowButton();
    const mapSize = this.#mapSize;
    if (!mapSize) throw Error("Unexpected state");
    await this.#updateElevations(mapSize);
    await this.#updateBoxes(mapSize);
    await this.#updateMarkers(mapSize);
    this.#doms.dialog.showModal();
    const { clientWidth, clientHeight } = document.documentElement;
    this.#renderer.setSize(clientWidth, clientHeight);
    this.#cameraController.onResizeCanvas(clientWidth / clientHeight);
    this.#doms.output.focus();
    this.#startRender();
  }

  async #updateElevations(mapSize: GameMapSize) {
    this.#disposeTerrain();

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
    // Default PlaneGeometry lies in the XY plane (+Z normal); rotate into
    // the XZ ground plane (+Y normal) to match three.js's Y-up convention.
    geo.rotateX(-Math.PI / 2);
    await this.#dtm.writeY(geo);
    geo.computeBoundingSphere();
    geo.computeVertexNormals();
    const map = new three.CanvasTexture(this.#doms.texture);
    map.colorSpace = three.SRGBColorSpace;
    this.#terrain = new three.Mesh(
      geo,
      new three.MeshLambertMaterial({ map, transparent: true }),
    );
    this.#scene.add(this.#terrain);
    this.#cameraController.onUpdateTerrain(mapSize.width, this.#terrainSize);
    console.timeEnd("updateElevations");
  }

  async #updateMarkers(mapSize: GameMapSize): Promise<void> {
    this.#disposeMarkers();
    const signOpacity = this.#doms.signAlpha.valueAsNumber;
    const prefabs = signOpacity > 0 ? this.#filteredPrefabs : [];
    if (prefabs.length === 0 && !this.#markerCoords) return;

    // Same game-meters-per-local-unit ratio that writeY bakes into the mesh,
    // so marker positions and elevations line up with the terrain vertices.
    const scaleFactor = (mapSize.width - 1) / this.#terrainSize.width;

    const glyphPx = this.#doms.signSize.valueAsNumber;
    const fovRad = (this.#cameraController.camera.fov * Math.PI) / 180;
    // World scale s spans s / (2 * tan(fov / 2)) of the viewport height with
    // sizeAttenuation off; the sprite canvas is twice the glyph box.
    const spriteScale = (4 * glyphPx * Math.tan(fovRad / 2)) /
      document.documentElement.clientHeight;

    const meshSizes = await this.#meshSizes;
    const signs = await Promise.all(prefabs.map((prefab) => {
      // Same footprint-centre shift as the 2D sign renderer: decoration
      // positions are the SW corner of the rotated AABB.
      const size = meshSizes[prefab.name];
      const odd = ((prefab.rotation ?? 0) & 1) === 1;
      const halfW = size ? (odd ? size[1] : size[0]) / 2 : 0;
      const halfD = size ? (odd ? size[0] : size[1]) / 2 : 0;
      return this.#placement(
        prefab.x + halfW,
        prefab.z + halfD,
        mapSize,
        scaleFactor,
      );
    }));
    const flag = this.#markerCoords
      ? await this.#placement(
        this.#markerCoords.x,
        this.#markerCoords.z,
        mapSize,
        scaleFactor,
      )
      : null;

    this.#markers = buildMarkerSprites({
      signMarker: await this.#signMarker,
      flagMarker: await this.#flagMarker,
      signs,
      flag,
      spriteScale,
      signOpacity,
    });
    this.#scene.add(this.#markers.object);
  }

  async #placement(
    x: number,
    z: number,
    mapSize: GameMapSize,
    scaleFactor: number,
  ): Promise<MarkerPlacement> {
    const elevation = await this.#sampleGroundGame(x, z, mapSize);
    return {
      x: x / scaleFactor,
      y: elevation / scaleFactor,
      // Game z (north positive) maps to -z in the Y-up terrain space.
      z: -z / scaleFactor,
    };
  }

  // DTM elevation (game meters) at a footprint centre, clamped to the index
  // range since edge prefabs can round one block past it.
  async #sampleGroundGame(
    x: number,
    z: number,
    mapSize: GameMapSize,
  ): Promise<number> {
    const halfW = Math.floor(mapSize.width / 2);
    const halfH = Math.floor(mapSize.height / 2);
    return await this.#dtm.getElevation(gameCoords({
      x: Math.min(Math.max(Math.round(x), -halfW), mapSize.width - 1 - halfW),
      z: Math.min(Math.max(Math.round(z), -halfH), mapSize.height - 1 - halfH),
    })) ?? 0;
  }

  async #updateBoxes(mapSize: GameMapSize): Promise<void> {
    this.#disposeBoxes();
    // Boxes cover every decoration regardless of the prefab filter (which only
    // drives the ✘ signs); the footprint-alpha slider is their on/off switch.
    const footprintAlpha = this.#doms.footprintAlpha.valueAsNumber;
    if (footprintAlpha <= 0 || this.#allPrefabs.length === 0) return;

    const scaleFactor = (mapSize.width - 1) / this.#terrainSize.width;
    const [meshSizes, districtColors, densityScores] = await Promise.all([
      this.#meshSizes,
      this.#districtColors,
      this.#densityScores,
    ]);
    const tileIndex = buildTileIndex(this.#allPrefabs);

    const placements = this.#allPrefabs
      .map((prefab) =>
        this.#boxPlacement(
          prefab,
          meshSizes,
          tileIndex,
          densityScores,
          districtColors,
          scaleFactor,
        )
      )
      .filter((p): p is BoxPlacement => p !== null);
    if (placements.length === 0) return;

    this.#boxes = buildPrefabBoxes(placements, 0.9);
    this.#scene.add(this.#boxes.object);
    this.#hover.setBoxes(this.#boxes);
  }

  #boxPlacement(
    prefab: Prefab,
    meshSizes: PrefabMeshSizes,
    tileIndex: ReturnType<typeof buildTileIndex>,
    densityScores: PrefabDensityScores,
    districtColors: DistrictColors,
    scaleFactor: number,
  ): BoxPlacement | null {
    if (EXCLUDED_NAME_FRAGMENTS.some((frag) => prefab.name.includes(frag))) {
      return null;
    }
    const size = meshSizes[prefab.name];
    if (!size) return null;
    const [sx, sz, sy, yOffset] = size;
    const odd = ((prefab.rotation ?? 0) & 1) === 1;
    const w = odd ? sz : sx;
    const d = odd ? sx : sz;
    const centerGameX = prefab.x + w / 2;
    const centerGameZ = prefab.z + d / 2;

    // Vertical anchor (game meters). yOffset is 0 or negative (blocks buried);
    // decoration y sits ~1 block above the DTM surface (see DECORATION_Y_TO_DTM).
    let bottomGame: number;
    let groundGame: number;
    if (prefab.yIsGroundLevel) {
      groundGame = prefab.y + DECORATION_Y_TO_DTM;
      bottomGame = groundGame + yOffset;
    } else {
      bottomGame = prefab.y + DECORATION_Y_TO_DTM;
      groundGame = bottomGame - yOffset;
    }
    const topGame = bottomGame + sy;

    const [r, g, b] = footprintColorRgb(
      prefab,
      tileIndex,
      densityScores,
      districtColors,
    );
    const color = new three.Color().setRGB(r, g, b, three.SRGBColorSpace);

    return {
      prefab,
      centerX: centerGameX / scaleFactor,
      centerZ: -centerGameZ / scaleFactor,
      width: w / scaleFactor,
      depth: d / scaleFactor,
      bottomY: bottomGame / scaleFactor,
      topY: topGame / scaleFactor,
      groundY: groundGame / scaleFactor,
      color,
    };
  }

  #disposeBoxes(): void {
    this.#hover.setBoxes(null);
    this.#highlightedPlacement = null;
    this.#disposeHighlight();
    if (!this.#boxes) return;
    this.#scene.remove(this.#boxes.object);
    this.#boxes.dispose();
    this.#boxes = null;
  }

  // Mirror the tooltip handler's hovered box as the two-part highlight; the
  // handler owns hit detection, this owns the scene-facing visual.
  #syncHighlight(): void {
    const placement = this.#hover.hoveredPlacement;
    if (placement === this.#highlightedPlacement) return;
    this.#highlightedPlacement = placement;
    this.#disposeHighlight();
    if (!placement) return;
    this.#highlight = buildBoxHighlight(placement);
    this.#scene.add(this.#highlight.object);
  }

  #disposeHighlight(): void {
    if (!this.#highlight) return;
    this.#scene.remove(this.#highlight.object);
    this.#highlight.dispose();
    this.#highlight = null;
  }

  #disposeMarkers(): void {
    if (!this.#markers) return;
    this.#scene.remove(this.#markers.object);
    this.#markers.dispose();
    this.#markers = null;
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
      this.#hover.update();
      this.#syncHighlight();
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
