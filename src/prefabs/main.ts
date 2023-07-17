import { LabelHandler } from "../lib/label-handler";
import { LabelHolder, Labels } from "../lib/labels";
import { component } from "../lib/utils";

function main() {
  const labelHolder = new LabelHolder("../labels", "english");
  const labelHandler = new LabelHandler({ language: component("label_lang", HTMLSelectElement) });
  labelHandler.addListener(async (lang) => {
    labelHolder.language = lang;
    updatePrefabLabels(await labelHolder.prefabs);
    udpateBlockLabels(await labelHolder.blocks);
  });
}

function updatePrefabLabels(labels: Labels) {
  const name = document.querySelector(".prefab_name")?.textContent?.trim();
  if (!name) return;
  const labelEl = document.querySelector(".prefab_label");
  if (!labelEl) return;
  labelEl.textContent = labels.get(name) ?? "-";
}

function udpateBlockLabels(labels: Labels) {
  for (const blockEl of component("blocks", HTMLElement).querySelectorAll(".block")) {
    const name = blockEl.querySelector(".block_name")?.textContent?.trim();
    if (!name) continue;
    const labelEl = blockEl.querySelector(".block_label");
    if (!labelEl) continue;
    labelEl.textContent = labels.get(name) ?? "-";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
