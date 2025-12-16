import { LabelHandler } from "../lib/label-handler.ts";
import { Labels } from "../lib/labels.ts";
import { component, printError } from "../lib/utils.ts";

function main() {
  const labelHandler = new LabelHandler(
    { language: component("label_lang", HTMLSelectElement) },
    "../labels",
    navigator.languages,
  );
  const labelHolder = labelHandler.holder;
  labelHandler.addListener(async () => {
    updatePrefabLabels(await labelHolder.get("prefabs"));
    updateBlockLabels(await labelHolder.get("blocks"), await labelHolder.get("shapes"));
  });

  // init
  (async () => {
    updatePrefabLabels(await labelHolder.get("prefabs"));
    updateBlockLabels(await labelHolder.get("blocks"), await labelHolder.get("shapes"));
  })().catch(printError);
}

function updatePrefabLabels(labels: Labels) {
  const name = document.querySelector(".prefab_name")?.textContent.trim();
  if (!name) return;
  const labelEl = document.querySelector(".prefab_label");
  if (!labelEl) return;
  labelEl.textContent = labels.get(name) ?? "-";
}

function updateBlockLabels(blockLabels: Labels, shapeLabels: Labels) {
  for (const blockEl of component("blocks", HTMLElement).querySelectorAll(".block")) {
    const name = blockEl.querySelector(".block_name")?.textContent.trim();
    if (!name) continue;
    const labelEl = blockEl.querySelector(".block_label");
    if (!labelEl) continue;
    labelEl.textContent = blockLabels.get(name) ?? shapeLabels.get(name) ?? "-";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
