import * as esbuild from "esbuild";
import { expandGlob } from "@std/fs/expand-glob";
import { denoPlugin } from "@deno/esbuild-plugin";

async function* multiExmapndGlob(...globs: string[]) {
  for (const glob of globs) {
    yield* expandGlob(glob);
  }
}

const targets = await Array.fromAsync(
  multiExmapndGlob(
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
if (args[0] === "serve") {
  const ctx = await esbuild.context({
    ...commonOpts,
    ...serveOpts,
  });

  await ctx.watch();

  const { hosts, port } = await ctx.serve({
    servedir: outDir,
  });

  console.log(`Serving at http://${hosts[0]}:${port}`);

  // Keep alive
  await new Promise(() => {});
} else {
  await esbuild.build({
    ...commonOpts,
    ...prodOpts,
  });
  esbuild.stop();
}
