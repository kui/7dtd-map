const fsPromise = require('fs').promises;
const parseXmlString = require('xml2js').parseString;

module.exports = async function parseXml(xmlFileName) {
  const xml = await fsPromise.readFile(xmlFileName);
  return new Promise((resolve, reject) => {
    parseXmlString(xml, (err, result) => {
      if (err) reject(err);
      if (result) resolve(result);
      reject(Error('Unexpected state'));
    });
  });
};
