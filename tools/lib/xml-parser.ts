// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fsPromise'... Remove this comment to see the full error message
const fsPromise = require('fs').promises;
const parseXmlString = require('xml2js').parseString;

module.exports = async function parseXml(xmlFileName: any) {
  const xml = await fsPromise.readFile(xmlFileName);
  return new Promise((resolve, reject) => {
    parseXmlString(xml, (err: any, result: any) => {
      if (err) reject(err);
      if (result) resolve(result);
      reject(Error('Unexpected state'));
    });
  });
};
