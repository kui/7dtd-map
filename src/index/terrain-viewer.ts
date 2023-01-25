import * as three from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Dtm } from "./dtm-handler";
import { throttledInvoker } from "../lib/throttled-invoker";
import { threePlaneSize } from "../lib/utils";
import { TerrainViewerCameraController } from "./terrain-viewer/camera-controller";
import { CylinderGeometry } from "three";

interface Doms {
  output: HTMLCanvasElement;
  texture: HTMLCanvasElement;
  show: HTMLButtonElement;
  close: HTMLButtonElement;
  hud: HTMLElement;
}

interface POIText {
  text: string;
  color: string;
  sidesColor: string;
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
  private fontLoader: FontLoader = new FontLoader();

  private _dtm: Dtm | null = null;
  private _mapSize: GameMapSize | null = null;

  updateElevations = throttledInvoker(() => this.updateElevationsImmediatly());

  constructor(doms: Doms) {
    this.doms = doms;
    this.texture = new three.CanvasTexture(doms.texture);
    this.renderer = new three.WebGLRenderer({ canvas: doms.output, antialias: false });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.scene = new three.Scene();

    const light = new three.DirectionalLight(0xffffff, 1.2);
    light.position.set(1, 0.25, 1).normalize();
    this.scene.add(light);
    this.scene.add(new three.AmbientLight(0xffffff, 0.2));

    this.cameraController = new TerrainViewerCameraController(doms.output, new three.PerspectiveCamera());

    doms.show.addEventListener("click", () => this.show());
    doms.close.addEventListener("click", () => this.close());
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
      this.animationRequestId = requestAnimationFrame((t) => r(currentTime, t));
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
    const geo = new three.PlaneBufferGeometry(
      this.terrainSize.width,
      this.terrainSize.height,
      this.terrainSize.width - 1,
      this.terrainSize.height - 1
    );
    geo.clearGroups();
    geo.addGroup(0, Infinity, 0);
    geo.addGroup(0, Infinity, 1);
    const materials = [
      new three.MeshLambertMaterial({ map: this.texture, transparent: true }),
      new three.MeshLambertMaterial({ color: new three.Color("lightgray") }),
    ];
    const pos = geo.attributes.position;
    const scaleFactor = this.mapSize.width / (this.terrainSize.width + 1);
    for (let i = 0; i < pos.count; i++) {
      // game axis -> webgl axis
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
    this.terrain = new three.Mesh(geo, materials);
    this.scene.add(this.terrain);
    this.cameraController.onUpdateTerrain(this.mapSize.width, this.terrainSize);
    console.timeEnd("updateElevations");
  }

  assignPOISymbol(prefabName: string) {
    const pfName = prefabName.toLocaleLowerCase();
    const prefabInfo: POIText = { text: "", color: "white", sidesColor: "gray" };

    if (pfName.includes("gas")) {
      prefabInfo.text = "Gas";
      prefabInfo.color = "red";
      prefabInfo.sidesColor = "#910000";
      return prefabInfo;
    } else if (pfName.includes("trader") && !pfName.includes("filler")) {
      prefabInfo.text = "Trader";
      prefabInfo.color = "yellow";
      prefabInfo.sidesColor = "#8B9100";
      return prefabInfo;
    } else if (pfName.includes("survivor")) {
      prefabInfo.text = "Survivor";
      prefabInfo.color = "purple";
      prefabInfo.sidesColor = "#2B0091";
      return prefabInfo;
    } else if (pfName.includes("skyscraper") && !pfName.includes("filler")) {
      prefabInfo.text = "Skyscraper";
      prefabInfo.color = "#8FA5CF";
      prefabInfo.sidesColor = "#58698A";
      return prefabInfo;
    } else if (pfName.includes("hospital") || pfName.includes("clinic") || pfName.includes("pharmacy")) {
      prefabInfo.text = "Medicine";
      prefabInfo.color = "#2671FF";
      prefabInfo.sidesColor = "#1949A5";
      return prefabInfo;
    } else if (pfName.includes("book")) {
      prefabInfo.text = "Book";
      prefabInfo.color = "#44F3FF";
      prefabInfo.sidesColor = "#2DA3AB";
      return prefabInfo;
    }

    return prefabInfo;
  }

  updatePOIText(prefabs: HighlightedPrefab[]) {
    if (!this.dtm || !this.mapSize || this.mapSize.width === 0 || this.mapSize.height === 0) return;

    // this.scene.clear();

    this.terrainSize.width = TERRAIN_WIDTH;
    this.terrainSize.height = Math.floor((TERRAIN_WIDTH / this.mapSize.width) * this.mapSize.height);
    const scaleFactor = this.mapSize.width / (this.terrainSize.width + 1);
    const fontName = "Heebo Medium_Regular.json";

    this.fontLoader.load(fontName, (font) => {
      for (let i = 0; i < prefabs.length; i++) {
        const currentPrefab = prefabs[i];
        const pfNameLower = currentPrefab.name.toLocaleLowerCase();

        if (
          pfNameLower.includes("filler") ||
          pfNameLower.includes("apartment") ||
          (pfNameLower.includes("house") && !pfNameLower.includes("survivor")) ||
          pfNameLower.includes("cabin") ||
          pfNameLower.includes("farm") ||
          pfNameLower.includes("barn") ||
          pfNameLower.includes("part") ||
          pfNameLower.includes("home")
        ) {
          continue;
        }

        const posX = currentPrefab.x / scaleFactor;
        const posZ = currentPrefab.z / scaleFactor;
        const randomHeight = Math.floor(Math.random() * (100 - 50 + 1)) + 50;

        const poiInfo = this.assignPOISymbol(currentPrefab.name);

        const geo = new TextGeometry(poiInfo?.text as string, {
          font: font,
          size: 20,
          height: 2,
          curveSegments: 1,
        });

        const mesh = new three.Mesh(geo, [
          new three.MeshPhongMaterial({ color: poiInfo?.color }),
          new three.MeshPhongMaterial({ color: poiInfo?.sidesColor }),
        ]);

        mesh.position.x = posX;
        mesh.rotation.x = Math.PI / 6;
        mesh.position.z = randomHeight;
        mesh.position.y = posZ;

        this.scene.add(mesh);

        const poleGeo = new CylinderGeometry(2, 2, randomHeight * 2, 4);
        const poleMesh = new three.Mesh(poleGeo, new three.MeshPhongMaterial({ color: poiInfo?.color }));

        poleMesh.position.x = posX;
        poleMesh.rotation.x = Math.PI / 2;
        poleMesh.position.z = 0;
        poleMesh.position.y = posZ;

        if (poiInfo?.color == "white") {
          poleMesh.position.z -= randomHeight;
        }

        this.scene.add(poleMesh);
      }
    });
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
