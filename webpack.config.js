const path = require('path');
const glob = require('glob');

const entries = glob
  .sync('./js/*.js')
  .reduce((obj, current) => Object.assign(obj, { [path.basename(current)]: current }), {});

module.exports = {
  entry: entries,
  output: {
    filename: '[name]',
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, 'docs'),
  },
};
