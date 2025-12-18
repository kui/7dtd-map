import { requireNonnull, requireType } from "../lib/utils.ts";

const STATUS = ["dragover", "processing", "error"] as const;

interface Doms {
  dialog: HTMLDialogElement;
  processingFiles: HTMLUListElement;
}

export class DialogHandler {
  #doms: Doms;
  #radioList: RadioNodeList;

  constructor(doms: Doms) {
    this.#doms = doms;
    this.#radioList = requireType(
      requireNonnull(
        doms.dialog.querySelector("form")?.elements.namedItem("active-section"),
        () => "Unexpected dialog content",
      ),
      RadioNodeList,
    );
  }

  open() {
    this.#doms.dialog.showModal();
  }

  close() {
    this.#doms.dialog.close();
  }

  createProgression(taskNames: string[]): FileProgressionIndicator {
    this.#doms.processingFiles.innerHTML = "";
    const indicator = new FileProgressionIndicator(taskNames);
    this.#doms.processingFiles.append(...indicator.liList);
    return indicator;
  }

  get state() {
    if (STATUS.includes(this.#radioList.value as (typeof STATUS)[number])) {
      return this.#radioList.value as (typeof STATUS)[number];
    } else {
      throw Error(`Unexpected state: ${this.#radioList.value}`);
    }
  }
  set state(state: (typeof STATUS)[number]) {
    this.#radioList.value = state;
  }

  get isOpen() {
    return this.#doms.dialog.open;
  }
}

const TERMINATED_STATES = ["completed", "skipped"] as const;

export class FileProgressionIndicator {
  #liList: HTMLLIElement[] = [];

  constructor(taskNames: string[]) {
    this.#liList = taskNames.map((taskName) => {
      const li = document.createElement("li");
      li.textContent = taskName;
      li.classList.add("processing");
      return li;
    });
  }

  setState(taskName: string, state: (typeof TERMINATED_STATES)[number]) {
    const li = this.#liList.find((li) => li.textContent === taskName);
    if (li) {
      li.classList.replace("processing", state);
      console.log(state, taskName);
    }
    if (this.isAllCompleted) console.log("All completed");
  }

  get isAllCompleted() {
    return this.#liList.every((li) =>
      TERMINATED_STATES.find((state) => li.classList.contains(state))
    );
  }

  get liList() {
    return this.#liList;
  }
}
