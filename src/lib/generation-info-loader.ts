export async function loadGenerationInfoByUrl(url: string): Promise<GenerationInfo> {
  const r = await fetch(url);
  return parseGenerationInfo(await r.text());
}
export async function loadGenerationInfoByFile(blob: Blob): Promise<GenerationInfo> {
  return parseGenerationInfo(await blob.text());
}

function parseGenerationInfo(data: string): GenerationInfo {
  const entries = data.split(/\r?\n/).reduce<GenerationInfoEntry[]>((prev, line) => {
    const [name, ...rest] = line.split(":");
    if (name.length === 0) return prev;
    const value = rest.join(":").trim();
    prev.push([name, value]);
    return prev;
  }, []);
  return new GenerationInfo(entries);
}

type GenerationInfoEntry = [string, string];

export class GenerationInfo {
  entries: readonly GenerationInfoEntry[];

  constructor(entries: GenerationInfoEntry[]) {
    this.entries = Object.freeze(entries);
  }

  get(name: string): string | undefined {
    return this.entries.find((e) => e[0] === name)?.[1];
  }

  get worldName(): string | undefined {
    return this.get("World Name");
  }

  outputFormat(): string {
    return this.entries.map((e) => e.join(": ")).join("\n");
  }
}
