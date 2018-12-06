const path = require('path');
const glob = require('glob');

const entries = glob.sync('./js/*.js').reduce((prev, current) => {
  prev[path.basename(current)] = current;
  return prev;
}, {});

module.exports = {
  entry: entries,
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'docs'),
  },
};
