/* eslint-env node */
import { promises as fs } from 'fs';
import * as path from 'path';
import glob from 'glob-promise';
import { parseNim } from './lib/nim-parser';
import { parseLabel } from './lib/label-parser';
import { parseTts } from './lib/tts-parser';

const projectRoot = path.join(path.dirname(process.argv[1]), '..');
const localJsonFile = path.join(projectRoot, 'local.json');
const blockPrefabIndexFile = 'docs/block-prefab-index.json';
const prefabBlockIndexFile = 'docs/prefab-block-index.json';
const blockLabelsFile = 'docs/block-labels.json';
const excludedBlocks = new Set([
    'air',
    'terrainFiller',
]);

async function main() {
    const { vanillaDir } = JSON.parse((await fs.readFile(localJsonFile)).toString());
    const fileGlob = path.join(vanillaDir, 'Data', 'Prefabs', '*.blocks.nim');
    const nimFiles = await glob(fileGlob);
    if (nimFiles.length === 0) {
        throw Error(`No nim file: ${fileGlob}`);
    }
    const waitTasks = [];
    const prefabs = await readNim(nimFiles);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    console.log('Load %d prefabs', Object.keys(prefabs).length);
    waitTasks.push(writeJsonFile(prefabBlockIndexFile, prefabs));
    const blocks = invertIndex(prefabs);
    console.log('Load %d blocks', Object.keys(blocks).length);
    waitTasks.push(writeJsonFile(blockPrefabIndexFile, blocks));
    waitTasks.push((async () => {
        const labels = await readLabels(vanillaDir, Object.keys(blocks));
        console.log('Load %d block labels', Object.keys(labels).length);
        writeJsonFile(blockLabelsFile, labels);
    })());
    await Promise.all(waitTasks);
    return 0;
}
async function writeJsonFile(file: any, json: any) {
    await fs.writeFile(path.join(projectRoot, file), JSON.stringify(json));
    console.log('Write %s', file);
}
async function readLabels(vanillaDir: any, blocks: any) {
    const fileName = path.join(vanillaDir, 'Data', 'Config', 'Localization.txt');
    const labels = await parseLabel(fileName);
    return blocks.reduce((result: any, block: any) => {
        const label = labels[block];
        if (label) {
            return Object.assign(result, { [block]: labels[block] });
        }
        return result;
    }, {});
}
async function readNim(nimFiles: any) {
    const parsedNimFiles = await Promise.all(nimFiles.map(async (nimFileName: any) => {
        const prefabName = path.basename(nimFileName, '.blocks.nim');
        const ttsFileName = path.join(path.dirname(nimFileName), `${prefabName}.tts`);
        let blocks;
        let blockNums: any;
        try {
            [blocks, { blockNums }] = await Promise.all([
                parseNim(nimFileName),
                parseTts(ttsFileName),
            ]);
        }
        catch (e) {
            console.warn(e);
            return {};
        }
        return {
            name: prefabName,
            blocks: blocks
                .filter((b: any) => !excludedBlocks.has(b.name))
                .map((b: any) => ({
                name: b.name,
                count: blockNums.get(b.id) || 0
            })),
        };
    }));
    return parsedNimFiles.reduce((obj, prefab) => {
        if ((prefab as any).name) {
            return Object.assign(obj, { [(prefab as any).name]: (prefab as any).blocks });
        }
        return obj;
    }, {});
}
function invertIndex(prefabs: any) {
    return Object
        .entries(prefabs)
        .reduce((arr, [name, blocks]) => {
        const flatten = (blocks as any).map((block: any) => ({
            prefab: name,
            block
        }));
        return arr.concat(flatten);
    }, [])
        .reduce((obj: any, { prefab, block }) => Object.assign(obj, {
        [(block as any).name]: (obj[(block as any).name] || []).concat({ name: prefab, count: (block as any).count }),
    }), {});
}
main()
.catch((e) => {
    console.error(e);
    return 1;
  }).then((exitCode) => {
    process.on('exit', () => process.exit(exitCode));
  });
