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

    set -x

    rm -frv "$dest/*"

    for file in "$src"/*
    do
        bname="$(basename "$file")"
        if [[ "$bname" =~ \.png$ ]]
        then
            convert "$file" \
                    -define png:compression-filter=2 \
                    -define png:compression-level=9 \
                    -define png:compression-strategy=1 \
                    "$dest/$bname"
        elif [[ "$bname" =~ dtm\.raw|splat4_processed\.tga ]]
        then
            gzip -v --keep --best --stdout "$file" > "$dest/$bname.gz"
        else
            cp -v "$file" "$dest"
        fi
    done
}

main "$@"
