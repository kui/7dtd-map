import { promises as fs } from 'fs';
import csvParse from 'csv-parse';

const EN_INDEX = 5;

export async function parseLabel(localizationFileName: any) {
    const localization = await fs.readFile(localizationFileName);
    const labelArr = await new Promise((resolve, reject) => {
        csvParse(localization, (err: any, out: any) => { resolve(out); reject(err); });
    });
    return (labelArr as any).reduce((r: any, l: any) => Object.assign(r, { [l[0]]: l[EN_INDEX] }), {});
};
