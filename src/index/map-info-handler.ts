import { FileHandler } from "./file-handler";
import * as storage from "../lib/storage";

interface Doms {
  mapInfoShow: HTMLButtonElement;
  mapInfoDialog: HTMLDialogElement;
  mapInfoTable: HTMLTableElement;
}

export class MapInfoHandler {
  #doms: Doms;
  constructor(doms: Doms, fileHandler: FileHandler) {
    this.#doms = doms;

    document.addEventListener("click", (event) => {
      if (event.target === this.#doms.mapInfoDialog)
        this.#doms.mapInfoDialog.close();
    });
    fileHandler.addListener(async ({ update }) => {
      if (update.includes("map_info.xml")) await this.#update();
    });
  }

  async #update() {
    const w = await storage.workspaceDir();
    const mapInfo = await w.get("map_info.xml");
    this.#doms.mapInfoShow.disabled = mapInfo === null;

    const table = this.#doms.mapInfoTable;
    if (mapInfo === null) {
      table.innerHTML = "";
    } else {
      table.innerHTML = ["<tr><th>Name</th><th>Value</th></tr>", ...buildTableContent(await mapInfo.text())].join("\n");
    }
  }
}

function buildTableContent(text: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  return Array.from(doc.querySelectorAll("property")).map((element) => {
    const key = element.getAttribute("name") ?? "-";
    const value = element.getAttribute("value") ?? "-";
    return `<tr><th>${key}</th><td>${value}</td></tr>`;
  });
}
