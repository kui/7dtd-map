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

declare module "serve-static" {
  import type { IncomingMessage, ServerResponse } from "node:http";

  /**
   * Only the options used by tools/ are declared. `fallthrough` is required
   * and `false`: with the default (`true`), `next` is called with no error
   * for 404s, which the `next` type below does not allow.
   */
  interface ServeStaticOptions {
    fallthrough: false;
  }

  /** The error passed to `next`; `statusCode` is the HTTP status to answer with. */
  interface HttpError extends Error {
    statusCode: number;
    /** Headers send wants on the error response, e.g. Content-Range on a 416. */
    headers?: Record<string, string>;
  }

  /**
   * With `fallthrough: false`, `next` is only called with an error; a
   * successful request is answered by the middleware itself.
   */
  function serveStatic(
    root: string,
    options: ServeStaticOptions,
  ): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err: HttpError) => void,
  ) => void;
  export default serveStatic;
}
