#!/bin/bash
set -euxo pipefail

cd "$(dirname "$0")"

# In 7dtd-map, the latest version of Noto Emoji's 🚩 has visibility issues because it is hollow.
# In the following old Noto Emoji, 🚩 is filled, so it is more visible.
# pyftsubset NotoEmoji-Medium.ttf \
#     --output-file=../../public/NotoEmoji.subset.woff2 --flavor=woff2 \
#     --text=🚩

# This version of NotoEmoji might be the first version of NotoEmoji.
pyftsubset NotoEmojiOld-Regular.ttf \
  --output-file=../../public/NotoEmojiOld.subset.woff2 --flavor=woff2 \
  --text=🚩

pyftsubset NotoSansSymbols2-Regular.ttf \
  --output-file=../../public/NotoSansSymbols2.subset.woff2 --flavor=woff2 \
  --text=✘
