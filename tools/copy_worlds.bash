#!/bin/bash

set -eu

project_root=$(
  cd "$(dirname "$0")/.."
  pwd
)

games_dir=$(npx tsx "${project_root}/tools/print-game-dir.ts")
world_dir="${games_dir}/Data/Worlds"

target_files=(
  biomes.png
  main.ttw
  map_info.xml
  prefabs.xml
  radiation.png
  spawnpoints.xml
  splat3_processed.png
  splat4_processed.png
  dtm.raw
)
exclude_worlds=(
  Empty
  Playtesting
)

main() {
  echo "World Dir: ${world_dir}"

  local w
  for w in "${world_dir}/"*; do
    copy_files "${w}"
  done
}

copy_files() {
  local src=$1
  local name
  name="$(basename "${src}")"
  echo "World: ${name}"
  if should_exclude "${name}"; then
    echo "  Excluded"
    return
  fi

  local dest="${project_root}/docs/worlds/${name}"
  mkdir -vp "${dest}"

  local f
  for f in "${target_files[@]}"; do
    case "${f}" in
      biomes.png)
        copy_biomes "${src}/biomes.png" "${dest}"
        ;;
      dtm.raw)
        copy_dtm "${src}/dtm.raw" "${dest}"
        ;;
      splat3_processed.png)
        copy_splat3 "${src}/splat3_processed.png" "${dest}"
        ;;
      splat4_processed.png)
        copy_splat4 "${src}/splat4_processed.png" "${dest}"
        ;;
      radiation.png)
        copy_radiation "${src}/radiation.png" "${dest}"
        ;;
      *)
        cp -v "${src}/${f}" "${dest}"
        ;;
    esac
  done
}

copy_biomes() {
  local src=$1
  local biome_png="$2/biomes.png"
  set -x
  # Just compress the biomes.png
  time convert "${src}" -quality 95 "${biome_png}"
  set +x
}

copy_dtm() {
  local src=$1
  local dest_dir=$2

  local map_width
  map_width=$(npx tsx "${project_root}/tools/print-map-width.ts" "$(dirname "${src}")/map_info.xml")
  if [[ ! "${map_width}" =~ ^[0-9]+$ ]]; then
    echo "  Invalid map width: ${map_width}"
    return 1
  fi
  echo "  map width: ${map_width}"

  local dtm_png="${dest_dir}/dtm.png"
  set -x
  # dtm.raw is a digital terrain map image.
  # Drop alpha value because this application does not use sub-block height data
  time npx tsx "${project_root}/tools/generate-dtm-png.ts" 0 "${src}" "${map_width}" "${dtm_png}"
  set +x
}

copy_splat3() {
  local src=$1
  local splat3_png="$2/splat3_processed.png"
  set -x
  # splat3_processed.png is a road map image.
  # It should be converted the below rules:
  # - drop alpha channel
  # - black into transparent
  time convert "${src}" \
    -alpha off \
    -transparent black \
    -quality 95 \
    "${splat3_png}"
  set +x
}

copy_splat4() {
  local src=$1
  local splat3_png="$2/splat4_processed.png"
  set -x
  # splat4_processed.png is a water map image.
  # It should be converted the below rules:
  # - drop alpha channel
  # - rbg(0, 255, 0) into blue
  # - rbg(0, 255, 29) into blue
  # - black into transparent
  # These colors are showed using `print-png-pixel-stat.ts`
  time convert "${src}" \
    -alpha off \
    -fill blue -opaque 'rgb(0,255,0)' \
    -fill blue -opaque 'rgb(0,255,29)' \
    -transparent black \
    -quality 95 \
    "${splat3_png}"
  set +x
}

copy_radiation() {
  local src=$1
  local radiation_png="$2/radiation.png"
  set -x
  # radiation.png is a radiation map image.
  # It should be converted the below rules:
  # - drop alpha channel
  # - black into transparent
  time convert "${src}" \
    -alpha off \
    -transparent black \
    -quality 95 \
    "${radiation_png}"
  set +x
}

should_exclude() {
  local name=$1
  local e
  for e in "${exclude_worlds[@]}"; do
    if [[ "${name}" == "${e}" ]]; then
      return 0
    fi
  done
  return 1
}

main
