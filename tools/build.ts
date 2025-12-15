import * as esbuild from "esbuild";
import { expandGlob } from "jsr:@std/fs@^1.0.8/expand-glob";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.1";

const targets: string[] = [];
for (
  const glob of [
    "src/*.ts",
    "src/worker/*.ts",
    "src/prefabs/*.ts",
  ]
) {
  for await (const file of expandGlob(glob)) {
    if (file.path.endsWith(".config.ts")) continue;
    targets.push(file.path);
  }
}

const outDir = "public";

const commonOpts: esbuild.BuildOptions = {
  plugins: [...denoPlugins()],
  bundle: true,
  sourcemap: true,
  outdir: outDir,
  target: "chrome120",
  platform: "browser",
  entryPoints: targets,
};

const _serveOpts: esbuild.BuildOptions = {
};

const prodOpts = {
  minify: true,
  sourcemap: "external",
};

const args = Deno.args;
if (args[0] === "serve") {
  const ctx = await esbuild.context({
    ...commonOpts,
  });

  await ctx.watch();

  const { host, port } = await ctx.serve({
    servedir: outDir,
  });

  console.log(`Serving at http://${host}:${port}`);

  // Keep alive
  await new Promise(() => {});
} else {
  await esbuild.build({
    ...commonOpts,
    ...prodOpts,
  });
  esbuild.stop();
}
