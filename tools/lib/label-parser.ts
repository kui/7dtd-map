/* eslint-env node */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fsPromise'... Remove this comment to see the full error message
const fsPromise = require('fs').promises;
const csvParse = require('csv-parse');
const EN_INDEX = 5;
module.exports = async (localizationFileName: any) => {
    const localization = await fsPromise.readFile(localizationFileName);
    const labelArr = await new Promise((resolve, reject) => {
        csvParse(localization, (err: any, out: any) => { resolve(out); reject(err); });
    });
    return (labelArr as any).reduce((r: any, l: any) => Object.assign(r, { [l[0]]: l[EN_INDEX] }), {});
};
