#!/bin/bash
# This script is used to run the font subsetter in a Docker container.
# This is useful because the fonttools require many dependencies.
# This may not work on Windows nor macOS because the user's UID and GID cannot be synced with the host.

cd "$(dirname "$0")"

set -euxo pipefail

USER_ID=$(id -u "$USER")
GROUP_ID=$(id -g "$USER")
TAG=7dtd-map-fonttools

docker build --tag $TAG --build-arg USER_ID="$USER_ID" --build-arg GROUP_ID="$GROUP_ID" .
docker run --rm \
  --mount "type=bind,source=$(pwd)/../..,target=/work" \
  --user "$USER_ID:$GROUP_ID" \
  $TAG \
  bash /work/tools/fonts/subset.bash
