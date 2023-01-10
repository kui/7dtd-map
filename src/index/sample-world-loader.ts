import { requireNonnull } from "../lib/utils";

const SAMPLE_WORLD_FILES = [
  "biomes.png",
  "splat3_processed.png",
  "splat4_processed.png",
  "radiation.png",
  "prefabs.xml",
  "dtm.png",
  "GenerationInfo.txt",
];

export class SampleWorldLoader {
  private listeners: ((file: File) => Promise<unknown> | unknown)[] = [];

  constructor() {
    for (const button of Array.from(document.querySelectorAll("button[data-sample-dir]"))) {
      console.log("Sample world button: ", button);
      if (button instanceof HTMLButtonElement) button.addEventListener("click", async () => this.loadSampleWorld(button));
    }
  }

  addListenr(fn: (file: File) => Promise<unknown> | unknown): void {
    this.listeners.push(fn);
  }

  private async loadSampleWorld(button: HTMLButtonElement) {
    button.disabled = true;
    const dir = requireNonnull(button.dataset.sampleDir);
    await Promise.all(
      SAMPLE_WORLD_FILES.flatMap(async (name) => {
        const file = await fetchAsFile(`${dir}/${name}`);
        return this.listeners.map((fn) => fn(file));
      })
    );
    button.disabled = false;
  }
}

async function fetchAsFile(uri: string): Promise<File> {
  console.time(`fetchAsFile: ${uri}`);
  const res = await fetch(uri);
  const blob = await res.blob();
  const file = new File([blob], basename(uri), { type: blob.type });
  console.timeEnd(`fetchAsFile: ${uri}`);
  return file;
}

function basename(path: string) {
  return path.substring(path.lastIndexOf("/") + 1);
}
