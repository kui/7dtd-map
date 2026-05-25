import { decode, encode } from "fast-png";

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
    process: processRadiationPng,
  },
  "prefabs.xml": {
    name: "prefabs.xml",
    process: copy,
  },
  "dtm.raw": {
    name: "dtm_block.raw.gz",
    process: (i: ReadableStream<Uint8Array>, o: WritableStream<Uint8Array>) =>
      i.pipeThrough(new DtmRawTransformer()).pipeTo(o),
  },
} as const;

export type WorldFileName = keyof typeof FILE_PROCESS_RULES;
export type MapFileNameMap<T extends keyof typeof FILE_PROCESS_RULES> =
  (typeof FILE_PROCESS_RULES)[T]["name"];
export const MAP_FILE_NAME_MAP = Object.fromEntries(
  Object.entries(FILE_PROCESS_RULES).map(([k, v]) => [k, v.name]),
) as {
  [K in WorldFileName]: MapFileNameMap<K>;
};
export type MapFileName = MapFileNameMap<WorldFileName>;

export class Processor<T extends keyof typeof FILE_PROCESS_RULES> {
  #worldFileName: T;

  constructor(worldFileName: T) {
    this.#worldFileName = worldFileName;
  }

  get mapFileName(): MapFileNameMap<T> {
    return FILE_PROCESS_RULES[this.#worldFileName].name;
  }

  async process(
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>,
  ): Promise<void> {
    await FILE_PROCESS_RULES[this.#worldFileName].process(src, dst);
  }
}

export const WORLD_FILE_NAMES = new Set(Object.keys(FILE_PROCESS_RULES)) as Set<
  keyof typeof FILE_PROCESS_RULES
>;

export function isWorldFileName(
  name: string,
): name is keyof typeof FILE_PROCESS_RULES {
  return WORLD_FILE_NAMES.has(name as keyof typeof FILE_PROCESS_RULES);
}

export const MAP_FILE_NAMES = new Set(
  Object.values(FILE_PROCESS_RULES).map((v) => v.name),
);

export function isMapFileName(
  name: string,
): name is MapFileNameMap<WorldFileName> {
  return MAP_FILE_NAMES.has(
    name as unknown as (typeof FILE_PROCESS_RULES)[
      keyof typeof FILE_PROCESS_RULES
    ]["name"],
  );
}

export function getMapFileName(
  name: WorldFileName,
): MapFileNameMap<WorldFileName> {
  return FILE_PROCESS_RULES[name].name;
}

/**
 * The value file name is preferred to be used instead of the key file name.
 */
export const PREFER_WORLD_FILE_NAMES = {
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
  return n.filter((f) =>
    !n.includes(
      PREFER_WORLD_FILE_NAMES[f as keyof typeof PREFER_WORLD_FILE_NAMES],
    )
  );
}

/**
 * @param name The file name
 * @param files The file names
 * @returns true if the file `name` has the preferred file name in the `files`
 */
export function hasPreferWorldFileNameIn(
  name: string,
  files: string[],
): boolean {
  return name in PREFER_WORLD_FILE_NAMES &&
    files.includes(
      PREFER_WORLD_FILE_NAMES[name as keyof typeof PREFER_WORLD_FILE_NAMES],
    );
}

export function getPreferWorldFileName(name: string): string | undefined {
  return (PREFER_WORLD_FILE_NAMES as Record<string, string>)[name];
}

function copy(
  i: ReadableStream<Uint8Array>,
  o: WritableStream<Uint8Array>,
): Promise<void> {
  return i.pipeTo(o);
}

function repackPng(
  i: ReadableStream<Uint8Array>,
  o: WritableStream<Uint8Array>,
): Promise<void> {
  return i.pipeThrough(new RepackPngTransformer()).pipeTo(o);
}

function processSplat3Png(
  i: ReadableStream<Uint8Array>,
  o: WritableStream<Uint8Array>,
): Promise<void> {
  return i.pipeThrough(new Splat3PngTransformer()).pipeTo(o);
}

function processSplat4Png(
  i: ReadableStream<Uint8Array>,
  o: WritableStream<Uint8Array>,
): Promise<void> {
  return i.pipeThrough(new Splat4PngTransformer()).pipeTo(o);
}

function processRadiationPng(
  i: ReadableStream<Uint8Array>,
  o: WritableStream<Uint8Array>,
): Promise<void> {
  return i.pipeThrough(new RadiationPngTransformer()).pipeTo(o);
}

const DEFAULT_TRANSFORM_STRATEGY = { highWaterMark: 1024 * 1024 };
const DEFAULT_TRANSFORM_STRATEGIES = [
  DEFAULT_TRANSFORM_STRATEGY,
  DEFAULT_TRANSFORM_STRATEGY,
] as const;

class ComposingTransformer<I, M, O> implements TransformStream<I, O> {
  readonly readable: ReadableStream<O>;
  readonly writable: WritableStream<I>;

  constructor(ts1: TransformStream<I, M>, ts2: TransformStream<M, O>) {
    this.writable = ts1.writable;
    ts1.readable.pipeTo(ts2.writable).catch((e: unknown) => {
      console.error("Error piping streams in ComposingTransformer", e);
    });
    this.readable = ts2.readable;
  }
}

/**
 * Pick odd bytes which indicate block height
 * raw[i] Sub-Block Height
 * raw[i + 1] Block Height
 *
 * NOTE: Generics <ArrayBuffer> for Uint8Array are required here.
 * The default Uint8Array allows SharedArrayBuffer, which causes type mismatches
 *  when piping to streams that accept strict BufferSource inputs.
 */
class OddByteTransformer
  extends TransformStream<Uint8Array, Uint8Array<ArrayBuffer>> {
  constructor() {
    let nextOffset = 1;
    super(
      {
        transform(chunk, controller) {
          const buffer = new Uint8Array(
            chunk.length % 2 === 0
              ? chunk.length / 2
              : nextOffset === 1
              ? (chunk.length - 1) / 2
              : (chunk.length + 1) / 2,
          );

          let i = nextOffset;
          for (; i < chunk.length; i += 2) {
            // deno-lint-ignore no-non-null-assertion
            buffer[(i - nextOffset) / 2] = chunk[i]!;
          }

          nextOffset = i - chunk.length;
          controller.enqueue(buffer);
        },
      },
      ...DEFAULT_TRANSFORM_STRATEGIES,
    );
  }
}

class DtmRawTransformer
  extends ComposingTransformer<Uint8Array, BufferSource, Uint8Array> {
  constructor() {
    super(new OddByteTransformer(), new CompressionStream("gzip"));
  }
}

export class DtmBlockRawDecompressor extends DecompressionStream {
  constructor() {
    super("gzip");
  }
}

/**
 * Convert decoded PNG data (Uint8Array, Uint8ClampedArray, or Uint16Array) to 8-bit Uint8Array.
 */
function normalizeToUint8(
  data: Uint8Array | Uint8ClampedArray | Uint16Array,
): Uint8Array {
  if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
    return new Uint8Array(data.buffer, data.byteOffset, data.length);
  }
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    // deno-lint-ignore no-non-null-assertion
    result[i] = data[i]! >> 8;
  }
  return result;
}

