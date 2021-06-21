export async function loadPrefabsXmlByUrl(window: any, url: any) {
    if (!url)
        return [];
    const response = await window.fetch(url);
    const xml = await response.text();
    return parse(window, xml);
}
export async function loadPrefabsXmlByFile(window: any, file: any) {
    if (!file)
        return [];
    const xml = await loadAsText(window, file);
    return parse(window, xml);
}
function parse(window: any, xml: any) {
    const dom = (new window.DOMParser()).parseFromString(xml, 'text/xml');
    return Array.from(dom.getElementsByTagName('decoration'))
        .map((e) => {
        const position = (e as any).getAttribute('position').split(',');
        return {
            name: (e as any).getAttribute('name'),
            x: parseInt(position[0], 10),
            y: parseInt(position[2], 10),
        };
    });
}
async function loadAsText(window: any, file: any) {
    return new Promise((resolve, reject) => {
        const reader = new window.FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
        reader.readAsText(file);
    });
}
