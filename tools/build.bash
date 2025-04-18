#!/bin/bash

declare -a targets
for ts in src/*.ts src/worker/*.ts src/prefabs/*.ts; do
  [[ "${ts}" =~ .config.ts$ ]] && continue
  targets+=("${ts}")
done
out="public"

esbuild_opts=(
  "--bundle"
  "--sourcemap"
  "--outdir=${out}"
  "--target=chrome120"
  "--platform=browser"
)
serve_opts=(
  "--watch"
  "--servedir=${out}"
)
prod_opts=(
  "--minify"
  "--sourcemap=external"
)

set -eux

if [[ "${1:-}" == serve ]]; then
  npx esbuild "${serve_opts[@]}" "${esbuild_opts[@]}" "${targets[@]}"
else
  npx esbuild "${prod_opts[@]}" "${esbuild_opts[@]}" "${targets[@]}"
fi
