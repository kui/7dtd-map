export async function loadPrefabsXmlByUrl(window, url) {
  if (!url) return [];
  const response = await window.fetch(url);
  const xml = await response.text();
  return parse(window, xml);
}

export async function loadPrefabsXmlByFile(window, file) {
  if (!file) return [];
  const xml = await loadAsText(window, file);
  return parse(window, xml);
}

function parse(window, xml) {
  const dom = (new window.DOMParser()).parseFromString(xml, 'text/xml');
  return Array.from(dom.getElementsByTagName('decoration'))
    .map((e) => {
      const position = e.getAttribute('position').split(',');
      return {
        name: e.getAttribute('name'),
        x: parseInt(position[0], 10),
        y: parseInt(position[2], 10),
      };
    });
}

async function loadAsText(window, file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsText(file);
  });
}
