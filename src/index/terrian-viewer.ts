import * as three from "three";
import { Dtm } from "./dtm-handler";
import { throttledInvoker } from "../lib/throttled-invoker";

export class TerrainViewer {
  private renderer: three.WebGLRenderer;
  camera: three.PerspectiveCamera;
  private scene: three.Scene;
  private terrain: three.Mesh | null = null;
  private terrainSize: ThreePlaneSize;
  private texture: three.Texture;
  dtm: Dtm | null = null;
  mapSize: GameMapSize | null = null;
  updateElevations = throttledInvoker(() => this.updateElevationsImmediatly());
  render = throttledInvoker(() => this.renderImmediatly());

  constructor(canvas: HTMLCanvasElement, textureCanvas: HTMLCanvasElement, canvasWidth: number, terrainSize: ThreePlaneSize) {
    this.terrainSize = terrainSize;
    this.texture = new three.CanvasTexture(textureCanvas);
    this.renderer = new three.WebGLRenderer({ canvas, antialias: false });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(canvasWidth, canvasWidth);
    this.camera = new three.PerspectiveCamera();
    this.scene = new three.Scene();

    const light = new three.DirectionalLight(0xffffff, 1.2);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.scene.add(new three.AmbientLight(0xffffff, 0.1));
  }

  markCanvasUpdate(): void {
    this.texture.needsUpdate = true;
  }

  renderImmediatly(): void {
    this.renderer.render(this.scene, this.camera);
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
    this.render();
  }
}
