import type * as pngjs from "pngjs";

/**
 * pngjs needs to be set depending on the environment.
 *
 * Set "pngjs" module if in the Node.js.
 * Set "pngjs/browser" module if in the browser.
 */
let PNG: typeof pngjs.PNG;
export function setPNG(png: typeof pngjs.PNG): void {
  PNG = png;
}

/**
 * the `name` is the file name to be stored.
 * the `process` is the function to process the file.
 *
 * the name is optional, if not provided, the original file name will be used.
 */
const FILE_PROCESS_RULES = {
  "map_info.xml": {
    name: "map_info.xml",
    process: copy,
  },
  "biomes.png": {
    name: "biomes.png",
    process: repackPng,
  },
  "splat3.png": {
    name: "splat3.png",
    process: processSplat3Png,
  },
  "splat3_processed.png": {
    name: "splat3.png",
    process: processSplat3Png,
  },
  "splat4.png": {
    name: "splat4.png",
    process: processSplat4Png,
  },
  "splat4_processed.png": {
    name: "splat4.png",
    process: processSplat4Png,
  },
  "radiation.png": {
    name: "radiation.png",
    process: (i: ReadableStream<Uint8Array>, o: WritableStream<Uint8Array>) => i.pipeThrough(new RadiationPngTransformer()).pipeTo(o),
  },
  "prefabs.xml": {
    name: "prefabs.xml",
    process: copy,
  },
  "dtm.raw": {
    name: "dtm_block.raw.gz",
    process: (i: ReadableStream<Uint8Array>, o: WritableStream<Uint8Array>) => i.pipeThrough(new DtmRawTransformer()).pipeTo(o),
  },
} as const;

export type WorldFileName = keyof typeof FILE_PROCESS_RULES;
export type MapFileNameMap<T extends keyof typeof FILE_PROCESS_RULES> = (typeof FILE_PROCESS_RULES)[T]["name"];
export const MAP_FILE_NAME_MAP = Object.fromEntries(Object.entries(FILE_PROCESS_RULES).map(([k, v]) => [k, v.name])) as {
  [K in WorldFileName]: MapFileNameMap<K>;
};
export type MapFileName = MapFileNameMap<WorldFileName>;

export class MapFileProcessor<T extends keyof typeof FILE_PROCESS_RULES> {
  #worldFileName: T;

  constructor(worldFileName: T) {
    this.#worldFileName = worldFileName;
  }

