#!/bin/bash

set -eu

USAGE="$(basename $0) <World Dir>"

project_root=$(cd "$(dirname $0)/.."; pwd)
dest="${project_root}/docs/sample_world"

main() {
    if [[ $# -ne 1 ]]
    then
        echo $USAGE
        exit 1
    fi

    src="$1"

    echo "Src:  $src"
    echo "Dest: $dest"

    for file in "$src"/*
    do
        if [[ "$file" =~ \.png$ ]]
        then
            copy_compressed_png "$file" "$dest/$(basename "$file")"
        elif [[ "$(basename "$file")" =~ ^dtm\. ]]
        then
            echo "Do nothing because useless and too large for github: $file"
        else
            cp -v "$file" "$dest"
        fi
    done
}

copy_compressed_png() {
    echo "copy and compress:"
    echo "  src:  $1"
    echo "  dest: $2"
    convert "$1" \
            -define png:compression-filter=2 \
            -define png:compression-level=9 \
            -define png:compression-strategy=1 \
            "$2"
}

main "$@"
