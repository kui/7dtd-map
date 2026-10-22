import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import { pipeline } from "node:stream/promises";

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json",
  ".json": "application/json",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".gz": "application/gzip",
};

type Resolution =
  | { status: 400 | 403 | 404 }
  | { status: 302; location: string }
  | { status: 200; file: string };

/** Maps a request URL to a file under `root`, the way a typical static file server does. */
export async function resolvePath(
  root: string,
  url: string,
): Promise<Resolution> {
  // WHY: only origin-form targets; this also keeps "//host/..." from being parsed as an authority.
  if (!url.startsWith("/")) return { status: 400 };
  let parsed: URL;
  let pathname: string;
  try {
    parsed = new URL(`http://localhost${url}`);
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    return { status: 400 };
  }
  // WHY: an encoded backslash is a separator on Windows only; reject it everywhere so behavior does not depend on the OS.
  if (pathname.includes("\\")) return { status: 403 };
  const file = path.join(root, pathname);
  const rel = path.relative(root, file);
  if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel))
    return { status: 403 };

  const stat = await fs.promises.stat(file).catch(() => null);
  if (stat?.isFile()) return { status: 200, file };
  if (!stat?.isDirectory()) return { status: 404 };
  // WHY: check the encoded form; "/prefabs%2f" decodes to a trailing slash but the browser would still resolve relative URLs against "/".
  if (!parsed.pathname.endsWith("/")) {
    // WHY: a relative "./<last segment>/" redirect cannot be turned into an off-site URL by a crafted path.
    const lastSegment = parsed.pathname.slice(
      parsed.pathname.lastIndexOf("/") + 1,
    );
    // WHY: 302, not 301; browsers cache 301 permanently and the dev tree changes.
    return { status: 302, location: `./${lastSegment}/${parsed.search}` };
  }
  const index = path.join(file, "index.html");
  const indexStat = await fs.promises.stat(index).catch(() => null);
  return indexStat?.isFile() ? { status: 200, file: index } : { status: 404 };
}

export function etagOf(stat: fs.Stats): string {
  return `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
}

export function createStaticServer(root: string): http.Server {
  return http.createServer((req, res) => {
    handle(root, req, res).catch((e: unknown) => {
      console.error(`static-server: ${req.method} ${req.url} failed:`, e);
      if (res.headersSent) res.destroy();
      else res.writeHead(500).end();
    });
  });
}

async function handle(
  root: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" }).end();
    return;
  }
  const resolution = await resolvePath(root, req.url ?? "/");
  if (resolution.status === 302) {
    res.writeHead(302, { location: resolution.location }).end();
    return;
  }
  if (resolution.status !== 200) {
    res.writeHead(resolution.status).end();
    return;
  }

  const { file } = resolution;
  let fh: fs.promises.FileHandle;
  try {
    fh = await fs.promises.open(file);
  } catch (e) {
    console.error(`static-server: cannot open ${file}:`, e);
    res.writeHead(500).end();
    return;
  }
  let streaming = false;
  try {
    // WHY: stat the opened handle, not the path; esbuild may replace the file between resolvePath and open, and a stale size truncates or hangs the body (issue #202).
    const stat = await fh.stat();
    const etag = etagOf(stat);
    const headers = { etag, "cache-control": "no-cache" };
    const ifNoneMatch = req.headers["if-none-match"];
    if (
      ifNoneMatch !== undefined &&
      ifNoneMatch.split(",").some((t) => t.trim() === etag || t.trim() === "*")
    ) {
      res.writeHead(304, headers).end();
      return;
    }
    res.writeHead(200, {
      ...headers,
      "content-type":
        CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
      "content-length": stat.size,
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    const stream = fh.createReadStream();
    streaming = true;
    await pipeline(stream, res).catch((e: unknown) => {
      // WHY: clients may close as soon as they have Content-Length bytes, before "finish"; that is not a server fault.
      if ((e as NodeJS.ErrnoException).code === "ERR_STREAM_PREMATURE_CLOSE")
        return;
      console.error(`static-server: streaming ${file} failed:`, e);
    });
  } finally {
    // WHY: the read stream closes the handle itself (autoClose).
    if (!streaming) await fh.close();
  }
}
