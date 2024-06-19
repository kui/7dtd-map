export async function loadPrefabsXmlByUrl(url: string): Promise<Prefab[]> {
  if (!url) return [];
  const response = await fetch(url);
  return parse(await response.text());
}

function parse(xml: string): Prefab[] {
  const dom = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(dom.getElementsByTagName("decoration")).flatMap((e) => {
    const position = e.getAttribute("position")?.split(",");
    if (!position) return [];
    const name = e.getAttribute("name");
    if (!name) return [];
    const [x, , z] = position;
    if (x === undefined || z === undefined) return [];
    return {
      name,
      x: parseInt(x),
      z: parseInt(z),
    };
  });
}
