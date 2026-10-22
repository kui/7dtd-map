import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import { pipeline } from "node:stream/promises";

export const CONTENT_TYPES: Record<string, string> = {
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

export type Resolution =
  | { status: 400 | 403 | 404 }
  | { status: 301; location: string }
  | { status: 200; file: string; stat: fs.Stats };

/** Maps a request URL to a file under `root`, the way a typical static file server does. */
export async function resolvePath(
  root: string,
  url: string,
): Promise<Resolution> {
  // WHY: only origin-form targets; this also keeps "//host/..." from being parsed as an authority.
  if (!url.startsWith("/")) return { status: 400 };
  let encodedPathname: string;
  let pathname: string;
  try {
    encodedPathname = new URL(`http://localhost${url}`).pathname;
    pathname = decodeURIComponent(encodedPathname);
  } catch {
    return { status: 400 };
  }
  const file = path.join(root, pathname);
  const rel = path.relative(root, file);
  if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel))
    return { status: 403 };

  const stat = await fs.promises.stat(file).catch(() => null);
  if (stat?.isFile()) return { status: 200, file, stat };
  if (!stat?.isDirectory()) return { status: 404 };
  if (!pathname.endsWith("/")) {
    // WHY: a relative "./<last segment>/" redirect cannot be turned into an off-site URL by a crafted path.
    const lastSegment = encodedPathname.slice(
      encodedPathname.lastIndexOf("/") + 1,
    );
    return { status: 301, location: `./${lastSegment}/` };
  }
  const index = path.join(file, "index.html");
  const indexStat = await fs.promises.stat(index).catch(() => null);
  return indexStat?.isFile()
    ? { status: 200, file: index, stat: indexStat }
    : { status: 404 };
}

export function etagOf(stat: fs.Stats): string {
  return `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
}

export function createStaticServer(root: string): http.Server {
  return http.createServer((req, res) => {
    handle(root, req, res).catch(() => {
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
  if (resolution.status === 301) {
    res.writeHead(301, { location: resolution.location }).end();
    return;
  }
  if (resolution.status !== 200) {
    res.writeHead(resolution.status).end();
    return;
  }

  const { file, stat } = resolution;
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

  let fh: fs.promises.FileHandle;
  try {
    fh = await fs.promises.open(file);
  } catch {
    res.writeHead(500).end();
    return;
  }
  res.writeHead(200, {
    ...headers,
    "content-type":
      CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
    "content-length": stat.size,
  });
  if (req.method === "HEAD") {
    await fh.close();
    res.end();
    return;
  }
  await pipeline(fh.createReadStream(), res).catch(() => {});
}
