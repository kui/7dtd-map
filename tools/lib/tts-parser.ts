import * as fs from 'fs';
import * as path from 'path';
import bunyan from 'bunyan';
import bformat from 'bunyan-format';

const log = bunyan.createLogger({
    name: path.basename(__filename, '.js'),
    stream: bformat({}),
    level: 'info',
    // level: 'debug',
});

// TTS format: https://7daystodie.gamepedia.com/Prefabs#TTS
// But the current version is "13". (The version is "10" in wiki)
// There maight bee some defferences but I didn't know.
// I think there are some changes around block data,
// because block ID limit seems to increase to 32k from 2048
export async function parseTts(ttsFileName: any): Promise<any> {
    const blocks: any = [];
    const dimensions = {};
    let digits: any = [];
    let blockIdsNum: any;
    let skipBytes = 8;
    function handleByte(byte: any) {
        log.debug('16: %s, 10: %s, c: %s', Number(byte).toString(16), byte, String.fromCharCode(byte));
        if (skipBytes !== 0) {
            skipBytes -= 1;
        }
        else if ((dimensions as any).xSecondDigit === undefined) {
            log.debug('pick as a second digit of dimension x: %d', byte);
            (dimensions as any).xSecondDigit = byte;
        }
        else if ((dimensions as any).x === undefined) {
            log.debug('pick as a first digit of dimension x: %d', byte);
            (dimensions as any).x = Buffer.from([(dimensions as any).xSecondDigit, byte]).readInt16LE();
        }
        else if ((dimensions as any).ySecondDigit === undefined) {
            log.debug('pick as a second digit of dimension y: %d', byte);
            (dimensions as any).ySecondDigit = byte;
        }
        else if ((dimensions as any).y === undefined) {
            log.debug('pick as a first digit of dimension y: %d', byte);
            (dimensions as any).y = Buffer.from([(dimensions as any).ySecondDigit, byte]).readInt16LE();
        }
        else if ((dimensions as any).zSecondDigit === undefined) {
            log.debug('pick as a second digit of dimension z: %d', byte);
            (dimensions as any).zSecondDigit = byte;
        }
        else if ((dimensions as any).z === undefined) {
            log.debug('pick as a first digit of dimension z: %d', byte);
            (dimensions as any).z = Buffer.from([(dimensions as any).zSecondDigit, byte]).readInt16LE();
            blockIdsNum = (dimensions as any).x * (dimensions as any).y * (dimensions as any).z;
        }
        else if (digits.length < 3) {
            digits.push(byte);
        }
        else {
            digits.push(byte);
            // Strip the higher bits because it is unneccesary for the current usage
            // eslint-disable-next-line no-bitwise
            const bid = Buffer.from(digits.slice(0, 2)).readInt16LE() & 0b0011111111111111;
            log.debug('pick block ID: %d', bid);
            blocks.push(bid);
            digits = [];
            if (blocks.length === blockIdsNum) {
                log.debug('pick all %d block IDs', blockIdsNum);
                skipBytes = Infinity;
            }
        }
    }
    const stream = fs.createReadStream(ttsFileName);
    return new Promise((resolve, reject) => {
        stream.on('data', (data: any) => data.forEach(handleByte));
        stream.on('close', () => {
            resolve(new Tts({
                maxx: (dimensions as any).x,
                maxy: (dimensions as any).y,
                maxz: (dimensions as any).z,
                blockIds: blocks,
            }));
        });
        stream.on('error', reject);
    });
};
class Tts {
    blockIds: any;
    blockNums: any;
    maxx: any;
    maxy: any;
    maxz: any;
    constructor({ maxx, maxy, maxz, blockIds }: any) {
        this.maxx = maxx;
        this.maxy = maxy;
        this.maxz = maxz;
        this.blockIds = blockIds;
        this.blockNums = countValues(blockIds);
    }
    getBlockId(x: any, y: any, z: any) {
        if (x < 0 || this.maxx < x
            || y < 0 || this.maxy < y
            || z < 0 || this.maxz < z) {
            throw Error(`Out of index range: x=${x}, y=${y}, z=${z}, maxValues=${this.maxx},${this.maxy},${this.maxz}`);
        }
        return this.blockIds[x + this.maxx * y + this.maxx * this.maxy * z];
    }
}
function countValues(arr: any) {
    return arr.reduce((map: any, value: any) => {
        map.set(value, (map.get(value) || 0) + 1);
        return map;
    }, new Map());
}
