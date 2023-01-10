"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPrefabsXmlByFile = exports.loadPrefabsXmlByUrl = void 0;
async function loadPrefabsXmlByUrl(url) {
  if (!url) return [];
  const response = await fetch(url);
  return parse(await response.text());
}
exports.loadPrefabsXmlByUrl = loadPrefabsXmlByUrl;
async function loadPrefabsXmlByFile(file) {
  if (!file) return [];
  return parse(await file.text());
}
exports.loadPrefabsXmlByFile = loadPrefabsXmlByFile;
function parse(xml) {
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
    .filter((p) => p !== null);
}
//# sourceMappingURL=prefabs-xml-loader.js.map
