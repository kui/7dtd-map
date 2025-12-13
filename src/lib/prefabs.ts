import * as storage from "./storage";

// Note: This logic can not be moved to a worker because DOM API like `DOMParser` is not available in workers.
export async function loadPrefabsXml(fetchDifficulties?: () => Promise<PrefabDifficulties>): Promise<Prefab[]> {
  const workspace = await storage.workspaceDir();
  const prefabsXml = await workspace.get("prefabs.xml");
  return prefabsXml ? parseXml(await prefabsXml.text(), await fetchDifficulties?.()) : [];
}

function parseXml(xml: string, difficulties: PrefabDifficulties | undefined): Prefab[] {
  const dom = new DOMParser().parseFromString(xml, "text/xml");
  return Array.from(dom.getElementsByTagName("decoration")).flatMap((e) => {
    const position = e.getAttribute("position")?.split(",");
    if (position?.length !== 3) return [];
    const [x, , z] = position;
    if (!x || !z) return [];
    const name = e.getAttribute("name");
    if (!name) return [];
    return {
      name,
      x: parseInt(x),
      z: parseInt(z),
      // TODO Separate these types whether these have a difficulty or not.
      // Like `Prefab` and `PrefabWithDifficulty`.
      difficulty: difficulties?.[name] ?? 0,
    };
  });
}
