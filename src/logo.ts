import { component, printError } from "./lib/utils";

const FONT_FACE = new FontFace("Noto Sans Symbols 2", "url('./NotoSansSymbols2.subset.woff2') format('woff2')");

function main(): void {
  renderLogo1(component("logo1", HTMLCanvasElement)).catch(printError);
  renderLogo2(component("logo2", HTMLCanvasElement)).catch(printError);
}

const WIDTH = 256; // px

/** Draw by code */
async function renderLogo1(canvas: HTMLCanvasElement): Promise<void> {
  canvas.width = WIDTH;
  canvas.height = WIDTH;

  await FONT_FACE.load();
  document.fonts.add(FONT_FACE);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.font = `${WIDTH.toString()}px '${FONT_FACE.family}'`;
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  putText(ctx, { text: "✘", x: WIDTH / 2, z: WIDTH / 2 + 40, size: WIDTH * 0.6 });
}

function putText(ctx: CanvasRenderingContext2D, { text, x, z, size }: { text: string; x: number; z: number; size: number }): void {
  ctx.lineWidth = Math.round(size * 0.2);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
  ctx.strokeText(text, x, z);

  ctx.lineWidth = Math.round(size * 0.1);
  ctx.strokeStyle = "white";
  ctx.strokeText(text, x, z);

  ctx.fillText(text, x, z);
}

/** Load logo.svg */
async function renderLogo2(canvas: HTMLCanvasElement): Promise<void> {
  canvas.width = WIDTH;
  canvas.height = WIDTH;

  await FONT_FACE.load();
  document.fonts.add(FONT_FACE);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = new Image();
  img.src = "logo.svg";
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });
  ctx.drawImage(img, 0, 0, WIDTH, WIDTH);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
