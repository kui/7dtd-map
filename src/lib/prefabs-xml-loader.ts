export async function loadPrefabsXmlByUrl(url: string): Promise<Prefab[]> {
  if (!url) return [];
  const response = await fetch(url);
  return parse(await response.text());
}
export async function loadPrefabsXmlByFile(file: File): Promise<Prefab[]> {
  if (!file) return [];
  return parse(await file.text());
}

function parse(xml: string) {
  const dom = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(dom.getElementsByTagName("decoration"))
    .map((e) => {
      const position = e.getAttribute("position")?.split(",");
      if (!position) return null;
      const name = e.getAttribute("name");
      if (!name) return null;
      return {
        name,
        x: parseInt(position[0]),
        z: parseInt(position[2]),
      };
    })
    .filter((p): p is Prefab => p !== null);
}
