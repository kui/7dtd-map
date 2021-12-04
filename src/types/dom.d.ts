// Workaround for weird semver of typescript :(
// See https://github.com/microsoft/TypeScript/issues/45745
interface HTMLCanvasElement {
  transferControlToOffscreen(): OffscreenCanvas;
}
type CustomTransferable = ArrayBuffer | MessagePort | ImageBitmap | OffscreenCanvas;
interface Worker {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  postMessage(message: any, transfer: CustomTransferable[]): void;
}
