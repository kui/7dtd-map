"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerrainViewer = void 0;
const three = __importStar(require("three"));
const FontLoader_1 = require("three/examples/jsm/loaders/FontLoader");
const TextGeometry_1 = require("three/examples/jsm/geometries/TextGeometry");
const throttled_invoker_1 = require("../lib/throttled-invoker");
const utils_1 = require("../lib/utils");
const camera_controller_1 = require("./terrain-viewer/camera-controller");
const three_1 = require("three");
const TERRAIN_WIDTH = 2048;
class TerrainViewer {
  constructor(doms) {
    this.terrain = null;
    this.terrainSize = (0, utils_1.threePlaneSize)(1, 1);
    this.animationRequestId = null;
    this.fontLoader = new FontLoader_1.FontLoader();
    this._dtm = null;
    this._mapSize = null;
    this.updateElevations = (0, throttled_invoker_1.throttledInvoker)(() => this.updateElevationsImmediatly());
    this.doms = doms;
    this.texture = new three.CanvasTexture(doms.texture);
    this.renderer = new three.WebGLRenderer({ canvas: doms.output, antialias: false });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.scene = new three.Scene();
    const light = new three.DirectionalLight(0xffffff, 1.2);
    light.position.set(1, 0.25, 1).normalize();
    this.scene.add(light);
    this.scene.add(new three.AmbientLight(0xffffff, 0.2));
    this.cameraController = new camera_controller_1.TerrainViewerCameraController(doms.output, new three.PerspectiveCamera());
    doms.show.addEventListener("click", () => this.show());
    doms.close.addEventListener("click", () => this.close());
    doms.output.addEventListener("keydown", (event) => {
      if (event.code === "Escape") this.close();
    });
    this.updateShowButton();
  }
  get dtm() {
    return this._dtm;
  }
  set dtm(d) {
    this._dtm = d;
    this.updateShowButton();
  }
  get mapSize() {
    return this._mapSize;
  }
  set mapSize(s) {
    this._mapSize = s;
    this.updateShowButton();
  }
  updateShowButton() {
    this.doms.show.disabled = !this.mapSize || this.mapSize.width === 0 || this.mapSize.height === 0 || !this.dtm;
  }
  markCanvasUpdate() {
    this.texture.needsUpdate = true;
  }
  startRender() {
    if (this.animationRequestId) return;
    this.markCanvasUpdate();
    const r = (prevTime, currentTime) => {
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
  updateElevationsImmediatly() {
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
  assignPOISymbol(prefabName) {
    const pfName = prefabName.toLocaleLowerCase();
    const prefabInfo = { text: "", color: "white", sidesColor: "gray" };
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
  updatePOIText(prefabs) {
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
        const geo = new TextGeometry_1.TextGeometry(poiInfo?.text, {
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
        const poleGeo = new three_1.CylinderGeometry(2, 2, randomHeight * 2, 4);
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
  show() {
    const { clientWidth, clientHeight } = document.documentElement;
    this.renderer.setSize(clientWidth, clientHeight);
    this.applyVisibleCss();
    this.cameraController.onResizeCanvas(clientWidth / clientHeight);
    this.doms.output.focus();
    this.startRender();
  }
  applyVisibleCss() {
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
  close() {
    this.doms.output.blur();
    this.doms.output.style.display = "none";
    this.doms.hud.style.display = "none";
    this.doms.close.style.display = "none";
  }
}
exports.TerrainViewer = TerrainViewer;
//# sourceMappingURL=terrain-viewer.js.map
