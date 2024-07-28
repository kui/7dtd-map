import { printError, waitAnimationFrame } from "../lib/utils";

type DisablableElement = HTMLInputElement | HTMLSelectElement | HTMLButtonElement;

interface Doms {
  indicator: HTMLElement;
  disableTargets: () => DisablableElement[];
}

const ANIMATION_FRAMES = ["｜", "／", "―", "＼"];
const ANIMATION_INTERVAL_MSEC = 1000;

// Loading progression manager
export class LoadingHandler {
  #doms: Doms;
  #loadingList: string[] = [];
  #disabledElements = new Set<DisablableElement>();

  constructor(doms: Doms) {
    this.#doms = doms;
  }

  add(list: string[] | string): void {
    this.#loadingList = this.#loadingList.concat(list);
    this.startAnimation().catch(printError);
  }

  delete(loading: string): void {
    this.#loadingList = this.#loadingList.filter((s) => s !== loading);
  }

  isLoading(): boolean {
    return this.#loadingList.length !== 0;
  }

  #disable() {
    const elements = this.#doms.disableTargets();
    for (const e of elements) {
      e.disabled = true;
      this.#disabledElements.add(e);
    }
  }

  #enable() {
    for (const e of this.#disabledElements) {
      e.disabled = false;
      this.#disabledElements.delete(e);
    }
  }

  private async startAnimation() {
    this.#disable();
    while (this.#loadingList.length !== 0) {
      this.#doms.indicator.textContent = `${this.bar()} Loading: ${this.#loadingList.join(", ")}`;
      await waitAnimationFrame();
    }
    this.#doms.indicator.textContent = "";
    this.#enable();
  }

  private bar() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return ANIMATION_FRAMES[Math.floor(Date.now() / ANIMATION_INTERVAL_MSEC) % ANIMATION_FRAMES.length]!;
  }
}
