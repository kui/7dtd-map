import type { PrefabsFilterInputMessage } from "../worker/types.ts";
import type { LabelHandler } from "./label-handler.ts";
import type { NumberRange } from "../types/utils.ts";

export declare class PrefabsFilterWorker extends Worker {
  postMessage(message: PrefabsFilterInputMessage): void;
}

export interface PrefabsFilterControlsDoms {
  prefabFilter: HTMLInputElement;
  blockFilter: HTMLInputElement;
  minTier: HTMLInputElement;
  maxTier: HTMLInputElement;
  preExcludes: HTMLInputElement[];
}

export function readTierRange(
  doms: Pick<PrefabsFilterControlsDoms, "minTier" | "maxTier">,
): NumberRange {
  return {
    start: doms.minTier.valueAsNumber,
    end: doms.maxTier.valueAsNumber,
  };
}

export function readPreExcludes(
  doms: Pick<PrefabsFilterControlsDoms, "preExcludes">,
): string[] {
  return doms.preExcludes.flatMap((i) => (i.checked ? [i.value] : []));
}

// Wire the controls common to every PrefabsHandler variant: text filters,
// tier range inputs with change-suppression, pre-exclude checkboxes, and
// the language switch. Callers handle the variant-specific concerns
// (initial postMessage, marker/file integration, output dispatch).
export function bindPrefabsFilterControls(
  doms: PrefabsFilterControlsDoms,
  worker: PrefabsFilterWorker,
  labelHandler: LabelHandler,
): void {
  const tierRange = readTierRange(doms);

  doms.prefabFilter.addEventListener("input", () => {
    worker.postMessage({ prefabFilterRegexp: doms.prefabFilter.value });
  });
  doms.blockFilter.addEventListener("input", () => {
    worker.postMessage({ blockFilterRegexp: doms.blockFilter.value });
  });
  doms.minTier.addEventListener("input", () => {
    const v = doms.minTier.valueAsNumber;
    if (v === tierRange.start) return;
    tierRange.start = v;
    worker.postMessage({ difficulty: tierRange });
  });
  doms.maxTier.addEventListener("input", () => {
    const v = doms.maxTier.valueAsNumber;
    if (v === tierRange.end) return;
    tierRange.end = v;
    worker.postMessage({ difficulty: tierRange });
  });
  doms.preExcludes.forEach((e) => {
    e.addEventListener("change", () => {
      worker.postMessage({ preExcludes: readPreExcludes(doms) });
    });
  });
  labelHandler.addListener(({ lang }) => {
    worker.postMessage({ language: lang });
  });
  worker.postMessage({ language: labelHandler.language });
}