/**
 * Decode the whole PNG from accumulated chunks, edit pixels in-place,
 * then re-encode as an 8-bit RGBA PNG with maximum compression.
 */
class PngEditingTransformer extends TransformStream<Uint8Array, Uint8Array> {
  constructor(
    copyAndEdit: (src: Uint8Array, dst: Uint8Array) => void,
  ) {
    const chunks: Uint8Array[] = [];
    super(
      {
        transform(chunk) {
          chunks.push(chunk);
        },
        flush(controller) {
          const total = chunks.reduce((s, c) => s + c.length, 0);
          const buf = new Uint8Array(total);
          let off = 0;
          for (const c of chunks) {
            buf.set(c, off);
            off += c.length;
          }

          const decoded = decode(buf);
          const src = normalizeToUint8(decoded.data);

          // Edit in place
          copyAndEdit(src, src);

          const encoded = encode(
            {
              width: decoded.width,
              height: decoded.height,
              data: src,
              channels: 4,
              depth: 8,
            },
            { zlib: { level: 9 } },
          );
          controller.enqueue(encoded);
        },
      },
      ...DEFAULT_TRANSFORM_STRATEGIES,
    );
  }
}

/**
 * splat3.png should convert the pixels which:
 *   - black to transparent
 *   - other to non-transparent
 */
