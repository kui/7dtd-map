interface Prefab {
  name: string;
  x: number;
  y: number;
}

export async function loadPrefabsXmlByUrl(
  window: Window,
  url: string
): Promise<Prefab[]> {
  if (!url) return [];
  const response = await window.fetch(url);
  return parse(window, await response.text());
}
export async function loadPrefabsXmlByFile(
  window: Window,
  file: File
): Promise<Prefab[]> {
  if (!file) return [];
  return parse(window, await file.text());
}

function parse(window: any, xml: string) {
  const dom = new window.DOMParser().parseFromString(xml, "text/xml");
  return Array.from(dom.getElementsByTagName("decoration")).map((e) => {
    const position = (e as any).getAttribute("position").split(",");
    return {
      name: (e as any).getAttribute("name"),
      x: parseInt(position[0], 10),
      y: parseInt(position[2], 10),
    };
  });
}
