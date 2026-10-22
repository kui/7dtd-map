/**
 * Type declarations for packages that ship without types. Only the members
 * used by tools/ are declared; extend these when a new API is needed instead
 * of falling back to `any`.
 */

declare module "@web-alchemy/fonttools" {
  /**
   * Runs `pyftsubset` on the given font. Each option maps to a
   * `--<key>=<value>` flag (`true` maps to a bare `--<key>`). The options
   * object is mutated (`output-file` is injected).
   *
   * @returns The subsetted font file contents.
   */
  export function subset(
    inputFontBuffer: Uint8Array,
    options: Record<string, string | true>,
  ): Promise<Uint8Array>;
}

declare module "opentype.js" {
  interface SVGOutputOptions {
    decimalPlaces?: number;
    optimize?: boolean;
    flipY?: boolean;
    flipYBase?: number;
  }

  interface Path {
    /**
     * A number is shorthand for `{ decimalPlaces: n, flipY: false }`.
     */
    toPathData(options?: number | SVGOutputOptions): string;
  }

  interface Font {
    getPath(text: string, x: number, y: number, fontSize: number): Path;
  }

  /**
   * Node loads the CommonJS UMD build, whose `module.exports` is the library
   * object (plus a `default` alias) with no statically detectable named
   * exports, so the API is reachable only through the default import.
   */
  const opentype: {
    parse(
      buffer: ArrayBuffer | Uint8Array,
      opt?: { lowMemory?: boolean },
    ): Font;
  };
  export default opentype;
}
