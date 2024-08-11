#!/bin/bash
set -euxo pipefail

cd "$(dirname "$0")"

pyftsubset NotoEmoji-Medium.ttf \
  --output-file=../../public/NotoEmoji.subset.woff2 --flavor=woff2 \
  --text=🚩
pyftsubset NotoSansSymbols2-Regular.ttf \
  --output-file=../../public/NotoSansSymbols2.subset.woff2 --flavor=woff2 \
  --text=✘
