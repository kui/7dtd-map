export async function loadWaterInfoXmlByUrl(window, url) {
  if (!url) return [];
  const response = await window.fetch(url);
  const xml = await response.text();
  return parse(window, xml);
}

export async function loadWaterInfoXmlByFile(window, file) {
  if (!file) return [];
  const xml = await loadAsText(window, file);
  return parse(window, xml);
}

function parse(window, xml) {
  const dom = (new window.DOMParser()).parseFromString(xml, 'text/xml');
  return Array.from(dom.getElementsByTagName('Water')).map(e => attrsToObj(e.attributes));
}

function attrsToObj(attrs) {
  return Array.from(attrs).reduce((obj, attr) => {
    if (attr.name === 'pos') {
      const [x, y, z] = attr.value.split(',').map(s => parseInt(s.trim(), 10));
      obj.x = x;
      obj.y = y;
      obj.z = z;
    } else {
      obj[attr.name] = attr.value;
    }
    return obj;
  }, {});
}

async function loadAsText(window, file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsText(file);
  });
}
