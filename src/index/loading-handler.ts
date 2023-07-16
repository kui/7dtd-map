import { waitAnimationFrame } from "../lib/utils";

interface Doms {
  indicator: HTMLElement;
  disablings: {
    files: HTMLInputElement;
    select: HTMLSelectElement;
    create: HTMLButtonElement;
    delete: HTMLButtonElement;
    mapName: HTMLInputElement;
  };
}

const ANIMATION_FRAMES = ["｜", "／", "―", "＼"];
const ANIMATION_INTERVAL_MSEC = 1000;

// Loading progression manager
export class LoadingHandler {
  private doms: Doms;
  private _loadingList: string[] = [];

  constructor(doms: Doms) {
    this.doms = doms;
  }

  add(list: string[] | string): void {
    this._loadingList = this._loadingList.concat(list);
    this.startAnimation();
  }

  delete(loading: string): void {
    this._loadingList = this._loadingList.filter((s) => s !== loading);
  }

  private disableAll(isDisable: boolean) {
    Object.values(this.doms.disablings).forEach((e) => (e.disabled = isDisable));
  }

  private async startAnimation() {
    this.disableAll(true);
    while (this._loadingList.length !== 0) {
      this.doms.indicator.textContent = `${this.bar()} Loading: ${this._loadingList.join(", ")}`;
      await waitAnimationFrame();
    }
    this.doms.indicator.textContent = "";
    this.disableAll(false);
  }

  private bar() {
    return ANIMATION_FRAMES[Math.floor(Date.now() / ANIMATION_INTERVAL_MSEC) % ANIMATION_FRAMES.length];
  }
}
