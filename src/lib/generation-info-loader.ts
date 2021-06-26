export async function loadGenerationInfoByUrl(url: string): Promise<GenerationInfo> {
  const r = await fetch(url);
  return parseGenerationInfo(await r.text());
}
export async function loadGenerationInfoByFile(blob: Blob): Promise<GenerationInfo> {
  console.log(blob.type);
  return parseGenerationInfo(await blob.text());
}

function parseGenerationInfo(data: string): GenerationInfo {
  return data.split(/\r?\n/).reduce<GenerationInfo>((info, line) => {
    const [name, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    switch (name) {
      case "World Name":
        info.worldName = value;
        break;
      case "Original Seed":
        info.originalSeed = value;
        break;
    }
    return info;
  }, {});
}
