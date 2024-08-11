#!/bin/bash

cd "$(dirname "$0")"/..

set -euxo pipefail

TAG=7dtd-map-fonttools

# TODO Add user and group to treat files as the current user
docker build -t $TAG tools/fonts
docker run --rm \
  --mount "type=bind,source=$(pwd),target=/work" \
  --user "$(id -u "$USER"):$(id -g "$USER")" \
  $TAG \
  bash /work/tools/fonts/subset.bash
