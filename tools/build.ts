import * as esbuild from "esbuild";
import * as http from "node:http";
import serveStatic from "serve-static";
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
  // WHY: no fallthrough, so every failure (404, 400, 403, 500) arrives at the callback as an error with a statusCode.
  const serve = serveStatic(outDir, { fallthrough: false });
  http
    .createServer((req, res) => {
      serve(req, res, (err) => {
        if (err.statusCode >= 500)
          console.error(`serve-static: ${req.url}:`, err);
        // WHY: a read error mid-body cannot change the status any more; drop the connection so the client sees a truncated response, not a short 200.
        if (res.headersSent) {
          res.destroy();
          return;
        }
        // WHY: send sets the file's Content-Length/Type before opening it, so an open failure would otherwise announce the file's size on the error response.
        for (const name of res.getHeaderNames()) res.removeHeader(name);
        res.writeHead(err.statusCode).end();
      });
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