class Splat3PngTransformer extends PngEditingTransformer {
  constructor() {
    super((src, dst) => {
      for (let i = 0; i < dst.length; i += 4) {
        if (src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0) {
          dst[i] = 0;
          dst[i + 1] = 0;
          dst[i + 2] = 0;
          dst[i + 3] = 0;
        } else {
          // deno-lint-ignore no-non-null-assertion
          dst[i] = src[i]!;
          // deno-lint-ignore no-non-null-assertion
          dst[i + 1] = src[i + 1]!;
          // deno-lint-ignore no-non-null-assertion
          dst[i + 2] = src[i + 2]!;
          dst[i + 3] = 255;
        }
      }
    });
  }
}

/**
 * splat4.png/splat4_processed.png should convert the pixels which:
 *   - Black to 100% transparent
 *   - Non-black to non-transparent
 *   - Green to blue because they are water
 *   - rgb(0, 0, 29) to blue for splat4.png not splat4_processed.png
 *     See https://github.com/kui/7dtd-map/issues/103
 */
class Splat4PngTransformer extends PngEditingTransformer {
  constructor() {
    super((src, dst) => {
      for (let i = 0; i < src.length; i += 4) {
        if (src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0) {
          dst[i] = 0;
          dst[i + 1] = 0;
          dst[i + 2] = 0;
          dst[i + 3] = 0;
        } else if (src[i + 1] === 255 || src[i + 2] === 29) {
          // deno-lint-ignore no-non-null-assertion
          dst[i] = src[i]!;
          // deno-lint-ignore no-non-null-assertion
          dst[i + 1] = src[i + 2]!;
          dst[i + 2] = 255;
          dst[i + 3] = 255;
        } else {
          // deno-lint-ignore no-non-null-assertion
          dst[i] = src[i]!;
          // deno-lint-ignore no-non-null-assertion
          dst[i + 1] = src[i + 1]!;
          // deno-lint-ignore no-non-null-assertion
          dst[i + 2] = src[i + 2]!;
          dst[i + 3] = 255;
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
class RadiationPngTransformer extends PngEditingTransformer {
  constructor() {
    super((src, dst) => {
      for (let i = 0; i < src.length; i += 4) {
        if (src[i] === 0 && src[i + 1] === 0 && src[i + 2] === 0) {
          dst[i] = 0;
          dst[i + 1] = 0;
          dst[i + 2] = 0;
          dst[i + 3] = 0;
        } else {
          // deno-lint-ignore no-non-null-assertion
          dst[i] = src[i]!;
          // deno-lint-ignore no-non-null-assertion
          dst[i + 1] = src[i + 1]!;
          // deno-lint-ignore no-non-null-assertion
          dst[i + 2] = src[i + 2]!;
          dst[i + 3] = 255;
        }
      }
    });
  }
}

/**
 * Just to repack the PNG
 */
class RepackPngTransformer extends PngEditingTransformer {
  constructor() {
    super((src, dst) => {
      for (let i = 0; i < src.length; i++) {
        // deno-lint-ignore no-non-null-assertion
        dst[i] = src[i]!;
      }
    });
  }
}
