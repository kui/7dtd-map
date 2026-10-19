import * as esbuild from "esbuild";
import * as path from "node:path";
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
  Bun.serve({
    port,
    hostname,
    async fetch(req) {
      let file = path.join(root, decodeURIComponent(new URL(req.url).pathname));
      if (!file.startsWith(root))
        return new Response("Forbidden", { status: 403 });
      if (file.endsWith(path.sep)) file = path.join(file, "index.html");
      const body = Bun.file(file);
      return (await body.exists())
        ? new Response(body)
        : new Response("Not Found", { status: 404 });
    },
  });
} else {
  await esbuild.build({
    ...commonOpts,
    ...prodOpts,
  });
  await esbuild.stop();
}
