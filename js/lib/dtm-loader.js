export default async function loadDtmRawByFile(window, file) {
  return new Promise((resolve, reject) => {
    const r = new window.FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsArrayBuffer(file);
  });
}
