import * as esbuild from "esbuild";
import * as path from "node:path";
import * as fs from "node:fs";
import * as http from "node:http";
import { globFiles, projectRoot } from "./lib/utils.ts";

const targets = (
  await Promise.all(
    ["src/*.ts", "src/worker/*.ts", "src/prefabs/*.ts"].map((g) =>
      globFiles(projectRoot(), g),
    ),
  )
).flat();

const outDir = "public";

const commonOpts: esbuild.BuildOptions = {
  // WHY: keep the type-check tsconfig (strict, target) from changing the shipped bundles; it is not a wireit input of build:ts.
  tsconfigRaw: {},
  bundle: true,
  sourcemap: true,
  outdir: outDir,
  target: "chrome120",
  platform: "browser",
  entryPoints: targets,
};

const serveOpts: esbuild.BuildOptions = {
  sourcemap: "inline",
};

const prodOpts: esbuild.BuildOptions = {
  minify: true,
  sourcemap: "external",
};

const args = process.argv.slice(2);
const envPort = process.env["PORT"];
const envHost = process.env["HOST"];

if (args[0] === "serve") {
  const ctx = await esbuild.context({
    ...commonOpts,
    ...serveOpts,
  });

  await ctx.watch();

  const { hosts, port } = await ctx.serve({
    servedir: outDir,
    ...(envPort ? { port: Number(envPort) } : {}),
    ...(envHost ? { host: envHost } : {}),
  });

  console.log(`Serving at http://${hosts[0]}:${port}`);

  await new Promise(() => {});
} else if (args[0] === "serve-static") {
  // WHY: esbuild's own serve drops response bodies under CI load, giving E2E 0-byte map files (see issue #202). Build once, then serve public/ from a real static server.
  await esbuild.build({ ...commonOpts, ...serveOpts });
  await esbuild.stop();

  const port = envPort ? Number(envPort) : 8000;
  const hostname = envHost ?? "127.0.0.1";
  const root = path.resolve(outDir);
  http
    .createServer((req, res) => {
      void serveFile(root, req.url ?? "/").then(({ status, file, size }) => {
        if (!file) {
          res.writeHead(status).end();
          return;
        }
        res.writeHead(status, {
          "content-type":
            CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
          "content-length": size,
        });
        fs.createReadStream(file).pipe(res);
      });
    })
    .listen(port, hostname);
} else {
  await esbuild.build({
    ...commonOpts,
    ...prodOpts,
  });
  await esbuild.stop();
}

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

async function serveFile(
  root: string,
  url: string,
): Promise<{ status: number; file?: string; size?: number }> {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return { status: 400 };
  }
  let file = path.join(root, pathname);
  const rel = path.relative(root, file);
  if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel))
    return { status: 403 };
  if (file.endsWith(path.sep)) file = path.join(file, "index.html");
  const stat = await fs.promises.stat(file).catch(() => null);
  return stat?.isFile()
    ? { status: 200, file, size: stat.size }
    : { status: 404 };
}