  get mapFileName(): MapFileNameMap<T> {
    return FILE_PROCESS_RULES[this.#worldFileName].name;
  }

  async process(src: ReadableStream<Uint8Array>, dst: WritableStream<Uint8Array>): Promise<void> {
    await FILE_PROCESS_RULES[this.#worldFileName].process(src, dst);
  }
}

export const WORLD_FILE_NAMES = new Set(Object.keys(FILE_PROCESS_RULES)) as Set<keyof typeof FILE_PROCESS_RULES>;

export function isWorldFileName(name: string): name is keyof typeof FILE_PROCESS_RULES {
  return WORLD_FILE_NAMES.has(name as keyof typeof FILE_PROCESS_RULES);
}

export const MAP_FILE_NAMES = new Set(Object.values(FILE_PROCESS_RULES).map((v) => v.name));

export function isMapFileName(name: string): name is MapFileNameMap<WorldFileName> {
  return MAP_FILE_NAMES.has(name as unknown as (typeof FILE_PROCESS_RULES)[keyof typeof FILE_PROCESS_RULES]["name"]);
}

export function getMapFileName(name: WorldFileName): MapFileNameMap<WorldFileName> {
  return FILE_PROCESS_RULES[name].name;
}

/**
 * The value file name is preferred to be used instead of the key file name.
 */
const PREFER_WORLD_FILE_NAMES = {
  "splat3.png": "splat3_processed.png",
  "splat4.png": "splat4_processed.png",
} as const;

/**
 * Filter the file names which are not in the `FILE_PROCESS_RULES`.
 * And filter the file names which are preferred to be used.
 * @param names The file names to be filtered
 * @returns The filtered file names
 */
export function filterWorldFileNames(names: string[]): WorldFileName[] {
  const n = names.filter(isWorldFileName);
  return n.filter((f) => !n.includes(PREFER_WORLD_FILE_NAMES[f as keyof typeof PREFER_WORLD_FILE_NAMES]));
}

/**
 * @param name The file name
 * @param files The file names
 * @returns true if the file `name` has the preferred file name in the `files`
 */
export function hasPreferWorldFileNameIn(name: string, files: string[]): name is keyof typeof PREFER_WORLD_FILE_NAMES {
  return name in PREFER_WORLD_FILE_NAMES && files.includes(PREFER_WORLD_FILE_NAMES[name as keyof typeof PREFER_WORLD_FILE_NAMES]);
}

export function getPreferWorldFileName(
  name: keyof typeof PREFER_WORLD_FILE_NAMES,
): (typeof PREFER_WORLD_FILE_NAMES)[keyof typeof PREFER_WORLD_FILE_NAMES] {
  return PREFER_WORLD_FILE_NAMES[name];
}

function copy(i: ReadableStream<Uint8Array>, o: WritableStream<Uint8Array>): Promise<void> {
  return i.pipeTo(o);
}

function repackPng(i: ReadableStream<Uint8Array>, o: WritableStream<Uint8Array>): Promise<void> {
  return i.pipeThrough(new RepackPngTransformer()).pipeTo(o);
}

function processSplat3Png(i: ReadableStream<Uint8Array>, o: WritableStream<Uint8Array>): Promise<void> {
  return i.pipeThrough(new Splat3PngTransformer()).pipeTo(o);
}

function processSplat4Png(i: ReadableStream<Uint8Array>, o: WritableStream<Uint8Array>): Promise<void> {
  return i.pipeThrough(new Splat4PngTransformer()).pipeTo(o);
}

const DEFAULT_TRASNFORM_STRATEGY = { highWaterMark: 1024 * 1024 };
const DEFAULT_TRASNFORM_STRATEGIES = [DEFAULT_TRASNFORM_STRATEGY, DEFAULT_TRASNFORM_STRATEGY] as const;

class ComposingTransformer {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  constructor(transformStreams: TransformStream<Uint8Array, Uint8Array>[]) {
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>({}, ...DEFAULT_TRASNFORM_STRATEGIES);
    this.readable = transformStreams.reduce((r, t) => r.pipeThrough(t), readable);
    this.writable = writable;
  }
}

/**
 * Pick odd bytes which indicate block height
 * raw[i] Sub-Block Height
 * raw[i + 1] Block Height
 */
class OddByteTransformer extends TransformStream<Uint8Array, Uint8Array> {
  constructor() {
    let nextOffset = 1;
    super(
      {
        transform(chunk, controller) {
          const buffer = new Uint8Array(
            chunk.length % 2 === 0 ? chunk.length / 2 : nextOffset === 1 ? (chunk.length - 1) / 2 : (chunk.length + 1) / 2,
          );

          let i = nextOffset;
          for (; i < chunk.length; i += 2) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            buffer[(i - nextOffset) / 2] = chunk[i]!;
          }

          nextOffset = i - chunk.length;
          controller.enqueue(buffer);
        },
      },
      ...DEFAULT_TRASNFORM_STRATEGIES,
    );
  }
}

class DtmRawTransformer extends ComposingTransformer {
  constructor() {
    super([new OddByteTransformer(), new CompressionStream("gzip")]);
  }
}

export class DtmBlockRawDecompressor extends DecompressionStream implements TransformStream<Uint8Array, Uint8Array> {
  constructor() {
    super("gzip");
  }
}

class PngEditingTransfomer extends TransformStream<Uint8Array, Uint8Array> {
  constructor(edit: (png: pngjs.PNG) => void) {
    const png = new PNG({ deflateLevel: 9, deflateStrategy: 0 });
    const { promise: flushPromise, resolve, reject }: PromiseWithResolvers<void> = Promise.withResolvers();
    super(
      {
        start(controller) {
          png.on("parsed", () => {
            edit(png);
            png
              .pack()
              .on("data", (chunk) => {
                controller.enqueue(chunk as Uint8Array);
              })
              .on("error", reject)
              .on("end", resolve);
          });
        },
        transform(chunk) {
          png.write(chunk);
        },
        flush() {
          return flushPromise;
        },
      },
      ...DEFAULT_TRASNFORM_STRATEGIES,
    );
  }
}

/**
 * splat3.png should convert the pixels which:
 *   - black to transparent
 *   - other to non-transparent
 */
class Splat3PngTransformer extends PngEditingTransfomer {
  constructor() {
    super((png) => {
      for (let i = 0; i < png.data.length; i += 4) {
        if (png.data[i] === 0 && png.data[i + 1] === 0 && png.data[i + 2] === 0) {
          png.data[i + 3] = 0;
        } else {
          png.data[i + 3] = 255;
        }
      }
    });
  }
}

/**
 * splat4.png should convert the pixels which:
 *   - black to 100% transparent
 *   - other to non-transparent
 *   - green to blue because they are water
 */
class Splat4PngTransformer extends PngEditingTransfomer {
  constructor() {
    super((png) => {
      for (let i = 0; i < png.data.length; i += 4) {
        if (png.data[i] === 0 && png.data[i + 1] === 0 && png.data[i + 2] === 0) {
          png.data[i + 3] = 0;
        } else if (png.data[i + 1] === 255) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const green = png.data[i + 1]!;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          png.data[i + 1] = png.data[i + 2]!;
          png.data[i + 2] = green;
          png.data[i + 3] = 255;
        } else {
          png.data[i + 3] = 255;
        }
      }
    });
  }
}

/**
 * radiation.png should convert the pixels which:
 *   - black to 100% transparent
 *   - other to non-transparent
 */
class RadiationPngTransformer extends PngEditingTransfomer {
  constructor() {
    super((png) => {
      for (let i = 0; i < png.data.length; i += 4) {
        if (png.data[i] === 0 && png.data[i + 1] === 0 && png.data[i + 2] === 0) {
          png.data[i + 3] = 0;
        } else {
          png.data[i + 3] = 255;
        }
      }
    });
  }
}

/**
 * Just to repack the PNG
 */
class RepackPngTransformer extends PngEditingTransfomer {
  constructor() {
    super(() => {
      // Do nothing
    });
  }
}
