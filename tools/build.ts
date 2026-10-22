import * as esbuild from "esbuild";
import * as http from "node:http";
import sirv from "sirv";
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
  // WHY: keep the type-check tsconfig (strict, target) from changing the shipped bundles; it is not a source of the build:ts task.
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
} else if (args[0] === "serve-static") {
  // WHY: esbuild's own serve drops response bodies under CI load, giving E2E 0-byte map files (see issue #202). Build once, then serve public/ from a real static server.
  await esbuild.build({ ...commonOpts, ...serveOpts });
  await esbuild.stop();

  const port = envPort ? Number(envPort) : 8000;
  const hostname = envHost ?? "127.0.0.1";
  const serve = sirv(outDir, {
    // WHY: dev mode stats files per request and sends no-store, so a rebuild while a reused server runs never serves stale sizes.
    dev: true,
    setHeaders: (res, pathname) => {
      // WHY: sirv marks *.gz as Content-Encoding: gzip, so the browser would inflate dtm_block.raw.gz before the app's own DecompressionStream does. Serve it as an opaque gzip file, like GitHub Pages.
      if (pathname.endsWith(".gz")) {
        res.setHeader("content-encoding", "identity");
        res.setHeader("content-type", "application/gzip");
      }
    },
  });
  http
    .createServer((req, res) => {
      // WHY: sirv pipes fs.createReadStream() into res without an error listener, so a file that vanishes or is locked after its stat would crash the whole server. Headers are already sent by then, so drop the connection instead.
      res.on("pipe", (src) => {
        src.on("error", (e) => {
          console.error(`serve-static: failed to read ${req.url}:`, e);
          res.destroy();
        });
      });
      serve(req, res);
    })
    .listen(port, hostname, () => {
      console.log(`Serving at http://${hostname}:${port}`);
    });
} else {
  await esbuild.build({
    ...commonOpts,
    ...prodOpts,
  });
  await esbuild.stop();
}
