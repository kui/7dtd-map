export async function parseXmlByUrl(window, url) {
  if (!url) return null;
  const response = await window.fetch(url);
  const xml = await response.text();
  return parse(window, xml);
}

export async function parseXmlByFile(window, file) {
  if (!file) return null;
  const xml = await loadAsText(window, file);
  return parse(window, xml);
}

function parse(window, xml) {
  return (new window.DOMParser()).parseFromString(xml, 'text/xml');
}

async function loadAsText(window, file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsText(file);
  });
}
