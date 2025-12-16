import { component, printError } from "./lib/utils.ts";

const FONT_FACE = new FontFace("Noto Sans Symbols 2", "url('./NotoSansSymbols2.subset.woff2') format('woff2')");

function main(): void {
  renderLogo1(component("logo1", HTMLCanvasElement)).catch(printError);
  renderLogo2(component("logo2", HTMLCanvasElement)).catch(printError);
}

/**
 * Put a mark at center to check if the logo is centered
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const PUT_CENTER: boolean = false;

const WIDTH = 256; // px

/** Draw by code */
async function renderLogo1(canvas: HTMLCanvasElement): Promise<void> {
  canvas.width = WIDTH;
  canvas.height = WIDTH;

  await FONT_FACE.load();
  document.fonts.add(FONT_FACE);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  putText(ctx, { text: "✘", x: WIDTH / 2 + 8, z: WIDTH / 2 + 24, size: 220 });

  if (PUT_CENTER) putPointCenter(ctx, 2, "blue");
}

const LINE_WIDTH_FACTOR = 0.04;

function putText(
  ctx: CanvasRenderingContext2D,
  { text, x, z, size }: { text: string; x: number; z: number; size: number },
): void {
  ctx.font = `${size.toString()}px '${FONT_FACE.family}'`;
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.lineWidth = Math.round(size * LINE_WIDTH_FACTOR * 3);
  ctx.strokeStyle = "black";
  ctx.strokeText(text, x, z);

  ctx.fillText(text, x, z);

  ctx.lineWidth = Math.round(size * LINE_WIDTH_FACTOR);
  ctx.strokeStyle = "white";
  ctx.strokeText(text, x, z);
}

function putPointCenter(ctx: CanvasRenderingContext2D, size: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(WIDTH / 2 - size / 2, WIDTH / 2 - size / 2, size, size);
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

  if (PUT_CENTER) putPointCenter(ctx, 2, "blue");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
