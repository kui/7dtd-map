#!/bin/bash

set -eu

USAGE="$(basename $0) <World Dir>"

project_root=$(cd "$(dirname $0)/.."; pwd)
dest="${project_root}/docs/sample_world"

target_files=(
    biomes.png
    dtm.raw
    GenerationInfo.txt
    main.ttw
    map_info.xml
    prefabs.xml
    radiation.png
    spawnpoints.xml
    splat3.png
    splat4_processed.png
    water_info.xml
)

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

    for bname in "${target_files[@]}"
    do
        file="$src/$bname"
        if [[ "$bname" =~ dtm\.raw ]]
        then
            gzip -v --keep --best --stdout "$file" > "$dest/$bname.gz"
        else
            cp -v "$file" "$dest"
        fi
    done
}

main "$@"
