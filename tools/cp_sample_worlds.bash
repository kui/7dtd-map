#!/bin/bash

set -eu

USAGE="$(basename "$0") <World Dir>"

project_root=$(
  cd "$(dirname "$0")/.."
  pwd
)
dest="${project_root}/docs/sample_world"

copy_files=(
  biomes.png
  main.ttw
  map_info.xml
  prefabs.xml
  radiation.png
  spawnpoints.xml
  splat3_processed.png
  splat4_processed.png
)

if [[ $# -ne 1 ]]; then
  echo "$USAGE"
  exit 1
fi

cd "${project_root}"

src="$1"

echo "Src:  $src"
echo "Dest: $dest"

set -x

rm -frv "${dest:?}/"*

(
  cd "$src"
  cp -v "${copy_files[@]}" "$dest"
)

map_width="$(npx tsx ./tools/print-map-width.ts "$src/map_info.xml")"
if [[ -z "${map_width}" ]]; then
  echo "Empty map width"
  exit 1
fi
echo "MapWidth: ${map_width}"
npx tsx ./tools/generate-dtm-png.ts 6 "$src/dtm.raw" "${map_width}" "$dest/dtm.png"
