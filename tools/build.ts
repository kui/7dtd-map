import * as esbuild from "esbuild";
import { expandGlob } from "@std/fs/expand-glob";
import { serveDir } from "@std/http/file-server";
import { denoPlugin } from "@deno/esbuild-plugin";

async function* multiExpandGlob(...globs: string[]) {
  for (const glob of globs) {
    yield* expandGlob(glob);
  }
}

const targets = await Array.fromAsync(
  multiExpandGlob(
    "src/*.ts",
    "src/worker/*.ts",
    "src/prefabs/*.ts",
  ),
  (e) => e.path,
);

const outDir = "public";

const commonOpts: esbuild.BuildOptions = {
  plugins: [denoPlugin()],
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

const args = Deno.args;
const envPort = Deno.env.get("PORT");
const envHost = Deno.env.get("HOST");

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
  esbuild.stop();

  const port = envPort ? Number(envPort) : 8000;
  const hostname = envHost ?? "127.0.0.1";
  Deno.serve(
    { port, hostname },
    (req) => serveDir(req, { fsRoot: outDir, quiet: true }),
  );
} else {
  await esbuild.build({
    ...commonOpts,
    ...prodOpts,
  });
  esbuild.stop();
}
